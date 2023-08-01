import React, { useState } from "react";
import { Badge, Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { historicGuardrails } from "../../../libs/config";

type Props = {
  items: typeof historicGuardrails;
  title?: string;
  badgeColor?: string;
  textColor?: string;
};

export const GuardRailsCards: React.FC<Props> = (props) => {
  const { items, title, badgeColor, textColor } = props;
  const [currentIndex, setCurrentIndex] = useState<number>(items.length - 1);
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
    } else {
      return null;
    }
  };

  const currentItem = items[currentIndex];

  const isLowerBuyerFee = parseInt(currentItem?.buyer_fee_oldPrice ?? "0") < parseInt(currentItem?.buyer_fee_newPrice ?? "0");
  const isHigherBuyerFee = parseInt(currentItem?.buyer_fee_oldPrice ?? "0") > parseInt(currentItem?.buyer_fee_newPrice ?? "0");
  const isEqualBuyerFee = parseInt(currentItem?.buyer_fee_oldPrice ?? "0") === parseInt(currentItem?.buyer_fee_newPrice ?? "0");
  const isNullBuyerFee = "-";

  const isLowerSellerFee = parseInt(currentItem?.seller_fee_oldPrice ?? "0") < parseInt(currentItem?.seller_fee_newPrice ?? "0");
  const isHigherSellerFee = parseInt(currentItem?.seller_fee_oldPrice ?? "0") > parseInt(currentItem?.seller_fee_newPrice ?? "0");
  const isEqualSellerFee = parseInt(currentItem?.seller_fee_oldPrice ?? "0") === parseInt(currentItem?.seller_fee_newPrice ?? "0");
  const isNullSellerFee = "-";

  const isLowerMinRoyalty = parseInt(currentItem?.minimum_royalties_oldPrice ?? "0") < parseInt(currentItem?.minimum_royalties_newPrice ?? "0");
  const isHigherMinRoyalty = parseInt(currentItem?.minimum_royalties_oldPrice ?? "0") > parseInt(currentItem?.minimum_royalties_newPrice ?? "0");
  const isEqualMinRoyalty = parseInt(currentItem?.minimum_royalties_oldPrice ?? "0") === parseInt(currentItem?.minimum_royalties_newPrice ?? "0");
  const isNullMinRoyalty = "-";

  const isLowerMaxRoyalty = parseInt(currentItem?.maximum_royalties_oldPrice ?? "0") < parseInt(currentItem?.maximum_royalties_newPrice ?? "0");
  const isHigherMaxRoyalty = parseInt(currentItem?.maximum_royalties_oldPrice ?? "0") > parseInt(currentItem?.maximum_royalties_newPrice ?? "0");
  const isEqualMaxRoyalty = parseInt(currentItem?.maximum_royalties_oldPrice ?? "0") === parseInt(currentItem?.maximum_royalties_newPrice ?? "0");
  const isNullMaxRoyalty = "-";

  const isLowerTimeBetweenMints = parseInt(currentItem?.time_between_mints_oldPrice ?? "0") < parseInt(currentItem?.time_between_mints_newPrice ?? "0");
  const isHigherTimeBetweenMints = parseInt(currentItem?.time_between_mints_oldPrice ?? "0") > parseInt(currentItem?.time_between_mints_newPrice ?? "0");
  const isEqualTimeBetweenMints = parseInt(currentItem?.time_between_mints_oldPrice ?? "0") === parseInt(currentItem?.time_between_mints_newPrice ?? "0");
  const isNullTimeBetweenMints = "-";

  const isLowerAntiSpamFee = parseInt(currentItem?.antiSpam_tax_oldPrice ?? "0") < parseInt(currentItem?.antiSpam_tax_newPrice ?? "0");
  const isHigherAntiSpamFee = parseInt(currentItem?.antiSpam_tax_oldPrice ?? "0") > parseInt(currentItem?.antiSpam_tax_newPrice ?? "0");
  const isEqualAntiSpamFee = parseInt(currentItem?.antiSpam_tax_oldPrice ?? "0") === parseInt(currentItem?.antiSpam_tax_newPrice ?? "0");
  const isNullAntiSpamFee = "-";

  return (
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" w={{ base: "31.25rem", xl: "27.3rem", "2xl": "31.25rem" }}>
      <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        borderBottom="1px solid"
        borderColor="#00C79740"
        backgroundColor="#00C7970D"
        w="full">
        <Button as={FaChevronLeft} size="sm" isDisabled={currentIndex === items.length - 1} onClick={handlePrevClick} mx="2"></Button>
        <Text textAlign="center" fontWeight="600" borderTopRadius="22px" py={3} fontSize="22px">
          {title}
        </Text>
        <Button as={FaChevronRight} size="sm" isDisabled={currentIndex === 0} onClick={handleNextClick} mx="2"></Button>
      </Flex>
      {/*<motion.div animate={{ x: xPosition }} transition={{ type: "tween", duration: 1 }}>*/}
      <Stack textAlign="start">
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          <Flex flexDirection="row" alignItems="center">
            <Text>Buyer fee:&nbsp;</Text>
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
              {currentItem.buyer_fee_newPrice ? (
                <Flex flexDirection="row" flexWrap="wrap" px={3} py={1.5} fontSize="md" fontWeight="500">
                  {!isEqualBuyerFee ? (
                    <Text as="s" textColor={textColor}>
                      {currentItem.buyer_fee_oldPrice}
                    </Text>
                  ) : (
                    <Text textColor={textColor}>{currentItem.buyer_fee_oldPrice}</Text>
                  )}
                  {isLowerBuyerFee && (
                    <Text as="span" textColor={textColor}>
                      {arrowUp}
                    </Text>
                  )}
                  {isHigherBuyerFee && (
                    <Text as="span" textColor={textColor}>
                      {arrowDown}
                    </Text>
                  )}
                  {isEqualBuyerFee && (
                    <Text as="span" textColor={textColor}>
                      {equal}
                    </Text>
                  )}
                  <Text textColor={textColor}>{currentItem?.buyer_fee_newPrice}</Text>
                  <Text textColor={textColor}>&nbsp;({currentItem.date})</Text>
                </Flex>
              ) : (
                <Text textColor={textColor} px={3} py={1.5}>
                  {isNullBuyerFee}
                </Text>
              )}
            </Badge>
          </Flex>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          <Flex flexDirection="row" alignItems="center">
            <Text>Seller fee:&nbsp;</Text>
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
              {currentItem.seller_fee_newPrice ? (
                <Flex flexDirection="row" flexWrap="wrap" px={3} py={1.5} fontSize="md" fontWeight="500">
                  {!isEqualSellerFee ? (
                    <Text as="s" textColor={textColor}>
                      {currentItem.seller_fee_oldPrice}
                    </Text>
                  ) : (
                    <Text textColor={textColor}>{currentItem.seller_fee_oldPrice}</Text>
                  )}
                  {isLowerSellerFee && (
                    <Text as="span" textColor={textColor}>
                      {arrowUp}
                    </Text>
                  )}
                  {isHigherSellerFee && (
                    <Text as="span" textColor={textColor}>
                      {arrowDown}
                    </Text>
                  )}
                  {isEqualSellerFee && (
                    <Text as="span" textColor={textColor}>
                      {equal}
                    </Text>
                  )}
                  <Text textColor={textColor}>{currentItem.seller_fee_newPrice}</Text>
                  <Text textColor={textColor}>&nbsp;({currentItem.date})</Text>
                </Flex>
              ) : (
                <Text textColor={textColor} px={3} py={1.5}>
                  {isNullSellerFee}
                </Text>
              )}
            </Badge>
          </Flex>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          Maximum payment fees:&nbsp;
          <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
            <Text as="p" px={3} py={1.5} textColor={textColor} fontSize="md" fontWeight="500">
              {currentItem?.maximum_payment_fees ?? "-"}
            </Text>
          </Badge>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          <Flex flexDirection="row" alignItems="center">
            <Text>Minimum royalties:&nbsp;</Text>
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
              {currentItem.minimum_royalties_newPrice ? (
                <Flex flexDirection="row" flexWrap="wrap" px={3} py={1.5} fontSize="md" fontWeight="500">
                  {!isEqualMinRoyalty ? (
                    <Text as="s" textColor={textColor}>
                      {currentItem.minimum_royalties_oldPrice}
                    </Text>
                  ) : (
                    <Text textColor={textColor}>{currentItem.minimum_royalties_oldPrice}</Text>
                  )}
                  {isLowerMinRoyalty && (
                    <Text as="span" textColor={textColor}>
                      {arrowUp}
                    </Text>
                  )}
                  {isHigherMinRoyalty && (
                    <Text as="span" textColor={textColor}>
                      {arrowDown}
                    </Text>
                  )}
                  {isEqualMinRoyalty && (
                    <Text as="span" textColor={textColor}>
                      {equal}
                    </Text>
                  )}
                  <Text textColor={textColor}>{currentItem.minimum_royalties_newPrice}</Text>
                  <Text textColor={textColor}>&nbsp;({currentItem.date})</Text>
                </Flex>
              ) : (
                <Text textColor={textColor} px={3} py={1.5}>
                  {isNullMinRoyalty}
                </Text>
              )}
            </Badge>
          </Flex>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          <Flex flexDirection="row" alignItems="center">
            <Text>Max royalties:&nbsp;</Text>
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
              {currentItem.maximum_royalties_newPrice ? (
                <Flex flexDirection="row" flexWrap="wrap" px={3} py={1.5} fontSize="md" fontWeight="500">
                  {!isEqualMaxRoyalty ? (
                    <Text as="s" textColor={textColor}>
                      {currentItem.maximum_royalties_oldPrice}
                    </Text>
                  ) : (
                    <Text textColor={textColor}>{currentItem.maximum_royalties_oldPrice}</Text>
                  )}
                  {isLowerMaxRoyalty && (
                    <Text as="span" textColor={textColor}>
                      {arrowUp}
                    </Text>
                  )}
                  {isHigherMaxRoyalty && (
                    <Text as="span" textColor={textColor}>
                      {arrowDown}
                    </Text>
                  )}
                  {isEqualMaxRoyalty && (
                    <Text as="span" textColor={textColor}>
                      {equal}
                    </Text>
                  )}
                  <Text textColor={textColor}>{currentItem.maximum_royalties_newPrice}</Text>
                  <Text textColor={textColor}>&nbsp;({currentItem.date})</Text>
                </Flex>
              ) : (
                <Text textColor={textColor} px={3} py={1.5}>
                  {isNullMaxRoyalty}
                </Text>
              )}
            </Badge>
          </Flex>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          <Flex flexDirection="row" alignItems="center">
            <Text>Time between mints:&nbsp;</Text>
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
              {currentItem.time_between_mints_newPrice ? (
                <Flex flexDirection="row" flexWrap="wrap" px={3} py={1.5} fontSize="0.8rem" fontWeight="500">
                  {!isEqualTimeBetweenMints ? (
                    <Text as="s" textColor={textColor} fontWeight="500">
                      {currentItem.time_between_mints_oldPrice}
                    </Text>
                  ) : (
                    <Text textColor={textColor} fontWeight="500">
                      {currentItem.time_between_mints_oldPrice}
                    </Text>
                  )}
                  {isLowerTimeBetweenMints && (
                    <Text as="span" textColor={textColor}>
                      {arrowUp}
                    </Text>
                  )}
                  {isHigherTimeBetweenMints && (
                    <Text as="span" textColor={textColor}>
                      {arrowDown}
                    </Text>
                  )}
                  {isEqualTimeBetweenMints && (
                    <Text as="span" textColor={textColor}>
                      {equal}
                    </Text>
                  )}
                  <Text textColor={textColor} fontWeight="500">
                    {currentItem.time_between_mints_newPrice}
                  </Text>
                  <Text textColor={textColor} fontWeight="500">
                    &nbsp;({currentItem.date})
                  </Text>
                </Flex>
              ) : (
                <Text textColor={textColor} px={3} py={1.5}>
                  {isNullTimeBetweenMints}
                </Text>
              )}
            </Badge>
          </Flex>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          Max Data NFT supply:&nbsp;
          <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
            <Text as="p" px={3} py={1.5} textColor={textColor} fontSize="md" fontWeight="500">
              {currentItem?.max_data_nft_supply ? currentItem?.max_data_nft_supply : "-"}
            </Text>
          </Badge>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          <Flex flexDirection="row" alignItems="center">
            <Text>Anti-Spam fee:&nbsp;</Text>
            <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
              {currentItem.antiSpam_tax_newPrice ? (
                <Flex flexDirection="row" flexWrap="wrap" px={3} py={1.5} fontSize="md" fontWeight="500">
                  {!isEqualAntiSpamFee ? (
                    <Text as="s" textColor={textColor}>
                      {currentItem.antiSpam_tax_oldPrice}
                    </Text>
                  ) : (
                    <Text textColor={textColor}>{currentItem.antiSpam_tax_oldPrice}</Text>
                  )}
                  {isLowerAntiSpamFee && (
                    <Text as="span" textColor={textColor}>
                      {arrowUp}
                    </Text>
                  )}
                  {isHigherAntiSpamFee && (
                    <Text as="span" textColor={textColor}>
                      {arrowDown}
                    </Text>
                  )}
                  {isEqualAntiSpamFee && (
                    <Text as="span" textColor={textColor}>
                      {equal}
                    </Text>
                  )}
                  <Text textColor={textColor}>{currentItem.antiSpam_tax_newPrice}</Text>
                  <Text textColor={textColor}>&nbsp;({currentItem.date})</Text>
                </Flex>
              ) : (
                <Text textColor={textColor} px={3} py={1.5}>
                  {isNullAntiSpamFee}
                </Text>
              )}
            </Badge>
          </Flex>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg" borderBottom="1px solid" borderColor="#00C7971A">
          Accepted payments:&nbsp;
          <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
            <Text as="p" px={3} py={1.5} textColor={textColor} fontSize="md" fontWeight="500">
              {currentItem?.accepted_payments ?? "-"}
            </Text>
          </Badge>
        </Text>
        <Text as="div" py={2} pl={7} fontSize="lg">
          Accepted tokens:&nbsp;
          <Badge backgroundColor={badgeColor} fontSize="0.8em" m={1} borderRadius="md">
            <Text as="p" px={3} py={1.5} textColor={textColor} fontSize="md" fontWeight="500">
              {currentItem?.accepted_tokens ?? "-"}
            </Text>
          </Badge>
        </Text>
      </Stack>
      {/*</motion.div>*/}
    </Box>
  );
};
