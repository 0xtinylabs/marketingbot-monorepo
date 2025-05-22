import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { DBservice } from 'src/db/db.service';

@Module({
  controllers: [TokenController],
  providers: [TokenService, DBservice],
})
export class TokenModule {}
