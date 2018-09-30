import { createProcess } from 'marten';
import Login from '../../../steps/office/login';
import Entry from '../../../steps/entry';

/* global $, page, browser, driver, context */

beforeEach(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000000;
});

afterEach(async() => {
  await driver.close();
});

describe('Test Demo: =====>', () => {
  test({
    title: 'Authroize Office365',
    tags: [
      ['office'],
    ],
    brands: ['rc'],
    levels: ['p0'],
    options: [
      {
        microsoftTitle: 'Sign in to your account',
        officeAccout: '',
        officePwd: '',
        authSuccess: 'Authorized Account'
      },
    ],
  }, async ({ option }) => {
    // Login CTI
    const process = createProcess(
      Entry,
      Login,
    )(context);
    await process.exec();
    // Authroize Office365
    await $(page).click('div[title="More Menu"]', { selector: 'css' });
    await $(page).waitFor('div[title="Settings"]', { selector: 'css' });
    await $(page).click('div[title="Settings"]', { selector: 'css' });
    await $(page).waitFor('button[class*="AuthorizeSettingsPanel"]', { selector: 'css' });
    await $(page).click('button[class*="AuthorizeSettingsPanel"]', { selector: 'css' });
    // TODO: wait for popup
    await $(page).waitFor(6000);
    const targets = await browser.targets();
    const officeAuthPop = targets.find(t => t._targetInfo.title === option.microsoftTitle);
    const officeAuthPage = await officeAuthPop.page();
    await officeAuthPage.type("input[type='email']", option.officeAccout, { selector: 'css' });
    await officeAuthPage.click("input[type='submit']", { selector: 'css' });
    await officeAuthPage.type("input[name='passwd']", option.officePwd, { selector: 'css' });
    // need a timeout
    await $(officeAuthPage).waitFor(2000);
    await officeAuthPage.click("input[type='submit']", { selector: 'css' });
    await $(officeAuthPage).waitFor(3000);
    // Check status
    const text = await $(page).getText("[class*='AuthorizeSettingsPanel-_styles_title']",
      { selector: 'css' }
    );
    expect(text).toEqual(option.authSuccess);
  });
});
