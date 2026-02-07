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
      const passwordHash = await hashPassword(Math.random().toString(36));
      console.log(`Creating new OAuth user: ${email} (${name}) with provider ${provider}`);
      user = await this.prisma.user.create({
        data: {
          fullName: name || email.split('@')[0],
          email,
          passwordHash,
          role: 'STUDENT',
        },
      });
      console.log(`User created successfully with ID: ${user.id}`);
    }

    return this.generateToken(user);
  }

  async updateRole(userId: string, role: string) {
    const validRoles = ['STUDENT', 'TUTOR', 'ADMIN'];
    const formattedRole = role.toUpperCase();

    if (!validRoles.includes(formattedRole)) {
      throw new Error('Invalid role');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: formattedRole as any },
    });
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateToken(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  generateToken(user: any) {
    const payload = {
      sub: user.id,
      role: user.role,
    };
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      }
    };
  }
}
