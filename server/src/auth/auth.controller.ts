import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SIGNMESSAGES } from 'src/contants';
import { SignatureGuard } from 'src/guards/signature.guard';
import LoginDTO from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService) {}

  @UseGuards(new SignatureGuard(SIGNMESSAGES.LOGIN))
  @Post('login')
  async login(@Body() body: LoginDTO) {
    const res = await this.authService.login(body);
    return res;
  }
}
