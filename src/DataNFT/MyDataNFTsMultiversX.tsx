import React, { useEffect, useState } from "react";
import { CheckCircleIcon, ExternalLinkIcon, InfoIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  CloseButton,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
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
  Select,
  Skeleton,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { AbiRegistry, BinaryCodec, SmartContractAbi } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { signMessage } from "@multiversx/sdk-dapp/utils/account";
import moment from "moment";
import imgGuidePopup from "img/guide-unblock-popups.png";
import { useLocalStorage } from "libs/hooks";
import { CHAIN_TX_VIEWER, convertWeiToEsdt, isValidNumericCharacter, sleep, uxConfig } from "libs/util";
import { getNftsOfACollectionForAnAddress } from "MultiversX/api";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { DataNftType, ItemType, OfferType, RecordStringNumberType, UserDataType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import ShortAddress from "UtilComps/ShortAddress";
import { SkeletonLoadingList } from "UtilComps/SkeletonLoadingList";
import dataNftMintJson from "../MultiversX/ABIs/datanftmint.abi.json";
import { tokenDecimals } from "../MultiversX/tokenUtils.js";

export default function MyDataNFTsMx({ onRfMount }: { onRfMount: any }) {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const itheumToken = _chainMeta.contracts.itheumToken;
  const { address } = useGetAccountInfo();
  const toast = useToast();
  const [dataNfts, setDataNfts] = useState<DataNftType[]>([]);
  const [items, setItems] = useState<ItemType[]>([
    {
      index: 0,
      owner: "",
      wanted_token_identifier: "",
      wanted_token_amount: "",
      wanted_token_nonce: 0,
      offered_token_identifier: "",
      offered_token_nonce: 0,
      balance: 0,
      supply: 0,
      royalties: 0,
      id: "",
      dataPreview: "",
      quantity: 0,
      nonce: 0,
      nftImgUrl: "",
      title: "",
      tokenName: "",
    },
  ]);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [priceErrors, setPriceErrors] = useState<string[]>([]);
  const [unlockAccessProgress, setUnlockAccessProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
  });
  const [errUnlockAccessGeneric, setErrUnlockAccessGeneric] = useState<string>("");
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isListNFTOpen, onOpen: onListNFTOpen, onClose: onListNFTClose } = useDisclosure();
  const { isOpen: isAccessProgressModalOpen, onOpen: onAccessProgressModalOpen, onClose: onAccessProgressModalClose } = useDisclosure();
  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2

  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(1);
  const [dataNftBurnAmountError, setDataNftBurnAmountError] = useState("");
  const [selectedDataNft, setSelectedDataNft] = useState<DataNftType | undefined>();
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<RecordStringNumberType>({});

  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);
  const { hasPendingTransactions } = useGetPendingTransactions();

  const [walletUsedSession, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [userData, setUserData] = useState<UserDataType | undefined>(undefined);

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

  const onBurnButtonClick = (nft: DataNftType) => {
    setSelectedDataNft(nft);
    setDataNftBurnAmount(Number(nft.balance)); // init
    setBurnNFTModalState(1);
    onBurnNFTOpen();
  };

  const onListButtonClick = (nft: DataNftType) => {
    setSelectedDataNft(nft);
    onListNFTOpen();
  };

  const getOnChainNFTs = async () => {
    const chainId = _chainMeta.networkId === "ED" ? "D" : "E1";
    const onChainNfts = await getNftsOfACollectionForAnAddress(address, _chainMeta.contracts.dataNFTFTTicker, chainId);
    console.log("onChainNfts", onChainNfts);

    if (onChainNfts.length > 0) {
      const codec = new BinaryCodec();
      const json = JSON.parse(JSON.stringify(dataNftMintJson));
      const abiRegistry = AbiRegistry.create(json);
      const abi = new SmartContractAbi(abiRegistry, ["DataNftMint"]);
      const dataNftAttributes = abiRegistry.getStruct("DataNftAttributes");

      // some logic to loop through the raw onChainNFTs and build the dataNfts
      const _dataNfts: DataNftType[] = [];
      const localAmounts: number[] = [];
      const localPrices: number[] = [];
      const localErrors: string[] = [];
      const _amountErrors: string[] = [];

      for (let index = 0; index < onChainNfts.length; index++) {
        const decodedAttributes = codec.decodeTopLevel(Buffer.from(onChainNfts[index].attributes, "base64"), dataNftAttributes).valueOf();
        const nft = onChainNfts[index];

        _dataNfts.push({
          index, // only for view & query
          id: nft.identifier, // ID of NFT -> done
          nftImgUrl: nft.url ? nft.url : "", // image URL of of NFT -> done
          dataPreview: decodedAttributes["data_preview_url"].toString(), // preview URL for NFT data stream -> done
          dataStream: decodedAttributes["data_stream_url"].toString(), // data stream URL -> done
          dataMarshal: decodedAttributes["data_marshal_url"].toString(), // data stream URL -> done
          tokenName: nft.name, // is this different to NFT ID? -> yes, name can be chosen by the user
          feeInTokens: 100, // how much in ITHEUM tokens => should not appear here as it's in the wallet, not on the market
          creator: decodedAttributes["creator"].toString(), // initial creator of NFT
          creationTime: new Date(Number(decodedAttributes["creation_time"]) * 1000), // initial creation time of NFT
          supply: nft.supply ? Number(nft.supply) : 0,
          balance: Number(nft.balance),
          description: decodedAttributes["description"].toString(),
          title: decodedAttributes["title"].toString(),
          royalties: nft.royalties / 100,
          nonce: nft.nonce,
          collection: nft.collection,
        });

        localAmounts.push(1);
        localPrices.push(10);
        localErrors.push("");
        _amountErrors.push("");
      }

      setAmounts(localAmounts);
      setPrices(localPrices);
      setPriceErrors(localErrors);
      setAmountErrors(_amountErrors);

      console.log("_dataNfts", _dataNfts);
      setDataNfts(_dataNfts);
    } else {
      // await sleep(4);
      setNoData(true);
      setDataNfts([]);
    }
  };

  useEffect(() => {
    if (hasPendingTransactions) return;
    getOnChainNFTs();
  }, [hasPendingTransactions]);

  useEffect(() => {
    (async () => {
      if (address && !hasPendingTransactions) {
        const _userData = await mintContract.getUserDataOut(address, _chainMeta.contracts.itheumToken);
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
    <Stack spacing={5}>
      <Heading size="lg">Data NFT Wallet</Heading>
      <Heading size="xs" opacity=".7">
        Below are the Data NFTs you created and/or purchased on the current chain
      </Heading>

      {(dataNfts.length === 0 && <>{(!noData && <SkeletonLoadingList />) || <Text onClick={getOnChainNFTs}>No data yet...</Text>}</>) || (
        <Flex wrap="wrap" gap="5" justifyContent={{ base: "center", md: "flex-start" }}>
          {dataNfts &&
            dataNfts.map((item, index) => (
              <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="wrap" mb="1rem" position="relative" w="13.5rem">
                <Flex justifyContent="center" pt={5}>
                  <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                    <Image src={item.nftImgUrl} alt={item.dataPreview} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
                  </Skeleton>
                </Flex>

                <Flex h="28rem" p="3" direction="column" justify="space-between">
                  <Text fontSize="xs">
                    <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/nfts/${item.id}`} isExternal>
                      {item.tokenName} <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Text>
                  <Popover trigger="hover" placement="auto">
                    <PopoverTrigger>
                      <div>
                        <Text fontWeight="bold" fontSize="lg" mt="2" noOfLines={1}>
                          {item.title}
                        </Text>

                        <Flex flexGrow="1">
                          <Text fontSize="sm" mt="2" color="gray.300" wordBreak="break-word" noOfLines={2}>
                            {item.description}
                          </Text>
                        </Flex>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent mx="2" width="220px" mt="-7">
                      <PopoverHeader fontWeight="semibold">{item.title}</PopoverHeader>
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverBody>
                        <Text fontSize="sm" mt="2" color="#929497" noOfLines={2} w="100%" h="10">
                          {item.description}
                        </Text>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                  <Box>
                    {
                      <Box color="gray.600" fontSize="sm">
                        Creator: <ShortAddress address={item.creator}></ShortAddress>
                        <Link href={`${CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER]}/accounts/${item.creator}`} isExternal>
                          <ExternalLinkIcon mx="2px" />
                        </Link>
                      </Box>
                    }

                    <Box color="gray.600" fontSize="sm">
                      {`Creation time: ${moment(item.creationTime).format(uxConfig.dateStr)}`}
                    </Box>

                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      <Text>You are the {item.creator !== address ? "Owner" : "Creator"}</Text>
                    </Badge>

                    <Badge borderRadius="full" px="2" colorScheme="blue">
                      Fully Transferable License
                    </Badge>

                    <Button mt="2" size="sm" colorScheme="red" height="5" isDisabled={hasPendingTransactions} onClick={(e) => onBurnButtonClick(item)}>
                      Burn
                    </Button>

                    <Box color="gray.600" fontSize="sm" my={2}>
                      {`Balance: ${item.balance}`} <br />
                      {`Total supply: ${item.supply}`} <br />
                      {`Royalty: ${item.royalties * 100}%`}
                    </Box>

                    <HStack mt="2">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        height="7"
                        onClick={() => {
                          accessDataStream(item.id, address);
                        }}>
                        View Data
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        height="7"
                        variant="outline"
                        onClick={() => {
                          window.open(item.dataPreview);
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
                        max={item.balance}
                        isValidCharacter={isValidNumericCharacter}
                        value={amounts[index]}
                        onChange={(value) => {
                          let error = "";
                          const valueAsNumber = Number(value);
                          if (valueAsNumber <= 0) {
                            error = "Cannot be zero or negative";
                          } else if (valueAsNumber > item.balance) {
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
                      onClick={() => onListButtonClick(item)}>
                      List {amounts[index]} NFT{amounts[index] > 1 && "s"} for{" "}
                      {prices[index] ? `${prices[index]} ITHEUM ${amounts[index] > 1 ? "each" : ""}` : "Free"}
                    </Button>
                  </Box>
                </Flex>

                <Box
                  position="absolute"
                  top="0"
                  bottom="0"
                  left="0"
                  right="0"
                  height="100%"
                  width="100%"
                  backgroundColor="blackAlpha.800"
                  rounded="lg"
                  visibility={
                    userData && (userData.addressFrozen || (userData.frozenNonces && userData.frozenNonces.includes(item.nonce))) ? "visible" : "collapse"
                  }
                  backdropFilter="auto"
                  backdropBlur="6px">
                  <Text fontSize="md" position="absolute" top="45%" textAlign="center" px="2">
                    - FROZEN - <br />
                    Data NFT is under investigation by the DAO as there was a complaint received against it
                  </Text>
                </Box>
              </Box>
            ))}
        </Flex>
      )}

      {selectedDataNft && (
        <Modal isOpen={isBurnNFTOpen} onClose={onBurnNFTClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            {burnNFTModalState === 1 ? (
              <>
                <ModalHeader>Burn Supply from my Data NFT</ModalHeader>
                <ModalBody pb={6}>
                  <HStack spacing="5" alignItems="center">
                    <Box flex="1.1">
                      <Stack>
                        <Image src={selectedDataNft.nftImgUrl} h={100} w={100} borderRadius="md" m="auto" />
                        <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                          {selectedDataNft.tokenName}
                        </Text>
                      </Stack>
                    </Box>
                    <Box flex="1.9" alignContent="center">
                      <Text color="orange.300" fontSize="sm">
                        You have ownership of {selectedDataNft.balance} Data NFTs (out of a total of {selectedDataNft.supply}). You can burn these{" "}
                        {selectedDataNft.balance} Data NFTs and remove them from your wallet.
                        {selectedDataNft.supply - selectedDataNft.balance > 0 &&
                          ` The remaining ${selectedDataNft.supply - selectedDataNft.balance} are not under your ownership.`}
                      </Text>
                    </Box>
                  </HStack>

                  <Text fontSize="md" mt="4">
                    Please note that Data NFTs not listed in the Data NFT marketplace are &quot;NOT public&quot; and are &quot;Private&quot; to only you so on
                    one can see or access them. So only burn Data NFTs if you are sure you want to destroy your Data NFTs for good. Once burned you will not be
                    able to recover them again.
                  </Text>

                  <HStack mt="8">
                    <Text fontSize="md">How many do you want to burn?</Text>
                    <NumberInput
                      size="xs"
                      maxW={16}
                      step={1}
                      defaultValue={selectedDataNft.balance}
                      min={1}
                      max={selectedDataNft.balance}
                      isValidCharacter={isValidNumericCharacter}
                      value={dataNftBurnAmount}
                      onChange={onChangeDataNftBurnAmount}
                      keepWithinRange={true}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                  {dataNftBurnAmountError && (
                    <Text ml="208px" color="red.400" fontSize="sm" mt="1 !important">
                      {dataNftBurnAmountError}
                    </Text>
                  )}

                  <Flex justifyContent="end" mt="8 !important">
                    <Button
                      colorScheme="teal"
                      size="sm"
                      mx="3"
                      onClick={() => setBurnNFTModalState(2)}
                      isDisabled={!!dataNftBurnAmountError || hasPendingTransactions}>
                      I want to Burn my {dataNftBurnAmount} Data NFTs
                    </Button>
                    <Button colorScheme="teal" size="sm" variant="outline" onClick={onBurnNFTClose}>
                      Cancel
                    </Button>
                  </Flex>
                </ModalBody>
              </>
            ) : (
              <>
                <ModalHeader>Are you sure?</ModalHeader>
                <ModalBody pb={6}>
                  <Flex>
                    <Text fontWeight="bold" fontSize="md" px="1">
                      Data NFT Title: &nbsp;
                    </Text>
                    <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1">
                      {selectedDataNft.title}
                    </Text>
                  </Flex>
                  <Flex mt="1">
                    <Text fontWeight="bold" fontSize="md" px="1">
                      Burn Amount: &nbsp;&nbsp;
                    </Text>
                    <Text fontSize="sm" backgroundColor="blackAlpha.300" px="1">
                      {dataNftBurnAmount}
                    </Text>
                  </Flex>
                  <Text fontSize="md" mt="2">
                    Are you sure you want to proceed with burning the Data NFTs? You cannot undo this action.
                  </Text>
                  <Flex justifyContent="end" mt="6 !important">
                    <Button colorScheme="teal" size="sm" mx="3" onClick={onBurn} isDisabled={hasPendingTransactions}>
                      Proceed
                    </Button>
                    <Button colorScheme="teal" size="sm" variant="outline" onClick={onBurnNFTClose}>
                      Cancel
                    </Button>
                  </Flex>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {selectedDataNft && (
        <Modal isOpen={isListNFTOpen} onClose={onListNFTClose} closeOnEsc={false} closeOnOverlayClick={false}>
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
          <ModalContent>
            <ModalBody py={6}>
              <HStack spacing="5" alignItems="center">
                <Box flex="4" alignContent="center">
                  <Text fontSize="lg">List my Data NFT on the Public Marketplace</Text>
                  <Flex mt="1">
                    <Text fontWeight="bold" fontSize="md" backgroundColor="blackAlpha.300" px="1" textAlign="center">
                      {selectedDataNft.tokenName}
                    </Text>
                  </Flex>
                </Box>
                <Box flex="1">
                  <Image src={selectedDataNft.nftImgUrl} h="auto" w="100%" borderRadius="md" m="auto" />
                </Box>
              </HStack>

              <Text fontSize="md" mt="4">
                How many to list: {amounts[selectedDataNft.index]}
              </Text>
              <Text fontSize="md" mt="2">
                Listing fee per NFT: {prices[selectedDataNft.index] ? `${prices[selectedDataNft.index]} ITHEUM` : "FREE"}{" "}
              </Text>

              <Text display="none" fontSize="md" mt="8">
                Advanced:
              </Text>
              <Flex display="none" mt="2" justifyContent="flex-start" alignItems="center" gap="4">
                <Text fontSize="md">Access Time Limit per SFT: </Text>
                <Select size="sm" width="120px" defaultValue="unlimited">
                  <option value="unlimited">Unlimited</option>
                </Select>
              </Flex>

              <Flex justifyContent="end" mt="8 !important">
                <Button colorScheme="teal" size="sm" mx="3" onClick={onList} isDisabled={hasPendingTransactions}>
                  Proceed
                </Button>
                <Button colorScheme="teal" size="sm" variant="outline" onClick={onListNFTClose}>
                  Cancel
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      <Modal isOpen={isAccessProgressModalOpen} onClose={cleanupAccessDataStreamProcess} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Data Access Unlock Progress</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={5}>
              <HStack>
                {(!unlockAccessProgress.s1 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
                <Text>Initiating handshake with Data Marshal</Text>
              </HStack>

              <HStack>
                {(!unlockAccessProgress.s2 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
                <Stack>
                  <Text>Please sign transaction to complete handshake</Text>
                  <Text fontSize="sm">Note: This will not use gas or submit any blockchain transactions</Text>
                </Stack>
              </HStack>

              <HStack>
                {(!unlockAccessProgress.s3 && <Spinner size="md" />) || <CheckCircleIcon w={6} h={6} />}
                <Text>Verifying data access rights to unlock Data Stream</Text>
              </HStack>

              {unlockAccessProgress.s1 && unlockAccessProgress.s2 && !unlockAccessProgress.s3 && (
                <Stack border="solid .04rem" padding={3} borderRadius={5}>
                  <Text fontSize="sm" lineHeight={1.7}>
                    <InfoIcon boxSize={5} mr={1} />
                    Popups are needed for the Data Marshal to give you access to Data Streams. If your browser is prompting you to allow popups, please select{" "}
                    <b>Always allow pop-ups</b>
                  </Text>
                  <Image boxSize="250px" height="auto" m=".5rem auto 0 auto !important" src={imgGuidePopup} borderRadius={10} />
                </Stack>
              )}

              {errUnlockAccessGeneric && (
                <Alert status="error">
                  <Stack>
                    <AlertTitle fontSize="md">
                      <AlertIcon mb={2} />
                      Process Error
                    </AlertTitle>
                    {errUnlockAccessGeneric && <AlertDescription fontSize="md">{errUnlockAccessGeneric}</AlertDescription>}
                    <CloseButton position="absolute" right="8px" top="8px" onClick={cleanupAccessDataStreamProcess} />
                  </Stack>
                </Alert>
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
