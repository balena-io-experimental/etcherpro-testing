import {ElectronApplication, expect, test, _electron} from '@playwright/test';
import {Page} from 'playwright-core'
import { fetchUrls } from './remote-play';
import config from '../config.json';

let electronApp: ElectronApplication; 
let page: Page
let pages: Page[]

// Before each test, try to connect to Electron using Chrome Debugging Port
// and node inspect port
test.beforeAll(async () => {
  // Fetch the configuration from the EcherPro IP (set as env variable)
  const ip=config.etcherProIP??'127.0.0.1';
  const urls = await fetchUrls({ip:ip});
  // Connect to electron
  const app = await _electron.connectOverCDP({
    chromiumEndpointURL: urls.chromeURL,
    nodeEndpointURL: urls.inspectURL
  }); 

  // Store the configuration
  electronApp = app
  pages = await app.windows();
  page = await app.firstWindow();

  // Ensure selected page is the main Etcher page
  // (On etcher pro, we have multiple pages for WifiModals etc...)
  for (var p in pages)
  {
    if ((await pages[p].title()) === "balenaEtcher")
    {
      page = pages[p];
    }
  }
});

// Force the tests to be run one after the other
test.describe.configure({mode: 'serial'});
  

// Test flashing by URL
test('Flashing by URL', async () => {
  // set timeout to 5min to prevent the test from timing out
  test.setTimeout(5*60000);
  
  // Reload the page to ensure Etcher is fresh
  await page.reload();
  // Reset the viewport to match etcherPro screen size
  await page.setViewportSize({width:1024, height:600});

  // Starting the application
  let screenshot = await page.screenshot();
  await test.info().attach('before_flashing', {body: screenshot, contentType: 'image/png'});
  
  // Start Flashing by URL
  await page.getByRole('button', {name: 'Flash from URL'}).dispatchEvent('click');
  await page.getByPlaceholder("Enter a valid URL").fill(config.flashFromUrl);
  screenshot = await page.screenshot();
  await test.info().attach('flash by url', {body: screenshot, contentType: 'image/png'});

  // Back to the main screen
  await page.getByRole('button', {name: 'OK'}).dispatchEvent('click');
  await page.waitForSelector('text=Change');
  screenshot = await page.screenshot();
  await test.info().attach('ready to flash', {body: screenshot, contentType: 'image/png'});

  // Start flashing
  await page.getByRole('button', {name: "Flash!"}).dispatchEvent('click');
  await page.waitForSelector('text=Flashing...');
  await page.waitForSelector('text=/5\\d\\%/', {timeout: 120000});
  screenshot = await page.screenshot();
  await test.info().attach('Flashing', {body: screenshot, contentType: 'image/png'});

  // Validating
  await page.waitForSelector('text=Validating...', {timeout: 120000});
  await page.waitForSelector('text=/5\\d\\%/');
  screenshot = await page.screenshot();
  await test.info().attach('Validating', {body: screenshot, contentType: 'image/png'});

  await page.waitForSelector('role=button >> text="Flash another"', {timeout: 120000});
  screenshot = await page.screenshot();
  await test.info().attach('Finished', {body: screenshot, contentType: 'image/png'});
  await page.locator('role=button >> text="Flash another"').dispatchEvent('click');
});

// Read the version number of etcher
test('read version', async () => {
  // Set the viewport to match the screen size
  await page.setViewportSize({width:1024, height:600});

  // Find the Cog icon and click it
  await page.locator('[tabindex] >> svg >> path', {}).dispatchEvent('click');
  // Look for the "Settings" text if the settings modal is present
  await page.waitForSelector('text=Settings');
  let version = await page.locator('text=/\\d+\\.\\d+\\.\\d+/').innerText();
  let screenshot = await page.screenshot();
  await test.info().attach('Settings', {body: screenshot, contentType: 'image/png'});
  await test.info().attach(`Version` , {body: version});
  // Close the settings page
  await page.locator('button >> text="OK"').dispatchEvent('click');
});