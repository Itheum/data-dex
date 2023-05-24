import React, { Fragment, ReactElement, useEffect, useState } from "react";
import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { guardRailsInfo } from "../../../libs/config";
import { jsx } from "@emotion/react";
import JSX = jsx.JSX;
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { UserDataType } from "../../../libs/MultiversX/types";
import { useMintStore } from "../../../store";

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

  const userData = useMintStore((state) => state.userData);

  useEffect(() => {
    const sellerLabel = (
      <>
        {item.buyer_fee_oldPrice.map((bfo, index) => {
          const buyerNewPrice = item.buyer_fee_newPrice[index];
          const isLower = bfo < buyerNewPrice;

          return (
            <Badge key={index} color={badgeColor} fontSize="0.8em" my={3} mr="-5" p={1.5} borderRadius="lg">
              <Flex flexDirection="row" flexWrap="wrap">
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
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" p={5} width="25rem">
      <Text as="h2" textAlign="center" fontWeight="500" fontSize="xl">
        {title}
      </Text>
      <Stack mt={5}>
        <Text as="div" pl={3} fontSize="lg">
          <Flex flexDirection="row" alignItems="center">
            <Text w="10rem">Buyer fee:&nbsp;</Text>
            <Box overflowY="scroll" height="50px">
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
          Minimum royalties:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {userData?.minRoyalties ? userData?.minRoyalties : "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Maximum royalties:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {userData?.maxRoyalties ? userData?.maxRoyalties : "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Time between mints:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {userData?.mintTimeLimit ? userData?.mintTimeLimit : "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Max Data NFT supply:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {userData?.maxSupply ? userData?.maxSupply : "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Anti-Spam fee:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em" m={1} p={1.5} borderRadius="lg">
            {userData?.antiSpamTaxValue ? userData?.antiSpamTaxValue : "-"}
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
