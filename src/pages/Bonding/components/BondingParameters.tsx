import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { Address } from "@multiversx/sdk-core/out";
import { AiFillPauseCircle, AiFillPlayCircle } from "react-icons/ai";
import * as Yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Bond, BondConfiguration, BondContract, State } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import BigNumber from "bignumber.js";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";

type BondingParametersFormType = {
  minimumLockPeriodInSeconds: number;
  minimumSBond: number;
  minimumPenaltyInPercentage: number;
  maximumSlashInPercentage: number;
  earlyWithdrawPenaltyInPercentage: number;
};

export const BondingParameters: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(chainID === "D" ? "devnet" : "mainnet");
  const [onChangeMinimumLockPeriod, setOnChangeMinimumLockPeriod] = useState<number>(0);
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
      const contractConfigurationRequest = await bondContract.viewContractConfiguration();
      console.log(contractConfigurationRequest);
      setContractConfiguration(contractConfigurationRequest);
    })();
  }, [hasPendingTransactions]);

  const validationSchema = Yup.object().shape({
    minimumLockPeriodInSeconds: Yup.number().required("Required"),
    minimumSBond: Yup.number().required("Required"),
    minimumPenaltyInPercentage: Yup.number().required("Required"),
    maximumSlashInPercentage: Yup.number().required("Required"),
    earlyWithdrawPenaltyInPercentage: Yup.number().required("Required"),
  });

  // TODO: default values get from bonding contract
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<BondingParametersFormType>({
    defaultValues: {
      minimumLockPeriodInSeconds: 7889231,
      minimumSBond: 1000,
      minimumPenaltyInPercentage: 5,
      maximumSlashInPercentage: 100,
      earlyWithdrawPenaltyInPercentage: 80,
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const onSubmitMinLockPeriod = async (formData: Partial<BondingParametersFormType>) => {
    console.log(formData);
  };
  const onSetPeriodBonds = async (formData: Partial<BondingParametersFormType>) => {
    if (formData.minimumLockPeriodInSeconds && formData.minimumSBond) {
      const tx = bondContract.setPeriodsBonds(
        new Address(address),
        [formData.minimumLockPeriodInSeconds],
        [BigNumber(formData.minimumSBond).multipliedBy(10 ** 18)]
      );
      // console.log(tx);
      await sendTransactions({
        transactions: [tx],
      });
    }
  };
  const onSubmitMinPenalty = async (formData: Partial<BondingParametersFormType>) => {
    if (formData.minimumPenaltyInPercentage) {
      const tx = bondContract.setMinimumPenalty(new Address(address), formData.minimumPenaltyInPercentage * 100);
      await sendTransactions({
        transactions: [tx],
      });
    }
  };
  const onSubmitMaxSlashPerc = async (formData: Partial<BondingParametersFormType>) => {
    if (formData.maximumSlashInPercentage) {
      const tx = bondContract.setMaximumPenalty(new Address(address), formData.maximumSlashInPercentage * 100);
      await sendTransactions({
        transactions: [tx],
      });
    }
  };
  const onSubmitEarlyWithdrawPenalty = async (formData: Partial<BondingParametersFormType>) => {
    if (formData.earlyWithdrawPenaltyInPercentage) {
      const tx = bondContract.setWithdrawPenalty(new Address(address), formData.earlyWithdrawPenaltyInPercentage * 100);
      await sendTransactions({
        transactions: [tx],
      });
    }
  };
  const handleOnPause = async () => {
    const tx = bondContract.setContractState(new Address(address), State.Inactive);
    await sendTransactions({
      transactions: [tx],
    });
  };
  const handleOnUnpause = async () => {
    const tx = bondContract.setContractState(new Address(address), State.Active);
    await sendTransactions({
      transactions: [tx],
    });
  };

  return (
    <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
      <Flex justifyContent="space-between" alignItems="center" px={10}>
        <Flex flexDirection="column" justifyContent="center" w="full" gap={5}>
          <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
            Bonding Parameters
          </Text>

          <Box border="1px solid" borderColor="teal.200" rounded="xl" p={5}>
            <Tabs>
              <TabList>
                <Tab textColor="teal.200" fontWeight="700" fontSize="lg">
                  Add
                </Tab>
                <Tab textColor="teal.200" fontWeight="700" fontSize="lg">
                  Edit
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <form onSubmit={handleSubmit(onSetPeriodBonds)}>
                    <Flex flexDirection="row">
                      <FormControl isInvalid={!!errors.minimumLockPeriodInSeconds} isRequired minH={"3.5rem"}>
                        <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
                          Minimum Lock Period In Seconds
                        </FormLabel>
                        <Controller
                          control={control}
                          render={({ field: { onChange } }) => (
                            <Input
                              mt="1 !important"
                              id="minimumLockPeriodInSeconds"
                              w="50%"
                              mr={3}
                              type="number"
                              onChange={(event) => {
                                onChange(event.target.value);
                              }}
                            />
                          )}
                          name={"minimumLockPeriodInSeconds"}
                        />
                        <FormErrorMessage>{errors?.minimumLockPeriodInSeconds?.message}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.minimumSBond} isRequired minH={"3.5rem"}>
                        <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
                          Minimum Slashable Bond
                        </FormLabel>
                        <Controller
                          control={control}
                          render={({ field: { onChange } }) => (
                            <Input
                              mt="1 !important"
                              id="minimumSBond"
                              w="50%"
                              mr={3}
                              type="number"
                              onChange={(event) => {
                                onChange(event.target.value);
                              }}
                            />
                          )}
                          name={"minimumSBond"}
                        />
                        <FormErrorMessage>{errors?.minimumSBond?.message}</FormErrorMessage>
                      </FormControl>
                    </Flex>
                    <Button type="submit" mt={5} colorScheme="teal">
                      Add
                    </Button>
                  </form>
                </TabPanel>
                <TabPanel>
                  <form onSubmit={handleSubmit(onSetPeriodBonds)}>
                    <Flex flexDirection="row" gap={5}>
                      <FormControl isInvalid={!!errors.minimumLockPeriodInSeconds} isRequired minH={"3.5rem"}>
                        <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
                          Minimum Lock Period In Seconds
                        </FormLabel>
                        <Controller
                          control={control}
                          render={({ field: { onChange } }) => (
                            <Select
                              id="minimumLockPeriodInSeconds"
                              onChange={(event) => {
                                onChange(event.target.value);
                              }}>
                              {contractConfiguration.lockPeriodsWithBonds.map((lockPeriod, index) => (
                                <option key={index} value={lockPeriod.lockPeriod}>
                                  {lockPeriod.lockPeriod} seconds
                                </option>
                              ))}
                            </Select>
                          )}
                          name={"minimumLockPeriodInSeconds"}
                        />
                        <FormErrorMessage>{errors?.minimumLockPeriodInSeconds?.message}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.minimumSBond} isRequired minH={"3.5rem"}>
                        <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
                          Minimum Slashable Bond
                        </FormLabel>
                        <Controller
                          control={control}
                          render={({ field: { onChange } }) => (
                            <Select
                              id="minimumSBond"
                              onChange={(event) => {
                                onChange(event.target.value);
                              }}>
                              {contractConfiguration.lockPeriodsWithBonds.map((lockPeriod, index) => (
                                <option
                                  key={index}
                                  value={BigNumber(lockPeriod.amount)
                                    .dividedBy(10 ** 18)
                                    .toNumber()}>
                                  {BigNumber(lockPeriod.amount)
                                    .dividedBy(10 ** 18)
                                    .toNumber()}{" "}
                                  $ITHEUM
                                </option>
                              ))}
                            </Select>
                          )}
                          name={"minimumSBond"}
                        />
                        <FormErrorMessage>{errors?.minimumSBond?.message}</FormErrorMessage>
                      </FormControl>
                    </Flex>
                    <Button type="submit" mt={5} colorScheme="teal">
                      Edit
                    </Button>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          <Grid templateColumns="repeat(5, 1fr)" gap={6}>
            <GridItem w="100%" colSpan={2}></GridItem>
            <GridItem w="100%" textColor="teal.200">
              Current Value
            </GridItem>
            <GridItem w="100%" textAlign="right" textColor="teal.200" colSpan={2}>
              New Value
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum Penalty in Percentage
            </GridItem>
            <GridItem w="100%">{contractConfiguration.minimumPenalty / 100}%</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <form onSubmit={handleSubmit(onSubmitMinPenalty)}>
                <FormControl isInvalid={!!errors.minimumPenaltyInPercentage} isRequired minH={"3.5rem"}>
                  <Controller
                    control={control}
                    render={({ field: { onChange } }) => (
                      <Input
                        mt="1 !important"
                        id="minimumPenaltyInPercentage"
                        w="25%"
                        mr={3}
                        type="number"
                        onChange={(event) => {
                          onChange(event.target.value);
                        }}
                      />
                    )}
                    name={"minimumPenaltyInPercentage"}
                  />
                  <FormErrorMessage>{errors?.minimumPenaltyInPercentage?.message}</FormErrorMessage>

                  <Button type="submit">Set</Button>
                </FormControl>
              </form>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Maximum Slash In Percentage
            </GridItem>
            <GridItem w="100%">{contractConfiguration.maximumPenalty / 100}%</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <form onSubmit={handleSubmit(onSubmitMaxSlashPerc)}>
                <FormControl isInvalid={!!errors.maximumSlashInPercentage} isRequired minH={"3.5rem"}>
                  <Controller
                    control={control}
                    render={({ field: { onChange } }) => (
                      <Input
                        mt="1 !important"
                        id="maximumSlashInPercentage"
                        w="25%"
                        mr={3}
                        type="number"
                        onChange={(event) => {
                          onChange(event.target.value);
                        }}
                      />
                    )}
                    name={"maximumSlashInPercentage"}
                  />
                  <FormErrorMessage>{errors?.maximumSlashInPercentage?.message}</FormErrorMessage>

                  <Button type="submit">Set</Button>
                </FormControl>
              </form>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Early Withdraw Penalty in Percentage
            </GridItem>
            <GridItem w="100%">{contractConfiguration.withdrawPenalty / 100}%</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <form onSubmit={handleSubmit(onSubmitEarlyWithdrawPenalty)}>
                <FormControl isInvalid={!!errors.earlyWithdrawPenaltyInPercentage} isRequired minH={"3.5rem"}>
                  <Controller
                    control={control}
                    render={({ field: { onChange } }) => (
                      <Input
                        mt="1 !important"
                        id="earlyWithdrawPenaltyInPercentage"
                        w="25%"
                        mr={3}
                        type="number"
                        onChange={(event) => {
                          onChange(event.target.value);
                        }}
                      />
                    )}
                    name={"earlyWithdrawPenaltyInPercentage"}
                  />
                  <FormErrorMessage>{errors?.earlyWithdrawPenaltyInPercentage?.message}</FormErrorMessage>

                  <Button type="submit">Set</Button>
                </FormControl>
              </form>
            </GridItem>
          </Grid>
          <Flex flexDirection="row" gap={5} py={4} roundedBottom="3xl" justifyContent="start">
            <Flex flexDirection="column">
              <Button
                aria-label="UnPause contract"
                loadingText="Loading"
                variant="ghost"
                size="md"
                onClick={() => handleOnUnpause()}
                isDisabled={contractConfiguration.contractState.toString() === "Active"}>
                <AiFillPlayCircle size="lg" color="#00C797" />
              </Button>
              <Text>Unpause Minter</Text>
            </Flex>
            <Flex flexDirection="column">
              <Button
                aria-label="Pause contract"
                loadingText="Loading"
                variant="ghost"
                size="md"
                onClick={() => handleOnPause()}
                isDisabled={contractConfiguration.contractState.toString() === "Inactive"}>
                <AiFillPauseCircle size="lg" color="#00C797" />
              </Button>
              <Text>Pause Minter</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
