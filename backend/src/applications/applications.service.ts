import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  list(userId: number) {
    return this.prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  create(userId: number, dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: { ...dto, userId },
    });
  }

  async findOne(userId: number, id: number) {
    const app = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!app) {
      throw new NotFoundException('Application not found');
    }
    return app;
  }

  async update(userId: number, id: number, dto: UpdateApplicationDto) {
    await this.findOne(userId, id);
    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  async updateStatus(userId: number, id: number, status: ApplicationStatus) {
    await this.findOne(userId, id);
    return this.prisma.application.update({
      where: { id },
      data: { status },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    await this.prisma.application.delete({ where: { id } });
    return { deleted: true };
  }
}