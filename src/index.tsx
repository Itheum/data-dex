import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import React from 'react';
import { createRoot } from 'react-dom/client';
import Launcher from './Launch/Launcher';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';
import ErrorBoundary from 'UtilComps/ErrorBoundary';
import { UserContextProvider } from './store/UserContext';
import { ChainMetaContextProvider } from './store/ChainMetaContext';
import { BrowserRouter as Router } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import '../src/MultiversX/custom.css';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_ENV_SENTRY_DSN,
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%  of transactions for performance monitoring.
    tracesSampleRate: 1.0,
  });
}

const breakpoints = createBreakpoints({
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
});

const theme = extendTheme({
  breakpoints,
  config: {
    initialColorMode: 'dark',
  },
  fontSizes: {
    xs: '0.65rem',
    sm: '0.75rem',
    md: '0.85rem',
    lg: '0.95rem',
    xl: '1.05rem',
    '2xl': '1.15rem',
  },
  Toast: {
    colorScheme: 'teal',
  }
});

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ChainMetaContextProvider>
        <UserContextProvider>
          <Router>
            <Launcher />
          </Router>
        </UserContextProvider>
      </ChainMetaContextProvider>
    </ChakraProvider>
</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
