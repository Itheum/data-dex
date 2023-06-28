import React, { FC, useEffect, useState } from "react";
import { Button, HStack, Text, useDisclosure, useColorMode, Box } from "@chakra-ui/react";
import ProcureDataNFTModal from "./ProcureDataNFTModalEVM";
import { itheumTokenRoundUtilExtended } from "../libs/util";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType, OfferType } from "../MultiversX/typesEVM";
import { useChainMeta } from "../store/ChainMetaContext";
import { ethers } from "ethers";

type MarketplaceLowerCardProps = {
  item: ItemType;
  offers: OfferType[];
  nftMetadatas: DataNftMetadataType[];
  index: number;
  itheumPrice: number | undefined;
  marketRequirements: MarketplaceRequirementsType | undefined;
  setMenuItem: any;
  onRefreshTokenBalance: any;
};

const MarketplaceLowerCardEVM: FC<MarketplaceLowerCardProps> = ({
  item,
  index,
  offers,
  nftMetadatas,
  itheumPrice,
  marketRequirements,
  setMenuItem,
  onRefreshTokenBalance,
}) => {
  const { colorMode } = useColorMode();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const [isMyNft, setIsMyNft] = useState<boolean>(false);

  return (
    <>
      {!isMyNft && nftMetadatas[index].transferable === 1 ? (
        <HStack borderTop="solid 1px" pt="5px">
          <Box>
            <Box>{`Fee In Tokens: ${
              nftMetadatas[index]?.feeInTokens === -2
                ? "Loading..."
                : itheumTokenRoundUtilExtended(nftMetadatas[index]?.feeInTokens, 18, ethers.BigNumber, true)
            } ITHEUM`}</Box>
            <Button
              size="sm"
              colorScheme="teal"
              mt="3"
              isDisabled={!!amountErrors[index]}
              onClick={() => {
                setSelectedOfferIndex(index);
                onProcureModalOpen();
              }}>
              Procure Data NFT
            </Button>
          </Box>
        </HStack>
      ) : (
        <HStack h="3rem"></HStack>
      )}

      {amountErrors[index] && (
        <Text color="red.400" fontSize="xs" mt={1}>
          {amountErrors[index]}
        </Text>
      )}

      {selectedOfferIndex >= 0 && nftMetadatas.length > selectedOfferIndex && (
        <ProcureDataNFTModal
          isOpen={isProcureModalOpen}
          onClose={onProcureModalClose}
          itheumPrice={itheumPrice || 0}
          marketContract={null}
          buyerFee={marketRequirements?.buyer_fee || 0}
          nftData={nftMetadatas[selectedOfferIndex]}
          offer={offers[selectedOfferIndex]}
          amount={amountOfTokens[selectedOfferIndex]}
          item={item}
          setMenuItem={setMenuItem}
          onRefreshTokenBalance={onRefreshTokenBalance}
        />
      )}
    </>
  );
};

export default MarketplaceLowerCardEVM;
