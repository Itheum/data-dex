import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ChakraProvider, extendTheme, Flex, Container, Box } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools'
import { MoralisProvider } from 'react-moralis';
import ErrorBoundary from './ErrorBoundary';

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
    xs: "0.65rem",
    sm: "0.75rem",
    md: "0.85rem",
    lg: "0.95rem",
    xl: "1.05rem",
    "2xl": "1.15rem",
  }
});

const serverUrl = process.env.REACT_APP_ENV_MORALIS_SERVER;

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <MoralisProvider appId={process.env.REACT_APP_ENV_MORALIS_APPID} serverUrl={serverUrl}>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </MoralisProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
);


{/* <Container maxW="container.xl" p={0} m={0}>
  <Flex h="100vh" w="100vw" direction={{'base': 'column', md:"column"}}>
      <Box h="10vh" bgColor={"red"}>Header</Box>
      <Box h="800vh" bgColor={"blue"}>Body</Box>
      <Box h="10vh" bgColor={"green"}>Footer</Box>
  </Flex>
</Container> */}