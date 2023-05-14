import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { getSentryProfile } from "libs/utils";
import Launcher from "pages/App/Launcher";
import { ChainMetaContextProvider } from "store/ChainMetaContext";
import { UserContextProvider } from "store/UserContext";
import reportWebVitals from "./reportWebVitals";
import "libs/MultiversX/custom.css";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.REACT_APP_ENV_SENTRY_DSN,

    // this is so we can use the environments filter in sentry to filter staging production vs actual production
    environment: getSentryProfile(),

    integrations: [new Sentry.BrowserTracing()],

    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  });
}

const breakpoints = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
  "2xl": "96em",
};

const theme = extendTheme({
  breakpoints,
  config: {
    initialColorMode: "dark",
  },
  fontSizes: {
    xs: "0.65rem",
    sm: "0.75rem",
    md: "0.85rem",
    lg: "0.95rem",
    xl: "1.05rem",
    "2xl": "1.15rem",
  },
  Toast: {
    colorScheme: "teal",
  },
  colors: {
    teal: {
      50: "#E6FFFA",
      100: "#B2F5EA",
      200: "#00C797", // our custom teal override. also default for chakra buttons etc
      300: "#4FD1C5",
      400: "#38B2AC",
      500: "#319795",
      600: "#2C7A7B",
      700: "#285E61",
      800: "#234E52",
      900: "#1D4044",
    },
    bgDark: "#0F0F0F",
  },
});

const container = document.getElementById("root");
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
