import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PrismaService } from "../../config/prisma.config";
import { DocumentsService } from "./documents.service";
import { CreateDocumentDto } from "./dto/create-document.dto";

@Controller("documents")
export class DocumentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDocumentDto,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException("File is required");
    return this.documentsService.uploadDocument(req.user.id, file, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.prisma.document.findMany({
      where: { ownerId: req.user.id, deletedAt: null },
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: any) {
    const doc = await this.prisma.document.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException("Document not found");
    return doc;
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("file"))
  async update(
    @Param("id") id: string,
    @Body() dto: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if ((!dto || Object.keys(dto).length === 0) && !file) {
      throw new BadRequestException("Update data or file cannot be empty");
    }

    try {
      return await this.documentsService.updateDocument(
        req.user.id,
        id,
        dto,
        file,
      );
    } catch (error: any) {
      if (error.message === "Document not found") {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: any) {
    const doc = await this.prisma.document.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException("Document not found");

    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  @Get(":id/access")
  async getAccess(@Param("id") id: string, @Req() req: any) {
    const doc = await this.prisma.document.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException("Document not found");

    return this.prisma.documentAccess.findMany({
      where: { documentId: id },
      include: { user: true },
    });
  }

  @Post(":id/share")
  async share(
    @Param("id") id: string,
    @Body("userId") userId: string,
    @Req() req: any,
  ) {
    if (!userId) {
      throw new BadRequestException("userId is required in the body");
    }

    // Check if document exists and belongs to user
    const doc = await this.prisma.document.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException("Document not found");

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException("Target user not found");

    // Prevent sharing with oneself
    if (userId === req.user.id) {
      throw new BadRequestException(
        "You cannot share a document with yourself",
      );
    }

    // Check if access already exists
    const existingAccess = await this.prisma.documentAccess.findFirst({
      where: { documentId: id, userId },
    });
    if (existingAccess) return existingAccess;

    return this.prisma.documentAccess.create({
      data: { documentId: id, userId },
    });
  }

  // Versioning
  @Post(":id/version")
  @UseInterceptors(FileInterceptor("file"))
  async createVersion(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException("File is required for versioning");

    // Verify document exists
    const doc = await this.prisma.document.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException("Document not found");

    // Upload new version to Cloudinary
    const result = await this.documentsService["cloudinary"].uploadFile(file);

    // Get the latest version number
    const latestVersion = await this.prisma.documentVersion.findFirst({
      where: { documentId: id },
      orderBy: { versionNum: "desc" },
    });
    const nextVersionNum = latestVersion ? latestVersion.versionNum + 1 : 1;

    return this.prisma.documentVersion.create({
      data: {
        documentId: id,
        fileKey: result.public_id,
        fileUrl: result.publicUrl,
        versionNum: nextVersionNum,
      },
    });
  }

  @Get(":id/versions")
  async getVersions(@Param("id") id: string) {
    return this.prisma.documentVersion.findMany({ where: { documentId: id } });
  }

  @Get("versions/:versionId")
  async getVersion(@Param("versionId") id: string) {
    return this.prisma.documentVersion.findUnique({ where: { id } });
  }

  @Delete("versions/:versionId")
  async deleteVersion(@Param("versionId") id: string) {
    await this.prisma.documentVersion.delete({ where: { id } });
    return { success: true };
  }
}
