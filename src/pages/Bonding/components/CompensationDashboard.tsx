import React, { useEffect } from "react";
import { Box, Button, Flex, FormControl, FormErrorMessage, Input, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { BondContract, Compensation, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import ShortAddress from "../../../components/UtilComps/ShortAddress";
import { IS_DEVNET } from "../../../libs/config";

type CompensationDashboardProps = {
  compensationBondNft: Compensation;
  bondDataNft: Array<DataNft>;
};

type CompensationDashboardFormType = {
  compensationEndDate: Date;
  blacklistAddresses: Array<string>;
};

export const CompensationDashboard: React.FC<CompensationDashboardProps> = (props) => {
  const { compensationBondNft, bondDataNft } = props;
  const { address } = useGetAccountInfo();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  // console.log(compensationBondNft);

  const validationSchema = Yup.object().shape({
    compensationEndDate: Yup.date().required("Required"),
    blacklistAddresses: Yup.array().required("Required"),
  });

  // useEffect(() => {
  //   (async () => {
  //     const compensation = await bondContract.viewCompensation(bondNft.bondId);
  //     const contractConfigurationRequest = await bondContract.viewContractConfiguration();
  //
  //     setContractConfiguration(contractConfigurationRequest);
  //     setAllCompensation(compensation);
  //   })();
  // }, [hasPendingTransactions]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<CompensationDashboardFormType>({
    defaultValues: {
      compensationEndDate: new Date(),
      blacklistAddresses: [],
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const compensationEndDate = watch("compensationEndDate");
  const blacklistAddresses = watch("blacklistAddresses");

  const handleInitiateRefund = async (tokenIdentifier: string, nonce: number, timestamp: Date) => {
    const timestampDate = new Date(timestamp).getTime() / 1000;
    const tx = bondContract.initiateRefund(new Address(address), tokenIdentifier, nonce, timestampDate);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const handleInitiateBlacklistLoad = async (compensationId: number) => {
    // const tx = bondContract.(new Address(address), tokenIdentifier, nonce, timestampDate);
    // await sendTransactions({
    //   transactions: [tx],
    // });
    console.log(compensationId);
  };

  return (
    <Flex flexDirection="column" w="full" gap={5}>
      <Flex flexDirection="row" gap={5}>
        <Box w="full">
          {bondDataNft.map((dataNft, index) => {
            if (dataNft.tokenIdentifier === compensationBondNft.tokenIdentifier + "-" + compensationBondNft.nonce.toString(16)) {
              return (
                <Flex flexDirection="column" key={index}>
                  <Flex justifyContent="space-between" py={10}>
                    <Flex flexDirection="column">
                      <Text fontSize="1.5rem">{dataNft.tokenName}</Text>
                      <Text fontSize="1.1rem">
                        Creator: <ShortAddress address={dataNft.creator} fontSize="1.1rem" />
                      </Text>
                      <Text fontSize="1.4rem" fontWeight="600" textColor="indianred">
                        {BigNumber(compensationBondNft.accumulatedAmount)
                          .dividedBy(10 ** 18)
                          .toNumber()}{" "}
                        $ITHEUM Penalties can be claimed
                      </Text>
                      <Text fontSize="1.4rem" fontWeight="600" textColor="teal.200">
                        Compensation claiming is live
                      </Text>
                    </Flex>
                    <Flex flexDirection="column">
                      <Text fontSize="1.35rem" fontWeight="600" pb={2}>
                        Compensation End Date:{" "}
                        {compensationBondNft.endDate * 1000 !== 0 ? new Date(compensationBondNft.endDate * 1000).toDateString() : "Not Set"}
                      </Text>
                      <form onSubmit={handleSubmit(() => handleInitiateRefund(dataNft.tokenIdentifier, dataNft.nonce, compensationEndDate))}>
                        <FormControl isInvalid={!!errors.compensationEndDate} isRequired minH={"3.5rem"}>
                          <Flex flexDirection="row" alignItems="center" gap={3}>
                            <Controller
                              control={control}
                              render={({ field: { onChange } }) => (
                                <Input
                                  mt="1 !important"
                                  id="compensationEndDate"
                                  type="datetime-local"
                                  w="40%"
                                  onChange={(event) => {
                                    onChange(event.target.value);
                                  }}
                                />
                              )}
                              name={"compensationEndDate"}
                            />
                            <FormErrorMessage>{errors?.compensationEndDate?.message}</FormErrorMessage>
                            <Button colorScheme="teal" type="submit">
                              Set
                            </Button>
                          </Flex>
                        </FormControl>
                      </form>
                      <Text fontSize="1.20rem" fontWeight="600">
                        Deposited Data NFT&apos;s for Claiming Compensation
                      </Text>
                      <Flex alignItems="center">
                        <Box pt={4}>
                          <img src={dataNft.nftImgUrl} width="15%" />
                        </Box>
                      </Flex>
                      <Text fontSize="1.20rem" fontWeight="600" pt={3}>
                        Blacklist Load Window
                      </Text>
                      <form onSubmit={handleSubmit(() => handleInitiateBlacklistLoad(compensationBondNft.compensationId))}>
                        <FormControl isInvalid={!!errors.blacklistAddresses} isRequired minH={"3.5rem"}>
                          <Flex flexDirection="row" alignItems="center" gap={3}>
                            <Controller
                              control={control}
                              render={({ field: { onChange } }) => (
                                <Input
                                  mt="1 !important"
                                  id="blacklistAddresses"
                                  type="datetime-local"
                                  w="40%"
                                  onChange={(event) => {
                                    onChange(event.target.value);
                                  }}
                                />
                              )}
                              name={"blacklistAddresses"}
                            />
                            <FormErrorMessage>{errors?.blacklistAddresses?.message}</FormErrorMessage>
                            <Button colorScheme="teal" type="submit">
                              Load
                            </Button>
                          </Flex>
                        </FormControl>
                      </form>
                    </Flex>
                  </Flex>
                </Flex>
              );
            }
          })}
        </Box>
      </Flex>
    </Flex>
  );
};
