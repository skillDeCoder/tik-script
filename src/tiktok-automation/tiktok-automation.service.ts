import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Browser, BrowserContext, Page } from 'playwright';
// import puppeteer from 'puppeteer';
import { chromium } from 'playwright-extra';
import { AudioTranscriptionService } from 'src/audio-transcription/audio-transcription.service';
import { TgBotService } from 'src/tg-bot/tg-bot.service';
// import { chromium } from 'patchright';
import * as UserAgent from 'user-agents';
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Preload evasions for pkg static analysis
// StealthPlugin().enabledEvasions;

@Injectable()
export class TiktokAutomationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TiktokAutomationService.name);
  browser: Browser | null = null;
  // private browser: any;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private waitingForOtp = false;
  private waitingForQrcodeScan = false;
  private otpResolve: ((otp: string) => void) | null = null;
  private isRunning = false;
  isLogged = false;

  constructor(
    private readonly transcribeService: AudioTranscriptionService,
    @Inject(forwardRef(() => TgBotService))
    private readonly tgBotService: TgBotService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    chromium.use(require('puppeteer-extra-plugin-stealth')());
    // chromium.use(StealthPlugin());
  }

  async onModuleInit() {
    console.log('TiktokAutomationService initialized');
    this.isRunning = true;
  }

  async restart() {
    await this.onModuleDestroy();
    // await this.onModuleInit();
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  /**
   * Initialize (or reuse) the long-lived browser session
   */
  private async ensureBrowser() {
    if (!this.browser) {
      this.logger.log('🚀 Launching long-running browser session...');

      const userAgentGenerator = new UserAgent({ deviceCategory: 'desktop' });
      const userAgent = userAgentGenerator.toString();
      this.logger.log(`Using user agent: ${userAgent}`);

      // const userAgent = this.getRandomUserAgent();

      this.browser = await chromium.launch({
        headless: false,
        slowMo: 100, // optional: slows actions so you can see them
        args: [
          '--headless=new',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--enable-webgl',
          '--use-gl=desktop',
          '--enable-experimental-web-platform-features',
          '--enable-features=NetworkService,AudioServiceOutOfProcess',
          '--disable-infobars',
          '--window-size=1920,1080',
          '--lang=en-US',
          '--disable-extensions',
          '--enable-font-antialiasing',
          '--no-default-browser-check',
        ],
      });

      this.context = await this.browser.newContext({
        // viewport: { width: 1366, height: 768 },
        viewport: { width: 1920, height: 1080 },
        userAgent,
        locale: 'en-US',
      });

      // run before any page scripts
      // await this.context.addInitScript(() => {
      //   Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
      //     get: () => undefined,
      //   });

      //   // window.chrome = { runtime: {} };
      // });

      this.page = await this.context.newPage();
    }
  }

  /**
   * Start login flow and wait for OTP input
   */
  async loginWithQrcode(chatId: string = '954121829') {
    try {
      await this.tgBotService.tikScriptBot.sendMessage(
        chatId,
        'Login started — waiting for qrCode',
      );
      await this.ensureBrowser();

      const page = this.page!;

      const loginUrl = 'https://www.tiktok.com/login/qrcode'; // change this
      const baseUrl = 'https://www.tiktok.com/login/qrcode';
      const e = { lang: 'en' }; // or from request, form, etc.

      const url = new URL(baseUrl);

      // Add or update ?lang=
      url.searchParams.set('lang', e.lang || 'en');

      // Get the full string
      const finalUrl = url.toString();

      this.logger.log(`Navigating to ${loginUrl}`);
      await page.goto(finalUrl, { timeout: 120000 }); // remember to remove this to default
      await page.waitForTimeout(10000);

      await this.startQrCodeCaptureLoop(page, chatId);
      // Meanwhile, your other logic continues
      // page.on('framenavigated', async () => {
      //   console.log('Page changed!');
      //   const result = await Promise.race([
      //     page
      //       .waitForURL('**/foryou?lang=en', {
      //         waitUntil: 'networkidle',
      //         timeout: 300000,
      //       })
      //       .then(() => ({ type: 'loggedIn' })),
      //   ]);

      //   if (result.type === 'loggedIn') {
      //     this.waitingForQrcodeScan = false;
      //     this.isLogged = true;
      //     await page.screenshot({ path: 'logged.png' });
      //     console.log('✅ Logged in successfully — URL changed.');
      //   } else {
      //     await page.screenshot({ path: 'faillogin.png' });
      //     console.log('⚠️ URL didn’t change — OTP might be required.');
      //   }
      // });

      page.on('framenavigated', async (frame) => {
        // Run only when the main frame changes
        if (frame === page.mainFrame()) {
          console.log('Main frame navigated!');
          const url = frame.url();

          if (url.includes('/foryou?lang=en')) {
            this.waitingForQrcodeScan = false;

            // await page.screenshot({ path: 'logged.png' });
            console.log('✅ Logged in successfully — URL changed to:', url);
            await this.tgBotService.tikScriptBot.sendMessage(
              chatId,
              '✅ Logged in successfully',
            );
            await new Promise((res) => setTimeout(res, 30_000));
            const loggedInImage = await page.screenshot({
              type: 'png',
            });
            await this.tgBotService.sendQrcode(chatId, loggedInImage);

            this.isLogged = true;
          }
        }
      });

      // this.logger.log('✅ Logged in successfully, keeping browser open.');
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Manually provide OTP via controller
   */
  async provideOtp(otp: string) {
    if (this.waitingForOtp && this.otpResolve) {
      this.otpResolve(otp);
      this.logger.log('✅ OTP provided, continuing login...');
    } else {
      this.logger.warn('⚠️ Not currently waiting for OTP.');
    }
  }

  /**
   * Perform actions while logged in (browser stays open)
   */
  async performAction(selector: string) {
    await this.ensureBrowser();
    const page = this.page!;
    await page.waitForSelector(selector, { timeout: 20000 });
    await page.click(selector);
    this.logger.log(`🖱️ Clicked: ${selector}`);
  }

  /**
   * Perform actions while logged in (browser stays open)
   */
  async followUser(username: string) {
    await this.ensureBrowser();

    const page = this.page!;
    await page.goto(`https://www.tiktok.com/@${username}?lang=en`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    const userSubtitle = await page.textContent('h2[data-e2e="user-subtitle"]');
    console.log('User name:', userSubtitle.trim());

    const followButton = page.getByRole('button', {
      name: `Follow ${userSubtitle}`,
    });

    const unFollowButton = page.getByRole('button', {
      name: `Following ${userSubtitle}`,
    });

    // Check if Follow button is visible
    if (await followButton.isVisible()) {
      await page.waitForTimeout(10000);
      await followButton.click();
      // await this.page.screenshot({
      //   path: `followedUser-${Date.now()}.png`,
      // });
      console.log(`Clicked Follow for ${userSubtitle}`);
      this.logger.log(`🖱️ followed user`);
      await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
    } else if (await unFollowButton.isVisible()) {
      console.log(`${userSubtitle} is already followed — no action taken.`);
    } else {
      console.log(`No Follow or Following button found for ${userSubtitle}`);
    }

    // const box = await followButton.boundingBox();
    // if (box) {
    //   await page.mouse.move(box.x + 10, box.y + 10);
    //   await page.waitForTimeout(3000);
    //   await followButton.click();
    // }

    // await this.page.screenshot({
    //   path: `User-${Date.now()}.png`,
    // });

    this.logger.log(` done following user`);
  }

  /**
   * follow and like a video
   */
  async followAndLikeUserVideo(username: string, chatId: string = '954121829') {
    await this.ensureBrowser();

    const page = this.page!;

    await page.goto(`https://www.tiktok.com/@${username}?lang=en`, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });

    // 🕵🏽 Detect private account message
    const isPrivateAccount = await page
      .locator('p.css-1q16lcj-5e6d46e3--PTitle.e1jj6n0n1')
      .evaluateAll((elements) =>
        elements.some((el) =>
          el.textContent?.includes('This account is private'),
        ),
      );

    if (isPrivateAccount) {
      console.log(`🔒 Account ${username} is private — skipping actions.`);
      return;
    }
    const userSubtitle = await page.textContent('h2[data-e2e="user-subtitle"]');
    console.log('User name:', userSubtitle.trim());

    const followButton = page.getByRole('button', {
      name: `Follow ${userSubtitle}`,
    });

    const unFollowButton = page.getByRole('button', {
      name: `Following ${userSubtitle}`,
    });

    // Check if Follow button is visible
    if (await followButton.isVisible()) {
      await page.waitForTimeout(10000);
      await followButton.click();
      // await this.page.screenshot({
      //   path: `followedUser-${Date.now()}.png`,
      // });
      console.log(`Clicked Follow for ${userSubtitle}`);
      this.logger.log(`🖱️ followed user`);
      await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
    } else if (await unFollowButton.isVisible()) {
      console.log(`${userSubtitle} is already followed — no action taken.`);
    } else {
      console.log(`No Follow or Following button found for ${userSubtitle}`);
    }

    const videoLink = await page.evaluate(() => {
      const link = document.querySelector('a[href*="/video/"]');
      return link ? link.getAttribute('href') : null;
    });

    console.log('🎥 First video link:', videoLink);
    // 1️⃣ Navigate to the video URL
    await page.goto(videoLink, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    // 2️⃣ Wait for the page to fully load (videos often lazy-load content)
    await page.waitForLoadState('networkidle', { timeout: 60000 });

    // 3️⃣ Wait for the like button to appear
    await page.waitForSelector(
      'button[data-e2e="like-icon"], span[data-e2e="like-icon"]',
      { timeout: 60000 },
    );
    // 4️⃣ Click the like button
    const likeButton = page.locator('button:has(span[data-e2e="like-icon"])');
    // ✅ Check heart fill color
    const isAlreadyLiked = await likeButton.evaluate((btn) => {
      const svgPath = btn.querySelector('path[fill]');
      if (!svgPath) return false;
      const fillColor = svgPath.getAttribute('fill')?.toUpperCase();
      return fillColor === '#FE2C55'; // TikTok red heart when liked
    });
    if (isAlreadyLiked) {
      console.log('❤️ Already liked — skipping click');
      // await page.screenshot({ path: `already-liked-${Date.now()}.png` });
    } else {
      await likeButton.click();
      console.log('👍 Liked video successfully');
      // await page.screenshot({ path: `liked-${Date.now()}.png` });
    }

    // await this.page.screenshot({
    //   path: `User-${Date.now()}.png`,
    // });

    this.logger.log(` done following user`);
    await this.tgBotService.tikScriptBot.sendMessage(
      chatId,
      `done following and liking ${username} video`,
    );
  }

  /**
   * Perform actions while logged in (browser stays open)
   */
  async returnToHome(selector: string) {
    await this.ensureBrowser();
    const page = this.page!;
    await page.waitForSelector(selector, { timeout: 20000 });
    await page.click(selector);
    this.logger.log(`🖱️ Clicked: ${selector}`);
  }

  /**
   * Optional cleanup if the app shuts down (e.g., CTRL+C)
   */
  async onModuleDestroy() {
    this.isLogged = false;
    if (this.browser) {
      if (this.page) await this.page.close();
      this.logger.log('🧹 Shutting down browser on module destroy...');
      await this.browser.close();
    }
  }

  private async HandleAudioCaptcha() {
    const audioButton = this.page.locator('#captcha_switch_button');
    await audioButton.click();
    await this.page.waitForTimeout(20000);
    await this.page.screenshot({
      path: `audio-detected-${Date.now()}.png`,
    });
    console.log('switched to audio captch');

    let audioUrl: string | null = null;

    try {
      const audioEl = await this.page.locator('audio[src]');
      audioUrl = await audioEl.getAttribute('src');

      if (audioUrl) {
        console.log('🎧 Audio CAPTCHA detected!');
        console.log('🔗 Audio URL:', audioUrl);
        const transcribeAudio =
          await this.transcribeService.transcribeFromUrl(audioUrl);
        const textInput = this.page.locator(
          'input[placeholder="Enter what you hear"]',
        );
        textInput.click();
        textInput.fill(transcribeAudio.normalizedText);

        const button = this.page.locator(
          'button:has(div > div:has-text("Verify"))',
        );
        button.click();
        await this.page.screenshot({ path: 'enteredAudio.png' });
      } else {
        console.log('❌ Audio CAPTCHA appeared but has no src attribute.');
      }
    } catch {
      console.log('⏰ No audio CAPTCHA detected within timeout.');
    }
  }

  private async HandleAudioCaptchaWithRetry() {
    const maxRetries = 15;
    let attempt = 0;
    const audioButton = this.page.locator('#captcha_switch_button');
    await audioButton.click();
    await this.page.waitForTimeout(20000);
    await this.page.screenshot({
      path: `audio-detected-${Date.now()}.png`,
    });
    console.log('switched to audio captch');

    let audioUrl: string | null = null;

    while (attempt < maxRetries) {
      attempt++;
      console.log(
        `🔁 Attempt ${attempt}/${maxRetries} to solve audio CAPTCHA...`,
      );

      try {
        // Step 2: Wait for audio element to appear
        const audioEl = this.page.locator('audio[src]');
        audioUrl = await audioEl.getAttribute('src');

        if (!audioUrl) {
          console.log('❌ Audio CAPTCHA appeared but has no src attribute.');
          continue; // Retry next iteration
        }

        console.log('🎧 Audio CAPTCHA detected!');
        console.log('🔗 Audio URL:', audioUrl);

        const transcribeAudio =
          await this.transcribeService.transcribeFromUrl(audioUrl);

        const textInput = this.page.locator(
          'input[placeholder="Enter what you hear"]',
        );
        await textInput.click();
        await textInput.fill(transcribeAudio.normalizedText);
        console.log(
          `✍️ Entered transcription: ${transcribeAudio.normalizedText}`,
        );

        const verifyButton = this.page.locator(
          'button:has(div > div:has-text("Verify"))',
        );
        await verifyButton.click();
        console.log('✅ Clicked Verify button');
        // await this.page.screenshot({ path: `attempt-${attempt}-verify.png` });

        // Step 6: Wait for CAPTCHA to disappear
        try {
          await this.page.waitForSelector('.captcha-verify-container', {
            state: 'hidden',
            timeout: 15000,
          });
          console.log('🎉 CAPTCHA solved successfully!');
          break; // Exit loop — success!
        } catch {
          await this.page.screenshot({
            path: `result-${attempt}-verify.png`,
          });
          console.log('⚠️ CAPTCHA still visible after verify — retrying...');
        }
      } catch (err) {
        console.log(`⚠️ Error in attempt ${attempt}:`, (err as Error).message);
      }
      await this.page.waitForTimeout(10000);
      console.log('waiting for another retry');
    }

    if (attempt >= maxRetries) {
      console.log('❌ Failed to solve audio CAPTCHA after 10 attempts.');
    }
  }

  private async waitForOtpToResolve(timeout: number): Promise<void> {
    const checkInterval = 1000; // check every 1 second
    const startTime = Date.now();

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // condition 1: user finished OTP entry
        if (!this.waitingForOtp) {
          clearInterval(interval);
          resolve();
        }

        // condition 2: timed out after `timeout` ms
        if (elapsed >= timeout) {
          console.warn('OTP wait timed out');
          this.waitingForOtp = false; // reset to false if desired
          clearInterval(interval);
          resolve();
        }
      }, checkInterval);
    });
  }

  async startQrCodeCaptureLoop(page: Page, chatId: string) {
    const mobileWidth = 390;
    const mobileHeight = 844;

    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport not found');

    const x = Math.max(0, (viewport.width - mobileWidth) / 2);
    const y = Math.max(0, (viewport.height - mobileHeight) / 2);

    this.waitingForQrcodeScan = true;

    console.log('Starting QR code capture loop...');

    // Run loop asynchronously (non-blocking)
    (async () => {
      while (this.waitingForQrcodeScan) {
        try {
          // await page.screenshot({
          //   path: 'cropped-mobile-view.png',
          //   clip: { x, y, width: mobileWidth, height: mobileHeight },
          // });

          const codeImage = await page.screenshot({
            type: 'png',
            clip: { x, y, width: mobileWidth, height: mobileHeight },
          });
          await this.tgBotService.sendQrcode(chatId, codeImage);

          // console.log(codeImage);

          console.log('QR code captured and saved.');
        } catch (err) {
          console.error('Error capturing QR code:', err);
        }

        // Wait 1 minute before next capture
        await new Promise((res) => setTimeout(res, 60_000));
      }

      console.log('QR code capture loop stopped.');
    })();
  }
}
