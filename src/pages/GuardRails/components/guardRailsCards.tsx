import React from "react";
import { Badge, Box, Stack, Text } from "@chakra-ui/react";
import { guardRailsInfo } from "../../../libs/config";

type Props = {
  type: "activeGuardrails" | "historicGuardrails" | "upcomingGuardrails";
} & typeof guardRailsInfo;

export const GuardRailsCards: React.FC<Props> = (props) => {
  const { type } = props;

  return (
    <Box border="1px solid transparent" borderColor="#00C79750" borderRadius="16px" p={5}>
      {/*<Text as="h2" px={10} fontWeight="500" fontSize="xl">*/}
      {/*  Active Guardrails*/}
      {/*</Text>*/}
      {/*<Stack mt={5}>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Buyer fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {content?.buyer_fee ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {type?.seller_fee ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {type?.percentage_cut_from_seller ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {type?.percentage_cut_from_buyer ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {activeGuardrails?.discount_fee_percentage_seller ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {activeGuardrails?.discount_fee_percentage_buyer ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {activeGuardrails?.maximum_payment_fees ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {activeGuardrails?.accepted_payments ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*  <Text as="div" pl={3} fontSize="lg">*/}
      {/*    Seller fee:&nbsp;*/}
      {/*    <Badge color="teal.200" fontSize="0.8em">*/}
      {/*      {activeGuardrails?.accepted_tokens ?? "-"}*/}
      {/*    </Badge>*/}
      {/*  </Text>*/}
      {/*</Stack>*/}
    </Box>
  );
};
