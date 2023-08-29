import React from "react";
import { Box, Button, Card, CardBody, Link, Text, useColorMode } from "@chakra-ui/react";

type TrendingDataCardsProps = {
  id: number;
  headerImage: string;
  title: string;
  description: string;
  url: string;
};
export const TrendingDataCards: React.FC<TrendingDataCardsProps> = (props) => {
  const { id, headerImage, title, description, url } = props;
  const { colorMode } = useColorMode();
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      w="358px"
      h={{ base: "auto", xl: "540px" }}
      borderColor="transparent"
      shadow="md"
      borderRadius="20px"
      key={id}>
      <CardBody bgColor={colorMode === "dark" ? "#141414" : "white"} p={0}>
        <Box h="260px">
          <img src={headerImage} alt={title} height="260px !important" />
        </Box>
        <Box display="flex" flexDirection="column" alignItems="left" p={6}>
          <Text fontSize="21px" fontFamily="Clash-Medium" mb={2}>
            {title}
          </Text>
          <Text fontSize="17px" fontFamily="Satoshi-Light" h="100px">
            {description}
          </Text>
          <Link mt="10" href={url} isExternal>
            <Button size="lg" colorScheme="teal" variant="outline">
              View Data NFT
            </Button>
          </Link>
        </Box>
      </CardBody>
    </Card>
  );
};
