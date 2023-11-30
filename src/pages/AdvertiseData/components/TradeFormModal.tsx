import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CloseButton, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Heading, HStack, useColorMode } from "@chakra-ui/react";
import { getTypedValueFromContract } from "../../../libs/utils";
import { DataNftMintContract } from "../../../libs/MultiversX/dataNftMint";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { contractsForChain } from "../../../libs/config";

type TradeForm = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};
export const TradeFormModal: React.FC<TradeForm> = (props) => {
  const { isOpen, setIsOpen } = props;
  const { colorMode } = useColorMode();

  const { chainID } = useGetNetworkConfig();

  const [minRoyalties, setMinRoyalties] = useState<number>(-1);
  const [maxRoyalties, setMaxRoyalties] = useState<number>(-1);
  const [maxSupply, setMaxSupply] = useState<number>(-1);
  const [antiSpamTax, setAntiSpamTax] = useState<number>(-1);
  const mxDataNftMintContract = new DataNftMintContract(chainID);

  const onClose = () => {
    setIsOpen(false);
  };

  const onOpen = () => {
    setIsOpen(true);
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
      console.group();
      console.log(getMinRoyalty);
      console.log(getMaxRoyalty);
      console.log(getMaxSupply);
      console.log(getAntiSpamTax);
      console.groupEnd();
      setMinRoyalties(getMinRoyalty);
      setMaxRoyalties(getMaxRoyalty);
      setMaxSupply(getMaxSupply);
      setAntiSpamTax(getAntiSpamTax / 10 ** 18);
    })();
  }, []);

  //               minRoyalties < 0 ||
  //               maxRoyalties < 0 ||
  //               maxSupply < 0 ||
  //               antiSpamTax < 0 ||
  //               !!dataNFTMarshalServiceStatus ||
  //               !dataNFTImgGenServiceValid ||
  //               (!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint) ||
  //               (!!userData && userData.contractPaused)

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
              Trade a Data Stream as a Data NFT-FT
            </Heading>
          </HStack>
        </DrawerHeader>

        <DrawerBody bgColor={colorMode === "dark" ? "#181818" : "bgWhite"} overflowX={"hidden"}>
          {/*<Stack spacing="5" mt="5">*/}
          {/*  {() && (*/}
          {/*    <Alert status="error">*/}
          {/*      <Stack>*/}
          {/*        <AlertTitle fontSize="md" mb={2}>*/}
          {/*          <AlertIcon display="inline-block" />*/}
          {/*          <Text display="inline-block" lineHeight="2" style={{ verticalAlign: "middle" }}>*/}
          {/*            Uptime Errors*/}
          {/*          </Text>*/}
          {/*        </AlertTitle>*/}
          {/*        <AlertDescription>*/}
          {/*          {minRoyalties < 0 && <Text fontSize="md">Unable to read default value of Min Royalties.</Text>}*/}
          {/*          {maxRoyalties < 0 && <Text fontSize="md">Unable to read default value of Max Royalties.</Text>}*/}
          {/*          {maxSupply < 0 && <Text fontSize="md">Unable to read default value of Max Supply.</Text>}*/}
          {/*          {antiSpamTax < 0 && <Text fontSize="md">Unable to read default value of Anti-Spam Tax.</Text>}*/}
          {/*          {!!dataNFTMarshalServiceStatus && <Text fontSize="md">{labels.ERR_DATA_MARSHAL_DOWN}</Text>}*/}
          {/*          {!dataNFTImgGenServiceValid && <Text fontSize="md">{labels.ERR_MINT_FORM_GEN_IMG_API_DOWN}</Text>}*/}
          {/*          {!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint && (*/}
          {/*            <AlertDescription fontSize="md">You are not currently whitelisted to mint Data NFTs</AlertDescription>*/}
          {/*          )}*/}
          {/*          {!!userData && userData.contractPaused && <Text fontSize="md">The minter smart contract is paused for maintenance.</Text>}*/}
          {/*        </AlertDescription>*/}
          {/*      </Stack>*/}
          {/*    </Alert>*/}
          {/*  )}*/}

          {/*  {!!userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit && (*/}
          {/*    <Alert status="error">*/}
          {/*      <Stack>*/}
          {/*        <AlertTitle fontSize="md" mb={2}>*/}
          {/*          <AlertIcon display="inline-block" />*/}
          {/*          <Text display="inline-block" lineHeight="2" style={{ verticalAlign: "middle" }}>*/}
          {/*            Alerts*/}
          {/*          </Text>*/}
          {/*        </AlertTitle>*/}
          {/*        <AlertDescription>*/}
          {/*          {!!userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit && (*/}
          {/*            <Text fontSize="md">{`There is a time interval enforced between mints. You can mint your next Data NFT-FT after ${new Date(*/}
          {/*              userData.lastUserMintTime + userData.mintTimeLimit*/}
          {/*            ).toLocaleString()}`}</Text>*/}
          {/*          )}*/}
          {/*        </AlertDescription>*/}
          {/*      </Stack>*/}
          {/*    </Alert>*/}
          {/*  )}*/}
          {/*</Stack>*/}
          {/*<TradeForm />*/}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
