import { Machine, send } from 'xstate';

const stopLightState = {
  states: {
    green: {
      on: {
        MINOR: 'yellow'
      }
    },
    yellow: {
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
      south: {
        id: 'south',
        initial: 'green',
        ...stopLightState
      },
      west: {
        id: 'west',
        initial: 'red',
        ...stopLightState
      },
      next: {
        initial: 'major',
        states: {
          major: {
            // entry: ['sendNextAfter3Seconds'],
            on: {
              NEXT: {
                target: 'minor',
                actions: ['sendMinor']
              }
            }
          },
          minor: {
            // entry: ['sendNextAfter1Second'],
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
      sendNextAfter3Seconds: send('NEXT', { delay: 3000 }),
      sendNextAfter1Second: send('NEXT', { delay: 1000 }),
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
