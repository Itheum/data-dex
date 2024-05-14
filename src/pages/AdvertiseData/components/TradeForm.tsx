import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tag,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { BondContract, SftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address, ITransaction, Transaction } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import BigNumber from "bignumber.js";
import { File, NFTStorage } from "nft.storage";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { MintingModal } from "./MintingModal";
import ChainSupportedInput from "../../../components/UtilComps/ChainSupportedInput";
import { IS_DEVNET, MENU } from "../../../libs/config";
import { labels } from "../../../libs/language";
import { UserDataType } from "../../../libs/MultiversX/types";
import { getApiDataDex, getApiDataMarshal, isValidNumericCharacter, sleep, timeUntil } from "../../../libs/utils";
import { useAccountStore, useMintStore } from "../../../store";

// Declaring the form types
type TradeDataFormType = {
  dataStreamUrlForm: string;
  dataPreviewUrlForm: string;
  tokenNameForm: string;
  datasetTitleForm: string;
  datasetDescriptionForm: string;
  extraAssets?: string;
  donatePercentage?: number;
  numberOfCopiesForm: number;
  royaltiesForm: number;
  bondingAmount?: number;
  bondingPeriod?: number;
};

type TradeFormProps = {
  checkUrlReturns200: (url: string) => Promise<{ message: string; isSuccess: boolean }>;
  maxSupply: number;
  minRoyalties: number;
  maxRoyalties: number;
  antiSpamTax: number;
  dataNFTMarshalServiceStatus: boolean;
  userData: UserDataType | undefined;
  dataToPrefill: any;
  closeTradeFormModal: () => void;
};

