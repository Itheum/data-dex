import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Image,
  FormControl,
  FormLabel,
  useColorMode,
  Box,
  Text,
  Flex,
} from "@chakra-ui/react";
import { Aggregator, ChainId, SorSwapResponse } from "@ashswap/ash-sdk-js/out";
import { itheumTokenIdentifier, networkConfiguration } from "@itheum/sdk-mx-data-nft/out";
import {
  Address,
  ApiNetworkProvider,
  DefinitionOfFungibleTokenOnNetwork,
  ITransactionOnNetwork,
  ProxyNetworkProvider,
  TransactionWatcher,
} from "@multiversx/sdk-core";
import BigNumber from "bignumber.js";
import { getMvxRpcApi } from "libs/MultiversX/api";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string; // Address of the sender
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, address }) => {
  const [amount, setAmount] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const { colorMode } = useColorMode();
  const [itheumTokenDetails, setItheumTokenDetails] = useState<DefinitionOfFungibleTokenOnNetwork>();
  const [swapDetails, setSwapDetails] = useState<SorSwapResponse>();
  const [tx, setTx] = useState<any>();
  const [sessionId, setSessionId] = useState<string>();
  const { pendingTransactions } = useGetPendingTransactions();

  useEffect(() => {
    if (!isOpen) return;

    const fetchTokenDetails = async () => {
      try {
        const api = getMvxRpcApi(networkConfiguration.mainnet.chainID);
        const apiProvider = new ApiNetworkProvider(`https://${api}`);
        const tokenDetails = await apiProvider.getDefinitionOfFungibleToken(itheumTokenIdentifier["mainnet"]);
        setItheumTokenDetails(tokenDetails);
      } catch (error) {
        console.error("Error fetching token details:", error);
      }
    };

    fetchTokenDetails();
  }, [isOpen]);

  useEffect(() => {
    const fetchAggregatorResponse = async () => {
      if (!amount) return;

      setIsLoading(true);
      try {
        const agService = new Aggregator({ chainId: ChainId.Mainnet });
        const sorswap = await agService.getPaths("EGLD", itheumTokenIdentifier["mainnet"], new BigNumber(amount).shiftedBy(18), 100);

        if (!sorswap) throw new Error(`Could not find any paths for EGLD to ASH`);
        setSwapDetails(sorswap);

        const interaction = await agService.aggregateFromPaths(sorswap, 1000, async (warning) => {
          console.log("tx warning:", warning);
          return true;
        });

        const tx = interaction.withSender(new Address(address)).check().buildTransaction();

        setTx(tx);
      } catch (error) {
        console.error("Error fetching aggregator response:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAggregatorResponse();
  }, [amount, address]);

  const handleSwapTransaction = async () => {
    try {
      const txSent = await sendTransactions({
        transactions: [tx],
      });

      setIsLoading(true);

      setSessionId(txSent["sessionId"]);
    } catch (error) {}
  };

  useEffect(() => {
    if (!pendingTransactions[sessionId]) return;

    const handleTransactionCompletion = async () => {
      const transactionHash = pendingTransactions[sessionId].transactions[0].hash;

      const api = getMvxRpcApi(networkConfiguration.mainnet.chainID);
      const proxyNetworkProvider = new ProxyNetworkProvider(`https://${api}`);

      const fetchTransactionStatus = async () => {
        try {
          const transactionDetails = await proxyNetworkProvider.getTransaction(transactionHash);
          console.log("Transaction details:", transactionDetails);

          if (transactionDetails.status.isSuccessful()) {
            setIsLoading(false);
            console.log("Transaction successful!");
            onClose();
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Error fetching transaction details:", error);
        }
      };

      const intervalId = setInterval(fetchTransactionStatus, 5000);

      // Initial fetch
      await fetchTransactionStatus();

      return () => clearInterval(intervalId);
    };

    handleTransactionCompletion();
  }, [pendingTransactions, sessionId, onClose]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
        <ModalHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="large" fontWeight="bold">
              Buy Itheum from{" "}
              <Text as="a" href="https://app.ashswap.io/swap" target="_blank" rel="noopener noreferrer" color="teal.400" textDecoration="underline">
                AshSwap
              </Text>
            </Text>
            {itheumTokenDetails?.assets?.svgUrl && <Image src={itheumTokenDetails.assets.svgUrl} alt="Itheum Token" boxSize="60px" ml="8px" />}
          </Flex>
        </ModalHeader>
        <ModalBody py={6}>
          <Box>
            <FormControl mb={4}>
              <FormLabel fontSize="lg">
                Enter{" "}
                <Box
                  mt={2}
                  mb={2}
                  px="5px"
                  py="5px"
                  borderRadius="md"
                  fontWeight="bold"
                  fontSize="md"
                  backgroundColor={colorMode === "dark" ? "teal.400" : "teal.100"}
                  textAlign="center"
                  display="inline-block">
                  $EGLD
                </Box>{" "}
                amount:{" "}
              </FormLabel>
              <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </FormControl>
          </Box>
          <Box mt={4}>
            <Text fontSize="lg">You will get:</Text>
            <Box
              mt={2}
              px="40px"
              py="5px"
              borderRadius="md"
              fontWeight="bold"
              fontSize="md"
              backgroundColor={colorMode === "dark" ? "teal.400" : "teal.100"}
              textAlign="center"
              display="flex"
              alignItems="center"
              justifyContent="center">
              {isNaN(Number(swapDetails?.minReturnAmount)) ? "0.00" : Number(swapDetails?.minReturnAmount).toFixed(2)} $ITHEUM
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={handleSwapTransaction} isDisabled={!tx || isLoading || amount == ""}>
            {isLoading ? "Processing..." : "Swap Now"}
          </Button>
          <Button variant="outline" onClick={onClose} ml={3}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionModal;
