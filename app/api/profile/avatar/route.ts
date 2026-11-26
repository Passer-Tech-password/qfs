
import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { uploadImage, MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/cloudinary/server";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a profile picture." },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG and PNG images are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "Image must not exceed 5MB." },
        { status: 400 }
      );
    }

    const result = await uploadImage(file, {
      folder: `users/${decoded.uid}/profile`,
      type: "upload",
    });

    await auth.updateUser(decoded.uid, {
      photoURL: result.secure_url,
    });

    await db.collection("users").doc(decoded.uid).set(
      {
        photoURL: result.secure_url,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      photoURL: result.secure_url,
    });

  } catch (error) {
    console.error("Profile image upload error:", error);

    return NextResponse.json(
      { error: "Unable to upload profile picture. Please try again." },
      { status: 500 }
    );
  }
}
