import { createUploadthing, type FileRouter } from "uploadthing/next";
import { verifyTeacher } from "@/lib/rbac";
import { NextResponse } from "next/server";

const f = createUploadthing();

export const ourFileRouter = {
  materialUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 2 },
    text: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    // 🔐 Protect uploads — teachers only
    .middleware(async ({ req }) => {
      const teacherCheck = await verifyTeacher(req);

      if (teacherCheck instanceof NextResponse) {
        throw new Error("Unauthorized");
      }

      return { userId: teacherCheck.sub };
    })

    // 📦 After upload finishes
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        name: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
