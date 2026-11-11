import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'serupa-ds/tokens.css';
import 'serupa-ds/base.css';
import 'serupa-ds/bundle.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
