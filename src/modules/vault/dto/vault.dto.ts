import { IsNotEmpty, IsString, IsObject, IsOptional } from "class-validator";

export class CreateVaultEntryDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateVaultCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
