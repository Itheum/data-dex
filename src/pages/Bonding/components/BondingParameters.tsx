import React, { useEffect, useState } from "react";
import { Box, Button, Flex, FormControl, FormErrorMessage, Grid, GridItem, Input, Text } from "@chakra-ui/react";
import { Address } from "@multiversx/sdk-core/out";
import { AiFillPauseCircle, AiFillPlayCircle } from "react-icons/ai";
import * as Yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Bond, BondContract, State } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";

type BondingParametersFormType = {
  minimumLockPeriodInSeconds: number;
  minimumSBond: number;
  minimumPenaltyInPercentage: number;
  minimumSlashInPercentage: number;
  earlyWithdrawPenaltyInPercentage: number;
};

export const BondingParameters: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const bondContract = new BondContract(chainID === "D" ? "devnet" : "mainnet");

  const validationSchema = Yup.object().shape({
    minimumLockPeriodInSeconds: Yup.number().required("Required"),
    minimumSBond: Yup.number().required("Required"),
    minimumPenaltyInPercentage: Yup.number().required("Required"),
    minimumSlashInPercentage: Yup.number().required("Required"),
    earlyWithdrawPenaltyInPercentage: Yup.number().required("Required"),
  });

  // TODO: default values get from bonding contract
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<BondingParametersFormType>({
    defaultValues: {
      minimumLockPeriodInSeconds: 7889231,
      minimumSBond: 1000,
      minimumPenaltyInPercentage: 5,
      minimumSlashInPercentage: 100,
      earlyWithdrawPenaltyInPercentage: 80,
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const onSubmitMinLockPeriod = async (formData: Partial<BondingParametersFormType>) => {
    console.log(formData);
  };
  const onSubmitMinSlashBond = async (formData: Partial<BondingParametersFormType>) => {
    console.log(formData);
  };
  const onSubmitMinPenalty = async (formData: Partial<BondingParametersFormType>) => {
    if (formData.minimumPenaltyInPercentage) {
      bondContract.setMinimumPenalty(new Address(address), formData.minimumPenaltyInPercentage);
    }
  };
  const onSubmitMinSlashPerc = async (formData: Partial<BondingParametersFormType>) => {
    console.log(formData);
  };
  const onSubmitEarlyWithdrawPenalty = async (formData: Partial<BondingParametersFormType>) => {
    console.log(formData);
  };
  const handleOnPause = async () => {
    bondContract.setContractState(new Address(address), State.Inactive);
  };
  const handleOnUnpause = async () => {
    bondContract.setContractState(new Address(address), State.Active);
  };

  return (
    <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
      <Flex justifyContent="space-between" alignItems="center" px={10}>
        <Flex flexDirection="column" justifyContent="center" w="full" gap={5}>
          <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
            Bonding Parameters
          </Text>
          <Grid templateColumns="repeat(5, 1fr)" gap={6}>
            <GridItem w="100%" colSpan={2}></GridItem>
            <GridItem w="100%">Current Value</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              New Value
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum Lock Period In Seconds
            </GridItem>
            <GridItem w="100%">{getValues("minimumLockPeriodInSeconds")}</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <form onSubmit={handleSubmit(onSubmitMinLockPeriod)}>
                <FormControl isInvalid={!!errors.minimumLockPeriodInSeconds} isRequired minH={"3.5rem"}>
                  <Controller
                    control={control}
                    render={({ field: { onChange } }) => (
                      <Input
                        mt="1 !important"
                        id="minimumLockPeriodInSeconds"
                        w="25%"
                        mr={3}
                        onChange={(event) => {
                          onChange(event.target.value);
                        }}
                      />
                    )}
                    name={"minimumLockPeriodInSeconds"}
                  />
                  <FormErrorMessage>{errors?.minimumLockPeriodInSeconds?.message}</FormErrorMessage>

                  <Button type="submit">Set</Button>
                </FormControl>
              </form>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum S Bond
            </GridItem>
            <GridItem w="100%">{getValues("minimumSBond")} $ITHEUM</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <form onSubmit={handleSubmit(onSubmitMinSlashBond)}>
                <FormControl isInvalid={!!errors.minimumSBond} isRequired minH={"3.5rem"}>
                  <Controller
                    control={control}
                    render={({ field: { onChange } }) => (
                      <Input
                        mt="1 !important"
                        id="minimumLockPeriodInSeconds"
                        w="25%"
                        mr={3}
                        onChange={(event) => {
                          onChange(event.target.value);
                        }}
                      />
                    )}
                    name={"minimumLockPeriodInSeconds"}
                  />
                  <FormErrorMessage>{errors?.minimumSBond?.message}</FormErrorMessage>

                  <Button type="submit">Set</Button>
                </FormControl>
              </form>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Minimum Penalty in Percentage
            </GridItem>
            <GridItem w="100%">{getValues("minimumPenaltyInPercentage")}%</GridItem>
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
              Minimum Slash In Percentage
            </GridItem>
            <GridItem w="100%">{getValues("minimumSlashInPercentage")}%</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <Input type="number" w="25%" mr={3} />
              <Button>Set</Button>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(5, 1fr)" gap={6} fontSize="1.3rem">
            <GridItem w="100%" colSpan={2}>
              Early Withdraw Penalty in Percentage
            </GridItem>
            <GridItem w="100%">{getValues("earlyWithdrawPenaltyInPercentage")}%</GridItem>
            <GridItem w="100%" textAlign="right" colSpan={2}>
              <Input type="number" w="25%" mr={3} />
              <Button>Set</Button>
            </GridItem>
          </Grid>
          <Flex flexDirection="row" gap={5} py={4} roundedBottom="3xl" justifyContent="start">
            <Flex flexDirection="column">
              <Button aria-label="UnPause contract" loadingText="Loading" variant="ghost" size="md" onClick={() => handleOnUnpause()}>
                <AiFillPlayCircle size="lg" color="#00C797" />
              </Button>
              <Text>Unpause Minter</Text>
            </Flex>
            <Flex flexDirection="column">
              <Button aria-label="Pause contract" loadingText="Loading" variant="ghost" size="md" onClick={() => handleOnPause}>
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
