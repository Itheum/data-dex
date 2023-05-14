import React, { useEffect, useState } from "react";
import { CheckCircleIcon, ExternalLinkIcon } from "@chakra-ui/icons";
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
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  useColorMode,
  useDisclosure,
  useToast,
  Wrap,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { ResultsParser } from "@multiversx/sdk-core";
import { useGetPendingTransactions, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { File, NFTStorage } from "nft.storage";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import ChainSupportedInput from "components/UtilComps/ChainSupportedInput";
import { MENU } from "libs/config";
import { labels } from "libs/language";
import { getNetworkProvider } from "libs/MultiversX/api";
import { DataNftMintContract } from "libs/MultiversX/dataNftMint";
import { convertWeiToEsdt, isValidNumericCharacter, sleep } from "libs/utils";
import { useAccountStore, useMintStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";

const InputLabelWithPopover = ({ children, tkey }: { children: any; tkey: string }) => {
  let title = "",
    text = "";

  if (tkey === "data-stream-url") {
    title = "Data Stream URL";
    text = labels.MINT_FORM_POPUP_INFO_DATA_STREAM;
  } else if (tkey === "data-preview-url") {
    title = "Data Preview URL";
    text = labels.MINT_FORM_POPUP_INFO_DATA_PREVIEW;
  } else if (tkey === "data-marshal-url") {
    title = "Data Marshal URL";
    text = labels.MINT_FORM_POPUP_INFO_DATA_MARSHAL;
  } else if (tkey === "token-name") {
    title = "Token Name (Short Title)";
    text = labels.MINT_FORM_POPUP_INFO_TOKEN_NAME;
  } else if (tkey === "dataset-title") {
    title = "Dataset Title";
    text = labels.MINT_FORM_POPUP_INFO_TITLE;
  } else if (tkey === "dataset-description") {
    title = "Dataset Description";
    text = labels.MINT_FORM_POPUP_INFO_DESC;
  } else if (tkey === "number-of-copies") {
    title = "Number of Copies";
    text = labels.MINT_FORM_POPUP_INFO_SUPPLY;
  } else if (tkey === "royalties") {
    title = "Royalties";
    text = labels.MINT_FORM_POPUP_INFO_ROYALTY;
  }

  return (
    <Flex fontSize="small">
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

function makeRequest(url: string): Promise<{ statusCode: number; isError: boolean }> {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function (e) {
      resolve({
        statusCode: this.status,
        isError: false,
      });
    };
    xhr.onerror = function (e) {
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

// Declaring the form types
type TradeDataFormType = {
  dataStreamUrlForm: string;
  dataPreviewUrlForm: string;
  tokenNameForm: string;
  datasetTitleForm: string;
  datasetDescriptionForm: string;
  numberOfCopiesForm: number;
  royaltiesForm: number;
};

export default function MintDataMX({ onRfMount, dataCATAccount, setMenuItem }: { onRfMount: any; dataCATAccount: any, setMenuItem: any }) {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { chainMeta: _chainMeta } = useChainMeta();
  const toast = useToast();

  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const userData = useMintStore((state) => state.userData);

  const [saveProgress, setSaveProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
  });
  const [mintingSuccessful, setMintingSuccessful] = useState(false);
  const { isOpen: isProgressModalOpen, onOpen: onProgressModalOpen, onClose: onProgressModalClose } = useDisclosure();
  const { isOpen: isDrawerOpenTradeStream, onOpen: onOpenDrawerTradeStream, onClose: onCloseDrawerTradeStream } = useDisclosure();

  const [currDataCATSellObj, setCurrDataCATSellObj] = useState<any>(null);
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
  const [mintDataNFTDisabled, setMintDataNFTDisabled] = useState(true);
  const [userFocusedForm, setUserFocusedForm] = useState(false);
  const [, setDataStreamUrlValidation] = useState(false);
  const [, setDataPreviewUrlValidation] = useState(false);
  const [dataNFTStreamUrlError, setDataNFTStreamUrlError] = useState("");
  const [dataNFTStreamPreviewUrlError, setDataNFTStreamPreviewUrlError] = useState("");
  const [dataNFTTokenNameError, setDataNFTTokenNameError] = useState("");
  const [datasetTitleError, setDatasetTitleError] = useState("");
  const [datasetDescriptionError, setDatasetDescriptionError] = useState("");
  const [dataNFTCopiesError, setDataNFTCopiesError] = useState("");
  const [dataNFTRoyaltyError, setDataNFTRoyaltyError] = useState("");
  const [mintSessionId, setMintSessionId] = useState(null);

  const mxDataNftMintContract = new DataNftMintContract(_chainMeta.networkId);

  // React hook form + yup integration
  // Declaring a validation schema for the form with the validation needed
  const validationSchema = Yup.object().shape({
    dataStreamUrlForm: Yup.string()
      .required("Data Stream URL is required")
      .url("Data Stream must be URL")
      .notOneOf(["https://drive.google.com"], `Data Stream URL doesn't accept Google Drive URLs`)
      .test("is-distinct", "Data Stream URL cannot be the same as the Data Preview URL", function (value) {
        return value !== this.parent.dataPreviewUrlForm;
      })
      .test("is-200", "Data Stream URL must be public", async function (value: string) {
        const { isSuccess, message } = await checkUrlReturns200(value);
        if (!isSuccess) {
          return this.createError({ message });
        }
        return true;
      }),

    dataPreviewUrlForm: Yup.string()
      .required("Data Preview URL is required")
      .url("Data Preview must be URL")
      .notOneOf(["https://drive.google.com"], `Data Preview URL doesn't accept Google Drive URLs`)
      .test("is-distinct", "Data Preview URL cannot be the same as the Data Stream URL", function (value) {
        return value !== this.parent.dataStreamUrlForm;
      })
      .test("is-200", "Data Stream URL must be public", async function (value: string) {
        const { isSuccess, message } = await checkUrlReturns200(value);
        if (!isSuccess) {
          return this.createError({ message });
        }
        return true;
      }),

    tokenNameForm: Yup.string()
      .required("Token name is required")
      .matches(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are allowed")
      .min(3, "Token name must have at least 3 characters.")
      .max(20, "Token name must have maximum of 20 characters."),

    datasetTitleForm: Yup.string()
      .required("Dataset title is required")
      .matches(/^[a-zA-Z0-9\s]+$/, "Only alphanumeric characters are allowed")
      .min(10, "Dataset title must have at least 10 characters.")
      .max(60, "Dataset title must have maximum of 60 characters."),
    datasetDescriptionForm: Yup.string()
      .required("Dataset description is required")
      .min(10, "Dataset description must have at least 10 characters.")
      .max(400, "Dataset description must have maximum of 400 characters."),

    numberOfCopiesForm: Yup.number()
      .typeError("Number of copies must be a number.")
      .min(1, "Minimum number of copies should be 1 or greater.")
      .max(maxSupply, `Number of copies should be less than ${maxSupply}.`)
      .required("Number of copies is required"),

    royaltiesForm: Yup.number()
      .typeError("Royalties must be a number.")
      .min(0, "Minimum value of royalties is 0%.")
      .max(maxRoyalties, `Maximum value of royalties is ${maxRoyalties}`)
      .required("Royalties is required"),
  });

  // Destructure the methods needed from React Hook Form useForm component
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<TradeDataFormType>({
    defaultValues: {
      dataStreamUrlForm: "",
      dataPreviewUrlForm: "",
      tokenNameForm: "",
      datasetTitleForm: "",
      datasetDescriptionForm: "",
      numberOfCopiesForm: 1,
      royaltiesForm: 0,
    }, // declaring default values for inputs not necessary to declare
    mode: "onChange", // mode stay for when the validation should be applied
    resolver: yupResolver(validationSchema), // telling to React Hook Form that we want to use yupResolver as the validation schema
  });

  const onSubmit = (data: TradeDataFormType) => {
    console.log(data);
  }; // here you can make logic that you want to happen on submit (used for debugging)

  // query settings from Data NFT Minter SC
  useEffect(() => {
    if (!_chainMeta.networkId) return;

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId);
      const interaction = mxDataNftMintContract.contract.methods.getMinRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMinRoyalties(value.toNumber() / 100);
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId);
      const interaction = mxDataNftMintContract.contract.methods.getMaxRoyalties();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxRoyalties(value.toNumber() / 100);
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId);
      const interaction = mxDataNftMintContract.contract.methods.getMaxSupply();
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setMaxSupply(value.toNumber());
      }
    })();

    (async () => {
      const networkProvider = getNetworkProvider(_chainMeta.networkId);
      const interaction = mxDataNftMintContract.contract.methods.getAntiSpamTax([_chainMeta.contracts.itheumToken]);
      const query = interaction.check().buildQuery();
      const queryResponse = await networkProvider.queryContract(query);
      const endpointDefinition = interaction.getEndpoint();
      const { firstValue } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
      if (firstValue) {
        const value = firstValue.valueOf();
        setAntiSpamTax(convertWeiToEsdt(value).toNumber());
      }
    })();
  }, [_chainMeta.networkId]);

  // set initial states for validation
  useEffect(() => {
    onChangeDataNFTStreamUrl("");
    onChangeDataNFTStreamPreviewUrl("");
    onChangeDataNFTMarshalService(`${process.env.REACT_APP_ENV_DATAMARSHAL_API}`);
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
  // S: validation logic

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
      setDataNFTMarshalServiceStatus(!isSuccess);
    });

    setDataNFTMarshalService(trimmedValue);
  };

  const onChangeDataNFTImageGenService = () => {
    // Itheum Image Gen Service Check (Data DEX API health check)
    checkUrlReturns200(`${process.env.REACT_APP_ENV_DATADEX_API}/health-check`).then(({ isSuccess, message }) => {
      setDataNFTImgGenService(isSuccess);
    });
  };

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

  const onChangeDatasetTitle = (value: string) => {
    let error = "";

    if (value.length < 10 || value.length > 60) {
      error = "Length of Dataset Title must be between 10 and 60 characters";
    } else if (!value.match(/^[0-9a-zA-Z\s]+$/)) {
      error = "Dataset Title can only contain alphanumeric characters";
    }

    setDatasetTitleError(error);
    setDatasetTitle(value);
  };

  const onChangeDatasetDescription = (value: string) => {
    let error = "";

    if (value.length < 10 || value.length > 400) {
      error = "Length of Dataset Description must be between 10 and 400 characters";
    }

    setDatasetDescriptionError(error);
    setDatasetDescription(value);
  };

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

  // E: validation logic
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const mintTxFail = (foo: any) => {
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT has failed"));
  };

  const mintTxCancelled = (foo: any) => {
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT was cancelled"));
  };

  const mintTxSuccess = async (foo: any) => {
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s4: 1 }));
    await sleep(3);

    setMintingSuccessful(true);
  };

  const getDataForSale = async (dataCATProgram: any) => {
    let selObj: any;
    let dataCATStreamUrl = "";
    let dataCATStreamPreviewUrl = "";

    if (dataCATProgram?.program) {
      selObj = {
        ...dataCATAccount.programsAllocation.find((i: any) => i.program === dataCATProgram.program),
        ...dataCATAccount._lookups.programs[dataCATProgram.program],
      };

      setCurrDataCATSellObj(selObj);

      if (selObj?.group === "custom") {
        dataCATStreamUrl = selObj.dataStreamURL;
        dataCATStreamPreviewUrl = selObj.dataPreviewURL;
      } else {
        dataCATStreamUrl = `https://itheumapi.com/readingsStream/${selObj.userId}/${selObj.program}`;
        dataCATStreamPreviewUrl = `https://itheumapi.com/programReadingPreview/${selObj.program}`;
      }

      setDataNFTStreamUrl(dataCATStreamUrl);
      setDataNFTStreamPreviewUrl(dataCATStreamPreviewUrl);
      onChangeDatasetDescription(selObj.description);
    }

    setIsStreamTrade(isStreamTrade);
    onOpenDrawerTradeStream();

    // as we are setting the stream and preview urls, we need to trigger the onchange of those fields and form to validate it. This only works if we pull off the UI thread (i.e. sleep)
    if (dataCATProgram?.program) {
      await sleep(3);

      onChangeDataNFTStreamUrl(dataCATStreamUrl);
      onChangeDataNFTStreamPreviewUrl(dataCATStreamPreviewUrl);

      setUserFocusedForm(true);
    }
  };

  const dataNFTSellSubmit = async () => {
    if (!mxAddress) {
      toast({
        title: labels.ERR_MINT_FORM_NO_WALLET_CONN,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return;
    }

    if (userData && Date.now() < userData.lastUserMintTime + userData.mintTimeLimit) {
      toast({
        title: `${labels.ERR_MINT_FORM_MINT_AGAIN_WAIT} ${new Date(userData.lastUserMintTime + userData.mintTimeLimit).toLocaleString()}`,
        status: "error",
        isClosable: true,
        duration: 20000,
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
      2) Use the hash for to generate the gen img URL from the generative API (s2)
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
      const res = await fetch(`${process.env.REACT_APP_ENV_DATAMARSHAL_API}/generate`, requestOptions);
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
          setErrDataNFTStreamGeneric(new Error(`${labels.ERR_MINT_FORM_ENCRYPT_MARSHAL_FAIL} [${data.error.code}], ${data.error.message}`));
        } else {
          setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_FORM_ENCRYPT_MARSHAL_FAIL));
        }
      }
    } catch (e) {
      setErrDataNFTStreamGeneric(e);
    }
  };

  async function createFileFromUrl(url: string) {
    const res = await fetch(url);
    const data = await res.blob();
    const _imageFile = new File([data], "image.png", { type: "image/png" });
    const traits = createIpfsMetadata(res.headers.get("x-nft-traits") || "");
    const _traitsFile = new File([JSON.stringify(traits)], "metadata.json", { type: "application/json" });
    return { image: _imageFile, traits: _traitsFile };
  }

  function createIpfsMetadata(traits: string) {
    const metadata = {
      description: `${datasetTitle} : ${datasetDescription}`,
      attributes: [] as object[],
    };

    const attributes = traits.split(",").filter((element) => element.trim() !== "");
    const metadataAttributes = [];

    for (const attribute of attributes) {
      const [key, value] = attribute.split(":");
      const trait = { trait_type: key.trim(), value: value.trim() };
      metadataAttributes.push(trait);
    }

    metadataAttributes.push({ trait_type: "Data Preview URL", value: dataNFTStreamPreviewUrl });
    metadataAttributes.push({ trait_type: "Creator", value: mxAddress });
    metadata.attributes = metadataAttributes;

    return metadata;
  }

  const buildUniqueImage = async ({ dataNFTHash, dataNFTStreamUrlEncrypted }: { dataNFTHash: any; dataNFTStreamUrlEncrypted: any }) => {
    await sleep(3);
    const newNFTImg = `${process.env.REACT_APP_ENV_DATADEX_API}/v1/generateNFTArt?hash=${dataNFTHash}`;

    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s2: 1 }));

    let res;

    try {
      // catch IPFS error
      const { image, traits } = await createFileFromUrl(newNFTImg);

      const nftstorage = new NFTStorage({
        token: process.env.REACT_APP_ENV_NFT_STORAGE_KEY || "",
      });

      res = await nftstorage.storeDirectory([image, traits]);
    } catch (e) {
      setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_FORM_NFT_IMG_GEN_AND_STORAGE_CATCH_HIT));
      return;
    }

    if (!res) {
      setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_FORM_NFT_IMG_GEN_ISSUE));
      return;
    }

    const imageOnIpfsUrl = `https://ipfs.io/ipfs/${res}/image.png`;
    const metadataOnIpfsUrl = `https://ipfs.io/ipfs/${res}/metadata.json`;

    setDataNFTImg(newNFTImg);
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s3: 1 }));

    await sleep(3);

    handleOnChainMint({ imageOnIpfsUrl, metadataOnIpfsUrl, dataNFTStreamUrlEncrypted });
  };

  const handleOnChainMint = async ({
    imageOnIpfsUrl,
    metadataOnIpfsUrl,
    dataNFTStreamUrlEncrypted,
  }: {
    imageOnIpfsUrl: string;
    metadataOnIpfsUrl: string;
    dataNFTStreamUrlEncrypted: string;
  }) => {
    await sleep(3);
    const { sessionId, error } = await mxDataNftMintContract.sendMintTransaction({
      name: dataNFTTokenName,
      media: imageOnIpfsUrl,
      metadata: metadataOnIpfsUrl,
      data_marshal: dataNFTMarshalService,
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
    if (error) {
      setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_NO_TX));
    }

    setMintSessionId(sessionId);
  };

  useTrackTransactionStatus({
    transactionId: mintSessionId,
    onSuccess: mintTxSuccess,
    onFail: mintTxFail,
    onCancelled: mintTxCancelled,
  });

  const closeProgressModal = () => {
    if (mintingSuccessful) {
      toast({
        title: 'Success! Data NFT Minted. Head over to your "Data NFT Wallet" to view your new NFT',
        status: "success",
        isClosable: true,
      });

      onCloseDrawerTradeStream();

      // remount the component (quick way to rest all state to pristine)
      onRfMount();
    }

    onProgressModalClose();

    // re-initialize modal status
    setSaveProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
    setMintingSuccessful(false);
    setDataNFTImg("");
  };

  function validateBaseInput() {
    if (!dataNFTStreamUrl.includes("https://") || !dataNFTStreamPreviewUrl.includes("https://") || !dataNFTMarshalService.includes("https://")) {
      toast({
        title: labels.ERR_URL_MISSING_HTTPS,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return true;
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
    <>
      <Stack mt={10} mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }}>
        <Heading size="xl" fontWeight="medium">
          Trade Data
        </Heading>
        <Heading size="1rem" opacity=".7" fontWeight="light">
          Connect, mint and trade your datasets as Data NFTs in our Data NFT Marketplace
        </Heading>

        <Wrap shouldWrapChildren={true} spacing={5} display={"flex"} justifyContent={{ base: "center", md: "start" }} overflow={"unset"}>
          <Box maxW="xs" overflow="hidden" mt={5} border=".01rem solid transparent" borderColor="#00C79740" borderRadius="0.75rem">
            <Image src="https://itheum-static.s3.ap-southeast-2.amazonaws.com/data-stream.png" alt="" rounded="lg" />

            <Box p="6">
              <Box display="flex" alignItems="baseline">
                <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" noOfLines={1}>
                  Any Data Stream as Data NFT-FT
                </Box>
              </Box>
              <Button mt="3" colorScheme="teal" variant="outline" borderRadius="xl" onClick={() => getDataForSale(null)}>
                <Text color={colorMode === "dark" ? "white" : "black"}>Advertise Data</Text>
              </Button>
            </Box>
          </Box>
        </Wrap>

        {dataCATAccount?.programsAllocation?.length > 0 && (
          <>
            <Heading size="lg" fontWeight="semibold" marginTop="6rem !important">
              Supported Data CAT Programs
            </Heading>
            <Heading size="sm" opacity=".7" fontWeight="normal" marginBottom="5 !important">
              Join a community built app and earn rewards if you trade your data
            </Heading>
            <Wrap shouldWrapChildren={true} spacingX={5} marginBottom="8 !important">
              {dataCATAccount.programsAllocation.map((item: any) => (
                <Box key={item.program} maxW="22.4rem" borderWidth="1px" overflow="hidden" border=".1rem solid transparent" backgroundColor="none">
                  <Image
                    src={`https://itheum-static.s3-ap-southeast-2.amazonaws.com/dex-${dataCATAccount._lookups.programs[item.program].img}.png`}
                    alt=""
                    height="13.375rem"
                    border="1px solid transparent"
                    borderColor="#00C797"
                    borderRadius="16px"
                  />

                  <Box paddingTop="6" paddingBottom="2">
                    <Box display="flex" alignItems="center">
                      <Badge borderRadius="sm" px="2" py="0.08rem" colorScheme="teal">
                        {" "}
                        New
                      </Badge>
                      <Box ml="2" fontWeight="semibold" lineHeight="tight" fontSize="2xl" noOfLines={1}>
                        {dataCATAccount._lookups.programs[item.program].programName}
                      </Box>
                    </Box>
                    <Button mt="2" colorScheme="teal" variant="outline" borderRadius="xl" onClick={() => getDataForSale(item)}>
                      <Text color={colorMode === "dark" ? "white" : "black"}>Trade Program Data</Text>
                    </Button>
                  </Box>
                </Box>
              ))}
            </Wrap>
          </>
        )}

        <Drawer onClose={onRfMount} isOpen={isDrawerOpenTradeStream} size="xl" closeOnEsc={true} closeOnOverlayClick={true}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader bgColor="#181818">
              <HStack spacing="5">
                <CloseButton size="lg" onClick={onRfMount} />
                {(currDataCATSellObj && (
                  <Stack>
                    <Box fontSize="2xl">
                      Trade data from your{" "}
                      <Text color="teal.200" fontSize="2xl">
                        {currDataCATSellObj.programName}
                      </Text>{" "}
                      program as a Data NFT-FT
                    </Box>
                  </Stack>
                )) || (
                  <Heading as="h4" size="lg">
                    Trade a Data Stream as a Data NFT-FT
                  </Heading>
                )}
              </HStack>
            </DrawerHeader>
            <DrawerBody
              bgColor="#181818"
              overflowX={"hidden"}
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
                        {minRoyalties < 0 && <Text fontSize="md">Unable to read default value of Min Royalties.</Text>}
                        {maxRoyalties < 0 && <Text fontSize="md">Unable to read default value of Max Royalties.</Text>}
                        {maxSupply < 0 && <Text fontSize="md">Unable to read default value of Max Supply.</Text>}
                        {antiSpamTax < 0 && <Text fontSize="md">Unable to read default value of Anti-Spam Tax.</Text>}
                        {!!dataNFTMarshalServiceStatus && <Text fontSize="md">{labels.ERR_DATA_MARSHAL_DOWN}</Text>}
                        {!dataNFTImgGenServiceValid && <Text fontSize="md">Generative image generation service is not responding.</Text>}
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

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Flex flexDirection="row">
                    <Text fontSize="xl" color="red.400">
                      *
                    </Text>
                    <Text color="teal.200" fontSize="lg">
                      &nbsp;required fields
                    </Text>
                  </Flex>
                  <Text fontSize="lg" color="teal.200" mt="0 !important">
                    + hover on an item&apos;s title to learn more
                  </Text>

                  <Flex flexDirection={"column"} gap="3">
                    <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="8 !important">
                      Data Asset Detail
                    </Text>

                    <Flex flexDirection="row" gap="7">
                      <FormControl isInvalid={!!errors.dataStreamUrlForm} isRequired minH={"6.25rem"}>
                        <InputLabelWithPopover tkey="data-stream-url">
                          <FormLabel fontWeight="bold" fontSize="md">
                            Data Stream URL
                          </FormLabel>
                        </InputLabelWithPopover>

                        <Controller
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <Input
                              mt="1 !important"
                              placeholder="e.g. https://mydomain.com/my_hosted_file.json"
                              id="dataStreamUrlForm"
                              isDisabled={!!currDataCATSellObj}
                              value={dataNFTStreamUrl}
                              onChange={(event) => {
                                onChange(event.target.value);
                                onChangeDataNFTStreamUrl(event.currentTarget.value);
                                validateDataStreamUrl(event.currentTarget.value);
                              }}
                            />
                          )}
                          name={"dataStreamUrlForm"}
                        />
                        <FormErrorMessage>{errors?.dataStreamUrlForm?.message}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.dataPreviewUrlForm} isRequired minH={{ base: "7rem", md: "6.25rem" }}>
                        <InputLabelWithPopover tkey="data-preview-url">
                          <FormLabel fontWeight="bold" fontSize="md">
                            Data Preview URL
                          </FormLabel>
                        </InputLabelWithPopover>

                        <Controller
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <Input
                              mt="1 !important"
                              placeholder="e.g. https://mydomain.com/my_hosted_file_preview.json"
                              id="dataPreviewUrlForm"
                              isDisabled={!!currDataCATSellObj}
                              value={dataNFTStreamPreviewUrl}
                              onChange={(event) => {
                                onChange(event.target.value);
                                onChangeDataNFTStreamPreviewUrl(event.currentTarget.value);
                                validateDataPreviewUrl(event.currentTarget.value);
                              }}
                            />
                          )}
                          name="dataPreviewUrlForm"
                        />
                        <FormErrorMessage>{errors?.dataPreviewUrlForm?.message}</FormErrorMessage>

                        {currDataCATSellObj && (
                          <Link fontSize="sm" href={dataNFTStreamPreviewUrl} isExternal>
                            View Preview Data <ExternalLinkIcon mx="2px" />
                          </Link>
                        )}
                      </FormControl>
                    </Flex>

                    <InputLabelWithPopover tkey="data-marshal-url">
                      <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
                        Data Marshal Url
                      </Text>
                    </InputLabelWithPopover>

                    <Input mt="1 !important" value={dataNFTMarshalService} disabled />

                    {userFocusedForm && !!dataNFTMarshalServiceStatus && (
                      <Text color="red.400" fontSize="sm" mt="1 !important">
                        {dataNFTMarshalServiceStatus}
                      </Text>
                    )}
                  </Flex>

                  <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="8 !important">
                    NFT Token Metadata
                  </Text>

                  <Flex flexDirection="row" gap="7" mt={2}>
                    <FormControl isInvalid={!!errors.tokenNameForm} isRequired minH={{ base: "7rem", md: "6.25rem" }}>
                      <InputLabelWithPopover tkey="token-name">
                        <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
                          Token Name (Short Title)
                        </FormLabel>
                      </InputLabelWithPopover>

                      <Controller
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Input
                            mt="1 !important"
                            placeholder="Between 3 and 20 alphanumeric characters only"
                            id="tokenNameForm"
                            value={dataNFTTokenName}
                            onChange={(event) => {
                              onChange(event.target.value);
                              onChangeDataNFTTokenName(event.currentTarget.value);
                            }}
                          />
                        )}
                        name={"tokenNameForm"}
                      />
                      <FormErrorMessage>{errors?.tokenNameForm?.message}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.datasetTitleForm} isRequired minH={"6.25rem"}>
                      <InputLabelWithPopover tkey="dataset-title">
                        <FormLabel fontWeight="bold" fontSize="md">
                          Dataset Title
                        </FormLabel>
                      </InputLabelWithPopover>

                      <Controller
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Input
                            mt="1 !important"
                            placeholder="Between 10 and 60 alphanumeric characters only"
                            id="datasetTitleForm"
                            value={datasetTitle}
                            onChange={(event) => {
                              onChange(event.target.value);
                              onChangeDatasetTitle(event.currentTarget.value);
                            }}
                          />
                        )}
                        name="datasetTitleForm"
                      />
                      <FormErrorMessage>{errors?.datasetTitleForm?.message}</FormErrorMessage>
                    </FormControl>
                  </Flex>

                  <Flex flexDirection="row" gap={7}>
                    <FormControl isInvalid={!!errors.datasetDescriptionForm} isRequired maxW={"48%"}>
                      <InputLabelWithPopover tkey="dataset-description">
                        <FormLabel fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }} noOfLines={1}>
                          Dataset Description
                        </FormLabel>
                      </InputLabelWithPopover>

                      <Controller
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <Textarea
                            mt="1 !important"
                            h={"70%"}
                            placeholder="Between 10 and 400 characters only. URL allowed."
                            id={"datasetDescriptionForm"}
                            value={datasetDescription}
                            onChange={(event) => {
                              onChange(event.target.value);
                              onChangeDatasetDescription(event.currentTarget.value);
                            }}
                          />
                        )}
                        name="datasetDescriptionForm"
                      />
                      <FormErrorMessage>{errors?.datasetDescriptionForm?.message}</FormErrorMessage>
                    </FormControl>
                    <Box display="flex" flexDirection="column">
                      <FormControl isInvalid={!!errors.numberOfCopiesForm} minH={{ base: "9.75rem", md: "8.25rem" }}>
                        <InputLabelWithPopover tkey="number-of-copies">
                          <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
                            Number of copies
                          </Text>
                        </InputLabelWithPopover>

                        <Controller
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumberInput
                              mt="3 !important"
                              size="md"
                              id="numberOfCopiesForm"
                              maxW={24}
                              step={1}
                              defaultValue={1}
                              min={1}
                              value={dataNFTCopies}
                              max={maxSupply > 0 ? maxSupply : 1}
                              isValidCharacter={isValidNumericCharacter}
                              onChange={(valueAsString: string) => {
                                onChange(valueAsString);
                                handleChangeDataNftCopies(Number(valueAsString));
                              }}>
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          )}
                          name="numberOfCopiesForm"
                        />
                        <Text color="gray.400" fontSize="sm" mt={"1"}>
                          Limit the quality to increase value (rarity) - Suggested: less than {maxSupply}
                        </Text>
                        <FormErrorMessage>{errors?.numberOfCopiesForm?.message}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.royaltiesForm} minH={"8.5rem"}>
                        <InputLabelWithPopover tkey="royalties">
                          <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
                            Royalties
                          </Text>
                        </InputLabelWithPopover>

                        <Controller
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <NumberInput
                              mt="3 !important"
                              size="md"
                              id="royaltiesForm"
                              maxW={24}
                              step={5}
                              defaultValue={minRoyalties}
                              min={minRoyalties > 0 ? minRoyalties : 0}
                              max={maxRoyalties > 0 ? maxRoyalties : 0}
                              isValidCharacter={isValidNumericCharacter}
                              onChange={(valueAsString: string) => {
                                onChange(valueAsString);
                                handleChangeDataNftRoyalties(Number(valueAsString));
                              }}>
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          )}
                          name="royaltiesForm"
                        />
                        <Text color="gray.400" fontSize="sm" mt={"1"}>
                          Min: {minRoyalties >= 0 ? minRoyalties : "-"}%, Max: {maxRoyalties >= 0 ? maxRoyalties : "-"}%
                        </Text>
                        <FormErrorMessage>{errors?.royaltiesForm?.message}</FormErrorMessage>
                      </FormControl>
                    </Box>
                  </Flex>
                  
                  <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="2 !important">
                    Terms and Fees
                  </Text>

                  <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="4 !important">
                    Minting a Data NFT and putting it for trade on the Data DEX means you have to agree to some strict “terms of use”, as an example, you agree
                    that the data is free of any illegal material and that it does not breach any copyright laws. You also agree to make sure the Data Stream URL
                    is always online. Given it&apos;s an NFT, you also have limitations like not being able to update the title, description, royalty, etc. But
                    there are other conditions too. Take some time to read these “terms of use” before you proceed and it&apos;s critical you understand the terms
                    of use before proceeding.
                  </Text>
                  <Flex mt="3 !important">
                    <Button
                      colorScheme="teal"
                      borderRadius="12px"
                      variant="outline"
                      size="md"
                      onClick={() => window.open("https://itheum.com/legal/datadex/termsofuse")}>
                      <Text color="white" px={2}>
                        Read Terms of Use
                      </Text>
                    </Button>
                  </Flex>
                  <Box minH={"3.5rem"}>
                    <Checkbox size="md" mt="2 !important" isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
                      I have read and I agree to the Terms of Use
                    </Checkbox>

                    {userFocusedForm && !readTermsChecked && (
                      <Text color="red.400" fontSize="sm" mt="1 !important" minH={"20px"}>
                        Please read and agree to terms of use.
                      </Text>
                    )}
                  </Box>

                  <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="8 !important">
                    An “anti-spam fee” is required to ensure that the Data DEX does not get impacted by spam datasets created by bad actors. This fee will be
                    dynamically adjusted by the protocol based on ongoing dataset curation discovery by the Itheum DAO.
                  </Text>

                  <Box mt="3 !important">
                    <Tag variant="solid" bgColor="#00C7971A" borderRadius="sm">
                      <Text px={2} py={2} color="teal.200" fontWeight="500">
                        Anti-Spam Fee is currently {antiSpamTax < 0 ? "?" : antiSpamTax} ITHEUM tokens{" "}
                      </Text>
                    </Tag>
                  </Box>

                  {itheumBalance < antiSpamTax && (
                    <Text color="red.400" fontSize="sm" mt="1 !important">
                      You don&apos;t have enough ITHEUM for Anti-Spam Tax
                    </Text>
                  )}
                  <Box minH={{ base: "5rem", md: "3.5rem" }}>
                    <Checkbox size="md" mt="3 !important" isChecked={readAntiSpamFeeChecked} onChange={(e) => setReadAntiSpamFeeChecked(e.target.checked)}>
                      I accept the deduction of the anti-spam minting fee from my wallet
                    </Checkbox>

                    {userFocusedForm && !readAntiSpamFeeChecked && (
                      <Text color="red.400" fontSize="sm" mt="1 !important">
                        You need to agree to anti-spam deduction to mint
                      </Text>
                    )}
                  </Box>

                  <Flex>
                    <ChainSupportedInput feature={MENU.SELL}>
                      <Button mt="5" colorScheme="teal" isLoading={isProgressModalOpen} onClick={dataNFTSellSubmit} isDisabled={mintDataNFTDisabled}>
                        Mint Your Data NFT
                      </Button>
                    </ChainSupportedInput>
                  </Flex>
                </form>
              </Stack>
              <Modal isOpen={isProgressModalOpen} onClose={closeProgressModal} closeOnEsc={false} closeOnOverlayClick={false}>
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
                            <Button colorScheme="teal" onClick={() => {
                                setMenuItem(MENU.NFTMINE);
                                navigate('/datanfts/wallet');
                              }}>Visit your Data NFT Wallet to see it!</Button>
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
            </DrawerBody>
            <Box
              position="absolute"
              top="0"
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
              visibility={userData?.contractWhitelistEnabled && !userData.userWhitelistedForMint ? "visible" : "hidden"}>
              <Text fontSize="24px" fontWeight="500" lineHeight="38px" textAlign="center" textColor="teal.200" px="2">
                - You are not whitelisted -
              </Text>
              <Button as={Link} variant="solid" colorScheme="teal" px={7} py={6} rounded="lg" mt={7} href="/getwhitelisted">
                Find out how you can get whitelisted
              </Button>
            </Box>
          </DrawerContent>
        </Drawer>
      </Stack>
    </>
  );
}
