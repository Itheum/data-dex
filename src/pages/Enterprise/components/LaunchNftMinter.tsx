import React, { useState } from "react";
import { Box, Button, Checkbox, Flex, FormControl, FormErrorMessage, FormLabel, Input, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { getTokenDecimalsRequest } from "../../../libs/MultiversX/api";

type LaunchNftMinterFormType = {
  senderAddress: IAddress;
  collectionName: string;
  tokenTicker: string;
  mintLimit: number;
  requireMintTax: boolean;
  claimsAddress: IAddress;
  taxTokenAmount?: number;
  taxTokenIdentifier?: string;
};

type LaunchNftMinterProps = {
  nftMinter: NftMinter;
};

export const LaunchNftMinter: React.FC<LaunchNftMinterProps> = (props) => {
  const { nftMinter } = props;

  const [isRequiredMintTax, setIsRequiredMintTax] = useState<boolean>(false);

  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();

  const validationSchema = Yup.object().shape({
    senderAddress: Yup.mixed<IAddress>().required(),
    collectionName: Yup.string().required("Collection name is required."),
    tokenTicker: Yup.string().required("Token ticker is required."),
    mintLimit: Yup.number().required("Mint limit is required."),
    requireMintTax: Yup.boolean().required(),
    claimsAddress: Yup.mixed<IAddress>().required("Claim address is required."),
    taxTokenAmount: Yup.number(),
    taxTokenIdentifier: Yup.string(),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<LaunchNftMinterFormType>({
    defaultValues: {
      senderAddress: new Address(address),
      collectionName: "",
      tokenTicker: "",
      mintLimit: 0,
      requireMintTax: isRequiredMintTax,
      taxTokenIdentifier: "",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (formData: LaunchNftMinterFormType) => {
    // console.log(formData);
    if (!formData.requireMintTax) {
      const txWhenRequireMintIsFalse = nftMinter.initializeContract(
        formData.senderAddress,
        formData.collectionName,
        formData.tokenTicker,
        formData.mintLimit,
        formData.requireMintTax,
        formData.claimsAddress
      );
      txWhenRequireMintIsFalse.setGasLimit(100000000);
      await sendTransactions({
        transactions: [txWhenRequireMintIsFalse],
      });
    } else {
      try {
        const tokenRequest = await getTokenDecimalsRequest(formData.taxTokenIdentifier, chainID);

        const txWhenRequireMintIsTrue = nftMinter.initializeContract(
          formData.senderAddress,
          formData.collectionName,
          formData.tokenTicker,
          formData.mintLimit,
          formData.requireMintTax,
          formData.claimsAddress,
          {
            taxTokenIdentifier: formData.taxTokenIdentifier ?? "",
            taxTokenAmount: formData.taxTokenAmount
              ? BigNumber(formData.taxTokenAmount)
                  .multipliedBy(10 ** tokenRequest)
                  .toNumber()
              : 0,
          }
        );
        txWhenRequireMintIsTrue.setGasLimit(100000000);
        await sendTransactions({
          transactions: [txWhenRequireMintIsTrue],
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Box>
      <Text fontSize="2rem" fontFamily="Clash-Medium" py={3}>
        Launch Your Data NFT Collection
      </Text>
      <Flex flexDirection="row">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex gap={6}>
            <Flex flexDirection="column">
              <FormControl isInvalid={!!errors.collectionName} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Collection Name
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="collectionName"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"collectionName"}
                />
                <FormErrorMessage>{errors?.collectionName?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.tokenTicker} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Token Ticker
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="tokenTicker"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"tokenTicker"}
                />
                <FormErrorMessage>{errors?.tokenTicker?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.requireMintTax} minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Require mint tax
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Checkbox
                      colorScheme="teal"
                      mt="1 !important"
                      id="requireMintTax"
                      isChecked={isRequiredMintTax}
                      onChange={(event) => {
                        onChange(event.target.checked);
                        setIsRequiredMintTax(!isRequiredMintTax);
                      }}></Checkbox>
                  )}
                  name={"requireMintTax"}
                />
                <FormErrorMessage>{errors?.requireMintTax?.message}</FormErrorMessage>
              </FormControl>
            </Flex>
            <Flex flexDirection="column">
              <FormControl isInvalid={!!errors.mintLimit} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Time between mints
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="mintLimit"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"mintLimit"}
                />
                <FormErrorMessage>{errors?.mintLimit?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.claimsAddress} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Claim Address
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="claimsAddress"
                      onChange={(event) => {
                        onChange(new Address(event.target.value));
                      }}
                    />
                  )}
                  name={"claimsAddress"}
                />
                <FormErrorMessage>{errors?.claimsAddress?.message}</FormErrorMessage>
              </FormControl>
            </Flex>

            <Flex flexDirection="column">
              <FormControl isInvalid={!!errors.taxTokenAmount} isRequired={isRequiredMintTax} minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Tax token amount
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="taxTokenAmount"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                      disabled={!isRequiredMintTax}
                    />
                  )}
                  name={"taxTokenAmount"}
                />
                <FormErrorMessage>{errors?.taxTokenAmount?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.taxTokenIdentifier} isRequired={isRequiredMintTax} minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Tax token identifier
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="taxTokenIdentifier"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                      disabled={!isRequiredMintTax}
                    />
                  )}
                  name={"taxTokenIdentifier"}
                />
                <FormErrorMessage>{errors?.taxTokenIdentifier?.message}</FormErrorMessage>
              </FormControl>
            </Flex>
          </Flex>
          <Button type="submit" colorScheme="teal" size={{ base: "sm", md: "lg" }}>
            Launch
          </Button>
        </form>
      </Flex>
    </Box>
  );
};
