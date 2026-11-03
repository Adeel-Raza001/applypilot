import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertResumeDto {
  @IsString()
  @MinLength(20)
  @MaxLength(20000)
  content: string;
}