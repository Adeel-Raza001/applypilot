import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpsertResumeDto } from './dto/upsert-resume.dto';
import { ResumeService } from './resume.service';

@UseGuards(JwtAuthGuard)
@Controller('resume')
export class ResumeController {
  constructor(private resume: ResumeService) {}

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
}