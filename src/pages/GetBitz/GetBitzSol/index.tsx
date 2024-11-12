import React, { useEffect, useState } from "react";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { motion } from "framer-motion";
import Countdown from "react-countdown";

// Image Layers
import { LuMousePointerClick } from "react-icons/lu";
import aladinRugg from "assets/img/getbitz/aladin.png";
import FingerPoint from "assets/img/getbitz/finger-point.gif";
import ImgGameCanvas from "assets/img/getbitz/getbitz-game-canvas.png";
import ImgGetDataNFT from "assets/img/getbitz/getbitz-get-datanft-v2.gif";
import ImgLoadingGame from "assets/img/getbitz/getbitz-loading.gif";
import ImgLogin from "assets/img/getbitz/getbitz-login.gif";
import ImgPlayGame from "assets/img/getbitz/getbitz-play.gif";

// Memes
import Meme1 from "assets/img/getbitz/memes/1.jpg";
import Meme10 from "assets/img/getbitz/memes/10.jpg";
import Meme11 from "assets/img/getbitz/memes/11.jpg";
import Meme12 from "assets/img/getbitz/memes/12.jpg";
import Meme13 from "assets/img/getbitz/memes/13.jpg";
import Meme14 from "assets/img/getbitz/memes/14.jpg";
import Meme15 from "assets/img/getbitz/memes/15.jpg";
import Meme16 from "assets/img/getbitz/memes/16.jpg";
import Meme17 from "assets/img/getbitz/memes/17.jpg";
import Meme18 from "assets/img/getbitz/memes/18.jpg";
import Meme19 from "assets/img/getbitz/memes/19.jpg";
import Meme2 from "assets/img/getbitz/memes/2.jpg";
import Meme20 from "assets/img/getbitz/memes/20.jpg";
import Meme21 from "assets/img/getbitz/memes/21.jpg";
import Meme22 from "assets/img/getbitz/memes/22.jpg";
import Meme23 from "assets/img/getbitz/memes/23.jpg";
import Meme24 from "assets/img/getbitz/memes/24.jpg";
import Meme25 from "assets/img/getbitz/memes/25.jpg";
import Meme26 from "assets/img/getbitz/memes/26.jpg";
import Meme3 from "assets/img/getbitz/memes/3.jpg";
import Meme4 from "assets/img/getbitz/memes/4.jpg";
import Meme5 from "assets/img/getbitz/memes/5.jpg";
import Meme6 from "assets/img/getbitz/memes/6.jpg";
import Meme7 from "assets/img/getbitz/memes/7.jpg";
import Meme8 from "assets/img/getbitz/memes/8.jpg";
import Meme9 from "assets/img/getbitz/memes/9.jpg";

import resultLoading from "assets/img/getbitz/pixel-loading.gif";
import { IS_DEVNET } from "libs/config";
import { itheumSolPreaccess, itheumSolViewData } from "libs/Solana/SolViewData";
import { BlobDataType } from "libs/types";
import { cn, computeRemainingCooldown, sleep } from "libs/utils";
import { useAccountStore } from "store";

import { useNftsStore } from "store/nfts";
import { BurningImage } from "../common/BurningImage";

const MEME_IMGS = [
  Meme1,
  Meme2,
  Meme3,
  Meme4,
  Meme5,
  Meme6,
  Meme7,
  Meme8,
  Meme9,
  Meme10,
  Meme11,
  Meme12,
  Meme13,
  Meme14,
  Meme15,
  Meme16,
  Meme17,
  Meme18,
  Meme19,
  Meme20,
  Meme21,
  Meme22,
  Meme23,
  Meme24,
  Meme25,
  Meme26,
];

