import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Email already in use');

    const existingUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existingUsername) throw new ConflictException('Username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username.toLowerCase(),
        displayName: dto.displayName || dto.username,
        passwordHash,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.displayName || user.username,
    );

    return {
      message: 'Revisa tu email para verificar la cuenta',
      email: dto.email,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.username);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, refreshToken: __, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de verificación inválido');
    }

    if (!user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
      throw new BadRequestException('El token de verificación ha expirado');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.username);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const updatedUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    const { passwordHash: _, refreshToken: __, ...safeUser } = updatedUser!;

    return { user: safeUser, ...tokens };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // No revelar si el email existe o no
      return { message: 'Email reenviado' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('La cuenta ya está verificada');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.displayName || user.username,
    );

    return { message: 'Email reenviado' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Por seguridad, devolvemos el mismo mensaje independientemente de si el usuario existe
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiry: resetExpiry,
        },
      });

      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.displayName || user.username,
      );
    }

    return { message: 'Si el email existe, recibirás un enlace' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de recuperación inválido');
    }

    if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      throw new BadRequestException('El token de recuperación ha expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async googleAuth(googleUser: { googleId: string; email: string; displayName: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findUnique({ where: { googleId: googleUser.googleId } });

    if (!user) {
      const existing = await this.prisma.user.findUnique({ where: { email: googleUser.email } });
      if (existing) {
        user = await this.prisma.user.update({
          where: { id: existing.id },
          data: { googleId: googleUser.googleId, emailVerified: true },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            googleId: googleUser.googleId,
            displayName: googleUser.displayName,
            avatarUrl: googleUser.avatarUrl,
            emailVerified: true,
          },
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.username ?? '');
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { ...tokens, needsUsername: !user.username, isOnboarded: user.isOnboarded };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user.id, user.email, user.username);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(userId: string, email: string, username: string) {
    const payload = { sub: userId, email, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET || this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: token },
    });
  }
}
