import React, { useEffect, useState } from "react";
import { Box, Button, Flex, FormControl, FormErrorMessage, Input, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Bond, BondConfiguration, BondContract, Compensation, DataNft, createTokenIdentifier } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { IS_DEVNET } from "libs/config";
import { LivelinessScore } from "../../../components/Liveliness/LivelinessScore";

type CollectionDashboardProps = {
  bondNft: Bond;
  bondDataNft: Array<DataNft>;
};

type CollectionDashboardFormType = {
  enforceMinimumPenalty: number;
  endTimestampOfBond: string;
};

export const CollectionDashboard: React.FC<CollectionDashboardProps> = (props) => {
  const { bondNft, bondDataNft } = props;
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [allCompensation, setAllCompensation] = useState<Compensation>({
    compensationId: 0,
    tokenIdentifier: "",
    nonce: 0,
    accumulatedAmount: 0,
    proofAmount: 0,
    endDate: 0,
  });
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
    (async () => {
      const compensation = await bondContract.viewCompensation(bondNft.bondId);
      const contractConfigurationRequest = await bondContract.viewContractConfiguration();

      setContractConfiguration(contractConfigurationRequest);
      setAllCompensation(compensation);
    })();
  }, [hasPendingTransactions]);

  const validationSchema = Yup.object().shape({
    enforceMinimumPenalty: Yup.number().required("Required"),
    endTimestampOfBond: Yup.string().required("Required"),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<CollectionDashboardFormType>({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });
  const enforceMinimumPenalty = watch("enforceMinimumPenalty");
  const endTimestampOfBond = watch("endTimestampOfBond");

  const handleEnforcePenalty = async (tokenIdentifier: string, nonce: number, enforceMinimumPenaltyForm: number) => {
    if (enforceMinimumPenaltyForm == contractConfiguration.minimumPenalty / 100) {
      const tx = bondContract.sanction(new Address(address), tokenIdentifier, nonce, 0);
      await sendTransactions({
        transactions: [tx],
      });
    } else {
      const tx = bondContract.sanction(new Address(address), tokenIdentifier, nonce, 1, enforceMinimumPenaltyForm * 100);
      await sendTransactions({
        transactions: [tx],
      });
    }
  };

  const handleMaxSlashPenalty = async (tokenIdentifier: string, nonce: number) => {
    const tx = bondContract.sanction(new Address(address), tokenIdentifier, nonce, 2);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const handleWithdraw = async (tokenIdentifier: string, nonce: number) => {
    const tx = bondContract.modifyBond(new Address(address), tokenIdentifier, nonce);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const handleSelfClaiming = async (tokenIdentifier: string, nonce: number, endTimestampOfBondForm: string) => {
    const formDate = new Date(endTimestampOfBondForm);
    const unixTimestamp = formDate.getTime() / 1000;
    const tx = bondContract.initiateRefund(new Address(address), tokenIdentifier, nonce, unixTimestamp);
    await sendTransactions({
      transactions: [tx],
    });
  };
  return (
    <Flex flexDirection="column" w="full" gap={5}>
      <Flex flexDirection="row" w="full" gap={5} justifyContent="space-between">
        <Box>
          {bondDataNft
            .filter((dataNft) => dataNft.tokenIdentifier === createTokenIdentifier(bondNft.tokenIdentifier, bondNft.nonce))
            .map((dataNft, index) => {
              return (
                <div key={dataNft.tokenIdentifier}>
                  <Text fontSize="1.6rem">{dataNft.tokenName}</Text>
                  <Text fontSize="0.8rem">
                    Title: {dataNft.title} | Nonce: {dataNft.nonce}
                  </Text>
                </div>
              );
            })}
          <Flex flexDirection="row" gap={4}>
            <Text fontSize=".75rem" textColor="teal.200">
              {BigNumber(bondNft.bondAmount)
                .dividedBy(10 ** 18)
                .toNumber()}
              &nbsp;$ITHEUM Bonded
            </Text>
            <Text fontSize=".75rem">|</Text>
            <Text fontSize=".75rem" textColor="indianred">
              {BigNumber(allCompensation.accumulatedAmount)
                .dividedBy(10 ** 18)
                .toNumber()}
              &nbsp;$ITHEUM Penalized
            </Text>
            <Text fontSize=".75rem">|</Text>
            <Text fontSize=".75rem" textColor="mediumpurple">
              {BigNumber(bondNft.remainingAmount)
                .dividedBy(10 ** 18)
                .toNumber()}
              &nbsp;$ITHEUM Remaining
            </Text>
          </Flex>
          <LivelinessScore unbondTimestamp={bondNft.unbondTimestamp} lockPeriod={bondNft.lockPeriod} />
        </Box>
        <Box>
          <Flex flexDirection="column" gap={4}>
            <Flex flexDirection="row" gap={4}>
              <Flex flexDirection="column" gap={4}>
                <Text fontSize="1.1rem">Enforce Penalty</Text>
                <Flex flexDirection="row" gap={4} alignItems="center">
                  <form onSubmit={handleSubmit(() => handleEnforcePenalty(bondNft.tokenIdentifier, bondNft.nonce, enforceMinimumPenalty))}>
                    <FormControl isInvalid={!!errors.enforceMinimumPenalty} isRequired minH={"3.5rem"}>
                      <Flex flexDirection="row" alignItems="center" gap={3}>
                        <Controller
                          control={control}
                          render={({ field: { onChange } }) => (
                            <Input
                              mt="1 !important"
                              id="enforceMinimumPenalty"
                              w="25%"
                              defaultValue={5}
                              onChange={(event) => {
                                onChange(event.target.value);
                              }}
                            />
                          )}
                          name={"enforceMinimumPenalty"}
                        />
                        <FormErrorMessage>{errors?.enforceMinimumPenalty?.message}</FormErrorMessage>
                        <Text fontSize="1.1rem">%</Text>
                        <Button colorScheme="pink" type="submit">
                          Penalize
                        </Button>
                      </Flex>
                    </FormControl>
                  </form>
                </Flex>
                <Text fontSize=".8rem">* X% amount of $ITHEUM will be taken from creator</Text>
              </Flex>
              <Flex flexDirection="column" gap={4}>
                <Text fontSize="1.1rem">Enforce Max Slash {contractConfiguration.maximumPenalty / 100}%</Text>
                <Flex flexDirection="row" gap={4} alignItems="center">
                  <Button colorScheme="pink" onClick={() => handleMaxSlashPenalty(bondNft.tokenIdentifier, bondNft.nonce)}>
                    Slash
                  </Button>
                </Flex>
                <Text fontSize=".8rem" pt={4}>
                  * Max slash % of $ITHEUM will be taken from creator
                </Text>
              </Flex>
            </Flex>
            <Flex flexDirection="column" alignItems="flex-start" gap={2}>
              <Text fontSize="1.5rem" textColor="teal.200">
                Remove Bond Withdraw Restriction
              </Text>
              <Text fontSize="1.1rem">Allow the Creator to withdraw bond with NO penalty</Text>
              <Button colorScheme="teal" onClick={() => handleWithdraw(bondNft.tokenIdentifier, bondNft.nonce)}>
                GO!
              </Button>
            </Flex>
            <Flex flexDirection="column" alignItems="flex-start" gap={2}>
              <Text fontSize="1.5rem" textColor="teal.200">
                Compensation Self Claiming
              </Text>
              <Text fontSize="1.1rem" textColor="indianred">
                {BigNumber(allCompensation.accumulatedAmount)
                  .dividedBy(10 ** 18)
                  .toNumber()}{" "}
                $ITHEUM To Date....
              </Text>
              <Text fontSize=".8rem">Set End Claim Date for Affected Owners to Claim By</Text>
              <Flex gap={5}>
                <form onSubmit={handleSubmit(() => handleSelfClaiming(bondNft.tokenIdentifier, bondNft.nonce, endTimestampOfBond))}>
                  <FormControl isInvalid={!!errors.endTimestampOfBond} isRequired minH={"3.5rem"}>
                    <Flex flexDirection="row" alignItems="center" gap={3}>
                      <Controller
                        control={control}
                        render={({ field: { onChange } }) => (
                          <Input
                            mt="1 !important"
                            id="endTimestampOfBond"
                            type="datetime-local"
                            w="70%"
                            defaultValue={new Date(new Date().getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 16)}
                            onChange={(event) => {
                              onChange(event.target.value);
                            }}
                          />
                        )}
                        name={"endTimestampOfBond"}
                      />
                      <FormErrorMessage>{errors?.endTimestampOfBond?.message}</FormErrorMessage>

                      <Button colorScheme="teal" type="submit">
                        GO!
                      </Button>
                    </Flex>
                    {allCompensation.endDate > 0 && (
                      <Text marginTop={1} fontSize="0.6rem">
                        Current end date:{" "}
                        {new Date(allCompensation.endDate * 1000 + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 16).replace("T", " ")}
                      </Text>
                    )}
                  </FormControl>
                </form>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};
