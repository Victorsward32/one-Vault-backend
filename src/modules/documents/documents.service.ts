import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { CloudinaryProvider } from "../../shared/providers/cloudinary/cloudinary.provider";
import { CreateDocumentDto } from "./dto/create-document.dto";

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryProvider,
  ) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    dto: CreateDocumentDto,
  ) {
    // 1. Upload to Cloudinary
    const result = await this.cloudinary.uploadFile(file);

    // 2. Save Metadata to DB
    return this.prisma.document.create({
      data: {
        ownerId: userId,
        title: dto.title,
        description: dto.description,
        fileKey: result.public_id,
        fileUrl: result.publicUrl,
        fileType: result.format,
        fileSize: result.bytes,
      },
    });
  }

  async updateDocument(
    userId: string,
    documentId: string,
    dto: any,
    file?: Express.Multer.File,
  ) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, ownerId: userId, deletedAt: null },
    });
    if (!doc) throw new Error("Document not found");

    let updateData: any = { ...dto };

    if (file) {
      // 1. Upload new file
      const result = await this.cloudinary.uploadFile(file);

      // 2. Delete old file from Cloudinary (optional, but good for cleanup)
      if (doc.fileKey) {
        await this.cloudinary.deleteFile(doc.fileKey).catch(() => {});
      }

      // 3. Update file details
      updateData = {
        ...updateData,
        fileKey: result.public_id,
        fileUrl: result.publicUrl,
        fileType: result.format,
        fileSize: result.bytes,
      };
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });
  }

  async deleteDocument(userId: string, documentId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, ownerId: userId },
    });
    if (!doc) throw new Error("Document not found");

    // Soft delete in DB
    await this.prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    // Optionally delete from Cloudinary or keep for version history
    await this.cloudinary.deleteFile(doc.fileKey);

    return { success: true };
  }
}
