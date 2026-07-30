import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme.css';

const elementRacine = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(elementRacine).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
