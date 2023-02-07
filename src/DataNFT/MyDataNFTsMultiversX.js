import React, { useState, useEffect } from "react";
import { ExternalLinkIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { Box, Stack } from "@chakra-ui/layout";
import {
  Skeleton,
  Button,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  Heading,
  Image,
  Flex,
  Link,
  Text,
  Tooltip,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
  AlertDescription,
  CloseButton,
  ModalCloseButton,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  useToast,
  Select,
} from "@chakra-ui/react";
import { AbiRegistry, ArgSerializer, BinaryCodec, EndpointParameterDefinition, SmartContractAbi, StructType, Type } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { signMessage } from "@multiversx/sdk-dapp/utils/account";
import moment from "moment";
import { sleep, uxConfig, consoleNotice, convertWeiToEsdt, isValidNumericCharacter } from "libs/util";
import { getNftsOfACollectionForAnAddress } from "MultiversX/api";
import { DataNftMarketContract } from "MultiversX/dataNftMarket";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { useChainMeta } from "store/ChainMetaContext";
import SkeletonLoadingList from "UtilComps/SkeletonLoadingList";
import dataNftMintJson from "../MultiversX/ABIs/datanftmint.abi.json";
import { tokenDecimals } from "../MultiversX/tokenUtils.js";
import { useSessionStorage } from "libs/hooks";

export default function MyDataNFTsMx({ onRfMount }) {
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { address } = useGetAccountInfo();
  const toast = useToast();
  const [onChainNFTs, setOnChainNFTs] = useState(null);
  const [usersDataNFTCatalog, setUsersDataNFTCatalog] = useState([]);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const [amounts, setAmounts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [unlockAccessProgress, setUnlockAccessProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
  });
  const [errUnlockAccessGeneric, setErrUnlockAccessGeneric] = useState(null);
  const { isOpen: isBurnNFTOpen, onOpen: onBurnNFTOpen, onClose: onBurnNFTClose } = useDisclosure();
  const { isOpen: isListNFTOpen, onOpen: onListNFTOpen, onClose: onListNFTClose } = useDisclosure();
  const { isOpen: isAccessProgressModalOpen, onOpen: onAccessProgressModalOpen, onClose: onAccessProgressModalClose } = useDisclosure();
  const [burnNFTModalState, setBurnNFTModalState] = useState(1); // 1 and 2

  const [dataNftBurnAmount, setDataNftBurnAmount] = useState(1);
  const [dataNftBurnAmountError, setDataNftBurnAmountError] = useState("");
  const [selectedDataNft, setSelectedDataNft] = useState(null);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState({});

  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const marketContract = new DataNftMarketContract(_chainMeta.networkId);
  const { hasPendingTransactions } = useGetPendingTransactions();

  const [walletUsedSession, setWalletUsedSession] = useSessionStorage("itm-wallet-used", null);
  
  useEffect(() => {
    (async () => {
      const _marketRequirements = await marketContract.getRequirements();
      console.log("_marketRequirements", _marketRequirements);
      const _maxPaymentFeeMap = {};
      for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
        _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
          _marketRequirements.maximum_payment_fees[i],
          tokenDecimals(_marketRequirements.accepted_payments[i])
        ).toNumber();
      }
      setMaxPaymentFeeMap(_maxPaymentFeeMap);
    })();
  }, []);

  const onChangeDataNftBurnAmount = (newValue) => {
    let error = "";
    if (newValue > selectedDataNft.balance) {
      error = "Not enough balance";
    } else if (newValue < 1) {
      error = "Burn Amount cannot be zero";
    }

    setDataNftBurnAmountError(error);
    setDataNftBurnAmount(newValue);
  };
  const onBurnButtonClick = (nft) => {
    setSelectedDataNft(nft);
    setDataNftBurnAmount(1); // init
    setBurnNFTModalState(1); // set state 1 when the modal is closed
    onBurnNFTOpen();
  };
  const onListButtonClick = (nft) => {
    setSelectedDataNft(nft);
    onListNFTOpen();
  };

  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a tranasaction is done... so if it's 'false' we need to get balances
    if (!hasPendingTransactions) {
      getOnChainNFTs();
    }
  }, [hasPendingTransactions]);

  // use this effect to parse  the raw data into a catalog that is easier to render in the UI
  useEffect(() => {
    const parseOnChainNfts = async () => {
      if (onChainNFTs !== null) {
        if (onChainNFTs.length > 0) {
          const codec = new BinaryCodec();
          const json = JSON.parse(JSON.stringify(dataNftMintJson));
          const abiRegistry = AbiRegistry.create(json);
          const abi = new SmartContractAbi(abiRegistry, ["DataNftMint"]);
          const dataNftAttributes = abiRegistry.getStruct("DataNftAttributes");

          // some logic to loop through the raw onChainNFTs and build the usersDataNFTCatalog
          const usersDataNFTCatalogLocal = [];
          let localAmounts = [];
          let localPrices = [];
          onChainNFTs.forEach((nft, index) => {
            const decodedAttributes = codec.decodeTopLevel(Buffer.from(nft["attributes"], "base64"), dataNftAttributes).valueOf();
            const dataNFT = {};
            dataNFT.index = index; // only for view & query
            dataNFT.id = nft["identifier"]; // ID of NFT -> done
            dataNFT.nftImgUrl = nft["url"]; // image URL of of NFT -> done
            dataNFT.dataPreview = decodedAttributes["data_preview_url"].toString(); // preview URL for NFT data stream -> done
            dataNFT.dataStream = decodedAttributes["data_stream_url"].toString(); // data stream URL -> done
            dataNFT.dataMarshal = decodedAttributes["data_marshal_url"].toString(); // data stream URL -> done
            dataNFT.tokenName = nft["name"]; // is this different to NFT ID? -> yes, name can be chosen by the user
            dataNFT.feeInTokens = "100"; // how much in ITHEUM tokens => should not appear here as it's in the wallet, not on the market
            dataNFT.creator = decodedAttributes["creator"].toString(); // initial creator of NFT
            dataNFT.creationTime = new Date(Number(decodedAttributes["creation_time"]) * 1000); // initial creation time of NFT
            dataNFT.supply = nft["supply"];
            dataNFT.balance = nft["balance"];
            dataNFT.description = decodedAttributes["description"].toString();
            dataNFT.title = decodedAttributes["title"].toString();
            dataNFT.royalties = nft["royalties"] / 100;
            dataNFT.nonce = nft["nonce"];
            dataNFT.collection = nft["collection"];
            localAmounts.push(1);
            localPrices.push(10);
            usersDataNFTCatalogLocal.push(dataNFT);
            console.log("test");
          });
          setAmounts(localAmounts);
          setPrices(localPrices);
          console.log("usersDataNFTCatalogLocal");
          console.log(usersDataNFTCatalogLocal);

          setUsersDataNFTCatalog(usersDataNFTCatalogLocal);
        } else {
          await sleep(4);
          setNoData(true);
        }
      }
    };
    parseOnChainNfts();
  }, [onChainNFTs]);

  const [userData, setUserData] = useState({});
  const getUserData = async () => {
    if (address && !hasPendingTransactions) {
      const _userData = await mintContract.getUserDataOut(address, _chainMeta.contracts.itheumToken);
      setUserData(_userData);
    }
  };

  useEffect(() => {
    getUserData();
  }, [address, hasPendingTransactions]);

  // get the raw NFT data from the blockchain for the user
  const getOnChainNFTs = async () => {
    const chainId = _chainMeta.networkId === "ED" ? "D" : "E1";
    const onChainNfts = await getNftsOfACollectionForAnAddress(address, _chainMeta.contracts.dataNFTFTTicker, chainId);

    console.log("onChainNfts");
    console.log(onChainNfts);

    setOnChainNFTs(onChainNfts);
  };

  const accessDataStream = async (NFTid, myAddress) => {
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
          link.href = `${process.env.REACT_APP_ENV_DATAMARSHAL_API}/v1/access?nonce=${data.nonce}&NFTid=${NFTid}&signature=${signResult.signature}&chainId=${_chainMeta.networkId}&accessRequesterAddr=${signResult.addrInHex}`;
          link.dispatchEvent(new MouseEvent("click"));

          await sleep(3);

          cleanupAccessDataStreamProcess();
        }
      } else {
        if (data.success === false) {
          setErrUnlockAccessGeneric(new Error(`${data.error.code}, ${data.error.message}`));
        } else {
          setErrUnlockAccessGeneric(new Error("Data Marshal responded with an unknown error trying to generate your access links"));
        }
      }
    } catch (e) {
      setErrUnlockAccessGeneric(e);
    }
  };

  const fetchAccountSignature = async (message) => {
    const signResult = {
      signature: null,
      addrInHex: null,
    };

    let customError = 'Signature result not received from wallet';

    if (walletUsedSession === 'el_webwallet') { // web wallet not supported
      customError = 'Currently, Signature verifications do not work on Web Wallet. Please use the XPortal App or the DeFi Wallet Browser Plugin.';
    } else {
      try {
        const signatureObj = await signMessage({ message });
        console.log("signatureObj");
        console.log(signatureObj);

        if (signatureObj?.signature?.buffer && signatureObj?.address?.valueHex) { // Maiar App V2 / Ledger
          signResult.addrInHex = signatureObj.address.valueHex;

          if (signatureObj.signature.buffer instanceof Uint8Array) { // Ledger
            customError = 'Currently, Signature verifications do not work on Ledger. Please use the XPortal App or the DeFi Wallet Browser Plugin.';
          } else { // Maiar (it will be string)
            signResult.signature = signatureObj.signature.buffer.toString();
          }        
        } else if (signatureObj?.signature?.value && signatureObj?.address?.valueHex) { // Defi Wallet      
          signResult.signature = signatureObj.signature.value;
          signResult.addrInHex = signatureObj.address.valueHex;
        } else {
          signResult.success = false;
          signResult.exception = new Error("Signature result from wallet was malformed");
        }
      } catch (e) {
        signResult.success = false;
        signResult.exception = e;
      }

      console.log("signResult");
      console.log(signResult);
    }

    if (signResult.signature === null || signResult.addrInHex === null) {
      signResult.success = false;
      signResult.exception = new Error(customError);
    }

    return signResult;
  };

  const cleanupAccessDataStreamProcess = () => {
    setUnlockAccessProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
    setErrUnlockAccessGeneric(null);
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

      {(usersDataNFTCatalog.length === 0 && <>{(!noData && <SkeletonLoadingList />) || <Text onClick={getOnChainNFTs}>No data yet...</Text>}</>) || (
        <Flex wrap="wrap" spacing={5}>
          {usersDataNFTCatalog &&
            usersDataNFTCatalog.map((item, index) => (
              <Box key={item.id} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mr="1rem" w="250px" mb="1rem" position="relative">
                <Flex justifyContent="center" pt={5}>
                  <Skeleton isLoaded={oneNFTImgLoaded} h={200}>
                    <Image src={item.nftImgUrl} alt={item.dataPreview} h={200} w={200} borderRadius="md" onLoad={() => setOneNFTImgLoaded(true)} />
                  </Skeleton>
                </Flex>

                <Flex p="3" direction="column" justify="space-between" mt="2">
                  <Text fontWeight="bold" fontSize="lg">
                    {item.tokenName}
                  </Text>
                  <Text fontSize="md">{item.title}</Text>

                  <Flex height="4rem">
                    <Popover trigger="hover" placement="auto">
                      <PopoverTrigger>
                        <Text fontSize="sm" mt="2" color="gray.300">
                          {item.description.substring(0, 100) !== item.description ? item.description.substring(0, 100) + " ..." : item.description}
                        </Text>
                      </PopoverTrigger>
                      <PopoverContent mx="2" width="220px" mt="-7">
                        <PopoverHeader fontWeight="semibold">{item.tokenName}</PopoverHeader>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody>
                          <Text fontSize="sm" mt="2" color="gray.300">
                            {item.description}
                          </Text>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Flex>

                  <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                    {`Creator: ${item.creator.slice(0, 8)} ... ${item.creator.slice(-8)}`}
                  </Box>

                  <Box mt="5">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Badge borderRadius="full" px="2" colorScheme="teal">
                        <Text>YOU ARE THE {item.creator !== address ? "OWNER" : "CREATOR"}</Text>
                      </Badge>
                    </Box>

                    <Badge borderRadius="full" px="2" colorScheme="blue">
                      Fully Transferable License
                    </Badge>
                    <Button size="sm" colorScheme="red" height="5" ml={"1"} isDisabled={hasPendingTransactions} onClick={(e) => onBurnButtonClick(item)}>
                      Burn
                    </Button>

                    <HStack mt="5">
                      <Text fontSize="xs">Creation time: </Text>
                      <Text fontSize="xs">{moment(item.creationTime).format(uxConfig.dateStr)}</Text>
                    </HStack>

                    <Box as="span" color="gray.600" fontSize="sm" flexGrow="1">
                      {`Balance: ${item.balance} out of ${item.supply}. Royalty: ${item.royalties * 100}%`}
                    </Box>

                    <HStack mt="2">
                      <Button
                        size="sm"
                        colorScheme="teal"
                        height="7"
                        onClick={() => {
                          accessDataStream(item.id, address);
                        }}
                      >
                        View Data
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        height="7"
                        variant="outline"
                        onClick={() => {
                          window.open(item.dataPreview);
                        }}
                      >
                        Preview Data
                      </Button>
                    </HStack>

                    <HStack my={"2"}>
                      <Text fontSize="xs">How many to list: </Text>
                      <NumberInput
                        size="xs"
                        maxW={16}
                        step={1}
                        defaultValue={1}
                        min={1}
                        max={item.balance}
                        isValidCharacter={isValidNumericCharacter}
                        value={amounts[index]}
                        onChange={(valueString) =>
                          setAmounts((oldAmounts) => {
                            const newAmounts = [...oldAmounts];
                            newAmounts[index] = Number(valueString);
                            return newAmounts;
                          })
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>

                    <HStack my={"2"}>
                      <Text fontSize="xs">Listing price for each: </Text>
                      <NumberInput
                        size="xs"
                        maxW={16}
                        step={5}
                        defaultValue={10}
                        min={0}
                        isValidCharacter={isValidNumericCharacter}
                        max={maxPaymentFeeMap["ITHEUM-a61317"] ? maxPaymentFeeMap["ITHEUM-a61317"] : 0} // need to update hardcoded tokenId
                        value={prices[index]}
                        onChange={(valueString) =>
                          setPrices((oldPrices) => {
                            const newPrices = [...oldPrices];
                            newPrices[index] = Number(valueString);
                            return newPrices;
                          })
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>

                    <Button size="xs" mt={3} colorScheme="teal" variant="outline" isDisabled={hasPendingTransactions} onClick={() => onListButtonClick(item)}>
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
                  visibility={userData.addressFrozen || (userData.frozenNonces && userData.frozenNonces.includes(item.nonce)) ? "visible" : "collapse"}
                >
                  <Text
                    position="absolute"
                    top="50%"
                    // left='50%'
                    transfrom="translate(-50%, -50%)"
                    textAlign="center"
                    px="2"
                  >
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
                          ` The remaining ${
                            selectedDataNft.supply - selectedDataNft.balance
                          } have already been purchased or burned and they no longer belong to you so you CANNOT burn them.`}
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
                      defaultValue={1}
                      min={1}
                      max={selectedDataNft.balance}
                      isValidCharacter={isValidNumericCharacter}
                      value={dataNftBurnAmount}
                      onChange={onChangeDataNftBurnAmount}
                      keepWithinRange={false}
                    >
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
                    <Button colorScheme="teal" size="sm" mx="3" onClick={() => setBurnNFTModalState(2)} isDisabled={!!dataNftBurnAmountError}>
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
                    <Button colorScheme="teal" size="sm" mx="3" onClick={onBurn}>
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

              <Text fontSize="md" mt="8">
                Advanced:
              </Text>
              <Flex mt="2" justifyContent="flex-start" alignItems="center" gap="4">
                <Text fontSize="md">Access Time Limit per SFT: </Text>
                <Select size="sm" width="120px" defaultValue="unlimited">
                  <option value="unlimited">Unlimited</option>
                </Select>
              </Flex>

              <Flex justifyContent="end" mt="8 !important">
                <Button colorScheme="teal" size="sm" mx="3" onClick={onList}>
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
                <Text>Verifying data access rights to unlock data stream</Text>
              </HStack>

              {errUnlockAccessGeneric && (
                <Alert status="error">
                  <Stack>
                    <AlertTitle fontSize="md">
                      <AlertIcon mb={2} />
                      Process Error
                    </AlertTitle>
                    {errUnlockAccessGeneric.message && <AlertDescription fontSize="md">{errUnlockAccessGeneric.message}</AlertDescription>}
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
