import React, { useEffect, useState } from "react";
import { Box, Flex, Heading, Stack, Tag, TagLabel, TagLeftIcon, Text, useColorMode } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { FaWallet } from "react-icons/fa";
import { GuardRailsCards } from "./components/guardRailsCards";
import GuardRailSection from "./components/GuardRailSection";
import { NoDataHere } from "../../components/Sections/NoDataHere";
import ShortAddress from "../../components/UtilComps/ShortAddress";
import { historicGuardrails, upcomingGuardRails } from "../../libs/config";
import { DataNftMintContract } from "../../libs/MultiversX/dataNftMint";
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
    setMinRoyalties(userData?.minRoyalties ?? -1);
    setMaxRoyalties(userData?.maxRoyalties ?? -1);
    setMaxSupply(userData?.maxSupply ?? -1);
    setAntiSpamTax(userData?.antiSpamTaxValue ?? -1);
    //setAntiSpamTax(convertWeiToEsdt(value).toNumber());
  }, []);

  useEffect(() => {
    (async () => {
      const _whitelistedAddresses = await mxDataNftMintContract.getWhiteList();
      setWhitelistedAddresses(_whitelistedAddresses);
    })();
  }, []);

  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
      <Heading fontSize="36px" fontFamily="Clash-Medium" mt={14} mb="32px">
        Guard Rails
      </Heading>
      <Flex gap={4} w="full" justifyContent={{ base: "center", lg: "space-between" }} flexWrap="wrap">
        <Box border="1px solid transparent" borderColor="#00C79740" borderRadius="22px" width={{ base: "31.25rem", xl: "24rem", "2xl": "26rem" }}>
          <Text
            textAlign="center"
            fontFamily="Clash-Medium"
            fontWeight="semibold"
            borderTopRadius="22px"
            py={5}
            h="68px"
            borderBottom="1px solid"
            borderColor="#00C79740"
            backgroundColor="#00C7970D"
            fontSize="xl">
            Active Guardrails
          </Text>
          <Stack textAlign="start">
            <GuardRailSection
              value={marketRequirements.buyerTaxPercentage ? `${(marketRequirements.buyerTaxPercentage / 100).toFixed(2)} %` : "-"}
              title={"Buyer fee"}
              badgeColor={0}
            />

            <GuardRailSection
              value={marketRequirements.sellerTaxPercentage ? `${(marketRequirements.sellerTaxPercentage / 100).toFixed(2)} %` : "-"}
              title={"Seller fee"}
              badgeColor={0}
            />

            <GuardRailSection
              value={marketRequirements.maximumPaymentFees[0] ? Number(marketRequirements.maximumPaymentFees[0]) / Math.pow(10, 18) : "-"}
              title={"Maximum payment fees"}
              badgeColor={0}
            />

            <GuardRailSection value={minRoyalties !== null ? minRoyalties : "-"} title={"Minimum royalties"} badgeColor={0} />

            <GuardRailSection value={maxRoyalties ? maxRoyalties : "-"} title={"Maximum royalties"} badgeColor={0} />

            <GuardRailSection
              value={!!userData && userData.mintTimeLimit ? formatTimeBetweenMints(userData.mintTimeLimit) : "-"}
              title={"Time between mints"}
              badgeColor={0}
            />

            <GuardRailSection
              value={process.env.REACT_APP_MAX_BUY_LIMIT_PER_SFT ? process.env.REACT_APP_MAX_BUY_LIMIT_PER_SFT : "-"}
              title={"Transaction limitation"}
              badgeColor={0}
            />

            <GuardRailSection value={maxSupply ? maxSupply : "-"} title={"Max Data NFT supply"} badgeColor={0} />

            <GuardRailSection value={antiSpamTax ? antiSpamTax : "-"} title={"Anti-Spam fee"} badgeColor={0} />

            <GuardRailSection value={marketRequirements.acceptedPayments ?? "-"} title={"Accepted payments"} badgeColor={0} />

            <GuardRailSection acceptedTokens={marketRequirements.acceptedTokens} title={"Accepted tokens"} badgeColor={0} />
          </Stack>
        </Box>
        <GuardRailsCards items={historyGuardrails} title="Historic Guardrails" badgeColor="#E2AEEA1A" textColor="#E2AEEA" />

        <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" width={{ base: "31.25rem", xl: "20.5rem" }}>
          <Text
            textAlign="center"
            fontFamily="Clash-Medium"
            fontWeight="semibold"
            borderTopRadius="22px"
            py={5}
            h="68px"
            borderBottom="1px solid"
            borderColor="#00C79740"
            backgroundColor="#00C7970D"
            fontSize="xl">
            Upcoming Guardrails
          </Text>
          <Stack textAlign="start">
            <GuardRailSection
              title="Buyer fee"
              value={upcomingGuardRails?.buyer_fee ? upcomingGuardRails.buyer_fee : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Seller fee"
              value={upcomingGuardRails?.seller_fee ? upcomingGuardRails.seller_fee : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Maximum payment fees"
              value={upcomingGuardRails?.maximum_payment_fees ? upcomingGuardRails?.maximum_payment_fees : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Minimum royalties"
              value={upcomingGuardRails?.minimum_royalties ? upcomingGuardRails.minimum_royalties : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Maximum royalties"
              value={upcomingGuardRails?.maximum_royalties ? upcomingGuardRails?.maximum_royalties : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Time between mints"
              value={upcomingGuardRails?.time_between_mints ? upcomingGuardRails?.time_between_mints : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Transaction limitation"
              value={upcomingGuardRails?.transaction_limitation ? upcomingGuardRails?.transaction_limitation : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Max Data NFT supply"
              value={upcomingGuardRails?.max_data_nft_supply ? upcomingGuardRails?.max_data_nft_supply : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Anti-Spam fee"
              value={upcomingGuardRails?.antiSpam_tax ? upcomingGuardRails?.antiSpam_tax : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection
              title="Accepted payments"
              value={upcomingGuardRails?.accepted_payments ? upcomingGuardRails?.accepted_payments : "-"}
              badgeColor={colorMode === "dark" ? 1 : 2}
            />

            <GuardRailSection title="Accepted tokens" acceptedTokens={upcomingGuardRails.accepted_tokens} badgeColor={colorMode === "dark" ? 1 : 2} />
          </Stack>
        </Box>
      </Flex>
      <Heading fontSize="30px" fontFamily="Clash-Medium" mt={32} mb="25px">
        Whitelisted Addresses
      </Heading>
      <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="15px" mb="100px" w="full">
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
