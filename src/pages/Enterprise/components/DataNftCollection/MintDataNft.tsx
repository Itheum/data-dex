import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { isValidNumericCharacter } from "../../../../libs/utils";
import BigNumber from "bignumber.js";

type MintDataNftFormType = {
  senderAddress: IAddress;
  tokenName: string;
  dataMarshallUrl: string;
  dataStreamUrl: string;
  dataPreviewUrl: string;
  royalties: number;
  datasetTitle: string;
  datasetDescription: string;
  antiSpamTax?: number;
  antiSpamTokenIdentifier?: string;
  imageUrl?: string;
  nftStorageToken?: string;
  traitsUrl?: string;
};

type MintDataNftProps = {
  nftMinter: NftMinter;
  antiSpamTaxToken: string;
};
export const MintDataNft: React.FC<MintDataNftProps> = (props) => {
  const { nftMinter, antiSpamTaxToken } = props;
  const [antiSpamTaxAmount, setAntiSpamTaxAmount] = useState<number>(0);

  const { address } = useGetAccountInfo();

  useEffect(() => {
    (async () => {
      const mintRequirements = await nftMinter.viewMinterRequirements(new Address(address), antiSpamTaxToken);
      // console.log(mintRequirements);
      setAntiSpamTaxAmount(mintRequirements.antiSpamTaxValue);
    })();
  }, []);

  const validationSchema = Yup.object().shape({
    senderAddress: Yup.mixed<IAddress>().required(),
    tokenName: Yup.string()
      .required("Token name is required")
      .min(3, "Token Name should be between 3 and 20 characters.")
      .max(20, "Token Name should be between 3 and 20 characters.")
      .matches(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are allowed"),
    dataMarshallUrl: Yup.string().required(),
    dataStreamUrl: Yup.string().required("Data Stream URL is required"),
    dataPreviewUrl: Yup.string().required("Data Preview URL is required"),
    royalties: Yup.number()
      .required("Royalties are required")
      .min(0, "Royalties should be between 0 and 50")
      .max(50, "Royalalties should be between 0 and 50")
      .typeError("Royalties must be a number"),
    datasetTitle: Yup.string()
      .required("Dataset title is required")
      .min(10, "Dataset Title should be between 10 and 60")
      .max(60, "Dataset Title should be between 10 and 60"),
    datasetDescription: Yup.string()
      .required("Dataset description is required")
      .min(10, "Dataset Title should be between 10 and 400")
      .max(400, "Dataset Title should be between 10 and 400"),
    antiSpamTax: Yup.number(),
    antiSpamTokenIdentifier: Yup.string(),
    imageUrl: Yup.string(),
    nftStorageToken: Yup.string(),
    traitsUrl: Yup.string(),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<MintDataNftFormType>({
    defaultValues: {
      senderAddress: new Address(address),
      dataMarshallUrl: "https://api.itheumcloud-stg.com/datamarshalapi/router/v1",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const onClickMint = async (data: MintDataNftFormType) => {
    if (antiSpamTaxToken === "") {
      const txWhenNoRequiredMintTax = await nftMinter.mint(
        new Address(address),
        data.tokenName,
        data.dataMarshallUrl,
        data.dataStreamUrl,
        data.dataPreviewUrl,
        data.royalties * 100,
        data.datasetTitle,
        data.datasetDescription,
        {
          antiSpamTax: data.antiSpamTax,
          antiSpamTokenIdentifier: data.antiSpamTokenIdentifier,
          imageUrl: data.imageUrl,
          nftStorageToken: data.nftStorageToken,
          traitsUrl: data.traitsUrl,
        }
      );

      txWhenNoRequiredMintTax.setGasLimit(100000000);
      await sendTransactions({
        transactions: [txWhenNoRequiredMintTax],
      });
    } else {
      const txWhenRequiredMintTax = await nftMinter.mint(
        new Address(address),
        data.tokenName,
        data.dataMarshallUrl,
        data.dataStreamUrl,
        data.dataPreviewUrl,
        data.royalties * 100,
        data.datasetTitle,
        data.datasetDescription,
        {
          antiSpamTax: BigNumber(antiSpamTaxAmount).toNumber(),
          antiSpamTokenIdentifier: antiSpamTaxToken,
          imageUrl: data.imageUrl,
          nftStorageToken: data.nftStorageToken,
          traitsUrl: data.traitsUrl,
        }
      );
      txWhenRequiredMintTax.setGasLimit(100000000);
      await sendTransactions({
        transactions: [txWhenRequiredMintTax],
      });
    }
  };

  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" color="teal.200">
        Mint On-Demand Data NFTs
      </Text>
      <Text size="1rem" pb={5} opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
        Ideally, you will use an automated script to mint large number of Data NFTs using a sequential index. But, you can also use the below form to mint
        single Data NFTs, on-demand. This will be useful primarily in test collections
      </Text>

      <Flex flexDirection="row">
        <form onSubmit={handleSubmit(onClickMint)}>
          <Flex gap={6} flexDirection={{ base: "column", xl: "row" }}>
            <Flex flexDirection="column" minW="18.1rem">
              <FormControl isInvalid={!!errors.tokenName} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Token Name
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="tokenName"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"tokenName"}
                />
                <FormErrorMessage>{errors?.tokenName?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.dataStreamUrl} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Data Stream URL
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="dataStreamUrl"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"dataStreamUrl"}
                />
                <FormErrorMessage>{errors?.dataStreamUrl?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.dataPreviewUrl} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Data Preview URL
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="dataPreviewUrl"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"dataPreviewUrl"}
                />
                <FormErrorMessage>{errors?.dataPreviewUrl?.message}</FormErrorMessage>
              </FormControl>
            </Flex>
            <Flex flexDirection="column" minW="18.1rem">
              <FormControl isInvalid={!!errors.dataMarshallUrl} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Data Marshal
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="dataMarshallUrl"
                      value="https://api.itheumcloud-stg.com/datamarshalapi/router/v1"
                      disabled
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"dataMarshallUrl"}
                />
                <FormErrorMessage>{errors?.dataMarshallUrl?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.royalties} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Royalty
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <NumberInput
                      mt="1 !important"
                      size="md"
                      id="royalties"
                      maxW={24}
                      step={1}
                      minW="18.1rem"
                      defaultValue={0}
                      min={0}
                      max={50}
                      isValidCharacter={isValidNumericCharacter}
                      onChange={(valueAsString: string) => {
                        onChange(valueAsString);
                      }}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                  name={"royalties"}
                />
                <FormErrorMessage>{errors?.royalties?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.datasetTitle} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Token Title
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="datasetTitle"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"datasetTitle"}
                />
                <FormErrorMessage>{errors?.datasetTitle?.message}</FormErrorMessage>
              </FormControl>
            </Flex>
            <Flex flexDirection="column" minW="18.1rem">
              <FormControl isInvalid={!!errors.datasetDescription} isRequired minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Token Description
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="datasetDescription"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"datasetDescription"}
                />
                <FormErrorMessage>{errors?.datasetDescription?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.imageUrl} minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Image URL
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="imageUrl"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"imageUrl"}
                />
                <FormErrorMessage>{errors?.imageUrl?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.traitsUrl} minH={"6.25rem"}>
                <FormLabel fontWeight="bold" fontSize="md">
                  Trait URL
                </FormLabel>

                <Controller
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Input
                      mt="1 !important"
                      id="traitsUrl"
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                    />
                  )}
                  name={"traitsUrl"}
                />
                <FormErrorMessage>{errors?.traitsUrl?.message}</FormErrorMessage>
              </FormControl>
            </Flex>
          </Flex>
          <Button type="submit" colorScheme="teal" size={{ base: "sm", md: "lg" }} mb={5}>
            Mint
          </Button>
        </form>
      </Flex>
    </Box>
  );
};
