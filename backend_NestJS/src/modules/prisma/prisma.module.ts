import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { PrismaService } from './prisma.service';


@Global()
@Module({
  providers: [PrismaService],
  exports : [PrismaService] // le rendre visible aux autres modules
})
export class PrismaModule {}
