import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RateLimit } from '../common/rate-limit.guard.js';
import { AiService } from './ai.service.js';

type AuthReq = { user: { sub: number } };

@UseGuards(JwtAuthGuard)
@RateLimit(8)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('analyze/:applicationId')
  analyze(
    @Req() req: AuthReq,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    return this.ai.analyze(req.user.sub, applicationId);
  }

  @Post('cover-letter/:applicationId')
  coverLetter(
    @Req() req: AuthReq,
    @Param('applicationId', ParseIntPipe) applicationId: number,
  ) {
    return this.ai.coverLetter(req.user.sub, applicationId);
  }
}