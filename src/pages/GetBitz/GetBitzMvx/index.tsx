/* eslint-disable prefer-const */
import React, { useEffect, useState } from "react";
import { DataNft } from "@itheum/sdk-mx-data-nft";
import { useGetAccount, useGetLoginInfo, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { BlobDataType, ExtendedViewDataReturnType } from "libs/types";
import { cn, computeRemainingCooldown, decodeNativeAuthToken, sleep } from "libs/utils";
import { BurningImage } from "../common/BurningImage";
import "../common/GetBitz.css";

// Image Layers
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
import Meme27 from "assets/img/getbitz/memes/27.jpg";
import Meme28 from "assets/img/getbitz/memes/28.jpg";
import Meme29 from "assets/img/getbitz/memes/29.jpg";
import Meme3 from "assets/img/getbitz/memes/3.jpg";
import Meme4 from "assets/img/getbitz/memes/4.jpg";
import Meme5 from "assets/img/getbitz/memes/5.jpg";
import Meme6 from "assets/img/getbitz/memes/6.jpg";
import Meme7 from "assets/img/getbitz/memes/7.jpg";
import Meme8 from "assets/img/getbitz/memes/8.jpg";
import Meme9 from "assets/img/getbitz/memes/9.jpg";

import resultLoading from "assets/img/getbitz/pixel-loading.gif";
import { useAccountStore } from "store/account";
import { Toast } from "@chakra-ui/react";
import { GET_BITZ_TOKEN, MARKETPLACE_DETAILS_PAGE } from "libs/config";
import { LuMousePointerClick } from "react-icons/lu";
import { getNftsOfACollectionForAnAddress } from "libs/MultiversX/api";
import Countdown from "react-countdown";
import { useNftsStore } from "store/nfts";

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
  Meme27,
  Meme28,
  Meme29,
];

