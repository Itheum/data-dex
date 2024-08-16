import React, { Dispatch, SetStateAction, useState } from "react";
import { CheckCircleIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  CloseButton,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Spinner,
  Stack,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import NftMediaComponent from "components/NftMediaComponent";

type MintingModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  errDataNFTStreamGeneric: any;
  saveProgress: Record<any, any>;
  setSaveProgress: any;
  dataNFTImg: string;
  closeProgressModal: () => void;
  mintingSuccessful: boolean;
  makePrimaryNFMeIdSuccessful: boolean;
  imageUrl: string;
  metadataUrl: string;
  onChainMint: () => void;
  isNFMeIDMint: boolean;
  isAutoVault: boolean;
};

export const MintingModal: React.FC<MintingModalProps> = (props) => {
  const {
    isOpen,
    setIsOpen,
    errDataNFTStreamGeneric,
    saveProgress,
    dataNFTImg,
    closeProgressModal,
    mintingSuccessful,
    makePrimaryNFMeIdSuccessful,
    setSaveProgress,
    imageUrl,
    metadataUrl,
    onChainMint,
    isNFMeIDMint,
    isAutoVault,
  } = props;
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState<boolean>(false);
  const { colorMode } = useColorMode();

  const navigate = useNavigate();
  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false} blockScrollOnMount={false} size="lg">
      <ModalOverlay />
      <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
        <ModalHeader>{isNFMeIDMint ? "NFMe ID Vault" : "Data NFT Collection"} Minting Progress</ModalHeader>
        {!!errDataNFTStreamGeneric && <ModalCloseButton />}
        <ModalBody pb={6}>
          <Stack spacing={5}>
            <HStack>
              {(!saveProgress.s1 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text fontSize="lg">Generating encrypted data stream metadata</Text>
            </HStack>

            <HStack>
              {(!saveProgress.s2 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text fontSize="lg">Generating unique tamper-proof data stream signature</Text>
            </HStack>

            {dataNFTImg && (
              <>
                <Skeleton isLoaded={oneNFTImgLoaded} h={200} margin="auto">
                  <Center>
                    <NftMediaComponent
                      imageUrls={[dataNFTImg]}
                      imageHeight={"200px"}
                      imageWidth={"200px"}
                      borderRadius="md"
                      onLoad={() => setOneNFTImgLoaded(true)}
                    />
                  </Center>
                </Skeleton>
                <Box textAlign="center">
                  <Text fontSize="xs">This image was created using the unique data signature (it&apos;s one of a kind!)</Text>
                </Box>
              </>
            )}

            <HStack>
              {(!saveProgress.s3 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text fontSize="lg">Saving NFT metadata to IPFS</Text>
            </HStack>

            {!saveProgress.s4 && saveProgress.s3 && (
              <VStack>
                <HStack>
                  <Link color="teal.500" fontSize="md" href={`https://gateway.pinata.cloud/ipfs/${imageUrl.split("/").at(-1)}`} isExternal>
                    Image URL <ExternalLinkIcon mx="2px" />
                  </Link>
                  <Link color="teal.500" fontSize="md" href={`https://gateway.pinata.cloud/ipfs/${metadataUrl.split("/").at(-1)}`} isExternal>
                    Metadata URL <ExternalLinkIcon mx="2px" />
                  </Link>
                </HStack>
                <Text fontSize="md" textAlign={"center"} p={1}>
                  Click the links above and wait for the them to load to confirm that your IPFS assets are available.
                </Text>
                <Button
                  px={10}
                  disabled={imageUrl === "" || metadataUrl === ""}
                  colorScheme="teal"
                  onClick={() => {
                    setSaveProgress((prev: any) => ({ ...prev, s4: 1 }));
                    onChainMint();
                  }}>
                  CONFIRM
                </Button>
              </VStack>
            )}

            <HStack>
              {(!saveProgress.s5 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <VStack>
                <Text fontSize="lg">
                  Minting your new {isNFMeIDMint ? "NFMe ID Vault" : "Data NFT"} on the blockchain{" "}
                  {isAutoVault ? "& setting it as your primary NFMe.ID Vault" : ""}
                </Text>
              </VStack>
            </HStack>
            {isAutoVault ? (
              <>
                {mintingSuccessful && makePrimaryNFMeIdSuccessful && (
                  <Box textAlign="center" mt="2">
                    <Alert status="success">
                      <Text fontSize="lg" colorScheme="teal">
                        Success! {isNFMeIDMint ? "NFMe ID Vault" : "Data NFT"} Minted and set as your NFMe ID Vault.
                      </Text>
                    </Alert>
                    <HStack mt="4">
                      <Button
                        colorScheme="teal"
                        ml="auto"
                        onClick={() => {
                          navigate("/datanfts/wallet/bonding");
                        }}>
                        Visit {"Wallet > Bonding"} to see it!
                      </Button>
                      <Button
                        colorScheme="teal"
                        variant="outline"
                        mr="auto"
                        onClick={() => {
                          closeProgressModal();
                          onClose();
                        }}>
                        Close & Return
                      </Button>
                    </HStack>
                  </Box>
                )}
              </>
            ) : (
              <>
                {mintingSuccessful && (
                  <Box textAlign="center" mt="2">
                    <Alert status="success">
                      <Text fontSize="lg" colorScheme="teal">
                        Success! Your {isNFMeIDMint ? "NFMe ID Vault" : "Data NFT"} has been minted.
                      </Text>
                    </Alert>
                    <HStack mt="4">
                      <Button
                        colorScheme="teal"
                        ml="auto"
                        onClick={() => {
                          navigate("/datanfts/wallet");
                        }}>
                        Visit your {"Wallet"} to see it!
                      </Button>
                      <Button
                        colorScheme="teal"
                        variant="outline"
                        mr="auto"
                        onClick={() => {
                          closeProgressModal();
                          onClose();
                        }}>
                        Close & Return
                      </Button>
                    </HStack>
                  </Box>
                )}
              </>
            )}

            {errDataNFTStreamGeneric && (
              <Alert status="error">
                <Stack>
                  <AlertTitle fontSize="md">
                    <AlertIcon mb={2} />
                    Process Error
                  </AlertTitle>
                  {errDataNFTStreamGeneric.message && <AlertDescription fontSize="md">{errDataNFTStreamGeneric.message}</AlertDescription>}
                  <CloseButton
                    position="absolute"
                    right="8px"
                    top="8px"
                    onClick={() => {
                      closeProgressModal();
                      onClose();
                    }}
                  />
                </Stack>
              </Alert>
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
