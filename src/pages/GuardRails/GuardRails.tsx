import React, { useEffect, useState } from "react";
import { Badge, Box, Flex, Heading, Stack, Tag, TagLabel, TagLeftIcon, Text } from "@chakra-ui/react";
import { historicGuardrails, whitelistWallets } from "../../libs/config";
import { GuardRailsCards } from "./components/guardRailsCards";
import { useMarketStore, useMintStore } from "../../store";
import { FaWallet } from "react-icons/fa";
import ShortAddress from "../../components/UtilComps/ShortAddress";
import { getNetworkProvider } from "../../libs/MultiversX/api";
import { convertWeiToEsdt } from "../../libs/utils";
import { useChainMeta } from "../../store/ChainMetaContext";
import { DataNftMintContract } from "../../libs/MultiversX/dataNftMint";
import { ResultsParser } from "@multiversx/sdk-core/out";

export const GuardRails: React.FC = () => {
  const [whitelistedAddress, setWhitelistedAddress] = useState<React.ReactNode>();
  const [minRoyalties, setMinRoyalties] = useState(-1);
  const [maxRoyalties, setMaxRoyalties] = useState(-1);
  const [maxSupply, setMaxSupply] = useState(-1);
  const [antiSpamTax, setAntiSpamTax] = useState(-1);

  const marketRequirements = useMarketStore((state) => state.marketRequirements);
  const userData = useMintStore((state) => state.userData);

  const { chainMeta: _chainMeta } = useChainMeta();
  const mxDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);

  const historyGuardrails = historicGuardrails;

  useEffect(() => {
    if (!_chainMeta.networkId) return;

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
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
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
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
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
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
      const networkProvider = getNetworkProvider(_chainMeta.networkId, undefined);
      const interaction = mxDataNftMintContract.contract.methods.getAntiSpamTax([_chainMeta.contracts.itheumToken]);
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setAntiSpamTax(convertWeiToEsdt(value).toNumber());
      }
    })();
  }, [_chainMeta.networkId]);

  useEffect(() => {
    const whitelistMap = (
      <>
        {whitelistWallets.map((wl, index) => {
          return (
            <Tag key={index} size="lg" variant="subtle" colorScheme="cyan" m={1.5} maxW="200px">
              <TagLeftIcon boxSize="12px" as={FaWallet} />
              <TagLabel>
                <ShortAddress address={wl} />
              </TagLabel>
            </Tag>
          );
        })}
      </>
    );
    setWhitelistedAddress(whitelistMap);
  }, []);

  // useEffect(() => {
  //   console.log("SALUUUTTTTTTT", minRoyalties);
  // }, [minRoyalties]);

  return (
    <Flex as="div" flexDirection="column" mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading size="xl" fontWeight="medium">
        Guard Rails
      </Heading>
      <Flex gap={4} w="full" justifyContent={{ base: "center", lg: "space-between" }} mt={5} flexWrap="wrap">
        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" p={5} width="25rem">
          <Text as="h2" textAlign="center" fontWeight="500" fontSize="xl">
            Active Guardrails
          </Text>
          <Stack mt={5}>
            <Text as="div" pl={3} fontSize="lg">
              Buyer fee:&nbsp;
              {marketRequirements?.buyer_fee ? (
                <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                  {`${(marketRequirements?.buyer_fee / 100).toFixed(2)} %` ?? "-"}
                </Badge>
              ) : (
                "-"
              )}
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Seller fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {marketRequirements?.seller_fee ? `${(marketRequirements.seller_fee / 100).toFixed(2)} %` : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Maximum payment fees:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {marketRequirements?.maximum_payment_fees ? (marketRequirements.maximum_payment_fees as unknown as number) / Math.pow(10, 18) : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Minimum royalties:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {minRoyalties !== null ? minRoyalties : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Maximum royalties:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {maxRoyalties ? maxRoyalties : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Time between mints:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {userData?.mintTimeLimit ? new Date(userData.lastUserMintTime + userData.mintTimeLimit).toLocaleString() : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Max Data NFT supply:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {maxSupply ? maxSupply : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Anti-Spam fee:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {antiSpamTax ? antiSpamTax : "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Accepted payments:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {marketRequirements?.accepted_payments ?? "-"}
              </Badge>
            </Text>
            <Text as="div" pl={3} fontSize="lg">
              Accepted tokens:&nbsp;
              <Badge color="teal.200" fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {marketRequirements?.accepted_tokens ?? "-"}
              </Badge>
            </Text>
          </Stack>
        </Box>
        <GuardRailsCards items={historyGuardrails} title="History Guardrails" badgeColor="red.200" />
      </Flex>
      <Heading size="xl" fontWeight="medium" my={6}>
        Whitelisted addresses
      </Heading>
      <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="15px" mb={5} w="full">
        <Flex flexWrap="wrap" justifyContent={{ base: "center", lg: "normal" }} mx={{ base: 0, lg: 10 }} my="5">
          {whitelistedAddress}
        </Flex>
      </Box>
    </Flex>
  );
};
