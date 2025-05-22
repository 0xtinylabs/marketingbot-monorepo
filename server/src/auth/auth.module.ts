import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DBservice } from 'src/db/db.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DBservice],
})
export class AuthModule {}
