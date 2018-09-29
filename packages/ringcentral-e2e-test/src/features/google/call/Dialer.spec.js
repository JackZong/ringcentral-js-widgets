/* eslint-disable */
/* global $, page, browser, driver, context */
beforeEach(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
})
afterEach(async() => {
  await browser.close();
})
describe('Test Demo: =====>', () => {
  test({
    title: 'button text with select ${selector} expected ${expected} ',
    tags: [
      ['google', { brands: ['rc'] }],
    ],
    brands: ['rc'],
    levels: ['p0'],
    options: [
      {
        selector: '[class*=styles_loginButton]',
        expected: 'Sign In',
        username: '8552085154',
        pwd: 'Test!123',
        loginTitle: 'Sign in - RingCentral',
        appTitle: '',
      },
    ],
  }, async ({ option }) => {
    const text = await $(page).getText(option.selector, { selector: 'css' });
    expect(text).toBe(option.expected);
    await $(page).click(option.selector, {selector: 'css' });
    await page.waitFor(5300);
    let targets = await browser.targets();
    let loginPop = targets.find(t => t._targetInfo.title === option.loginTitle);
    let loginPage = await loginPop.page();
    await $(loginPage).type("input", option.username);
    await $(loginPage).click('loginCredentialNext');
    await page.waitFor(1000);
    targets = await browser.targets();
    loginPop = targets.find(t => t._targetInfo.title === option.loginTitle);
    loginPage = await loginPop.page();
    await $(loginPage).type("#password", option.pwd, { selector: 'css' });
    await $(loginPage).click('signInBtn');
    await page.waitFor(2000);
    let pages = await browser.pages();
    let app = pages[1];
    await $(app).click("[class*='styles_secondaryButton']", { selector: 'css' });
    await page.waitFor(3000);
    pages = await browser.pages();
    app = pages[1];
    await $(app).click("[class*='styles_cancelBtn']", { selector: 'css' });
    await page.waitFor(2000);
    await $(app).click("[class*='styles_dismiss']", { selector: 'css' });
    await $(app).click("div[title='More Menu']", { selector: 'css' });
    await page.waitFor(1000);
    pages = await browser.pages();
    app = pages[1];
    await $(app).click("div[title='Settings']", { selector: 'css' });
    pages = await browser.pages();
    app = pages[1];
    await $(app).click("button[class*='AuthorizeSettingsPanel']", { selector: 'css' });
    debugger;
  });

});
