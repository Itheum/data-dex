import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useNavigate } from "react-router-dom";
import { labels } from "libs/language";
import { getApiDataDex, getApiDataMarshal } from "libs/utils";
import { useMintStore } from "store";
import { TradeForm } from "./TradeForm";
import { useWallet } from "@solana/wallet-adapter-react";

type TradeFormProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  dataToPrefill: any;
};

export const TradeFormModal: React.FC<TradeFormProps> = (props) => {
  const { isOpen, setIsOpen, dataToPrefill } = props;
  const { colorMode } = useColorMode();
  const { chainID } = useGetNetworkConfig();
  const [minRoyalties, setMinRoyalties] = useState<number>(-1);
  const [maxRoyalties, setMaxRoyalties] = useState<number>(-1);
  const [maxSupply, setMaxSupply] = useState<number>(-1);
  const [antiSpamTax, setAntiSpamTax] = useState<number>(-1);
  const [dataNFTMarshalServiceStatus, setDataNFTMarshalServiceStatus] = useState<boolean>(false);
  const [, setDataNFTMarshalService] = useState<string>("");
  const [dataNFTImgGenServiceValid, setDataNFTImgGenService] = useState(false);
  const navigate = useNavigate();
  const userData = useMintStore((state) => state.userData);
  const lockPeriod = useMintStore((state) => state.lockPeriodForBond);
  const { publicKey } = useWallet();

  useEffect(() => {
    (async () => {
      const minRoyaltiesT = userData?.minRoyalties ?? 0;
      const maxRoyaltiesT = userData?.maxRoyalties ?? 0;
      const maxSupplyT = userData?.maxSupply ?? 0;
      const antiSpamTaxT = userData?.antiSpamTaxValue ?? 0;

      onChangeDataNFTMarshalService(getApiDataMarshal(chainID));
      onChangeDataNFTImageGenService();
      setMinRoyalties(minRoyaltiesT);
      setMaxRoyalties(maxRoyaltiesT);
      setMaxSupply(maxSupplyT);
      setAntiSpamTax(antiSpamTaxT / 10 ** 18);
    })();
  }, [isOpen]);

  const onClose = () => {
    setIsOpen(false);
  };

  function makeRequest(url: string, sendBackResponse?: boolean): Promise<{ statusCode: number; isError: boolean; callResponse?: string }> {
    return new Promise(function (resolve) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function () {
        const returnRes = {
          statusCode: this.status,
          isError: false,
          callResponse: "",
        };

        if (sendBackResponse) {
          returnRes.callResponse = xhr.responseText;
        }

        resolve(returnRes);
      };
      xhr.onerror = function () {
        resolve({
          statusCode: this.status,
          isError: true,
        });
      };
      xhr.send();
    });
  }

  function convertToHttpUrl(url: string): string {
    const gateway = "https://gateway.lighthouse.storage";

    if (url.startsWith("ipns://")) {
      const ipns = url.split("ipns://")[1];
      return `${gateway}/ipns/${ipns}`;
    } else if (url.startsWith("ipfs://")) {
      const ipfs = url.split("ipfs://")[1];
      return `${gateway}/ipfs/${ipfs}`;
    }
    return url;
  }

  const checkUrlReturns200 = async (url: string, sendBackResponse?: boolean) => {
    if (url.includes("dmf-dnslink=1") && url.includes("dmf-http=1")) {
      return { isSuccess: true, message: "" };
    }

    if (url.includes("dmf-allow-http403=1")) {
      return { isSuccess: true, message: "" };
    }

    const urlToTest = convertToHttpUrl(url);
    const { statusCode, isError, callResponse } = await makeRequest(urlToTest, sendBackResponse);

    if (isError) {
      return {
        isSuccess: false,
        message: "Data Stream URL is not appropriate for minting into Data NFT (Unknown Error)",
      };
    }

    switch (statusCode) {
      case 200:
        if (sendBackResponse) {
          return { isSuccess: true, message: "", callResponse };
        } else {
          return { isSuccess: true, message: "" };
        }
      case 404:
        return { isSuccess: false, message: "Data Stream URL is not reachable (Status Code 404 received)" };
      case 403:
        if (url.includes("dmf-allow-http403=1")) {
          return {
            isSuccess: true,
            message:
              "Data Stream URL is not publicly reachable (Status Code 403 received), but you can proceed as you allow this via flag : dmf-allow-http403=1",
          };
        } else {
          return { isSuccess: false, message: "Data Stream URL is not reachable (Status Code 403 received)" };
        }
      default:
        return {
          isSuccess: false,
          message: `Data Stream URL must be a publicly accessible url (Status Code ${statusCode} received)`,
        };
    }
  };

  const onChangeDataNFTMarshalService = (value: string) => {
    const trimmedValue = value.trim();

    // Itheum Data Marshal Service Check
    checkUrlReturns200(`${getApiDataMarshal(chainID)}/health-check`).then(({ isSuccess }) => {
      setDataNFTMarshalServiceStatus(!isSuccess);
    });

    setDataNFTMarshalService(trimmedValue);
  };

  const onChangeDataNFTImageGenService = () => {
    // Itheum Image Gen Service Check (Data DEX API health check)
    checkUrlReturns200(`${getApiDataDex(chainID)}/health-check`).then(({ isSuccess }) => {
      setDataNFTImgGenService(isSuccess);
    });
  };

  console.log("userData", userData);
  console.log(lockPeriod, "lockPeriod", dataNFTMarshalServiceStatus, "dataNFTMarshalServiceStatus", dataNFTImgGenServiceValid, "dataNFTImgGenServiceValid");

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="6xl" closeOnEsc={true} closeOnOverlayClick={false} blockScrollOnMount={false}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
        <ModalHeader>
          <HStack spacing="5">
            <CloseButton
              size="lg"
              onClick={() => {
                onClose();
              }}
            />
            <Heading as="h4" fontFamily="Clash-Medium" size="lg">
              {dataToPrefill?.isNFMeID ? "Mint Your NFMe ID Vault" : "Mint Your Data NFT Collection"}
            </Heading>
          </HStack>
        </ModalHeader>

        <ModalBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"} overflowX={"hidden"} maxH="85svh" pt="0">
          <Stack spacing="5" mt="5">
            {(minRoyalties / 100 < 0 ||
              maxRoyalties / 100 < 0 ||
              maxSupply < 0 ||
              antiSpamTax < 0 ||
              dataNFTMarshalServiceStatus ||
              !dataNFTImgGenServiceValid ||
              (!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint) ||
              (!!userData && userData.contractPaused)) && (
              <Alert status="error" mb={5}>
                <Stack>
                  <AlertTitle fontSize="md" mb={5}>
                    <AlertIcon display="inline-block" />
                    <Text display="inline-block" lineHeight="2" style={{ verticalAlign: "middle" }}>
                      Uptime Errors
                    </Text>
                  </AlertTitle>
                  <AlertDescription>
                    {minRoyalties / 100 < 0 && <Text fontSize="md">Unable to read default value of Min Royalties.</Text>}
                    {maxRoyalties / 100 < 0 && <Text fontSize="md">Unable to read default value of Max Royalties.</Text>}
                    {maxSupply < 0 && <Text fontSize="md">Unable to read default value of Max Supply.</Text>}
                    {antiSpamTax < 0 && <Text fontSize="md">Unable to read default value of Anti-Spam Tax.</Text>}
                    {!!dataNFTMarshalServiceStatus && <Text fontSize="md">{labels.ERR_DATA_MARSHAL_DOWN}</Text>}
                    {!dataNFTImgGenServiceValid && <Text fontSize="md">{labels.ERR_MINT_FORM_GEN_IMG_API_DOWN}</Text>}
                    {!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint && (
                      <AlertDescription fontSize="md">You are not currently whitelisted to mint Data NFTs</AlertDescription>
                    )}
                    {!!userData && userData.contractPaused && <Text fontSize="md">The minter smart contract is paused for maintenance.</Text>}
                  </AlertDescription>
                </Stack>
              </Alert>
            )}

            {!!userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit && (
              <Alert status="error" mb={5}>
                <Stack>
                  <AlertTitle fontSize="md" mb={2}>
                    <AlertIcon display="inline-block" />
                    <Text display="inline-block" lineHeight="2" style={{ verticalAlign: "middle" }}>
                      Alerts
                    </Text>
                  </AlertTitle>
                  <AlertDescription>
                    {!!userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit && (
                      <Text fontSize="md">{`There is a time interval enforced between mints. You can mint your next Data NFT-FT after ${new Date(
                        userData.lastUserMintTime + userData.mintTimeLimit
                      ).toLocaleString()}`}</Text>
                    )}
                  </AlertDescription>
                </Stack>
              </Alert>
            )}
          </Stack>
          <TradeForm
            checkUrlReturns200={checkUrlReturns200}
            closeTradeFormModal={onClose}
            maxSupply={maxSupply}
            maxRoyalties={maxRoyalties / 100}
            dataNFTMarshalServiceStatus={dataNFTMarshalServiceStatus}
            minRoyalties={minRoyalties / 100}
            antiSpamTax={antiSpamTax}
            userData={userData}
            dataToPrefill={dataToPrefill}
          />
        </ModalBody>
        <Box
          position="absolute"
          top="5rem"
          bottom="0"
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
          left="0"
          right="0"
          height="100%"
          width="100%"
          backgroundColor="blackAlpha.800"
          rounded="lg"
          visibility={userData?.contractWhitelistEnabled && !userData.userWhitelistedForMint ? "visible" : "hidden"}
          borderTop="solid .1rem"
          borderColor="teal.200">
          <Text fontSize="24px" fontWeight="500" lineHeight="38px" textAlign="center" textColor="teal.200" px="2">
            - You are not whitelisted -
          </Text>
          <Button
            variant="solid"
            colorScheme="teal"
            px={7}
            py={6}
            rounded="lg"
            mt={7}
            onClick={() => {
              navigate("/getVerified");
            }}>
            Find out how you can get whitelisted
          </Button>
        </Box>
        <Box
          position="absolute"
          top="5rem"
          bottom="0"
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
          left="0"
          right="0"
          height="100%"
          width="100%"
          backgroundColor="blackAlpha.800"
          rounded="lg"
          visibility={(userData === null || userData === undefined) && !publicKey ? "visible" : "hidden" || lockPeriod === undefined}
          borderTop="solid .1rem"
          borderColor="teal.200">
          <Text fontSize="24px" fontWeight="500" lineHeight="38px" textAlign="center" textColor="teal.200" px="2">
            - Fetching minting requirements failed, please refresh the page to try again. -
          </Text>
          <Button
            variant="solid"
            colorScheme="teal"
            px={7}
            py={6}
            rounded="lg"
            mt={7}
            onClick={() => {
              window.location.reload();
            }}>
            Refresh Data DEX
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
};
