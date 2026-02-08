import { IsNotEmpty, IsString, IsOptional, IsNumber } from "class-validator";

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
