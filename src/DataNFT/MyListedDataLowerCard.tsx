import React, { FC } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { convertWeiToEsdt } from "../libs/util";
import BigNumber from "bignumber.js";
import { tokenDecimals } from "../MultiversX/tokenUtils";

type MyListedDataLowerCardProps = {
  offers: Record<any, any>;
  index: number;
};

const MyListedDataLowerCard: FC<MyListedDataLowerCardProps> = (props) => {
  const {offers, index} = props;
  return (
    <>
    <Flex mt="2" gap="2">
      {offers[index].quantity > 1 && (
        <Button
          size="xs"
          colorScheme="teal"
          width="90px"
          isDisabled={hasPendingTransactions}
          onClick={() => {
            setSelectedOfferIndex(index);
            setDelistAmount(1);
            setDelistModalState(0);
            onDelistModalOpen();
          }}>
          De-List
        </Button>
      )}
      <Button
        size="xs"
        colorScheme="teal"
        width="90px"
        isDisabled={hasPendingTransactions}
        onClick={() => {
          setSelectedOfferIndex(index);
          if (marketRequirements) {
            setNewListingPrice(
              convertWeiToEsdt(
                BigNumber(offers[index].wanted_token_amount)
                  .multipliedBy(amountOfTokens[index])
                  .multipliedBy(10000)
                  .div(10000 + marketRequirements.buyer_fee),
                tokenDecimals(offers[index].wanted_token_identifier)
              ).toNumber()
            );
          } else {
            setNewListingPrice(0);
          }
          onUpdatePriceModalOpen();
        }}>
        Update Price
      </Button>
    </Flex>
  </>
)}
  </>;
};

export default MyListedDataLowerCard;
