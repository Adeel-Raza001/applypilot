import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UpsertResumeDto } from './dto/upsert-resume.dto.js';
import {
  ResumeExtractService,
  UploadedResume,
} from './resume-extract.service.js';
import { ResumeService } from './resume.service.js';

@UseGuards(JwtAuthGuard)
@Controller('resume')
export class ResumeController {
  constructor(
    private resume: ResumeService,
    private extractor: ResumeExtractService,
  ) {}

  @Get()
  get(@Req() req: { user: { sub: number } }) {
    return this.resume.get(req.user.sub);
  }

  @Put()
  upsert(
    @Req() req: { user: { sub: number } },
    @Body() dto: UpsertResumeDto,
  ) {
    return this.resume.upsert(req.user.sub, dto);
  }

  // File se text nikaalta hai, database mein save NAHI karta
  @Post('extract')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 4 * 1024 * 1024 } }),
  )
  extract(@UploadedFile() file: UploadedResume | undefined) {
    return this.extractor.extract(file);
  }
}