import React from 'react';
import './App.css';
import { useMachine } from '@xstate/react';
import { appMachine } from './appMachine';
import { inspect } from '@xstate/inspect';

inspect({ iframe: false }); // enables the xstate inspect window

const appMachineWithOptions = appMachine.withConfig({
  // you can override actions, services, guards, activities
});

function App() {
  const [current, send] = useMachine(appMachineWithOptions, {
    devTools: true
  });

  console.log('current.value', current.value);
  console.log('state.context', current.context);

  const next = () => send('NEXT', { manual: true });
  const toggleTimer = () => send('TIMER_TOGGLE');

  return (
    <div className="App">
      <div className="lightGrid">
        <div className="stopLight">
          North
          <Light direction="north" color="red" service={current} />
          <Light direction="north" color="yellow" service={current} />
          <Light direction="north" color="green" service={current} />
        </div>
      </div>
      <div className="status">
        Timer status: {current.matches('timer.enabled') ? 'Running' : 'Stopped'}
      </div>
      <div className="controls">
        <button onClick={next} disabled={current.matches('timer.enabled')}>
          Advance
        </button>
        <button onClick={toggleTimer}>Toggle Timer</button>
      </div>
    </div>
  );
}

function Light({ direction, color, service }) {
  return (
    <div>
      <div className="light">
        {service.matches(`${direction}.${color}`) ? (
          <div className="core" style={{ backgroundColor: color }}></div>
        ) : (
          <div className="core" style={{ backgroundColor: 'grey' }}></div>
        )}
      </div>
    </div>
  );
}

export default App;
