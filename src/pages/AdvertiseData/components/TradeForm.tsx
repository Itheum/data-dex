import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  CloseButton,
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
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Tag,
  Text,
  Textarea,
  Tooltip,
  Image,
  Heading,
  Highlight,
  useColorMode,
  useDisclosure,
  useSteps,
  useToast,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { BondContract, dataNftTokenIdentifier, SftMinter, LivelinessStake } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useTrackTransactionStatus } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import axios from "axios";
import BigNumber from "bignumber.js";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import extraAssetDemo from "assets/img/extra-asset-demo.gif";
import darkNFMeIDHero from "assets/img/nfme/dark-nfmeid-vault-mint-page-hero.png";
import liteNFMeIDHero from "assets/img/nfme/lite-nfmeid-vault-mint-page-hero.png";
import ChainSupportedInput from "components/UtilComps/ChainSupportedInput";
import { PopoverTooltip } from "components/UtilComps/PopoverTooltip";
import { IS_DEVNET, MENU, PRINT_UI_DEBUG_PANELS } from "libs/config";
import { labels } from "libs/language";
import { getApi } from "libs/MultiversX/api";
import { UserDataType } from "libs/MultiversX/types";
import { getApiDataMarshal, isValidNumericCharacter, sleep, timeUntil } from "libs/utils";
import { useAccountStore, useMintStore } from "store";
import { MintingModal } from "./MintingModal";

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
  checkUrlReturns200: (url: string, sendBackResponse?: boolean) => Promise<{ message: string; isSuccess: boolean; callResponse?: string }>;
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

  const showInlineErrorsBeforeAction = false;
  const enableBondingInputForm = false;
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { address: mxAddress } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const lockPeriod = useMintStore((state) => state.lockPeriodForBond);
  const dataNFTMarshalService: string = getApiDataMarshal(chainID);
  const bond = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [isNFMeIDMint, setIsNFMeIDMint] = useState<boolean>(false);
  const [currDataCATSellObj] = useState<any>(dataToPrefill ?? null);
  const [readTermsChecked, setReadTermsChecked] = useState<boolean>(false);
  const [readAntiSpamFeeChecked, setReadAntiSpamFeeChecked] = useState<boolean>(false);
  const [readLivelinessBonding, setReadLivelinessBonding] = useState<boolean>(false);
  const [isMintingModalOpen, setIsMintingModalOpen] = useState<boolean>(false);
  const [errDataNFTStreamGeneric, setErrDataNFTStreamGeneric] = useState<any>(null);
  const [mintingSuccessful, setMintingSuccessful] = useState<boolean>(false);
  const [makePrimaryNFMeIdSuccessful, setMakePrimaryNFMeIdSuccessful] = useState<boolean>(false);
  const [dataNFTImg, setDataNFTImg] = useState<string>("");
  const [dataNFTTraits, setDataNFTTraits] = useState<any>(undefined);
  const [saveProgress, setSaveProgress] = useState({ s1: 0, s2: 0, s3: 0, s4: 0 });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [mintSessionId, setMintSessionId] = useState<any>(null);
  const [makePrimaryNFMeIdSessionId, setMakePrimaryNFMeIdSessionId] = useState<any>(null);
  const [periods, setPeriods] = useState<any>([
    { amount: "10000000000000000000", lockPeriod: 900 },
    { amount: "10000000000000000000", lockPeriod: 2 },
  ]);
  const [previousDataNFTStreamUrl, setPreviousDataNFTStreamUrl] = useState<string>("");
  const [wasPreviousCheck200StreamSuccess, setWasPreviousCheck200StreamSuccess] = useState<boolean>(false);
  const { isOpen: isMintFeeInfoVisible, onClose, onOpen } = useDisclosure({ defaultIsOpen: false });
  const steps = [
    { title: "Step 1", description: "Asset Detail" },
    { title: "Step 2", description: "Token Metadata" },
    { title: "Step 3", description: "Bonding & Terms" },
  ];
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [nftImgAndMetadataLoadedOnIPFS, setNftImgAndMetadataLoadedOnIPFS] = useState<boolean>(false);
  const [mintTx, setMintTx] = useState<any>(undefined);
  const [bondVaultNonce, setBondVaultNonce] = useState<number | undefined>(0);
  const [maxApy, setMaxApy] = useState<number>(0);
  const [needsMoreITHEUMToProceed, setNeedsMoreITHEUMToProceed] = useState<boolean>(false);

  // S: React hook form + yup integration ---->
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

    extraAssets: Yup.string()
      .optional()
      .url("Extra Asset URL must be a valid URL")
      .test("is-200", "Extra Asset URL must be public", async function (value: string | undefined) {
        if (value) {
          const { isSuccess, message } = await checkUrlReturns200(value);
          if (!isSuccess) {
            return this.createError({ message });
          }
          return true;
        } else {
          return true;
        }
      }),

    donatePercentage: Yup.number()
      .optional()
      .min(0, "Donate percentage must be a number between 0 and 100")
      .max(userData?.maxDonationPecentage ?? 100, "Donate percentage must be a number between 0 and 100"),

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
    trigger,
  } = useForm<TradeDataFormType>({
    defaultValues: {
      dataStreamUrlForm: dataToPrefill?.additionalInformation.dataStreamURL ?? "",
      dataPreviewUrlForm: dataToPrefill?.additionalInformation.dataPreviewURL ?? "",
      tokenNameForm: dataToPrefill?.additionalInformation?.tokenName.replaceAll(" ", "").substring(0, 16) ?? "",
      datasetTitleForm: dataToPrefill?.additionalInformation?.programName ?? "",
      datasetDescriptionForm: dataToPrefill?.additionalInformation.description ?? "",
      extraAssets: dataToPrefill?.additionalInformation.extraAssets ?? "",
      donatePercentage: userData && userData?.maxDonationPecentage / 100 / 2,
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

  const dataNFTStreamUrl: string = isNFMeIDMint ? generatePrefilledNFMeIDDataStreamURL() : getValues("dataStreamUrlForm");
  const dataNFTPreviewUrl: string = getValues("dataPreviewUrlForm");
  const dataNFTTokenName: string = getValues("tokenNameForm");
  const datasetTitle: string = getValues("datasetTitleForm");
  const datasetDescription: string = getValues("datasetDescriptionForm");
  const extraAssets: string = getValues("extraAssets") ?? "";
  const donatePercentage: number = isNFMeIDMint ? 0 : getValues("donatePercentage") ?? 0;
  const dataNFTCopies: number = isNFMeIDMint ? 5 : getValues("numberOfCopiesForm");
  const dataNFTRoyalties: number = isNFMeIDMint ? 2 : getValues("royaltiesForm");
  const bondingAmount: number = getValues("bondingAmount") ?? -1;
  const bondingPeriod: number = getValues("bondingPeriod") ?? -1;

  function generatePrefilledNFMeIDDataStreamURL() {
    // create the dynamic NFMeID URL for this user
    let nfmeIdVaultDataStreamURL = dataToPrefill?.additionalInformation.dataStreamURL;

    if (!IS_DEVNET) {
      nfmeIdVaultDataStreamURL = dataToPrefill?.additionalInformation.dataStreamURL_PRD;
    }

    // append the imgswapsalt to make the image unique to the user
    const imgSwapSalt = `&imgswapsalt=${mxAddress.substring(0, 6)}-${mxAddress.slice(-6)}_timestamp_${Date.now()}`;
    nfmeIdVaultDataStreamURL = nfmeIdVaultDataStreamURL + imgSwapSalt;

    return nfmeIdVaultDataStreamURL;
  }
  // E: React hook form + yup integration ---->

  useEffect(() => {
    // does the user have a primary vault set? (if not and then mint a NFMe, we can auto set it)
    async function fetchVaultNonce() {
      if (mxAddress) {
        const nonce = await bond.viewAddressVaultNonce(new Address(mxAddress), IS_DEVNET ? dataNftTokenIdentifier.devnet : dataNftTokenIdentifier.mainnet);
        setBondVaultNonce(nonce);
      }
    }

    fetchVaultNonce();
  }, []);

  useEffect(() => {
    if (currDataCATSellObj && currDataCATSellObj?.isNFMeID === true) {
      setIsNFMeIDMint(true);
      // everything is prefilled, so we can go to the last step of thr stepper, but we can also hide the stepper header in the UI
      setActiveStep(2);
    }
  }, [currDataCATSellObj]);

  useEffect(() => {
    async function fetchBondingRelatedData() {
      if (mxAddress) {
        bond.viewLockPeriodsWithBonds().then((periodsT) => {
          setPeriods(periodsT);
        });

        const envNetwork = import.meta.env.VITE_ENV_NETWORK;
        const liveContract = new LivelinessStake(envNetwork);
        const data = await liveContract.getUserDataOut(new Address(mxAddress));
        setMaxApy(Math.floor(data.contractDetails.maxApr * 100) / 100);
      }
    }

    fetchBondingRelatedData();
  }, [mxAddress]);

  useEffect(() => {
    if (itheumBalance && antiSpamTax && bondingAmount) {
      // check if "defaults" are passed (i.e. we have the final values to calculate)
      if (itheumBalance >= 0 && antiSpamTax >= 0 && antiSpamTax >= 0) {
        if (itheumBalance < antiSpamTax + bondingAmount) {
          // we can use this to send a CTA to get them to buy ITHEUM tokens on the market
          setNeedsMoreITHEUMToProceed(true);
        }
      }
    }
  }, [itheumBalance, antiSpamTax, bondingAmount]);

  function shouldMintYourDataNftBeDisabled(): boolean | undefined {
    return !isValid || !readTermsChecked || !readAntiSpamFeeChecked || !readLivelinessBonding || itheumBalance < antiSpamTax + bondingAmount;
  }

  const closeProgressModal = () => {
    if ((dataToPrefill?.shouldAutoVault ?? false) && !bondVaultNonce) {
      // mint and auto vault is a success
      if (mintingSuccessful && makePrimaryNFMeIdSuccessful) {
        toast({
          title: 'Success! Data NFT Minted and set as your NFMe ID Vault. Head over to your "Wallet" to view your new NFT',
          status: "success",
          isClosable: true,
        });
      }
    } else {
      // only minting was needed, and that was a success
      if (mintingSuccessful) {
        toast({
          title: 'Success! Data NFT Minted. Head over to your "Wallet" to view your new NFT',
          status: "success",
          isClosable: true,
        });
      }
    }

    // reset all the key state
    setIsMintingModalOpen(false);
    setSaveProgress({ s1: 0, s2: 0, s3: 0, s4: 0 });
    setMintingSuccessful(false);
    setMakePrimaryNFMeIdSuccessful(false);
    setMintTx(undefined);
    setMintSessionId(null);
    setMakePrimaryNFMeIdSessionId(null);
    setDataNFTImg("");
    closeTradeFormModal();
    setImageUrl("");
    setMetadataUrl("");
    setNftImgAndMetadataLoadedOnIPFS(false);
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

  // once we save the img and json to IPFS, we have to ping to make sure it's there in order to verify the ipfs service worked
  // ... or else we mint a NFT that may have broken img and json. We can try upto 3 times to confirm, and if not - show an error to user
  async function confirmIfNftImgAndMetadataIsAvailableOnIPFS(imageUrlOnIPFS: string, metadataUrlOnIPFS: string) {
    console.log("confirmIfNftImgAndMetadataIsAvailableOnIPFS");
    console.log("imageUrlOnIPFS : ", imageUrlOnIPFS);
    console.log("metadataUrlOnIPFS : ", metadataUrlOnIPFS);

    const imgCIDOnIPFS = imageUrlOnIPFS.split("ipfs/")[1];
    const metadataCIDOnIPFS = metadataUrlOnIPFS.split("ipfs/")[1];

    console.log("imgCIDOnIPFS : ", imgCIDOnIPFS);
    console.log("metadataCIDOnIPFS : ", metadataCIDOnIPFS);

    const imgOnIPFSCheckResult = await checkUrlReturns200(`https://gateway.pinata.cloud/ipfs/${imgCIDOnIPFS}`);
    const metadataOnIPFSCheckResult = await checkUrlReturns200(`https://gateway.pinata.cloud/ipfs/${metadataCIDOnIPFS}`, true);

    if (imgOnIPFSCheckResult.isSuccess && metadataOnIPFSCheckResult.isSuccess) {
      let dataNFTTraitsFromRes;

      if (metadataOnIPFSCheckResult.callResponse) {
        dataNFTTraitsFromRes = JSON.parse(metadataOnIPFSCheckResult.callResponse).attributes;
      }

      return {
        result: true,
        dataNFTTraitsFromRes,
      };
    } else {
      return { result: false, dataNFTTraitsFromRes: null };
    }
  }

  // Step 1 of minting (user clicked on mint button on main form)
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

    const isValidInput = validateBaseInput();

    if (isValidInput) {
      setErrDataNFTStreamGeneric(null);
      setMintingSuccessful(false);
      setMakePrimaryNFMeIdSuccessful(false);
      setIsMintingModalOpen(true);

      // we simulate the "encrypting" step for UX, as this was prev done manually and now its all part of the .mint() SDK
      await sleep(2);
      setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s1: 1 }));

      prepareMint();
    }
  };

  // Step 2 of minting (call the SDK mint - encrypt stream, get the gen image and save new image and traits to IPFS)
  const prepareMint = async () => {
    await sleep(3);
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s2: 1 }));

    try {
      const sftMinter = new SftMinter(IS_DEVNET ? "devnet" : "mainnet");

      const optionalSDKMintCallFields: Record<string, any> = {
        nftStorageToken: import.meta.env.VITE_ENV_NFT_STORAGE_KEY,
        extraAssets: [],
      };

      if (extraAssets && extraAssets.trim() !== "" && extraAssets.trim().toUpperCase() !== "NA") {
        optionalSDKMintCallFields["extraAssets"] = [extraAssets.trim()];
      }

      // if it's nfme id vault, get the custom image layers
      if (isNFMeIDMint) {
        optionalSDKMintCallFields["imgGenBg"] = "bg5_series_nfmeid_gen1";
        optionalSDKMintCallFields["imgGenSet"] = "set9_series_nfmeid_gen1";
      }

      const {
        imageUrl: _imageUrl,
        metadataUrl: _metadataUrl,
        tx: dataNFTMintTX,
      } = await sftMinter.mint(
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

      // The actual data nft mint TX we will execute once we confirm the IPFS metadata has loaded
      setMintTx(dataNFTMintTX);

      // let's attempt to checks 3 times if the IPFS data is loaded and available on the gateway
      let assetsLoadedOnIPFSwasSuccess = false;
      let dataNFTTraitsFetched = null;

      for (let tries = 0; tries < 3 && !assetsLoadedOnIPFSwasSuccess; tries++) {
        console.log("tries", tries);
        try {
          await sleep(3);
          const { result, dataNFTTraitsFromRes } = await confirmIfNftImgAndMetadataIsAvailableOnIPFS(_imageUrl, _metadataUrl);

          assetsLoadedOnIPFSwasSuccess = result;
          dataNFTTraitsFetched = dataNFTTraitsFromRes;
          if (assetsLoadedOnIPFSwasSuccess) {
            break;
          } else {
            await sleep(10); // wait 10 seconds extra if it's a fail in case IPFS is slow
          }
        } catch (err) {
          setErrDataNFTStreamGeneric(new Error(labels.ERR_IPFS_ASSET_SAVE_FAILED));
        }
      }

      if (assetsLoadedOnIPFSwasSuccess) {
        setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s3: 1 }));
        await sleep(5);

        const imgCIDOnIPFS = _imageUrl.split("ipfs/")[1];
        setDataNFTImg(`https://gateway.pinata.cloud/ipfs/${imgCIDOnIPFS}`);
        setDataNFTTraits(dataNFTTraitsFetched);
        setImageUrl(_imageUrl);
        setMetadataUrl(_metadataUrl);
        setNftImgAndMetadataLoadedOnIPFS(true);
      } else {
        setErrDataNFTStreamGeneric(new Error(labels.ERR_IPFS_ASSET_SAVE_FAILED));
      }
    } catch (e) {
      console.error(e);
      setErrDataNFTStreamGeneric(new Error(labels.ERR_MINT_TX_GEN_COMMAND_FAILED));
    }
  };

  // Step 3 of minting (when user confirms on model, do the on-chain mint)
  const handleOnChainMint = async () => {
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

  // S: Track transaction statuses
  const mintTxFail = () => {
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT has failed"));
  };

  const makePrimaryVaultTxFail = () => {
    setErrDataNFTStreamGeneric(new Error("Transaction to set primary NFMe ID has failed"));
  };

  const mintTxCancelled = () => {
    setErrDataNFTStreamGeneric(new Error("Transaction to mint Data NFT was cancelled"));
  };

  const makePrimaryVaultCancelled = () => {
    setErrDataNFTStreamGeneric(new Error("Transaction to set primary NFMe ID was cancelled"));
  };

  const makePrimaryVaultTxSuccess = async () => {
    setMakePrimaryNFMeIdSuccessful(true);
  };

  const mintTxSuccess = async () => {
    setSaveProgress((prevSaveProgress) => ({ ...prevSaveProgress, s4: 1 }));

    // if we have to auto-vault -- i.e most likely user first nfme id, then we can auto vault it with this TX
    if ((dataToPrefill?.shouldAutoVault ?? false) && !bondVaultNonce) {
      const dataNftTokenId = IS_DEVNET ? dataNftTokenIdentifier.devnet : dataNftTokenIdentifier.mainnet;
      const nonceToVault = (await axios.get(`https://${getApi(IS_DEVNET ? "D" : "1")}/nfts/count?search=${dataNftTokenId}`)).data;
      const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
      const vaultTx = bondContract.setVaultNonce(new Address(mxAddress), nonceToVault, dataNftTokenId);

      const { sessionId, error } = await sendTransactions({
        transactions: [vaultTx],
        transactionsDisplayInfo: {
          processingMessage: "Setting as NFMe ID Vault",
          errorMessage: "NFMe ID setting failed :(",
          successMessage: "NFMe ID set successfully!",
        },
        redirectAfterSign: false,
      });

      if (error) {
        setErrDataNFTStreamGeneric(new Error(labels.ERR_SET_AS_PRIMARY_NF_ME_ID_VAULT_TX));
      }

      setMakePrimaryNFMeIdSessionId(sessionId);
    }

    await sleep(3);

    setMintingSuccessful(true);
  };

  // track minting TX
  useTrackTransactionStatus({
    transactionId: mintSessionId,
    onSuccess: mintTxSuccess,
    onFail: mintTxFail,
    onCancelled: mintTxCancelled,
  });

  // track make primary NFMe ID  TX
  useTrackTransactionStatus({
    transactionId: makePrimaryNFMeIdSessionId,
    onSuccess: makePrimaryVaultTxSuccess,
    onFail: makePrimaryVaultTxFail,
    onCancelled: makePrimaryVaultCancelled,
  });
  // E: Track transaction statuses

  const handleDisabledButtonStep1 = () => {
    return !!errors.dataStreamUrlForm || !!errors.dataPreviewUrlForm || dataNFTStreamUrl === "" || dataNFTPreviewUrl === "";
  };

  const handleDisabledButtonStep2 = () => {
    return (
      !!errors.tokenNameForm ||
      !!errors.datasetDescriptionForm ||
      !!errors.datasetTitleForm ||
      !!errors.numberOfCopiesForm ||
      !!errors.royaltiesForm ||
      !!errors.extraAssets ||
      dataNFTTokenName === "" ||
      datasetTitle === "" ||
      datasetDescription === "" ||
      dataNFTCopies === 0
    );
  };

  // here you can make logic that you want to happen on submit (used for debugging)
  const onSubmit = (data: TradeDataFormType) => {
    console.log(data);
    //TODO refactor this with react form hook
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box mb={10}>
        {isNFMeIDMint && (
          <Box>
            <Flex>
              <Box>
                <Image src={colorMode === "light" ? liteNFMeIDHero : darkNFMeIDHero} alt="What is the NFMe ID Vault?" rounded="lg" />
              </Box>
            </Flex>
          </Box>
        )}

        {isMintFeeInfoVisible ? (
          <Alert status="info" mt={3} rounded="lg">
            <AlertIcon />
            <Box display="flex" flexDirection="column" w="full">
              <AlertTitle mb={2}>How much $ITHEUM and $EGLD do you need for the mint?</AlertTitle>
              <AlertDescription fontSize="md">1. An anti-spam fee of {antiSpamTax < 0 ? "?" : antiSpamTax} $ITHEUM</AlertDescription>
              <AlertDescription fontSize="md">
                2. Bond an amount of $ITHEUM tokens ({bondingAmount} $ITHEUM) for a period of time ({bondingPeriod} {amountOfTime.unit}). This bond can be
                unlocked by you and earns Staking rewards when active.
              </AlertDescription>
              <AlertDescription fontSize="md">3. ~0.02 EGLD to cover the gas fees for the transaction.</AlertDescription>
              <AlertDescription fontSize="lg" display="flex" gap={1} mt={2} fontWeight="bold">
                Resulting in a total of <Text color="teal.200">{antiSpamTax + bondingAmount} $ITHEUM</Text> tokens and <Text color="teal.200">~0.02</Text> EGLD
              </AlertDescription>
            </Box>
            <CloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={onClose} />
          </Alert>
        ) : (
          <Button onClick={onOpen} mt={3} size="md" variant="outline">
            How much $ITHEUM and $EGLD do you need for the mint?
          </Button>
        )}

        {PRINT_UI_DEBUG_PANELS && (
          <Box>
            <Alert status="warning" mt={3} p={2} fontSize=".8rem" rounded="lg" as="div" style={{ "display": "block" }}>
              <Box>--- Debugging Panel ---</Box>
              <Box>^^ Needs more Itheum to Proceed: {needsMoreITHEUMToProceed.toString()}</Box>
              <Box>^^ Is NFMe ID Mint: {isNFMeIDMint.toString()}</Box>
              <Box>
                ^^ Should Auto Vault?: {!bondVaultNonce ? "true" : "false"} : current bondVaultNonce = {bondVaultNonce?.toString()} (should be true if a primary
                nfme is not set yet)
              </Box>
              <Box>Data Stream URL: {dataNFTStreamUrl}</Box>
              <Box>Data Preview URL: {dataNFTPreviewUrl}</Box>
              <Box>Data Marshal URL: {dataNFTMarshalService}</Box>
              <Box>Number of Copies: {dataNFTCopies} (should be - 5)</Box>
              <Box>Royalties: {dataNFTRoyalties} (should be - 2)</Box>
              <Box>Donate %: {donatePercentage} (should be - 0)</Box>
              <Box>Token Name: {dataNFTTokenName} (should be - NFMeIDG1)</Box>
              <Box>Title: {datasetTitle} (should be - NFMe ID Vault)</Box>
              <Box>Description: {datasetDescription}</Box>
            </Alert>
          </Box>
        )}

        {activeStep !== 2 && (
          <Flex flexDirection="row" mt="3">
            <Text fontSize="md" color="red.400">
              * &nbsp;Required fields
            </Text>
          </Flex>
        )}

        {!isNFMeIDMint && (
          <Stepper size={{ base: "sm", lg: "lg" }} index={activeStep} my={5} colorScheme="teal">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator
                  sx={{
                    "[data-status=complete] &": {
                      background: "teal.200",
                      borderColor: "teal.200",
                    },
                    "[data-status=active] &": {
                      background: "transparent",
                      borderColor: "teal.200",
                    },
                    "[data-status=incomplete] &": {
                      background: "#5b5b5b50",
                      borderColor: "transparent",
                    },
                  }}>
                  <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
        )}

        {activeStep === 0 && (
          <Flex flexDirection={"column"}>
            <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="2 !important" mb={2}>
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
                      onChange={(event) => {
                        onChange(event.target.value);
                        trigger("dataPreviewUrlForm");
                      }}
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
              Data Marshal URL
            </Text>

            <Input mt="1 !important" mb={8} value={dataNFTMarshalService} disabled />

            {!!dataNFTMarshalServiceStatus && (
              <Text color="red.400" fontSize="sm" mt="1 !important">
                {dataNFTMarshalServiceStatus}
              </Text>
            )}
            <Flex justifyContent="flex-end" mb={3} mt={5}>
              <Button colorScheme="teal" size="lg" onClick={() => setActiveStep(activeStep + 1)} isDisabled={handleDisabledButtonStep1()}>
                Next
              </Button>
            </Flex>
          </Flex>
        )}

        {activeStep === 1 && (
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
                      isDisabled={isNFMeIDMint}
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
                      isDisabled={isNFMeIDMint}
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
                      isDisabled={isNFMeIDMint}
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
                        isDisabled={isNFMeIDMint}
                        min={0}
                        max={maxSupply > 0 ? maxSupply : 1}
                        isValidCharacter={isValidNumericCharacter}
                        onChange={(event) => {
                          onChange(event);
                          trigger("numberOfCopiesForm");
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
                        isDisabled={isNFMeIDMint}
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
              <FormLabel fontWeight="bold" fontSize="md">
                Extra Media Asset URL{" "}
              </FormLabel>

              <PopoverTooltip title="What is an Extra Media Asset?" bodyWidthInPX="350px">
                <>
                  Your Data NFT will automatically get {`it's`} very own unique random NFT image, but you can also choose to have an optional Extra Media Asset
                  (like an image) that will be displayed when your Data NFT is listed. Check it out...{" "}
                  <Image
                    margin="auto"
                    mt="5px"
                    boxSize="auto"
                    w={{ base: "50%", md: "50%" }}
                    src={extraAssetDemo}
                    alt="Extra Media Asset Demo"
                    borderRadius="md"
                  />
                </>
              </PopoverTooltip>

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
              <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt={{ base: "1", md: "4" }}>
                Donate Percentage
              </Text>

              <PopoverTooltip title="What is a Donate Percentage?">
                <>
                  When you mint, you can optionally choose to donate a percentage of the total supply to the community treasury, which will then be used for
                  community airdrops to engaged community members who actively use the Itheum BiTz XP system. This is a great way to get an &quot;engaged
                  fanbase&quot; for your new collection and drive awareness. Learn more{" "}
                  <Link
                    href="https://docs.itheum.io/product-docs/product/data-dex/minting-a-data-nft/creator-donations-for-community-airdrops"
                    isExternal
                    rel="noreferrer"
                    color="teal.200">
                    here
                  </Link>
                </>
              </PopoverTooltip>

              <Box p="5">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Slider
                      id="slider"
                      defaultValue={userData && userData?.maxDonationPecentage / 100 / 2}
                      isDisabled={isNFMeIDMint}
                      min={0}
                      max={userData && userData?.maxDonationPecentage / 100}
                      colorScheme="teal"
                      onChange={(v) => onChange(v)}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}>
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
              </Box>

              <Text color="teal.200" fontSize="xl" mt={"1"}>
                Quantity that goes to the community treasury: {Math.floor(dataNFTCopies * (donatePercentage / 100))} Data NFTs
              </Text>
              {Math.floor(dataNFTCopies * (donatePercentage / 100)) === 0 && (
                <Text color="darkorange" fontSize="sm" mt={"1"}>
                  As the number of copies is low, no Data NFTs will be sent for donations
                </Text>
              )}
              <FormErrorMessage>{errors?.donatePercentage?.message}</FormErrorMessage>
            </FormControl>

            <Flex justifyContent="flex-end" gap={3} pt={5} mt={5}>
              <Button size="lg" onClick={() => setActiveStep(activeStep - 1)}>
                Back
              </Button>
              <Flex justifyContent="flex-end">
                <Button colorScheme="teal" size="lg" onClick={() => setActiveStep(activeStep + 1)} isDisabled={handleDisabledButtonStep2()}>
                  Next
                </Button>
              </Flex>
            </Flex>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="8 !important">
              Liveliness Bonding
            </Text>

            <Flex flexDirection="row">
              <Heading size="lg" fontSize="22px" mt={3} mb={5} lineHeight="tall">
                <Highlight
                  query={[`${bondingAmount.toLocaleString()} $ITHEUM`, `${bondingPeriod.toString()} days`, `${maxApy}% Max APR`]}
                  styles={{ px: "2", py: "1", rounded: "full", bg: "teal.200" }}>
                  {`To mint your ${isNFMeIDMint ? "NFMe ID Vault" : "Data NFT"} , you need to bond ${bondingAmount.toLocaleString()} $ITHEUM for ${bondingPeriod.toString()} days. Bonds earn an estimated ${maxApy}% Max APR as staking rewards.`}
                </Highlight>
              </Heading>

              {enableBondingInputForm && (
                <>
                  <FormControl isInvalid={!!errors.bondingAmount}>
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

                  <FormControl isInvalid={!!errors.bondingPeriod}>
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
                </>
              )}
            </Flex>

            <Box>
              {itheumBalance < antiSpamTax + bondingAmount && (
                <Text color="red.400" fontSize="md" mt="1 !important" mb="2">
                  {labels.ERR_MINT_FORM_NOT_ENOUGH_BOND}
                </Text>
              )}
            </Box>

            <PopoverTooltip title="Bond $ITHEUM to Prove Reputation" bodyWidthInPX="380px">
              <>
                <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="3 !important">
                  Bonding ITHEUM tokens proves your {"Liveliness"} and gives Data Consumers confidence that you will maintain the Data {`NFT's`} Data Stream.
                  You will need to lock the{" "}
                  <Text fontWeight="bold" as="span">
                    Bonding Amount{" "}
                  </Text>
                  for the required{" "}
                  <Text fontWeight="bold" as="span">
                    Bonding Period.{" "}
                  </Text>
                  <br />
                  <br />
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
                  OR if you want to continue to signal to Data Consumers that you will maintain the Data {`NFT’s`} Data Stream, you can {`"renew"`} the
                  Liveliness Bond. <br />
                  <br />
                  But wait, on top of the benefit of having liveliness to prove your reputation, there is more good news, your bonded $ITHEUM also earns Staking
                  APR as it powers your Liveliness reputation!{" "}
                  <Link
                    href="https://docs.itheum.io/product-docs/product/liveliness-on-chain-reputation/liveliness-staking-guide"
                    isExternal
                    rel="noreferrer"
                    color="teal.200">
                    Learn more
                  </Link>
                </Text>
              </>
            </PopoverTooltip>

            <Box minH={{ base: "5rem", md: "3.5rem" }}>
              <Flex mt="3 !important">
                <Button
                  colorScheme="teal"
                  borderRadius="12px"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://docs.itheum.io/product-docs/legal/ecosystem-tools-terms/liveliness-bonding-penalties-and-slashing-terms")
                  }>
                  <Text color={colorMode === "dark" ? "bgWhite" : "black"} px={2}>
                    Read Liveliness Bonding: Penalties and Slashing Terms
                  </Text>
                </Button>
              </Flex>

              <Checkbox size="md" mt="3 !important" isChecked={readLivelinessBonding} onChange={(e) => setReadLivelinessBonding(e.target.checked)}>
                I have read and I agree to Liveliness Bonding: Penalties and Slashing Terms
              </Checkbox>

              {!readLivelinessBonding && showInlineErrorsBeforeAction && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  You need to agree to Liveliness Bonding: Penalties and Slashing Terms to proceed with your mint.
                </Text>
              )}
            </Box>

            <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="48px !important">
              Minting Terms of Use
            </Text>

            {!isNFMeIDMint && (
              <PopoverTooltip title="Terms of use for Minting a Data NFT">
                <>
                  <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="3 !important">
                    Minting a Data NFT and putting it for trade on the Data DEX means you have to agree to some strict “terms of use”, as an example, you agree
                    that the data is free of any illegal material and that it does not breach any copyright laws. <br />
                    <br />
                    You also agree to make sure the Data Stream URL is always online. Given it&apos;s an NFT, you also have limitations like not being able to
                    update the title, description, royalty, etc. But there are other conditions too. <br />
                    <br />
                    Take some time to read these “terms of use” before you proceed and it&apos;s critical you understand the terms of use before proceeding.
                  </Text>
                </>
              </PopoverTooltip>
            )}

            <Flex mt="3 !important">
              <Button
                colorScheme="teal"
                borderRadius="12px"
                variant="outline"
                size="sm"
                onClick={() => window.open("https://itheum.com/legal/datadex/termsofuse")}>
                <Text color={colorMode === "dark" ? "bgWhite" : "black"} px={2}>
                  Read Minting Terms of Use
                </Text>
              </Button>
            </Flex>

            <Box minH={{ base: "5rem", md: "3.5rem" }}>
              <Checkbox size="md" mt="3 !important" isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
                I have read and I agree to the Terms of Use
              </Checkbox>

              {!readTermsChecked && showInlineErrorsBeforeAction && (
                <Text color="red.400" fontSize="sm" mt="1 !important" minH={"20px"}>
                  Please read and agree to Terms of Use to proceed with your mint.
                </Text>
              )}
            </Box>

            <Text fontWeight="500" color="teal.200" lineHeight="38.4px" fontSize="24px" mt="30px !important">
              Anti-Spam Fee
            </Text>

            <PopoverTooltip title="What is the Anti-Spam Fee">
              <>
                <Text fontSize="md" fontWeight="500" lineHeight="22.4px" mt="3 !important">
                  An {"anti-spam fee"} is necessary to prevent excessive concurrent mints from overwhelming the Data DEX. The fees are collected and
                  redistributed back to Data Creators as Liveliness staking rewards or burned
                </Text>
              </>
            </PopoverTooltip>

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
                I accept the deduction of the Anti-Spam Minting Fee from my wallet
              </Checkbox>

              {!readAntiSpamFeeChecked && showInlineErrorsBeforeAction && (
                <Text color="red.400" fontSize="sm" mt="1 !important">
                  You need to agree to Anti-Spam Minting deduction to proceed with your mint.
                </Text>
              )}
            </Box>

            <Flex>
              <ChainSupportedInput feature={MENU.SELL}>
                <Button mt="10" colorScheme="teal" isLoading={isMintingModalOpen} onClick={dataNFTSellSubmit} isDisabled={shouldMintYourDataNftBeDisabled()}>
                  {isNFMeIDMint ? "Mint Your NFMe ID Vault" : "Mint Your Data NFT Collection"}
                </Button>
              </ChainSupportedInput>
            </Flex>

            <MintingModal
              isOpen={isMintingModalOpen}
              setIsOpen={setIsMintingModalOpen}
              errDataNFTStreamGeneric={errDataNFTStreamGeneric}
              saveProgress={saveProgress}
              imageUrl={imageUrl}
              dataNFTImg={dataNFTImg}
              dataNFTTraits={dataNFTTraits}
              metadataUrl={metadataUrl}
              setSaveProgress={setSaveProgress}
              closeProgressModal={closeProgressModal}
              mintingSuccessful={mintingSuccessful}
              makePrimaryNFMeIdSuccessful={makePrimaryNFMeIdSuccessful}
              onChainMint={handleOnChainMint}
              isNFMeIDMint={isNFMeIDMint}
              isAutoVault={(dataToPrefill?.shouldAutoVault ?? false) && !bondVaultNonce}
              nftImgAndMetadataLoadedOnIPFS={nftImgAndMetadataLoadedOnIPFS}
            />
          </>
        )}
      </Box>
    </form>
  );
};
