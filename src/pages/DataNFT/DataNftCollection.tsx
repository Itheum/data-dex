import React, { FC } from "react";
import { Stack, Text, Box, HStack, VStack, Button, Image, Skeleton } from "@chakra-ui/react";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";

type DataNftCollectionComponentProps = {
  nftImageLoading: boolean;
  //setNftImageLoaded: Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
  //nftMetadata: DataNftMetadataType;
  title: string;
  description: string;
  listed: number;
  supply: number;
  floorPrice: number;
  //offer: OfferType;
  //index: number;
  //marketFreezedNonces: number[];
  //grouped: boolean;
  children?: React.ReactNode;
  openNftDetailsDrawer?: (e: number) => void;
};
export const DataNftCollection: FC<DataNftCollectionComponentProps> = ({
  nftImageLoading,
  //setNftImageLoaded,
  imageUrl,
  title,
  description,
  listed,
  supply,

  floorPrice,
  //nftMetadata,
  //index,
  //children,
  //offer,
  //marketFreezedNonces,
  openNftDetailsDrawer,
  //grouped,
}) => {
  return (
    <Skeleton fitContent={true} isLoaded={nftImageLoading} borderRadius="lg" display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <HStack
        transform={{ base: "scale(0.5)", md: "scale(0.75)", lg: "scale(1)" }}
        borderRadius="12px"
        borderColor="rgba(0, 199, 151, 0.25)"
        borderStartWidth="1px"
        borderEndWidth="1px"
        borderTopWidth="1px"
        borderBottomWidth="1px"
        width="600px"
        height="450px"
        padding={"32px"}
        maxWidth="100%">
        <VStack height={"100%"} justifyContent="flex-start" alignItems="flex-start" width={"60%"} gap={"8px"}>
          <Text fontFamily="Satoshi-Medium" lineHeight="1.2" fontWeight="medium" fontSize="28px" color="#FFFFFF">
            {title}
          </Text>
          <Stack overflow={"hidden"} w={"100%"} h={"25%"}>
            <Text overflow="hidden" textOverflow="ellipsis" opacity=".7" fontFamily="Satoshi-Regular" color="#FFFFFF" maxWidth="100%">
              {description}
            </Text>
          </Stack>

          <HStack>
            <Text opacity=".7" fontFamily="Satoshi-Regular" color="#FFFFFF" maxWidth="100%">
              Total supply: {supply}
            </Text>
            <Text ml={"1rem"} opacity=".7" fontFamily="Satoshi-Regular" color="#FFFFFF" maxWidth="100%">
              Listed: {listed}
            </Text>
          </HStack>
          <Text opacity="1" fontFamily="Satoshi-Regular" color="#FFFFFF" maxWidth="100%">
            Floor price: {floorPrice}
          </Text>
          <Stack padding="8px" borderRadius="8px" direction="row" justify="center" align="center" spacing="10px" background="rgba(226, 174, 234, 0.1)">
            <Text opacity=".8" fontFamily="Inter" lineHeight="1.6" fontWeight="medium" fontSize="12px" color="#E2AEEA">
              Fully Transferable License
            </Text>
          </Stack>

          <Button mt={"20px"} colorScheme={"teal"} borderRadius="8px" width="70%" height="12%">
            <Text fontFamily="Inter" lineHeight="1.6" fontWeight="medium" fontSize="14px" color="#0F0F0F">
              View data NFT Collection
            </Text>
          </Button>
          <Button
            mt={"5px"}
            borderRadius="8px"
            width="70%"
            height="12%"
            borderColor="#00C797"
            borderStartWidth="1px"
            borderEndWidth="1px"
            borderTopWidth="1px"
            borderBottomWidth="1px">
            <Text fontFamily="Inter" lineHeight="1.6" fontWeight="medium" fontSize="14px" color="#00C797" textAlign="center">
              Preview Data
            </Text>
          </Button>
        </VStack>
        <VStack position={"relative"} mt={"40%"} height={"100%"} width={"40%"}>
          <Image
            position={"absolute"}
            src={imageUrl}
            alt={"item.dataPreview"}
            h={230}
            w={230}
            mt={"-0.5rem"}
            zIndex={11}
            borderRadius="32px"
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
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
            // onLoad={() => setNftImageLoaded(true)}
            onError={({ currentTarget }) => {
              currentTarget.src = DEFAULT_NFT_IMAGE;
            }}
          />

          {/* <Box opacity="0.3">
            <Box>
              <Stack width="236px" height="236px" borderStartWidth="2.95px" borderEndWidth="2.95px" borderTopWidth="2.95px" borderBottomWidth="2.95px" />
            </Box>
            <Box>
              <Stack width="236px" height="236px">
                <Stack
                  borderRadius="31.47px"
                  width="182.9px"
                  height="182.9px"
                  background="rgba(8, 18, 53, 0.01)"
                  boxShadow="0px 8.85px 31.47px 0px rgba(255, 0, 203, 0.5)"
                />
              </Stack>
            </Box>
            <Box>
              <Stack width="236px" height="236px">
                <Stack
                  borderRadius="31.47px"
                  borderColor="#FF9FCD"
                  borderStartWidth="2.95px"
                  borderEndWidth="2.95px"
                  borderTopWidth="2.95px"
                  borderBottomWidth="2.95px"
                  width="182.9px"
                  height="182.9px"
                  background="#FF439D"
                />
              </Stack>
            </Box>
            <Box>
              <Stack width="236px" height="236px">
                <Box width="153.4px" height="153.4px" />
              </Stack>
            </Box>
            <Box>
              <Stack width="236px" height="236px">
                <Box width="182.9px" height="182.9px" />
              </Stack>
            </Box>
            <Box>
              <Stack width="70.8px" height="70.8px">
                <Stack width="52.12px" height="52.12px" />
              </Stack>
            </Box>
          </Box>  */}
        </VStack>
      </HStack>
    </Skeleton>
  );
};
