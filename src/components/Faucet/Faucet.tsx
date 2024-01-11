import React from "react";
import { useEffect, useState } from "react";
import { Box, Button, Heading, Spacer, Stack, Text, useColorMode } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { CHAIN_TOKEN_SYMBOL } from "libs/config";
import { FaucetContract } from "libs/MultiversX/faucet";

const Faucet = ({ tileBoxW, tileBoxH }: any) => {
  const { chainID } = useGetNetworkConfig();
  const { colorMode } = useColorMode();
  const { address: mxAddress } = useGetAccountInfo();
  const [isMxFaucetDisabled, setIsMxFaucetDisabled] = useState(false);
  const { hasPendingTransactions } = useGetPendingTransactions();

  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a TX is done...
    // ... so if it's 'false' we need check and prevent faucet from being used too often
    if (chainID === "D" && mxAddress && mxFaucetContract && !hasPendingTransactions) {
      mxFaucetContract.getFaucetTime(mxAddress).then((lastUsedTime) => {
        const timeNow = new Date().getTime();

        if (lastUsedTime + 120000 > timeNow) {
          setIsMxFaucetDisabled(true);

          // after 2 min wait we reenable the button on the UI automatically
          setTimeout(
            () => {
              setIsMxFaucetDisabled(false);
            },
            lastUsedTime + 120 * 60 * 1000 + 1000 - timeNow
          );
        } else {
          setIsMxFaucetDisabled(false);
        }
      });
    }
  }, [mxAddress, hasPendingTransactions]);

  useEffect(() => {
    if (hasPendingTransactions) {
      setIsMxFaucetDisabled(true);
    }
  }, [hasPendingTransactions]);

  const mxFaucetContract = new FaucetContract(chainID);
  const handleOnChainFaucet = async () => {
    if (mxAddress) {
      mxFaucetContract.sendActivateFaucetTransaction(mxAddress);
    }
  };

  return (
    <Box w={[tileBoxW, "initial"]} backgroundColor="none" border="1px solid transparent" borderColor="#00C79740" borderRadius="16px">
      <Stack p="5" alignItems={{ base: "center", xl: "start" }}>
        <Heading size="md" fontFamily="Clash-Medium" pb={2}>
          {CHAIN_TOKEN_SYMBOL(chainID)} Faucet
        </Heading>
        <Stack h={tileBoxH} w={"full"}>
          <Text textAlign={{ base: "center", xl: "left" }} fontSize="md" color="#929497" pb={5}>
            Get some free {CHAIN_TOKEN_SYMBOL(chainID)} tokens to try DEX features
          </Text>

          <Spacer />

          <Button colorScheme="teal" size="lg" variant="outline" borderRadius="xl" onClick={handleOnChainFaucet} isDisabled={isMxFaucetDisabled}>
            <Text color={colorMode === "dark" ? "white" : "black"}>Send me 20 {CHAIN_TOKEN_SYMBOL(chainID)}</Text>
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Faucet;
