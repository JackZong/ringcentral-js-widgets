/* eslint-disable */
/* global $, browser, page, driver, context */
import React from 'react';
import { createProcess } from 'marten';
import Login from '../../../steps/commons/login';
import Entry from '../../../steps/entry';
import NavigateTo from '../../../steps/commons/navigateTo';
import NavigationBar from 'ringcentral-widgets/components/NavigationBar';
describe('Contact list automated test', () => {
  test({
    title: 'Contact list with account ${username}, search content',
    tags: [['widgets']],
    options: [
      { username: '+18552085154*101',
        password: 'Test!123',
        selector: 'toTitle',
        title: 'To:',
        navigationBar: '.navigationButton'
      }
    ],
    levels: ['p0']
  }, async({ option, isVirtual }) => {
    // login to CTI
    const process = createProcess(
      Entry,
      Login,
      NavigateTo,
    )(context);
    await process.exec();
    const contactNav = await page.$("div[title='Contacts']");
    await contactNav.click();
    await $(app).timeout(1000);
    const search = await page.$("input[name='search']");
    await search.focus();
    await search.type('FirstName', { delay: 200 });
    await $(app).timeout(1000);
    await search.type('abc', { delay: 100 });
    await $(app).timeout(500);
    const title = await page.$eval('._-ringcentral-widgets-components-ContactList-_styles_noContacts_avCq5', e => {
      return e.innerHTML
    });
    expect(title).toEqual('No records found.');
  });
  test({
    title: 'Contact list filter',
    levels: ['p0'],
    tags: [['widgets']],
    options: [{

    }]
  }, async({ option, isVirtual }) => {
    await $(app).screenshot({ path: 'f.png' });
    const contactNav = await page.$("div[title='Contacts']");
    await contactNav.click();
    await $(app).screenshot({ path: 'c.png' });
    const filterBtn = page.$('._-ringcentral-widgets-components-ContactSourceFilter-_styles_contactSourceFilter_1YaIl _-ringcentral-widgets-components-ContactsView-_styles_actionButton_3aSnr');
    await filterBtn.click();
    $(app).screenshot({ path: 'f.png' });
  });
})
