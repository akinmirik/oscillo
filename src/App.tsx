import React from 'react';
import Oscilloscope from './components/Oscilloscope';

const App: React.FC = () => {
  return (
    <div className="app-container" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0b10',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* <h1>APP IS MOUNTED</h1> */}
      {/* <p>If you see this, App.tsx is rendering.</p> */}
      <Oscilloscope />
    </div>
  );
};

export default App;
