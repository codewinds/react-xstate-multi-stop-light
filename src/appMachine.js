import { Machine, assign, send } from 'xstate';

const stopLightState = {
  states: {
    green: {
      // entry: ['sendMinorDelay3Secs'],
      on: {
        MINOR: 'yellow'
      }
    },
    yellow: {
      // entry: ['sendMajorDelay1Sec'],
      on: {
        MAJOR: 'red'
      }
    },
    red: {
      on: {
        MAJOR: 'green'
      }
    }
  }
};

const appMachine = Machine(
  {
    id: 'app',
    type: 'parallel',
    initial: 'north.green,east.red',
    states: {
      north: {
        id: 'north',
        initial: 'green',
        ...stopLightState
      },
      east: {
        id: 'east',
        initial: 'red',
        ...stopLightState
      },
      next: {
        initial: 'major',
        states: {
          major: {
            on: {
              NEXT: {
                target: 'minor',
                actions: ['sendMinor']
              }
            }
          },
          minor: {
            on: {
              NEXT: {
                target: 'major',
                actions: ['sendMajor']
              }
            }
          }
        }
      }
    }
  },
  {
    actions: {
      sendMinorDelay3Secs: send('MINOR', { delay: 3000 }),
      sendMajorDelay1Sec: send('MAJOR', { delay: 1000 }),
      sendMajor: send((context, event) => ({
        type: 'MAJOR'
      })),
      sendMinor: send((context, event) => ({
        type: 'MINOR'
      }))
    },
    services: {}
  }
);

export { appMachine };
