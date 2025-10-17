import { ModuleRef } from '@nestjs/core';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { TiktokAutomationService } from 'src/tiktok-automation/tiktok-automation.service';
import { TgBotService } from './tg-bot.service';

@Injectable()
export class RestartService {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => TgBotService))
    private readonly tgBotService: TgBotService,
  ) {}

  async restartTiktokAutomationService(chatId: string = '954121829') {
    console.log('Restarting TiktokAutomationService...');

    // 🔹 Get the instance of the service
    const instance = this.moduleRef.get(TiktokAutomationService, {
      strict: false,
    });

    // 🔹 Call its restart() method
    if (instance && typeof instance.restart === 'function') {
      await instance.restart();
      console.log('TiktokAutomationService restarted successfully.');

      // 🔹 Notify Telegram user
      await this.tgBotService.tikScriptBot.sendMessage(
        chatId,
        '✅ Account automation restarted successfully.',
      );
    } else {
      console.log(
        '❌ TiktokAutomationService instance not found or missing restart()',
      );
      await this.tgBotService.tikScriptBot.sendMessage(
        chatId,
        '❌ Failed to restart automation service.',
      );
    }
  }
}
