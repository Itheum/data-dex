import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Flex,
  Heading,
  Alert,
  Text,
  Stack,
  AlertTitle,
  AlertIcon,
  AlertDescription,
  Spinner,
  Box,
  UnorderedList,
  ListItem,
  useColorMode,
} from "@chakra-ui/react";
import { Bond, BondConfiguration, Compensation, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { LivelinessScore } from "components/Liveliness/LivelinessScore";
import NftMediaComponent from "components/NftMediaComponent";
import { NoDataHere } from "components/Sections/NoDataHere";
import { ConfirmationDialog } from "components/UtilComps/ConfirmationDialog";
import { formatNumberToShort } from "libs/utils";
import { useNftsStore } from "store/nfts";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

// type CompensationNftsType = {
//   nonce: number;
//   tokenIdentifier: string;
// };

export const BondingCardsSol: React.FC = () => {
  const { colorMode } = useColorMode();
  const { connection } = useConnection();
  const { publicKey: userPublicKey, wallet, signTransaction, sendTransaction } = useWallet();

  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [allCompensation, setAllCompensation] = useState<Array<Compensation>>([]);

  const [nfmeIdNonce, setNfmeIdNonce] = useState<string>("");
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState<any>(null);
  const [allInfoLoading, setAllInfoLoading] = useState<boolean>(true);
  const [withdrawBondConfirmationWorkflow, setWithdrawBondConfirmationWorkflow] = useState<any>(null);
  const [withdrawPenalty, setWithdrawPenalty] = useState<number>(0);
  //   DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");
  const [bondingOffers, setBondingOffers] = useState<Array<DataNft>>([]);
  //   const [dataNftsWithNoBond, setDataNftsWithNoBond] = useState<Array<DataNft>>([]);
  const { solNfts } = useNftsStore();
  console.log("solNfts", solNfts);
  const [contractConfiguration, setContractConfiguration] = useState<BondConfiguration>({
    contractState: 0,
    bondPaymentTokenIdentifier: "",
    lockPeriodsWithBonds: [
      {
        lockPeriod: 0,
        amount: 0,
      },
    ],
    minimumPenalty: 0,
    maximumPenalty: 0,
    withdrawPenalty: 0,
    acceptedCallers: [""],
  });

  useEffect(() => {
    async function fetchNfmeId() {
      ///todo ask how ala care are 1 ?
      setNfmeIdNonce("IDDDD123");
    }

    fetchNfmeId();
  }, [userPublicKey]);

  useEffect(() => {
    (async () => {
      setAllInfoLoading(false);
    })();
  }, []);

  const calculateNewPeriodAfterNewBond = (lockPeriod: number) => {
    const nowTSInSec = Math.round(Date.now() / 1000);
    const newExpiry = new Date((nowTSInSec + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };

  const calculateRemainedAmountAfterPenalty = (remainedAmount: BigNumber, afterPenaltyAmount: BigNumber): BigNumber.Value => {
    // return remainedAmount
    //   .minus(afterPenaltyAmount.multipliedBy(contractConfiguration.withdrawPenalty / 10000))
    //   .dividedBy(10 ** 18)
    //   .toNumber()
    return 1;
  };

  const checkIfBondIsExpired = (unbondTimestamp: number) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp > unbondTimestamp;
  };

  const renewBond = async (tokenIdentifier: string, nonce: number) => {};

  const withdrawBonds = async (tokenIdentifier: string, nonce: number) => {};
  function SetPrimaryNFMeId(id: string) {
    throw new Error("Function not implemented.");
  }
  return (
    <Flex width="100%" flexWrap="wrap" gap={7} px={{ base: 0, md: 12 }} mt={10}>
      <Heading fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200" textAlign={{ base: "center", md: "left" }}>
        Your Data NFT Liveliness Bonds
      </Heading>

      {errDataNFTStreamGeneric && (
        <Alert status="error">
          <Stack>
            <AlertTitle fontSize="md">
              <AlertIcon mb={2} />
              Error
            </AlertTitle>
            {errDataNFTStreamGeneric.message && <AlertDescription fontSize="md">{errDataNFTStreamGeneric.message}</AlertDescription>}
          </Stack>
        </Alert>
      )}

      {/* {allInfoLoading ? (
        <Flex w="100%" h="20rem" justifyContent="center" alignItems="center">
          <Spinner size="md" color="teal.200" />
        </Flex>
      ) : (
        <>
          <>
            {solNfts.length === 0 ? (
              <NoDataHere imgFromTop="2" />
            ) : (
              solNfts.map((dataNft, index) => {
                const metadata = dataNft.content.metadata;
                return (
                  <Card
                    key={index}
                    bg={colorMode === "dark" ? "#1b1b1b50" : "white"}
                    border=".1rem solid"
                    borderColor="#00C79740"
                    borderRadius="3xl"
                    p={5}
                    w="100%">
                    <Flex flexDirection={{ base: "column", md: "row" }}>
                      <Box minW="250px" textAlign="center">
                        <Box minH="263px">
                          <NftMediaComponent
                            imageUrls={[dataNft.content.links ? (dataNft.content.links["image"] as string) : "///todoAddDefaultImage"]}
                            // nftMedia={[dataNft.content.links ? (dataNft.content.links["image"] as string) : "///todo"]}
                            imageHeight="220px"
                            imageWidth="220px"
                            borderRadius="10px"
                          />
                        </Box>
                        <Box>
                          {nfmeIdNonce !== dataNft.id ? (
                            <Button
                              colorScheme="teal"
                              isDisabled={!userPublicKey}
                              onClick={() => {
                                SetPrimaryNFMeId(dataNft.id);
                              }}>
                              Set as Primary NFMe ID
                            </Button>
                          ) : (
                            <Text fontSize="md" w="200px" m="auto">
                              ✅ Currently set as your Primary NFMe ID
                            </Text>
                          )}
                        </Box>
                      </Box>
                      <Flex ml={{ md: "3" }} justifyContent="space-between" alignItems="center" w="full">
                        <Flex flexDirection="column" justifyContent="center" w="full">
                          <Text fontFamily="Clash-Medium" mt={{ base: 3, md: "auto" }}>
                            {metadata.name}
                          </Text>
                          <Text fontSize="sm" pb={3}>
                            {`Id: ${dataNft.id}`}
                          </Text>
                          <LivelinessScore
                            key={dataNft.id}
                            unbondTimestamp={1} //contractBond.unbondTimestamp}
                            lockPeriod={1} //contractBond.lockPeriod}
                            showExpiryDate={true}
                          />
                          <Flex gap={4} pt={3} alignItems="center">
                            <Button colorScheme="teal" px={6} isDisabled={!userPublicKey} onClick={() => renewBond(dataNft.collection, dataNft.nonce)}>
                              Renew Bond
                            </Button>
                            <Text
                              fontSize={{
                                base: "sm",
                                md: "md",
                              }}>{`New expiry will be ${calculateNewPeriodAfterNewBond(contractBond.lockPeriod)}`}</Text>
                          </Flex>
                          <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={3} alignItems="center">
                            {!checkIfBondIsExpired(contractBond.unbondTimestamp) ? (
                              <Button
                                colorScheme="red"
                                variant="outline"
                                textColor="indianred"
                                fontWeight="400"
                                isDisabled={
                                  !userPublicKey ||
                                  calculateRemainedAmountAfterPenalty(BigNumber(contractBond.remainingAmount), BigNumber(contractBond.bondAmount)) <=
                                    new BigNumber(0)
                                }
                                onClick={() => {
                                  setWithdrawBondConfirmationWorkflow({ collection: dataNft.collection, nonce: dataNft.nonce });
                                }}>
                                Withdraw Bond
                              </Button>
                            ) : (
                              <Button
                                colorScheme="teal"
                                variant="outline"
                                textColor="teal.200"
                                fontWeight="400"
                                isDisabled={false}
                                onClick={() => {
                                  setWithdrawBondConfirmationWorkflow({ collection: dataNft.collection, nonce: dataNft.nonce });
                                }}>
                                Withdraw Bond
                              </Button>
                            )}
                            <Flex flexDirection="column" gap={1}>
                              <Flex flexDirection="row" gap={4}>
                                <Text fontSize=".75rem" textColor="teal.200">
                                  {formatNumberToShort(
                                    BigNumber(contractBond.bondAmount)
                                      .dividedBy(10 ** 18)
                                      .toNumber()
                                  )}
                                  &nbsp;$ITHEUM Bonded
                                </Text>
                                <Text fontSize=".75rem">|</Text>
                                <Text fontSize=".75rem" textColor="indianred">
                                  {formatNumberToShort(
                                    BigNumber(contractCompensation.accumulatedAmount)
                                      .dividedBy(10 ** 18)
                                      .toNumber()
                                  )}
                                  &nbsp;$ITHEUM Penalized
                                </Text>
                                <Text fontSize=".75rem">|</Text>
                                <Text fontSize=".75rem" textColor="#39bdf8">
                                  {formatNumberToShort(
                                    BigNumber(contractBond.remainingAmount)
                                      .dividedBy(10 ** 18)
                                      .toNumber()
                                  )}
                                  &nbsp;$ITHEUM Remaining
                                </Text>
                              </Flex>
                              {!checkIfBondIsExpired(contractBond.unbondTimestamp) ? (
                                <>
                                  {calculateRemainedAmountAfterPenalty(BigNumber(contractBond.remainingAmount), BigNumber(contractBond.bondAmount)) >=
                                  new BigNumber(0) ? (
                                    <Text textColor="indianred" fontSize="sm">
                                      You can withdraw bond with {withdrawPenalty / 100}% Penalty
                                    </Text>
                                  ) : (
                                    <Text textColor="indianred" fontSize="sm">
                                      You cant withdraw because {withdrawPenalty / 100}% Penalty is greater than your remaining bond.
                                    </Text>
                                  )}
                                </>
                              ) : (
                                <Text textColor="teal.200" fontSize="sm">
                                  You can withdraw{" "}
                                  {BigNumber(contractBond.remainingAmount)
                                    .dividedBy(10 ** 18)
                                    .toNumber()}{" "}
                                  $ITHEUM with no penalty
                                </Text>
                              )}
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })
            )}
          </>
        </>
      )} */}

      {/* Confirmation Dialogs for actions that need explanation */}
      <>
        <ConfirmationDialog
          isOpen={withdrawBondConfirmationWorkflow !== null}
          onCancel={() => {
            setWithdrawBondConfirmationWorkflow(null);
          }}
          onProceed={() => {
            withdrawBonds(withdrawBondConfirmationWorkflow.collection, withdrawBondConfirmationWorkflow.nonce);
            setWithdrawBondConfirmationWorkflow(null);
          }}
          bodyContent={
            <>
              <Text fontSize="sm" pb={3} opacity=".8">
                {`Collection: ${withdrawBondConfirmationWorkflow?.collection}, Nonce: ${withdrawBondConfirmationWorkflow?.nonce}`}
              </Text>
              <Text mb="5">There are a few items to consider before you proceed with the bond withdraw:</Text>
              <UnorderedList mt="2" p="2">
                <ListItem>Withdrawing before bond expiry incurs a penalty; no penalty after expiry, and you get the full amount back.</ListItem>
                <ListItem>Penalties are non-refundable.</ListItem>
                <ListItem>After withdrawal, your Liveliness score drops to zero, visible to buyers if your Data NFT is listed.</ListItem>
                <ListItem>Once withdrawn, you {`can't `}re-bond to regain the Liveliness score or earn staking rewards.</ListItem>
                <ListItem>If the bond was linked to your Primary NFMe ID Vault, {`you'll`} need to set up a new one as your primary.</ListItem>
              </UnorderedList>

              <Text mt="5">With the above in mind, are your SURE you want to proceed and Withdraw Bond?</Text>
            </>
          }
          dialogData={{
            title: "Are you sure you want to Withdraw Bond?",
            proceedBtnTxt: "Proceed with Withdraw Bond",
            cancelBtnText: "Cancel and Close",
            proceedBtnColorScheme: "red",
          }}
        />
      </>
    </Flex>
  );
};