export const GetBitzMvx = (props: any) => {
  const { modalMode } = props;

  const { address } = useGetAccount();
  const { tokenLogin } = useGetLoginInfo();
  const { chainID } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const [gameDataNFT, setGameDataNFT] = useState<DataNft>();
  const [checkingIfHasGameDataNFT, setCheckingIfHasGameDataNFT] = useState<boolean>(true);
  const [hasGameDataNFT, setHasGameDataNFT] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMessage, setShowMessage] = useState<boolean>(true);

  // store based state
  const bitzBalance = useAccountStore((state: any) => state.bitzBalance);
  const cooldown = useAccountStore((state: any) => state.cooldown);
  // const collectedBitzSum = useAccountStore((state: any) => state.collectedBitzSum);
  // const bonusTries = useAccountStore((state: any) => state.bonusTries);
  // const updateCollectedBitzSum = useAccountStore((state) => state.updateCollectedBitzSum);
  const updateBitzBalance = useAccountStore((state) => state.updateBitzBalance);
  const updateCooldown = useAccountStore((state) => state.updateCooldown);
  const updateBonusBitzSum = useAccountStore((state) => state.updateBonusBitzSum);
  const updateBonusTries = useAccountStore((state) => state.updateBonusTries);
  // const updateBonusTries = useAccountStore((state) => state.updateBonusTries);

  // a single game-play related (so we have to reset these if the user wants to "replay")
  const [isFetchingDataMarshal, setIsFetchingDataMarshal] = useState<boolean>(false);
  const [isMemeBurnHappening, setIsMemeBurnHappening] = useState<boolean>(false);
  const [gameDataFetched, setGameDataFetched] = useState<boolean>(false);
  const [viewDataRes, setViewDataRes] = useState<ExtendedViewDataReturnType>();
  const [burnFireScale, setBurnFireScale] = useState<string>("scale(0) translate(-13px, -15px)");
  const [burnFireGlow, setBurnFireGlow] = useState<number>(0);
  const [burnProgress, setBurnProgress] = useState(0);
  const [randomMeme, setRandomMeme] = useState<any>(Meme1);
  const tweetText = `url=https://explorer.itheum.io/getbitz?v=3&text=${viewDataRes?.data.gamePlayResult.bitsWon > 0 ? "I just played the Get <BiTz> XP Game on %23itheum and won " + viewDataRes?.data.gamePlayResult.bitsWon + " <BiTz> points 🙌!%0A%0APlay now and get your own <BiTz>! %23GetBiTz" : "Oh no, I got rugged getting <BiTz> points this time. Maybe you will have better luck?%0A%0ATry here to %23GetBiTz %23itheum %0A"}`;
  ///TODO add ?r=${address}
  const [usingReferralCode, setUsingReferralCode] = useState<string>("");
  // const tweetTextReferral = `url=https://explorer.itheum.io/getbitz?r=${address}&text=Join the %23itheum <BiTz> XP Game and be part of the %23web3 data ownership revolution.%0A%0AJoin via my referral link and get a bonus chance to win <BiTz> XP 🙌. Click below to %23GetBiTz!`;
  const { mvxNfts } = useNftsStore();

  // Game canvas related
  const [loadBlankGameCanvas, setLoadBlankGameCanvas] = useState<boolean>(false);

  // LeaderBoard related
  // const [leaderBoardAllTime, setLeaderBoardAllTime] = useState<LeaderBoardItemType[]>([]);
  // const [leaderBoardMonthly, setLeaderBoardMonthly] = useState<LeaderBoardItemType[]>([]);
  // const [leaderBoardMonthString, setLeaderBoardMonthString] = useState<string>("");
  // const [leaderBoardIsLoading, setLeaderBoardIsLoading] = useState<boolean>(false);
  // const [myRankOnAllTimeLeaderBoard, setMyRankOnAllTimeLeaderBoard] = useState<string>("-2");

  // Debug / Tests
  // const [bypassDebug, setBypassDebug] = useState<boolean>(false);
  const [inDateStringDebugMode, setInDateStringDebugMode] = useState<boolean>(false);

  const showErrorToast = (title: string) => {
    Toast({
      title,
      status: "error",
      isClosable: true,
    });
  };

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

  useEffect(() => {
    if (!hasPendingTransactions) {
      fetchGameDataNfts();
    }
  }, [hasPendingTransactions, address]);

  useEffect(() => {
    fetchMyNfts();
  }, [address, gameDataNFT]);

  useEffect(() => {
    if (!chainID) {
      return;
    }

    // is the player using a referral code?
    const searchParams = new URLSearchParams(window.location.search);
    const _referralCode = searchParams.get("r");

    if (_referralCode && _referralCode.trim().length > 5) {
      setUsingReferralCode(_referralCode.trim().toLowerCase());
    }

    // Load the LeaderBoards regardless on if the user has does not have the data nft in to entice them
    // fetchAndLoadLeaderBoards();
  }, [chainID]);

  useEffect(() => {
    setBurnFireScale(`scale(${burnProgress}) translate(-13px, -15px)`);
    setBurnFireGlow(burnProgress * 0.1);

    // we can sloe the burn by updating the value here...
    if (burnProgress === 25) {
      setIsMemeBurnHappening(false);
      playGame();
    }
  }, [burnProgress]);

  // useEffect(() => {
  //   // load my rank if i'm not in the visible leader board (e.g. I'm not in the top 20, so whats my rank?)
  //   if (address && leaderBoardAllTime.length > 0) {
  //     let playerRank = -1;

  //     for (let i = 0; i < leaderBoardAllTime.length; i++) {
  //       if (leaderBoardAllTime[i].playerAddr === address) {
  //         playerRank = i + 1;
  //         break;
  //       }
  //     }

  //     if (playerRank > -1) {
  //       setMyRankOnAllTimeLeaderBoard(playerRank.toString());
  //     } else {
  //       fetchAndLoadMyRankOnLeaderBoard();
  //     }
  //   }
  // }, [address, leaderBoardAllTime]);

  // first, we get the Data NFT details needed for this game (but not if the current user has it)
  async function fetchGameDataNfts() {
    setIsLoading(true);

    const _gameDataNFT = await DataNft.createFromApi(GET_BITZ_TOKEN);
    setGameDataNFT(_gameDataNFT);

    setIsLoading(false);
  }
  // secondly, we get the user's Data NFTs and flag if the user has the required Data NFT for the game in their wallet
  async function fetchMyNfts() {
    if (gameDataNFT) {
      //fetch only the required Data NFT for the game of the user
      const _dataNfts: DataNft[] = mvxNfts; // await getNftsOfACollectionForAnAddress(address, [GET_BITZ_TOKEN.tokenIdentifier], chainID);
      const hasRequiredDataNFT = _dataNfts.find((dNft: { tokenIdentifier: string }) => gameDataNFT.tokenIdentifier === dNft.tokenIdentifier);
      setHasGameDataNFT(hasRequiredDataNFT ? true : false);
      setCheckingIfHasGameDataNFT(false);

      setRandomMeme(MEME_IMGS[Math.floor(Math.random() * MEME_IMGS.length)]); // set a random meme as well
    }
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
    if (!(tokenLogin && tokenLogin.nativeAuthToken)) {
      throw Error("No Native Auth token");
    }

    if (!gameDataNFT) {
      showErrorToast("ER6: Game NFT Data is not loaded");
      return;
    }

    setIsFetchingDataMarshal(true);

    await sleep(5);

    const _fwdHeaderMapLookup: Record<string, string> = {
      "authorization": `Bearer ${tokenLogin.nativeAuthToken}`,
    };

    let _fwdHeaderKeys = "authorization";

    if (usingReferralCode !== "") {
      _fwdHeaderMapLookup["dmf-referral-code"] = usingReferralCode;
      _fwdHeaderKeys = "authorization, dmf-referral-code";
    }

    const viewDataArgs: Record<string, any> = {
      mvxNativeAuthOrigins: [decodeNativeAuthToken(tokenLogin.nativeAuthToken).origin],
      mvxNativeAuthMaxExpirySeconds: 3600,
      fwdHeaderMapLookup: _fwdHeaderMapLookup,
      fwdHeaderKeys: _fwdHeaderKeys,
    };

    const viewDataPayload: ExtendedViewDataReturnType | undefined = await viewData(viewDataArgs, gameDataNFT);

    if (viewDataPayload) {
      // let animation;
      // if (viewDataPayload.data.gamePlayResult.bitsWon > 0) {
      //   // if the user won something, then we should reload the LeaderBoards
      //   fetchAndLoadLeaderBoards();
      // }

      setGameDataFetched(true);
      setIsFetchingDataMarshal(false);
      setViewDataRes(viewDataPayload);

      updateCooldown(
        computeRemainingCooldown(
          Math.max(viewDataPayload.data.gamePlayResult.lastPlayedAndCommitted, viewDataPayload.data.gamePlayResult.lastPlayedBeforeThisPlay),
          viewDataPayload.data.gamePlayResult.configCanPlayEveryMSecs
        )
      );

      let sumScoreBitzBefore = viewDataPayload.data.gamePlayResult.bitsScoreBeforePlay || 0;
      sumScoreBitzBefore = sumScoreBitzBefore < 0 ? 0 : sumScoreBitzBefore;
      let sumScoreBitzAfter = viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay || 0;
      sumScoreBitzAfter = sumScoreBitzAfter < 0 ? 0 : sumScoreBitzAfter;
      let sumGivenBitz = viewDataPayload.data?.bitsMain?.bitsGivenSum || 0;
      sumGivenBitz = sumGivenBitz < 0 ? 0 : sumGivenBitz;
      let sumBonusBitz = viewDataPayload.data?.bitsMain?.bitsBonusSum || 0;
      sumBonusBitz = sumBonusBitz < 0 ? 0 : sumBonusBitz;
      if (viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay > -1) {
        updateBitzBalance(sumScoreBitzAfter + sumBonusBitz - sumGivenBitz); // won some bis, minus given bits and show
        // updateCollectedBitzSum(sumScoreBitzAfter);
      } else {
        updateBitzBalance(sumScoreBitzBefore + sumBonusBitz - sumGivenBitz); // did not win bits, minus given bits from current and show
        // updateCollectedBitzSum(sumScoreBitzBefore);
      }

      // how many bonus tries does the user have
      if (viewDataPayload.data.gamePlayResult.bonusTriesAfterThisPlay > -1) {
        updateBonusTries(viewDataPayload.data.gamePlayResult.bonusTriesAfterThisPlay);
      } else {
        updateBonusTries(viewDataPayload.data.gamePlayResult.bonusTriesBeforeThisPlay || 0);
      }
    } else {
      showErrorToast("ER2: Did not get a response from the game server");
      setIsFetchingDataMarshal(false);
    }
  }

  async function viewData(viewDataArgs: any, requiredDataNFT: DataNft) {
    try {
      if (!gameDataNFT) {
        showErrorToast("ER3: Game NFT Data is not loaded");
        return;
      }

      return viewDataJSONCore(viewDataArgs, requiredDataNFT);
    } catch (err) {
      console.error(err);
      showErrorToast((err as Error).message);
      setIsFetchingDataMarshal(false);

      return undefined;
    }
  }

  function goToMarketplace(tokenIdentifier: string) {
    window.open(`${MARKETPLACE_DETAILS_PAGE}${tokenIdentifier}`)?.focus();
  }

  function gamePlayImageSprites() {
    let _viewDataRes = viewDataRes;
    let _loadBlankGameCanvas = loadBlankGameCanvas;
    let _gameDataFetched = gameDataFetched;
    let _isFetchingDataMarshal = isFetchingDataMarshal;
    let _isMemeBurnHappening = isMemeBurnHappening;

    // user is not logged in, ask them to connect wallet
    if (!address) {
      return (
        <Link className="relative" to={"/"} state={{ from: location.pathname }}>
          <img
            className={cn("-z-1 relative z-5 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
            src={ImgLogin}
            alt="Connect your wallet to play"
          />
        </Link>
      );
    }

    // user is logged in and we are checking if they have the data nft to proceed with a play
    if ((address && checkingIfHasGameDataNFT && !hasGameDataNFT) || cooldown === -2) {
      return (
        <div className="relative">
          <img
            className={cn("-z-1 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
            src={ImgLoadingGame}
            alt="Checking if you have <BiTz> Data NFT"
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
            if (gameDataNFT) {
              goToMarketplace(gameDataNFT.tokenIdentifier);
            }
          }}>
          <img
            className={cn("z-5 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
            src={ImgGetDataNFT}
            alt="Get <BiTz> Data NFT from Data NFT Marketplace"
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
              setLoadBlankGameCanvas(true);
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
          {/* {!modalMode && _isMemeBurnHappening && <Torch />} */}
          <img
            className={cn("rounded-[3rem] w-full", _isMemeBurnHappening && !modalMode ? "cursor-none" : "", modalMode ? "rounded" : "")}
            src={ImgGameCanvas}
            alt={"Play Game"}
          />
          <div>
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
                    <p className="text-[16px] lg:text-xl">Welcome Back Itheum OG!</p>
                    <p className="text-[16px] mt-2 lg:text-xl lg:mt-5">
                      Ready to grab yourself some of them <span className="lg:text-3xl">🤤</span> {`<BiTz>`} points?
                    </p>
                    <p className="text-[18px] font-bold lg:text-2xl mt-5">
                      But the {`<BiTz>`} Generator God will need a Meme 🔥 Sacrifice from you to proceed!
                    </p>
                    <p className="text-[16px] font-bold mt-2 lg:mt-5 lg:text-xl">Click here when you are ready...</p>
                    <img className="w-[40px] m-auto" src={FingerPoint} alt={"Click to Start"} />{" "}
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
                  <img className="w-[160px] lg:w-[230px] m-auto" src={resultLoading} alt={"Result loading"} />{" "}
                </div>
              )}
            </div>

            {/* {!modalMode && spritLayerPointsCloud()} */}
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
                            className="z-1 bg-black text-white  rounded-3xl gap-2 flex flex-row justify-center items-center "
                            href={"https://twitter.com/intent/tweet?" + tweetText}
                            data-size="large"
                            target="_blank"
                            rel="noreferrer">
                            <span className=" [&>svg]:h-4 [&>svg]:w-4 z-10">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
                                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                              </svg>
                            </span>
                            <p className="z-10 ">Tweet</p>
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

          {/* {!modalMode && spritLayerPointsCloud()} */}
        </div>
      );
    }
  }

  function spritLayerPointsCloud() {
    return (
      <div className="flex flex-col justify-center items-center w-[200px] h-[100px] absolute top-[2%] left-[2%] rounded-[3rem] bg-slate-50 text-gray-950 p-[2rem] border border-primary/50">
        <p className="text-sm">Your {`<BiTz>`} Points</p>
        <p className="text-[1.5rem] font-bold mt-[2px]">{bitzBalance === -2 ? `...` : <>{bitzBalance === -1 ? "0" : `${bitzBalance}`}</>}</p>
      </div>
    );
  }

  // async function fetchAndLoadMyRankOnLeaderBoard() {
  //   const callConfig = {
  //     headers: {
  //       "fwd-tokenid": createNftId(GET_BITZ_TOKEN.tokenIdentifier, GET_BITZ_TOKEN.nonce),
  //     },
  //   };

  //   try {
  //     console.log("AXIOS CALL -----> xpGamePrivate/playerRankOnLeaderBoard");
  //     const { data } = await axios.get<any>(`${getApiWeb2Apps(chainID)}/datadexapi/xpGamePrivate/playerRankOnLeaderBoard?playerAddr=${address}`, callConfig);

  //     setMyRankOnAllTimeLeaderBoard(data.playerRank || "N/A");
  //   } catch (err) {
  //     const message = "Getting my rank on the all time leaderboard failed:" + (err as AxiosError).message;
  //     console.error(message);
  //   }
  // }

  return (
    <>
      {usingReferralCode !== "" && (
        <div className="p-1 text-lg font-bold border border-[#35d9fa] rounded-[1rem] mb-[1rem] text-center">
          You are playing with referral code {usingReferralCode}
        </div>
      )}

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
    </>
  );
};

/*
A utility method that we can use to get, parse and return data from the viewDataViaMVXNativeAuth method
*/
export async function viewDataJSONCore(viewDataArgs: any, requiredDataNFT: DataNft) {
  try {
    let res: any;
    res = await requiredDataNFT.viewDataViaMVXNativeAuth(viewDataArgs);
    // res = await __viewDataViaMVXNativeAuth(viewDataArgs); // FYI - DON NOT DELETE, UNTIL WE ARE READY TO MOVE TO STG!!!
    let blobDataType = BlobDataType.TEXT;

    if (!res.error) {
      if (res.contentType.search("application/json") >= 0) {
        res.data = JSON.parse(await (res.data as Blob).text());
      }

      const viewDataJSONPayload: ExtendedViewDataReturnType = {
        ...res,
        blobDataType,
      };

      return viewDataJSONPayload;
    } else {
      console.log("viewDataJSONCore threw catch error");
      console.error(res.error);

      return undefined;
    }
  } catch (err) {
    console.log("viewDataJSONCore threw catch error");
    console.error(err);

    return undefined;
  }
}
