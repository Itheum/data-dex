import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  HStack,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { TradeForm } from "./TradeForm";
import { contractsForChain } from "../../../libs/config";
import { labels } from "../../../libs/language";
import { DataNftMintContract } from "../../../libs/MultiversX/dataNftMint";
import { getApiDataDex, getApiDataMarshal, getTypedValueFromContract } from "../../../libs/utils";
import { useMintStore } from "../../../store";
import { useNavigate } from "react-router-dom";

type TradeFormProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  dataToPrefill: any;
};
export const TradeFormModal: React.FC<TradeFormProps> = (props) => {
  const { isOpen, setIsOpen, dataToPrefill } = props;
  const { colorMode } = useColorMode();

  const { chainID } = useGetNetworkConfig();

  const navigate = useNavigate();

  const [minRoyalties, setMinRoyalties] = useState<number>(-1);
  const [maxRoyalties, setMaxRoyalties] = useState<number>(-1);
  const [maxSupply, setMaxSupply] = useState<number>(-1);
  const [antiSpamTax, setAntiSpamTax] = useState<number>(-1);
  const [dataNFTMarshalServiceStatus, setDataNFTMarshalServiceStatus] = useState<boolean>(false);
  const [, setDataNFTMarshalService] = useState<string>("");
  const [dataNFTImgGenServiceValid, setDataNFTImgGenService] = useState(false);

  const userData = useMintStore((state) => state.userData);

  const mxDataNftMintContract = new DataNftMintContract(chainID);

  const onClose = () => {
    setIsOpen(false);
  };

  function makeRequest(url: string): Promise<{ statusCode: number; isError: boolean }> {
    return new Promise(function (resolve) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function () {
        resolve({
          statusCode: this.status,
          isError: false,
        });
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

  const checkUrlReturns200 = async (url: string) => {
    const { statusCode, isError } = await makeRequest(url);

    let isSuccess = false;
    let message = "";
    if (isError) {
      message = "Data Stream URL is not appropriate for minting into Data NFT (Unknown Error)";
    } else if (statusCode === 200) {
      isSuccess = true;
    } else if (statusCode === 404) {
      message = "Data Stream URL is not reachable (Status Code 404 received)";
    } else {
      message = `Data Stream URL must be a publicly accessible url (Status Code ${statusCode} received)`;
    }

    return {
      isSuccess,
      message,
    };
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

  useEffect(() => {
    (async () => {
      const getMinRoyalty = await getTypedValueFromContract(chainID, mxDataNftMintContract.contract.methods.getMinRoyalties());
      const getMaxRoyalty = await getTypedValueFromContract(chainID, mxDataNftMintContract.contract.methods.getMaxRoyalties());
      const getMaxSupply = await getTypedValueFromContract(chainID, mxDataNftMintContract.contract.methods.getMaxSupply());
      const getAntiSpamTax = await getTypedValueFromContract(
        chainID,
        mxDataNftMintContract.contract.methods.getAntiSpamTax([contractsForChain(chainID).itheumToken])
      );

      onChangeDataNFTMarshalService(getApiDataMarshal(chainID));
      onChangeDataNFTImageGenService();
      setMinRoyalties(getMinRoyalty);
      setMaxRoyalties(getMaxRoyalty);
      setMaxSupply(getMaxSupply);
      setAntiSpamTax(getAntiSpamTax / 10 ** 18);
    })();
  }, []);

  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="xl" closeOnEsc={true} closeOnOverlayClick={false}>
      <DrawerOverlay backdropFilter="blur(10px)" />
      <DrawerContent bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
        <DrawerHeader>
          <HStack spacing="5">
            <CloseButton
              size="lg"
              onClick={() => {
                onClose();
              }}
            />
            <Heading as="h4" fontFamily="Clash-Medium" size="lg">
              Mint a Data Stream as a Data NFT-FT
            </Heading>
          </HStack>
        </DrawerHeader>

        <DrawerBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"} overflowX={"hidden"}>
          <Stack spacing="5" mt="5">
            {(minRoyalties / 100 < 0 ||
              maxRoyalties / 100 < 0 ||
              maxSupply < 0 ||
              antiSpamTax < 0 ||
              dataNFTMarshalServiceStatus ||
              !dataNFTImgGenServiceValid ||
              (!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint) ||
              (!!userData && userData.contractPaused)) && (
              <Alert status="error">
                <Stack>
                  <AlertTitle fontSize="md" mb={2}>
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
              <Alert status="error">
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
            maxSupply={maxSupply}
            maxRoyalties={maxRoyalties / 100}
            dataNFTMarshalServiceStatus={dataNFTMarshalServiceStatus}
            minRoyalties={minRoyalties / 100}
            antiSpamTax={antiSpamTax}
            userData={userData}
            dataToPrefill={dataToPrefill}
          />
        </DrawerBody>
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
              navigate("/getwhitelisted");
            }}>
            Find out how you can get whitelisted
          </Button>
        </Box>
      </DrawerContent>
    </Drawer>
  );
};
