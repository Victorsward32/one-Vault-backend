import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { CreateVaultEntryDto } from "./dto/vault.dto";

@Controller("vault")
export class VaultController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreateVaultEntryDto, @Req() req: any) {
    // Validate categoryId exists
    const category = await this.prisma.vaultCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID "${dto.categoryId}" does not exist. Please create the category first.`,
      );
    }

    return this.prisma.vaultEntry.create({
      data: { ...dto, ownerId: req.user.id },
      include: { category: true },
    });
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.prisma.vaultEntry.findMany({
      where: { ownerId: req.user.id, deletedAt: null },
      include: { category: true },
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: any) {
    const entry = await this.prisma.vaultEntry.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException("Vault entry not found");
    return entry;
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: any, @Req() req: any) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException("Update data (body) cannot be empty");
    }

    const entry = await this.prisma.vaultEntry.findFirst({
      where: { id, ownerId: req.user.id },
    });
    if (!entry) throw new NotFoundException("Vault entry not found");

    try {
      return await this.prisma.vaultEntry.update({
        where: { id },
        data: dto,
      });
    } catch (error: any) {
      if (error.code === "P2003") {
        throw new BadRequestException("Invalid categoryId or related record");
      }
      throw error;
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: any) {
    const entry = await this.prisma.vaultEntry.findFirst({
      where: { id, ownerId: req.user.id },
    });
    if (!entry) throw new NotFoundException("Vault entry not found");

    await this.prisma.vaultEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
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

    // Check if entry exists and belongs to user
    const entry = await this.prisma.vaultEntry.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException("Vault entry not found");

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new NotFoundException("Target user not found");

    // Prevent sharing with oneself
    if (userId === req.user.id) {
      throw new BadRequestException("You cannot share an entry with yourself");
    }

    // Check if access already exists
    const existingAccess = await this.prisma.vaultAccess.findFirst({
      where: { vaultEntryId: id, userId },
    });
    if (existingAccess) return existingAccess;

    return this.prisma.vaultAccess.create({
      data: { vaultEntryId: id, userId },
    });
  }

  @Get(":id/access")
  async getAccess(@Param("id") id: string, @Req() req: any) {
    const entry = await this.prisma.vaultEntry.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException("Vault entry not found");

    return this.prisma.vaultAccess.findMany({
      where: { vaultEntryId: id },
      include: { user: true },
    });
  }

  @Delete(":id/access/:userId")
  async revokeAccess(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Req() req: any,
  ) {
    const entry = await this.prisma.vaultEntry.findFirst({
      where: { id, ownerId: req.user.id, deletedAt: null },
    });
    if (!entry) throw new NotFoundException("Vault entry not found");

    await this.prisma.vaultAccess.deleteMany({
      where: { vaultEntryId: id, userId },
    });
    return { success: true };
  }
}
