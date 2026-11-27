
import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { Resend } from "resend";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY ||
        !process.env.EMAIL_FROM ||
        !process.env.APP_URL) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const { idToken } = await request.json();

    if (typeof idToken !== "string" || !idToken) {
      return NextResponse.json(
        { error: "Authentication token is required." },
        { status: 400 }
      );
    }

    const { auth, db } = getFirebaseAdmin();

    const decoded = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decoded.uid);

    if (!user.email) {
      return NextResponse.json(
        { error: "No email address is associated with this account." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified." });
    }

    const profile = await db.collection("users").doc(user.uid).get();

    const firstName =
      profile.data()?.firstName || user.displayName?.split(" ")[0] || "User";

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const verificationUrl = new URL(
      "/api/auth/verify-email",
      process.env.APP_URL
    );

    verificationUrl.searchParams.set("token", token);

    const tokenRef = db
      .collection("emailVerificationTokens")
      .doc(tokenHash);

    await tokenRef.set({
      uid: user.uid,
      email: user.email.toLowerCase(),
      expiresAt: Timestamp.fromMillis(expiresAt),
      createdAt: Timestamp.now(),
    });

    const safeName = escapeHtml(firstName);
    const safeEmail = escapeHtml(user.email);

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [user.email],
      subject: "Verify Your Email Address - Qfstier-4bwallet",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:30px 12px;background:#080d1c;font-family:Arial,sans-serif;color:#ffffff;">
          <div style="max-width:620px;margin:auto;background:#101a30;border:1px solid #263858;border-radius:14px;overflow:hidden;">
            <div style="padding:30px 24px;text-align:center;background:#101a30;">
              <h1 style="color:#40d9ee;letter-spacing:3px;font-size:25px;">
                QFSTIER-4BWALLET
              </h1>
              <p style="color:#a5b4cc;letter-spacing:4px;font-size:12px;">
                EMAIL VERIFICATION
              </p>
            </div>

            <div style="padding:28px 25px;">
              <h2 style="font-size:23px;">Welcome to Qfstier-4bwallet!</h2>

              <p>Hi ${safeName},</p>

              <p style="color:#cbd5e1;line-height:1.8;">
                Thank you for creating an account. To complete your activation
                and secure your cryptographic vault, please verify your email
                address below:
              </p>

              <div style="padding:16px;background:#182641;border-radius:9px;margin:22px 0;">
                <strong>Account Security Check: Email:</strong>
                <p style="color:#40d9ee;margin-bottom:0;">${safeEmail}</p>
              </div>

              <p style="color:#cbd5e1;line-height:1.7;">
                This link will expire in 24 hours. If the button doesn't work,
                copy and paste this link into your browser:
              </p>

              <p style="word-break:break-all;font-size:12px;color:#40d9ee;">
                ${verificationUrl.toString()}
              </p>

              <div style="text-align:center;margin:30px 0;">
                <a href="${verificationUrl.toString()}"
                   style="display:inline-block;background:#06c9df;color:#07111f;text-decoration:none;padding:15px 30px;border-radius:8px;font-weight:bold;">
                  Verify Email Address
                </a>
              </div>

              <p style="color:#a5b4cc;font-size:13px;line-height:1.7;">
                If you didn't request this action or need immediate assistance,
                please reach out to our 24/7 support desk at
                <a href="mailto:support@cyber-lancer.fyi" style="color:#40d9ee;">
                  support@cyber-lancer.fyi
                </a>.
              </p>
            </div>

            <div style="padding:24px;text-align:center;background:#0b1426;border-top:1px solid #263858;">
              <strong style="color:#40d9ee;">Qfstier-4bwallet</strong>
              <p style="color:#a5b4cc;font-size:12px;line-height:1.7;">
                Quantum Cryptographic Asset Management &amp; Institutional Banking System<br/>
                End-to-End 256-Bit Cryptographic Security
              </p>
              <p style="color:#8290a8;font-size:11px;">
                Account Sign In &nbsp; Security Settings &nbsp; Contact Support
              </p>
              <p style="color:#8290a8;font-size:11px;">
                © 2026 Qfstier-4bwallet. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      await tokenRef.delete();
      console.error("Resend delivery error:", error);

      return NextResponse.json(
        { error: "We couldn't send your verification email. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully.",
    });

  } catch (error) {
    console.error("Verification email error:", error);

    return NextResponse.json(
      { error: "Unable to send verification email." },
      { status: 500 }
    );
  }
}
