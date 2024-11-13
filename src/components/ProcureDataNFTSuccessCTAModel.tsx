import React from "react";
import { Box, Button, Stack, Flex, Modal, ModalBody, ModalContent, ModalOverlay, Text, useColorMode } from "@chakra-ui/react";
import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useNavigate } from "react-router-dom";
import ExploreAppButton from "components/UtilComps/ExploreAppButton";
import NftMediaComponent from "./NftMediaComponent";

export interface ProcureDataNFTSuccessCTAModelProps {
  isOpen: boolean;
  onClose: () => void;
  nftData?: Partial<DataNft>;
}

export default function ProcureDataNFTSuccessCTAModel({ isOpen, onClose, nftData }: ProcureDataNFTSuccessCTAModelProps) {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay bg="#00c79794" />
        <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <ModalBody py={6}>
            <Text fontSize={"22px"} textAlign="center" fontWeight="bold" mb="3" color="teal.200">
              Congrats on Your New Data NFT!
            </Text>
            {nftData && nftData?.tokenName && nftData?.media && (
              <Stack alignItems="center">
                <Text
                  mb="1"
                  px="15px"
                  py="5px"
                  borderRadius="md"
                  fontWeight="bold"
                  fontSize="md"
                  backgroundColor={colorMode === "dark" ? "teal.400" : "teal.100"}
                  textAlign="center">
                  {nftData.tokenName}
                </Text>
                <Box>
                  <NftMediaComponent
                    nftMedia={nftData?.media}
                    imageUrls={nftData?.nftImgUrl ? [nftData.nftImgUrl] : []}
                    imageHeight="140px"
                    imageWidth="140px"
                    borderRadius="md"
                  />
                </Box>
              </Stack>
            )}
            <Flex flexDirection="column" mt="8 !important">
              <Text fontSize="xl" textAlign="center" fontWeight="bold">
                What can you do with it?
              </Text>

              <Button
                colorScheme="teal"
                size={{ base: "sm", md: "md", xl: "lg" }}
                m={2}
                onClick={() => {
                  navigate("/datanfts/wallet");
                }}>
                Visit Your {"Wallet"} To See It or Re-List It for Sale
              </Button>
              {nftData && nftData?.collection && nftData?.nonce && (
                <ExploreAppButton
                  collection={nftData.collection || ""}
                  nonce={nftData.nonce || 0}
                  size={{ base: "sm", md: "md", xl: "lg" }}
                  fontSize={{ base: "xs", md: "sm", xl: "md" }}
                  customLabel="Experience It With a Custom App!"
                  customMargin={2}
                />
              )}
              <Button colorScheme="teal" size={{ base: "sm", md: "md", xl: "lg" }} variant="outline" onClick={onClose} m={2}>
                Close This
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
