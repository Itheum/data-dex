import React, { useState, useEffect } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  Center,
  Link,
  Card,
  CardBody,
  Stack,
  SimpleGrid,
  Skeleton,
  useColorMode,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import imgHeroDataNFTs from "img/landing/hero-data-nfts.png";
import imgHeroMetaverseMask from "img/landing/hero-metaverse-mask.png";
import logoSmlD from "img/logo-sml-d.png";
import logoSmlL from "img/logo-sml-l.png";
import { sleep, convertWeiToEsdt } from "libs/util";
import { getNftsByIds } from "MultiversX/api";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { DataNftCondensedView } from "MultiversX/types";
import { hexZero } from "../MultiversX/tokenUtils.js";

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const nonProdEnv = `env:${process.env.REACT_APP_ENV_SENTRY_PROFILE}`;

let pageLoadEffectCalled = false; // flag to prevent on load effect called multiple times
const latestOffersSkeleton: DataNftCondensedView[] = [];

// create the placeholder offers for skeleton loading
for (let i = 0; i < 10; i++) {
  latestOffersSkeleton.push({
    data_nft_id: '',
    offered_token_identifier: '',
    offered_token_nonce: 0,
    offer_index: 0,
    offered_token_amount: '',
    quantity: 0,
    wanted_token_amount: '',
    creator: '',
    tokenName: '',
    title: '',
    nftImgUrl: '',
    royalties: 0,
    feePerSFT: 0
  });
}

