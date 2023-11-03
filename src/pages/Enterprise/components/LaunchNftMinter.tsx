import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import * as Yup from "yup";

type LaunchNftMinterType = {
  senderAddress: IAddress;
  collectionName: string;
  tokenTicker: string;
  mintLimit: number;
  requireMintTax: boolean;
  claimsAddress: IAddress;
  taxTokenAmount?: number;
  taxTokenIdentifier?: string;
};

export const LaunchNftMinter: React.FC = () => {
  const validationSchema = Yup.object().shape({
    senderAddress: Yup.mixed<IAddress>().required(),
    collectionName: Yup.string().required(),
    tokenTicker: Yup.string().required(),
    mintLimit: Yup.number().required(),
    requireMintTax: Yup.boolean().required(),
    claimsAddress: Yup.mixed<IAddress>().required(),
    taxTokenAmount: Yup.number(),
    taxTokenIdentifier: Yup.string(),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<LaunchNftMinterType>({
    defaultValues: {
      senderAddress: new Address(),
      collectionName: "",
      tokenTicker: "",
      mintLimit: 0,
      requireMintTax: false,
      claimsAddress: new Address(),
      taxTokenAmount: 0,
      taxTokenIdentifier: "",
    }, // declaring default values for inputs not necessary to declare
    mode: "onChange", // mode stay for when the validation should be applied
    resolver: yupResolver(validationSchema), // telling to React Hook Form that we want to use yupResolver as the validation schema
  });

  const onSubmit = (data: LaunchNftMinterType) => {
    console.log(data);
  };

  return (
    <Box>
      <Text fontSize="2xl" fontFamily="Clash-Bold" py={3}>
        Launch Your Data NFT Collection
      </Text>
      <Flex flexDirection="row">
        <form onSubmit={handleSubmit(onSubmit)}></form>
      </Flex>
    </Box>
  );
};
