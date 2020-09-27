const childProcess = require("child_process");
const util = require('util');

const execRaw = util.promisify(childProcess.exec);
const targetMode = 'laptop';

const config = {
  apps: [
    {
      "app": "Code",
      "shortCut": 1,
      "laptop": 1,
      "monitor": 1
    },
    {
      "app": "Firefox",
      "shortCut": 2,
      "laptop": 2,
      "monitor": 1
    },
    {
      "app": "iTerm2",
      "shortCut": 3,
      "laptop": 3,
      "monitor": 1
    },
    {
      "app": "Slack",
      "shortCut": 5,
      "laptop": 5,
      "monitor": 2
    },
    {
      "app": "Microsoft Outlook",
      "shortCut": 6,
      "laptop": 6,
      "monitor": 2
    }
  ]
}

const execute = async function (cmd) {
  const result = await execRaw(cmd);
  if (result.stderr) {
    throw new Error(`Error occured: ${result.stderr}`);
  }

  return result.stdout;
}

const queryYabai = async function (cmd) {
  const result = await execute(`yabai ${cmd}`);
  return JSON.parse(result);
}

async function startScript() {
  const windows = await queryYabai('-m query --windows');
  const spaces = await queryYabai('-m query --spaces');
  let spaceCount = spaces.length;

  const mergedConfig = windows
    .reduce((targetObject, window) => {
      const appConfig = config.apps.find(app => app.app === window.app);
      if (!appConfig) {
        targetObject.unmanaged.push(window);
      } else {
        targetObject.managed.push({
          window,
          appConfig
        });
      }
      return targetObject;
    }, { managed: [], unmanaged: [] })

  let commands = [];
  const managedCommands = mergedConfig.managed.reduce((currentCommands, { window, appConfig }) => {
    const currentSpace = window.space;
    const targetSpace = appConfig[targetMode];
    if (currentSpace === targetSpace) {
      return currentCommands;
    }

    if (targetSpace > spaceCount) {
      currentCommands.push(createAddSpaceCommand())
      spaceCount++;
    }

    currentCommands.push(createMoveCommand(window, targetSpace))

    return currentCommands;
  }, [])
  commands = [
    ...commands,
    ...managedCommands
  ];

  let targetSpace = getHighestUnmanaged(config);
  if (targetSpace > spaceCount) {
    commands = [...commands, createAddSpaceCommand()]
  }

  const unmanagedCommands = mergedConfig.unmanaged.map(window => createMoveCommand(window, targetSpace));
  commands = [
    ...commands,
    ...unmanagedCommands
  ]

  console.log(commands);
  for (const command of commands) {
    await execute(command);
  }

}


// const getLapTopPlacement = (
const spaceExist = (spaces, index) => spaces.length <= index;
const createAddSpaceCommand = () => `yabai -m space --create`;
const createMoveCommand = (window, targetSpace) => `yabai -m window ${window.id} --space ${targetSpace}`
const getHighestUnmanaged = config => config.apps.map(appConfig => appConfig[targetMode]).sort().pop() + 1

// Iterate Window
// Find where it belongs
// Create space if needed


// exec('yabai -m query --windows').then(async (res) => {
//   const parsedInput = JSON.parse(res.stdout);
//   const app = parsedInput.find(window => window.app === 'Firefox')
//   const result = await execute(`yabai -m window ${app.id} --space 3`);
//   console.log(result);
// });


startScript().
  then(() => console.log('Script complete!')).
  catch(err => console.error(err))



// console.log('yabai --version')
