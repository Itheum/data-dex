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
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const arrowUp = "↑";
  const arrowDown = "↓";
  const equal = "~";

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (currentIndex > items.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const currentItem = items[currentIndex];

  const isLower = currentItem.buyer_fee_oldPrice < currentItem.buyer_fee_newPrice;

  return (
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" p={5} width="26rem">
      <Text as="h2" textAlign="center" fontWeight="500" fontSize="xl">
        {title}
      </Text>
      <Flex flexDirection="row" alignItems="center">
        <Button as={FaChevronLeft} size="sm" isDisabled={currentIndex === 0} onClick={handlePrevClick}></Button>
        <Stack mt={5}>
          <Text as="div" pl={3} fontSize="lg">
            <Flex flexDirection="row" alignItems="center">
              <Text>Buyer fee:&nbsp;</Text>
              {currentItem.buyer_fee_newPrice ? (
                <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
                  <Flex flexDirection="row" flexWrap="wrap">
                    <Text as="s">{currentItem.buyer_fee_oldPrice}</Text>
                    {isLower ? arrowUp : arrowDown}
                    <Text>{currentItem.buyer_fee_newPrice}</Text>
                    <Text>&nbsp;({currentItem.date})</Text>
                  </Flex>
                </Badge>
              ) : (
                "-"
              )}
            </Flex>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Seller fee:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem ? currentItem?.seller_fee_oldPrice : "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Maximum payment fees:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.maximum_payment_fees ?? "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Minimum royalties:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.minimum_royalties !== null ? currentItem?.minimum_royalties : "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Maximum royalties:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.maximum_royalties ? currentItem?.maximum_royalties : "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Time between mints:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.time_between_mints ? currentItem?.time_between_mints : "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Max Data NFT supply:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.max_data_nft_supply ? currentItem?.max_data_nft_supply : "-"}
            </Badge>
          </Text>
          <Text as="div" pl={3} fontSize="lg">
            Anti-Spam fee:&nbsp;
            <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              {currentItem?.antiSpam_tax ? currentItem?.antiSpam_tax : "-"}
            </Badge>
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
        <Button as={FaChevronRight} size="sm" isDisabled={currentIndex === items.length - 1} onClick={handleNextClick}></Button>
      </Flex>
    </Box>
  );
};
