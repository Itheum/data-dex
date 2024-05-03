import React, { useEffect, useState } from "react";
import { BondContract, Compensation, DataNft, Refund } from "@itheum/sdk-mx-data-nft/out";
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

type ArrayTest = {
  compensation: Compensation;
  dataNft: DataNft;
};

export const CompensationCards: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [compensation, setCompensation] = useState<Array<Compensation>>([]);
  const [compensationDataNft, setCompensationDataNft] = useState<Array<ArrayTest>>([]);
  const [compensationRefund, setCompensationRefund] = useState<Record<any, any>>({});

  const checkIf24HHasPassed = (endDate: number) => {
    const currentTime = new Date().getTime();
    const endDateInMs = endDate * 1000;
    const differenceInMs = currentTime - endDateInMs;
    return differenceInMs <= 86400000 || endDate === 0;
  };

  useEffect(() => {
    (async () => {
      const itemsForCompensation: Array<CompensationNftsType> = [];
      const contractBonds = await bondContract.viewAllBonds();
      const dataNfts: DataNft[] = await DataNft.ownedByAddress(address, ["DATANFTFT-e0b917"]);

      contractBonds.map((bond) => {
        if (bond.address !== address) return;
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });
      if (contractBonds.length === 0) {
        return;
      }
      const _compensation = await bondContract.viewCompensations(itemsForCompensation);

      const filteredData2 = [];
      for (const compensation of _compensation) {
        const filteredData = dataNfts.find((dataNft) => dataNft.nonce === compensation.nonce);
        if (filteredData) {
          filteredData2.push({ compensation: compensation, dataNft: filteredData });
        }
      }

      const data = await bondContract.viewAddressRefundForCompensation(new Address(address), "DATANFTFT-e0b917", 267);

      setCompensation(_compensation.reverse());
      setCompensationDataNft(filteredData2.reverse());
      setCompensationRefund(data);
    })();
  }, [hasPendingTransactions]);

  const handleDeposit = async (tokenIdentifier: string, nonce: number, amount: BigNumber.Value) => {
    const payments = { amount: amount, nonce: nonce, tokenIdentifier: tokenIdentifier };
    const tx = bondContract.proof(new Address(address), payments);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const handleClaim = async (tokenIdentifier: string, nonce: number) => {
    const tx = bondContract.claimRefund(new Address(address), tokenIdentifier, nonce);
    await sendTransactions({
      transactions: [tx],
    });
  };

  return (
    <>
      <Flex>
        {compensation.length === 0 ? (
          <Text>No compensation available</Text>
        ) : (
          <Flex flexDirection="column" gap={6} w="full" px={14}>
            {compensationDataNft.map((comp, index) => {
              return (
                <Flex key={index} w="full" flexDirection={{ base: "column", md: "row" }} alignItems="center" gap={6}>
                  <img src={comp.dataNft.nftImgUrl} alt="NFT" width="150rem" height="150rem" />
                  <Flex flexDirection="column" gap={1}>
                    <Text fontSize="2xl">You have some $ITHEUM compensation to claim on this Data NFT!</Text>
                    <Flex gap={2} alignItems="center">
                      <Text fontSize="2xl">Token Name:</Text>
                      <Text fontSize="xl" textColor="teal.200">
                        {comp.dataNft.tokenName}
                      </Text>
                    </Flex>
                    <Flex gap={2} alignItems="center">
                      <Text fontSize="2xl">Supply:</Text>
                      <Text fontSize="xl" textColor="teal.200">
                        {Number(comp.dataNft.balance)}
                      </Text>
                    </Flex>
                    {comp.compensation.endDate === 0 ? (
                      <Text fontSize="2xl">No date for deposit set yet</Text>
                    ) : (
                      <Flex gap={2} alignItems="center">
                        <Text fontSize="2xl">Deposit this Data NFT before: </Text>
                        <Text fontSize="xl" textColor="teal.200">
                          {new Date(comp.compensation.endDate * 1000).toLocaleString()}
                        </Text>
                      </Flex>
                    )}
                    <Flex gap={3} flexDirection={{ base: "column", md: "row" }}>
                      <Button
                        variant="outline"
                        colorScheme="teal"
                        isDisabled={comp.compensation.endDate * 1000 + 86400 < new Date().getTime()}
                        onClick={() => handleDeposit(comp.dataNft.collection, comp.dataNft.nonce, comp.dataNft.balance)}>
                        Deposit all Data Nft to Claim $ITHEUM
                      </Button>
                      <Button
                        variant="outline"
                        colorScheme="teal"
                        isDisabled={checkIf24HHasPassed(comp.compensation.endDate) || Number(comp.compensation.accumulatedAmount) === 0}
                        onClick={() => handleClaim(comp.dataNft.collection, comp.dataNft.nonce)}>
                        Claim back your Data NFT +&nbsp;
                        {Number(comp.compensation.accumulatedAmount) !== 0 && Number(comp.compensation.proofAmount) !== 0
                          ? (BigNumber(comp.compensation.accumulatedAmount)
                              .dividedBy(10 ** 18)
                              .toNumber() /
                              Number(comp.compensation.proofAmount)) *
                            Number(compensationRefund.refund?.proofOfRefund.amount)
                          : 0}
                        &nbsp;$ITHEUM
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
