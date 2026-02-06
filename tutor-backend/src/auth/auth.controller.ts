import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}
