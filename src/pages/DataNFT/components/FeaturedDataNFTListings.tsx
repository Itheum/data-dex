import React from "react";
import { Box, Alert, AlertTitle, Heading, AlertDescription, SimpleGrid, Flex, Text, Spacer, Button, CloseButton, Link, useDisclosure } from "@chakra-ui/react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { Link as ReactRouterLink } from "react-router-dom";
import featuredTwoWeeks from "assets/img/banners/datadex-featured-2weeks.png";
import featuredAirdropGuide from "assets/img/banners/datadex-featured-spreadsheet.png";

type FeaturedDataNFTListingsProps = {
  hideCollapseOption?: boolean | undefined;
};

export const FeaturedDataNFTListings: React.FC<FeaturedDataNFTListingsProps> = (props) => {
  const { hideCollapseOption } = props;
  const { isOpen: isFeaturedListingsOpen, onClose, onOpen } = useDisclosure({ defaultIsOpen: true });
  const { tokenLogin } = useGetLoginInfo();

  const isMobile = window.innerWidth <= 480;

  function openExplorerAppWithAuthToken(appLink: string) {
    if (tokenLogin && tokenLogin?.nativeAuthToken) {
      window.open(`${appLink}/?accessToken=${tokenLogin?.nativeAuthToken}`)?.focus();
    } else {
      window.open(`${appLink}`)?.focus();
    }
  }

  return (
    <>
      <Box mx={isFeaturedListingsOpen ? { base: 10, lg: 24 } : { base: "auto", lg: 24 }}>
        {isFeaturedListingsOpen ? (
          <Alert status="success" variant="top-accent" mt={3} rounded="lg">
            <Box display="flex" flexDirection="column" w="full">
              <AlertTitle w={{ base: "auto", lg: "auto" }}>
                <Heading fontFamily="Clash-Medium" p={2} my={4} fontSize={{ base: "16px", lg: "22px" }} textAlign={{ base: "center", lg: "initial" }}>
                  Featured Marketplace Listings
                </Heading>
              </AlertTitle>
              <AlertDescription fontSize="md" w={{ base: "auto", lg: "auto" }}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 3, lg: 10 }}>
                  <Box bgImage={featuredAirdropGuide} bgSize="cover" borderRadius="12px" borderColor="rgba(0, 199, 151, 0.25)" borderWidth="5px" p="2">
                    <Flex direction="column" h="235px">
                      <>
                        <Text fontSize="22px" fontWeight="bold" color="#fff" textAlign={{ base: "center", lg: "initial" }}>
                          Airdrop Guide
                        </Text>
                        <Text display={{ base: "none", lg: "block" }} fontSize="15px" mt="5" color="#fff">
                          This spreadsheet guide provides essential, regularly updated information on incentivized campaigns across multiple chains. Once you
                          own the Data NFT, you can download the spreadsheet using the dedicated Itheum spreadsheets app.
                        </Text>
                        <Text display={{ base: "block", lg: "none" }} lineHeight="normal" textAlign="center" fontSize="10px" mt="5" color="#fff">
                          Once you own the Data NFT, you can download the spreadsheet using the dedicated Itheum spreadsheets app.
                        </Text>
                      </>
                      <Spacer display={{ base: "none", lg: "block" }} />
                      <Flex flexDirection={{ base: "column", md: "row" }} alignItems="center">
                        <Link as={ReactRouterLink} to={"/datanfts/marketplace/DATANFTFT-e936d4-b9"} style={{ textDecoration: "none" }}>
                          <Button size={{ base: "sm", md: "md" }} mt={{ base: "20px", md: "20px" }} colorScheme="teal" borderRadius="8px">
                            <Text>View Data NFT Collection</Text>
                          </Button>
                        </Link>
                        <Button
                          size={{ base: "sm", md: "md" }}
                          mt={{ base: "10px", md: "20px" }}
                          bgGradient="linear(to-r, #ffce00, #ff7201)"
                          _hover={{
                            bgGradient: "linear(to-r, #ff7201, #ffce00)",
                          }}
                          borderRadius="8px"
                          ml={{ base: "0", md: "5" }}
                          onClick={() => openExplorerAppWithAuthToken("https://explorer.itheum.io/spreadsheetnfts")}>
                          <Text color="#0F0F0F">Open App: Download {isMobile ? "File" : "Spreadsheet"}</Text>
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>

                  <Box bgImage={featuredTwoWeeks} bgSize="cover" borderRadius="12px" borderColor="rgba(0, 199, 151, 0.25)" borderWidth="5px" p="2">
                    <Flex direction="column" h="235px">
                      <>
                        <Text fontSize="22px" fontWeight="bold" color="#fff" textAlign={{ base: "center", lg: "initial" }}>
                          TWOWEEK EP
                        </Text>
                        <Text display={{ base: "none", lg: "block" }} fontSize="15px" mt="5" color="#fff" fontWeight="bold">
                          TWOWEEK EP features groundbreaking music with a Web3 twist, released as a series of collectible sets. Once you own a Data NFT, you can
                          stream the tracks directly through NF-Tunes, the dedicated Itheum app.
                        </Text>
                        <Text display={{ base: "block", lg: "none" }} lineHeight="normal" textAlign="center" fontSize="10px" mt="5" color="#fff">
                          Once you own the Data NFT, you can stream the music tracks using the dedicated Itheum app NF-Tunes.
                        </Text>
                      </>
                      <Spacer display={{ base: "none", lg: "block" }} />
                      <Flex flexDirection={{ base: "column", md: "row" }} alignItems="center">
                        <Link as={ReactRouterLink} to={"/datanfts/marketplace/DATANFTFT-e936d4-ae"} style={{ textDecoration: "none" }}>
                          <Button size={{ base: "sm", md: "md" }} mt={{ base: "20px", md: "20px" }} colorScheme="teal" borderRadius="8px">
                            <Text>View Collection 1</Text>
                          </Button>
                        </Link>
                        <Link as={ReactRouterLink} to={"/datanfts/marketplace/DATANFTFT-e936d4-d5"} style={{ textDecoration: "none" }} ml="2">
                          <Button size={{ base: "sm", md: "md" }} mt={{ base: "10px", md: "20px" }} colorScheme="teal" borderRadius="8px">
                            <Text>View Collection 2</Text>
                          </Button>
                        </Link>
                        <Button
                          size={{ base: "sm", md: "md" }}
                          mt={{ base: "10px", md: "20px" }}
                          bgGradient="linear(to-r, #ffce00, #ff7201)"
                          _hover={{
                            bgGradient: "linear(to-r, #ff7201, #ffce00)",
                          }}
                          borderRadius="8px"
                          ml={{ base: "0", md: "5" }}
                          onClick={() => openExplorerAppWithAuthToken("https://explorer.itheum.io/nftunes/?artist-profile=two-week")}>
                          <Text color="#0F0F0F">Open App: Stream Music</Text>
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                </SimpleGrid>
              </AlertDescription>
            </Box>
            {!hideCollapseOption && !isMobile && <CloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={onClose} />}
          </Alert>
        ) : (
          <Button onClick={onOpen} mt={3} size={{ base: "sm", md: "md" }} variant="outline">
            View Featured Marketplace Listings
          </Button>
        )}
      </Box>
    </>
  );
};
