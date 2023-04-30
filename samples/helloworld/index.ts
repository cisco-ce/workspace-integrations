// const wi = require('workspace-integrations');
import connect from '../../src/index';
import { Deployment, Integration } from '../../src/types';

// @ts-ignore
import(process.env.CREDS)
  .then(c => start(c))
  .catch(() => console.log('You need to specify credentials file'));

async function start(creds: Deployment) {
  let integration: Integration;
  try {
    integration = await connect(creds);
    integration.onError(console.error);
    console.log('connected!');
    // console.log('connected!', await integration.getAppInfo());
  }
  catch(e) {
    console.log('Not able to connect', e);
    return;
  }

  try {
    const devices = await integration.devices.getDevices({ tag: 'wi-demo' });
    devices.forEach(async ({ id }) => {
      try {
        const audio = await integration.xapi.status.get(id, 'Audio.Volume');
        console.log('Audio status', audio);
        // await integration.xapi.config.set(id, 'Audio.DefaultVolume', 66);
        const volume = await integration.xapi.config.get(id, 'Audio.DefaultVolume');
        console.log('Audio config', volume);

        const params = { Text: 'Hello World', Duration: 5 };
        integration.xapi.command(id, 'UserInterface Message Alert Display', params);
        const peopleCount = await integration.xapi.status.get(id, 'RoomAnalytics.PeopleCount.Current');
        console.log('count', peopleCount);
        integration.xapi.status.on('RoomAnalytics.PeopleCount.Current', (_, path, value) => {
          console.log('people count changed:', path, value);
        });
      }
      catch(e) {
        console.log(e);
      }
    });

    // console.log('Found', devices.length, 'devices');
    // const workspaces = await integration.workspaces.getWorkspaces();
    // console.log('Found', workspaces.length, 'workspaces');

  }
  catch(e) {
    console.log(e);
  }
}
