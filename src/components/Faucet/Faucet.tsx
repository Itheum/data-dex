import React, { useEffect, useState } from "react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import myNFMe from "assets/img/my-nfme.png";
import ClaimModalMx from "components/ClaimModal/ClaimModalMultiversX";
import ExplainerArticles from "components/Sections/ExplainerArticles";
import RecentDataNFTs from "components/Sections/RecentDataNFTs";
import ChainSupportedComponent from "components/UtilComps/ChainSupportedComponent";
import { CHAIN_TOKEN_SYMBOL, CLAIM_TYPES, MENU, uxConfig } from "libs/config";
import { ClaimsContract } from "libs/MultiversX/claims";
import { FaucetContract } from "libs/MultiversX/faucet";
import { formatNumberToShort } from "libs/utils";
import AppMarketplace from "pages/Home/AppMarketplace";

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
