import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/index.css';
import { OptionsApp } from './OptionsApp';

const root = ReactDOM.createRoot(
  document.getElementById('options-root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>
);