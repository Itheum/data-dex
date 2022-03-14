import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ChakraProvider, extendTheme, Flex, Container, Box } from '@chakra-ui/react';
import { MoralisProvider } from 'react-moralis';
// import { appId, serverURL } from './secrets.js'; 

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
  },
});

const serverUrl = process.env.REACT_APP_ENV_MORALIS_SERVER;

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId={process.env.REACT_APP_ENV_MORALIS_APPID} serverUrl={serverUrl}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </MoralisProvider>
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