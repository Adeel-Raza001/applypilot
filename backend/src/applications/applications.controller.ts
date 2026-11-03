import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

type AuthReq = { user: { sub: number } };

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private applications: ApplicationsService) {}

  @Get()
  list(@Req() req: AuthReq) {
    return this.applications.list(req.user.sub);
  }

  @Post()
  create(@Req() req: AuthReq, @Body() dto: CreateApplicationDto) {
    return this.applications.create(req.user.sub, dto);
  }

  @Get(':id')
  findOne(@Req() req: AuthReq, @Param('id', ParseIntPipe) id: number) {
    return this.applications.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthReq,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applications.update(req.user.sub, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: AuthReq,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.applications.updateStatus(req.user.sub, id, dto.status);
  }

  @Delete(':id')
  remove(@Req() req: AuthReq, @Param('id', ParseIntPipe) id: number) {
    return this.applications.remove(req.user.sub, id);
  }
}