// import { test } from '@playwright/test';

// test('Page Screenshot', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//   await page.screenshot({ path: `example.png` });
// });

import { test, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 13 Pro'],
  locale: 'en-US',
  geolocation: { longitude: 12.492507, latitude: 41.889938 },
  permissions: ['geolocation'],
});

test('Mobile and geolocation', async ({ page }) => {
  await page.goto('https://maps.google.com');
  // await page.getByText('Your location').click();
  // await page.waitForRequest(/.*preview\/pwa/);
  await page.screenshot({ path: 'colosseum-iphone.png' });
});
