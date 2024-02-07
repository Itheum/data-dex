import React, { FC } from "react";
import { Stack, Text, HStack, VStack, Button, Image, Skeleton, Tooltip } from "@chakra-ui/react";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { useMarketStore } from "store";
import { convertToLocalString, shouldPreviewDataBeEnabled, viewDataDisabledMessage } from "libs/utils";
import { useLocalStorage } from "libs/hooks";
import { PREVIEW_DATA_ON_DEVNET_SESSION_KEY } from "libs/config";
import { useGetLoginInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";

type DataNftCollectionComponentProps = {
  index: number;
  nftImageLoading: boolean;
  imageUrl: string;
  title: string;
  description: string;
  listed: number;
  supply: number;
  floorPrice: number;
  children?: React.ReactNode;
  openNftDetailsDrawer?: (e: number) => void;
  dataPreview?: string;
};

export const DataNftCollection: FC<DataNftCollectionComponentProps> = ({
  index,
  nftImageLoading,
  imageUrl,
  title,
  description,
  listed,
  supply,
  floorPrice,
  openNftDetailsDrawer,
  dataPreview,
}) => {
  const itheumPrice = useMarketStore((state) => state.itheumPrice);
  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);
  const { chainID } = useGetNetworkConfig();
  const { loginMethod } = useGetLoginInfo();
  return (
    <Skeleton
      transform={{ base: "scale(0.5) ", sm: "scale(0.6)", md: "scale(0.75)", xl: "scale(1)" }}
      fitContent={true}
      isLoaded={nftImageLoading}
      borderRadius="lg"
      display={"flex"}
      alignItems={"start"}
      justifyContent={"center"}
      marginLeft={{ base: "-140px", sm: "0px" }}
      marginBottom={{ base: "-100px", sm: "-80px", md: "-60px", xl: "0px" }}
      marginTop={{ base: "-100px", md: "0px" }}>
      <HStack
        borderRadius="12px"
        borderColor="rgba(0, 199, 151, 0.25)"
        borderStartWidth="1px"
        borderEndWidth="1px"
        borderTopWidth="1px"
        borderBottomWidth="1px"
        width={"600px"}
        height={"450px"}
        padding={"32px"}>
        <VStack height={"100%"} justifyContent="flex-start" alignItems="flex-start" width={"60%"} gap={"8px"}>
          <Text fontFamily="Satoshi-Medium" lineHeight="1.2" fontWeight="medium" fontSize="28px">
            {title}
          </Text>
          <Stack overflow={"hidden"} w={"100%"} h={"25%"}>
            <Text overflow="hidden" textOverflow="ellipsis" opacity=".7" fontFamily="Satoshi-Regular" maxWidth="100%">
              {description}
            </Text>
          </Stack>

          <HStack>
            <Text opacity=".7" fontFamily="Satoshi-Regular" maxWidth="100%">
              Total supply: {supply}
            </Text>
            <Text ml={"1rem"} opacity=".7" fontFamily="Satoshi-Regular" maxWidth="100%">
              Listed: {listed}
            </Text>
          </HStack>
          <Text opacity="1" fontFamily="Satoshi-Regular" maxWidth="100%">
            Floor price: {floorPrice} ITHEUM {floorPrice && itheumPrice ? `(~${convertToLocalString(floorPrice * itheumPrice, 2)} USD)` : ""}
          </Text>
          <Stack padding="8px" borderRadius="8px" direction="row" justify="center" align="center" spacing="10px" background="rgba(226, 174, 234, 0.1)">
            <Text opacity=".8" fontFamily="Inter" lineHeight="1.6" fontWeight="medium" fontSize="12px" color="#E2AEEA">
              Fully Transferable License
            </Text>
          </Stack>

          <Button
            onClick={() => openNftDetailsDrawer && openNftDetailsDrawer(index)}
            mt={"20px"}
            colorScheme={"teal"}
            borderRadius="8px"
            width="70%"
            height="12%">
            <Text fontFamily="Inter" lineHeight="1.6" fontWeight="medium" fontSize="14px" color="#0F0F0F">
              View Data NFT Collection
            </Text>
          </Button>
          <Tooltip label={viewDataDisabledMessage(loginMethod)} isDisabled={shouldPreviewDataBeEnabled(chainID, loginMethod, previewDataOnDevnetSession)}>
            <Button
              mt={"5px"}
              borderRadius="8px"
              width="70%"
              height="12%"
              borderColor="#00C797"
              borderStartWidth="1px"
              borderEndWidth="1px"
              borderTopWidth="1px"
              borderBottomWidth="1px"
              isDisabled={!shouldPreviewDataBeEnabled(chainID, loginMethod, previewDataOnDevnetSession)}
              onClick={() => {
                window.open(dataPreview);
              }}>
              <Text fontFamily="Inter" lineHeight="1.6" fontWeight="medium" fontSize="14px" textAlign="center">
                Preview Data
              </Text>
            </Button>
          </Tooltip>
        </VStack>
        <VStack
          cursor={"pointer"}
          position={"relative"}
          my={"40%"}
          height={"40%"}
          width={"40%"}
          onClick={() => openNftDetailsDrawer && openNftDetailsDrawer(index)}>
          <Image
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            mt={"-0.5rem"}
            zIndex={11}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.9}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={10}
            mt={"-1rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.8}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={9}
            mt={"-1.5rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.7}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={8}
            mt={"-2rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.6}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={7}
            mt={"-2.5rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.5}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={6}
            mt={"-3.0rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.4}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={5}
            mt={"-3.5rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.3}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={4}
            mt={"-4rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.2}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={3}
            mt={"-4.5rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
          <Image
            opacity={0.1}
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            zIndex={3}
            mt={"-5rem"}
            borderRadius="32px"
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />
        </VStack>
      </HStack>
    </Skeleton>
  );
};
