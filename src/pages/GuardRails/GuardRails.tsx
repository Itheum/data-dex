import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Stack, Tag, TagLabel, TagLeftIcon, Text, useColorMode } from "@chakra-ui/react";
import { ResultsParser } from "@multiversx/sdk-core/out";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { FaWallet } from "react-icons/fa";
import { GuardRailsCards } from "./components/guardRailsCards";
import { NoDataHere } from "../../components/Sections/NoDataHere";
import ShortAddress from "../../components/UtilComps/ShortAddress";
import { contractsForChain, historicGuardrails, upcomingGuardRails } from "../../libs/config";
import { getNetworkProvider } from "../../libs/MultiversX/api";
import { DataNftMintContract } from "../../libs/MultiversX/dataNftMint";
import { convertWeiToEsdt } from "../../libs/utils";
import { useMarketStore, useMintStore } from "../../store";

export const GuardRails: React.FC = () => {
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);
  const [minRoyalties, setMinRoyalties] = useState(-1);
  const [maxRoyalties, setMaxRoyalties] = useState(-1);
  const [maxSupply, setMaxSupply] = useState(-1);
  const [antiSpamTax, setAntiSpamTax] = useState(-1);
  const { colorMode } = useColorMode();

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const userData = useMintStore((state) => state.userData);

  const { chainID } = useGetNetworkConfig();
  const mxDataNftMintContract = new DataNftMintContract(chainID);

  const historyGuardrails = historicGuardrails;

  function formatTimeBetweenMints(milliseconds: number) {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0 && remainingMinutes < 60) {
      return `${remainingMinutes} minutes`;
    } else if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minutes`;
    }
  }

  useEffect(() => {
    (async () => {
      const networkProvider = getNetworkProvider(chainID);
      const interaction = mxDataNftMintContract.contract.methods.getMinRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMinRoyalties(value.toNumber() / 100);
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(chainID);
      const interaction = mxDataNftMintContract.contract.methods.getMaxRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxRoyalties(value.toNumber() / 100);
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(chainID);
      const interaction = mxDataNftMintContract.contract.methods.getMaxSupply();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxSupply(value.toNumber());
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(chainID);
      const interaction = mxDataNftMintContract.contract.methods.getAntiSpamTax([contractsForChain(chainID).itheumToken]);
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setAntiSpamTax(convertWeiToEsdt(value).toNumber());
      }
    })();
  }, [chainID]);

  useEffect(() => {
    (async () => {
      const _whitelistedAddresses = await mxDataNftMintContract.getWhiteList();
      // console.log('_whitelistedAddresses', _whitelistedAddresses);
      setWhitelistedAddresses(_whitelistedAddresses);
    })();
  }, []);

  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading fontSize="36px" fontWeight="medium" mt={14} mb="32px">
        Guard Rails
      </Heading>
      <Flex gap={4} w="full" justifyContent={{ base: "center", lg: "space-between" }} flexWrap="wrap">
        <Box border="1px solid transparent" borderColor="#00C79740" borderRadius="22px" width={{ base: "31.25rem", xl: "24rem", "2xl": "26rem" }}>
          <Text
            textAlign="center"
            fontWeight="600"
            borderTopRadius="22px"
            py={3}
            borderBottom="1px solid"
            borderColor="#00C79740"
            backgroundColor="#00C7970D"
            fontSize="22px">
            Active Guardrails
          </Text>
          <Stack textAlign="start">
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Buyer fee:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.buyer_fee ? `${(marketRequirements?.buyer_fee / 100).toFixed(2)} %` : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Seller fee:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.seller_fee ? `${(marketRequirements.seller_fee / 100).toFixed(2)} %` : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Maximum payment fees:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.maximum_payment_fees ? (marketRequirements.maximum_payment_fees as unknown as number) / Math.pow(10, 18) : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Minimum royalties:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {minRoyalties !== null ? minRoyalties : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Maximum royalties:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {maxRoyalties ? maxRoyalties : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Time between mints:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {!!userData && userData.mintTimeLimit ? formatTimeBetweenMints(userData.mintTimeLimit) : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Max Data NFT supply:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {maxSupply ? maxSupply : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Anti-Spam fee:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {antiSpamTax ? antiSpamTax : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Accepted payments:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.accepted_payments ?? "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg">
              Accepted tokens:&nbsp;
              <Badge backgroundColor="#00C79726" fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="teal.200" fontSize="md" fontWeight="500">
                  {marketRequirements?.accepted_tokens ?? "-"}
                </Text>
              </Badge>
            </Text>
          </Stack>
        </Box>
        <GuardRailsCards items={historyGuardrails} title="History Guardrails" badgeColor="#E2AEEA1A" textColor="#E2AEEA" />

        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" width={{ base: "31.25rem", xl: "20.5rem" }}>
          <Text
            textAlign="center"
            fontWeight="600"
            borderTopRadius="22px"
            py={3}
            borderBottom="1px solid"
            borderColor="#00C79740"
            backgroundColor="#00C7970D"
            fontSize="22px">
            Upcoming Guardrails
          </Text>
          <Stack textAlign="start">
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Buyer fee:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails.buyer_fee ? upcomingGuardRails.buyer_fee : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Seller fee:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.seller_fee ? upcomingGuardRails.seller_fee : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Maximum payment fees:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.maximum_payment_fees ? upcomingGuardRails?.maximum_payment_fees : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Minimum royalties:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.minimum_royalties ? upcomingGuardRails.minimum_royalties : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Maximum royalties:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.maximum_royalties ? upcomingGuardRails?.maximum_royalties : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Time between mints:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.time_between_mints ? upcomingGuardRails?.time_between_mints : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Max Data NFT supply:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.max_data_nft_supply ? upcomingGuardRails?.max_data_nft_supply : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Anti-Spam fee:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.antiSpam_tax ? upcomingGuardRails?.antiSpam_tax : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
              Accepted payments:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.accepted_payments ? upcomingGuardRails?.accepted_payments : "-"}
                </Text>
              </Badge>
            </Text>
            <Text as="div" py={2} pl={7} fontSize="lg">
              Accepted tokens:&nbsp;
              <Badge backgroundColor={colorMode === "dark" ? "#FFFFFF26" : "#0F0F0F20"} fontSize="0.8em" m={1} borderRadius="md">
                <Text as="p" px={3} py={1.5} textColor="white" fontSize="md" fontWeight="500">
                  {upcomingGuardRails?.accepted_tokens ? upcomingGuardRails?.accepted_tokens : "-"}
                </Text>
              </Badge>
            </Text>
          </Stack>
        </Box>
      </Flex>
      <Heading fontSize="36px" fontWeight="medium" mt={32} mb="32px">
        Whitelisted Addresses
      </Heading>
      <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="15px" mb={10} w="full">
        <Flex flexWrap="wrap" justifyContent={{ base: "center", lg: "normal" }} mx={{ base: 0, lg: 10 }} my="5">
          {whitelistedAddresses && whitelistedAddresses.length > 0 ? (
            whitelistedAddresses.map((addr, index) => {
              return (
                <Tag key={index} size="lg" variant="subtle" colorScheme="cyan" m={1.5} maxW="200px">
                  <TagLeftIcon boxSize="12px" as={FaWallet} />
                  <TagLabel>
                    <ShortAddress address={addr} />
                  </TagLabel>
                </Tag>
              );
            })
          ) : (
            <NoDataHere imgFromTop="0rem" />
          )}
        </Flex>
      </Box>
    </Flex>
  );
};
