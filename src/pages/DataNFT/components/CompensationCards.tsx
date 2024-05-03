import React, { useEffect, useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { Bond, BondContract, Compensation, DataNft, Refund } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { IS_DEVNET, contractsForChain } from "../../../libs/config";

type CompensationNftPair = {
  compensation: Compensation;
  dataNft: DataNft;
};

export const CompensationCards: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [compensationPairs, setCompensationPairs] = useState<Array<CompensationNftPair>>([]);
  const [compensationRefund, setCompensationRefund] = useState<Record<number, Refund>>({});

  const havePassed24h = (endDate: number) => {
    const currentTime = new Date().getTime();
    const endDateInMs = endDate * 1000;
    const differenceInMs = currentTime - endDateInMs;
    return differenceInMs <= 86400000 || endDate === 0;
  };

  useEffect(() => {
    (async () => {
      const contractBonds = await bondContract.viewAllBonds();
      const dataNftTicker = contractsForChain(chainID).dataNftTokens[0].id;
      const dataNfts: DataNft[] = await DataNft.ownedByAddress(address, [dataNftTicker]);

      const compensationsT = await getLoggedAddressCompensations(bondContract, contractBonds, address);

      const { compsInScT, compPairsT }: { compsInScT: Compensation[]; compPairsT: CompensationNftPair[] } = getNftsForCompensations(compensationsT, dataNfts);

      const refundObjT: Record<number, Refund> = await getRefundsObject(bondContract, address, compsInScT);

      const nftsInScT = compsInScT.map((comp) => {
        return { nonce: comp.nonce, tokenIdentifier: comp.tokenIdentifier };
      });
      const dataNftsInScT = await DataNft.createManyFromApi(nftsInScT);
      for (const compT of compsInScT) {
        const dataNftForComp = dataNftsInScT.find((dataNft) => dataNft.nonce === compT.nonce && dataNft.collection === compT.tokenIdentifier);
        if (dataNftForComp) {
          const refundForComp = refundObjT[compT.compensationId];
          dataNftForComp.updateDataNft({ balance: Number(refundForComp.proofOfRefund.amount) });
          const compNftPair: CompensationNftPair = { compensation: compT, dataNft: dataNftForComp };
          compPairsT.push(compNftPair);
        }
      }
      console.log(
        compPairsT.filter((pair) => pair.compensation.endDate > 0),
        refundObjT
      );
      setCompensationRefund(refundObjT);
      setCompensationPairs(compPairsT);
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
        {compensationPairs.length === 0 ? (
          <Text>No compensation available</Text>
        ) : (
          <Flex flexDirection="column" gap={6} w="full" px={14}>
            {compensationPairs
              .filter((pair) => pair.compensation.endDate > 0)
              .map((item, index) => {
                const proofAmount = compensationRefund[item.compensation.compensationId]
                  ? Number(compensationRefund[item.compensation.compensationId].proofOfRefund.amount)
                  : 0;
                return (
                  <Flex key={index} w="full" flexDirection={{ base: "column", md: "row" }} alignItems="center" gap={6}>
                    <img src={item.dataNft.nftImgUrl} alt="NFT" width="150rem" height="150rem" />
                    <Flex flexDirection="column" gap={1}>
                      <Text fontSize="2xl">
                        {item.compensation.endDate * 1000 < new Date().getTime() ? (
                          proofAmount === 0 ? (
                            <>You were eligible for compensation, but you did not deposit the Data NFT for proof</>
                          ) : (
                            <> You have some $ITHEUM compensation to claim on this Data NFT!</>
                          )
                        ) : (
                          <>You can deposit this Data NFT as proof for your $ITHEUM compensation</>
                        )}
                      </Text>
                      <Flex gap={2} alignItems="center">
                        <Text fontSize="2xl">Token Name:</Text>
                        <Text fontSize="xl" textColor="teal.200">
                          {item.dataNft.tokenName}
                        </Text>
                      </Flex>
                      <Flex gap={2} alignItems="center">
                        <Text fontSize="2xl">Supply:</Text>
                        <Text fontSize="xl" textColor="teal.200">
                          {Number(item.dataNft.balance)}
                        </Text>
                      </Flex>
                      <Flex gap={2} alignItems="center">
                        <Text fontSize="2xl">Deposit this Data NFT before: </Text>
                        <Text fontSize="xl" textColor="teal.200">
                          {new Date(item.compensation.endDate * 1000).toLocaleString()}
                        </Text>
                      </Flex>
                      <Flex gap={3} flexDirection={{ base: "column", md: "row" }}>
                        <Button
                          variant="outline"
                          colorScheme="teal"
                          isDisabled={item.compensation.endDate * 1000 < new Date().getTime()}
                          onClick={() => handleDeposit(item.dataNft.collection, item.dataNft.nonce, item.dataNft.balance)}>
                          Deposit all Data NFTs to claim $ITHEUM
                        </Button>
                        <Button
                          variant="outline"
                          colorScheme="teal"
                          isDisabled={havePassed24h(item.compensation.endDate) || proofAmount === 0}
                          onClick={() => handleClaim(item.dataNft.collection, item.dataNft.nonce)}>
                          Claim back your Data NFT +&nbsp;
                          {Number(item.compensation.accumulatedAmount) !== 0 && Number(item.compensation.proofAmount) !== 0
                            ? (BigNumber(item.compensation.accumulatedAmount)
                                .dividedBy(10 ** 18)
                                .toNumber() /
                                Number(item.compensation.proofAmount)) *
                              proofAmount
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
async function getRefundsObject(bondContract: BondContract, address: string, compsInScT: Compensation[]) {
  const refunds = await bondContract.viewAddressRefunds(
    new Address(address),
    compsInScT.map((comp) => comp.compensationId)
  );
  const refundObjT: Record<number, Refund> = {};
  for (const refund of refunds) {
    refundObjT[refund.compensationId] = refund;
  }
  return refundObjT;
}

function getNftsForCompensations(compensationsT: Compensation[], dataNfts: DataNft[]) {
  const compPairsT: CompensationNftPair[] = [];
  const compsInScT: Compensation[] = [];
  for (const compT of compensationsT) {
    const dataNftForComp = dataNfts.find((dataNft) => dataNft.nonce === compT.nonce && dataNft.collection === compT.tokenIdentifier);
    if (dataNftForComp) {
      const compNftPair: CompensationNftPair = { compensation: compT, dataNft: dataNftForComp };
      compPairsT.push(compNftPair);
    } else {
      compsInScT.push(compT);
    }
  }
  return { compsInScT, compPairsT };
}

async function getLoggedAddressCompensations(bondContract: BondContract, contractBonds: Bond[], address: string) {
  return await bondContract.viewCompensations(
    contractBonds
      .filter((bond) => bond.address === address)
      .map((bond) => {
        return { nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier };
      })
  );
}
