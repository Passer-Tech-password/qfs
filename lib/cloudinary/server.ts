
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
];

export async function uploadImage(
  file: File,
  options: {
    folder: string;
    type?: "upload" | "authenticated";
  },
) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
        type: options.type ?? "upload",
        allowed_formats: ["jpg", "jpeg", "png"],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}
