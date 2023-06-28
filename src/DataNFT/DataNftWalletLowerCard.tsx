import React, { useState, FC } from "react";
import {
  Box,
  Button,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { signMessage } from "@multiversx/sdk-dapp/utils/account";
import { useLocalStorage } from "libs/hooks";
import { isValidNumericCharacter, sleep } from "libs/util";
import { convertToLocalString } from "libs/util2";
import { DataNftType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";

type DataNftWalletLowerCardProps = {
  dataNftItem: DataNftType;
  index: number;
};

const DataNftWalletLowerCard: FC<DataNftWalletLowerCardProps> = (props) => {
  const { dataNftItem, index } = props;

  const { chainMeta: _chainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const [amounts, setAmounts] = useState<number[]>([]);
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [priceErrors, setPriceErrors] = useState<string[]>([]);
  const { onOpen: onListNFTOpen } = useDisclosure();
  const { onOpen: onAccessProgressModalOpen, onClose: onAccessProgressModalClose } = useDisclosure();

  const { hasPendingTransactions } = useGetPendingTransactions();

  const [walletUsedSession, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);

  const cleanupAccessDataStreamProcess = () => {
    onAccessProgressModalClose();
  };

  const onListButtonClick = (nft: DataNftType) => {
    onListNFTOpen();
  };

  const fetchAccountSignature = async (message: string) => {
    const signResult = {
      signature: "",
      addrInHex: "",
      success: false,
      exception: "",
    };

    let customError = "Signature result not received from wallet";

    if (walletUsedSession === "el_webwallet") {
      // web wallet not supported
      customError = "Currently, Signature verifications do not work on Web Wallet. Please use the XPortal App or the DeFi Wallet Browser Plugin.";
    } else {
      try {
        const signatureObj = await signMessage({ message });

        if (signatureObj?.signature && signatureObj?.address) {
          // Maiar App V2 / Ledger
          signResult.addrInHex = signatureObj.address.hex();
          signResult.signature = signatureObj.signature.hex();
          signResult.addrInHex = signatureObj.address.hex();
          signResult.success = true;
        } else {
          signResult.exception = "Signature result from wallet was malformed";
        }
      } catch (e: any) {
        signResult.success = false;
        signResult.exception = e.toString();
      }
    }

    if (signResult.signature === null || signResult.addrInHex === null) {
      signResult.success = false;
      signResult.exception = customError;
    }

    return signResult;
  };

  const accessDataStream = async (dataMarshal: string, NFTId: string, myAddress: string) => {
    /*
      1) get a nonce from the data marshal (s1)
      2) get user to sign the nonce and obtain signature (s2)
      3) send the signature for verification from the marshal and open stream in new window (s3)
    */

    onAccessProgressModalOpen();

    try {
      // const chainId = _chainMeta.networkId;
      const res = await fetch(`${dataMarshal}/preaccess?chainId=${_chainMeta.networkId}`);
      const data = await res.json();

      if (data && data.nonce) {
        await sleep(3);

        const signResult = await fetchAccountSignature(data.nonce);

        if (signResult.success !== false) {
          await sleep(3);
        } else {
          // auto download the file without ever exposing the url
          const link = document.createElement("a");
          link.target = "_blank";
          link.setAttribute("target", "_blank");
          link.href = `${dataMarshal}/access?nonce=${data.nonce}&NFTId=${NFTId}&signature=${signResult.signature}&chainId=${_chainMeta.networkId}&accessRequesterAddr=${signResult.addrInHex}`;
          link.dispatchEvent(new MouseEvent("click"));

          await sleep(3);

          cleanupAccessDataStreamProcess();
        }
      }
    } catch (e: any) {
      console.log(e);
    }
  };

  return (
    <>
      <Box mt="4">
        <Box fontSize="sm" mt="5">
          {`Balance: ${dataNftItem.balance} out of ${dataNftItem.supply}. Royalty: ${convertToLocalString(dataNftItem.royalties * 100)}%`}
        </Box>

        <HStack mt="2">
          <Button
            size="sm"
            colorScheme="teal"
            height="7"
            onClick={() => {
              accessDataStream(dataNftItem.dataMarshal, dataNftItem.id, address);
            }}>
            View Data
          </Button>
          <Button
            size="sm"
            colorScheme="teal"
            height="7"
            variant="outline"
            onClick={() => {
              window.open(dataNftItem.dataPreview);
            }}>
            Preview Data
          </Button>
        </HStack>

        <HStack mt="5">
          <Text fontSize="xs" w="110px">
            How many to list:{" "}
          </Text>
          <NumberInput
            size="xs"
            maxW={16}
            step={1}
            defaultValue={1}
            min={1}
            max={dataNftItem.balance}
            isValidCharacter={isValidNumericCharacter}
            value={amounts[index]}
            onChange={(value) => {
              let error = "";
              const valueAsNumber = Number(value);
              if (valueAsNumber <= 0) {
                error = "Cannot be zero or negative";
              } else if (valueAsNumber > dataNftItem.balance) {
                error = "Cannot exceed balance";
              }
              setAmountErrors((oldErrors) => {
                const newErrors = [...oldErrors];
                newErrors[index] = error;
                return newErrors;
              });
              setAmounts((oldAmounts) => {
                const newAmounts = [...oldAmounts];
                newAmounts[index] = valueAsNumber;
                return newAmounts;
              });
            }}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
        {amountErrors[index] && (
          <Text color="red.400" fontSize="xs">
            {amountErrors[index]}
          </Text>
        )}

        <HStack mt="2">
          <Text fontSize="xs" w="110px">
            Unlock fee for each:{" "}
          </Text>
          <NumberInput
            size="xs"
            maxW={16}
            step={5}
            defaultValue={10}
            min={0}
            isValidCharacter={isValidNumericCharacter}
            max={0}
            value={prices[index]}
            onChange={(valueString, valueAsNumber) => {
              let error = "";
              if (valueAsNumber < 0) error = "Cannot be negative";
              if (valueAsNumber > 0) error = "Cannot exceed maximum listing fee";
              setPriceErrors((oldErrors) => {
                const newErrors = [...oldErrors];
                newErrors[index] = error;
                return newErrors;
              });
              setPrices((oldPrices) => {
                const newPrices = [...oldPrices];
                newPrices[index] = !valueAsNumber ? 0 : valueAsNumber;
                return newPrices;
              });
            }}
            keepWithinRange={true}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
        {priceErrors[index] && (
          <Text color="red.400" fontSize="xs">
            {priceErrors[index]}
          </Text>
        )}

        <Button
          size="xs"
          mt={3}
          colorScheme="teal"
          variant="outline"
          isDisabled={hasPendingTransactions || !!amountErrors[index] || !!priceErrors[index]}
          onClick={() => onListButtonClick(dataNftItem)}>
          List {amounts[index]} NFT{amounts[index] > 1 && "s"} for {prices[index] ? `${prices[index]} ITHEUM ${amounts[index] > 1 ? "each" : ""}` : "Free"}
        </Button>
      </Box>
    </>
  );
};

export default DataNftWalletLowerCard;
