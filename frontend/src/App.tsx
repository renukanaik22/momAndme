import React from 'react';

const appStyles: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  padding: '2rem',
};

function App(): JSX.Element {
  return (
    <main style={appStyles}>
      <h1>MomAndMe</h1>
      <p>Minimal React + TypeScript frontend is up and running.</p>
    </main>
  );
}

export default App;
