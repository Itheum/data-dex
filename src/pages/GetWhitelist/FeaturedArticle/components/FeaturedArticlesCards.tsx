import React from "react";
import { Box, Button, Card, CardBody, Link, Text, useColorMode } from "@chakra-ui/react";
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
  const { colorMode } = useColorMode();
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      w="300px"
      h={{ base: "auto", xl: "414px" }}
      borderColor="transparent"
      shadow="md"
      borderRadius="35px"
      key={id}>
      <CardBody bgColor={colorMode === "dark" ? "#141414" : "white"} p={0}>
        <img src={headerImage} alt={title} />
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
              Read More
              <FaArrowRight style={{ marginInline: "5px" }} />
            </Button>
          </Link>
        </Box>
      </CardBody>
    </Card>
  );
};
