import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  learningMaterialUploader: f({
    pdf: { maxFileSize: "16MB" },
    image: { maxFileSize: "8MB" },
    video: { maxFileSize: "256MB" },
  })
    .middleware(async ({ req }) => {
      return { userId: "teacher" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { fileUrl: file.url }; // this becomes `meta.fileUrl` on the client
    }),
} satisfies FileRouter;
