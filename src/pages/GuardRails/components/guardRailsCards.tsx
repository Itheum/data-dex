import React, { Fragment, ReactElement, useEffect, useState } from "react";
import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { guardRailsInfo } from "../../../libs/config";
import { jsx } from "@emotion/react";
import JSX = jsx.JSX;
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

type Props = {
  item: typeof guardRailsInfo.historicGuardrails | typeof guardRailsInfo.upcomingGuardrails;
  title?: string;
  badgeColor?: string;
};

export const GuardRailsCards: React.FC<Props> = (props) => {
  const { item, title, badgeColor } = props;
  const [buyer, setBuyer] = useState<React.ReactNode>();
  const arrowUp = "↑";
  const arrowDown = "↓";
  const equal = "~";

  useEffect(() => {
    const sellerLabel = (
      <>
        {item.buyer_fee_oldPrice.map((bfo, index) => {
          const buyerNewPrice = item.buyer_fee_newPrice[index];
          const isLower = bfo < buyerNewPrice;

          return (
            <Badge key={index} color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
              <Flex flexDirection="row">
                <Text as="s">{bfo}</Text>
                {isLower ? arrowUp : arrowDown}
                <Text>{item.buyer_fee_newPrice[index]}</Text>
                <Text>&nbsp;({item.date[index]})</Text>
              </Flex>
            </Badge>
          );
        })}
      </>
    );
    setBuyer(sellerLabel);
  }, []);

  return (
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" p={5} maxWidth="22rem">
      <Text as="h2" textAlign="center" fontWeight="500" fontSize="xl">
        {title}
      </Text>
      <Stack mt={5}>
        <Text as="div" pl={3} fontSize="lg">
          <Flex flexDirection="column">
            Buyer fee:&nbsp;
            <Box overflowY="scroll" height="40px">
              {buyer ? buyer : "-"}
            </Box>
          </Flex>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Seller fee:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {item?.seller_fee ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Maximum payment fees:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {item?.maximum_payment_fees ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Accepted payments:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {item?.accepted_payments ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Accepted tokens:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {item?.accepted_tokens ?? "-"}
          </Badge>
        </Text>
      </Stack>
    </Box>
  );
};
