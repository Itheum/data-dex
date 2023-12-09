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
import ShortAddress from "../../../../components/UtilComps/ShortAddress";

type UpdateOtherSettingsFormType = {
  addressToClaim: string;
};

type UpdateOtherSettingsProps = {
  nftMinter: NftMinter;
  claimAddress: string;
};

export const UpdateOtherSettings: React.FC<UpdateOtherSettingsProps> = (props) => {
  const { nftMinter, claimAddress } = props;

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
      <Text fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200">
        Royalty Settings:
      </Text>

      <Flex flexDirection="column" justifyItems="start" alignItems="start" gap={3}>
        <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={2} w="full">
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <FormControl isInvalid={!!errors.addressToClaim} id="addressToSetRoleForTransfer" isRequired minH={"6rem"}>
              <FormLabel fontWeight="bold" fontSize="md">
                Change Claims Address:
              </FormLabel>
              <Flex flexDirection="row" alignItems="center" gap={2}>
                <Input mt="1 !important" {...register("addressToClaim", { required: "Address is required!" })} w="80%" placeholder="Enter Address" />
                <Button type="submit" variant="outline" colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
                  Change
                </Button>
              </Flex>
              <FormErrorMessage>{errors?.addressToClaim?.message}</FormErrorMessage>
            </FormControl>
          </form>
        </Flex>
        <Text fontSize="0.85rem" opacity=".7" fontFamily="Satoshi-Regular">
          *Note that once you click claim, they will go to your claim address of <ShortAddress address={claimAddress} fontSize="md" />
        </Text>
      </Flex>
    </Box>
  );
};
