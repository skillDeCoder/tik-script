import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import * as TelegramBot from 'node-telegram-bot-api';
import { Account } from 'src/database/schemas/account.schema';
import { TiktokAutomationService } from 'src/tiktok-automation/tiktok-automation.service';
import { menuMarkup, welcomeMessageMarkup } from './markups';
import { RestartService } from './restart-script.service';

@Injectable()
export class TgBotService {
  tikScriptBot: TelegramBot;
  private logger = new Logger(TgBotService.name);
  private isRunning = false;

  constructor(
    @InjectModel(Account.name) private readonly AccountModel: Model<Account>,
    @Inject(forwardRef(() => TiktokAutomationService))
    private readonly tiktok: TiktokAutomationService,
    private readonly serviceRestart: RestartService,
  ) {
    const token = process.env.TELEGRAM_TOKEN;
    this.tikScriptBot = new TelegramBot(token, { polling: true });
    this.tikScriptBot.on('message', this.handleRecievedMessages);
    this.tikScriptBot.on('callback_query', this.handleButtonCommands);
  }

  handleRecievedMessages = async (
    msg: TelegramBot.Message,
  ): Promise<unknown> => {
    // this.logger.debug(msg);
    try {
      await this.tikScriptBot.sendChatAction(msg.chat.id, 'typing');
      // function extractPlatformAndUsername(text) {
      //   const regex = /@([a-zA-Z0-9._]+)/;

      //   const match = text.match(regex);

      //   if (match) {
      //     return {
      //       platform: `tiktok`, // "twitter" or "tiktok"
      //       username: match[1], // The username after "@"
      //     };
      //   } else {
      //     return null; // Return null if no match is found
      //   }
      // }

      // const addMatch = extractPlatformAndUsername(msg.text.trim());

      if (msg.text.trim() === '/start') {
        const username: string = `${msg.from.username}`;
        const welcome = await welcomeMessageMarkup(username);
        const replyMarkup = {
          inline_keyboard: welcome.keyboard,
        };
        return await this.tikScriptBot.sendMessage(
          msg.chat.id,
          welcome.message,
          {
            reply_markup: replyMarkup,
          },
        );
      }

      // else if (addMatch) {
      //   if (addMatch.platform === 'tiktok') {
      //     console.log(addMatch.username);
      //     //TODO: VERIFY USERNAME BEFORE SAVING
      //     const validAccount: any = await this.validateTiktokAccount(
      //       addMatch.username,
      //       msg.chat.id,
      //     );
      //     if (
      //       validAccount.username &&
      //       Number(validAccount.followersCount) > 0
      //     ) {
      //       if (Number(validAccount.followersCount) > 60000) {
      //         return await this.tiktokBot.sendMessage(
      //           msg.chat.id,
      //           `Account @${validAccount.username} followers it is above the iteration threshold`,
      //         );
      //       }
      //       return;
      //     }
      //     return;
      //   } else if (addMatch.platform === 'twitter') {
      //     return;
      //   }
      //   return;
      // }
      else if (msg.text.trim() === '/menu') {
        return await this.defaultMenu(msg.chat.id);
      }
    } catch (error) {
      console.log(error);
      return await this.tikScriptBot.sendMessage(
        msg.chat.id,
        'There was an error processing your message',
      );
    }
  };

  handleButtonCommands = async (
    query: TelegramBot.CallbackQuery,
  ): Promise<unknown> => {
    // this.logger.debug(query);
    let command: string;

    // const username = `${query.from.username}`;
    const chatId = query.message.chat.id;

    // function to check if query.data is a json type
    function isJSON(str: string) {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    if (isJSON(query.data)) {
      command = JSON.parse(query.data).command;
    } else {
      command = query.data;
    }

    try {
      // console.log(command);

      switch (command) {
        case '/menu':
          try {
            await this.tikScriptBot.sendChatAction(chatId, 'typing');
            return await this.defaultMenu(chatId);
          } catch (error) {
            console.log(error);
            return;
          }

        case '/login':
          try {
            await this.tikScriptBot.sendChatAction(chatId, 'typing');
            return await this.tiktok.loginWithQrcode(`${chatId}`);
          } catch (error) {
            console.log(error);
            return;
          }

        // case '/refresh':
        //   try {
        //     await this.tikScriptBot.sendChatAction(chatId, 'typing');
        //     return await this.serviceRestart.restartTiktokAutomationService();
        //   } catch (error) {
        //     console.log(error);
        //     return;
        //   }

        // case '/logout':
        //   try {
        //     await this.tikScriptBot.sendChatAction(chatId, 'typing');
        //     return await this.tiktok.onModuleDestroy();
        //   } catch (error) {
        //     console.log(error);
        //     return;
        //   }

        case '/close':
          await this.tikScriptBot.sendChatAction(
            query.message.chat.id,
            'typing',
          );
          return await this.tikScriptBot.deleteMessage(
            query.message.chat.id,
            query.message.message_id,
          );

        default:
          return await this.tikScriptBot.sendMessage(
            chatId,
            'There was an error processing your message',
          );
      }
    } catch (error) {
      console.log(error);
      return await this.tikScriptBot.sendMessage(
        chatId,
        'There was an error processing your message',
      );
    }
  };

  defaultMenu = async (chatId: number) => {
    try {
      const menu = await menuMarkup();
      const replyMarkup = {
        inline_keyboard: menu.keyboard,
      };
      return await this.tikScriptBot.sendMessage(chatId, menu.message, {
        reply_markup: replyMarkup,
      });

      return;
    } catch (error) {
      console.log(error);
    }
  };

  async sendQrcode(chatId: string, image: Buffer) {
    try {
      return await this.tikScriptBot.sendPhoto(chatId, Buffer.from(image));
      //   return await this.tikScriptBot.sendMessage(
      //     chatId,
      //     '✅withdrawal request has been processed!',
      //   );
    } catch (error) {
      console.log(error);
    }
  }

  @Cron('*/3 * * * *') // Runs every 3 minutes
  async handleFollowNewUser() {
    if (this.isRunning) {
      console.log('Previous cron still running, skipping...');
      return;
    }
    if (!this.tiktok.browser || !this.tiktok.isLogged) {
      // console.log(this.tiktok.isLogged);
      // console.log(this.tiktok.browser);
      console.log('there is no browser instance');
      return;
    }

    this.isRunning = true;
    console.log('Running follow cron...');

    try {
      const accounts = await this.AccountModel.find();

      if (accounts.length === 0) {
        console.log('No accounts to track');
        return;
      }

      // Find the first account that still has users to follow
      for (const account of accounts) {
        if (account.newAccountsToFollow.length > 0) {
          const nextUser = account.newAccountsToFollow[0].username;
          console.log(`executing Follow ${nextUser} from ${account.username}`);

          // Call follow + like
          await this.tiktok.followAndLikeUserVideo(nextUser);

          // Remove the followed user from queue
          account.newAccountsToFollow.splice(0, 1);
          await account.save();

          // Stop after processing just one user total this run
          break;
        }
      }
    } catch (error) {
      console.error('Error in follow cron:', error);
    } finally {
      this.isRunning = false;
    }
  }
}
