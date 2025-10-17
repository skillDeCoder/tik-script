// import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('https://www.tiktok.com/login/phone-or-email/email');
//   await page.getByRole('textbox', { name: 'Email or username' }).click();
//   await page.getByRole('textbox', { name: 'Email or username' }).fill('ugrobotech@gmail.com');
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
//   await page.getByRole('textbox', { name: 'Password' }).fill('Born@1998');
//   await page.getByRole('button', { name: 'Password hidden. Double-tap' }).click();
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('Born@199');
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('img').nth(2).click();
//   await page.getByRole('img').nth(2).click();
//   await page.getByRole('button', { name: 'Allow all' }).click();
//   await page.getByRole('button', { name: 'Log in' }).click();
//   await page.getByRole('link', { name: 'Go back' }).click();
//   await page.getByRole('link', { name: 'Go to TikTok For You feed' }).click();
//   await page.getByRole('button').filter({ hasText: /^$/ }).nth(5).click();
//   await page.goto('https://www.tiktok.com/');
//   await page.getByRole('button', { name: 'Like video 25.5K likes' }).click();
//   await page.getByRole('button', { name: 'Close' }).click();
//   await page.getByRole('link', { name: 'finnosho', exact: true }).click();
//   await page.getByRole('button', { name: 'Refresh' }).click();
//   await page.locator('#captcha_slide_button').click();
//   const page1Promise = page.waitForEvent('popup');
//   await page.getByRole('button').nth(3).click();
//   const page1 = await page1Promise;
//   await page1.getByRole('button', { name: 'Android' }).click();
//   await page.getByRole('listitem', { name: 'For You' }).click();
//   await page.getByRole('link', { name: 'finnosho', exact: true }).click();
//   await page.getByRole('button', { name: 'Follow Finnosho' }).click();
// });
//  await page.getByRole('button', { name: 'Message' }).click();

//   await page.getByRole('button', { name: 'Close' }).click();
//   await page.goto('https://www.tiktok.com/');
//   await page.getByRole('button', { name: 'Log in' }).first().click();
//   await page.getByRole('link', { name: 'Use phone / email / username' }).click();
//   await page.getByRole('link', { name: 'Log in with email or username' }).click();

//  page.wait_for_url('https://www.tiktok.com/foryou');
// TUXModal captcha-verify-container

// <input placeholder="Enter 6-digit code" class="code-input" maxlength="6" type="tel" value="">

// <div class="twv-components-send-code-button"><button type="button">Resend code </button></div>

// <button class="twv-component-button email-view-wrapper__button" type="button" disabled="">Next</button>
