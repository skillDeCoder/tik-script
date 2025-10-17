import { forwardRef, Module } from '@nestjs/common';
import { TiktokAutomationService } from './tiktok-automation.service';
import { TiktokAutomationController } from './tiktok-automation.controller';
import { AudioTranscriptionModule } from 'src/audio-transcription/audio-transcription.module';
import { TgBotModule } from 'src/tg-bot/tg-bot.module';

@Module({
  imports: [AudioTranscriptionModule, forwardRef(() => TgBotModule)],
  providers: [TiktokAutomationService],
  controllers: [TiktokAutomationController],
  exports: [TiktokAutomationService],
})
export class TiktokAutomationModule {}
