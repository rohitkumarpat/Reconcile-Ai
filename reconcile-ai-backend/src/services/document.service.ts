import streamifier from "streamifier";
import cloudinary from "../lib/cloudinary";
import { prisma } from "../lib/prisma";
import { DocumentType } from "@prisma/client";

function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "reconcile-ai",
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function createDocument(
  userId: string,
  file: Express.Multer.File,
  fileType: DocumentType
) {
  const fileUrl = await uploadToCloudinary(file.buffer);

  return prisma.financialDocument.create({
    data: {
      userId,
      fileUrl,
      fileName: file.originalname,
      fileType,
      status: "UPLOADED",
    },
  });
}

export async function listDocuments(userId: string) {
  return prisma.financialDocument.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}