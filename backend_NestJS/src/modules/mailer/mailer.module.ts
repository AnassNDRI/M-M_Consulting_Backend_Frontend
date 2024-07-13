import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { Global } from '@nestjs/common/decorators/modules/global.decorator';



@Global()
@Module({
  providers: [MailerService],
  exports : [MailerService],
 
})
export class MailerModule {}
