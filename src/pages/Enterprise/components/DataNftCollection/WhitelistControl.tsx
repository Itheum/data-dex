import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Flex, FormControl, FormErrorMessage, FormLabel, IconButton, Input, Text, Tooltip } from "@chakra-ui/react";
import { NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AiOutlineClose } from "react-icons/ai";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import ShortAddress from "../../../../components/UtilComps/ShortAddress";

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
      <Text fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200">
        Whitelist Control:
      </Text>

      <Flex flexDirection="column" justifyItems="start" alignItems="start" gap={3}>
        <Text fontSize="xl" fontFamily="Clash-Medium" pt={3}>
          Addresses whitelisted to mint:
        </Text>
        <Flex flexDirection={"row"} flexWrap="wrap" gap={4} justifyContent="space-between" wordBreak="break-word">
          {viewWhitelistedAddress.map((whitelistAddress, index) => {
            return (
              <Flex key={index} justifyContent="center" alignItems="center">
                <ButtonGroup size="sm" isAttached variant="outline" colorScheme="teal">
                  <Box border="1px solid" borderColor="teal.200" rounded="lg" roundedRight="0px">
                    <Text color="teal.200" px={2} cursor="default" pt={0.5}>
                      <ShortAddress address={whitelistAddress} fontSize="lg" />
                    </Text>
                  </Box>

                  <Tooltip label="Exclude address" aria-label="Exclude address">
                    <IconButton
                      aria-label="Exclude Address"
                      icon={<AiOutlineClose />}
                      roundedLeft="0"
                      bgColor="#00C7970D"
                      onClick={() => removeWhitelist(whitelistAddress)}
                    />
                  </Tooltip>
                </ButtonGroup>
              </Flex>
            );
          })}
          {viewWhitelistedAddress.length === 0 && (
            <Text color="#B86350" fontSize="md">
              *No addresses yet
            </Text>
          )}
        </Flex>
        <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={2} w="full">
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <FormControl isInvalid={!!errors.addressToWhitelist} id="addressToWhitelist" isRequired minH={"6.25rem"}>
              <FormLabel fontWeight="bold" fontSize="md">
                Add Address to whitelist:
              </FormLabel>

              <Flex flexDirection="row" alignItems="center" gap={2}>
                <Input mt="1 !important" {...register("addressToWhitelist", { required: "Address is required!" })} w="80%" placeholder="Enter Address" />
                <Button type="submit" variant="outline" colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
                  Add
                </Button>
              </Flex>
              <FormErrorMessage>{errors?.addressToWhitelist?.message}</FormErrorMessage>
            </FormControl>
          </form>
        </Flex>
      </Flex>
    </Box>
  );
};
