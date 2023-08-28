import React from "react";
import { Box, Button, Card, CardBody, Link, Text } from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";

type FeaturedArticlesCardsProps = {
  id: number;
  headerImage: string;
  title: string;
  description: string;
  url: string;
};
export const FeaturedArticlesCards: React.FC<FeaturedArticlesCardsProps> = (props) => {
  const { id, headerImage, title, description, url } = props;
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      w="315px"
      h={{ base: "auto", xl: "414px" }}
      borderColor="transparent"
      borderRadius="20px"
      key={id}>
      <CardBody bgColor="#141414" p={0}>
        <Box>
          <img src={headerImage} alt={title} height="260px !important" />
        </Box>
        <Box display="flex" flexDirection="column" alignItems="left" p={6}>
          <Text fontSize="16px" fontFamily="Satoshi-Regular" mb={2}>
            {title}
          </Text>
          <Text fontSize="16px" fontFamily="Clash-Medium" h="50px">
            {description}
          </Text>
          <Link mt="10" href={url} isExternal>
            <Button
              size="lg"
              colorScheme="teal"
              variant="ghost"
              _hover={{ backgroundColor: "transparent", textDecorationThickness: "1px", textDecorationLine: "underline" }}
              px={0}>
              View Data NFT
              <FaArrowRight style={{ marginInline: "5px" }} />
            </Button>
          </Link>
        </Box>
      </CardBody>
    </Card>
  );
};
