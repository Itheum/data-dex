import React, { Fragment, useEffect, useState } from "react";
import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useMintStore } from "../../../store";
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

  const arrowUp = "↑";
  const arrowDown = "↓";
  const equal = "~";

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (currentIndex < 2) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
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
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" p={5} w="27rem">
      <Text as="h2" textAlign="center" fontWeight="500" fontSize="xl">
        {title}
      </Text>
      <Flex flexDirection="row" alignItems="center">
        <Button as={FaChevronLeft} size="sm" isDisabled={currentIndex === items.length - 1} onClick={handleNextClick} mr="auto"></Button>
        <Stack mt={5} w="20rem">
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text>Buyer fee:&nbsp;</Text>
              {currentItem.buyer_fee_newPrice ? (
                <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                  <Flex flexDirection="row" flexWrap="wrap">
                    {!isEqualBuyerFee ? <Text as="s">{currentItem.buyer_fee_oldPrice}</Text> : <Text>{currentItem.buyer_fee_oldPrice}</Text>}
                    {isLowerBuyerFee && arrowUp}
                    {isHigherBuyerFee && arrowDown}
                    {isEqualBuyerFee && equal}
                    <Text>{currentItem.buyer_fee_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                </Badge>
              ) : (
                <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                  {"-"}
                </Badge>
              )}
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text>Seller fee:&nbsp;</Text>
              <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
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
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.maximum_payment_fees ?? "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text>Min royalties:&nbsp;</Text>
              <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
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
              <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
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
              <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
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
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.max_data_nft_supply ? currentItem?.max_data_nft_supply : "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text w={20}>Anti-Spam fee:&nbsp;</Text>
              <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
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
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.accepted_payments ?? "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Accepted tokens:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.accepted_tokens ?? "-"}
            </Badge>
          </Text>
        </Stack>
        <Button as={FaChevronRight} size="sm" isDisabled={currentIndex === 0} onClick={handlePrevClick} ml="auto"></Button>
      </Flex>
    </Box>
  );
};
