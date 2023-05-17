import React from "react";
import { Badge, Box, Stack, Text } from "@chakra-ui/react";
import { guardRailsInfo } from "../../../libs/config";

type Props = {
  item: typeof guardRailsInfo.historicGuardrails | typeof guardRailsInfo.activeGuardrails | typeof guardRailsInfo.upcomingGuardrails;
  title?: string;
  badgeColor?: string;
};

export const GuardRailsCards: React.FC<Props> = (props) => {
  const { item, title, badgeColor } = props;

  return (
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="22px" p={5} maxWidth="22rem">
      <Text as="h2" px={10} fontWeight="500" fontSize="xl">
        {title}
      </Text>
      <Stack mt={5}>
        <Text as="div" pl={3} fontSize="lg">
          Buyer fee:&nbsp;
          {item?.buyer_fee
            ? item?.buyer_fee.map((bf, index) => {
                return (
                  <Badge color={badgeColor} fontSize="0.8em" key={index} mx={1}>
                    {bf ?? "-"}
                  </Badge>
                );
              })
            : "-"}
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Seller fee:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.seller_fee ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          % cut from seller:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.percentage_cut_from_seller ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          % cut from buyer:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.percentage_cut_from_buyer ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Discount fee % seller:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.discount_fee_percentage_seller ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Discount fee % buyer:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.discount_fee_percentage_buyer ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Maximum payment fees:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.maximum_payment_fees ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Accepted payments:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.accepted_payments ?? "-"}
          </Badge>
        </Text>
        <Text as="div" pl={3} fontSize="lg">
          Accepted tokens:&nbsp;
          <Badge color={badgeColor} fontSize="0.8em">
            {item?.accepted_tokens ?? "-"}
          </Badge>
        </Text>
      </Stack>
    </Box>
  );
};
