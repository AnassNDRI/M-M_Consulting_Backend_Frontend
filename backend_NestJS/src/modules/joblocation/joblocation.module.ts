import { Module } from '@nestjs/common';
import { JoblocationService } from './joblocation.service';
import { JoblocationController } from './joblocation.controller';

@Module({
  providers: [JoblocationService],
  controllers: [JoblocationController]
})
export class JoblocationModule {}
