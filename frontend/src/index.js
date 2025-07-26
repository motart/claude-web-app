import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import ErrorBoundary from './ErrorBoundary.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);