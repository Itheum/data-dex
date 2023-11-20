import React, { useEffect, useState } from "react";
import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Text, Tooltip } from "@chakra-ui/react";
import { NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AiOutlineClose } from "react-icons/ai";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";

type WhitelistControlProps = {
  nftMinter: NftMinter;
};

type WhitelistControlFormType = {
  addressToWhitelist: string;
};
export const WhitelistControl: React.FC<WhitelistControlProps> = (props) => {
  const { nftMinter } = props;

  const [viewWhitelistedAddress, setViewWhitelistedAddress] = useState<Array<string>>([]);

  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();

  const validationSchema = Yup.object().shape({
    addressToWhitelist: Yup.string().required("You have to enter the address to whitelist!"),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<WhitelistControlFormType>({
    defaultValues: {
      addressToWhitelist: "",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    (async () => {
      const getWhitelistedAddress = await nftMinter.viewWhitelist();

      setViewWhitelistedAddress(getWhitelistedAddress);
    })();
  }, [hasPendingTransactions]);

  const removeWhitelist = async (addressToRemove: string) => {
    const tx = nftMinter.removeWhitelist(new Address(address), [addressToRemove]);
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };
  const addWhitelist = async (addressToAdd: string) => {
    const tx = nftMinter.whitelist(new Address(address), [addressToAdd]);
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  // console.log(viewWhitelistedAddress.length);
  const onSubmit = (data: WhitelistControlFormType) => {
    addWhitelist(data.addressToWhitelist);
  };

  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" color="teal.200">
        Whitelist Control:
      </Text>
      <Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
        Control who is whitelisted to mint
      </Text>

      <Flex flexDirection="column" justifyItems="start" alignItems="start" gap={3}>
        <Text fontSize="xl" fontFamily="Clash-Medium" pt={4}>
          Addresses whitelisted to mint:
        </Text>
        <Flex flexDirection={"row"} flexWrap="wrap" gap={4} justifyContent="space-between" wordBreak="break-word">
          {viewWhitelistedAddress.map((whitelistAddress, index) => {
            return (
              <Flex key={index} justifyContent="center" alignItems="center">
                <Box background="transparent" border="1px solid" borderColor="teal.200" rounded="lg" roundedEnd="0px">
                  <Text color="teal.200" p={2}>
                    {whitelistAddress}
                  </Text>
                </Box>
                <Tooltip label="Exclude address" aria-label="Exclude address">
                  <Button
                    size="md"
                    variant="outline"
                    color="red.200"
                    borderColor="red.200"
                    roundedStart="0px"
                    ml="2px"
                    onClick={() => removeWhitelist(whitelistAddress)}>
                    <AiOutlineClose />
                  </Button>
                </Tooltip>
              </Flex>
            );
          })}
          {viewWhitelistedAddress.length === 0 && (
            <Text color="teal.200" p={2}>
              No whitelisted address yet.
            </Text>
          )}
        </Flex>
        <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={5} fontSize="xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.addressToWhitelist} id="addressToWhitelist" isRequired minH={"6.25rem"}>
              <FormLabel fontWeight="bold" fontSize="md">
                Add Address to whitelist:
              </FormLabel>
              <Input mt="1 !important" {...register("addressToWhitelist", { required: "Address is required!" })} />
              <FormErrorMessage>{errors?.addressToWhitelist?.message}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
              Add
            </Button>
          </form>
        </Flex>
      </Flex>
    </Box>
  );
};
