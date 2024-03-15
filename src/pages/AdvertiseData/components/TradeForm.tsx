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
  Tag,
  Text,
  Textarea,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { BondContract, SftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import BigNumber from "bignumber.js";
import { File, NFTStorage } from "nft.storage";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { MintingModal } from "./MintingModal";
import ChainSupportedInput from "../../../components/UtilComps/ChainSupportedInput";
import { MENU } from "../../../libs/config";
import { labels } from "../../../libs/language";
import { DataNftMintContract } from "../../../libs/MultiversX/dataNftMint";
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
  });
  const [mintSessionId, setMintSessionId] = useState<any>(null);

  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { address: mxAddress } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const lockPeriod = useMintStore((state) => state.lockPeriodForBond);

  const dataNFTMarshalService: string = getApiDataMarshal(chainID);
  const mxDataNftMintContract = new DataNftMintContract(chainID);

  const bond = new BondContract("devnet");
  const [periods, setPeriods] = useState<any>([
    { amount: "10000000000000000000", lockPeriod: 900 },
    { amount: "10000000000000000000", lockPeriod: 2 },
  ]);
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
      .test("is-url-or-ipns", "Data Stream URL must be a valid URL or IPNS", function (value) {
        const websiteRegex = new RegExp(
          "^(http|https?:\\/\\/)?" + // validate protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
            "(\\#[-a-z\\d_]*)?$",
          "i"
        ); // validate fragment locator;
        // console.log(value, websiteRegex, websiteRegex.test(value));
        const ipnsRegex = /^ipns:\/\/[a-zA-Z0-9]+$/gm;
        return websiteRegex.test(value) || ipnsRegex.test(value.split("?")[0]);
      })
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
  if (import.meta.env.VITE_ENV_NETWORK === "devnet") {
    preSchema = { ...preSchema, ...bondingPreSchema };
  }
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
      numberOfCopiesForm: 1,
      royaltiesForm: 0,
      bondingAmount: lockPeriod.length > 0 ? BigNumber(lockPeriod[0].amount).shiftedBy(-18).toNumber() : -1,
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
  const dataNFTCopies: number = getValues("numberOfCopiesForm");
  const dataNFTRoyalties: number = getValues("royaltiesForm");
  const bondingAmount: number = getValues("bondingAmount") ?? -1;
  const bondingPeriod: number = getValues("bondingPeriod") ?? -1;

  const closeProgressModal = () => {
    if (mintingSuccessful) {
      toast({
        title: 'Success! Data NFT Minted. Head over to your "Data NFT Wallet" to view your new NFT',
        status: "success",
        isClosable: true,
      });
    }
    setIsMintingModalOpen(false);

    setSaveProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
    setMintingSuccessful(false);
    setDataNFTImg("");
    closeTradeFormModal();
  };

  function validateBaseInput() {
    if (
      !(dataNFTStreamUrl.startsWith("https://") || dataNFTStreamUrl.startsWith("ipns://")) ||
      !dataNFTPreviewUrl.startsWith("https://") ||
      !dataNFTMarshalService.startsWith("https://")
    ) {
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
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s4: 1 }));
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
      const res = await fetch(`${getApiDataMarshal(chainID)}/generate_V2`, requestOptions);
      const data = await res.json();

      if (data && data.encryptedMessage && data.messageHash) {
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

  const handleOnChainMint = async ({
    imageOnIpfsUrl,
    metadataOnIpfsUrl,
    dataNFTStreamUrlEncrypted,
  }: {
    imageOnIpfsUrl: string;
    metadataOnIpfsUrl: string;
    dataNFTStreamUrlEncrypted: string;
  }) => {
    if (import.meta.env.VITE_ENV_NETWORK === "devnet") {
      const sftMinter = new SftMinter("devnet");

      const mintObject = await sftMinter.mint(
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
        {
          nftStorageToken: import.meta.env.VITE_ENV_NFT_STORAGE_KEY,
        }
      );

      await sleep(3);
      await refreshAccount();

      const { sessionId, error } = await sendTransactions({
        transactions: mintObject,
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
    } else {
      await sleep(3);
      const { sessionId, error } = await mxDataNftMintContract.sendMintTransaction({
        name: getValues("tokenNameForm"),
        data_marshal: dataNFTMarshalService,
        data_stream: dataNFTStreamUrlEncrypted,
        data_preview: dataNFTPreviewUrl,
        royalties: Math.ceil(getValues("royaltiesForm") * 100),
        amount: getValues("numberOfCopiesForm"),
        title: getValues("datasetTitleForm"),
        description: getValues("datasetDescriptionForm"),
        sender: new Address(mxAddress),
        amountToSend: antiSpamTax,
      });
      if (error) {
        setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_NO_TX));
      }

      setMintSessionId(sessionId);
    }
  };

  useTrackTransactionStatus({
    transactionId: mintSessionId,
    onSuccess: mintTxSuccess,
    onFail: mintTxFail,
    onCancelled: mintTxCancelled,
  });

  const buildUniqueImage = async ({ dataNFTHash, dataNFTStreamUrlEncrypted }: { dataNFTHash: any; dataNFTStreamUrlEncrypted: any }) => {
    await sleep(3);
    const newNFTImg = `${getApiDataDex(chainID)}/v1/generateNFTArt?hash=${dataNFTHash}`;

    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s2: 1 }));

    let res;

    try {
      // catch IPFS error
      const { image, traits } = await createFileFromUrl(newNFTImg);
      const nftstorage = new NFTStorage({
        token: import.meta.env.VITE_ENV_NFT_STORAGE_KEY || "",
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

  const onSubmit = (data: TradeDataFormType) => {
    console.log(data);
  }; // here you can make logic that you want to happen on submit (used for debugging)
  return (
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
            <FormErrorMessage>{errors?.dataStreamUrlForm?.message}</FormErrorMessage>
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
              <Link fontSize="sm" href={dataNFTPreviewUrl} isExternal>
                View Preview Data <ExternalLinkIcon mx="2px" />
              </Link>
            )}
          </FormControl>
        </Flex>

        <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
          Data Marshal Url
        </Text>

        <Input mt="1 !important" value={dataNFTMarshalService} disabled />

        {!!dataNFTMarshalServiceStatus && (
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

      {import.meta.env.VITE_ENV_NETWORK === "devnet" && (
        <>
          <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="8 !important">
            Liveliness Bonding
          </Text>

          <Flex flexDirection="row" gap="7" mt={2}>
            <FormControl isInvalid={!!errors.bondingAmount} minH={"8.5rem"}>
              <Text fontWeight="bold" fontSize="md" mt={{ base: "1", md: "4" }}>
                Bonding Amount (in $ITHEUM)
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
        </>
      )}

      <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="2 !important">
        Terms and Fees
      </Text>

      <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="4 !important">
        Minting a Data NFT and putting it for trade on the Data DEX means you have to agree to some strict “terms of use”, as an example, you agree that the
        data is free of any illegal material and that it does not breach any copyright laws. You also agree to make sure the Data Stream URL is always online.
        Given it&apos;s an NFT, you also have limitations like not being able to update the title, description, royalty, etc. But there are other conditions
        too. Take some time to read these “terms of use” before you proceed and it&apos;s critical you understand the terms of use before proceeding.
      </Text>
      <Flex mt="3 !important">
        <Button colorScheme="teal" borderRadius="12px" variant="outline" size="md" onClick={() => window.open("https://itheum.com/legal/datadex/termsofuse")}>
          <Text color={colorMode === "dark" ? "bgWhite" : "black"} px={2}>
            Read Terms of Use
          </Text>
        </Button>
      </Flex>
      <Box minH={"3.5rem"}>
        <Checkbox size="md" mt="2 !important" isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
          I have read and I agree to the Terms of Use
        </Checkbox>

        {!readTermsChecked && (
          <Text color="red.400" fontSize="sm" mt="1 !important" minH={"20px"}>
            Please read and agree to terms of use.
          </Text>
        )}
      </Box>

      <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="8 !important">
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
          I accept the deduction of the anti-spam minting fee from my wallet
        </Checkbox>

        {!readAntiSpamFeeChecked && (
          <Text color="red.400" fontSize="sm" mt="1 !important">
            You need to agree to anti-spam deduction to mint
          </Text>
        )}
      </Box>
      {import.meta.env.VITE_ENV_NETWORK === "devnet" && (
        <Box minH={{ base: "5rem", md: "3.5rem" }}>
          <Text fontSize="xl" fontWeight="500" lineHeight="22.4px" mt="5 !important" textColor="teal.200">
            Penalties and Slashing
          </Text>
          <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="2 !important">
            The community will be able to curate and raise concerns about Data NFTs to the Itheum’s curation DAO; Itheum Trailblazer DAO. If these concerns are
            validated by the DAO, the DAO may enforce penalties or slash against your Data NFT bonds. This DAO based curation enforces positive behaviour and
            penalises bad actors.
          </Text>

          {itheumBalance < antiSpamTax + bondingAmount && (
            <Text color="red.400" fontSize="sm" mt="1 !important">
              {labels.ERR_MINT_FORM_NOT_ENOUGH_BOND}
            </Text>
          )}
          <Checkbox size="md" mt="3 !important" isChecked={readLivelinessBonding} onChange={(e) => setReadLivelinessBonding(e.target.checked)}>
            I have read and I agree to Liveliness Bonding & Penalties and Slashing Terms
          </Checkbox>

          {!readLivelinessBonding && (
            <Text color="red.400" fontSize="sm" mt="1 !important">
              You need to agree to Penalties and Slashing terms to mint
            </Text>
          )}
        </Box>
      )}

      <Flex>
        <ChainSupportedInput feature={MENU.SELL}>
          <Button
            mt="5"
            colorScheme="teal"
            isLoading={isMintingModalOpen}
            onClick={dataNFTSellSubmit}
            isDisabled={!isValid || !readTermsChecked || !readAntiSpamFeeChecked || !readLivelinessBonding || itheumBalance < antiSpamTax + bondingAmount}>
            Mint Your Data NFT
          </Button>
        </ChainSupportedInput>
      </Flex>
      <MintingModal
        isOpen={isMintingModalOpen}
        setIsOpen={setIsMintingModalOpen}
        errDataNFTStreamGeneric={errDataNFTStreamGeneric}
        saveProgress={saveProgress}
        dataNFTImg={dataNFTImg}
        closeProgressModal={closeProgressModal}
        mintingSuccessful={mintingSuccessful}
      />
    </form>
  );
};
