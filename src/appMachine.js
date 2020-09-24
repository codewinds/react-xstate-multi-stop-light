import { Machine, send } from 'xstate';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

const LIGHT_INTERVAL_MSECS = 1000;

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
            on: {
              NEXT: {
                target: 'minor',
                actions: ['sendMinor'],
                cond: 'readyForMinor'
              }
            }
          },
          minor: {
            on: {
              NEXT: {
                target: 'major',
                actions: ['sendMajor'],
                cond: 'readyForMajor'
              }
            }
          }
        }
      },
      timer: {
        initial: 'disabled',
        states: {
          disabled: {
            on: {
              TIMER_TOGGLE: 'enabled'
            }
          },
          enabled: {
            on: {
              TIMER_TOGGLE: 'disabled',
              LIGHT_TIMER: {
                actions: ['sendNext']
              }
            },
            invoke: {
              src: 'startLightTimer'
            }
          }
        }
      }
    }
  },
  {
    actions: {
      sendNext: send((context, { idx }) => ({ type: 'NEXT', idx })),
      sendMajor: send((context, event) => ({
        type: 'MAJOR'
      })),
      sendMinor: send((context, event) => ({
        type: 'MINOR'
      }))
    },
    guards: {
      readyForMinor: (context, { idx, manual }) => {
        return manual || idx % 2 === 0;
      },
      readyForMajor: (context, { idx, manual }) => {
        return manual || idx % 4 === 0;
      }
    },
    services: {
      startLightTimer: (context, event) => {
        return interval(LIGHT_INTERVAL_MSECS).pipe(
          map((idx) => ({ type: 'LIGHT_TIMER', idx }))
        );
      }
    }
  }
);

export { appMachine };
