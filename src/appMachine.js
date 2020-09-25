import { Machine, send } from 'xstate';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

const LIGHT_INTERVAL_MSECS = 1000;

const appMachine = Machine(
  {
    id: 'app',
    type: 'parallel',
    states: {
      north: {
        id: 'north',
        initial: 'green',
        states: {
          green: {
            on: {
              NEXT: 'yellow'
            }
          },
          yellow: {
            on: {
              NEXT: 'red'
            }
          },
          red: {
            on: {
              NEXT: 'green'
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
      sendNext: send((context, { idx }) => ({ type: 'NEXT', idx }))
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
