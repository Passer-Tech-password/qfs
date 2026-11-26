
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import {
  cloudinary,
  uploadImage,
  MAX_UPLOAD_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/cloudinary/server";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

function validateImage(file: FormDataEntryValue | null, required: boolean) {
  if (!file || !(file instanceof File)) {
    if (required) throw new Error("Please upload the front of your ID.");
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPG and PNG documents are accepted.");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Each document must not exceed 5MB.");
  }

  return file;
}

export async function POST(request: NextRequest) {
  let uploadedAssets: string[] = [];

  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { auth, db } = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(token);

    const formData = await request.formData();

    const idType = String(formData.get("idType") ?? "").trim();
    const idNumber = String(formData.get("idNumber") ?? "").trim();
    const confirmed = formData.get("confirmed") === "true";

    if (!idType || !idNumber) {
      return NextResponse.json(
        { error: "ID type and ID number are required." },
        { status: 400 }
      );
    }

    if (!confirmed) {
      return NextResponse.json(
        { error: "Please confirm your identity information." },
        { status: 400 }
      );
    }

    const frontFile = validateImage(formData.get("frontFile"), true)!;
    const backFile = validateImage(formData.get("backFile"), false);

    const front = await uploadImage(frontFile, {
      folder: `users/${decoded.uid}/kyc`,
      type: "authenticated",
    });

    uploadedAssets.push(front.public_id);

    let back = null;

    if (backFile) {
      back = await uploadImage(backFile, {
        folder: `users/${decoded.uid}/kyc`,
        type: "authenticated",
      });

      uploadedAssets.push(back.public_id);
    }

    const record = await db
      .collection("users")
      .doc(decoded.uid)
      .collection("kyc")
      .add({
        idType,
        idNumber,
        frontDocument: {
          publicId: front.public_id,
          format: front.format,
          resourceType: "image",
          deliveryType: "authenticated",
        },
        backDocument: back
          ? {
              publicId: back.public_id,
              format: back.format,
              resourceType: "image",
              deliveryType: "authenticated",
            }
          : null,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      success: true,
      requestId: record.id,
      message: "Your KYC documents have been submitted successfully.",
    });

  } catch (error) {
    console.error("KYC submission error:", error);

    // Clean up uploaded documents if the submission fails.
    if (uploadedAssets.length) {
      await Promise.allSettled(
        uploadedAssets.map((publicId) =>
          cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            type: "authenticated",
          })
        )
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "KYC submission failed.",
      },
      { status: 400 }
    );
  }
}
