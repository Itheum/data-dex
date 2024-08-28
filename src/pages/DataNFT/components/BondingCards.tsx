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
  WrapItem,
  Wrap,
  UnorderedList,
  ListItem,
  useColorMode,
} from "@chakra-ui/react";
import { Bond, BondConfiguration, BondContract, Compensation, DataNft, dataNftTokenIdentifier } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { LivelinessScore } from "components/Liveliness/LivelinessScore";
import NftMediaComponent from "components/NftMediaComponent";
import { NoDataHere } from "components/Sections/NoDataHere";
import { ConfirmationDialog } from "components/UtilComps/ConfirmationDialog";
import { IS_DEVNET } from "libs/config";
import { contractsForChain } from "libs/config";
import { labels } from "libs/language";
import { getNftsOfACollectionForAnAddress } from "libs/MultiversX/api";
import { formatNumberToShort } from "libs/utils";

type CompensationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

export const BondingCards: React.FC = () => {
  const { chainID } = useGetNetworkConfig();
  const { colorMode } = useColorMode();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [allCompensation, setAllCompensation] = useState<Array<Compensation>>([]);
  const [nfmeIdNonce, setNfmeIdNonce] = useState<number>(0);
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState<any>(null);
  const [allInfoLoading, setAllInfoLoading] = useState<boolean>(true);
  const [withdrawBondConfirmationWorkflow, setWithdrawBondConfirmationWorkflow] = useState<any>(null);

  DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");
  const [bondingOffers, setBondingOffers] = useState<Array<DataNft>>([]);
  const [dataNftsWithNoBond, setDataNftsWithNoBond] = useState<Array<DataNft>>([]);

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
    if (hasPendingTransactions) return;

    async function fetchNfmeId() {
      const envNetwork = import.meta.env.VITE_ENV_NETWORK as string;
      const nfmeIdNonceT = await bondContract.viewAddressVaultNonce(
        new Address(address),
        envNetwork === "mainnet" ? dataNftTokenIdentifier.mainnet : dataNftTokenIdentifier.devnet
      );
      setNfmeIdNonce(nfmeIdNonceT);
    }
    fetchNfmeId();
  }, [address, hasPendingTransactions]);

  useEffect(() => {
    if (hasPendingTransactions) return;

    (async () => {
      setAllInfoLoading(true);

      // get all the users data NFTs (so we know which ones they withdrew)
      const allMyDataNFTs = await getOnChainNFTs();
      const allMyDataNFTsWithBalance = allMyDataNFTs.map((nft) => new DataNft({ ...nft, balance: nft.balance ? nft.balance : 1 }));

      const itemsForCompensation: Array<CompensationNftsType> = [];
      const contractConfigurationRequest = await bondContract.viewContractConfiguration();

      const contractBondsReq = await bondContract.viewAllBonds();
      const myBonds = contractBondsReq.filter((bond) => bond.address === address);

      let bondedDataNfts: DataNft[] = [];

      console.log("S: myBonds ---->");
      console.log(myBonds);

      // make a list of nonces that are in bonds so we can filter out allMyDataNFTsWithBalance
      const bondsNonceList = myBonds.map((i: any) => i.nonce);
      console.log(bondsNonceList);
      console.log("E: myBonds ---->");

      // a list of Data NFTs the user never put a bond on OR they withdrew the bond and "exited"
      const myDataNFTsThatHaveNoBonds = allMyDataNFTsWithBalance.filter((nft) => !bondsNonceList.includes(nft.nonce));

      try {
        bondedDataNfts = await DataNft.createManyFromApi(myBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));
      } catch (e) {
        console.error(e);
        setErrDataNFTStreamGeneric(new Error(labels.ERR_BONDING_STAKING_COULD_NOT_GET_DATA_NFTS));
      }

      myBonds.map((bond) => {
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });

      const compensation = await bondContract.viewCompensations(itemsForCompensation);

      setContractConfiguration(contractConfigurationRequest);
      setBondingOffers(bondedDataNfts);
      setDataNftsWithNoBond(myDataNFTsThatHaveNoBonds);
      setContractBonds(myBonds.reverse());
      setAllCompensation(compensation.reverse());

      console.log("S: bondedDataNfts ---->");
      console.log(bondedDataNfts);
      console.log("E: bondedDataNfts ---->");

      console.log("S: myDataNFTsThatHaveNoBonds ---->");
      console.log(myDataNFTsThatHaveNoBonds);
      console.log("E: myDataNFTsThatHaveNoBonds ---->");

      setAllInfoLoading(false);
    })();
  }, [hasPendingTransactions]);

  const calculateNewPeriodAfterNewBond = (lockPeriod: number) => {
    const nowTSInSec = Math.round(Date.now() / 1000);
    const newExpiry = new Date((nowTSInSec + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };

  const calculateRemainedAmountAfterPenalty = (remainedAmount: BigNumber, afterPenaltyAmount: BigNumber): BigNumber.Value => {
    return remainedAmount
      .minus(afterPenaltyAmount.multipliedBy(contractConfiguration.withdrawPenalty / 10000))
      .dividedBy(10 ** 18)
      .toNumber();
  };

  const checkIfBondIsExpired = (unbondTimestamp: number) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp > unbondTimestamp;
  };

  const renewBond = async (tokenIdentifier: string, nonce: number) => {
    console.log(tokenIdentifier, nonce);
    const tx = bondContract.renew(new Address(address), tokenIdentifier, nonce);
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const withdrawBonds = async (tokenIdentifier: string, nonce: number) => {
    const tx = bondContract.withdraw(new Address(address), tokenIdentifier, nonce);
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const getOnChainNFTs = async () => {
    const dataNftsT: DataNft[] = await getNftsOfACollectionForAnAddress(
      address,
      contractsForChain(chainID).dataNftTokens.map((v) => v.id),
      chainID
    );
    return dataNftsT;
  };

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

      {allInfoLoading ? (
        <Flex w="100%" h="20rem" justifyContent="center" alignItems="center">
          <Spinner size="md" color="teal.200" />
        </Flex>
      ) : (
        <>
          <>
            {bondingOffers.length === 0 ? (
              <NoDataHere imgFromTop="2" />
            ) : (
              bondingOffers.map((dataNft) => {
                const contractBond = contractBonds.find((bond) => bond.nonce === dataNft.nonce && bond.tokenIdentifier === dataNft.collection)!;
                const contractCompensation = allCompensation.find((comp) => comp.nonce === dataNft.nonce && comp.tokenIdentifier === dataNft.collection)!;

                return (
                  <Card
                    key={dataNft.nonce}
                    bg={colorMode === "dark" ? "#1b1b1b50" : "white"}
                    border=".1rem solid"
                    borderColor="#00C79740"
                    borderRadius="3xl"
                    p={5}
                    w="100%">
                    <Flex flexDirection={{ base: "column", md: "row" }}>
                      <Box minW="250px" textAlign="center">
                        <Box minH="263px">
                          <NftMediaComponent nftMedia={dataNft?.media} imageHeight="220px" imageWidth="220px" borderRadius="10px" />
                        </Box>
                        <Box>
                          {nfmeIdNonce !== dataNft.nonce ? (
                            <Button
                              colorScheme="teal"
                              isDisabled={address === "" || hasPendingTransactions}
                              onClick={() => {
                                const tx = bondContract.setVaultNonce(new Address(address), dataNft.nonce, dataNft.collection);
                                sendTransactions({
                                  transactions: [tx],
                                });
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
                            {dataNft.tokenName}
                          </Text>
                          <Text fontSize="sm" pb={3}>
                            {`Collection: ${dataNft.collection}, Nonce: ${dataNft.nonce}`}
                          </Text>
                          <LivelinessScore
                            key={dataNft.collection + dataNft.nonce}
                            unbondTimestamp={contractBond.unbondTimestamp}
                            lockPeriod={contractBond.lockPeriod}
                          />
                          <Flex gap={4} pt={3} alignItems="center">
                            <Button
                              colorScheme="teal"
                              px={6}
                              isDisabled={address === "" || hasPendingTransactions}
                              onClick={() => renewBond(dataNft.collection, dataNft.nonce)}>
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
                                  address === "" ||
                                  hasPendingTransactions ||
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
                                isDisabled={address === "" || hasPendingTransactions}
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
                                      You can withdraw bond with {contractConfiguration.withdrawPenalty / 100}% Penalty
                                    </Text>
                                  ) : (
                                    <Text textColor="indianred" fontSize="sm">
                                      You cant withdraw because {contractConfiguration.withdrawPenalty / 100}% Penalty is greater than your remaining bond.
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

          <Box my="10">
            {dataNftsWithNoBond?.length > 0 && (
              <>
                <Heading fontSize="1.2rem" fontFamily="Clash-Medium" color="teal.200" textAlign={{ base: "center", md: "left" }}>
                  Data NFTs With No Liveliness Bond
                </Heading>
                <Wrap justify={{ base: "center", md: "start" }} align="start" spacing={4} w="100%" h="100%" p={4}>
                  {dataNftsWithNoBond.map((dataNft) => {
                    return (
                      <WrapItem key={dataNft.nonce}>
                        <Card
                          key={dataNft.nonce}
                          bg={colorMode === "dark" ? "#1b1b1b50" : "white"}
                          border=".1rem solid"
                          borderColor="#00C79740"
                          borderRadius="3xl"
                          p={5}>
                          <Flex flexDirection={{ base: "column", md: "row" }}>
                            <Box minW="200px" minH="345px" textAlign="center">
                              <Text fontFamily="Clash-Medium" pb={3} mt={{ base: 3, md: "auto" }}>
                                {dataNft.tokenName}
                              </Text>
                              <NftMediaComponent nftMedia={dataNft?.media} imageHeight="180px" imageWidth="180px" borderRadius="5px" />

                              {nfmeIdNonce === dataNft.nonce && (
                                <Text fontSize="sm" w="200px" m="auto">
                                  ⚠️ This is Currently set as your Primary NFMe ID. Select and set another Data NFT with an active bond as your Primary NFT ID
                                  by using the {"'Set as Primary NFMe ID'"} above.
                                </Text>
                              )}
                            </Box>
                          </Flex>
                        </Card>
                      </WrapItem>
                    );
                  })}
                </Wrap>
              </>
            )}
          </Box>
        </>
      )}

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
