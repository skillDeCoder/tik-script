import { forwardRef, Module } from '@nestjs/common';
import { TgBotService } from './tg-bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/database/schemas/account.schema';
import { TiktokAutomationModule } from 'src/tiktok-automation/tiktok-automation.module';
import { RestartService } from './restart-script.service';
import { AudioTranscriptionModule } from 'src/audio-transcription/audio-transcription.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    forwardRef(() => TiktokAutomationModule),
    AudioTranscriptionModule,
  ],
  providers: [TgBotService, RestartService],
  exports: [TgBotService, RestartService],
})
export class TgBotModule {}
