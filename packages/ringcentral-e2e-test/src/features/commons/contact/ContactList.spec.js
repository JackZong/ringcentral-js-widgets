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
    title: 'Contact list with account ${username}',
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
    const fromNumber = await $(app).getText(option.selector);
    expect(fromNumber).toBe(option.title);
    await $(app).timeout(2000);
    app.$('input')
    await $(app).screenshot({ path: 'rd.png'});
  })
})
