import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ResumeExtractService } from './resume-extract.service.js';
import { ResumeController } from './resume.controller.js';
import { ResumeService } from './resume.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ResumeController],
  providers: [ResumeService, ResumeExtractService],
})
export class ResumeModule {}