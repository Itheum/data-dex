import React, { useEffect, useState, useMemo } from "react";
import {
  Heading,
  Box,
  Flex,
  Spinner,
  HStack,
  Input,
  Link,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from "@chakra-ui/react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { useGetNetworkConfig, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { Address } from "@multiversx/sdk-core/out";
import { ColumnDef } from "@tanstack/react-table";
import ShortAddress from "components/UtilComps/ShortAddress";
import { BridgeHandlerContract } from "libs/MultiversX/bridgeHandler";
import { getBridgeDepositTransactions } from "libs/MultiversX/api";
import { DataTable } from "components/Tables/Components/DataTable";
import { BridgeDepositsInTable, timeSince } from "components/Tables/Components/tableUtils";
import { CHAIN_TX_VIEWER, contractsForChain } from "libs/config";
import { formatNumberRoundFloor, sleep, isValidNumericCharacter } from "libs/utils";

// CONSTANTS (should come from SC or backend)
const MIN_BRIDGE_DEPOSIT = 10;
const MAX_BRIDGE_DEPOSIT = 20;

export default function Bridge() {
  const toast = useToast();
  const { chainID } = useGetNetworkConfig();
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const mxBridgeHandlerContract = new BridgeHandlerContract(chainID);
  const [bridgeAdmin, setBridgeAdmin] = useState("");
  const [bridgeIsPaused, setBridgeIsPaused] = useState(true);
  const [bridgeDepositTxs, setBridgeDepositTxs] = useState<BridgeDepositsInTable[]>([]);
  const [loadingBridgeDepositTxs, setLoadingBridgeDepositTxs] = useState(-1);
  const [errGeneric, setErrGeneric] = useState<any>(null);
  const [lockingDeposit, setLockingDeposit] = useState<boolean>(false);
  const [lockDepositSessionId, setLockDepositSessionId] = useState<any>(null);
  const [lockDepositSuccessful, setLockDepositSuccessful] = useState<any>(null);
  const [bridgeDeposit, setBridgeDeposit] = useState(MIN_BRIDGE_DEPOSIT);
  const [solanaDestinationAddress, setSolanaDestinationAddress] = useState<any>(null);
  const [bridgeDepositError, setBridgeDepositError] = useState<any>(null);

  useEffect(() => {
    if (chainID === "D" && mxAddress && mxBridgeHandlerContract) {
      mxBridgeHandlerContract.getAdminAddress().then((adminAddress) => {
        if (adminAddress?.valueOf()) {
          setBridgeAdmin(new Address(adminAddress.valueOf()).toString());
        }
      });

      mxBridgeHandlerContract.getIsPaused().then((isPaused) => {
        console.log(isPaused);
        setBridgeIsPaused(isPaused);
      });

      fetchMyBridgeDepositTransactions();
    }
  }, [mxAddress]);

  useEffect(() => {
    if (hasPendingTransactions) return;

    fetchMyBridgeDepositTransactions();
  }, [hasPendingTransactions]);

  useEffect(() => {
    if (hasPendingTransactions) return;
    setLockingDeposit(false);
    fetchMyBridgeDepositTransactions();
  }, [lockDepositSuccessful]);

  const fetchMyBridgeDepositTransactions = async () => {
    setLoadingBridgeDepositTxs(-1);

    const res = await getBridgeDepositTransactions(mxAddress, chainID);

    if (res.error) {
      toast({
        title: "Could not get your recent bridge deposit transactions from the MultiversX blockchain.",
        status: "error",
        isClosable: true,
        duration: null,
      });

      setLoadingBridgeDepositTxs(-2);
    } else {
      setBridgeDepositTxs(res.transactions);
      setLoadingBridgeDepositTxs(0);
    }
  };

  const depositsTableColumns = useMemo<ColumnDef<BridgeDepositsInTable, any>[]>(
    () => [
      {
        id: "hash",
        accessorFn: (row) => row.hash,
        cell: (cellProps) => (
          <HStack>
            <ShortAddress address={cellProps.getValue()} />
            <Link
              href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/transactions/${cellProps.getValue()}`}
              isExternal
              style={{ display: "flex" }}>
              <ExternalLinkIcon />
            </Link>
          </HStack>
        ),
        header: "Deposit Hash",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "when",
        accessorFn: (row) => row.timestamp,
        header: "When",
        cell: (cellProps) => timeSince(cellProps.getValue()),
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Deposit Status",
        cell: (cellProps) => cellProps.getValue(),
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "tokens",
        accessorFn: (row) => formatNumberRoundFloor(row.amount / Math.pow(10, 18)),
        header: "Tokens",
        footer: (footerProps) => footerProps.column.id,
      },
      {
        id: "progress",
        accessorFn: (row) => "unknown",
        header: "Progress",
        footer: (footerProps) => footerProps.column.id,
      },
    ],
    []
  );

  const handleOnChainLock = async () => {
    if (bridgeDeposit >= MIN_BRIDGE_DEPOSIT && bridgeDeposit <= MAX_BRIDGE_DEPOSIT && solanaDestinationAddress !== null) {
      setLockingDeposit(true);

      await sleep(3);

      const { sessionId, error } = await mxBridgeHandlerContract.sendLockTransaction({
        recipient: solanaDestinationAddress,
        sender: mxAddress,
        itheumToken: contractsForChain(chainID).itheumToken,
        antiSpamTax: bridgeDeposit,
      });

      if (error) {
        setErrGeneric(new Error(error.toString()));
      }

      setLockDepositSessionId(sessionId);
    }
  };

  const txFail = () => {
    setLockingDeposit(false);
    setErrGeneric(new Error("Transaction to lock deposit has failed"));
  };

  const txCancelled = () => {
    setLockingDeposit(false);
    setErrGeneric(new Error("Transaction to lock deposit was cancelled"));
  };

  const txSuccess = async () => {
    setLockDepositSuccessful(true);
  };

  useTrackTransactionStatus({
    transactionId: lockDepositSessionId,
    onSuccess: txSuccess,
    onFail: txFail,
    onCancelled: txCancelled,
  });

  const resetBridgeDepositUI = () => {
    setErrGeneric(null);
    setLockDepositSuccessful(false);
    setBridgeDepositError(null);
    setSolanaDestinationAddress(null);
  };

  return (
    <>
      <Flex flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
        <Heading fontSize="36px" fontFamily="Clash-Medium" mt={14} mb={3}>
          Token Bridge
        </Heading>
        <Heading size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" mb={10}>
          Bridge ITHEUM tokens to external blockchains
        </Heading>

        <Flex direction="column" w="full">
          <Heading size="1rem" opacity=".8" fontFamily="Satoshi-Medium" mb={2}>
            Settings
          </Heading>
          <Box>Bridge Admin : {bridgeAdmin}</Box>
          <Box>Is Bridge Paused? {bridgeIsPaused.toString().toLocaleUpperCase()}</Box>
        </Flex>

        <Divider my={10} />

        <Flex direction="column" w="full">
          <Heading size="1rem" opacity=".8" fontFamily="Satoshi-Medium" mb={2}>
            Deposit tokens for Bridging
          </Heading>
          {errGeneric?.message && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>Bridge Deposit Error!</AlertTitle>
              {errGeneric?.message && (
                <Text fontSize="md">
                  <AlertDescription>{errGeneric.message}</AlertDescription>
                </Text>
              )}
              <CloseButton onClick={resetBridgeDepositUI} />
            </Alert>
          )}

          {lockDepositSuccessful && (
            <Alert status="success">
              <AlertIcon />
              Bridge Deposit was a success. Bridging to Solana in progress...
              <CloseButton onClick={resetBridgeDepositUI} />
            </Alert>
          )}

          <Box mt={5}>
            <Input
              maxW={350}
              mb={2}
              placeholder="Solana address to receive tokens"
              id="solanaAddress"
              defaultValue={solanaDestinationAddress}
              value={solanaDestinationAddress}
              onChange={(event) => setSolanaDestinationAddress(event.target.value.trim())}
            />

            <NumberInput
              size="lg"
              maxW={20}
              step={1}
              defaultValue={MIN_BRIDGE_DEPOSIT}
              min={MIN_BRIDGE_DEPOSIT}
              isValidCharacter={isValidNumericCharacter}
              max={MAX_BRIDGE_DEPOSIT}
              value={bridgeDeposit}
              onChange={(valueString) => {
                let error = "";
                const valueAsNumber = Number(valueString);

                if (valueAsNumber < MIN_BRIDGE_DEPOSIT) {
                  error = "Maximum deposit allowed is" + " " + MIN_BRIDGE_DEPOSIT;
                } else if (valueAsNumber > MAX_BRIDGE_DEPOSIT ? MAX_BRIDGE_DEPOSIT : 0) {
                  error = "Maximum deposit allowed is" + " " + MAX_BRIDGE_DEPOSIT;
                }

                if (error !== "") {
                  setBridgeDepositError(error);
                } else {
                  setBridgeDepositError(null);
                }

                if (valueAsNumber > 0) {
                  setBridgeDeposit(valueAsNumber);
                }
              }}
              keepWithinRange={false}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <Box my={2} h={5}>
              {bridgeDepositError && (
                <Text color="red.400" fontSize="xs">
                  {bridgeDepositError}
                </Text>
              )}
            </Box>

            <Button
              colorScheme="teal"
              variant="outline"
              isDisabled={lockingDeposit || bridgeDepositError !== null || solanaDestinationAddress === null}
              onClick={() => {
                handleOnChainLock();
              }}>
              Deposit Tokens
            </Button>

            <Box my={2} h={5}>
              {lockingDeposit && (
                <Text color="green.400" fontSize="xs">
                  {`Depositing ${bridgeDeposit} ITHEUM tokens for bridging to your solana address of ${solanaDestinationAddress}`}
                </Text>
              )}
            </Box>
          </Box>
        </Flex>

        <Divider my={10} />

        <Flex direction="column" w="full" mt={10}>
          <Heading size="1rem" opacity=".8" fontFamily="Satoshi-Medium" mb={2}>
            Past Deposits
          </Heading>
          {((loadingBridgeDepositTxs === -1 || loadingBridgeDepositTxs === -2) && (
            <Box minH="150" alignItems="center" display="flex" justifyContent="center">
              {loadingBridgeDepositTxs === -1 ? <Spinner size="lg" /> : <WarningTwoIcon />}
            </Box>
          )) || <DataTable columns={depositsTableColumns} data={bridgeDepositTxs} /> || (
              <Box minH="150" alignItems="center" display="flex" justifyContent="center">
                No bridge deposits yet...
              </Box>
            )}
        </Flex>
      </Flex>
    </>
  );
}
