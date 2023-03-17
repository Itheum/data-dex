import React, { useState, FC, useEffect } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { AbiRegistry, Address, BinaryCodec, SmartContractAbi } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { signMessage } from "@multiversx/sdk-dapp/utils/account";
import moment from "moment/moment";
import { useSessionStorage } from "libs/hooks";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, isValidNumericCharacter, sleep, uxConfig } from "libs/util";
import { DataNftType, ItemType, RecordStringNumberType, UserDataType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import dataNftMintJson from "../MultiversX/ABIs/datanftmint.abi.json";
import { getNftsOfACollectionForAnAddress } from "../MultiversX/api";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { DataNftMintContract } from "../MultiversX/dataNftMint";
import { tokenDecimals } from "../MultiversX/tokenUtils";
import { ShortAddress } from "../UtilComps/ShortAddress";

type DataNftWalletLowerCardProps = {
  dataNftItem: ItemType;
  index: number;
};

export const DataNftWalletLowerCard: FC<DataNftWalletLowerCardProps> = (props) => {
  const { dataNftItem, index } = props;

  const { chainMeta: _chainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);
  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const itheumToken = _chainMeta.contracts.itheumToken;

  const [amounts, setAmounts] = useState<number[]>([]);
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [priceErrors, setPriceErrors] = useState<string[]>([]);
  const { onOpen: onAccessProgressModalOpen, onClose: onAccessProgressModalClose } = useDisclosure();
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isListNFTOpen, onOpen: onListNFTOpen, onClose: onListNFTClose } = useDisclosure();

  const { hasPendingTransactions } = useGetPendingTransactions();

  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2

  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(1);
  const [dataNftBurnAmountError, setDataNftBurnAmountError] = useState("");
  const [selectedDataNft, setSelectedDataNft] = useState<ItemType | undefined>();

  const [unlockAccessProgress, setUnlockAccessProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
  });
  const [errUnlockAccessGeneric, setErrUnlockAccessGeneric] = useState<string>("");

  const [walletUsedSession, setWalletUsedSession] = useSessionStorage("itm-wallet-used", null);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<RecordStringNumberType>({});
  const [userData, setUserData] = useState<UserDataType | undefined>(undefined);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const _marketRequirements = await marketContract.getRequirements();
      const _maxPaymentFeeMap: RecordStringNumberType = {};

      if (_marketRequirements) {
        for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
            _marketRequirements.maximum_payment_fees[i],
            tokenDecimals(_marketRequirements.accepted_payments[i])
          ).toNumber();
        }
      }

      setMaxPaymentFeeMap(_maxPaymentFeeMap);
    })();
  }, []);

  const onChangeDataNftBurnAmount = (valueAsString: string) => {
    let error = "";
    const valueAsNumber = Number(valueAsString);
    console.log("valueAsNumber", valueAsNumber);
    console.log("selectedDataNft", selectedDataNft);
    if (valueAsNumber < 1) {
      error = "Burn Amount cannot be zero or negative";
    } else if (selectedDataNft && valueAsNumber > Number(selectedDataNft.balance)) {
      error = "Data NFT balance exceeded";
    }
    setDataNftBurnAmountError(error);
    setDataNftBurnAmount(valueAsNumber);
  };

  const onBurnButtonClick = (nft: ItemType) => {
    setSelectedDataNft(nft);
    setDataNftBurnAmount(Number(nft.balance)); // init
    setBurnNFTModalState(1);
    onBurnNFTOpen();
  };

  const onListButtonClick = (nft: ItemType) => {
    setSelectedDataNft(nft);
    onListNFTOpen();
  };

  useEffect(() => {
    (async () => {
      if (address && !hasPendingTransactions) {
        const _userData = await mintContract.getUserDataOut(address, _chainMeta.contracts.itheumToken);
        console.log("User data", _userData);
        setUserData(_userData);
      }
    })();
  }, [address, hasPendingTransactions]);

  const accessDataStream = async (NFTid: string, myAddress: string) => {
    /*
          1) get a nonce from the data marshal (s1)
          2) get user to sign the nonce and obtain signature (s2)
          3) send the signature for verification from the marshal and open stream in new window (s3)
        */

    onAccessProgressModalOpen();

    try {
      // const chainId = _chainMeta.networkId;
      const res = await fetch(`${process.env.REACT_APP_ENV_DATAMARSHAL_API}/v1/preaccess?chainId=${_chainMeta.networkId}`);
      const data = await res.json();

      if (data && data.nonce) {
        setUnlockAccessProgress((prevProgress) => ({ ...prevProgress, s1: 1 }));

        await sleep(3);

        const signResult = await fetchAccountSignature(data.nonce);

        if (signResult.success === false) {
          setErrUnlockAccessGeneric(signResult.exception);
        } else {
          setUnlockAccessProgress((prevProgress) => ({
            ...prevProgress,
            s2: 1,
          }));
          await sleep(3);

          // auto download the file without ever exposing the url
          const link = document.createElement("a");
          link.target = "_blank";
          link.setAttribute("target", "_blank");
          link.href = `${process.env.REACT_APP_ENV_DATAMARSHAL_API}/v1/access?nonce=${data.nonce}&NFTid=${NFTid}&signature=${signResult.signature}&chainId=${_chainMeta.networkId}&accessRequesterAddr=${signResult.addrInHex}`;
          link.dispatchEvent(new MouseEvent("click"));

          await sleep(3);

          cleanupAccessDataStreamProcess();
        }
      } else {
        if (data.success === false) {
          setErrUnlockAccessGeneric(`${data.error.code}, ${data.error.message}`);
        } else {
          setErrUnlockAccessGeneric("Data Marshal responded with an unknown error trying to generate your access links");
        }
      }
    } catch (e: any) {
      setErrUnlockAccessGeneric(e.toString());
    }
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
        console.log("signatureObj");
        console.log(signatureObj);

        if (signatureObj?.signature && signatureObj?.address) {
          // Maiar App V2 / Ledger
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

      console.log("signResult");
      console.log(signResult);
    }

    if (signResult.signature === null || signResult.signature === "" || signResult.addrInHex === null || signResult.addrInHex === "") {
      signResult.success = false;
      signResult.exception = customError;
    }

    return signResult;
  };

  const cleanupAccessDataStreamProcess = () => {
    setUnlockAccessProgress({ s1: 0, s2: 0, s3: 0 });
    setErrUnlockAccessGeneric("");
    onAccessProgressModalClose();
  };

  const onBurn = () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!selectedDataNft) {
      toast({
        title: "No NFT is selected",
        status: "error",
        isClosable: true,
      });
      return;
    }

    mintContract.sendBurnTransaction(address, selectedDataNft.collection, selectedDataNft.nonce, dataNftBurnAmount);

    // close modal
    onBurnNFTClose();
  };

  const onList = () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!selectedDataNft) {
      toast({
        title: "No NFT is selected",
        status: "error",
        isClosable: true,
      });
      return;
    }

    marketContract.addToMarket(selectedDataNft.collection, selectedDataNft.nonce, amounts[selectedDataNft.index], prices[selectedDataNft.index], address);

    //
    onListNFTClose();
  };

  return (
    <>
      <Flex h="28rem" p="3" direction="column" justify="space-between">
        <Box>
          {
            <Box color="gray.600" fontSize="sm">
              Creator: <ShortAddress address={new Address(dataNftItem.creator)}></ShortAddress>
              <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/accounts/${new Address(dataNftItem.creator)}`} isExternal>
                <ExternalLinkIcon mx="2px" />
              </Link>
            </Box>
          }

          <Box color="gray.600" fontSize="sm">
            {`Creation time: ${moment(dataNftItem.creationTime).format(uxConfig.dateStr)}`}
          </Box>

          <Badge borderRadius="full" px="2" colorScheme="teal">
            <Text>You are the {dataNftItem.creator !== address ? "Owner" : "Creator"}</Text>
          </Badge>

          <Badge borderRadius="full" px="2" colorScheme="blue">
            Fully Transferable License
          </Badge>

          <Button mt="2" size="sm" colorScheme="red" height="5" isDisabled={hasPendingTransactions} onClick={(e) => onBurnButtonClick(dataNftItem)}>
            Burn
          </Button>

          <Box color="gray.600" fontSize="sm" my={2}>
            {`Balance: ${dataNftItem.balance}`} <br />
            {`Total supply: ${dataNftItem.supply}`} <br />
            {`Royalty: ${dataNftItem.royalties * 100}%`}
          </Box>

          <HStack mt="2">
            <Button
              size="sm"
              colorScheme="teal"
              height="7"
              onClick={() => {
                accessDataStream(dataNftItem.id, address);
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
              Listing price for each:{" "}
            </Text>
            <NumberInput
              size="xs"
              maxW={16}
              step={5}
              defaultValue={10}
              min={0}
              isValidCharacter={isValidNumericCharacter}
              max={maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0} // need to update hardcoded tokenId
              value={prices[index]}
              onChange={(valueString, valueAsNumber) => {
                let error = "";
                if (valueAsNumber < 0) error = "Cannot be negative";
                if (valueAsNumber > maxPaymentFeeMap[itheumToken] ? maxPaymentFeeMap[itheumToken] : 0) error = "Cannot exceed maximum listing price";
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
      </Flex>
    </>
  );
};
