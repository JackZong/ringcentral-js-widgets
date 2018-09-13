import { createProcess } from 'marten';
import salesforce from './salesforce';
import widgets from './widgets';

export default class Entry {
  static async enter(context) {
    if (context.options.isVirtual) return;
    const entries = {
      widgets,
      salesforce,
    };
    const Entrance = entries[context.options.tag.project];
    const process = createProcess(
      Entrance,
    )(context);
    await process.exec();
  }

  static get steps() {
    return [
      this.enter,
    ];
  }
}
