import React from "react";
import { Box, Button, Center, Heading, HStack, Link, Stack, StackDivider } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MENU } from "libs/util";

export default function ({ setMenuItem }: { setMenuItem: any }) {
  const navigate = useNavigate();

  return (
    <Stack spacing={5} mt={10}>
      <Box maxW="sm" borderWidth="1px" p="10" m="auto" borderRadius="lg" w="80%" maxWidth="initial">
        <Center flexDirection="column">
          <Heading size="lg" mb={10}>
            Data NFT
          </Heading>
          <HStack divider={<StackDivider borderColor="gray.200" />} spacing={4} alignItems="baseline" flexDirection={["column", "initial"]}>
            <Box fontSize="sm" flex="1">
              Highly personal or sensitive datasets can essentially function as a NFT allowing for uniqueness and limited availability
            </Box>
            <Box fontSize="sm" flex="1">
              Allow for resale in secondary markets and earn royalties if your data is resold. i.e. if a buyer resells your data, you can earn a % as royalty
            </Box>
            <Box fontSize="sm" flex="1">
              To make it more akin to a collectible, datasets are converted to a unique visual representation of that data using unique hash algorithms.
            </Box>
          </HStack>

          <HStack spacing="5" mt="10">
            <Button
              colorScheme="teal"
              onClick={() => {
                setMenuItem(MENU.NFTMINE);
                navigate("wallet");
              }}>
              Data NFT Wallet
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                setMenuItem(MENU.NFTALL);
                navigate("marketplace/market");
              }}>
              Data NFT Marketplace
            </Button>
          </HStack>

          <Link mt="10" href="https://dev.to/itheum/itheum-data-dex-whitepaper-ooo#data-nfts-1" isExternal>
            <Button size="xs" colorScheme="teal" variant="outline">
              Read about Data NFTs in our Whitepaper
            </Button>
          </Link>
        </Center>
      </Box>
    </Stack>
  );
}
