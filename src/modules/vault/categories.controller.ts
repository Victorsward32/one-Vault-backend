import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../config/prisma.config";
import { CreateVaultCategoryDto } from "./dto/vault.dto";

@Controller("vault-categories")
export class VaultCategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreateVaultCategoryDto) {
    const existing = await this.prisma.vaultCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      return existing; // Return existing if it already exists (Idempotent behavior)
    }
    return this.prisma.vaultCategory.create({ data: dto });
  }

  @Get()
  async findAll() {
    return this.prisma.vaultCategory.findMany();
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: any) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException("Update data (body) cannot be empty");
    }

    const exists = await this.prisma.vaultCategory.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException("Vault category not found");

    return this.prisma.vaultCategory.update({ where: { id }, data: dto });
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    const exists = await this.prisma.vaultCategory.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException("Vault category not found");

    await this.prisma.vaultCategory.delete({ where: { id } });
    return { success: true };
  }
}
