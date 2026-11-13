import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { DeleteAccountDto } from './dto/delete-account.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email, name: dto.name, passwordHash },
    });
    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildResponse(user);
  }

  async me(userId: number) {
    const user = await this.getUserOrFail(userId);
    return { id: user.id, email: user.email, name: user.name };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.getUserOrFail(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name.trim() },
    });
    return { id: user.id, email: user.email, name: user.name };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.getUserOrFail(userId);
    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) {
      // 400, 401 nahi: frontend 401 par logout kar deta hai
      throw new BadRequestException('Current password is incorrect');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current one',
      );
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true };
  }

  async deleteAccount(userId: number, dto: DeleteAccountDto) {
    const user = await this.getUserOrFail(userId);
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new BadRequestException('Password is incorrect');
    }
    // Resume aur applications cascade se khud delete ho jati hain
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
  }

  private async getUserOrFail(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  private async buildResponse(user: {
    id: number;
    email: string;
    name: string;
  }) {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}