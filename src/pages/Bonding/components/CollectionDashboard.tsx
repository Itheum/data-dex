import React, { Fragment, useEffect, useState } from "react";
import { NumberInputField } from "@chakra-ui/number-input";
import { Button, Flex, FormControl, FormErrorMessage, Input, NumberInput, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Bond, BondConfiguration, BondContract, Compensation, createTokenIdentifier, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { IS_DEVNET } from "libs/config";
import { LivelinessScore } from "../../../components/Liveliness/LivelinessScore";

type CollectionDashboardProps = {
  bondNft: Array<Bond>;
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
  const { bondingPageNumber } = useParams();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [allCompensation, setAllCompensation] = useState<Array<Compensation>>([]);
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
  const [matchedDataNft, setMatchedDataNft] = useState<Array<any>>([]);

  const matchBondWithDataNft = () => {
    const _matchedDataNft: Array<any> = [];
    bondNft.forEach((currentNft) => {
      const matchingNft = bondDataNft.find((dataNft) => dataNft.tokenIdentifier === createTokenIdentifier(currentNft.tokenIdentifier, currentNft.nonce));

      if (matchingNft) {
        const buildDataNft = { ...matchingNft, ...currentNft };
        _matchedDataNft.push(buildDataNft);
      }
    });

    setMatchedDataNft(_matchedDataNft);
  };

  useEffect(() => {
    matchBondWithDataNft();
    (async () => {
      const itemsForCompensation: Array<{ tokenIdentifier: string; nonce: number }> = [];
      bondDataNft.forEach((dataNft) => {
        itemsForCompensation.push({ tokenIdentifier: dataNft.collection, nonce: dataNft.nonce });
      });
      const compensation = await bondContract.viewCompensations(itemsForCompensation);
      const contractConfigurationRequest = await bondContract.viewContractConfiguration();

      setContractConfiguration(contractConfigurationRequest);
      setAllCompensation(compensation);
    })();
  }, [hasPendingTransactions, bondNft, bondDataNft]);

  const validationSchema = Yup.object().shape({
    enforceMinimumPenalty: Yup.number().typeError("Value must be a number").required("Please select a value for enforce penalty"),
    endTimestampOfBond: Yup.string().required("Please select a value for claim date"),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<CollectionDashboardFormType>({
    defaultValues: {
      enforceMinimumPenalty: 5,
      endTimestampOfBond: new Date(new Date().getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 16),
    },
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
      {matchedDataNft.map((dataNft, index) => {
        return (
          <Fragment key={index}>
            <Flex gap={4}>
              <Flex flexDirection="column">
                <div key={dataNft.tokenIdentifier}>
                  <Text fontSize="1.6rem">{dataNft.tokenName}</Text>
                  <Text fontSize="0.8rem">
                    Title: {dataNft.title} | Nonce: {dataNft.nonce}
                  </Text>
                </div>
                <Flex flexDirection="row" gap={4}>
                  <Text fontSize=".75rem" textColor="teal.200">
                    {BigNumber(dataNft.bondAmount)
                      .dividedBy(10 ** 18)
                      .toNumber()}
                    &nbsp;$ITHEUM Bonded
                  </Text>
                  <Text fontSize=".75rem">|</Text>
                  <Text fontSize=".75rem" textColor="indianred">
                    {allCompensation
                      .filter(
                        (compensation) =>
                          createTokenIdentifier(compensation.tokenIdentifier, compensation.nonce) ===
                          createTokenIdentifier(dataNft.tokenIdentifier, dataNft.nonce)
                      )
                      .map((compensation) => {
                        return BigNumber(compensation.accumulatedAmount)
                          .dividedBy(10 ** 18)
                          .toNumber();
                      })}
                    &nbsp;$ITHEUM Penalized
                  </Text>
                  <Text fontSize=".75rem">|</Text>
                  <Text fontSize=".75rem" textColor="mediumpurple">
                    {BigNumber(dataNft.remainingAmount)
                      .dividedBy(10 ** 18)
                      .toNumber()}
                    &nbsp;$ITHEUM Remaining
                  </Text>
                </Flex>
                <LivelinessScore unbondTimestamp={dataNft.unbondTimestamp} lockPeriod={dataNft.lockPeriod} />
              </Flex>
              <Flex flexDirection="column" gap={4}>
                <Flex flexDirection="row" gap={4}>
                  <Flex flexDirection="column" gap={4}>
                    <Text fontSize="1.1rem">Enforce Penalty</Text>
                    <Flex flexDirection="row" gap={4} alignItems="center">
                      <form onSubmit={handleSubmit(() => handleEnforcePenalty(dataNft.tokenIdentifier, dataNft.nonce, enforceMinimumPenalty))}>
                        <FormControl isInvalid={!!errors.enforceMinimumPenalty} isRequired minH={"3.5rem"}>
                          <Flex flexDirection="row" alignItems="center" gap={3}>
                            <Controller
                              control={control}
                              render={({ field: { onChange } }) => (
                                <NumberInput
                                  mt="1 !important"
                                  id="enforceMinimumPenalty"
                                  min={1}
                                  max={contractConfiguration.maximumPenalty / 100}
                                  w="30%"
                                  defaultValue={enforceMinimumPenalty}
                                  onChange={(event) => {
                                    onChange(event);
                                    if (Number(event) < 1 || event == "") onChange(enforceMinimumPenalty);
                                  }}>
                                  <NumberInputField />
                                </NumberInput>
                              )}
                              name={"enforceMinimumPenalty"}
                            />
                            <Text fontSize="1.1rem">%</Text>
                            <Button colorScheme="pink" type="submit">
                              Penalize
                            </Button>
                          </Flex>
                          <FormErrorMessage>{errors?.enforceMinimumPenalty?.message}</FormErrorMessage>
                        </FormControl>
                      </form>
                    </Flex>
                    <Text fontSize=".8rem">* X% amount of $ITHEUM will be taken from creator</Text>
                  </Flex>
                  <Flex flexDirection="column" gap={4}>
                    <Text fontSize="1.1rem">Enforce Max Slash {contractConfiguration.maximumPenalty / 100}%</Text>
                    <Flex flexDirection="row" gap={4} alignItems="center">
                      <Button colorScheme="pink" onClick={() => handleMaxSlashPenalty(dataNft.tokenIdentifier, dataNft.nonce)}>
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
                  <Button colorScheme="teal" onClick={() => handleWithdraw(dataNft.tokenIdentifier, dataNft.nonce)}>
                    GO!
                  </Button>
                </Flex>
                <Flex flexDirection="column" alignItems="flex-start" gap={2}>
                  <Text fontSize="1.5rem" textColor="teal.200">
                    Compensation Self Claiming
                  </Text>
                  <Text fontSize="1.1rem" textColor="indianred">
                    {allCompensation.map((compensation) => {
                      if (
                        createTokenIdentifier(compensation.tokenIdentifier, compensation.nonce) ===
                        createTokenIdentifier(dataNft.tokenIdentifier, dataNft.nonce)
                      ) {
                        return BigNumber(compensation.accumulatedAmount)
                          .dividedBy(10 ** 18)
                          .toNumber();
                      }
                    })}{" "}
                    $ITHEUM To Date....
                  </Text>
                  <Text fontSize=".8rem">Set End Claim Date for Affected Owners to Claim By</Text>
                  <Flex gap={5}>
                    <form onSubmit={handleSubmit(() => handleSelfClaiming(dataNft.tokenIdentifier, dataNft.nonce, endTimestampOfBond))}>
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
                                defaultValue={endTimestampOfBond}
                                onChange={(event) => {
                                  onChange(event.target.value);
                                }}
                              />
                            )}
                            name={"endTimestampOfBond"}
                          />

                          <Button colorScheme="teal" type="submit">
                            GO!
                          </Button>
                        </Flex>
                        <FormErrorMessage>{errors?.endTimestampOfBond?.message}</FormErrorMessage>
                        {allCompensation.map((compensation) => {
                          if (
                            createTokenIdentifier(compensation.tokenIdentifier, compensation.nonce) ===
                              createTokenIdentifier(dataNft.tokenIdentifier, dataNft.nonce) &&
                            compensation.endDate > 0
                          ) {
                            return (
                              <Text marginTop={1} fontSize="0.6rem" key={compensation.tokenIdentifier}>
                                Current end date:{" "}
                                {new Date(compensation.endDate * 1000 + new Date().getTimezoneOffset() * -60 * 1000)
                                  .toISOString()
                                  .slice(0, 16)
                                  .replace("T", " ")}
                              </Text>
                            );
                          }
                        })}
                      </FormControl>
                    </form>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Fragment>
        );
      })}
    </Flex>
  );
};
