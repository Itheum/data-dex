import React, { useEffect, useState } from "react";
import { Button, Card, Flex, Image, Stack, Text } from "@chakra-ui/react";
import { useMarketStore } from "../../../store";
import { ExtendedOffer } from "../../../libs/types";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { NoDataHere } from "../../../components/Sections/NoDataHere";
import { Bond, BondContract, Compensation, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { LivelinessScore } from "../../../components/Liveliness/LivelinessScore";
import BigNumber from "bignumber.js";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";

type CompensationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

export const BondingCards: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(chainID === "D" ? "devnet" : "mainnet");
  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
  const [bondingOffers, setBondingOffers] = useState<Array<DataNft>>([]);
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [allCompensation, setAllCompensation] = useState<Array<Compensation>>([]);

  // console.log(bondingOffers, contractBonds);
  useEffect(() => {
    (async () => {
      const itemsForCompensation: Array<CompensationNftsType> = [];

      const contractBonds = await bondContract.viewAllBonds();
      const myBonds = contractBonds.filter((bond) => bond.address === address);
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(myBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));

      myBonds.map((bond) => {
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });

      const compensation = await bondContract.viewCompensations(itemsForCompensation);

      setBondingOffers(dataNfts);
      setContractBonds(myBonds.reverse());
      setAllCompensation(compensation.reverse());
    })();
  }, [hasPendingTransactions]);

  const calculateNewPeriodAfterNewBond = (unboundTimestamp: number, lockPeriod: number) => {
    const newExpiry = new Date((unboundTimestamp + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };

  const checkIfBondIsExpired = (unboundTimestamp: number) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp > unboundTimestamp;
  };

  const renewBond = async (tokenIdentifier: string, nonce: number) => {
    const tx = bondContract.renew(new Address(address), tokenIdentifier, nonce);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const withdrawBonds = async (tokenIdentifier: string, nonce: number) => {
    const tx = bondContract.withdraw(new Address(address), tokenIdentifier, nonce);
    tx.setGasLimit(30000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  return (
    <Stack display="flex" flexDirection={{ base: "column" }} flexWrap={"wrap"} gap={7} mx={{ base: 0, md: 16 }} alignItems={"start"}>
      {bondingOffers.length === 0 ? (
        <NoDataHere />
      ) : (
        bondingOffers.map((dataNft, index) => (
          <Card bg="#1b1b1b50" border="1px solid" borderColor="#00C79740" borderRadius="3xl" p={5} w="100%" key={index}>
            <Flex>
              <Image src={dataNft.nftImgUrl} alt={dataNft.nftImgUrl} w="20%" h="auto" />
              <Flex justifyContent="space-between" alignItems="center" px={10} w="full">
                <Flex flexDirection="column" justifyContent="center" w="full">
                  <Text fontFamily="Clash-Medium" pb={3}>
                    {dataNft.tokenName}
                  </Text>
                  <LivelinessScore key={index} unboundTimestamp={contractBonds[index].unboundTimestamp} lockPeriod={contractBonds[index].lockPeriod} />
                  <Flex gap={4} pt={3} alignItems="center">
                    <Button colorScheme="teal" px={6} onClick={() => renewBond(dataNft.collection, dataNft.nonce)}>
                      Renew Bond
                    </Button>
                    <Text>{`New expiry will be ${calculateNewPeriodAfterNewBond(contractBonds[index].unboundTimestamp, contractBonds[index].lockPeriod)}`}</Text>
                  </Flex>
                  <Flex gap={4} pt={3} alignItems="center">
                    {!checkIfBondIsExpired(contractBonds[index].unboundTimestamp) ? (
                      <Button
                        colorScheme="red"
                        variant="outline"
                        textColor="indianred"
                        fontWeight="400"
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
                          {BigNumber(contractBonds[index].bondAmount)
                            .dividedBy(10 ** 18)
                            .toNumber()}
                          &nbsp;$ITHEUM Bonded
                        </Text>
                        <Text fontSize=".75rem">|</Text>
                        <Text fontSize=".75rem" textColor="indianred">
                          {BigNumber(allCompensation[index].accumulatedAmount)
                            .dividedBy(10 ** 18)
                            .toNumber()}
                          &nbsp;$ITHEUM Penalized
                        </Text>
                        <Text fontSize=".75rem">|</Text>
                        <Text fontSize=".75rem" textColor="mediumpurple">
                          {BigNumber(contractBonds[index].remainingAmount)
                            .dividedBy(10 ** 18)
                            .toNumber()}
                          &nbsp;$ITHEUM Remaining
                        </Text>
                      </Flex>
                      {!checkIfBondIsExpired(contractBonds[index].unboundTimestamp) ? (
                        <Text textColor="indianred" fontSize="sm">
                          You can withdraw bond with 80% Penalty
                        </Text>
                      ) : (
                        <Text textColor="teal.200" fontSize="sm">
                          You can withdraw your full bond with no penalty
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        ))
      )}
    </Stack>
  );
};
