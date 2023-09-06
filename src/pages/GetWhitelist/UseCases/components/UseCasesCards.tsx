import React from "react";
import { Badge, Box, Card, CardBody, Flex, Stack, Text } from "@chakra-ui/react";

type CardProps = {
  id: number;
  color: string;
  bgGradient: string;
  badgeContent: string;
  isReleased: boolean;
  headerIcon: string;
  headerText: string;
  bodyContent: string;
  bodyImage: string;
};

export const UseCasesCards: React.FC<CardProps> = (props) => {
  const { id, bgGradient, color, badgeContent, isReleased, headerIcon, headerText, bodyContent, bodyImage } = props;
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      w="405px"
      h={{ base: "auto", xl: "660px" }}
      borderColor="#FFFFFF33"
      borderRadius="20px"
      bgColor="transparent"
      key={id}>
      <CardBody bgGradient={bgGradient} p={9}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Badge bgColor={color + "1A"} px={3} py={1} rounded="lg" textColor={color} fontSize="md" fontFamily="Satoshi-Regular" lineHeight="24px">
            {badgeContent}
          </Badge>
          {!isReleased ? <Text fontSize="sm">COMING SOON!</Text> : <></>}
        </Stack>
        <Stack direction="row" alignItems="center" mt={10}>
          <Flex>
            <Box boxSize="63px" bgColor="#1F1E1E" rounded="full" display="flex" justifyContent="center" alignItems="center">
              <img src={headerIcon} alt={badgeContent} />
            </Box>
          </Flex>
          <Text fontSize="24px" lineHeight="30px" fontWeight="600" textAlign="left" ml={0}>
            {headerText}
          </Text>
        </Stack>
        <hr style={{ marginTop: "25px", marginBottom: "25px" }} />

        <Stack direction="column" alignItems="center">
          <Text fontFamily="Satoshi-Light" h="120px">
            {bodyContent}
          </Text>
          <img src={bodyImage} alt={bodyContent} style={{ marginTop: "70px" }} />
        </Stack>
      </CardBody>
    </Card>
  );
};
