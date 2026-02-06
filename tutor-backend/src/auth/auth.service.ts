import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, comparePassword } from './password.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async register(data: any) {
    const passwordHash = await hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: data.role ?? 'STUDENT',
      },
    });

    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async oauthLogin(email: string, name: string, provider: string) {
    // Find or create user for OAuth login
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a new user for OAuth - use a random password hash since they won't use it
      const randomHash = await hashPassword(Math.random().toString(36));
      user = await this.prisma.user.create({
        data: {
          fullName: name || email.split('@')[0],
          email,
          passwordHash: randomHash,
          role: 'STUDENT',
        },
      });
    }

    return this.generateToken(user);
  }

  generateToken(user: any) {
    return {
      access_token: this.jwt.sign({
        sub: user.id,
        role: user.role,
      }),
    };
  }
}
