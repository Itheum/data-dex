import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { useNavigate } from "react-router-dom";
import { CHAIN_TX_VIEWER, convertEsdtToWei, convertWeiToEsdt, isValidNumericCharacter, sleep } from "libs/util";
import { getAccountTokenFromApi, getNftsByIds } from "MultiversX/api";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { DataNftMetadataType, MarketplaceRequirementsType, OfferType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import { SkeletonLoadingList } from "UtilComps/SkeletonLoadingList";
import { CustomPagination } from "./CustomPagination";
import MyListedDataNFT from "./MyListedDataNFT";
import { DataNftMarketContract } from "../MultiversX/dataNftMarket";
import { hexZero, tokenDecimals } from "../MultiversX/tokenUtils.js";
import useThrottle from "../UtilComps/UseThrottle";

function printPrice(price: number, token: string): string {
  return price <= 0 ? "FREE" : `${price} ${token}`;
}

interface PropsType {
  tabState: number; // 1 for "Public Marketplace", 2 for "My Data NFTs"
}

export const Marketplace: FC<PropsType> = ({ tabState }) => {
  const navigate = useNavigate();
  const { chainMeta: _chainMeta } = useChainMeta() as any;
  const itheumToken = _chainMeta.contracts.itheumToken;
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const toast = useToast();
  const [loadingOffers, setLoadingOffers] = useState<boolean>(false);
  const [amountOfTokens, setAmountOfTokens] = useState<any>({});
  const [amountErrors, setAmountErrors] = useState<string[]>([]);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<number>(-1); // no selection
  const [nftMetadatas, setNftMetadatas] = useState<DataNftMetadataType[]>([]);
  const [nftMetadatasLoading, setNftMetadatasLoading] = useState<boolean>(false);
  const contract = new DataNftMarketContract("ED");
  const { isOpen: isProcureModalOpen, onOpen: onProcureModalOpen, onClose: onProcureModalClose } = useDisclosure();
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [marketRequirements, setMarketRequirements] = useState<MarketplaceRequirementsType | undefined>(undefined);
  const [maxPaymentFeeMap, setMaxPaymentFeeMap] = useState<Record<string, number>>({});
  const mintContract = new DataNftMintContract(_chainMeta.networkId);
  const [isPublicMarketplace, setIsPublicMarketplace] = useState<boolean>(true);
  const [isMyListedData, setIsMyListedData] = useState<boolean>(false);

  //
  const [offers, setOffers] = useState<OfferType[]>([]);
  const [wantedTokenBalance, setWantedTokenBalance] = useState<string>("0");

  //
  const { isOpen: isDelistModalOpen, onOpen: onDelistModalOpen, onClose: onDelistModalClose } = useDisclosure();
  const [delistModalState, setDelistModalState] = useState<number>(0); // 0, 1
  const [delistAmount, setDelistAmount] = useState<number>(1);

  //
  const { isOpen: isUpdatePriceModalOpen, onOpen: onUpdatePriceModalOpen, onClose: onUpdatePriceModalClose } = useDisclosure();
  const [newListingPrice, setNewListingPrice] = useState<number>(0);
  const [newListingPriceError, setNewListingPriceError] = useState<string>("");

  // pagination
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageIndex, setPageIndex] = useState<number>(0); // pageIndex starts from 0
  const [pageSize, setPageSize] = useState<number>(10);

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

  useEffect(() => {
    (async () => {
      const _marketRequirements = await contract.getRequirements();
      console.log("_marketRequirements", _marketRequirements);
      setMarketRequirements(_marketRequirements);

      if (_marketRequirements) {
        const _maxPaymentFeeMap: Record<string, number> = {};
        for (let i = 0; i < _marketRequirements.accepted_payments.length; i++) {
          _maxPaymentFeeMap[_marketRequirements.accepted_payments[i]] = convertWeiToEsdt(
            _marketRequirements.maximum_payment_fees[i],
            tokenDecimals(_marketRequirements.accepted_payments[i])
          ).toNumber();
        }
        setMaxPaymentFeeMap(_maxPaymentFeeMap);
      } else {
        setMaxPaymentFeeMap({});
      }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      let _numberOfOffers = 0;
      if (tabState === 1) {
        // global offers
        _numberOfOffers = await contract.getNumberOfOffers();
      } else {
        // offers of User
        _numberOfOffers = await contract.getUserTotalOffers(address);
      }
      console.log("_numberOfOffers", _numberOfOffers);
      const _pageCount = Math.max(1, Math.ceil(_numberOfOffers / pageSize));
      setPageCount(_pageCount);

      // if pageIndex is out of range
      if (pageIndex >= _pageCount) {
        onGotoPage(0);
      }
    })();
  }, [hasPendingTransactions, tabState]);

  useEffect(() => {
    (async () => {
      // init - no selection
      setSelectedOfferIndex(-1);

      // start loading offers
      setLoadingOffers(true);
      const _offers = await contract.viewPagedOffers(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1, tabState === 1 ? "" : address);
      console.log("_offers", _offers);
      setOffers(_offers);
      // end loading offers
      setLoadingOffers(false);

      //
      const amounts: any = {};
      const _amountErrors: string[] = [];
      for (let i = 0; i < _offers.length; i++) {
        amounts[i] = 1;
        _amountErrors.push("");
      }
      setAmountOfTokens(amounts);
      setAmountErrors(_amountErrors);

      //
      setNftMetadatasLoading(true);
      const nftIds = _offers.map((offer) => `${offer.offered_token_identifier}-${hexZero(offer.offered_token_nonce)}`);
      const _nfts = await getNftsByIds(nftIds, _chainMeta.networkId);
      const _metadatas: DataNftMetadataType[] = [];
      for (let i = 0; i < _nfts.length; i++) {
        _metadatas.push(mintContract.decodeNftAttributes(_nfts[i], i));
      }
      console.log("_metadatas", _metadatas);
      setNftMetadatas(_metadatas);
      setNftMetadatasLoading(false);
    })();
  }, [pageIndex, pageSize, tabState, hasPendingTransactions]);

  useEffect(() => {
    (async () => {
      if (!(address && selectedOfferIndex >= 0 && selectedOfferIndex < offers.length)) return;

      // wanted_token must be ESDT (not NFT, SFT or Meta-ESDT)
      const _token = await getAccountTokenFromApi(address, offers[selectedOfferIndex].wanted_token_identifier, _chainMeta.networkId);
      if (_token) {
        setWantedTokenBalance(_token.balance ? _token.balance : "0");
      } else {
        setWantedTokenBalance("0");
      }
    })();
  }, [address, offers, selectedOfferIndex, hasPendingTransactions]);

  const getUserData = async () => {
    if (address) {
      const _userData = await mintContract.getUserDataOut(address, itheumToken);
      setUserData(_userData);
    }
  };
  useEffect(() => {
    getUserData();
  }, [address, hasPendingTransactions]);
  const onProcure = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!marketRequirements) {
      toast({
        title: "Data is not loaded",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (selectedOfferIndex < 0 || offers.length <= selectedOfferIndex) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!readTermsChecked) {
      toast({
        title: "You must READ and Agree on Terms of Use",
        status: "error",
        isClosable: true,
      });
      return;
    }
    const offer = offers[selectedOfferIndex];
    const paymentAmount = BigNumber(offer.wanted_token_amount).multipliedBy(amountOfTokens[selectedOfferIndex]);
    if (offer.wanted_token_identifier == "EGLD") {
      contract.sendAcceptOfferEgldTransaction(offer.index, paymentAmount.toFixed(), amountOfTokens[selectedOfferIndex], address);
    } else {
      if (offer.wanted_token_nonce === 0) {
        contract.sendAcceptOfferEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          amountOfTokens[selectedOfferIndex],
          address
        );
      } else {
        contract.sendAcceptOfferNftEsdtTransaction(
          offer.index,
          paymentAmount.toFixed(),
          offer.wanted_token_identifier,
          offer.wanted_token_nonce,
          amountOfTokens[selectedOfferIndex],
          address
        );
      }
    }
    // a small delay for visual effect
    await sleep(0.5);
    onProcureModalClose();
  };
  const onDelist = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (selectedOfferIndex < 0 || offers.length <= selectedOfferIndex) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }

    contract.delistDataNft(offers[selectedOfferIndex].index, delistAmount, address);
    // a small delay for visual effect
    await sleep(0.5);
    onDelistModalClose();
    setDelistModalState(0);
  };

  const onUpdatePrice = async () => {
    if (!address) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (selectedOfferIndex < 0 || offers.length <= selectedOfferIndex) {
      toast({
        title: "No NFT data",
        status: "error",
        isClosable: true,
      });
      return;
    }

    contract.updateOfferPrice(
      offers[selectedOfferIndex].index,
      convertEsdtToWei(newListingPrice, tokenDecimals(offers[selectedOfferIndex].wanted_token_identifier)).toFixed(),
      address
    );

    // a small delay for visual effect
    await sleep(0.5);
    onUpdatePriceModalClose();
  };

  const ChainExplorer = CHAIN_TX_VIEWER[_chainMeta.networkId as keyof typeof CHAIN_TX_VIEWER];

  function nftIsOwnedByAnotherAddress(offer: OfferType) {
    return address && address != offer.owner;
  }

  return (
    <>
      <Stack spacing={5}>
        <Heading size="lg">Data NFT Marketplace</Heading>

        <Flex mt="5" pr="5" gap="12px" justifyContent={{ base: "center", md: "flex-start" }} flexDirection={{ base: "row", md: "row" }}>
          <Button
            colorScheme="teal"
            width={{ base: "160px", md: "160px" }}
            isDisabled={tabState === 1}
            _disabled={{ opacity: 1 }}
            opacity={0.4}
            onClick={() => {
              setPageIndex(0);
              setIsMyListedData(false);
              setIsPublicMarketplace(true);
              navigate("/datanfts/marketplace");
            }}
          >
            Public Marketplace
          </Button>
          <Button
            colorScheme="teal"
            width={{ base: "160px", md: "160px" }}
            isDisabled={tabState === 2}
            _disabled={{ opacity: 1 }}
            opacity={0.4}
            onClick={() => {
              setPageIndex(0);
              setIsMyListedData(true);
              setIsPublicMarketplace(false);
              navigate("/datanfts/marketplace/my");
            }}
          >
            My Listed Data NFTs
          </Button>

          <Box flexGrow="1" />

          <CustomPagination pageCount={pageCount} pageIndex={pageIndex} pageSize={pageSize} gotoPage={onGotoPage} />
        </Flex>

        {loadingOffers ? (
          <SkeletonLoadingList />
        ) : offers.length === 0 ? (
          <Text>No data yet...</Text>
        ) : (
          <Flex wrap="wrap" gap="5">
            {offers.length > 0 &&
              offers.map((offer, index) => (
                <>
                  {(isPublicMarketplace && nftIsOwnedByAnotherAddress(offer) && (
                    <>
                      <HStack h="3rem">
                        <Text fontSize="xs">How many to procure </Text>
                        <NumberInput
                          size="xs"
                          maxW={16}
                          step={1}
                          min={1}
                          max={offer.quantity}
                          isValidCharacter={isValidNumericCharacter}
                          value={amountOfTokens[index]}
                          onChange={(valueAsString) => {
                            const value = Number(valueAsString);
                            let error = "";
                            if (value <= 0) {
                              error = "Cannot be zero or negative";
                            } else if (value > offer.quantity) {
                              error = "Cannot exceed balance";
                            }
                            setAmountErrors((oldErrors) => {
                              const newErrors = [...oldErrors];
                              newErrors[index] = error;
                              return newErrors;
                            });
                            setAmountOfTokens((oldAmounts: any) => {
                              const newAmounts = { ...oldAmounts };
                              newAmounts[index] = value;
                              return newAmounts;
                            });
                          }}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Button
                          size="xs"
                          colorScheme="teal"
                          width="72px"
                          isDisabled={hasPendingTransactions || !!amountErrors[index]}
                          onClick={() => {
                            setReadTermsChecked(false);
                            setSelectedOfferIndex(index);
                            onProcureModalOpen();
                          }}
                        >
                          Procure
                        </Button>
                      </HStack>
                      {amountErrors[index] && (
                        <Text color="red.400" fontSize="xs">
                          {amountErrors[index]}
                        </Text>
                      )}
                    </>
                  )) || <Box mt="2" h="3rem" />}

                  {isMyListedData && address && (
                    <MyListedDataNFT
                      offer={offer}
                      offers={offers}
                      nftImageLoading={oneNFTImgLoaded}
                      setNftImageLoading={setOneNFTImgLoaded}
                      nftMetadataLoading={nftMetadatasLoading}
                      nftMetadata={nftMetadatas}
                      marketRequirements={marketRequirements}
                      printPrice={printPrice}
                      setDelistAmount={setDelistAmount}
                      setDelistModalState={setDelistModalState}
                      onDelistModalOpen={onDelistModalOpen}
                      setSelectedOfferIndex={setSelectedOfferIndex}
                      setNewListingPrice={setNewListingPrice}
                      amountOfTokens={amountOfTokens}
                      onUpdatePriceModalOpen={onUpdatePriceModalOpen}
                      userData={userData}
                      index={index}
                    />
                  )}
                </>
              ))}
          </Flex>
        )}
      </Stack>
    </>
  );
};

export default Marketplace;