export const TradeForm: React.FC<TradeFormProps> = (props) => {
  const { checkUrlReturns200, maxSupply, minRoyalties, maxRoyalties, antiSpamTax, dataNFTMarshalServiceStatus, userData, dataToPrefill, closeTradeFormModal } =
    props;

  const [currDataCATSellObj] = useState<any>(dataToPrefill ?? null);
  const [readTermsChecked, setReadTermsChecked] = useState<boolean>(false);
  const [readAntiSpamFeeChecked, setReadAntiSpamFeeChecked] = useState<boolean>(false);
  const [readLivelinessBonding, setReadLivelinessBonding] = useState<boolean>(false);
  const [isMintingModalOpen, setIsMintingModalOpen] = useState<boolean>(false);
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState<any>(null);
  const [mintingSuccessful, setMintingSuccessful] = useState<boolean>(false);
  const [dataNFTImg, setDataNFTImg] = useState<string>("");
  const [saveProgress, setSaveProgress] = useState({
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
    s5: 0,
  });

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [mintSessionId, setMintSessionId] = useState<any>(null);
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { address: mxAddress } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const lockPeriod = useMintStore((state) => state.lockPeriodForBond);
  const dataNFTMarshalService: string = getApiDataMarshal(chainID);
  const bond = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [periods, setPeriods] = useState<any>([
    { amount: "10000000000000000000", lockPeriod: 900 },
    { amount: "10000000000000000000", lockPeriod: 2 },
  ]);
  const [previousDataNFTStreamUrl, setPreviousDataNFTStreamUrl] = useState<string>("");
  const [wasPreviousCheck200StreamSuccess, setWasPreviousCheck200StreamSuccess] = useState<boolean>(false);

  const [imageUrl, setImageUrl] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [mintTx, setMintTx] = useState<any>(undefined);

  useEffect(() => {
    bond.viewLockPeriodsWithBonds().then((periodsT) => {
      setPeriods(periodsT);
    });
  }, [mxAddress]);

  // React hook form + yup integration
  // Declaring a validation schema for the form with the validation needed
  let preSchema = {
    dataStreamUrlForm: Yup.string()
      .required("Data Stream URL is required")
      .notOneOf(["https://drive.google.com"], `Data Stream URL doesn't accept Google Drive URLs`)
      .test("is-url-or-ipns", "Data Stream URL must be a valid HTTPS, IPFS or IPNS URL", function (value) {
        const websiteRegex = new RegExp(
          "^(http|https?:\\/\\/)?" + // validate protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
            "(\\#[-a-z\\d_]*)?$",
          "i"
        ); // validate fragment locator;
        const ipfsIpnsUrlRegex = /^(ipfs|ipns):\/\/[a-zA-Z0-9]+$/gm;
        return websiteRegex.test(value) || ipfsIpnsUrlRegex.test(value.split("?")[0]);
      })
      .test("is-distinct", "Data Stream URL cannot be the same as the Data Preview URL", function (value) {
        return value !== this.parent.dataPreviewUrlForm;
      })
      .test("is-200", "Data Stream URL must be public", async function (value: string) {
        if (previousDataNFTStreamUrl !== value) {
          const { isSuccess, message } = await checkUrlReturns200(value);
          setPreviousDataNFTStreamUrl(value);
          setWasPreviousCheck200StreamSuccess(isSuccess);
          if (!isSuccess) {
            return this.createError({ message });
          } else {
            return true;
          }
        } else {
          return wasPreviousCheck200StreamSuccess;
        }
      }),

    dataPreviewUrlForm: Yup.string()
      .required("Data Preview URL is required")
      .url("Data Preview must be valid URL")
      .notOneOf(["https://drive.google.com"], `Data Preview URL doesn't accept Google Drive URLs`)
      .test("is-distinct", "Data Preview URL cannot be the same as the Data Stream URL", function (value) {
        return value !== this.parent.dataStreamUrlForm;
      }),
    //// NOTE: We disabled this uptime check for Data Preview URLs on Apr 24, as a lot of data preview urls are public up don't allow for "CORs" (so it used to fail)
    // .test("is-200", "Data Stream URL must be public", async function (value: string) {
    //   const { isSuccess, message } = await checkUrlReturns200(value);
    //   if (!isSuccess) {
    //     return this.createError({ message });
    //   }
    //   return true;
    // }),

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

    extraAssets: Yup.string().optional().url("Extra asset URL must be a valid URL"),

    donatePercentage: Yup.number()
      .optional()
      .min(0, "Donate percentage must be a number between 0 and 100")
      .max(100, "Donate percentage must be a number between 0 and 100"),

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
  };
  const bondingPreSchema = {
    bondingAmount: Yup.number()
      .typeError("Bonding amount must be a number.")
      .min(1, "Minimum value of bonding amount is 10 ITHEUM.")
      .required("Bond Deposit is required"),
    bondingPeriod: Yup.number()
      .typeError("Bonding period must be a number.")
      .min(0, "Minimum value of bonding period is 3 months.")
      .required("Bonding Period is required"),
  };
  preSchema = { ...preSchema, ...bondingPreSchema };

  const validationSchema = Yup.object().shape(preSchema);
  const amountOfTime = timeUntil(lockPeriod[0].lockPeriod);
  // Destructure the methods needed from React Hook Form useForm component
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    getValues,
  } = useForm<TradeDataFormType>({
    defaultValues: {
      dataStreamUrlForm: dataToPrefill?.additionalInformation.dataStreamURL ?? "",
      dataPreviewUrlForm: dataToPrefill?.additionalInformation.dataPreviewURL ?? "",
      tokenNameForm: dataToPrefill?.additionalInformation.programName.replaceAll(" ", "").substring(0, 15) ?? "",
      datasetTitleForm: dataToPrefill?.additionalInformation.programName.replaceAll(" ", "") ?? "",
      datasetDescriptionForm: dataToPrefill?.additionalInformation.description ?? "",
      extraAssets: dataToPrefill?.additionalInformation.extraAssets ?? "",
      donatePercentage: 0,
      numberOfCopiesForm: 1,
      royaltiesForm: 0,
      bondingAmount:
        lockPeriod.length > 0
          ? BigNumber(lockPeriod[0]?.amount)
              .dividedBy(10 ** 18)
              .toNumber()
          : -1,
      bondingPeriod: lockPeriod.length > 0 ? amountOfTime.count : -1,
    }, // declaring default values for inputs not necessary to declare
    mode: "onChange", // mode stay for when the validation should be applied
    resolver: yupResolver(validationSchema), // telling to React Hook Form that we want to use yupResolver as the validation schema
  });
  const dataNFTStreamUrl: string = getValues("dataStreamUrlForm");
  const dataNFTPreviewUrl: string = getValues("dataPreviewUrlForm");
  const dataNFTTokenName: string = getValues("tokenNameForm");
  const datasetTitle: string = getValues("datasetTitleForm");
  const datasetDescription: string = getValues("datasetDescriptionForm");
  const extraAssets: string = getValues("extraAssets") ?? "";
  const donatePercentage: number = getValues("donatePercentage") ?? 0;
  const dataNFTCopies: number = getValues("numberOfCopiesForm");
  const dataNFTRoyalties: number = getValues("royaltiesForm");
  const bondingAmount: number = getValues("bondingAmount") ?? -1;
  const bondingPeriod: number = getValues("bondingPeriod") ?? -1;

  function shouldMintYourDataNftBeDisabled(
    isValid: boolean,
    readTermsChecked: boolean,
    readAntiSpamFeeChecked: boolean,
    readLivelinessBonding: boolean,
    itheumBalance: number,
    antiSpamTax: number,
    bondingAmount: number
  ): boolean | undefined {
    return !isValid || !readTermsChecked || !readAntiSpamFeeChecked || !readLivelinessBonding || itheumBalance < antiSpamTax + bondingAmount;
  }

  const closeProgressModal = () => {
    if (mintingSuccessful) {
      toast({
        title: 'Success! Data NFT Minted. Head over to your "Data NFT Wallet" to view your new NFT',
        status: "success",
        isClosable: true,
      });
    }
    setIsMintingModalOpen(false);

    setSaveProgress({ s1: 0, s2: 0, s3: 0, s4: 0, s5: 0 });
    setMintingSuccessful(false);
    setDataNFTImg("");
    closeTradeFormModal();
  };

  function validateBaseInput() {
    const isValidProtocol = (url: string) => {
      return url.startsWith("https://") || url.startsWith("ipfs://") || url.startsWith("ipns://");
    };

    if (!isValidProtocol(dataNFTStreamUrl) || !dataNFTPreviewUrl.startsWith("https://") || !dataNFTMarshalService.startsWith("https://")) {
      toast({
        title: labels.ERR_URL_MISSING_HTTPS_OR_IPNS,
        status: "error",
        isClosable: true,
        duration: 20000,
      });
      return true;
    } else {
      return true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mintTxFail = (_foo: any) => {
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT has failed"));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mintTxCancelled = (_foo: any) => {
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT was cancelled"));
  };

  const mintTxSuccess = async (_foo: any) => {
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s5: 1 }));
    await sleep(3);

    setMintingSuccessful(true);
  };

  const dataNFTDataStreamAdvertise = async () => {
    /*
      1) Call the data marshal and get a encrypted data stream url and hash of url (s1)
      2) Use the hash for to generate the gen img URL from the generative API (s2)
        2.1) Save the new generative image to IPFS and get it's IPFS url (s3)
      3) Mint the SFT via the Minter Contract (s4)
    */

    setMintingSuccessful(false);
    setIsMintingModalOpen(true);

    const myHeaders = new Headers();
    myHeaders.append("cache-control", "no-cache");
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        dataNFTStreamUrl,
        dataCreatorERDAddress: mxAddress,
        dataNFTMarshalServiceStatus,
      }),
    };

    try {
      // we actually don't need to encrypt here as the SDK mint method does it, but lets keep it for now (@TODO remove once we fully user the SDK in Data DEX)
      const res = await fetch(`${getApiDataMarshal(chainID)}/generate_V2`, requestOptions);
      const data = await res.json();

      if (data && data.encryptedMessage && data.messageHash) {
        setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s1: 1 }));

        prepareMint({
          dataNFTHash: data.messageHash,
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

  const handleOnChainMint = async () =>
    // { imageOnIpfsUrl, metadataOnIpfsUrl }
    // : { imageOnIpfsUrl: string; metadataOnIpfsUrl: string }
    {
      await sleep(1);
      await refreshAccount();

      const { sessionId, error } = await sendTransactions({
        transactions: mintTx,
        transactionsDisplayInfo: {
          processingMessage: "Minting Data NFT Collection",
          errorMessage: "Collection minting failed :(",
          successMessage: "Collection minted successfully!",
        },
        redirectAfterSign: false,
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

  function createIpfsMetadata(traits: string) {
    const metadata = {
      description: `${getValues("datasetTitleForm")} : ${getValues("datasetDescriptionForm")}`,
      attributes: [] as object[],
    };

    const attributes = traits.split(",").filter((element) => element.trim() !== "");
    const metadataAttributes = [];

    for (const attribute of attributes) {
      const [key, value] = attribute.split(":");
      const trait = { trait_type: key.trim(), value: value.trim() };
      metadataAttributes.push(trait);
    }

    metadataAttributes.push({ trait_type: "Data Preview URL", value: dataNFTPreviewUrl });
    metadataAttributes.push({ trait_type: "Creator", value: mxAddress });
    metadata.attributes = metadataAttributes;

    return metadata;
  }

  async function createFileFromUrl(url: string) {
    const res = await fetch(url);
    const data = await res.blob();
    const _imageFile = new File([data], "image.png", { type: "image/png" });
    const traits = createIpfsMetadata(res.headers.get("x-nft-traits") || "");
    const _traitsFile = new File([JSON.stringify(traits)], "metadata.json", { type: "application/json" });
    return { image: _imageFile, traits: _traitsFile };
  }

  const prepareMint = async ({ dataNFTHash }: { dataNFTHash: any }) => {
    await sleep(3);

    const newNFTImg = `${getApiDataDex(chainID)}/v1/generateNFTArt?hash=${dataNFTHash}`;

    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s2: 1 }));

    // let res;
    // try {
    //   // catch IPFS error
    //   const { image, traits } = await createFileFromUrl(newNFTImg);
    //   const nftstorage = new NFTStorage({
    //     token: import.meta.env.VITE_ENV_NFT_STORAGE_KEY || "",
    //   });

    //   res = await nftstorage.storeDirectory([image, traits]);
    // } catch (e) {
    //   setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_FORM_NFT_IMG_GEN_AND_STORAGE_CATCH_HIT));
    //   return;
    // }

    // if (!res) {
    //   setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_FORM_NFT_IMG_GEN_ISSUE));
    //   return;
    // }

    // const imageOnIpfsUrl = `https://ipfs.io/ipfs/${res}/image.png`;
    // const metadataOnIpfsUrl = `https://ipfs.io/ipfs/${res}/metadata.json`;

    const sftMinter = new SftMinter(IS_DEVNET ? "devnet" : "mainnet");

    const optionalSDKMintCallFields: Record<string, any> = {
      nftStorageToken: import.meta.env.VITE_ENV_NFT_STORAGE_KEY,
      extraAssets: [],
    };

    if (extraAssets && extraAssets.trim() !== "" && extraAssets.trim().toUpperCase() !== "NA") {
      optionalSDKMintCallFields["extraAssets"] = [extraAssets.trim()];
    }

    const { imageUrl, metadataUrl, tx } = await sftMinter.mint(
      new Address(mxAddress),
      dataNFTTokenName,
      dataNFTMarshalService,
      dataNFTStreamUrl,
      dataNFTPreviewUrl,
      Math.ceil(dataNFTRoyalties * 100),
      Number(dataNFTCopies),
      datasetTitle,
      datasetDescription,
      BigNumber(periods[0].amount).toNumber() + new BigNumber(antiSpamTax).multipliedBy(10 ** 18).toNumber(),
      Number(periods[0].lockPeriod),
      donatePercentage * 100,
      optionalSDKMintCallFields
    );
    setImageUrl(imageUrl);
    setMetadataUrl(metadataUrl);
    setMintTx(tx);

    setDataNFTImg(newNFTImg);

    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s3: 1 }));
    await sleep(1);

    // { imageOnIpfsUrl, metadataOnIpfsUrl }
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

  // here you can make logic that you want to happen on submit (used for debugging)
  const onSubmit = (data: TradeDataFormType) => {
    console.log(data);
    //TODO refactor this with react form hook
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex flexDirection="row">
        <Text fontSize="md" color="red.400">
          * &nbsp;Required fields
        </Text>
      </Flex>

      <>
        <Flex flexDirection={"column"}>
          <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="8 !important" mb={2}>
            Data Asset Detail
          </Text>
          <Link
            color="teal.500"
            fontSize="md"
            mb={7}
            href="https://docs.itheum.io/product-docs/integrators/data-streams-guides/data-asset-storage-options"
            isExternal>
            Where can I store or host my Data Assets? <ExternalLinkIcon mx="2px" />
          </Link>

          <Flex flexDirection="row" gap="7">
            <FormControl isInvalid={!!errors.dataStreamUrlForm} isRequired minH={"6.25rem"}>
              <FormLabel fontWeight="bold" fontSize="md">
                Data Stream URL
              </FormLabel>

              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <Input
                    mt="1 !important"
                    placeholder="e.g. https://mydomain.com/my_hosted_file.json"
                    id="dataStreamUrlForm"
                    isDisabled={!!currDataCATSellObj}
                    defaultValue={dataNFTStreamUrl}
                    onChange={(event) => onChange(event.target.value)}
                  />
                )}
                name={"dataStreamUrlForm"}
              />
              <FormErrorMessage>{errors?.dataStreamUrlForm?.message} </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.dataPreviewUrlForm} isRequired minH={{ base: "7rem", md: "6.25rem" }}>
              <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
                Data Preview URL
              </FormLabel>

              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <Input
                    mt="1 !important"
                    placeholder="e.g. https://mydomain.com/my_hosted_file_preview.json"
                    id="dataPreviewUrlForm"
                    isDisabled={!!currDataCATSellObj}
                    defaultValue={dataNFTPreviewUrl}
                    onChange={(event) => onChange(event.target.value)}
                  />
                )}
                name="dataPreviewUrlForm"
              />
              <FormErrorMessage>{errors?.dataPreviewUrlForm?.message}</FormErrorMessage>

              {currDataCATSellObj && (
                <Link color="teal.500" fontSize="sm" href={dataNFTPreviewUrl} isExternal>
                  View Preview Data <ExternalLinkIcon mx="2px" />
                </Link>
              )}
            </FormControl>
          </Flex>

          <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "5" }}>
            Data Marshal Url
          </Text>

          <Input mt="1 !important" value={dataNFTMarshalService} disabled />

          {!!dataNFTMarshalServiceStatus && (
            <Text color="red.400" fontSize="sm" mt="1 !important">
              {dataNFTMarshalServiceStatus}
            </Text>
          )}
        </Flex>
      </>

      <>
        <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="8 !important" mb={3}>
          NFT Token Metadata
        </Text>

        <Flex flexDirection="row" gap="7" mt={2}>
          <FormControl isInvalid={!!errors.tokenNameForm} isRequired minH={{ base: "7rem", md: "6.25rem" }}>
            <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
              Token Name (Short Title)
            </FormLabel>

            <Controller
              control={control}
              render={({ field: { onChange } }) => (
                <Input
                  mt="1 !important"
                  placeholder="Between 3 and 20 alphanumeric characters only"
                  id="tokenNameForm"
                  defaultValue={dataNFTTokenName}
                  onChange={(event) => onChange(event.target.value)}
                />
              )}
              name={"tokenNameForm"}
            />
            <FormErrorMessage>{errors?.tokenNameForm?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.datasetTitleForm} isRequired minH={"6.25rem"}>
            <FormLabel fontWeight="bold" fontSize="md">
              Dataset Title
            </FormLabel>

            <Controller
              control={control}
              render={({ field: { onChange } }) => (
                <Input
                  mt="1 !important"
                  placeholder="Between 10 and 60 alphanumeric characters only"
                  id="datasetTitleForm"
                  defaultValue={datasetTitle}
                  onChange={(event) => onChange(event.target.value)}
                />
              )}
              name="datasetTitleForm"
            />
            <FormErrorMessage>{errors?.datasetTitleForm?.message}</FormErrorMessage>
          </FormControl>
        </Flex>

        <Flex flexDirection="row" gap={7}>
          <FormControl isInvalid={!!errors.datasetDescriptionForm} isRequired maxW={"48%"}>
            <FormLabel fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }} noOfLines={1}>
              Dataset Description
            </FormLabel>

            <Controller
              control={control}
              render={({ field: { onChange } }) => (
                <Textarea
                  mt="1 !important"
                  h={"70%"}
                  placeholder="Between 10 and 400 characters only. URL allowed."
                  id={"datasetDescriptionForm"}
                  defaultValue={datasetDescription}
                  onChange={(event) => onChange(event.target.value)}
                />
              )}
              name="datasetDescriptionForm"
            />
            <FormErrorMessage>{errors?.datasetDescriptionForm?.message}</FormErrorMessage>
          </FormControl>
          <Box display="flex" flexDirection="column">
            <FormControl isInvalid={!!errors.numberOfCopiesForm} minH={{ base: "9.75rem", md: "8.25rem" }}>
              <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
                Number of copies
              </Text>

              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <NumberInput
                    mt="3 !important"
                    size="md"
                    id="numberOfCopiesForm"
                    maxW={24}
                    step={1}
                    defaultValue={dataNFTCopies}
                    min={1}
                    max={maxSupply > 0 ? maxSupply : 1}
                    isValidCharacter={isValidNumericCharacter}
                    onChange={(event) => onChange(event)}>
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
                Limit the quantity to increase value (rarity) - Suggested: less than {maxSupply}
              </Text>
              <FormErrorMessage>{errors?.numberOfCopiesForm?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.royaltiesForm} minH={"8.5rem"}>
              <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
                Royalties
              </Text>

              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <NumberInput
                    mt="3 !important"
                    size="md"
                    id="royaltiesForm"
                    maxW={24}
                    step={1}
                    defaultValue={dataNFTRoyalties}
                    min={minRoyalties > 0 ? minRoyalties : 0}
                    max={maxRoyalties > 0 ? maxRoyalties : 0}
                    isValidCharacter={isValidNumericCharacter}
                    onChange={(event) => onChange(event)}>
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

        <FormControl isInvalid={!!errors.extraAssets} minH={{ base: "7rem", md: "6.25rem" }}>
          <FormLabel fontWeight="bold" fontSize="md" noOfLines={1}>
            Extra asset URL
          </FormLabel>

          <Controller
            control={control}
            render={({ field: { onChange } }) => (
              <Input
                mt="1 !important"
                placeholder="e.g. https://ipfs.io/ipfs/CID"
                id="bonusNFTMediaImgUrlForm"
                isDisabled={!!currDataCATSellObj}
                defaultValue={extraAssets}
                onChange={(event) => onChange(event.target.value)}
              />
            )}
            name="extraAssets"
          />
          <FormErrorMessage>{errors?.extraAssets?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.donatePercentage} minH={"8.5rem"}>
          <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
            Donate Percentage
          </Text>

          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <Slider
                id="slider"
                defaultValue={donatePercentage}
                min={0}
                max={userData && userData?.maxDonationPecentage / 100}
                colorScheme="teal"
                onChange={(v) => onChange(v)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}>
                <SliderMark value={25} mt="1" ml="-2.5" fontSize="sm">
                  25%
                </SliderMark>
                <SliderMark value={50} mt="1" ml="-2.5" fontSize="sm">
                  50%
                </SliderMark>
                <SliderMark value={(userData && userData?.maxDonationPecentage / 100) ?? 0} mt="1" ml="-2.5" fontSize="sm">
                  {(userData && userData?.maxDonationPecentage / 100) ?? 0}%
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <Tooltip hasArrow bg="teal.500" color="white" placement="top" isOpen={showTooltip} label={`${value}%`}>
                  <SliderThumb />
                </Tooltip>
              </Slider>
            )}
            name="donatePercentage"
          />
          <Text color="gray.400" fontSize="sm" mt={"1"}>
            Min: 0%, Max: {userData && userData?.maxDonationPecentage / 100}%
          </Text>
          <FormErrorMessage>{errors?.donatePercentage?.message}</FormErrorMessage>
        </FormControl>
      </>

      <>
        <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="8 !important">
          Liveliness Bonding
        </Text>

        <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="3 !important">
          Bonding ITHEUM tokens proves your {"Liveliness"} and gives Data Consumers confidence that you will maintain the Data {`NFT's`} Data Stream. You will
          need to lock the below{" "}
          <Text fontWeight="bold" as="span">
            Bonding Amount{" "}
          </Text>
          for the required{" "}
          <Text fontWeight="bold" as="span">
            Bonding Period.{" "}
          </Text>
          Your Liveliness Bond is bound by some{" "}
          <Text fontWeight="bold" as="span">
            Penalties and Slashing Terms
          </Text>{" "}
          as detailed below. At the end of the{" "}
          <Text fontWeight="bold" as="span">
            Bonding Period
          </Text>
          , you can withdraw your full&nbsp;
          <Text fontWeight="bold" as="span">
            Bonding Amount
          </Text>{" "}
          OR if you want to continue to signal to Data Consumers that you will maintain the Data {`NFT’s`} Data Stream, you can {`"renew"`} the Liveliness Bond.
        </Text>

        <Flex flexDirection="row" gap="7" mt={2}>
          <FormControl isInvalid={!!errors.bondingAmount} minH={"8.5rem"}>
            <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
              Bonding Amount (in ITHEUM)
            </Text>

            <Controller
              control={control}
              render={({ field: { onChange } }) => (
                <NumberInput
                  mt="3 !important"
                  size="md"
                  id="bondingAmount"
                  maxW={24}
                  step={1}
                  defaultValue={bondingAmount}
                  isDisabled
                  min={10}
                  max={maxRoyalties > 0 ? maxRoyalties : 0}
                  isValidCharacter={isValidNumericCharacter}
                  onChange={(event) => onChange(event)}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              )}
              name="bondingAmount"
            />
            <FormErrorMessage>{errors?.bondingAmount?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.bondingPeriod} minH={"8.5rem"}>
            <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
              Bonding Period ({amountOfTime.unit})
            </Text>
            <Controller
              control={control}
              render={({ field: { onChange } }) => (
                <NumberInput
                  mt="3 !important"
                  size="md"
                  id="bondingPeriod"
                  maxW={24}
                  step={1}
                  defaultValue={bondingPeriod}
                  isDisabled
                  min={3}
                  isValidCharacter={isValidNumericCharacter}
                  onChange={(event) => onChange(event)}>
                  <NumberInputField />
                </NumberInput>
              )}
              name="bondingPeriod"
            />
            <FormErrorMessage>{errors?.bondingPeriod?.message}</FormErrorMessage>
          </FormControl>
        </Flex>

        <Box mb={7}>
          <Link color="teal.500" fontSize="md" href="https://datadex.itheum.io/getverified" isExternal>
            Need help, support or sponsorship for the Liveliness{" "}
            <Text fontWeight="bold" as="span">
              Bonding Amount
            </Text>
            ? Become a Verified Creator <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>

        <Box minH={{ base: "5rem", md: "3.5rem" }}>
          <Text fontSize="xl" fontWeight="500" lineHeight="22.4px" textColor="teal.200">
            Penalties and Slashing
          </Text>
          <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="2 !important">
            If you break your Liveliness Bond before the{" "}
            <Text fontWeight="bold" as="span">
              Bonding Period
            </Text>
            , you will be penalized by losing a portion (or all) of your{" "}
            <Text fontWeight="bold" as="span">
              Bonding Amount
            </Text>
            . The community will also be able to curate and raise concerns about Data NFTs to Itheum’s curation DAO; Itheum Trailblazer DAO. If these concerns
            are validated by the DAO, the DAO may enforce penalties or slash against your Data NFT bonds. This DAO-based curation enforces positive behavior
            penalizes bad actors and protects Data Consumers.
          </Text>

          {itheumBalance < antiSpamTax + bondingAmount && (
            <Text color="red.400" fontSize="sm" mt="1 !important">
              {labels.ERR_MINT_FORM_NOT_ENOUGH_BOND}
            </Text>
          )}

          <Flex mt="3 !important">
            <Button
              colorScheme="teal"
              borderRadius="12px"
              variant="outline"
              size="sm"
              onClick={() => window.open("https://docs.itheum.io/product-docs/legal/ecosystem-tools-terms/liveliness-bonding-penalties-and-slashing-terms")}>
              <Text color={colorMode === "dark" ? "bgWhite" : "black"} px={2}>
                Read Liveliness Bonding: Penalties and Slashing Terms
              </Text>
            </Button>
          </Flex>

          <Checkbox size="md" mt="3 !important" isChecked={readLivelinessBonding} onChange={(e) => setReadLivelinessBonding(e.target.checked)}>
            I have read and I agree to Liveliness Bonding: Penalties and Slashing Terms
          </Checkbox>

          {!readLivelinessBonding && (
            <Text color="red.400" fontSize="sm" mt="1 !important">
              You need to agree to Liveliness Bonding: Penalties and Slashing Terms to proceed with your mint.
            </Text>
          )}
        </Box>
      </>

      <>
        <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="50px !important">
          Minting Terms of Use
        </Text>

        <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="3 !important">
          Minting a Data NFT and putting it for trade on the Data DEX means you have to agree to some strict “terms of use”, as an example, you agree that the
          data is free of any illegal material and that it does not breach any copyright laws. You also agree to make sure the Data Stream URL is always online.
          Given it&apos;s an NFT, you also have limitations like not being able to update the title, description, royalty, etc. But there are other conditions
          too. Take some time to read these “terms of use” before you proceed and it&apos;s critical you understand the terms of use before proceeding.
        </Text>
        <Flex mt="3 !important">
          <Button colorScheme="teal" borderRadius="12px" variant="outline" size="sm" onClick={() => window.open("https://itheum.com/legal/datadex/termsofuse")}>
            <Text color={colorMode === "dark" ? "bgWhite" : "black"} px={2}>
              Read Minting Terms of Use
            </Text>
          </Button>
        </Flex>
        <Box minH={"3.5rem"}>
          <Checkbox size="md" mt="2 !important" isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
            I have read and I agree to the Terms of Use
          </Checkbox>

          {!readTermsChecked && (
            <Text color="red.400" fontSize="sm" mt="1 !important" minH={"20px"}>
              Please read and agree to Terms of Use to proceed with your mint.
            </Text>
          )}
        </Box>
      </>

      <>
        <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="50px !important">
          Anti-Spam Fee
        </Text>

        <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="3 !important">
          An “anti-spam fee” is required to ensure that the Data DEX does not get impacted by spam datasets created by bad actors. This fee will be dynamically
          adjusted by the protocol based on ongoing dataset curation discovery by the Itheum DAO.
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
            {labels.ERR_MINT_FORM_NOT_ENOUGH_TAX}
          </Text>
        )}

        <Box minH={{ base: "5rem", md: "3.5rem" }}>
          <Checkbox size="md" mt="3 !important" isChecked={readAntiSpamFeeChecked} onChange={(e) => setReadAntiSpamFeeChecked(e.target.checked)}>
            I accept the deduction of the Anti-Spam Minting Fee from my wallet.
          </Checkbox>

          {!readAntiSpamFeeChecked && (
            <Text color="red.400" fontSize="sm" mt="1 !important">
              You need to agree to Anti-Spam Minting deduction to proceed with your mint.
            </Text>
          )}
        </Box>
      </>

      <Flex>
        <ChainSupportedInput feature={MENU.SELL}>
          <Button
            mt="10"
            colorScheme="teal"
            isLoading={isMintingModalOpen}
            onClick={dataNFTSellSubmit}
            isDisabled={shouldMintYourDataNftBeDisabled(
              isValid,
              readTermsChecked,
              readAntiSpamFeeChecked,
              readLivelinessBonding,
              itheumBalance,
              antiSpamTax,
              bondingAmount
            )}>
            Mint Your Data NFT
          </Button>
        </ChainSupportedInput>
      </Flex>

      <MintingModal
        isOpen={isMintingModalOpen}
        setIsOpen={setIsMintingModalOpen}
        errDataNFTStreamGeneric={errDataNFTStreamGeneric}
        saveProgress={saveProgress}
        imageUrl={imageUrl}
        metadataUrl={metadataUrl}
        setSaveProgress={setSaveProgress}
        dataNFTImg={dataNFTImg}
        closeProgressModal={closeProgressModal}
        mintingSuccessful={mintingSuccessful}
        onChainMint={handleOnChainMint}
      />
    </form>
  );
};
