import React, { useEffect, useState } from "react";
import { BondContract, Compensation, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { IS_DEVNET } from "../../../libs/config";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { Button, Flex, Text } from "@chakra-ui/react";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";

type CompensationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

export const CompensationCards: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [compensation, setCompensation] = useState<Array<Compensation>>([]);
  const [compensationDataNft, setCompensationDataNft] = useState<Array<DataNft>>([]);

  const checkIf24HHasPassed = (endDate: number) => {
    const currentTime = new Date().getTime();
    const endDateInMs = endDate * 1000;
    const differenceInMs = currentTime - endDateInMs;
    // console.log(differenceInMs, currentTime, endDateInMs);
    return differenceInMs >= 86400000 || differenceInMs < 0;
  };

  useEffect(() => {
    (async () => {
      const itemsForCompensation: Array<CompensationNftsType> = [];
      const contractBonds = await bondContract.viewAllBonds();
      console.log("contractBonds", contractBonds);
      contractBonds.map((bond) => {
        if (bond.address !== address) return;
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });
      if (contractBonds.length === 0) {
        return;
      }
      const _compensation = await bondContract.viewCompensations(itemsForCompensation);
      console.log(compensation);
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(
        _compensation.map((_comp) => ({ nonce: _comp.nonce, tokenIdentifier: _comp.tokenIdentifier }))
      );

      setCompensation(_compensation.reverse());
      setCompensationDataNft(dataNfts);
      // console.log("compensation", new Date().getTime());
    })();
  }, [hasPendingTransactions]);

  const handleDeposit = async (tokenIdentifier: string, nonce: number, amount: BigNumber.Value) => {
    const payments = { amount: amount, nonce: nonce, tokenIdentifier: tokenIdentifier };
    const tx = bondContract.proof(new Address(address), payments);
    await sendTransactions({
      transactions: [tx],
    });
  };

  console.log(compensation);
  console.log(compensationDataNft);
  return (
    <>
      <Flex>
        {compensation.length === 0 ? (
          <Text>No compensation available</Text>
        ) : (
          <Flex flexDirection="column" gap={6} w="full">
            {compensation.map((comp, index) => {
              return (
                <Flex key={index} w="full" gap={6}>
                  <img src={compensationDataNft[index].nftImgUrl} alt="NFT" width="150rem" height="150rem" />
                  <Flex flexDirection="column" gap={1}>
                    <Text fontSize="2xl">You have some $ITHEUM compensation to claim on this Data NFT!</Text>
                    <Flex gap={2}>
                      <Text fontSize="2xl">Token Name:</Text>
                      <Text fontSize="2xl" textColor="teal.200">
                        {compensationDataNft[index].tokenName}
                      </Text>
                    </Flex>
                    <Flex gap={2}>
                      <Text fontSize="2xl">Supply:</Text>
                      <Text fontSize="2xl" textColor="teal.200">
                        {Number(compensationDataNft[index].supply)}
                      </Text>
                    </Flex>
                    {comp.endDate === 0 ? (
                      <Text fontSize="2xl">No date for deposit set yet</Text>
                    ) : (
                      <Flex gap={2}>
                        <Text fontSize="2xl">Deposit this Data NFT before: </Text>
                        <Text fontSize="2xl" textColor="teal.200">
                          {new Date(comp.endDate * 1000).toLocaleString()}
                        </Text>
                      </Flex>
                    )}
                    <Flex gap={3}>
                      <Button
                        variant="outline"
                        colorScheme="teal"
                        isDisabled={comp.endDate * 1000 + 86400 < new Date().getTime()}
                        onClick={() =>
                          handleDeposit(compensationDataNft[index].collection, compensationDataNft[index].nonce, compensationDataNft[index].supply)
                        }>
                        Deposit all Data Nft to Claim $ITHEUM
                      </Button>
                      <Button variant="outline" colorScheme="teal" isDisabled={checkIf24HHasPassed(comp.endDate)}>
                        Claim back your Data NFT + 38 $ITHEUM
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>
    </>
  );
};
