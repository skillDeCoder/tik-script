import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TiktokAutomationModule } from './tiktok-automation/tiktok-automation.module';
import { AudioTranscriptionService } from './audio-transcription/audio-transcription.service';
import { AudioTranscriptionModule } from './audio-transcription/audio-transcription.module';
import { TgBotModule } from './tg-bot/tg-bot.module';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TiktokAutomationModule,
    AudioTranscriptionModule,
    TgBotModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, AudioTranscriptionService],
})
export class AppModule {}
