import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertResumeDto } from './dto/upsert-resume.dto';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async get(userId: number) {
    const resume = await this.prisma.resume.findUnique({ where: { userId } });
    return { content: resume?.content ?? '' };
  }

  async upsert(userId: number, dto: UpsertResumeDto) {
    const resume = await this.prisma.resume.upsert({
      where: { userId },
      update: { content: dto.content },
      create: { userId, content: dto.content },
    });
    return { content: resume.content, updatedAt: resume.updatedAt };
  }
}