import React, { useEffect, useState } from "react";
import { Card, Stack } from "@chakra-ui/react";
import { useMarketStore } from "../../../store";
import { ExtendedOffer } from "../../../libs/types";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { NoDataHere } from "../../../components/Sections/NoDataHere";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";

type BondingCardsProps = {
  bondingOffers: Array<ExtendedOffer>;
};

type BondingDataCreationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

export const BondingCards: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const [bondingOffers, setBondingOffers] = useState<Array<DataNft>>([]);

  const extendedOffers = useMarketStore((state) => state.offers);
  console.log(extendedOffers);
  useEffect(() => {
    (async () => {
      DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");

      const _bondingOffers: Array<BondingDataCreationNftsType> = [];
      // setLoadedOffers(true);

      extendedOffers.forEach((parseBondingOffers) => {
        _bondingOffers.push({ nonce: parseBondingOffers.offeredTokenNonce, tokenIdentifier: parseBondingOffers.offeredTokenIdentifier });
      });

      if (extendedOffers.length === 0) {
        return;
      } else {
        const dataNfts: DataNft[] = await DataNft.createManyFromApi(_bondingOffers);
        setBondingOffers(dataNfts);
      }
    })();
    console.log(bondingOffers);
  }, []);

  return (
    <Stack display="flex" flexDirection={{ base: "column", md: "row" }} flexWrap={"wrap"} gap={7} ml={{ base: 0, md: 16 }} alignItems={"center"}>
      {bondingOffers.length === 0 ? <NoDataHere /> : <Card overflowX="hidden">da</Card>}

      <div>Card 1</div>
      <div>Card 2</div>
      <div>Card 3</div>
    </Stack>
  );
};
