import React from "react";
import { NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Text } from "@chakra-ui/react";

type UpdateOtherSettingsFormType = {
  addressToClaim: string;
};

type UpdateOtherSettingsProps = {
  nftMinter: NftMinter;
};

export const UpdateOtherSettings: React.FC<UpdateOtherSettingsProps> = (props) => {
  const { nftMinter } = props;

  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();

  const validationSchema = Yup.object().shape({
    addressToClaim: Yup.string().required("You have to enter the address that will claim!"),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<UpdateOtherSettingsFormType>({
    defaultValues: {
      addressToClaim: "",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const setClaimAddress = async (addressToClaim: string) => {
    const tx = nftMinter.setClaimsAddress(new Address(address), new Address(addressToClaim));
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const onSubmit = (data: UpdateOtherSettingsFormType) => {
    setClaimAddress(data.addressToClaim);
  };

  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" color="teal.200">
        Update Other Settings:
      </Text>

      <Text size="1rem" opacity=".7" fontWeight="light">
        * Change the address that can get the royalties.
      </Text>

      <Flex flexDirection="column" justifyItems="start" alignItems="start" gap={3}>
        <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={5} fontSize="xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.addressToClaim} id="addressToSetRoleForTransfer" isRequired minH={"6.25rem"}>
              <FormLabel fontWeight="bold" fontSize="md">
                Change Claims Address:
              </FormLabel>
              <Input mt="1 !important" {...register("addressToClaim", { required: "Address is required!" })} />
              <FormErrorMessage>{errors?.addressToClaim?.message}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
              Change
            </Button>
          </form>
        </Flex>
      </Flex>
    </Box>
  );
};
