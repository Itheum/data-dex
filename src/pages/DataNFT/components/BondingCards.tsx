import React, { useEffect, useState } from "react";
import { Button, Card, Flex, Heading, Stack, Text, VStack } from "@chakra-ui/react";
import { Bond, BondConfiguration, BondContract, Compensation, DataNft, dataNftTokenIdentifier } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { LivelinessScore } from "components/Liveliness/LivelinessScore";
import NftMediaComponent from "components/NftMediaComponent";
import { NoDataHere } from "components/Sections/NoDataHere";
import { IS_DEVNET } from "libs/config";
import { formatNumberToShort } from "libs/utils";

type CompensationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

export const BondingCards: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [allCompensation, setAllCompensation] = useState<Array<Compensation>>([]);
  const [nfmeIdNonce, setNfmeIdNonce] = useState<number>(0);

  DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");
  const [bondingOffers, setBondingOffers] = useState<Array<DataNft>>([]);

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
    (async () => {
      const itemsForCompensation: Array<CompensationNftsType> = [];
      const contractConfigurationRequest = await bondContract.viewContractConfiguration();

      const contractBondsReq = await bondContract.viewAllBonds();
      const myBonds = contractBondsReq.filter((bond) => bond.address === address);
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(myBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));

      myBonds.map((bond) => {
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });

      const compensation = await bondContract.viewCompensations(itemsForCompensation);

      setContractConfiguration(contractConfigurationRequest);
      setBondingOffers(dataNfts);
      setContractBonds(myBonds.reverse());
      setAllCompensation(compensation.reverse());
    })();
  }, [hasPendingTransactions]);

  const calculateNewPeriodAfterNewBond = (unbondTimestamp: number, lockPeriod: number) => {
    const newExpiry = new Date((unbondTimestamp + lockPeriod) * 1000);
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

  return (
    <Flex width="100%" flexWrap="wrap" gap={7} px={{ base: 0, md: 12 }} mt={10} backgroundColor={"2blue"}>
      <Heading fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200">
        Your Data NFT Liveliness Bonds
      </Heading>
      {bondingOffers.length === 0 ? (
        <NoDataHere />
      ) : (
        bondingOffers.map((dataNft) => {
          const contractBond = contractBonds.find((bond) => bond.nonce === dataNft.nonce && bond.tokenIdentifier === dataNft.collection)!;
          const contractCompensation = allCompensation.find((comp) => comp.nonce === dataNft.nonce && comp.tokenIdentifier === dataNft.collection)!;
          return (
            <Card bg="#1b1b1b50" border=".1rem solid" borderColor="#00C79740" borderRadius="3xl" p={5} w="100%" key={dataNft.nonce}>
              <Flex>
                <VStack m={6}>
                  <NftMediaComponent nftMedia={dataNft?.media} imageHeight="125px" imageWidth="125px" />
                  {nfmeIdNonce !== dataNft.nonce && (
                    <Button
                      colorScheme="teal"
                      onClick={() => {
                        const tx = bondContract.setVaultNonce(new Address(address), dataNft.nonce, dataNft.collection);
                        sendTransactions({
                          transactions: [tx],
                        });
                      }}>
                      Make this your Primary NFMe.ID
                    </Button>
                  )}
                </VStack>
                <Flex justifyContent="space-between" alignItems="center" px={4} w="full">
                  <Flex flexDirection="column" justifyContent="center" w="full">
                    <Text fontFamily="Clash-Medium" pb={3}>
                      {dataNft.tokenName}
                    </Text>
                    <LivelinessScore
                      key={dataNft.collection + dataNft.nonce}
                      unbondTimestamp={contractBond.unbondTimestamp}
                      lockPeriod={contractBond.lockPeriod}
                    />
                    <Flex gap={4} pt={3} alignItems="center">
                      <Button colorScheme="teal" px={6} onClick={() => renewBond(dataNft.collection, dataNft.nonce)}>
                        Renew Bond
                      </Button>
                      <Text>{`New expiry will be ${calculateNewPeriodAfterNewBond(contractBond.unbondTimestamp, contractBond.lockPeriod)}`}</Text>
                    </Flex>
                    <Flex gap={4} pt={3} alignItems="center">
                      {!checkIfBondIsExpired(contractBond.unbondTimestamp) ? (
                        <Button
                          colorScheme="red"
                          variant="outline"
                          textColor="indianred"
                          fontWeight="400"
                          isDisabled={
                            calculateRemainedAmountAfterPenalty(BigNumber(contractBond.remainingAmount), BigNumber(contractBond.bondAmount)) <= new BigNumber(0)
                          }
                          onClick={() => withdrawBonds(dataNft.collection, dataNft.nonce)}>
                          Withdraw Bond
                        </Button>
                      ) : (
                        <Button
                          colorScheme="teal"
                          variant="outline"
                          textColor="teal.200"
                          fontWeight="400"
                          onClick={() => withdrawBonds(dataNft.collection, dataNft.nonce)}>
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
                          <Text fontSize=".75rem" textColor="mediumpurple">
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
    </Flex>
  );
};
