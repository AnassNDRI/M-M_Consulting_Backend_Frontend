import { Module } from '@nestjs/common';
import { JobtitleController } from './jobtitle.controller';
import { JobtitleService } from './jobtitle.service';

@Module({
  controllers: [JobtitleController],
  providers: [JobtitleService]
})
export class JobtitleModule {}
