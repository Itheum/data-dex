import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Skeleton, SkeletonText, Text, Tooltip, Alert, AlertIcon, Link, useDisclosure } from "@chakra-ui/react";
import { Bond, BondContract, Compensation, DataNft, Refund } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { FaCalculator } from "react-icons/fa";
import { CalculateCompensationModal } from "./CalculateCompensationModal";
import { NoDataHere } from "../../../components/Sections/NoDataHere";
import { contractsForChain, IS_DEVNET } from "../../../libs/config";

export type CompensationNftPair = {
  compensation: Compensation;
  dataNft: DataNft;
};

export const CompensationCards: React.FC = () => {
  const { address: mxAddress } = useGetAccountInfo();
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [compensationPairs, setCompensationPairs] = useState<Array<CompensationNftPair>>([]);
  const [compensationRefund, setCompensationRefund] = useState<Record<number, Refund>>({});
  const [isCompensationNftLoading, setIsCompensationNftLoading] = useState<boolean>(true);
  const [proofOfRefundAmount, setProofOfRefundAmount] = useState<number>(0);
  const [totalProofOfRefundAmount, setTotalProofOfRefundAmount] = useState<number>(0);
  const [accumulatedAmount, setAccumulatedAmount] = useState<number>(0);
  const [blacklistedAddressesPerNft, setBlacklistedAddressesPerNft] = useState<Array<string>>([]);
  const cardsForLoading = new Array(8).fill(1);
  const { isOpen: isOpenCalculateCompensation, onOpen: onOpenCalculateCompensation, onClose: onCloseCalculateCompensation } = useDisclosure();

  useEffect(() => {
    setIsCompensationNftLoading(false);
    (async () => {
      const contractBonds = await bondContract.viewAllBonds();
      const dataNftTicker = contractsForChain(chainID).dataNftTokens[0].id;
      const dataNfts: DataNft[] = await DataNft.ownedByAddress(mxAddress, [dataNftTicker]);

      const compensationsT = await getCompensationsFromBondSc(contractBonds);
      const { compsInScT, compPairsT }: { compsInScT: Compensation[]; compPairsT: CompensationNftPair[] } = getNftsForCompensations(compensationsT, dataNfts);
      const refundObjT: Record<number, Refund> = await getRefundsObject(mxAddress, compsInScT);

      const nftsInScT = compsInScT.map((comp) => {
        return { nonce: comp.nonce, tokenIdentifier: comp.tokenIdentifier };
      });
      const dataNftsInScT = [];
      for (let i = 0; i < nftsInScT.length; i += 50) {
        const dataNftsInScTChunk = await DataNft.createManyFromApi(nftsInScT.slice(i, i + 50), 5 * 60 * 1000);
        dataNftsInScT.push(...dataNftsInScTChunk);
      }
      for (const compT of compsInScT) {
        const dataNftForComp = dataNftsInScT.find((dataNft) => dataNft.nonce === compT.nonce && dataNft.collection === compT.tokenIdentifier);
        if (dataNftForComp) {
          const refundForComp = refundObjT[compT.compensationId];
          if (refundForComp) {
            dataNftForComp.updateDataNft({ balance: Number(refundForComp.proofOfRefund.amount) });
            const compNftPair: CompensationNftPair = { compensation: compT, dataNft: dataNftForComp };
            compPairsT.push(compNftPair);
          }
        }
      }

      setCompensationRefund(refundObjT);
      setCompensationPairs(compPairsT.filter((pair) => pair.compensation.endDate > 0));
      setIsCompensationNftLoading(true);
    })();
  }, [hasPendingTransactions]);

  const hasPassedSafeTime = (endDate: number) => {
    const currentTime = new Date().getTime();
    const endDateInMs = endDate * 1000;
    const differenceInMs = currentTime - endDateInMs;
    const safeTime = IS_DEVNET ? 300000 : 86400000;
    return differenceInMs <= safeTime || endDate === 0;
  };

  const getRefundsObject = async (address: string, compsInScT: Compensation[]) => {
    const refunds = await bondContract.viewAddressRefunds(
      new Address(address),
      compsInScT.map((comp) => comp.compensationId)
    );
    const refundObjT: Record<number, Refund> = {};
    for (const refund of refunds) {
      refundObjT[refund.compensationId] = refund;
    }
    return refundObjT;
  };

  const getNftsForCompensations = (compensationsT: Compensation[], dataNfts: DataNft[]) => {
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
  };

  const getCompensationsFromBondSc = async (contractBonds: Bond[]) => {
    return await bondContract.viewCompensations(
      contractBonds.map((bond) => {
        return { nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier };
      })
    );
  };

  const getBlacklistNfts = async (compensationIds: number) => {
    return await bondContract.viewCompensationBlacklist(compensationIds);
  };

  const handleDeposit = async (tokenIdentifier: string, nonce: number, amount: BigNumber.Value) => {
    const payments = { amount: amount, nonce: nonce, tokenIdentifier: tokenIdentifier };
    const tx = bondContract.proof(new Address(mxAddress), payments);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const handleClaim = async (tokenIdentifier: string, nonce: number) => {
    const tx = bondContract.claimRefund(new Address(mxAddress), tokenIdentifier, nonce);
    await sendTransactions({
      transactions: [tx],
    });
  };

  return (
    <>
      <Flex flexDirection="column" gap={4}>
        <Alert status="info" fontSize="md">
          <AlertIcon />
          <Text>
            The{" "}
            <Link href="https://docs.itheum.io/product-docs/protocol/governance/itheum-trailblazer-dao" isExternal color="teal.200">
              Trailblazer DAO
            </Link>{" "}
            oversees Liveliness Bonds deposited from all Data Creators. If any bonds are slashed due to community verified mis-use of the system, the slashed
            tokens are returned as compensation to Data NFT holders who were affected. If you are eligible for any compensation, it will appear below.
          </Text>
        </Alert>

        {compensationPairs.length === 0 ? (
          <>
            {isCompensationNftLoading && <NoDataHere />}
            {cardsForLoading.map((_, index) => (
              <Box display="flex" gap={4} height="15dvh" w="full" key={index} px={3}>
                <Skeleton height="15svh" w="15svh" rounded="3xl" isLoaded={isCompensationNftLoading} />
                <SkeletonText w="85%" mt="4" noOfLines={4} spacing="5" skeletonHeight="3" isLoaded={isCompensationNftLoading} />
              </Box>
            ))}
          </>
        ) : (
          <Flex flexDirection="column" gap={6} w="full" px={14}>
            {compensationPairs.map((item, index) => {
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
                        isDisabled={
                          item.compensation.endDate * 1000 < new Date().getTime() ||
                          BigNumber(item.compensation.accumulatedAmount)
                            .dividedBy(10 ** 18)
                            .toNumber() !== 0
                        }
                        onClick={() => handleDeposit(item.dataNft.collection, item.dataNft.nonce, item.dataNft.balance)}>
                        Deposit Data NFTs
                      </Button>
                      <Button
                        variant="outline"
                        colorScheme="teal"
                        isDisabled={
                          hasPassedSafeTime(item.compensation.endDate) ||
                          proofAmount === 0 ||
                          BigNumber(item.compensation.accumulatedAmount)
                            .dividedBy(10 ** 18)
                            .toNumber() === 0
                        }
                        onClick={() => handleClaim(item.dataNft.collection, item.dataNft.nonce)}>
                        Claim
                      </Button>

                      <Tooltip label="Calculate compensation reward">
                        <Button
                          colorScheme="teal"
                          variant="outline"
                          onClick={async () => {
                            setProofOfRefundAmount(Number(item.compensation.proofAmount));
                            setTotalProofOfRefundAmount(Number(compensationRefund[item.compensation.compensationId].proofOfRefund.amount));
                            setAccumulatedAmount(
                              BigNumber(item.compensation.accumulatedAmount)
                                .dividedBy(10 ** 18)
                                .toNumber()
                            );
                            const blacklistedAddresses = await getBlacklistNfts(item.compensation.compensationId);
                            setBlacklistedAddressesPerNft(blacklistedAddresses);
                            onOpenCalculateCompensation();
                          }}
                          isDisabled={
                            proofAmount === 0 ||
                            BigNumber(item.compensation.accumulatedAmount)
                              .dividedBy(10 ** 18)
                              .toNumber() === 0
                          }>
                          <FaCalculator />
                        </Button>
                      </Tooltip>
                    </Flex>
                  </Flex>
                  <CalculateCompensationModal
                    isModalOpen={isOpenCalculateCompensation}
                    onModalClose={onCloseCalculateCompensation}
                    proofOfRefundAmount={proofOfRefundAmount}
                    totalProofOfRefundAmount={totalProofOfRefundAmount}
                    accumulatedAmount={accumulatedAmount}
                    blacklistStatus={blacklistedAddressesPerNft.includes(mxAddress)}
                  />
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>
    </>
  );
};
