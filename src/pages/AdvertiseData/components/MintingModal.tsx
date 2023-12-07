import React, { Dispatch, SetStateAction, useState } from "react";
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
  Image,
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
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

type MintingModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  errDataNFTStreamGeneric: any;
  saveProgress: Record<any, any>;
  dataNFTImg: string;
  closeProgressModal: () => void;
  mintingSuccessful: boolean;
};

export const MintingModal: React.FC<MintingModalProps> = (props) => {
  const { isOpen, setIsOpen, errDataNFTStreamGeneric, saveProgress, dataNFTImg, closeProgressModal, mintingSuccessful } = props;
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState<boolean>(false);

  const navigate = useNavigate();
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnEsc={false} closeOnOverlayClick={false} blockScrollOnMount={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Data NFT Minting Progress</ModalHeader>
        {!!errDataNFTStreamGeneric && <ModalCloseButton />}
        <ModalBody pb={6}>
          <Stack spacing={5}>
            <HStack>
              {(!saveProgress.s1 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text>Generating encrypted data stream metadata</Text>
            </HStack>

            <HStack>
              {(!saveProgress.s2 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text>Generating unique tamper-proof data stream signature</Text>
            </HStack>

            {dataNFTImg && (
              <>
                <Skeleton isLoaded={oneNFTImgLoaded} h={200} margin="auto">
                  <Center>
                    <Image src={dataNFTImg} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
                  </Center>
                </Skeleton>
                <Box textAlign="center">
                  <Text fontSize="xs">This image was created using the unique data signature (it&apos;s one of a kind!)</Text>
                </Box>
              </>
            )}

            <HStack>
              {(!saveProgress.s3 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text>Saving NFT metadata to IPFS</Text>
            </HStack>

            <HStack>
              {(!saveProgress.s4 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
              <Text>Minting your new Data NFT on blockchain</Text>
            </HStack>
            {mintingSuccessful && (
              <Box textAlign="center" mt="6">
                <Alert status="success">
                  <Text colorScheme="teal">Success! Your Data NFT has been minted on the MultiversX Blockchain</Text>
                </Alert>
                <HStack mt="4">
                  <Button
                    colorScheme="teal"
                    onClick={() => {
                      // setMenuItem(MENU.NFTMINE);
                      navigate("/datanfts/wallet");
                    }}>
                    Visit your Data NFT Wallet to see it!
                  </Button>
                  <Button colorScheme="teal" variant="outline" onClick={closeProgressModal}>
                    Close & Return
                  </Button>
                </HStack>
              </Box>
            )}

            {errDataNFTStreamGeneric && (
              <Alert status="error">
                <Stack>
                  <AlertTitle fontSize="md">
                    <AlertIcon mb={2} />
                    Process Error
                  </AlertTitle>
                  {errDataNFTStreamGeneric.message && <AlertDescription fontSize="md">{errDataNFTStreamGeneric.message}</AlertDescription>}
                  <CloseButton position="absolute" right="8px" top="8px" onClick={() => closeProgressModal()} />
                </Stack>
              </Alert>
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
