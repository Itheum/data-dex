import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { historicGuardrails } from "../../../libs/config";

type Props = {
  items: typeof historicGuardrails;
  title?: string;
  badgeColor?: string;
};

export const GuardRailsCards: React.FC<Props> = (props) => {
  const { items, title, badgeColor } = props;
  const [currentIndex, setCurrentIndex] = useState<number>(2);
  const [xPosition, setXPosition] = useState<number>(0);

  const arrowUp = "↑";
  const arrowDown = "↓";
  const equal = "~";

  const handleNextClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setXPosition(xPosition + 400);
    }
  };

  const handlePrevClick = () => {
    if (currentIndex < 2) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setXPosition(xPosition - 400);
    }
  };

  const currentItem = items[currentIndex];

  const isLowerBuyerFee = parseInt(currentItem.buyer_fee_oldPrice) < parseInt(currentItem.buyer_fee_newPrice);
  const isHigherBuyerFee = parseInt(currentItem.buyer_fee_oldPrice) > parseInt(currentItem.buyer_fee_newPrice);
  const isEqualBuyerFee = parseInt(currentItem.buyer_fee_oldPrice) === parseInt(currentItem.buyer_fee_newPrice);

  const isLowerSellerFee = parseInt(currentItem.seller_fee_oldPrice) < parseInt(currentItem.seller_fee_newPrice);
  const isHigherSellerFee = parseInt(currentItem.seller_fee_oldPrice) > parseInt(currentItem.seller_fee_newPrice);
  const isEqualSellerFee = parseInt(currentItem.seller_fee_oldPrice) === parseInt(currentItem.seller_fee_newPrice);

  const isLowerMinRoyalty = parseInt(currentItem.minimum_royalties_oldPrice) < parseInt(currentItem.minimum_royalties_newPrice);
  const isHigherMinRoyalty = parseInt(currentItem.minimum_royalties_oldPrice) > parseInt(currentItem.minimum_royalties_newPrice);
  const isEqualMinRoyalty = parseInt(currentItem.minimum_royalties_oldPrice) === parseInt(currentItem.minimum_royalties_newPrice);

  const isLowerMaxRoyalty = parseInt(currentItem.maximum_royalties_oldPrice) < parseInt(currentItem.maximum_royalties_newPrice);
  const isHigherMaxRoyalty = parseInt(currentItem.maximum_royalties_oldPrice) > parseInt(currentItem.maximum_royalties_newPrice);
  const isEqualMaxRoyalty = parseInt(currentItem.maximum_royalties_oldPrice) === parseInt(currentItem.maximum_royalties_newPrice);

  const isLowerTimeBetweenMints = parseInt(currentItem.time_between_mints_oldPrice) < parseInt(currentItem.time_between_mints_newPrice);
  const isHigherTimeBetweenMints = parseInt(currentItem.time_between_mints_oldPrice) > parseInt(currentItem.time_between_mints_newPrice);
  const isEqualTimeBetweenMints = parseInt(currentItem.time_between_mints_oldPrice) === parseInt(currentItem.time_between_mints_newPrice);

  const isLowerAntiSpamFee = parseInt(currentItem.antiSpam_tax_oldPrice) < parseInt(currentItem.antiSpam_tax_newPrice);
  const isHigherAntiSpamFee = parseInt(currentItem.antiSpam_tax_oldPrice) > parseInt(currentItem.antiSpam_tax_newPrice);
  const isEqualAntiSpamFee = parseInt(currentItem.antiSpam_tax_oldPrice) === parseInt(currentItem.antiSpam_tax_newPrice);

  return (
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" w="31.25rem">
      <Text
        textAlign="center"
        fontWeight="600"
        borderTopRadius="22px"
        py={3}
        borderBottom="1px solid"
        borderColor="#00C79740"
        backgroundColor="#00C7970D"
        fontSize="22px">
        {title}
      </Text>
      <Flex flexDirection="row" alignItems="center">
        <Button as={FaChevronLeft} size="sm" isDisabled={currentIndex === items.length - 1} onClick={handlePrevClick} mr="auto"></Button>
        {/*<motion.div animate={{ x: xPosition }} transition={{ type: "tween", duration: 1 }}>*/}
        <Stack w="26rem">
          <Text as="div" pl={3} fontSize="lg" overflow="hidden">
            <Flex flexDirection="row" alignItems="center">
              <Text>Buyer fee:&nbsp;</Text>
              {currentItem.buyer_fee_newPrice ? (
                <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                  <Flex flexDirection="row" flexWrap="wrap">
                    {!isEqualBuyerFee ? (
                      <Text as="s" textColor="#E2AEEA">
                        {currentItem.buyer_fee_oldPrice}
                      </Text>
                    ) : (
                      <Text textColor="#E2AEEA">{currentItem.buyer_fee_oldPrice}</Text>
                    )}
                    {isLowerBuyerFee && arrowUp}
                    {isHigherBuyerFee && arrowDown}
                    {isEqualBuyerFee && equal}
                    <Text>{currentItem.buyer_fee_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                </Badge>
              ) : (
                <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                  {"-"}
                </Badge>
              )}
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text>Seller fee:&nbsp;</Text>
              <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {(
                  <Flex flexDirection="row" flexWrap="wrap">
                    {!isEqualSellerFee ? <Text as="s">{currentItem.seller_fee_oldPrice}</Text> : <Text>{currentItem.seller_fee_oldPrice}</Text>}
                    {isLowerSellerFee && arrowUp}
                    {isHigherSellerFee && arrowDown}
                    {isEqualSellerFee && equal}
                    <Text>{currentItem.seller_fee_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                ) ?? "-"}
              </Badge>
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Maximum payment fees:&nbsp;
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.maximum_payment_fees ?? "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text>Minimum royalties:&nbsp;</Text>
              <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {(
                  <Flex flexDirection="row" flexWrap="wrap">
                    {!isEqualMinRoyalty ? <Text as="s">{currentItem.minimum_royalties_oldPrice}</Text> : <Text>{currentItem.minimum_royalties_oldPrice}</Text>}
                    {isLowerMinRoyalty && arrowUp}
                    {isHigherMinRoyalty && arrowDown}
                    {isEqualMinRoyalty && equal}
                    <Text>{currentItem.minimum_royalties_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                ) ?? "-"}
              </Badge>
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text>Max royalties:&nbsp;</Text>
              <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {(
                  <Flex flexDirection="row" flexWrap="wrap">
                    {!isEqualMaxRoyalty ? <Text as="s">{currentItem.maximum_royalties_oldPrice}</Text> : <Text>{currentItem.maximum_royalties_oldPrice}</Text>}
                    {isLowerMaxRoyalty && arrowUp}
                    {isHigherMaxRoyalty && arrowDown}
                    {isEqualMaxRoyalty && equal}
                    <Text>{currentItem.maximum_royalties_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                ) ?? "-"}
              </Badge>
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text w={20}>Time between mints:&nbsp;</Text>
              <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {(
                  <Flex flexDirection="row" flexWrap="wrap">
                    {!isEqualTimeBetweenMints ? (
                      <Text as="s">{currentItem.time_between_mints_oldPrice}</Text>
                    ) : (
                      <Text>{currentItem.time_between_mints_oldPrice}</Text>
                    )}
                    {isLowerTimeBetweenMints && arrowUp}
                    {isHigherTimeBetweenMints && arrowDown}
                    {isEqualTimeBetweenMints && equal}
                    <Text>{currentItem.time_between_mints_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                ) ?? "-"}
              </Badge>
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Max Data NFT supply:&nbsp;
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.max_data_nft_supply ? currentItem?.max_data_nft_supply : "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text w={20}>Anti-Spam fee:&nbsp;</Text>
              <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                {(
                  <Flex flexDirection="row" flexWrap="wrap">
                    {!isEqualAntiSpamFee ? <Text as="s">{currentItem.antiSpam_tax_oldPrice}</Text> : <Text>{currentItem.antiSpam_tax_oldPrice}</Text>}
                    {isLowerAntiSpamFee && arrowUp}
                    {isHigherAntiSpamFee && arrowDown}
                    {isEqualAntiSpamFee && equal}
                    <Text>{currentItem.antiSpam_tax_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                ) ?? "-"}
              </Badge>
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Accepted payments:&nbsp;
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.accepted_payments ?? "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Accepted tokens:&nbsp;
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.accepted_tokens ?? "-"}
            </Badge>
          </Text>
        </Stack>
        {/*</motion.div>*/}
        <Button as={FaChevronRight} size="sm" isDisabled={currentIndex === 0} onClick={handleNextClick} ml="auto"></Button>
      </Flex>
    </Box>
  );
};
