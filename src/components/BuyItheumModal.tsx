import React, { useEffect, useState } from "react";
import { Aggregator, ChainId, SorSwapResponse } from "@ashswap/ash-sdk-js/out";
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
  FormErrorMessage,
} from "@chakra-ui/react";
import { itheumTokenIdentifier, networkConfiguration } from "@itheum/sdk-mx-data-nft/out";
import { Address, ApiNetworkProvider, DefinitionOfFungibleTokenOnNetwork, ProxyNetworkProvider, Transaction } from "@multiversx/sdk-core";
import { useGetAccountInfo, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { contractsForChain } from "libs/config";
import { getAccountTokenFromApi, getMvxRpcApi } from "libs/MultiversX/api";
import { convertWeiToEsdt } from "libs/utils";
import { useAccountStore } from "store";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

const FEE_PERCENTAGE = 0.015;
const FEE_ADDRESS = "erd1qs08anu7lpvsl8py6zg5kpvc0tx43gks2tvjyrqx4gajy3y9kpyqv8zrvz";

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, address }) => {
  const [amount, setAmount] = useState("1");
  const [debouncedAmount, setDebouncedAmount] = useState(amount);

  const [isLoading, setIsLoading] = useState(false);
  const [feeAmount, setFeeAmount] = useState(BigNumber(0));
  const [swapAmount, setSwapAmount] = useState(BigNumber(0));
  const { colorMode } = useColorMode();
  const { account } = useGetAccountInfo();
  const [itheumTokenDetails, setItheumTokenDetails] = useState<DefinitionOfFungibleTokenOnNetwork>();
  const [swapDetails, setSwapDetails] = useState<SorSwapResponse>();
  const [tx, setTx] = useState<any>();
  const [sessionId, setSessionId] = useState<string>();
  const { pendingTransactions } = useGetPendingTransactions();
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const isError = Number(amount) <= 0 || amount === "" || Number(amount) > new BigNumber(account.balance).shiftedBy(-18).toNumber();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500);

    return () => clearTimeout(timer);
  }, [amount]);

  useEffect(() => {
    if (amount == "") {
      setFeeAmount(BigNumber(0));
      setSwapAmount(BigNumber(0));
      return;
    }

    const numericAmount = new BigNumber(amount).shiftedBy(18);

    setFeeAmount(numericAmount.multipliedBy(FEE_PERCENTAGE));
    setSwapAmount(numericAmount.multipliedBy(1 - FEE_PERCENTAGE));
  }, [amount]);

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
      if (!swapAmount) return;

      try {
        const agService = new Aggregator({ chainId: ChainId.Mainnet });
        const sorswap = await agService.getPaths("EGLD", itheumTokenIdentifier["mainnet"], swapAmount, 100);

        if (!sorswap) throw new Error(`Could not find any paths for EGLD to ITHEUM`);
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
  }, [debouncedAmount]);

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
            handleClose();
            clearInterval(intervalId);
            (async () => {
              const _token = await getAccountTokenFromApi(
                address,
                contractsForChain(networkConfiguration.mainnet.chainID).itheumToken,
                networkConfiguration.mainnet.chainID
              );
              const balance = _token ? convertWeiToEsdt(_token.balance, _token.decimals).toNumber() : 0;
              updateItheumBalance(balance);
            })();
          } else if (transactionDetails.status.isFailed()) {
            setIsLoading(false);
            console.error("Transaction failed!");
            handleClose();
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

  const handleClose = () => {
    setAmount("1");
    onClose();
    setIsLoading(false);
    setTx(null);
  };

  const handleSwapTransaction = async () => {
    try {
      const feeTransaction = new Transaction({
        sender: new Address(address),
        receiver: new Address(FEE_ADDRESS),
        value: feeAmount,
        gasLimit: 60000,
        chainID: networkConfiguration.mainnet.chainID,
      });

      const txSent = await sendTransactions({
        transactions: [tx, feeTransaction],
      });

      setIsLoading(true);

      setSessionId(txSent["sessionId"]);
    } catch (error) {
      console.error("Error executing transaction:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => handleClose()}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
        <ModalHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="large" fontWeight="bold">
              Buy $ITHEUM with EGLD
            </Text>
            {itheumTokenDetails?.assets?.svgUrl && <Image src={itheumTokenDetails.assets.svgUrl} alt="Itheum Token" boxSize="60px" ml="8px" />}
          </Flex>
          <Text fontSize="xs" color="teal.200" mt="-2">
            Powered by AshSwap Aggregator
          </Text>
        </ModalHeader>
        <ModalBody py={6}>
          <Box>
            <FormControl mb={4} isInvalid={isError}>
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
                  backgroundColor={colorMode === "dark" ? "teal.200" : "teal.100"}
                  textAlign="center"
                  color="black"
                  display="inline-block">
                  $EGLD
                </Box>{" "}
                amount:{" "}
              </FormLabel>
              <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <FormErrorMessage>Please enter a valid amount</FormErrorMessage>
            </FormControl>
            <Text fontSize="lg">
              Balance: {new BigNumber(account.balance).shiftedBy(-18).toFixed(2)} <b>EGLD</b>
            </Text>
            <Flex mb={2} mt={2} gap={2}>
              <Button size="sm" onClick={() => setAmount(new BigNumber(account.balance).shiftedBy(-18).multipliedBy(0.1).toFixed(2))}>
                10%
              </Button>
              <Button size="sm" onClick={() => setAmount(new BigNumber(account.balance).shiftedBy(-18).multipliedBy(0.25).toFixed(2))}>
                25%
              </Button>
              <Button size="sm" onClick={() => setAmount(new BigNumber(account.balance).shiftedBy(-18).multipliedBy(0.5).toFixed(2))}>
                50%
              </Button>
              <Button size="sm" onClick={() => setAmount(new BigNumber(account.balance).shiftedBy(-18).multipliedBy(0.75).toFixed(2))}>
                75%
              </Button>
              <Button size="sm" onClick={() => setAmount(new BigNumber(account.balance).shiftedBy(-18).toFixed(2))}>
                Max
              </Button>
            </Flex>
          </Box>
          <Box mt={4}>
            <Text fontSize="xs">
              Fee ({Number(FEE_PERCENTAGE) * 100}%):{" "}
              <b>{swapAmount.shiftedBy(-18).toNumber() < 0.1 ? feeAmount.shiftedBy(-18).toFixed(6) : feeAmount.shiftedBy(-18).toFixed(2)} EGLD</b>
            </Text>
            <Text fontSize="xs" mt={2}>
              Swapped Amount:{" "}
              <b>{swapAmount.shiftedBy(-18).toNumber() < 0.1 ? swapAmount.shiftedBy(-18).toFixed(6) : swapAmount.shiftedBy(-18).toFixed(2)} EGLD</b>
            </Text>
            <Text fontSize="lg" mt={5}>
              You will get approximately:
            </Text>
            <Box
              mt={2}
              px="40px"
              py="8px"
              borderRadius="md"
              fontWeight="bold"
              fontSize="lg"
              backgroundColor={colorMode === "dark" ? "teal.200" : "teal.100"}
              textAlign="center"
              display="flex"
              alignItems="center"
              color="black"
              justifyContent="center">
              {isLoading ? "..." : isNaN(Number(swapDetails?.minReturnAmount)) ? "0.00" : Number(swapDetails?.minReturnAmount).toFixed(2)} $ITHEUM
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            onClick={handleSwapTransaction}
            isDisabled={!tx || isLoading || amount == "" || Number(amount) > new BigNumber(account.balance).shiftedBy(-18).toNumber() || Number(amount) <= 0}>
            {isLoading ? "Processing..." : "Swap Now"}
          </Button>
          <Button variant="outline" onClick={() => handleClose()} ml={3}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransactionModal;
