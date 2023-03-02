import React, { FC, useEffect, useState } from "react";
import { Button, Flex, useDisclosure } from "@chakra-ui/react";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { convertWeiToEsdt } from "../libs/util";
import { getNftsByIds } from "../MultiversX/api";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { hexZero, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, MarketplaceRequirementsType } from "../MultiversX/types";

type MyListedDataLowerCardProps = {
  offers: Record<any, any>;
  nftMetadatas: DataNftMetadataType[];
  index: number;
};

const MyListedDataLowerCard: FC<MyListedDataLowerCardProps> = (props) => {
  const { offers, index, nftMetadatas } = props;
  const { hasPendingTransactions } = useGetPendingTransactions();
  const contract = new DataNftMarketContract("ED");
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [delistAmount, setDelistAmount] = useState<number>(1);
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const _marketRequirements = await contract.getRequirements();
      console.log("_marketRequirements", _marketRequirements);
      setMarketRequirements(_marketRequirements);

      if (_marketRequirements) {
        const _maxPaymentFeeMap: Record<string, number> = {};
        for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
            _marketRequirements.maximum_payment_fees[i],
            tokenDecimals(_marketRequirements.accepted_payments[i])
          ).toNumber();
        }
        setMaxPaymentFeeMap(_maxPaymentFeeMap);
      } else {
        setMaxPaymentFeeMap({});
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // init - no selection
      setSelectedOfferIndex(-1);
    })();
  }, [hasPendingTransactions]);

  return (
    <>
      <Button
        mt="2"
        size="sm"
        colorScheme="teal"
        height="7"
        variant="outline"
        onClick={() => {
          window.open(nftMetadatas[index].dataPreview);
        }}>
        Preview Data
      </Button>

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
  );
};

export default MyListedDataLowerCard;
