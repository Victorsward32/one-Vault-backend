import { IsNotEmpty, IsString, IsEmail, IsOptional } from "class-validator";

export class CreateEmergencyProfileDto {
  @IsOptional()
  rules?: Record<string, any>;

  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;
}

export class CreateEmergencyContactDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  relation: string;
}