const GetBitzSol = (props: any) => {
  const { modalMode } = props;
  const { publicKey: solPubKey, signMessage } = useWallet();
  const address = solPubKey?.toBase58();
  const [checkingIfHasGameDataNFT, setCheckingIfHasGameDataNFT] = useState<boolean>(true);
  const [hasGameDataNFT, setHasGameDataNFT] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(true);
  const { setVisible } = useWalletModal();

  // store based state
  const cooldown = useAccountStore((state: any) => state.cooldown);
  const updateCollectedBitzSum = useAccountStore((state) => state.updateCollectedBitzSum);
  const updateBitzBalance = useAccountStore((state) => state.updateBitzBalance);
  const updateCooldown = useAccountStore((state) => state.updateCooldown);
  const updateBonusBitzSum = useAccountStore((state) => state.updateBonusBitzSum);
  const updateBonusTries = useAccountStore((state) => state.updateBonusTries);
  const updateGivenBitzSum = useAccountStore((state) => state.updateGivenBitzSum);

  const solPreaccessNonce = useAccountStore((state: any) => state.solPreaccessNonce);
  const solPreaccessSignature = useAccountStore((state: any) => state.solPreaccessSignature);
  const solPreaccessTimestamp = useAccountStore((state: any) => state.solPreaccessTimestamp);
  const updateSolPreaccessNonce = useAccountStore((state: any) => state.updateSolPreaccessNonce);
  const updateSolPreaccessTimestamp = useAccountStore((state: any) => state.updateSolPreaccessTimestamp);
  const updateSolSignedPreaccess = useAccountStore((state: any) => state.updateSolSignedPreaccess);

  // a single game-play related (so we have to reset these if the user wants to "replay")
  const [isFetchingDataMarshal, setIsFetchingDataMarshal] = useState<boolean>(false);
  const [isMemeBurnHappening, setIsMemeBurnHappening] = useState<boolean>(false);
  const [gameDataFetched, setGameDataFetched] = useState<boolean>(false);
  const [viewDataRes, setViewDataRes] = useState<any>();
  const [burnFireScale, setBurnFireScale] = useState<string>("scale(0) translate(-13px, -15px)");
  const [burnFireGlow, setBurnFireGlow] = useState<number>(0);
  const [burnProgress, setBurnProgress] = useState(0);
  const [randomMeme, setRandomMeme] = useState<any>(Meme1);
  const tweetText = `url=https://explorer.itheum.io/getbitz?v=3&text=${viewDataRes?.data.gamePlayResult.bitsWon > 0 ? "I just played the Get <BiTz> XP Game on %23itheum and won " + viewDataRes?.data.gamePlayResult.bitsWon + " <BiTz> points 🙌!%0A%0APlay now and get your own <BiTz>! %23GetBiTz %23DRiP %23Solana" : "Oh no, I got rugged getting <BiTz> points this time. Maybe you will have better luck?%0A%0ATry here to %23GetBiTz %23itheum %0A"}`;

  // Game canvas related
  const [loadBlankGameCanvas, setLoadBlankGameCanvas] = useState<boolean>(false);

  const { solNfts } = useNftsStore();
  const [solNftsBitz, setSolNftsBitz] = useState<DasApiAsset[]>([]);
  const [populatedBitzStore, setPopulatedBitzStore] = useState<boolean>(false);
  useEffect(() => {
    if (solPubKey && solNfts) {
      setSolNftsBitz(
        IS_DEVNET ? solNfts.filter((nft) => nft.content.metadata.name.includes("XP")) : solNfts.filter((nft) => nft.content.metadata.name.includes("IXPG2"))
      );
    }
  }, [solPubKey, solNfts]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    const timeout = setTimeout(() => {
      setShowMessage(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  async function viewData(viewDataArgs: any, requiredDataNFT: any) {
    try {
      let usedPreAccessNonce = solPreaccessNonce;
      let usedPreAccessSignature = solPreaccessSignature;

      if (solPreaccessSignature === "" || solPreaccessTimestamp === -2 || solPreaccessTimestamp + 60 * 80 * 1000 < Date.now()) {
        const preAccessNonce = await itheumSolPreaccess();
        const message = new TextEncoder().encode(preAccessNonce);
        if (signMessage === undefined) throw new Error("signMessage is undefiend");
        const signature = await signMessage(message);
        if (!preAccessNonce || !signature || !solPubKey) throw new Error("Missing data for viewData");
        const encodedSignature = bs58.encode(signature);
        updateSolPreaccessNonce(preAccessNonce);
        updateSolSignedPreaccess(encodedSignature);
        updateSolPreaccessTimestamp(Date.now());
        usedPreAccessNonce = preAccessNonce;
        usedPreAccessSignature = encodedSignature;
      }
      if (!solPubKey) throw new Error("Missing data for viewData");
      const res = await itheumSolViewData(
        requiredDataNFT.id,
        usedPreAccessNonce,
        usedPreAccessSignature,
        solPubKey,
        viewDataArgs.fwdHeaderKeys,
        viewDataArgs.headers
      );
      const rest = await res.json();
      const blobDataType = BlobDataType.TEXT;
      let data;
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = rest;
        }
        return { data, blobDataType, contentType };
      } else {
        console.error("viewData threw catch error" + res.statusText);

        return undefined;
      }
    } catch (err) {
      setIsFetchingDataMarshal(false);
      return undefined;
    }
  }

  useEffect(() => {
    if (solNftsBitz === undefined) return;
    if (!populatedBitzStore) {
      if (solPubKey && solNftsBitz.length > 0) {
        updateBitzBalance(-2);
        updateCooldown(-2);
        updateGivenBitzSum(-2);
        setPopulatedBitzStore(true);

        const viewDataArgs = {
          headers: {
            "dmf-custom-only-state": "1",
          },
          fwdHeaderKeys: ["dmf-custom-only-state"],
        };

        (async () => {
          const getBitzGameResult = await viewData(viewDataArgs, solNftsBitz[0]);
          if (getBitzGameResult) {
            const bitzBeforePlay = getBitzGameResult.data.gamePlayResult.bitsScoreBeforePlay || 0;
            const sumGivenBits = getBitzGameResult.data?.bitsMain?.bitsGivenSum || 0;
            const sumBonusBitz = getBitzGameResult.data?.bitsMain?.bitsBonusSum || 0;
            if (sumGivenBits > 0) {
              updateBitzBalance(bitzBeforePlay + sumBonusBitz - sumGivenBits); // collected bits - given bits
              updateGivenBitzSum(sumGivenBits); // given bits -- for power-ups
              updateBonusBitzSum(sumBonusBitz);
            }

            updateCooldown(
              computeRemainingCooldown(
                getBitzGameResult.data.gamePlayResult.lastPlayedBeforeThisPlay,
                getBitzGameResult.data.gamePlayResult.configCanPlayEveryMSecs
              )
            );
          }
        })();
      } else {
        updateBitzBalance(-1);
        updateGivenBitzSum(-1);
        updateCooldown(-1);
        updateCollectedBitzSum(-1);
      }
    } else {
      if (!solPubKey) {
        setPopulatedBitzStore(false);
      }
    }
  }, [solNftsBitz, solPubKey]);

  useEffect(() => {
    checkIfHasGameDataNft();
  }, [address, solNftsBitz]);

  useEffect(() => {
    setBurnFireScale(`scale(${burnProgress}) translate(-13px, -15px)`);
    setBurnFireGlow(burnProgress * 0.1);
    if (burnProgress === 10) {
      setIsMemeBurnHappening(false);
      playGame();
    }
  }, [burnProgress]);

  // secondly, we get the user's Data NFTs and flag if the user has the required Data NFT for the game in their wallet
  async function checkIfHasGameDataNft() {
    const hasRequiredDataNFT = solNftsBitz && solNftsBitz.length > 0;
    setHasGameDataNFT(hasRequiredDataNFT ? true : false);
    setCheckingIfHasGameDataNFT(false);
    setRandomMeme(MEME_IMGS[Math.floor(Math.random() * MEME_IMGS.length)]); // set a random meme as well
  }

  // have to reset all "single game-play related" (see above)
  function resetToStartGame() {
    setIsFetchingDataMarshal(false);
    setIsMemeBurnHappening(false);
    setGameDataFetched(false);
    setBurnProgress(0);
    setViewDataRes(undefined);
    setBurnFireScale("scale(0) translate(-13px, -15px)");
    setBurnFireGlow(0);
    setRandomMeme(MEME_IMGS[Math.floor(Math.random() * MEME_IMGS.length)]); // set a random meme as well
  }

  async function playGame() {
    setIsFetchingDataMarshal(true);
    await sleep(5);
    const viewDataArgs: Record<string, any> = {
      headers: {},
      fwdHeaderKeys: [],
    };

    const viewDataPayload = await viewData(viewDataArgs, solNftsBitz[0]);
    if (viewDataPayload) {
      setGameDataFetched(true);
      setIsFetchingDataMarshal(false);
      setViewDataRes(viewDataPayload);
      updateCooldown(
        computeRemainingCooldown(
          Math.max(viewDataPayload.data.gamePlayResult.lastPlayedAndCommitted, viewDataPayload.data.gamePlayResult.lastPlayedBeforeThisPlay),
          viewDataPayload.data.gamePlayResult.configCanPlayEveryMSecs
        )
      );
      const sumBitzBalance = viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay || 0;
      const sumBonusBitz = viewDataPayload.data?.bitsMain?.bitsBonusSum || 0;
      const sumGivenBits = viewDataPayload.data?.bitsMain?.bitsGivenSum || 0;
      if (viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay > -1) {
        updateBitzBalance(sumBitzBalance + sumBonusBitz - sumGivenBits); // won some bis, minus given bits and show
        updateCollectedBitzSum(viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay);
      } else {
        updateBitzBalance(viewDataPayload.data.gamePlayResult.bitsScoreBeforePlay + sumBonusBitz - sumGivenBits); // did not win bits, minus given bits from current and show
        updateCollectedBitzSum(viewDataPayload.data.gamePlayResult.bitsScoreBeforePlay);
      }
      // how many bonus tries does the user have
      if (viewDataPayload.data.gamePlayResult.bonusTriesAfterThisPlay > -1) {
        updateBonusTries(viewDataPayload.data.gamePlayResult.bonusTriesAfterThisPlay);
      } else {
        updateBonusTries(viewDataPayload.data.gamePlayResult.bonusTriesBeforeThisPlay || 0);
      }
    }
  }
  function gamePlayImageSprites() {
    const _viewDataRes = viewDataRes;
    const _loadBlankGameCanvas = loadBlankGameCanvas;
    const _gameDataFetched = gameDataFetched;
    const _isFetchingDataMarshal = isFetchingDataMarshal;
    const _isMemeBurnHappening = isMemeBurnHappening;
    if (!address) {
      return (
        <img
          onClick={() => {
            setVisible(true);
          }}
          className={cn("-z-1 relative z-5 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
          src={ImgLogin}
          alt={"Connect your wallet to play"}
        />
      );
    }
    if ((address && checkingIfHasGameDataNFT && !hasGameDataNFT) || cooldown === -2) {
      return (
        <div className="relative">
          <img
            className={cn("-z-1 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
            src={ImgLoadingGame}
            alt={"Checking if you have <BiTz> Data NFT"}
          />
        </div>
      );
    }
    // user is logged in does not have the data nft, so take them to the marketplace
    if (address && !checkingIfHasGameDataNFT && !hasGameDataNFT) {
      return (
        <div
          className="relative"
          onClick={() => {
            if (
              confirm(
                "Get BiTz XP Data NFTs from the Tensor NFT Marketplace.\n\nWe will now take you to the Tensor Marketplace, just filter the collection and select any NFT with the Trait - 'itheum.io/getxp'.\n\nThese Data NFTs will then let you play this BiTz XP game and collect XP.\n\n Make sure you enable popups in your browser now"
              ) == true
            ) {
              window.open("https://www.tensor.trade/trade/itheum_drip")?.focus();
            }
          }}>
          <img
            className={cn("z-5 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
            src={ImgGetDataNFT}
            alt={"Get <BiTz> Data NFT from Data NFT Marketplace"}
          />
        </div>
      );
    }
    const CountDownComplete = () => (
      <div
        className="cursor-pointer relative inline-flex h-12 overflow-hidden rounded-full p-[1px] "
        onClick={() => {
          resetToStartGame();
        }}>
        <span className="absolute hover:bg-[#35d9fa] inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF03,#45d4ff_50%,#111111_50%)]" />
        <span className="text-primary inline-flex h-full hover:bg-gradient-to-tl from-background to-[#35d9fa] w-full cursor-pointer items-center justify-center rounded-full bg-background px-3 py-1 text-sm font-medium   backdrop-blur-3xl">
          RIGHT NOW! Try again <LuMousePointerClick className="ml-2 text-[#35d9fa]" />
        </span>
      </div>
    );
    // Renderer callback with condition
    const countdownRenderer = (props: { hours: number; minutes: number; seconds: number; completed: boolean }) => {
      if (props.completed) {
        // Render a complete state
        return <CountDownComplete />;
      } else {
        // Render a countdown
        return (
          <span>
            {props.hours > 0 ? <>{`${props.hours} ${props.hours === 1 ? " Hour " : " Hours "}`}</> : ""}
            {props.minutes > 0 ? props.minutes + " Min " : ""} {props.seconds} Sec
          </span>
        );
      }
    };
    // user has data nft, so load the "start game" view
    if (!_loadBlankGameCanvas && !_isFetchingDataMarshal) {
      return (
        <div className="relative">
          {cooldown > 0 && (
            <Countdown
              className="mx-auto text-3"
              date={cooldown}
              renderer={(props: { hours: number; minutes: number; seconds: number; completed: boolean }) => {
                if (props.completed) {
                  return <> </>;
                } else {
                  return (
                    <div className={cn("absolute z-5 w-full h-full rounded-[3rem] bg-black/90", modalMode ? "rounded" : "")}>
                      <div className="flex w-full h-full items-center justify-center">
                        <div className="text-3xl md:text-5xl flex flex-col items-center justify-center text-white ">
                          <p className="my-4 text-xl md:text-3xl "> You can play again in: </p>{" "}
                          {props.hours > 0 ? <>{`${props.hours} ${props.hours === 1 ? " Hour " : " Hours "}`}</> : ""}
                          {props.minutes > 0 ? props.minutes + " Min " : ""} {props.seconds} Sec
                        </div>
                      </div>
                    </div>
                  );
                }
              }}
            />
          )}
          <img
            onClick={() => {
              if (address) {
                setLoadBlankGameCanvas(true);
              }
            }}
            className={cn("rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
            src={ImgPlayGame}
            alt={"Start Game"}
          />
        </div>
      );
    }
    // user clicked on the start game view, so load the empty blank game canvas
    if (_loadBlankGameCanvas && !_gameDataFetched) {
      return (
        <div className="relative overflow-hidden">
          <img
            className={cn("rounded-[3rem] w-full", _isMemeBurnHappening && !modalMode ? "cursor-none" : "", modalMode ? "rounded" : "")}
            src={ImgGameCanvas}
            alt={"Play Game"}
          />
          <div
            className={cn(
              "select-none flex justify-center items-center mt-[2rem] w-[100%] h-[350px] md:h-[400px] rounded-[3rem] bg-slate-50 text-gray-950 p-[2rem] border border-primary/50 static lg:absolute lg:pb-[.5rem] lg:w-[500px] lg:h-[420px] lg:mt-0 lg:top-[40%] lg:left-[50%] lg:-translate-x-1/2 lg:-translate-y-1/2",
              _isMemeBurnHappening && !modalMode ? "cursor-none" : "",
              modalMode ? "scale-75 !mt-[35px]" : ""
            )}>
            {(!_isFetchingDataMarshal && !_isMemeBurnHappening && (
              <>
                <div
                  className="text-center text-xl text-gray-950 text-foreground cursor-pointer"
                  onClick={() => {
                    setIsMemeBurnHappening(true);
                  }}>
                  <p className="lg:text-md">Welcome Back Itheum OG!</p>
                  <p className="lg:text-md mt-2 lg:mt-5">
                    Ready to grab yourself some of them <span className=" lg:text-3xl">🤤</span> {`<BiTz>`} points?
                  </p>
                  <p className="font-bold lg:text-2xl mt-5">But the {`<BiTz>`} Generator God will need a Meme 🔥 Sacrifice from you to proceed!</p>
                  <p className="font-bold mt-2 lg:mt-5">Click here when you are ready...</p>
                  <img className="w-[40px] m-auto" src={FingerPoint} alt={"Click to Start"} />
                </div>
              </>
            )) ||
              null}
            {_isMemeBurnHappening && (
              <div
                className={cn("z-10 relative cursor-none select-none p-8", modalMode ? "cursor-pointer" : "")}
                onClick={() => {
                  setBurnProgress((prev) => prev + 1);
                }}>
                <p className="text-center text-md text-gray-950 text-foreground lg:text-xl ">Light up this Meme Sacrifice!</p>
                <p className="text-gray-950 text-sm text-center mb-[1rem]">Click to burn</p>
                <BurningImage src={randomMeme} burnProgress={burnProgress} modalMode={modalMode} />
                <div className="glow" style={{ opacity: burnFireGlow }}></div>
                <div className="flame !top-[125px] lg:!top-[90px]" style={{ transform: burnFireScale }}></div>
              </div>
            )}
            {_isFetchingDataMarshal && (
              <div>
                <p className="text-center text-md text-gray-950 text-foreground lg:text-xl mb-[1rem]">
                  Did the {`<BiTz>`} Generator God like that Meme Sacrifice? Only time will tell...
                </p>
                <p className="text-gray-950 text-sm text-center mb-[1rem]">Hang tight, result incoming</p>
                <img className="w-[160px] lg:w-[230px] m-auto" src={resultLoading} alt={"Result loading"} />
              </div>
            )}
          </div>
        </div>
      );
    }
    // we got the response from the game play
    if (_loadBlankGameCanvas && !_isFetchingDataMarshal && _gameDataFetched) {
      return (
        <div className="relative overflow-hidden">
          <img className={cn("rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")} src={ImgGameCanvas} alt={"Get <BiTz> Points"} />
          <div
            className={cn(
              "flex justify-center items-center mt-[2rem] w-[100%] h-[350px] rounded-[3rem] bg-slate-50 text-gray-950 p-[1rem] border border-primary/50 static lg:absolute lg:p-[2rem] lg:pb-[.5rem] lg:w-[500px] lg:h-[400px] lg:mt-0 lg:top-[40%] lg:left-[50%] lg:-translate-x-1/2 lg:-translate-y-1/2",
              modalMode ? "scale-75 !mt-[35px]" : ""
            )}>
            {_viewDataRes && !_viewDataRes.error && (
              <>
                {_viewDataRes.data.gamePlayResult.triedTooSoonTryAgainInMs > 0 && (
                  <div>
                    <p className="text-2xl text-center">You FOMOed in too fast, try again in:</p>
                    <div className="text-2xl text-center mt-[2rem]">
                      <Countdown date={Date.now() + _viewDataRes.data.gamePlayResult.triedTooSoonTryAgainInMs} renderer={countdownRenderer} />
                    </div>
                  </div>
                )}
                {_viewDataRes.data.gamePlayResult.triedTooSoonTryAgainInMs === -1 && (
                  <div className="flex flex-col justify-around h-[100%] items-center text-center">
                    {_viewDataRes.data.gamePlayResult.bitsWon === 0 && (
                      <>
                        <div className="z-[25]">
                          <p className="text-2xl">OPPS! Aladdin Rugged You! 0 Points this Time...</p>
                          <motion.img
                            className="w-[150px] md:w-[180px] lg:w-[210px] xl:w-full absolute z-[25]"
                            src={aladinRugg}
                            initial={{ x: -750, y: 0 }}
                            animate={{
                              scale: [0.5, 1, 1, 0.5],
                              rotate: [0, 0, -360, -360, -360, -360],
                              opacity: [0.8, 1, 1, 1, 1, 1, 1, 0],
                              x: [-750, 0, 200, 1000],
                            }}
                            transition={{ duration: 8 }}
                          />
                        </div>
                        <div className="bg-black rounded-full p-[10px] -z-1 ">
                          <a
                            className="z-1 bg-black text-white  rounded-3xl gap-2 flex flex-row justify-center items-center"
                            href={"https://twitter.com/intent/tweet?" + tweetText}
                            data-size="large"
                            target="_blank"
                            rel="noreferrer">
                            <span className=" [&>svg]:h-4 [&>svg]:w-4 z-10">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
                                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                              </svg>
                            </span>
                            <p className="z-10">Tweet</p>
                          </a>
                        </div>
                      </>
                    )}
                    {(_viewDataRes.data.gamePlayResult.bitsWon > 0 && (
                      <>
                        <p className="text-2xl text-gray-950">w👀t! w👀t! You have won:</p>
                        <p className="text-4xl mt-[2rem] text-gray-950">
                          {_viewDataRes.data.gamePlayResult.bitsWon} {` <BiTz>`}
                        </p>
                        <div className="bg-black rounded-full p-[10px]">
                          <a
                            className=" bg-black text-white  rounded-3xl gap-2 flex flex-row justify-center items-center"
                            href={"https://twitter.com/intent/tweet?" + tweetText}
                            data-size="large"
                            target="_blank"
                            rel="noreferrer">
                            <span className="[&>svg]:h-4 [&>svg]:w-4">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
                                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                              </svg>
                            </span>
                            Tweet
                          </a>
                        </div>
                      </>
                    )) ||
                      null}
                    {(((_viewDataRes.data.gamePlayResult.bonusTriesBeforeThisPlay > 0 && _viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay === -1) ||
                      _viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay > 0) && (
                      <div className="text-center mt-[2rem]">
                        <p className="text-xl">
                          BONUS GAMES AVAILABLE! w👀t! your referrals have earned you{" "}
                          {_viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay > 0
                            ? _viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay
                            : _viewDataRes.data.gamePlayResult.bonusTriesBeforeThisPlay}{" "}
                          more bonus tries!
                        </p>
                        <div
                          className="cursor-pointer relative inline-flex h-12 overflow-hidden rounded-full p-[1px] "
                          onClick={() => {
                            resetToStartGame();
                          }}>
                          <span className="absolute hover:bg-sky-300 inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF03,#45d4ff_50%,#111111_50%)]" />
                          <span className="text-primary inline-flex h-full hover:bg-gradient-to-tl from-background to-sky-300 w-full cursor-pointer items-center justify-center rounded-full bg-background px-3 py-1 text-sm font-medium backdrop-blur-3xl">
                            PLAY AGAIN! <LuMousePointerClick className="ml-2 text-sky-300" />
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center mt-[2rem]">
                        <p className="text-xl">You can try again in:</p>
                        <div className="text-2xl mt-[1rem]">
                          <Countdown date={Date.now() + _viewDataRes.data.gamePlayResult.configCanPlayEveryMSecs} renderer={countdownRenderer} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      <div className="relative w-full">
        <div className="absolute -z-1 w-full">
          <img
            className={cn("-z-1 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
            src={ImgLoadingGame}
            alt={"Checking if you have <BiTz> Data NFT"}
          />
        </div>
        {gamePlayImageSprites()}
      </div>
    </div>
  );
};

export default GetBitzSol;
