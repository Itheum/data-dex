import React, { useEffect, useState } from "react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
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
  Skeleton,
  Spinner,
  Stack,
  Tag,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  Wrap,
} from "@chakra-ui/react";
import { ResultsParser } from "@multiversx/sdk-core";
import { useGetPendingTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import axios from "axios";
import mime from "mime";
import { File, NFTStorage } from "nft.storage";
import { convertWeiToEsdt, isValidNumericCharacter, MENU, sleep } from "libs/util";
import { checkBalance } from "MultiversX/api";
import { DataNftMintContract } from "MultiversX/dataNftMint";
import { UserDataType } from "MultiversX/types";
import { useChainMeta } from "store/ChainMetaContext";
import ChainSupportedInput from "UtilComps/ChainSupportedInput";

const InputLabelWithPopover = ({ children, tkey }: { children: any, tkey: string }) => {
  let title = "",
    text = "";
  if (tkey === "data-stream-url") {
    title = "Data Stream URL";
    text =
      "The URL of the hosted data asset that you would like to trade. This URL should be publicly accessible behind a secure domain (one that starts with https://)";
  } else if (tkey === "data-preview-url") {
    title = "Data Preview URL";
    text = "A URL of a free preview of full data asset which should be publicly accessible behind a secure domain (one that starts with https://)";
  } else if (tkey === "data-marshal-url") {
    title = "Data Marshal URL";
    text = "The Data Marshal is the service that brokers the on-chain access control for your data asset";
  } else if (tkey === "token-name") {
    title = "Token Name (Short Title)";
    text = "A short title to describe your data asset. This will be used as the NFT token name";
  } else if (tkey === "dataset-title") {
    title = "Dataset Title";
    text = "A longer title to describe your data asset";
  } else if (tkey === "dataset-description") {
    title = "Dataset Description";
    text = "A description of your data asset";
  } else if (tkey === "number-of-copies") {
    title = "Number of Copies";
    text = 'The total "supply" you would like to mint (i.e. individual copies of your data access license)';
  } else if (tkey === "royalties") {
    title = "Royalties";
    text = 'The "Creator Royalty" you will earn each time a copy is re-traded in the Data NFT Marketplace';
  }

  return (
    <Flex>
      <Popover trigger="hover" placement="auto">
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader fontWeight="semibold">{title}</PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>{text}</PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};

const checkUrlReturns200 = async (url: string) => {
  // check that URL returns 200 code
  try {
    const res = await axios.get(url);
    if (res.status === 200) {
      return {
        isSuccess: true,
        message: "",
      };
    } else {
      return {
        isSuccess: false,
        message: "Data Stream URL must be a publicly accessible url",
      };
    }
  } catch (err: any) {
    console.log('err', err);
    let message = err.message;

    if (err.response && err.response.status) {
      if (err.response.status === 404) {
        message = "Url is not found";
      } else {
        message = err.response.statusText;
      }
    }

    return {
      isSuccess: false,
      message,
    };
  }
};

export default function SellDataMX({ onRfMount, itheumAccount }: { onRfMount: any, itheumAccount: any }) {
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const toast = useToast();
  // const [sellerData, setSellerData] = useState("");
  const [saveProgress, setSaveProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
  });
  const [mintingSuccessful, setMintingSuccessful] = useState(false);
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream } = useDisclosure();
  const { isOpen: isReadTermsModalOpen, onOpen: onReadTermsModalOpen, onClose: onReadTermsModalClose } = useDisclosure();
  const [currSellObject, setCurrSellObject] = useState<any>(null);

  const [isStreamTrade, setIsStreamTrade] = useState(0);

  const [oneNFTImgLoaded, setOneNFTImgLoaded] = useState(false);
  const [dataNFTImg, setDataNFTImg] = useState("");
  const [dataNFTTokenName, setDataNFTTokenName] = useState("");
  const [dataNFTCopies, setDataNFTCopies] = useState(1);
  const [dataNFTRoyalty, setDataNFTRoyalty] = useState(0);
  const [dataNFTStreamUrl, setDataNFTStreamUrl] = useState("");
  const [dataNFTStreamPreviewUrl, setDataNFTStreamPreviewUrl] = useState("");
  const [dataNFTMarshalService, setDataNFTMarshalService] = useState("");
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState<any>(null);

  const [datasetTitle, setDatasetTitle] = useState("");
  const [datasetDescription, setDatasetDescription] = useState("");
  const [readTermsChecked, setReadTermsChecked] = useState(false);
  const [readAntiSpamFeeChecked, setReadAntiSpamFeeChecked] = useState(false);

  const [minRoyalties, setMinRoyalties] = useState(-1);
  const [maxRoyalties, setMaxRoyalties] = useState(-1);
  const [maxSupply, setMaxSupply] = useState(-1);
  const [antiSpamTax, setAntiSpamTax] = useState(-1);

  const [dataNFTStreamUrlStatus, setDataNFTStreamUrlStatus] = useState("");
  const [dataNFTStreamPreviewUrlStatus, setDataNFTStreamPreviewUrlStatus] = useState("");
  const [dataNFTMarshalServiceStatus, setDataNFTMarshalServiceStatus] = useState(false);
  const [dataNFTImgGenServiceValid, setDataNFTImgGenService] = useState(false);

  const [itheumBalance, setItheumBalance] = useState(0);

  const [mintDataNFTDisabled, setMintDataNFTDisabled] = useState(true);
  const [userFocusedForm, setUserFocusedForm] = useState(false);
  const [dataStreamUrlValidation, setDataStreamUrlValidation] = useState(false);
  const [dataPreviewUrlValidation, setDataPreviewUrlValidation] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const mxDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);
  // query settings from Data NFT Minter SC
  useEffect(() => {
    (async () => {
      const interaction = mxDataNftMintContract.contract.methods.getMinRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await mxDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMinRoyalties(value.toNumber() / 100);
      }
    })();
    (async () => {
      const interaction = mxDataNftMintContract.contract.methods.getMaxRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await mxDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxRoyalties(value.toNumber() / 100);
      }
    })();
    (async () => {
      const interaction = mxDataNftMintContract.contract.methods.getMaxSupply();
      const query = interaction.check().buildQuery();
      const queryResponse = await mxDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxSupply(value.toNumber());
      }
    })();
    (async () => {
      const interaction = mxDataNftMintContract.contract.methods.getAntiSpamTax([_chainMeta.contracts.itheumToken]);
      const query = interaction.check().buildQuery();
      const queryResponse = await mxDataNftMintContract.networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setAntiSpamTax(convertWeiToEsdt(value).toNumber());
      }
    })();
  }, []);

  // query Itheum balance of User
  useEffect(() => {
    if (mxAddress && _chainMeta) {
      (async () => {
        const data = await checkBalance(_chainMeta.contracts.itheumToken, mxAddress, _chainMeta.networkId);
        if (typeof data.balance !== "undefined") {
          setItheumBalance(convertWeiToEsdt(data.balance).toNumber());
        }
      })();
    }
  }, [mxAddress, hasPendingTransactions]);

  //
  const [userData, setUserData] = useState<UserDataType | undefined>();
  const getUserData = async () => {
    if (mxAddress) {
      const _userData = await mxDataNftMintContract.getUserDataOut(mxAddress, _chainMeta.contracts.itheumToken);
      setUserData(_userData);
    }
  };
  useEffect(() => {
    getUserData();
  }, [mxAddress, hasPendingTransactions]);

  // set initial states for validation
  useEffect(() => {
    onChangeDataNFTStreamUrl("");
    onChangeDataNFTStreamPreviewUrl("");
    onChangeDataNFTMarshalService(`${process.env.REACT_APP_ENV_DATAMARSHAL_API}/v1/generate`);
    onChangeDataNFTImageGenService();
    onChangeDataNFTTokenName("");
    onChangeDatasetTitle("");
    onChangeDatasetDescription("");
    handleChangeDataNftCopies(1);
    handleChangeDataNftRoyalties(0);

    setMinRoyalties(-2);
    setMaxRoyalties(-2);
    setMaxSupply(-2);
    setAntiSpamTax(-2);
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // validation logic

  const [dataNFTStreamUrlError, setDataNFTStreamUrlError] = useState("");
  const onChangeDataNFTStreamUrl = (value: string) => {
    const trimmedValue = value.trim();
    let error = "";

    if (!trimmedValue.startsWith("https://")) {
      error = "Data Stream URL must start with 'https://'";
    } else if (trimmedValue.includes(" ")) {
      error = "Data Stream URL cannot contain spaces";
    } else if (dataNFTStreamPreviewUrl === trimmedValue) {
      error = "Data Stream URL cannot be same as the Data Stream Preview URL";
    } else if (trimmedValue.length > 1000) {
      error = "Length of Data Stream URL cannot exceed 1000";
    } else {
      // temp disable until we work out a better way to do it without CORS errors on 3rd party hosts
      checkUrlReturns200(trimmedValue).then(({ isSuccess, message }) => {
        setDataNFTStreamUrlStatus(message);
      });
    }

    setDataNFTStreamUrlError(error);
    setDataNFTStreamUrl(trimmedValue);
  };

  const [dataNFTStreamPreviewUrlError, setDataNFTStreamPreviewUrlError] = useState("");
  const onChangeDataNFTStreamPreviewUrl = (value: string) => {
    const trimmedValue = value.trim();
    let error = "";

    if (!trimmedValue.startsWith("https://")) {
      error = "Data Preview URL must start with 'https://'";
    } else if (trimmedValue.includes(" ")) {
      error = "Data Preview URL cannot contain spaces";
    } else if (dataNFTStreamUrl === trimmedValue) {
      error = "Data Preview URL cannot be same as the Data Stream URL";
    } else if (trimmedValue.length > 1000) {
      error = "Length of Data Preview URL cannot exceed 1000";
    } else {
      // temp disable until we work out a better way to do it without CORS errors on 3rd party hosts
      checkUrlReturns200(trimmedValue).then(({ isSuccess, message }) => {
        setDataNFTStreamPreviewUrlStatus(message);
      });
    }

    setDataNFTStreamPreviewUrlError(error);
    setDataNFTStreamPreviewUrl(trimmedValue);
  };

  const onChangeDataNFTMarshalService = (value: string) => {
    const trimmedValue = value.trim();

    // Itheum Data Marshal Service Check
    checkUrlReturns200(`${process.env.REACT_APP_ENV_DATAMARSHAL_API}/health-check`).then(({ isSuccess, message }) => {
      setDataNFTMarshalServiceStatus(message);
    });

    setDataNFTMarshalService(trimmedValue);
  };

  const onChangeDataNFTImageGenService = () => {
    // Itheum Image Gen Service Check (Data DEX API health check)
    checkUrlReturns200(`${process.env.REACT_APP_ENV_DATADEX_API}/health-check`).then(({ isSuccess, message }) => {
      setDataNFTImgGenService(isSuccess);
    });
  };

  const [dataNFTTokenNameError, setDataNFTTokenNameError] = useState("");
  const onChangeDataNFTTokenName = (value: string) => {
    const trimmedValue = value.trim();
    let error = "";

    if (trimmedValue.length < 3 || trimmedValue.length > 20) {
      error = "Length of Token Name must be between 3 and 20 characters";
    } else if (!trimmedValue.match(/^[0-9a-zA-Z]+$/)) {
      error = "Token Name can only contain alphanumeric characters";
    }

    setDataNFTTokenNameError(error);
    setDataNFTTokenName(trimmedValue);
  };

  const [datasetTitleError, setDatasetTitleError] = useState("");
  const onChangeDatasetTitle = (value: string) => {
    let error = "";

    if (value.length < 10 || value.length > 50) {
      error = "Length of Dataset Title must be between 10 and 50 characters";
    } else if (!value.match(/^[0-9a-zA-Z\s]+$/)) {
      error = "Dataset Title can only contain alphanumeric characters";
    }

    setDatasetTitleError(error);
    setDatasetTitle(value);
  };

  const [datasetDescriptionError, setDatasetDescriptionError] = useState("");
  const onChangeDatasetDescription = (value: string) => {
    let error = "";

    if (value.length < 10 || value.length > 250) {
      error = "Length of Dataset Description must be between 10 and 250 characters";
    }

    setDatasetDescriptionError(error);
    setDatasetDescription(value);
  };

  const [dataNFTCopiesError, setDataNFTCopiesError] = useState("");
  const handleChangeDataNftCopies = (value: number) => {
    let error = "";
    if (value < 1) {
      error = "Number of copies cannot be negative";
    } else if (maxSupply >= 0 && value > maxSupply) {
      error = `Number of copies cannot exceed ${maxSupply}`;
    }

    setDataNFTCopiesError(error);
    setDataNFTCopies(value);
  };

  const [dataNFTRoyaltyError, setDataNFTRoyaltyError] = useState("");
  const handleChangeDataNftRoyalties = (value: number) => {
    let error = "";
    if (value < 0) {
      error = "Royalties cannot be negative";
    } else if (minRoyalties >= 0 && value < minRoyalties) {
      error = `Royalties cannot be lower than ${minRoyalties}`;
    } else if (maxRoyalties >= 0 && value > maxRoyalties) {
      error = `Royalties cannot be higher than ${maxRoyalties}`;
    }

    setDataNFTRoyaltyError(error);
    setDataNFTRoyalty(value);
  };

  useEffect(() => {
    // init value
    handleChangeDataNftRoyalties(minRoyalties);
  }, [minRoyalties, maxRoyalties]);
  useEffect(() => {
    // init value
    handleChangeDataNftCopies(1);
  }, [maxSupply]);

  useEffect(() => {
    setMintDataNFTDisabled(
      !!dataNFTStreamUrlError ||
      !!dataNFTStreamPreviewUrlError ||
      !!dataNFTTokenNameError ||
      !!datasetTitleError ||
      !!datasetDescriptionError ||
      !!dataNFTCopiesError ||
      !!dataNFTRoyaltyError ||
      !!dataNFTStreamUrlStatus ||
      !!dataNFTStreamPreviewUrlStatus ||
      !!dataNFTMarshalServiceStatus ||
      !dataNFTImgGenServiceValid ||
      !readTermsChecked ||
      !readAntiSpamFeeChecked ||
      minRoyalties < 0 ||
      maxRoyalties < 0 ||
      maxSupply < 0 ||
      antiSpamTax < 0 ||
      itheumBalance < antiSpamTax ||
      // if userData.contractWhitelistEnabled is true, it means whitelist mode is on; only whitelisted users can mint
      (!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint) ||
      (!!userData && userData.contractPaused) ||
      (!!userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit)
    );
  }, [
    dataNFTStreamUrlError,
    dataNFTStreamPreviewUrlError,
    dataNFTTokenNameError,
    datasetTitleError,
    datasetDescriptionError,
    dataNFTCopiesError,
    dataNFTRoyaltyError,
    dataNFTStreamUrlStatus,
    dataNFTStreamPreviewUrlStatus,
    dataNFTMarshalServiceStatus,
    dataNFTImgGenServiceValid,
    readTermsChecked,
    readAntiSpamFeeChecked,
    minRoyalties,
    maxRoyalties,
    maxSupply,
    antiSpamTax,

    itheumBalance,

    userData,
  ]);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const mintTxFail = (foo: any) => {
    console.log("mintTxFail", foo);
    setSaveProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT has failed"));
  };

  const mintTxCancelled = (foo: any) => {
    console.log("mintTxCancelled", foo);
    setSaveProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT was cancelled"));
  };

  const mintTxSuccess = async (foo: any) => {
    console.log("mintTxSuccess", foo);
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s4: 1 }));
    await sleep(3);

    setMintingSuccessful(true);
  };

  const [mintSessionId, setMintSessionId] = useState(null);

  const getDataForSale = async (programId: any) => {
    setSelectedProgramId(programId);
    let selObj: any;
    let dataCATStreamUrl = "";
    let dataCATStreamPreviewUrl = "";

    if (programId) {
      selObj = {
        ...itheumAccount.programsAllocation.find((i: any) => i.program === programId),
        ...itheumAccount._lookups.programs[programId],
      };
      setCurrSellObject(selObj);

      dataCATStreamUrl = `https://itheumapi.com/readingsStream/${selObj.userId}/${selObj.program}`;
      dataCATStreamPreviewUrl = `https://itheumapi.com/programReadingPreview/${selObj.program}`;

      setDataNFTStreamUrl(dataCATStreamUrl);
      setDataNFTStreamPreviewUrl(dataCATStreamPreviewUrl);
    }

    setIsStreamTrade(isStreamTrade);
    onOpenDrawerTradeStream();

    // as we are setting the stream and preview urls, we need to trigger the onchange of those fields and form to validate it. This only works if we pull off the UI thread (i.e. sleep)
    if (programId) {
      await sleep(3);

      onChangeDataNFTStreamUrl(dataCATStreamUrl);
      onChangeDataNFTStreamPreviewUrl(dataCATStreamPreviewUrl);

      setUserFocusedForm(true);
    }
  };

  const dataNFTSellSubmit = async () => {
    if (!mxAddress) {
      toast({
        title: "Connect your wallet",
        status: "error",
        isClosable: true,
      });
      return;
    }

    if (userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit) {
      toast({
        title: `You can mint next Data NFT-FT after ${new Date(userData.lastUserMintTime + userData.mintTimeLimit).toLocaleString()}`,
        status: "error",
        isClosable: true,
      });
      return;
    }

    const res = await validateBaseInput();
    if (res) {
      setErrDataNFTStreamGeneric(null);
      dataNFTDataStreamAdvertise();
    }
  };

  const dataNFTDataStreamAdvertise = async () => {
    /*
      1) Call the data marshal and get a encrypted data stream url and hash of url (s1)
      2) Use the hash for to generate the robot img URL from the generative API (s2)
        2.1) Save the new generative image to IPFS and get it's IPFS url (s3)
      3) Mint the SFT via the Minter Contract (s4)
    */

    setMintingSuccessful(false);
    onProgressModalOpen();

    const myHeaders = new Headers();
    myHeaders.append("authorization", process.env.REACT_APP_ENV_ITHEUMAPI_M2M_KEY || "");
    myHeaders.append("cache-control", "no-cache");
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ dataNFTStreamUrl }),
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_ENV_DATAMARSHAL_API}/v1/generate`, requestOptions);
      const data = await res.json();

      if (data && data.encryptedMessage && data.messageHash) {
        // setSellerData(data.encryptedMessage); // the data URL is the seller data in this case
        setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s1: 1 }));

        buildUniqueImage({
          dataNFTHash: data.messageHash,
          dataNFTStreamUrlEncrypted: data.encryptedMessage,
        });
      } else {
        if (data.success === false) {
          setErrDataNFTStreamGeneric(new Error(`${data.error.code}, ${data.error.message}`));
        } else {
          setErrDataNFTStreamGeneric(new Error("Data Marshal responded with an unknown error trying to generate your encrypted links"));
        }
      }
    } catch (e) {
      setErrDataNFTStreamGeneric(e);
    }
  };

  async function createFileFromUrl(url: string) {
    const res = await fetch(url);
    const data = await res.blob();
    const _file = new File([data], "image", { type: "image/png" });

    return _file;
  }

  const buildUniqueImage = async ({ dataNFTHash, dataNFTStreamUrlEncrypted }: { dataNFTHash: any, dataNFTStreamUrlEncrypted: any }) => {
    await sleep(3);
    const newNFTImg = `https://d37x5igq4vw5mq.cloudfront.net/datadexapi/v1/generateNFTArt?hash=${dataNFTHash}`;

    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s2: 1 }));

    let res;
    // catch IPFS error
    try {
      const image = await createFileFromUrl(newNFTImg);
      const nftstorage = new NFTStorage({
        token: process.env.REACT_APP_ENV_NFT_STORAGE_KEY || "",
      });
      res = await nftstorage.storeBlob(image);
    } catch (e) {
      setErrDataNFTStreamGeneric(new Error("Uploading the image on IPFS has failed"));
      return;
    }

    if (!res) {
      setErrDataNFTStreamGeneric(new Error("Uploading the image on IPFS has failed"));
      return;
    }
    const imageOnIpfsUrl = `https://ipfs.io/ipfs/${res}`;
    // console.log('imageOnIpfsUrl', imageOnIpfsUrl);

    setDataNFTImg(newNFTImg);
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s3: 1 }));

    await sleep(3);

    handleOnChainMint({ imageOnIpfsUrl, dataNFTStreamUrlEncrypted });
  };

  const handleOnChainMint = async ({ imageOnIpfsUrl, dataNFTStreamUrlEncrypted }: { imageOnIpfsUrl: any, dataNFTStreamUrlEncrypted: any }) => {
    await sleep(3);
    const { sessionId, error } = await mxDataNftMintContract.sendMintTransaction({
      name: dataNFTTokenName,
      media: imageOnIpfsUrl,
      data_marchal: dataNFTMarshalService,
      data_stream: dataNFTStreamUrlEncrypted,
      data_preview: dataNFTStreamPreviewUrl,
      royalties: Math.ceil(dataNFTRoyalty * 100),
      amount: dataNFTCopies,
      title: datasetTitle,
      description: datasetDescription,
      sender: mxAddress,
      itheumToken: _chainMeta.contracts.itheumToken,
      antiSpamTax: antiSpamTax,
    });

    setMintSessionId(sessionId);
  };

  const transactionStatus = useTrackTransactionStatus({
    transactionId: mintSessionId,
    onSuccess: mintTxSuccess,
    onFail: mintTxFail,
    onCancelled: mintTxCancelled,
  });

  const closeProgressModal = () => {
    toast({
      title: 'Success! Data NFT Minted. Head over to your "Data NFT Wallet" to view your new NFT',
      status: "success",
      isClosable: true,
    });

    onProgressModalClose();
    onCloseDrawerTradeStream();

    // initialize modal status
    setSaveProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
    setMintingSuccessful(false);

    // remount the component (quick way to rest all state to pristine)
    onRfMount();
  };

  async function validateBaseInput() {
    if (!dataNFTStreamUrl.includes("https://") || !dataNFTStreamPreviewUrl.includes("https://") || !dataNFTMarshalService.includes("https://")) {
      toast({
        title: "Your data stream url inputs don't seem to be valid. for e.g. stream URLs / marshal service URLs need to have https:// in it",
        status: "error",
        isClosable: true,
      });
      return false;
    } else {
      return true;
    }
  }

  const validateDataStreamUrl = (value: string) => {
    if (value.includes("https://drive.google.com")) {
      setDataStreamUrlValidation(true);
    } else {
      setDataStreamUrlValidation(false);
    }
  };
  const validateDataPreviewUrl = (value: string) => {
    if (value.includes("https://drive.google.com")) {
      setDataPreviewUrlValidation(true);
    } else {
      setDataPreviewUrlValidation(false);
    }
  };

  return (
    <Stack spacing={5}>
      <Heading size="lg">Trade Data</Heading>
      <Heading size="xs" opacity=".7">
        Connect, mint and trade your datasets as Data NFTs in our Data NFT Marketplace
      </Heading>

      <Wrap shouldWrapChildren={true} spacing={5}>
        <Box maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden" mt={5}>
          <Image src="https://itheum-static.s3.ap-southeast-2.amazonaws.com/data-stream.png" alt="" />

          <Box p="6">
            <Box display="flex" alignItems="baseline">
              <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                Any Data Stream as Data NFT-FT
              </Box>
            </Box>
            <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale(null)}>
              Advertise Data
            </Button>
          </Box>
        </Box>
      </Wrap>

      {itheumAccount && itheumAccount.programsAllocation.length > 0 && (
        <>
          <Heading size="md" m="3rem 0 1rem 0 !important">
            Supported Data CAT Programs
          </Heading>
          <Wrap shouldWrapChildren={true} spacing={5}>
            {itheumAccount.programsAllocation.map((item: any) => (
              <Box key={item.program} maxW="xs" borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Image src={`https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-${itheumAccount._lookups.programs[item.program].img}.png`} alt="" />

                <Box p="6">
                  <Box display="flex" alignItems="baseline">
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      {" "}
                      New
                    </Badge>
                    <Box mt="1" ml="2" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                      {itheumAccount._lookups.programs[item.program].programName}
                    </Box>
                  </Box>
                  <Button mt="3" colorScheme="teal" variant="outline" onClick={() => getDataForSale(item.program)}>
                    Trade Program Data
                  </Button>
                </Box>
              </Box>
            ))}
          </Wrap>
        </>
      )}

      <Drawer onClose={onRfMount} isOpen={isDrawerOpenTradeStream} size="xl" closeOnEsc={false} closeOnOverlayClick={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <HStack spacing="5">
              <CloseButton size="lg" onClick={onRfMount} />
              {(currSellObject && (
                <Stack>
                  <Text fontSize="2xl">
                    Trade data from your{" "}
                    <Text color="teal" fontSize="2xl">
                      {currSellObject.programName}
                    </Text>{" "}
                    program as a Data NFT-FT
                  </Text>
                </Stack>
              )) || (
                  <Heading as="h4" size="lg">
                    Trade a Data Stream as a Data NFT-FT
                  </Heading>
                )}
            </HStack>
          </DrawerHeader>
          <DrawerBody
            onClick={() => {
              if (!userFocusedForm) {
                setUserFocusedForm(true);
              }
            }}>
            <Stack spacing="5" mt="5">
              {(minRoyalties < 0 ||
                maxRoyalties < 0 ||
                maxSupply < 0 ||
                antiSpamTax < 0 ||
                !!dataNFTMarshalServiceStatus ||
                !dataNFTImgGenServiceValid ||
                (!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint) ||
                (!!userData && userData.contractPaused))
                && (
                  <Alert status="error">
                    <Stack>
                      <AlertTitle fontSize="md" mb={2}>
                        <AlertIcon display="inline-block" />
                        <Text display="inline-block" lineHeight="2" style={{ verticalAlign: "middle" }}>
                          Uptime Errors
                        </Text>
                      </AlertTitle>
                      <AlertDescription>
                        {minRoyalties < 0 && <Text fontSize="md">Unable to read default value of Min Royalties.</Text>}
                        {maxRoyalties < 0 && <Text fontSize="md">Unable to read default value of Max Royalties.</Text>}
                        {maxSupply < 0 && <Text fontSize="md">Unable to read default value of Max Supply.</Text>}
                        {antiSpamTax < 0 && <Text fontSize="md">Unable to read default value of Anti-Spam Tax.</Text>}
                        {!!dataNFTMarshalServiceStatus && <Text fontSize="md">Data Marshal service is not responding.</Text>}
                        {!dataNFTImgGenServiceValid && <Text fontSize="md">Generative image generation service is not responding.</Text>}
                        {!!userData && userData.contractWhitelistEnabled && !userData.userWhitelistedForMint && (
                          <AlertDescription fontSize="md">You are not currently whitelisted to mint Data NFTs</AlertDescription>
                        )}
                        {!!userData && userData.contractPaused && <Text fontSize="md">The minter smart contract is paused for maintenance.</Text>}
                      </AlertDescription>
                    </Stack>
                  </Alert>
                )}

              {(!!userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit)
                && (
                  <Alert status="error">
                    <Stack>
                      <AlertTitle fontSize="md" mb={2}>
                        <AlertIcon display="inline-block" />
                        <Text display="inline-block" lineHeight="2" style={{ verticalAlign: "middle" }}>
                          Alerts
                        </Text>
                      </AlertTitle>
                      <AlertDescription>
                        {!!userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit && <Text fontSize="md">{`There is a time interval enforced between mints. You can mint your next Data NFT-FT after ${new Date(userData.lastUserMintTime + userData.mintTimeLimit).toLocaleString()}`}</Text>}
                      </AlertDescription>
                    </Stack>
                  </Alert>
                )}

              <Text fontSize="sm" color="gray.400">
                * required fields
              </Text>
              <Text fontSize="sm" color="gray.400" mt="0 !important">
                + click on an item&apos;s title to learn more
              </Text>

              <Text fontWeight="bold" color="teal.200" fontSize="xl" mt="8 !important">
                Data Asset Detail
              </Text>

              <InputLabelWithPopover tkey="data-stream-url">
                <Text fontWeight="bold" fontSize="md">
                  Data Stream URL *
                </Text>
              </InputLabelWithPopover>

              <Input
                mt="1 !important"
                placeholder="e.g. https://mydomain.com/my_hosted_file.json"
                value={dataNFTStreamUrl}
                onChange={(event) => {
                  onChangeDataNFTStreamUrl(event.currentTarget.value);
                  validateDataStreamUrl(event.currentTarget.value);
                }}
                isDisabled={!!selectedProgramId}
              />
              {userFocusedForm && dataNFTStreamUrlError && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTStreamUrlError}
                </Text>
              )}
              {userFocusedForm && dataNFTStreamUrlStatus && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTStreamUrlStatus}
                </Text>
              )}
              {userFocusedForm && dataStreamUrlValidation && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  Data Stream URL doesn&apos;t accept Google Drive URLs
                </Text>
              )}

              <InputLabelWithPopover tkey="data-preview-url">
                <Text fontWeight="bold" fontSize="md">
                  Data Preview URL *
                </Text>
              </InputLabelWithPopover>

              <Input
                mt="1 !important"
                placeholder="e.g. https://mydomain.com/my_hosted_file_preview.json"
                value={dataNFTStreamPreviewUrl}
                onChange={(event) => {
                  onChangeDataNFTStreamPreviewUrl(event.currentTarget.value);
                  validateDataPreviewUrl(event.currentTarget.value);
                }}
                isDisabled={!!selectedProgramId}
              />
              {userFocusedForm && dataNFTStreamPreviewUrlError && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTStreamPreviewUrlError}
                </Text>
              )}
              {userFocusedForm && !!dataNFTStreamPreviewUrlStatus && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTStreamPreviewUrlStatus}
                </Text>
              )}
              {userFocusedForm && dataPreviewUrlValidation && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  Data Preview URL doesn&apos;t accept Google Drive URLs
                </Text>
              )}

              <InputLabelWithPopover tkey="data-marshal-url">
                <Text fontWeight="bold" fontSize="md">
                  Data Marshal Url
                </Text>
              </InputLabelWithPopover>

              <Input mt="1 !important" value={dataNFTMarshalService} disabled />
              {userFocusedForm && !!dataNFTMarshalServiceStatus && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTMarshalServiceStatus}
                </Text>
              )}

              <Text fontWeight="bold" color="teal.200" fontSize="xl" mt="8 !important">
                NFT Token Metadata
              </Text>

              <InputLabelWithPopover tkey="token-name">
                <Text fontWeight="bold" fontSize="md">
                  Token Name (Short Title) *
                </Text>
              </InputLabelWithPopover>

              <Input
                mt="1 !important"
                placeholder="NFT Token Name"
                value={dataNFTTokenName}
                onChange={(event) => onChangeDataNFTTokenName(event.currentTarget.value)}
              />
              <Text color="gray.400" fontSize="sm" mt="0 !important">
                Between 3 and 20 alphanumeric characters only
              </Text>
              {userFocusedForm && dataNFTTokenNameError && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTTokenNameError}
                </Text>
              )}

              <InputLabelWithPopover tkey="dataset-title">
                <Text fontWeight="bold" fontSize="md">
                  Dataset Title *
                </Text>
              </InputLabelWithPopover>

              <Input mt="1 !important" placeholder="Dataset Title" value={datasetTitle} onChange={(event) => onChangeDatasetTitle(event.currentTarget.value)} />
              <Text color="gray.400" fontSize="sm" mt="0 !important">
                Between 10 and 50 alphanumeric characters only
              </Text>
              {userFocusedForm && datasetTitleError && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {datasetTitleError}
                </Text>
              )}

              <InputLabelWithPopover tkey="dataset-description">
                <Text fontWeight="bold" fontSize="md">
                  Dataset Description *
                </Text>
              </InputLabelWithPopover>

              <Textarea
                mt="1 !important"
                placeholder="Enter a description here"
                value={datasetDescription}
                onChange={(event) => onChangeDatasetDescription(event.currentTarget.value)}
              />
              <Text color="gray.400" fontSize="sm" mt="0 !important">
                Between 10 and 250 characters only. URL allowed. Markdown (MD) allowed.
              </Text>
              {userFocusedForm && datasetDescriptionError && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {datasetDescriptionError}
                </Text>
              )}

              <InputLabelWithPopover tkey="number-of-copies">
                <Text fontWeight="bold" fontSize="md">
                  Number of copies
                </Text>
              </InputLabelWithPopover>

              <NumberInput
                mt="1 !important"
                size="md"
                maxW={24}
                step={1}
                defaultValue={1}
                min={1}
                max={maxSupply > 0 ? maxSupply : 1}
                value={dataNFTCopies}
                isValidCharacter={isValidNumericCharacter}
                onChange={(valueAsString: string) => handleChangeDataNftCopies(Number(valueAsString))}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text color="gray.400" fontSize="sm" mt="0 !important">
                Limit the quality to increase value (rarity) - Suggested: less than {maxSupply}
              </Text>
              {userFocusedForm && dataNFTCopiesError && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTCopiesError}
                </Text>
              )}

              <InputLabelWithPopover tkey="royalties">
                <Text fontWeight="bold" fontSize="md">
                  Royalties
                </Text>
              </InputLabelWithPopover>

              <NumberInput
                mt="1 !important"
                size="md"
                maxW={24}
                step={5}
                defaultValue={minRoyalties}
                min={minRoyalties > 0 ? minRoyalties : 0}
                max={maxRoyalties > 0 ? maxRoyalties : 0}
                isValidCharacter={isValidNumericCharacter}
                value={dataNFTRoyalty}
                onChange={(valueAsString: string) => handleChangeDataNftRoyalties(Number(valueAsString))}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text color="gray.400" fontSize="sm" mt="0 !important">
                Min: {minRoyalties >= 0 ? minRoyalties : "-"}%, Max: {maxRoyalties >= 0 ? maxRoyalties : "-"}%
              </Text>
              {userFocusedForm && dataNFTRoyaltyError && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  {dataNFTRoyaltyError}
                </Text>
              )}

              <Text fontWeight="bold" color="teal.200" fontSize="xl" mt="8 !important">
                Terms and Fees
              </Text>
              <Text fontSize="md" mt="4 !important">
                Minting a Data NFT and putting it for trade on the Data DEX means you have to agree to some strict “terms of use”, as an example, you agree that
                the data is free of any illegal material and that it does not breach any copyright laws. You also agree to make sure the Data Stream URL is
                always online. Given it&apos;s an NFT, you also have limitations like not being able to update the title, description, royalty, etc. But there
                are other conditions too. Take some time to read these “terms of use” before you proceed and it&apos;s critical you understand the terms of use
                before proceeding.
              </Text>
              <Flex mt="3 !important">
                <Button colorScheme="teal" variant="outline" size="sm" onClick={onReadTermsModalOpen}>
                  Read Terms of Use
                </Button>
              </Flex>
              <Checkbox size="md" mt="3 !important" isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
                I have read and I agree to the Terms of Use
              </Checkbox>
              {userFocusedForm && !readTermsChecked && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  Please read and agree to terms of use.
                </Text>
              )}

              <Text fontSize="md" mt="8 !important">
                An “anti-spam fee” is required to ensure that the Data DEX does not get impacted by spam datasets created by bad actors. This fee will be
                dynamically adjusted by the protocol based on ongoing dataset curation discovery by the Itheum DAO.
              </Text>
              <Flex mt="3 !important">
                <Tag variant="solid" colorScheme="teal">
                  Anti-Spam Fee is currently {antiSpamTax < 0 ? "?" : antiSpamTax} ITHEUM tokens
                </Tag>
              </Flex>
              {itheumBalance < antiSpamTax && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  You don&apos;t have enough ITHEUM for Anti-Spam Tax
                </Text>
              )}
              <Flex mt="3 !important">
                <Button colorScheme="teal" variant="outline" size="sm" onClick={onReadTermsModalOpen}>
                  Read about the Anti-Spam fee
                </Button>
              </Flex>
              <Checkbox size="md" mt="3 !important" isChecked={readAntiSpamFeeChecked} onChange={(e) => setReadAntiSpamFeeChecked(e.target.checked)}>
                I accept the deduction of the anti-spam minting fee from my wallet
              </Checkbox>
              {userFocusedForm && !readAntiSpamFeeChecked && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  You need to agree to anti-spam deduction to mint
                </Text>
              )}

              <Flex>
                <ChainSupportedInput feature={MENU.SELL}>
                  <Button mt="5" colorScheme="teal" isLoading={isProgressModalOpen} onClick={dataNFTSellSubmit} isDisabled={mintDataNFTDisabled}>
                    Mint and Trade as NFT
                  </Button>
                </ChainSupportedInput>
              </Flex>
            </Stack>

            <Modal isOpen={isProgressModalOpen} onClose={closeProgressModal} closeOnEsc={false} closeOnOverlayClick={false}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Data Advertising Progress</ModalHeader>
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
                      <Text>Saving NFT Metadata to IPFS</Text>
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
                          <Link href="datanfts/wallet" textDecoration="none" _hover={{ textDecoration: "none" }}>
                            <Button colorScheme="teal">Visit your Data NFT Wallet to see it!</Button>
                          </Link>
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
                          <CloseButton position="absolute" right="8px" top="8px" onClick={() => onProgressModalClose()} />
                        </Stack>
                      </Alert>
                    )}
                  </Stack>
                </ModalBody>
              </ModalContent>
            </Modal>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isReadTermsModalOpen} onClose={onReadTermsModalClose} closeOnEsc={false} closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalHeader>Data NFT-FT Terms of Use</ModalHeader>
          <ModalBody pb={6}>
            <Text>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,
              but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
              sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
            </Text>
            <Flex justifyContent="end" mt="6 !important">
              <Button colorScheme="teal" onClick={onReadTermsModalClose}>
                I have read this
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
}