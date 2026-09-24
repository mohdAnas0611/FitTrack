import React from 'react';
import ReactDOM from 'react-dom/client';
import RootLayout from './app/_layout';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RootLayout />
    </React.StrictMode>
  );
}
