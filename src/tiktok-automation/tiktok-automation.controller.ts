import { Body, Controller, Post } from '@nestjs/common';
import { TiktokAutomationService } from './tiktok-automation.service';
import { AudioTranscriptionService } from 'src/audio-transcription/audio-transcription.service';

@Controller('tiktok-automation')
export class TiktokAutomationController {
  constructor(
    private readonly tiktok: TiktokAutomationService,
    private readonly transcribeService: AudioTranscriptionService,
  ) {}

  @Post('login')
  async login() {
    this.tiktok.loginWithQrcode();
    return { message: 'Login started — waiting for OTP...' };
  }

  @Post('otp')
  async otp(@Body() body: { otp: string }) {
    await this.tiktok.provideOtp(body.otp);
    return { message: 'OTP provided — continuing...' };
  }

  @Post('click')
  async click(@Body() body: { selector: string }) {
    await this.tiktok.performAction(body.selector);
    return { message: `Clicked ${body.selector}` };
  }

  @Post('transcribe')
  async transcribe(@Body() body: { url: string }) {
    return await this.transcribeService.transcribeFromUrl(body.url);
  }

  @Post('follow')
  async followUser(@Body() body: { username: string }) {
    return await this.tiktok.followUser(body.username);
  }

  @Post('follow-like')
  async followAndLikeUserVideo(@Body() body: { username: string }) {
    return await this.tiktok.followAndLikeUserVideo(body.username);
  }
}