const LandingPage = ({ onLaunchMode }: { onLaunchMode?: any }) => {
  const { colorMode } = useColorMode();

  const [loadedOffers, setLoadedOffers] = useState<boolean>(false);
  const [latestOffers, setLatestOffers] = useState<DataNftCondensedView[]>(latestOffersSkeleton);

  const marketContract = new DataNftMarketContract("ED");
  const mintContract = new DataNftMintContract("ED");

  useEffect(() => {
    if (pageLoadEffectCalled) {
      return;
    }

    pageLoadEffectCalled = true;
    (async () => {
      const highestOfferIndex = await marketContract.getHighestOfferIndex(); // 53

      // get latest 10 offers from the SC
      const startIndex = (highestOfferIndex - 11); // 42
      const stopIndex = highestOfferIndex; // 53

      const offers = await marketContract.viewOffers(startIndex, stopIndex);
      console.log('offers', offers);

      // get these offers metadata from the API
      const nftIds = offers.map(offer => `${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}`);
      const dataNfts = await getNftsByIds(nftIds, "ED");

      console.log('dataNfts', dataNfts);

      // merge the offer data and meta data
      const _latestOffers: DataNftCondensedView[] = [];

      offers.forEach((offer, idx) => {
        const _nft = dataNfts.find(nft => `${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}` === nft.identifier);

        if (_nft !== undefined) {
          const _nftMetaData = mintContract.decodeNftAttributes(_nft, idx);

          const tokenAmount = convertWeiToEsdt(BigNumber(offer.wanted_token_amount)).toNumber();

          _latestOffers.push({
            data_nft_id: _nftMetaData.id,
            offered_token_identifier: offer.offered_token_identifier,
            offered_token_nonce: offer.offered_token_nonce,
            offer_index: offer.index,
            offered_token_amount: offer.offered_token_amount,
            quantity: offer.quantity,
            wanted_token_amount: offer.wanted_token_amount,
            creator: _nftMetaData.creator,
            tokenName: _nftMetaData.tokenName,
            title: _nftMetaData.title,
            nftImgUrl: _nftMetaData.nftImgUrl,
            royalties: _nftMetaData.royalties,
            feePerSFT: tokenAmount
          });
        }
      });

      await sleep(2);

      setLatestOffers(_latestOffers);
      setLoadedOffers(true);
    })();
  }, []);

  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";
  let gradientBorder = "linear-gradient(black, black) padding-box, linear-gradient(to right, #FF439D, #00C797) border-box";

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
    gradientBorder = "linear-gradient(white, white) padding-box, linear-gradient(to right, #FF439D, #00C797) border-box";
  }

  return (
    <Container maxW="container.xl">
      <Flex
        bgColor={colorMode === "dark" ? "black" : "white"}
        flexDirection="column"
        justifyContent="space-between"
        minH="100vh"
        boxShadow={containerShadow}
        zIndex={2}>

        <Flex
          h="5rem"
          alignItems="center"
          justifyContent="space-between"
          backgroundColor={colorMode === "light" ? "white" : "black"}
          borderBottom="solid .1rem"
          borderColor="teal.300"
          p="5">
          <HStack alignItems={"center"} spacing={4}>
            <Image boxSize="48px" height="auto" src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />

            <Heading size={"md"} display={["none", "block"]}>
              Itheum Data DEX
            </Heading>
          </HStack>

          {onLaunchMode && <PopupChainSelectorForWallet onMxEnvPick={onLaunchMode} />}
        </Flex>

        <Box backgroundColor={colorMode === "light" ? "white" : "black"} flexGrow="1">
          <Flex w="100%"
            h={["40rem", "45rem"]}
            bgImage={imgHeroMetaverseMask}
            bgSize="contain"
            bgPosition="bottom"
            bgRepeat="no-repeat"
            justifyContent="center">

            <Center w="95%" pt="5rem" backgroundColor="none">
              <Flex w="100%" backgroundColor="none" justifyContent={[null, null, null, "space-between"]} flexDirection={["column", null, "row"]}>
                <Box
                  width={["300px", null, null, "500px", "690px"]}
                  backgroundColor="none"
                  textAlign={["center", null, null, "center", "left"]}
                  m={["auto", "initial"]}>
                  <Heading as="h1" size={["2xl", null, null, "3xl", "4xl"]}>
                    Own and trade{" "}
                    <Text as="span" color="teal.300">
                      your data
                    </Text>{" "}
                    in the Web3 Multiverse
                  </Heading>

                  <Text mt="1rem">
                    Lorem ipsum dolor sit amet consectetur. Turpis vulputate vel elementum nibh viverra cras dui faucibus. Risus in sem viverra adipiscing quam
                    in. Dictum aliquam semper orci molesti.
                  </Text>
                </Box>

                <Box backgroundColor="none" mt={["2rem", "initial"]}>
                  <Image boxSize="480px" height="auto" src={imgHeroDataNFTs} alt="Data NFTs Preview" />
                </Box>
              </Flex>
            </Center>
          </Flex>

          <Box backgroundColor="none" w="95%" m="auto" pt="10" pb="10">
            <Heading as="h2" size="lg" mb="5" textAlign={["center", "initial"]}>
              Recent Data NFTs
            </Heading>

            {(loadedOffers && latestOffers.length === 0) &&
              <Box minHeight={200}>
                <Text>No recent offers available for display...</Text>
              </Box>
            }

            <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(220px, 1fr))">
              {
                latestOffers.map((item: DataNftCondensedView, idx: number) => {
                  return <Card
                    key={idx}
                    maxW="sm"
                    variant="outline"
                    backgroundColor="none"
                    borderRadius="1.5rem"
                    border=".1rem solid transparent"
                    style={{ "background": gradientBorder }}>
                    <CardBody>
                      <Skeleton height='180px' isLoaded={loadedOffers} fadeDuration={1}>
                        <Link href={`/dataNfts/marketplace/${item.data_nft_id}/${item.offer_index}`}>
                          <Image
                            src={item.nftImgUrl}
                            alt="Green double couch with wooden legs"
                            borderRadius="lg"
                          />
                        </Link>
                      </Skeleton>
                      <Skeleton height='75px' isLoaded={loadedOffers} fadeDuration={5}>
                        <Stack mt="3">
                          <Heading size="md" noOfLines={1}>{item.title}</Heading>
                          <Text fontSize="md">Supply Available : {item.quantity}</Text>
                          <Text fontSize="sm">Unlock for {item.feePerSFT === 0 ? 'Free' : `${item.feePerSFT} ITHEUM/NFT`}</Text>
                        </Stack>
                      </Skeleton>
                    </CardBody>
                  </Card>;
                })
              }

              {/* <Card
                maxW="sm"
                variant="outline"
                backgroundColor="none"
                borderRadius="1.5rem"
                border=".1rem solid transparent"
                style={{ "background": gradientBorder }}>
                <CardBody>
                  <Skeleton height='180px' isLoaded={isLoaded} fadeDuration={1}>
                    <Link href="/dataNfts/marketplace/DATANFTFT2-71ac28-79">
                      <Image
                        src="https://devnet-media.elrond.com/nfts/asset/bafkreih7pf65lgyi5gm7n3aapvyai5b23m7tz5m5iwdclw6y4ecwsg35du"
                        alt="Green double couch with wooden legs"
                        borderRadius="lg"
                      />
                    </Link>
                  </Skeleton>
                  <Skeleton height='40px' isLoaded={isLoaded} fadeDuration={2}>
                    <Stack mt="6" spacing="2">
                      <Heading size="md">NFT Short Name</Heading>
                      <Text>Supply Available : 2</Text>
                      <Text>Price : 102 ITHEUM</Text>
                    </Stack>
                  </Skeleton>
                </CardBody>
              </Card> */}
            </SimpleGrid>
          </Box>

          <Box backgroundColor="none" w="95%" m="auto" pt="10" pb="10">
            <Heading as="h2" size="lg" textAlign={["center", "initial"]}>
              Data NFT 101
            </Heading>

            <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
              {Array.from("123").map(idx => (
                <Card
                  key={idx}
                  variant="outline"
                  backgroundColor="none"
                  border="none"
                >
                  <CardBody>
                    <Box>
                      <Image
                        src="https://www.colorbook.io/imagecreator.php?hex=none&width=350&height=200"
                        alt=">Article Title GOES IN HERE"
                        borderRadius="1.5rem"
                        border=".1rem solid transparent"
                        style={{ "background": gradientBorder }}
                      />
                    </Box>
                    <Stack mt="6" spacing="2">
                      <Text>10 March,2023</Text>
                      <Heading size="md" noOfLines={2} h={{ "xl": "12" }}>Article Title GOES IN HERE, CAPS AND it might be two to three lines long</Heading>
                      <Text noOfLines={2}>Lorem ipsum dolor sit amet consectetur. Tui pis vul vulputate vel elementum nibh viverra cri cras duifa faucibus.....</Text>
                      <Link href="https://chakra-ui.com" isExternal textDecoration="underline">Read More</Link>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          <Box backgroundColor="none" w="95%" m="auto" pt="10" pb="10">
            <Heading as="h2" size="lg" textAlign={["center", "initial"]}>
              Articles
            </Heading>

            <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
              {Array.from("123").map(idx => (
                <Card
                  key={idx}
                  variant="outline"
                  backgroundColor="none"
                  border="none"
                >
                  <CardBody>
                    <Box>
                      <Image
                        src="https://www.colorbook.io/imagecreator.php?hex=none&width=350&height=200"
                        alt=">Article Title GOES IN HERE"
                        borderRadius="1.5rem"
                        border=".1rem solid transparent"
                        style={{ "background": gradientBorder }}
                      />
                    </Box>
                    <Stack mt="6" spacing="2">
                      <Text>10 March, 2023</Text>
                      <Heading size="md" noOfLines={2} h={{ "xl": "12" }}>Article Title GOES IN HERE, CAPS AND it might be two to three lines long</Heading>
                      <Text noOfLines={2}>Lorem ipsum dolor sit amet consectetur. Tui pis vul vulputate vel elementum nibh viverra cri cras duifa faucibus.....</Text>
                      <Link href="https://chakra-ui.com" isExternal textDecoration="underline">Read More</Link>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

        </Box>

        <Box backgroundColor={colorMode === "light" ? "white" : "black"} height="5rem" borderTop="solid .1rem" borderColor="teal.300">
          <Flex flexDirection="column" alignItems="center" justifyContent="center" height="100%">
            <Text fontSize="xx-small">
              {dataDexVersion} {nonProdEnv && <>{nonProdEnv}</>}
            </Text>
            <HStack>
              <Link fontSize="xs" href="https://itheum.com/termsofuse" isExternal>
                Terms of Use <ExternalLinkIcon mx={1} />
              </Link>
              <Link fontSize="xs" href="https://itheum.com/privacypolicy" isExternal>
                Privacy Policy <ExternalLinkIcon mx={1} />
              </Link>
            </HStack>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
};

const PopupChainSelectorForWallet = ({ onMxEnvPick }: { onMxEnvPick: any }) => {
  const [showMxEnvPicker, setShowMxEnvPicker] = useState(false);

  return (
    <Popover
      isOpen={showMxEnvPicker}
      onOpen={() => setShowMxEnvPicker(true)}
      onClose={() => setShowMxEnvPicker(false)}
      closeOnBlur={true}
      isLazy
      lazyBehavior="keepMounted">
      <HStack>
        <PopoverTrigger>
          <Button colorScheme="teal" fontSize={{ base: "sm", md: "md" }}>
            Connect MultiversX Wallet
          </Button>
        </PopoverTrigger>
      </HStack>

      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Text fontSize="md">Please pick a MultiversX environment</Text>
        </PopoverHeader>
        <PopoverBody>
          <Button
            size="sm"
            onClick={() => {
              setShowMxEnvPicker(false);
              onMxEnvPick("mx", "mainnet");
            }}>
            {" "}
            Mainnet
          </Button>

          <Button
            size="sm"
            ml="2"
            onClick={() => {
              setShowMxEnvPicker(false);
              onMxEnvPick("mx", "devnet");
            }}>
            {" "}
            Devnet
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default LandingPage;
