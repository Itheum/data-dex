import React, { Dispatch, FC, SetStateAction } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Flex,
  Image,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import BigNumber from "bignumber.js";
import moment from "moment/moment";
import { ShortAddress } from "./ShortAddress";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, uxConfig } from "../libs/util";
import { convertToLocalString, printPrice } from "../libs/util2";
import { getApi } from "../MultiversX/api";
import { getTokenWantedRepresentation, hexZero, tokenDecimals } from "../MultiversX/tokenUtils";
import { DataNftMetadataType, ItemType, MarketplaceRequirementsType } from "../MultiversX/types";
import { useChainMeta } from "../store/ChainMetaContext";

type UpperCardComponentProps = {
  nftImageLoading: boolean;
  setNftImageLoading: Dispatch<SetStateAction<boolean>>;
  nftMetadataLoading: boolean;
  nftMetadatas: DataNftMetadataType[];
  userData: Record<any, any>;
  marketRequirements: MarketplaceRequirementsType | undefined;
  item?: ItemType;
  index: number;
  marketFreezedNonces: number[];
  children?: React.ReactNode;
  loadDetailsDrawer?: any;
  itheumPrice: number | undefined;
};

const UpperCardComponent: FC<UpperCardComponentProps> = (props) => {
  const {
    nftImageLoading,
    nftMetadataLoading,
    setNftImageLoading,
    nftMetadatas,
    userData,
    index,
    children,
    item,
    marketRequirements,
    marketFreezedNonces,
    loadDetailsDrawer,
    itheumPrice,
  } = props;
  // Multiversx API
  const { address } = useGetAccountInfo();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  const [feePrice, setFeePrice] = useState<string>("");
  const [fee, setFee] = useState<number>(0);

  useEffect(() => {
    setFeePrice(
      printPrice(
        convertWeiToEsdt(item?.wanted_token_amount as BigNumber.Value, tokenDecimals(item?.wanted_token_identifier)).toNumber(),
        getTokenWantedRepresentation(item?.wanted_token_identifier, item?.wanted_token_nonce)
      )
    );
    setFee(convertWeiToEsdt(item?.wanted_token_amount as BigNumber.Value, tokenDecimals(item?.wanted_token_identifier)).toNumber());
  }, []);

  return (
    <Flex wrap="wrap" gap="5" key={index}>
      <Box
        maxW="xs"
        borderWidth="1px"
        borderRadius="lg"
        overflow="wrap"
        mb="1rem"
        position="relative"
        w="13.5rem">
        <Flex justifyContent="center" pt={5}>
          <Skeleton isLoaded={nftImageLoading} h={200}>
            {item?.offered_token_identifier ? (
              <Image
                src={`https://${getApi(_chainMeta.networkId)}/nfts/${item?.offered_token_identifier}-${hexZero(item?.offered_token_nonce)}/thumbnail`}
                alt={"item.dataPreview"}
                h={200}
                w={200}
                borderRadius="md"
                cursor="pointer"
                onLoad={() => setNftImageLoading(true)}
                onClick={() => loadDetailsDrawer(nftMetadatas[index].id)}
              />
            ) : (
              <Image src={item.nftImgUrl} alt={item.dataPreview} h={200} w={200} borderRadius="md" onLoad={() => setNftImageLoading(true)} />
            )}
          </Skeleton>
        </Flex>

        <Flex h="28rem" p="3" direction="column" justify="space-between">
          {nftMetadataLoading && <Skeleton />}
          {!nftMetadataLoading && nftMetadatas[index] && (
            <>
              <Text fontSize="xs">
                <Link href={`${ChainExplorer}/nfts/${nftMetadatas[index].id}`} isExternal>
                  {nftMetadatas[index].tokenName} <ExternalLinkIcon mx="2px" />
                </Link>
              </Text>
              <Popover trigger="hover" placement="auto">
                <PopoverTrigger>
                  <div>
                    <Text fontWeight="bold" fontSize="lg" mt="2">
                      {nftMetadatas[index].title.length > 20 ? nftMetadatas[index].title.substring(0, 19) + "..." : nftMetadatas[index].title}
                    </Text>

                    <Flex flexGrow="1">
                      <Text fontSize="md" mt="2" color="#929497" noOfLines={2} w="100%" h="10">
                        {nftMetadatas[index].description}
                      </Text>
                    </Flex>
                  </div>
                </PopoverTrigger>
                <PopoverContent mx="2" width="220px" mt="-7">
                  <PopoverHeader fontWeight="semibold">{nftMetadatas[index].title}</PopoverHeader>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <Text fontSize="sm" mt="2" color="gray.200">
                      {nftMetadatas[index].description}
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </>
          )}
          {address && <>{children}</>}
        </Flex>

        <Box
          position="absolute"
          top="0"
          bottom="0"
          left="0"
          right="0"
          height="100%"
          width="100%"
          backgroundColor="blackAlpha.800"
          rounded="lg"
          visibility={
            userData.addressFrozen
              || (userData.frozenNonces && item
                && (userData.frozenNonces.includes(item.offered_token_nonce) || marketFreezedNonces.includes(item.offered_token_nonce)))
              ? "visible" : "collapse"
          }
        >
          <Text fontSize="md" position="absolute" top="45%" textAlign="center" px="2">
            - FROZEN - <br />
            Data NFT is under investigation by the DAO as there was a complaint received against it
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default UpperCardComponent;
