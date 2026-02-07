import { Controller, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  @Post('register')
  register(@Body() body: any) {
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.auth.login(body.email, body.password);
  }

  @Post('oauth')
  oauth(@Body() body: { email: string; name: string; provider: string }) {
    return this.auth.oauthLogin(body.email, body.name, body.provider);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('role')
  updateRole(@Req() req, @Body('role') role: string) {
    return this.auth.updateRole(req.user.sub, role);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.auth.refreshToken(refreshToken);
  }
}
