import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RateLimit } from '../common/rate-limit.guard.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { DeleteAccountDto } from './dto/delete-account.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

type AuthReq = { user: { sub: number } };

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @RateLimit(10)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @RateLimit(10)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthReq) {
    return this.auth.me(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: AuthReq, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @RateLimit(10)
  @Post('change-password')
  changePassword(@Req() req: AuthReq, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @RateLimit(10)
  @Delete('account')
  deleteAccount(@Req() req: AuthReq, @Body() dto: DeleteAccountDto) {
    return this.auth.deleteAccount(req.user.sub, dto);
  }
}