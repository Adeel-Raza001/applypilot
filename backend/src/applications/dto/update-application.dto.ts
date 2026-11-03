import { ApplicationStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20000)
  jobDescription?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}