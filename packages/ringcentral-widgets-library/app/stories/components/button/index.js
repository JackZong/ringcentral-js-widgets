/**
 * @file button
 */
import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { text, boolean, number, select } from '@storybook/addon-knobs/react';
import { linkTo } from '@storybook/addon-links';

import Button from '../../../elements/Button';


storiesOf('Elements/Button', module)
  .add('with text', () => {
    const Ripple = Button.Ripple;
    return (
      <Ripple>
        <Button>RC Button</Button>
      </Ripple>
    );
  })
  .add('with dynamic', () => {
    const children = text('children', 'Button');
    const tooltip = text('tooltip', 'hello');
    const label1 = 'types';
    const options = [
      'outline',
      'warning',
      'primary',
      'default',
      'danger',
      'text',
    ];
    const type = select(label1, options, 'primary');

    const label2 = 'shaps';
    const shapOptions = [
      'default',
      'circle'
    ];
    const shape = select(label2, shapOptions, 'default');

    const label3 = 'colors';
    const colorOptions = [
      'warning',
      'danger'
    ];
    const color = select(label3, colorOptions, 'warning');
    const Ripple = Button.Ripple;
    const label4 = 'icon';
    const iconOptinons = [
      'FaxOutBound',
      'VoiceMail',
      'Message',
      'Unlogged',
      'Logged',
      'ActivityCall',
      'Dialpad',
      'Time',
      'SettingNav',
      ''
    ];
    const icon = select(label4, iconOptinons, '');
    const loading = boolean('Loading', false);
    const disabled = boolean('Disabled', false);
    return (
      <Ripple>
        <Button
          type={type}
          shape={shape}
          tooltip={tooltip}
          icon={icon}
          loading={loading}
          disabled={disabled}
        >
          {children}
        </Button>
      </Ripple>
    );
  });