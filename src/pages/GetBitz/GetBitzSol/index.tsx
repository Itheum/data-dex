import React, { useEffect, useState } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { confetti } from "@tsparticles/confetti";
// import { Container } from "@tsparticles/engine";
// import { fireworks } from "@tsparticles/fireworks";
// import bs58 from "bs58";
// import { motion } from "framer-motion";
// import { ArrowBigDownDash, Loader, MousePointerClick } from "lucide-react";
// import Countdown from "react-countdown";
// import { IS_DEVNET } from "appsConfig";

// // Image Layers
// import aladinRugg from "assets/img/getbitz/aladin.png";
// import FingerPoint from "assets/img/getbitz/finger-point.gif";
// import ImgGameCanvas from "assets/img/getbitz/getbitz-game-canvas.png";
// import ImgLoadingGame from "assets/img/getbitz/getbitz-loading.gif";
// import ImgLogin from "assets/img/getbitz/getbitz-login.gif";
// import ImgPlayGame from "assets/img/getbitz/getbitz-play.gif";

// // Memes
// import Meme1 from "assets/img/getbitz/memes/1.jpg";
// import Meme10 from "assets/img/getbitz/memes/10.jpg";
// import Meme11 from "assets/img/getbitz/memes/11.jpg";
// import Meme12 from "assets/img/getbitz/memes/12.jpg";
// import Meme13 from "assets/img/getbitz/memes/13.jpg";
// import Meme14 from "assets/img/getbitz/memes/14.jpg";
// import Meme15 from "assets/img/getbitz/memes/15.jpg";
// import Meme16 from "assets/img/getbitz/memes/16.jpg";
// import Meme17 from "assets/img/getbitz/memes/17.jpg";
// import Meme18 from "assets/img/getbitz/memes/18.jpg";
// import Meme19 from "assets/img/getbitz/memes/19.jpg";
// import Meme2 from "assets/img/getbitz/memes/2.jpg";
// import Meme20 from "assets/img/getbitz/memes/20.jpg";
// import Meme21 from "assets/img/getbitz/memes/21.jpg";
// import Meme22 from "assets/img/getbitz/memes/22.jpg";
// import Meme23 from "assets/img/getbitz/memes/23.jpg";
// import Meme24 from "assets/img/getbitz/memes/24.jpg";
// import Meme25 from "assets/img/getbitz/memes/25.jpg";
// import Meme26 from "assets/img/getbitz/memes/26.jpg";
// import Meme3 from "assets/img/getbitz/memes/3.jpg";
// import Meme4 from "assets/img/getbitz/memes/4.jpg";
// import Meme5 from "assets/img/getbitz/memes/5.jpg";
// import Meme6 from "assets/img/getbitz/memes/6.jpg";
// import Meme7 from "assets/img/getbitz/memes/7.jpg";
// import Meme8 from "assets/img/getbitz/memes/8.jpg";
// import Meme9 from "assets/img/getbitz/memes/9.jpg";

// import resultLoading from "assets/img/getbitz/pixel-loading.gif";
// import { SUPPORTED_SOL_COLLECTIONS } from "config";
// import { HoverBorderGradient } from "libComponents/animated/HoverBorderGradient";
// import { itheumSolPreaccess, itheumSolViewData } from "libs/sol/SolViewData";
// import { BlobDataType } from "libs/types";
// import { cn, getApiWeb2Apps, scrollToSection, shortenAddress, sleep } from "libs/utils";
// import { computeRemainingCooldown } from "libs/utils/functions";
// import { useAccountStore } from "store/account";
// import { useNftsStore } from "store/nfts";
// import useSolBitzStore from "store/solBitz";
// import GiveBitzBase from "./GiveBitzBase";
// import ImgGetDataNFT from "../../../../assets/img/getbitz/getbitz-get-datanft-v2.gif";
// import { BurningImage } from "../common/BurningImage";
// import Faq from "../common/Faq";
// import { BIT_GAME_TOP_LEADER_BOARD_GROUP, LeaderBoardItemType } from "../common/interfaces";
// import LeaderBoardTable from "../common/LeaderBoardTable";
// import Torch from "../common/Torch";

// const MEME_IMGS = [
//   Meme1,
//   Meme2,
//   Meme3,
//   Meme4,
//   Meme5,
//   Meme6,
//   Meme7,
//   Meme8,
//   Meme9,
//   Meme10,
//   Meme11,
//   Meme12,
//   Meme13,
//   Meme14,
//   Meme15,
//   Meme16,
//   Meme17,
//   Meme18,
//   Meme19,
//   Meme20,
//   Meme21,
//   Meme22,
//   Meme23,
//   Meme24,
//   Meme25,
//   Meme26,
// ];

const GetBitzSol = (props: any) => {
  return <div>GetBitzSol</div>;
  // const { modalMode } = props;
  // const { publicKey, signMessage } = useWallet();
  // const address = publicKey?.toBase58();
  // const [checkingIfHasGameDataNFT, setCheckingIfHasGameDataNFT] = useState<boolean>(true);
  // const [hasGameDataNFT, setHasGameDataNFT] = useState<boolean>(false);
  // const [showMessage, setShowMessage] = useState<boolean>(true);
  // const { solNfts } = useNftsStore();
  // const [nfts, setNfts] = useState(
  //   IS_DEVNET ? solNfts.filter((nft) => nft.content.metadata.name.includes("XP")) : solNfts.filter((nft) => nft.content.metadata.name.includes("IXPG2"))
  // );
  // const { setVisible } = useWalletModal();
  // // store based state
  // const bitzStore = useSolBitzStore();
  // const cooldown = bitzStore.cooldown;
  // const bitzBalance = bitzStore.bitzBalance;
  // const bonusBitzSum = bitzStore.bonusBitzSum;
  // const collectedBitzSum = bitzStore.collectedBitzSum;
  // const populatedBitzStore = bitzStore.populatedBitzStore;
  // const updateBitzBalance = bitzStore.updateBitzBalance;
  // const updateCooldown = bitzStore.updateCooldown;
  // const updateCollectedBitzSum = bitzStore.updateCollectedBitzSum;
  // const updateGivenBitzSum = bitzStore.updateGivenBitzSum;
  // const updateBonusBitzSum = bitzStore.updateBonusBitzSum;
  // const updateBonusTries = bitzStore.updateBonusTries;
  // const updatePopulatedBitzStore = bitzStore.updatePopulatedBitzStore;
  // const solPreaccessNonce = useAccountStore((state: any) => state.solPreaccessNonce);
  // const solPreaccessSignature = useAccountStore((state: any) => state.solPreaccessSignature);
  // const solPreaccessTimestamp = useAccountStore((state: any) => state.solPreaccessTimestamp);
  // const updateSolPreaccessNonce = useAccountStore((state: any) => state.updateSolPreaccessNonce);
  // const updateSolPreaccessTimestamp = useAccountStore((state: any) => state.updateSolPreaccessTimestamp);
  // const updateSolSignedPreaccess = useAccountStore((state: any) => state.updateSolSignedPreaccess);
  // // a single game-play related (so we have to reset these if the user wants to "replay")
  // const [isFetchingDataMarshal, setIsFetchingDataMarshal] = useState<boolean>(false);
  // const [isMemeBurnHappening, setIsMemeBurnHappening] = useState<boolean>(false);
  // const [gameDataFetched, setGameDataFetched] = useState<boolean>(false);
  // const [viewDataRes, setViewDataRes] = useState<any>();
  // const [burnFireScale, setBurnFireScale] = useState<string>("scale(0) translate(-13px, -15px)");
  // const [burnFireGlow, setBurnFireGlow] = useState<number>(0);
  // const [burnProgress, setBurnProgress] = useState(0);
  // const [randomMeme, setRandomMeme] = useState<any>(Meme1);
  // const tweetText = `url=https://explorer.itheum.io/getbitz?v=3&text=${viewDataRes?.data.gamePlayResult.bitsWon > 0 ? "I just played the Get <BiTz> XP Game on %23itheum and won " + viewDataRes?.data.gamePlayResult.bitsWon + " <BiTz> points 🙌!%0A%0APlay now and get your own <BiTz>! %23GetBiTz %23DRiP %23Solana" : "Oh no, I got rugged getting <BiTz> points this time. Maybe you will have better luck?%0A%0ATry here to %23GetBiTz %23itheum %0A"}`;
  // ///TODO add ?r=${address}
  // const [usingReferralCode, setUsingReferralCode] = useState<string>("");
  // // const tweetTextReferral = `url=https://explorer.itheum.io/getbitz?r=${address}&text=Join the %23itheum <BiTz> XP Game and be part of the %23web3 data ownership revolution.%0A%0AJoin via my referral link and get a bonus chance to win <BiTz> XP 🙌. Click below to %23GetBiTz!`;
  // // Game canvas related
  // const [loadBlankGameCanvas, setLoadBlankGameCanvas] = useState<boolean>(false);
  // // LeaderBoard related
  // const [leaderBoardAllTime, setLeaderBoardAllTime] = useState<LeaderBoardItemType[]>([]);
  // const [leaderBoardMonthly, setLeaderBoardMonthly] = useState<LeaderBoardItemType[]>([]);
  // const [leaderBoardMonthString, setLeaderBoardMonthString] = useState<string>("");
  // const [leaderBoardIsLoading, setLeaderBoardIsLoading] = useState<boolean>(false);
  // const [myRankOnAllTimeLeaderBoard, setMyRankOnAllTimeLeaderBoard] = useState<string>("-2");
  // // Debug / Tests
  // // const [bypassDebug, setBypassDebug] = useState<boolean>(false);
  // const [inDateStringDebugMode, setInDateStringDebugMode] = useState<boolean>(false);
  // useEffect(() => {
  //   if (publicKey) {
  //     setNfts(
  //       IS_DEVNET ? solNfts.filter((nft) => nft.content.metadata.name.includes("XP")) : solNfts.filter((nft) => nft.content.metadata.name.includes("IXPG2"))
  //     );
  //   }
  // }, [publicKey, solNfts]);
  // useEffect(() => {
  //   if (nfts === undefined) return;
  //   if (!populatedBitzStore) {
  //     if (publicKey && nfts.length > 0) {
  //       updateBitzBalance(-2);
  //       updateCooldown(-2);
  //       updateGivenBitzSum(-2);
  //       updateCollectedBitzSum(-2);
  //       updatePopulatedBitzStore(true);
  //       const viewDataArgs = {
  //         headers: {
  //           "dmf-custom-only-state": "1",
  //         },
  //         fwdHeaderKeys: ["dmf-custom-only-state"],
  //       };
  //       (async () => {
  //         const getBitzGameResult = await viewData(viewDataArgs, nfts[0]);
  //         if (getBitzGameResult) {
  //           const bitzBeforePlay = getBitzGameResult.data.gamePlayResult.bitsScoreBeforePlay || 0;
  //           const sumGivenBits = getBitzGameResult.data?.bitsMain?.bitsGivenSum || 0;
  //           const sumBonusBitz = getBitzGameResult.data?.bitsMain?.bitsBonusSum || 0;
  //           if (sumGivenBits > 0) {
  //             updateBitzBalance(bitzBeforePlay + sumBonusBitz - sumGivenBits); // collected bits - given bits
  //             updateGivenBitzSum(sumGivenBits); // given bits -- for power-ups
  //             updateBonusBitzSum(sumBonusBitz);
  //           }
  //           updateCooldown(
  //             computeRemainingCooldown(
  //               getBitzGameResult.data.gamePlayResult.lastPlayedBeforeThisPlay,
  //               getBitzGameResult.data.gamePlayResult.configCanPlayEveryMSecs
  //             )
  //           );
  //           updateCollectedBitzSum(getBitzGameResult.data.gamePlayResult.bitsScoreBeforePlay); // collected bits by playing
  //           updateBonusTries(getBitzGameResult.data.gamePlayResult.bonusTriesBeforeThisPlay || 0); // bonus tries awarded to user (currently only via referral code rewards)
  //         }
  //       })();
  //     } else {
  //       updateBitzBalance(-1);
  //       updateGivenBitzSum(-1);
  //       updateCooldown(-1);
  //       updateCollectedBitzSum(-1);
  //       if (!address) {
  //         updatePopulatedBitzStore(false);
  //       }
  //     }
  //   } else {
  //     if (!address) {
  //       updatePopulatedBitzStore(false);
  //     }
  //   }
  // }, [publicKey, nfts, populatedBitzStore]);
  // useEffect(() => {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: "smooth",
  //   });
  //   const timeout = setTimeout(() => {
  //     setShowMessage(false);
  //   }, 3000);
  //   return () => clearTimeout(timeout);
  // }, []);
  // useEffect(() => {
  //   checkIfHasGameDataNft();
  // }, [address, nfts]);
  // useEffect(() => {
  //   // is the player using a referral code?
  //   const searchParams = new URLSearchParams(window.location.search);
  //   const _referralCode = searchParams.get("r");
  //   if (_referralCode && _referralCode.trim().length > 5) {
  //     setUsingReferralCode(_referralCode.trim().toLowerCase());
  //   }
  //   // Load the LeaderBoards regardless on if the user has does not have the data nft in to entice them
  //   fetchAndLoadLeaderBoards();
  // }, [nfts]);
  // useEffect(() => {
  //   setBurnFireScale(`scale(${burnProgress}) translate(-13px, -15px)`);
  //   setBurnFireGlow(burnProgress * 0.1);
  //   if (burnProgress === 10) {
  //     setIsMemeBurnHappening(false);
  //     playGame();
  //   }
  // }, [burnProgress]);
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
  // // secondly, we get the user's Data NFTs and flag if the user has the required Data NFT for the game in their wallet
  // async function checkIfHasGameDataNft() {
  //   const _dataNfts = nfts;
  //   const hasRequiredDataNFT = _dataNfts && _dataNfts.length > 0;
  //   setHasGameDataNFT(hasRequiredDataNFT ? true : false);
  //   setCheckingIfHasGameDataNFT(false);
  //   setRandomMeme(MEME_IMGS[Math.floor(Math.random() * MEME_IMGS.length)]); // set a random meme as well
  // }
  // // have to reset all "single game-play related" (see above)
  // function resetToStartGame() {
  //   setIsFetchingDataMarshal(false);
  //   setIsMemeBurnHappening(false);
  //   setGameDataFetched(false);
  //   setBurnProgress(0);
  //   setViewDataRes(undefined);
  //   setBurnFireScale("scale(0) translate(-13px, -15px)");
  //   setBurnFireGlow(0);
  //   setRandomMeme(MEME_IMGS[Math.floor(Math.random() * MEME_IMGS.length)]); // set a random meme as well
  // }
  // async function playGame() {
  //   setIsFetchingDataMarshal(true);
  //   await sleep(5);
  //   const viewDataArgs: Record<string, any> = {
  //     headers: {},
  //     fwdHeaderKeys: [],
  //   };
  //   if (usingReferralCode !== "") {
  //     viewDataArgs.headers["dmf-referral-code"] = usingReferralCode;
  //     viewDataArgs.fwdHeaderKeys.push("dmf-referral-code");
  //   }
  //   const viewDataPayload = await viewData(viewDataArgs, nfts[0]);
  //   if (viewDataPayload) {
  //     let animation;
  //     if (viewDataPayload.data.gamePlayResult.bitsWon > 0) {
  //       if (viewDataPayload.data.gamePlayResult.userWonMaxBits === 1) {
  //         animation = await fireworks({
  //           background: "transparent",
  //           sounds: true,
  //         });
  //       } else {
  //         animation = await confetti({
  //           spread: 360,
  //           ticks: 100,
  //           gravity: 0,
  //           decay: 0.94,
  //           startVelocity: 30,
  //           particleCount: 200,
  //           scalar: 2,
  //           shapes: ["emoji"],
  //           shapeOptions: {
  //             emoji: {
  //               value: ["🤲🏼", "💎", "🤲🏼", "💎", "🎊", "🐸", "🐸", "🐸", "🐸", "🐹", "🐹"],
  //             },
  //           },
  //         });
  //       }
  //       // if the user won something, then we should reload the LeaderBoards
  //       fetchAndLoadLeaderBoards();
  //     }
  //     setGameDataFetched(true);
  //     setIsFetchingDataMarshal(false);
  //     setViewDataRes(viewDataPayload);
  //     updateCooldown(
  //       computeRemainingCooldown(
  //         Math.max(viewDataPayload.data.gamePlayResult.lastPlayedAndCommitted, viewDataPayload.data.gamePlayResult.lastPlayedBeforeThisPlay),
  //         viewDataPayload.data.gamePlayResult.configCanPlayEveryMSecs
  //       )
  //     );
  //     const sumBitzBalance = viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay || 0;
  //     const sumBonusBitz = viewDataPayload.data?.bitsMain?.bitsBonusSum || 0;
  //     const sumGivenBits = viewDataPayload.data?.bitsMain?.bitsGivenSum || 0;
  //     if (viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay > -1) {
  //       updateBitzBalance(sumBitzBalance + sumBonusBitz - sumGivenBits); // won some bis, minus given bits and show
  //       updateCollectedBitzSum(viewDataPayload.data.gamePlayResult.bitsScoreAfterPlay);
  //     } else {
  //       updateBitzBalance(viewDataPayload.data.gamePlayResult.bitsScoreBeforePlay + sumBonusBitz - sumGivenBits); // did not win bits, minus given bits from current and show
  //       updateCollectedBitzSum(viewDataPayload.data.gamePlayResult.bitsScoreBeforePlay);
  //     }
  //     // how many bonus tries does the user have
  //     if (viewDataPayload.data.gamePlayResult.bonusTriesAfterThisPlay > -1) {
  //       updateBonusTries(viewDataPayload.data.gamePlayResult.bonusTriesAfterThisPlay);
  //     } else {
  //       updateBonusTries(viewDataPayload.data.gamePlayResult.bonusTriesBeforeThisPlay || 0);
  //     }
  //     if (animation) {
  //       await sleep(10);
  //       animation.stop();
  //       // if its confetti, then we have to destroy it
  //       if ((animation as unknown as Container).destroy) {
  //         (animation as unknown as Container).destroy();
  //       }
  //     }
  //   } else {
  //     setIsFetchingDataMarshal(false);
  //   }
  // }
  // async function viewData(viewDataArgs: any, requiredDataNFT: any) {
  //   try {
  //     let usedPreAccessNonce = solPreaccessNonce;
  //     let usedPreAccessSignature = solPreaccessSignature;
  //     if (solPreaccessSignature === "" || solPreaccessTimestamp === -2 || solPreaccessTimestamp + 60 * 80 * 1000 < Date.now()) {
  //       const preAccessNonce = await itheumSolPreaccess();
  //       const message = new TextEncoder().encode(preAccessNonce);
  //       if (signMessage === undefined) throw new Error("signMessage is undefiend");
  //       const signature = await signMessage(message);
  //       if (!preAccessNonce || !signature || !publicKey) throw new Error("Missing data for viewData");
  //       const encodedSignature = bs58.encode(signature);
  //       updateSolPreaccessNonce(preAccessNonce);
  //       updateSolSignedPreaccess(encodedSignature);
  //       updateSolPreaccessTimestamp(Date.now());
  //       usedPreAccessNonce = preAccessNonce;
  //       usedPreAccessSignature = encodedSignature;
  //     }
  //     if (!publicKey) throw new Error("Missing data for viewData");
  //     const res = await itheumSolViewData(
  //       requiredDataNFT.id,
  //       usedPreAccessNonce,
  //       usedPreAccessSignature,
  //       publicKey,
  //       viewDataArgs.fwdHeaderKeys,
  //       viewDataArgs.headers
  //     );
  //     const rest = await res.json();
  //     let blobDataType = BlobDataType.TEXT;
  //     let data;
  //     if (res.ok) {
  //       const contentType = res.headers.get("content-type");
  //       if (contentType && contentType.includes("application/json")) {
  //         data = rest;
  //       }
  //       return { data, blobDataType, contentType };
  //     } else {
  //       console.log("viewData threw catch error");
  //       console.error(res.statusText);
  //       return undefined;
  //     }
  //   } catch (err) {
  //     setIsFetchingDataMarshal(false);
  //     return undefined;
  //   }
  // }
  // function gamePlayImageSprites() {
  //   let _viewDataRes = viewDataRes;
  //   let _loadBlankGameCanvas = loadBlankGameCanvas;
  //   let _gameDataFetched = gameDataFetched;
  //   let _isFetchingDataMarshal = isFetchingDataMarshal;
  //   let _isMemeBurnHappening = isMemeBurnHappening;
  //   if (!address) {
  //     return (
  //       <img
  //         onClick={() => {
  //           setVisible(true);
  //         }}
  //         className={cn("-z-1 relative z-5 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
  //         src={ImgLogin}
  //         alt={"Connect your wallet to play"}
  //       />
  //     );
  //   }
  //   if ((address && checkingIfHasGameDataNFT && !hasGameDataNFT) || cooldown === -2) {
  //     return (
  //       <div className="relative">
  //         <img
  //           className={cn("-z-1 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
  //           src={ImgLoadingGame}
  //           alt={"Checking if you have <BiTz> Data NFT"}
  //         />
  //       </div>
  //     );
  //   }
  //   // user is logged in does not have the data nft, so take them to the marketplace
  //   if (address && !checkingIfHasGameDataNFT && !hasGameDataNFT) {
  //     return (
  //       <div
  //         className="relative"
  //         onClick={() => {
  //           if (
  //             confirm(
  //               "Get BiTz XP Data NFTs from the Tensor NFT Marketplace.\n\nWe will now take you to the Tensor Marketplace, just filter the collection and select any NFT with the Trait - 'itheum.io/getxp'.\n\nThese Data NFTs will then let you play this BiTz XP game and collect XP.\n\n Make sure you enable popups in your browser now"
  //             ) == true
  //           ) {
  //             window.open("https://www.tensor.trade/trade/itheum_drip")?.focus();
  //           }
  //         }}>
  //         <img
  //           className={cn("z-5 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
  //           src={ImgGetDataNFT}
  //           alt={"Get <BiTz> Data NFT from Data NFT Marketplace"}
  //         />
  //       </div>
  //     );
  //   }
  //   const CountDownComplete = () => (
  //     <div
  //       className="cursor-pointer relative inline-flex h-12 overflow-hidden rounded-full p-[1px] "
  //       onClick={() => {
  //         resetToStartGame();
  //       }}>
  //       <span className="absolute hover:bg-[#35d9fa] inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF03,#45d4ff_50%,#111111_50%)]" />
  //       <span className="text-primary inline-flex h-full hover:bg-gradient-to-tl from-background to-[#35d9fa] w-full cursor-pointer items-center justify-center rounded-full bg-background px-3 py-1 text-sm font-medium   backdrop-blur-3xl">
  //         RIGHT NOW! Try again <MousePointerClick className="ml-2 text-[#35d9fa]" />
  //       </span>
  //     </div>
  //   );
  //   // Renderer callback with condition
  //   const countdownRenderer = (props: { hours: number; minutes: number; seconds: number; completed: boolean }) => {
  //     if (props.completed) {
  //       // Render a complete state
  //       return <CountDownComplete />;
  //     } else {
  //       // Render a countdown
  //       return (
  //         <span>
  //           {props.hours > 0 ? <>{`${props.hours} ${props.hours === 1 ? " Hour " : " Hours "}`}</> : ""}
  //           {props.minutes > 0 ? props.minutes + " Min " : ""} {props.seconds} Sec
  //         </span>
  //       );
  //     }
  //   };
  //   // user has data nft, so load the "start game" view
  //   if (!_loadBlankGameCanvas && !_isFetchingDataMarshal) {
  //     return (
  //       <div className="relative">
  //         {cooldown > 0 && (
  //           <Countdown
  //             className="mx-auto text-3"
  //             date={cooldown}
  //             renderer={(props: { hours: number; minutes: number; seconds: number; completed: boolean }) => {
  //               if (props.completed) {
  //                 return <> </>;
  //               } else {
  //                 return (
  //                   <div className={cn("absolute z-5 w-full h-full rounded-[3rem] bg-black/90", modalMode ? "rounded" : "")}>
  //                     <div className="flex w-full h-full items-center justify-center">
  //                       <div className="text-3xl md:text-5xl flex flex-col items-center justify-center text-white ">
  //                         <p className="my-4 text-xl md:text-3xl "> You can play again in: </p>{" "}
  //                         {props.hours > 0 ? <>{`${props.hours} ${props.hours === 1 ? " Hour " : " Hours "}`}</> : ""}
  //                         {props.minutes > 0 ? props.minutes + " Min " : ""} {props.seconds} Sec
  //                       </div>
  //                     </div>
  //                   </div>
  //                 );
  //               }
  //             }}
  //           />
  //         )}
  //         <img
  //           onClick={() => {
  //             if (address) {
  //               setLoadBlankGameCanvas(true);
  //             }
  //           }}
  //           className={cn("rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
  //           src={ImgPlayGame}
  //           alt={"Start Game"}
  //         />
  //       </div>
  //     );
  //   }
  //   // user clicked on the start game view, so load the empty blank game canvas
  //   if (_loadBlankGameCanvas && !_gameDataFetched) {
  //     return (
  //       <div className="relative overflow-hidden">
  //         {!modalMode && _isMemeBurnHappening && <Torch />}
  //         <img
  //           className={cn("rounded-[3rem] w-full", _isMemeBurnHappening && !modalMode ? "cursor-none" : "", modalMode ? "rounded" : "")}
  //           src={ImgGameCanvas}
  //           alt={"Play Game"}
  //         />
  //         <div
  //           className={cn(
  //             "select-none flex justify-center items-center mt-[2rem] w-[100%] h-[350px] md:h-[400px] rounded-[3rem] bg-slate-50 text-gray-950 p-[2rem] border border-primary/50 static lg:absolute lg:pb-[.5rem] lg:w-[500px] lg:h-[420px] lg:mt-0 lg:top-[40%] lg:left-[50%] lg:-translate-x-1/2 lg:-translate-y-1/2",
  //             _isMemeBurnHappening && !modalMode ? "cursor-none" : "",
  //             modalMode ? "scale-75 !mt-[35px]" : ""
  //           )}>
  //           {(!_isFetchingDataMarshal && !_isMemeBurnHappening && (
  //             <>
  //               <div
  //                 className="text-center text-xl text-gray-950 text-foreground cursor-pointer"
  //                 onClick={() => {
  //                   setIsMemeBurnHappening(true);
  //                 }}>
  //                 <p className="lg:text-md">Welcome Back Itheum OG!</p>
  //                 <p className="lg:text-md mt-2 lg:mt-5">
  //                   Ready to grab yourself some of them <span className=" lg:text-3xl">🤤</span> {`<BiTz>`} points?
  //                 </p>
  //                 <p className="font-bold lg:text-2xl mt-5">But the {`<BiTz>`} Generator God will need a Meme 🔥 Sacrifice from you to proceed!</p>
  //                 <p className="font-bold mt-2 lg:mt-5">Click here when you are ready...</p>
  //                 <img className="w-[40px] m-auto" src={FingerPoint} alt={"Click to Start"} />
  //               </div>
  //             </>
  //           )) ||
  //             null}
  //           {_isMemeBurnHappening && (
  //             <div
  //               className={cn("z-10 relative cursor-none select-none p-8", modalMode ? "cursor-pointer" : "")}
  //               onClick={() => {
  //                 setBurnProgress((prev) => prev + 1);
  //               }}>
  //               <p className="text-center text-md text-gray-950 text-foreground lg:text-xl ">Light up this Meme Sacrifice!</p>
  //               <p className="text-gray-950 text-sm text-center mb-[1rem]">Click to burn</p>
  //               <BurningImage src={randomMeme} burnProgress={burnProgress} modalMode={modalMode} />
  //               <div className="glow" style={{ opacity: burnFireGlow }}></div>
  //               <div className="flame !top-[125px] lg:!top-[90px]" style={{ transform: burnFireScale }}></div>
  //             </div>
  //           )}
  //           {_isFetchingDataMarshal && (
  //             <div>
  //               <p className="text-center text-md text-gray-950 text-foreground lg:text-xl mb-[1rem]">
  //                 Did the {`<BiTz>`} Generator God like that Meme Sacrifice? Only time will tell...
  //               </p>
  //               <p className="text-gray-950 text-sm text-center mb-[1rem]">Hang tight, result incoming</p>
  //               <img className="w-[160px] lg:w-[230px] m-auto" src={resultLoading} alt={"Result loading"} />
  //             </div>
  //           )}
  //         </div>
  //         {!modalMode && spritLayerPointsCloud()}
  //       </div>
  //     );
  //   }
  //   // we got the response from the game play
  //   if (_loadBlankGameCanvas && !_isFetchingDataMarshal && _gameDataFetched) {
  //     return (
  //       <div className="relative overflow-hidden">
  //         <img className={cn("rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")} src={ImgGameCanvas} alt={"Get <BiTz> Points"} />
  //         <div
  //           className={cn(
  //             "flex justify-center items-center mt-[2rem] w-[100%] h-[350px] rounded-[3rem] bg-slate-50 text-gray-950 p-[1rem] border border-primary/50 static lg:absolute lg:p-[2rem] lg:pb-[.5rem] lg:w-[500px] lg:h-[400px] lg:mt-0 lg:top-[40%] lg:left-[50%] lg:-translate-x-1/2 lg:-translate-y-1/2",
  //             modalMode ? "scale-75 !mt-[35px]" : ""
  //           )}>
  //           {_viewDataRes && !_viewDataRes.error && (
  //             <>
  //               {_viewDataRes.data.gamePlayResult.triedTooSoonTryAgainInMs > 0 && (
  //                 <div>
  //                   <p className="text-2xl text-center">You FOMOed in too fast, try again in:</p>
  //                   <div className="text-2xl text-center mt-[2rem]">
  //                     <Countdown date={Date.now() + _viewDataRes.data.gamePlayResult.triedTooSoonTryAgainInMs} renderer={countdownRenderer} />
  //                   </div>
  //                 </div>
  //               )}
  //               {_viewDataRes.data.gamePlayResult.triedTooSoonTryAgainInMs === -1 && (
  //                 <div className="flex flex-col justify-around h-[100%] items-center text-center">
  //                   {_viewDataRes.data.gamePlayResult.bitsWon === 0 && (
  //                     <>
  //                       <div className="z-[25]">
  //                         <p className="text-2xl">OPPS! Aladdin Rugged You! 0 Points this Time...</p>
  //                         <motion.img
  //                           className="w-[150px] md:w-[180px] lg:w-[210px] xl:w-full absolute z-[25]"
  //                           src={aladinRugg}
  //                           initial={{ x: -750, y: 0 }}
  //                           animate={{
  //                             scale: [0.5, 1, 1, 0.5],
  //                             rotate: [0, 0, -360, -360, -360, -360],
  //                             opacity: [0.8, 1, 1, 1, 1, 1, 1, 0],
  //                             x: [-750, 0, 200, 1000],
  //                           }}
  //                           transition={{ duration: 8 }}
  //                         />
  //                       </div>
  //                       <div className="bg-black rounded-full p-[1px] -z-1 ">
  //                         <HoverBorderGradient className="-z-1">
  //                           <a
  //                             className="z-1 bg-black text-white  rounded-3xl gap-2 flex flex-row justify-center items-center"
  //                             href={"https://twitter.com/intent/tweet?" + tweetText}
  //                             data-size="large"
  //                             target="_blank">
  //                             <span className=" [&>svg]:h-4 [&>svg]:w-4 z-10">
  //                               <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
  //                                 <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
  //                               </svg>
  //                             </span>
  //                             <p className="z-10">Tweet</p>
  //                           </a>
  //                         </HoverBorderGradient>
  //                       </div>
  //                     </>
  //                   )}
  //                   {(_viewDataRes.data.gamePlayResult.bitsWon > 0 && (
  //                     <>
  //                       <p className="text-2xl text-gray-950">w👀t! w👀t! You have won:</p>
  //                       <p className="text-4xl mt-[2rem] text-gray-950">
  //                         {_viewDataRes.data.gamePlayResult.bitsWon} {` <BiTz>`}
  //                       </p>
  //                       <div className="bg-black rounded-full p-[1px]">
  //                         <HoverBorderGradient>
  //                           <a
  //                             className=" bg-black text-white  rounded-3xl gap-2 flex flex-row justify-center items-center"
  //                             href={"https://twitter.com/intent/tweet?" + tweetText}
  //                             data-size="large"
  //                             target="_blank">
  //                             <span className="[&>svg]:h-4 [&>svg]:w-4">
  //                               <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 512 512">
  //                                 <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
  //                               </svg>
  //                             </span>
  //                             Tweet
  //                           </a>
  //                         </HoverBorderGradient>
  //                       </div>
  //                     </>
  //                   )) ||
  //                     null}
  //                   {(((_viewDataRes.data.gamePlayResult.bonusTriesBeforeThisPlay > 0 && _viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay === -1) ||
  //                     _viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay > 0) && (
  //                     <div className="text-center mt-[2rem]">
  //                       <p className="text-xl">
  //                         BONUS GAMES AVAILABLE! w👀t! your referrals have earned you{" "}
  //                         {_viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay > 0
  //                           ? _viewDataRes.data.gamePlayResult.bonusTriesAfterThisPlay
  //                           : _viewDataRes.data.gamePlayResult.bonusTriesBeforeThisPlay}{" "}
  //                         more bonus tries!
  //                       </p>
  //                       <div
  //                         className="cursor-pointer relative inline-flex h-12 overflow-hidden rounded-full p-[1px] "
  //                         onClick={() => {
  //                           resetToStartGame();
  //                         }}>
  //                         <span className="absolute hover:bg-sky-300 inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF03,#45d4ff_50%,#111111_50%)]" />
  //                         <span className="text-primary inline-flex h-full hover:bg-gradient-to-tl from-background to-sky-300 w-full cursor-pointer items-center justify-center rounded-full bg-background px-3 py-1 text-sm font-medium backdrop-blur-3xl">
  //                           PLAY AGAIN! <MousePointerClick className="ml-2 text-sky-300" />
  //                         </span>
  //                       </div>
  //                     </div>
  //                   )) || (
  //                     <div className="text-center mt-[2rem]">
  //                       <p className="text-xl">You can try again in:</p>
  //                       <div className="text-2xl mt-[1rem]">
  //                         <Countdown date={Date.now() + _viewDataRes.data.gamePlayResult.configCanPlayEveryMSecs} renderer={countdownRenderer} />
  //                       </div>
  //                     </div>
  //                   )}
  //                 </div>
  //               )}
  //             </>
  //           )}
  //         </div>
  //         {!modalMode && spritLayerPointsCloud()}
  //       </div>
  //     );
  //   }
  // }
  // function spritLayerPointsCloud() {
  //   return (
  //     <div className="flex flex-col justify-center items-center w-[200px] h-[100px] absolute top-[2%] left-[2%] rounded-[3rem] bg-slate-50 text-gray-950 p-[2rem] border border-primary/50">
  //       <p className="text-sm">Your {`<BiTz>`} Points</p>
  //       <p className="text-[1.5rem] font-bold mt-[2px]">{bitzBalance === -2 ? `...` : <>{bitzBalance === -1 ? "0" : `${bitzBalance}`}</>}</p>
  //     </div>
  //   );
  // }
  // async function fetchAndLoadLeaderBoards() {
  //   setLeaderBoardIsLoading(true);
  //   const callConfig = {
  //     headers: {
  //       "fwd-tokenid": SUPPORTED_SOL_COLLECTIONS[0],
  //     },
  //   };
  //   const nowDateObj = new Date();
  //   let UTCMonth = nowDateObj.getUTCMonth() + 1; // can returns vals 1 - 12
  //   let UTCMonthStr = UTCMonth.toString();
  //   if (UTCMonth < 10) {
  //     UTCMonthStr = "0" + UTCMonthStr; // make 1 = 01 ... 9 = 09 etc
  //   }
  //   const UTCYear = nowDateObj.getUTCFullYear().toString().slice(-2); // converts number 2024 to string 24
  //   let MMYYString = `${UTCMonthStr}_${UTCYear}`;
  //   // S: for TESTING monthly leaderboards, allow a param override!
  //   const searchParams = new URLSearchParams(window.location.search);
  //   const _overrideMMYYString = searchParams.get("x-test-custom-mmyy-string"); // should be like this 03_24
  //   if (_overrideMMYYString && _overrideMMYYString.length === 5 && _overrideMMYYString.indexOf("_") === 2) {
  //     MMYYString = _overrideMMYYString;
  //     setInDateStringDebugMode(true);
  //   }
  //   // E: for TESTING monthly leaderboards, allow a param override!
  //   setLeaderBoardMonthString(MMYYString);
  //   // Get All Time leaderboard
  //   try {
  //     // S: ACTUAL LOGIC
  //     console.log("GET CALL -----> xpGamePrivate/leaderBoard");
  //     const res = await fetch(`${getApiWeb2Apps()}/datadexapi/xpGamePrivate/leaderBoard`, callConfig);
  //     const data = (await res.json()) as LeaderBoardItemType[];
  //     // const toJSONString = JSON.stringify(data);
  //     // const toBase64String = btoa(toJSONString); // @TODO: we should save this in some local cache and hydrate to prevent the API always hitting
  //     setLeaderBoardAllTime(data);
  //     // E: ACTUAL LOGIC
  //     // // S: UNCOMMENT BELOW BLOCK TO MOCK FOR LOCAL UI DEVELOPMENT (COMMENT THE ABOVE ACTUAL LOGIC)
  //     // const allTimePayload =
  //     //   "W3sicGxheWVyQWRkciI6ImVyZDF2eWVqdjUyZTQzZnhxOTZjc2NoeXlqOWc1N3FuOWtndHhyaGtnOTJleWhmdTVhMDIycGxxdGR4dmRtIiwiYml0cyI6MjkwLCJkYXRhTkZUSWQiOiJEQVRBTkZURlQtZTBiOTE3LWM2In0seyJwbGF5ZXJBZGRyIjoiZXJkMWV3ZXF5a3hjcmhoNW5wczRmemt0dTllZnRmN3J4cGE4eGRma3lwd3owazRodWhsMHMwNHNhNnRxeWQiLCJiaXRzIjoyNjAsImRhdGFORlRJZCI6IkRBVEFORlRGVC1lMGI5MTctYzYifSx7InBsYXllckFkZHIiOiJlcmQxdXdrZzlwcnh3cXZsY2xhemQ1OHR4MjJ6OWV6Y3JkYTh5bnJ2MDR6aGg4YW11bm44bDV2cTQ1dnRtMCIsImJpdHMiOjE3NSwiZGF0YU5GVElkIjoiREFUQU5GVEZULWUwYjkxNy1jNiJ9LHsicGxheWVyQWRkciI6ImVyZDF4ZHE0ZDd1ZXdwdHg5ajlrMjNhdWZyYWtsZGE5bGV1bXFjN2V1M3VlenQya2Y0ZnF4ejJzZXgycnhsIiwiYml0cyI6OTUsImRhdGFORlRJZCI6IkRBVEFORlRGVC1lMGI5MTctYzYifSx7InBsYXllckFkZHIiOiJlcmQxNnZqaHJnYTR5anB5ODhsd251NjR3bHhsYXB3eHR2amw5M2pheDRyZzN5cTNoenh0bmF1c2RtaGNqZiIsImJpdHMiOjcwLCJkYXRhTkZUSWQiOiJEQVRBTkZURlQtZTBiOTE3LWM2In0seyJwbGF5ZXJBZGRyIjoiZXJkMXI1M2R2ZDBoOWo2dTBnenp5ZXR4czVzajMyaHM3a256cHJzbHk3cng5eXgyM2RjbHdsenM4MzM1enciLCJiaXRzIjo3MCwiZGF0YU5GVElkIjoiREFUQU5GVEZULWUwYjkxNy1jNiJ9LHsicGxheWVyQWRkciI6ImVyZDFxbXNxNmVqMzQ0a3BuOG1jOXhmbmdqaHlsYTN6ZDZscWRtNHp4eDY2NTNqZWU2cmZxM25zM2ZrY2M3IiwiYml0cyI6NTAsImRhdGFORlRJZCI6IkRBVEFORlRGVC1lMGI5MTctYzYifSx7InBsYXllckFkZHIiOiJlcmQxNnU4eTQ1dTM5N201YWR1eXo5Zm5jNWdwdjNlcmF4cWh0dWVkMnF2dnJza2QzMmZmamtnc3BkNGxjbSIsImJpdHMiOjMwLCJkYXRhTkZUSWQiOiJEQVRBTkZURlQtZTBiOTE3LWM2In0seyJwbGF5ZXJBZGRyIjoiZXJkMXV0aHY4bmFqZGM0Mmg1N2w4cDk3NXRkNnI4OHgzczQ4cGZ5dXNsczQ3ZXY1Nnhjczh0eXMwM3llczUiLCJiaXRzIjoyMCwiZGF0YU5GVElkIjoiREFUQU5GVEZULWUwYjkxNy1jNiJ9LHsicGxheWVyQWRkciI6ImVyZDFseWh0OHh1eW4zaHlrdjNlcnFrd3ljZWFqeXRzNXV3cnpyNWNudTlrNHV1MzRnODc4bDNxa25kanc4IiwiYml0cyI6MjAsImRhdGFORlRJZCI6IkRBVEFORlRGVC1lMGI5MTctYzYifV0=";
  //     // const base64ToString = atob(allTimePayload);
  //     // const stringToJSON = JSON.parse(base64ToString);
  //     // setLeaderBoardAllTime(stringToJSON);
  //     // // E: UNCOMMENT BELOW BLOCK TO MOCK FOR LOCAL UI DEVELOPMENT (COMMENT THE ABOVE ACTUAL LOGIC)
  //   } catch (err: any) {
  //     const message = "Leaderboard fetching failed:" + err.message;
  //     console.error(message);
  //   }
  //   // Get Monthly Leaderboard
  //   try {
  //     // S: ACTUAL LOGIC
  //     console.log("GET CALL -----> xpGamePrivate/monthLeaderBoard");
  //     const res = await fetch(`${getApiWeb2Apps()}/datadexapi/xpGamePrivate/monthLeaderBoard?MMYYString=${MMYYString}`, callConfig);
  //     const data = (await res.json()) as LeaderBoardItemType[];
  //     // const toJSONString = JSON.stringify(data);
  //     // const toBase64String = btoa(toJSONString); // @TODO: we should save this in some local cache and hydrate to prevent the API always hitting
  //     setLeaderBoardMonthly(data);
  //     // E: ACTUAL LOGIC
  //     // // S: UNCOMMENT BELOW BLOCK TO MOCK FOR LOCAL UI DEVELOPMENT (COMMENT THE ABOVE ACTUAL LOGIC)
  //     // const monthlyPayload =
  //     //   "W3siTU1ZWURhdGFORlRJZCI6IjAzXzI0X0RBVEFORlRGVC1lMGI5MTctYzYiLCJwbGF5ZXJBZGRyIjoiZXJkMXZ5ZWp2NTJlNDNmeHE5NmNzY2h5eWo5ZzU3cW45a2d0eHJoa2c5MmV5aGZ1NWEwMjJwbHF0ZHh2ZG0iLCJiaXRzIjoyOTB9LHsiTU1ZWURhdGFORlRJZCI6IjAzXzI0X0RBVEFORlRGVC1lMGI5MTctYzYiLCJwbGF5ZXJBZGRyIjoiZXJkMWV3ZXF5a3hjcmhoNW5wczRmemt0dTllZnRmN3J4cGE4eGRma3lwd3owazRodWhsMHMwNHNhNnRxeWQiLCJiaXRzIjoyNjB9LHsiTU1ZWURhdGFORlRJZCI6IjAzXzI0X0RBVEFORlRGVC1lMGI5MTctYzYiLCJwbGF5ZXJBZGRyIjoiZXJkMXV3a2c5cHJ4d3F2bGNsYXpkNTh0eDIyejllemNyZGE4eW5ydjA0emhoOGFtdW5uOGw1dnE0NXZ0bTAiLCJiaXRzIjoxNzV9LHsiTU1ZWURhdGFORlRJZCI6IjAzXzI0X0RBVEFORlRGVC1lMGI5MTctYzYiLCJwbGF5ZXJBZGRyIjoiZXJkMXhkcTRkN3Vld3B0eDlqOWsyM2F1ZnJha2xkYTlsZXVtcWM3ZXUzdWV6dDJrZjRmcXh6MnNleDJyeGwiLCJiaXRzIjo5NX0seyJNTVlZRGF0YU5GVElkIjoiMDNfMjRfREFUQU5GVEZULWUwYjkxNy1jNiIsInBsYXllckFkZHIiOiJlcmQxNnZqaHJnYTR5anB5ODhsd251NjR3bHhsYXB3eHR2amw5M2pheDRyZzN5cTNoenh0bmF1c2RtaGNqZiIsImJpdHMiOjcwfSx7Ik1NWVlEYXRhTkZUSWQiOiIwM18yNF9EQVRBTkZURlQtZTBiOTE3LWM2IiwicGxheWVyQWRkciI6ImVyZDFyNTNkdmQwaDlqNnUwZ3p6eWV0eHM1c2ozMmhzN2tuenByc2x5N3J4OXl4MjNkY2x3bHpzODMzNXp3IiwiYml0cyI6NzB9LHsiTU1ZWURhdGFORlRJZCI6IjAzXzI0X0RBVEFORlRGVC1lMGI5MTctYzYiLCJwbGF5ZXJBZGRyIjoiZXJkMXFtc3E2ZWozNDRrcG44bWM5eGZuZ2poeWxhM3pkNmxxZG00enh4NjY1M2plZTZyZnEzbnMzZmtjYzciLCJiaXRzIjo1MH0seyJNTVlZRGF0YU5GVElkIjoiMDNfMjRfREFUQU5GVEZULWUwYjkxNy1jNiIsInBsYXllckFkZHIiOiJlcmQxNnU4eTQ1dTM5N201YWR1eXo5Zm5jNWdwdjNlcmF4cWh0dWVkMnF2dnJza2QzMmZmamtnc3BkNGxjbSIsImJpdHMiOjMwfSx7Ik1NWVlEYXRhTkZUSWQiOiIwM18yNF9EQVRBTkZURlQtZTBiOTE3LWM2IiwicGxheWVyQWRkciI6ImVyZDF1dGh2OG5hamRjNDJoNTdsOHA5NzV0ZDZyODh4M3M0OHBmeXVzbHM0N2V2NTZ4Y3M4dHlzMDN5ZXM1IiwiYml0cyI6MjB9LHsiTU1ZWURhdGFORlRJZCI6IjAzXzI0X0RBVEFORlRGVC1lMGI5MTctYzYiLCJwbGF5ZXJBZGRyIjoiZXJkMWx5aHQ4eHV5bjNoeWt2M2VycWt3eWNlYWp5dHM1dXdyenI1Y251OWs0dXUzNGc4NzhsM3FrbmRqdzgiLCJiaXRzIjoyMH1d";
  //     // const base64ToString = atob(monthlyPayload);
  //     // const stringToJSON = JSON.parse(base64ToString);
  //     // setLeaderBoardMonthly(stringToJSON);
  //     // // E: UNCOMMENT BELOW BLOCK TO MOCK FOR LOCAL UI DEVELOPMENT (COMMENT THE ABOVE ACTUAL LOGIC)
  //   } catch (err: any) {
  //     const message = "Monthly Leaderboard fetching failed:" + err.message;
  //     console.error(message);
  //   }
  //   setLeaderBoardIsLoading(false);
  // }
  // async function fetchAndLoadMyRankOnLeaderBoard() {
  //   const callConfig = {
  //     headers: {
  //       "fwd-tokenid": SUPPORTED_SOL_COLLECTIONS[0],
  //     },
  //   };
  //   try {
  //     console.log("GET CALL -----> xpGamePrivate/playerRankOnLeaderBoard");
  //     const res = await fetch(`${getApiWeb2Apps()}/datadexapi/xpGamePrivate/playerRankOnLeaderBoard?playerAddr=${address}`, callConfig);
  //     const data = await res.json();
  //     setMyRankOnAllTimeLeaderBoard(data.playerRank || "N/A");
  //   } catch (err: any) {
  //     const message = "Getting my rank on the all time leaderboard failed:" + err.message;
  //     console.error(message);
  //   }
  // }
  // return (
  //   <div>
  //     {usingReferralCode !== "" && (
  //       <div className="p-1 text-lg font-bold border border-[#35d9fa] rounded-[1rem] mb-[1rem] text-center">
  //         You are playing with referral code {usingReferralCode}
  //       </div>
  //     )}
  //     <div className="relative w-full">
  //       <div className="absolute -z-1 w-full">
  //         <img
  //           className={cn("-z-1 rounded-[3rem] w-full cursor-pointer", modalMode ? "rounded" : "")}
  //           src={ImgLoadingGame}
  //           alt={"Checking if you have <BiTz> Data NFT"}
  //         />
  //       </div>
  //       {gamePlayImageSprites()}
  //     </div>
  //     {!modalMode && (
  //       <>
  //         <div className="p-5 text-lg font-bold border border-[#35d9fa] rounded-[1rem] mt-[3rem] max-w-[100%]">
  //           <h2 className="text-center text-white mb-[1rem] text-4xl">Get BiTz Perks</h2>
  //           <ol className="mt-5">
  //             <li className="my-5">
  //               1. Top {BIT_GAME_TOP_LEADER_BOARD_GROUP} Movers from &quot;Monthly&quot; LEADERBOARD get Airdropped Data NFTs from previous and upcoming Data
  //               Creators.
  //             </li>
  //             <li className="my-5">2. Extra 3 bonus drops of Data NFTs sent randomly to users from top 100 &quot;All Time&quot; LEADERBOARD</li>
  //             <li className="my-5">
  //               3. Got Memes for burning? Join our{" "}
  //               <a className="!text-[#35d9fa] hover:underline" href="https://discord.com/channels/869901313616527360/922340575594831872" target="blank">
  //                 Discord Meme Channel
  //               </a>{" "}
  //               and submit it there. Top 3 memes per week get included into the Meme Burn Game and we will showcase it on Twitter.
  //             </li>
  //             <li className="my-5">
  //               4. Power Up Data Bounties with {`<BiTz>`} XP below - Give {`<BiTz>`}
  //             </li>
  //           </ol>
  //           <p>See the full list of {`<BiTz>`} XP perks listed in the FAQ section below...</p>
  //         </div>
  //         <div id="leaderboard" className="flex flex-col max-w-[100%] border border-[#35d9fa] p-[2rem] rounded-[1rem] mt-[3rem]">
  //           <div className="leaderBoard">
  //             <h2 className="text-center text-white mb-[1rem] text-4xl">LEADERBOARD</h2>
  //             {address && leaderBoardAllTime.length > 0 && (
  //               <div className="my-rank-and-score md:flex md:justify-center border p-[.6rem] mb-[1rem] rounded-[1rem] text-center bg-[#35d9fa] bg-opacity-25">
  //                 <div className="flex flex-col items-center p-[1rem] md:flex-row md:align-baseline md:pr-[2rem] md:border-r-4 border-[#171717]">
  //                   <p className="flex items-end md:text-lg md:mr-[1rem]">Your Current All-Time Rank</p>
  //                   <p className="text-xl md:text-2xl dark:text-[#35d9fa] font-bold">
  //                     {myRankOnAllTimeLeaderBoard === "-2" ? `...` : myRankOnAllTimeLeaderBoard}
  //                   </p>
  //                 </div>
  //                 <div className="flex flex-col items-center p-[1rem] md:flex-row md:align-baseline md:pr-[2rem] md:pl-[2rem]">
  //                   <p className="flex items-end md:text-lg md:mr-[1rem]">Your Collected {`<BiTz>`} Points </p>
  //                   <p className="text-xl md:text-2xl dark:text-[#35d9fa] font-bold">
  //                     {collectedBitzSum === -2 ? `...` : <>{collectedBitzSum === -1 ? "0" : `${collectedBitzSum}`}</>}
  //                   </p>
  //                 </div>
  //               </div>
  //             )}
  //             <div className="md:flex">
  //               <div className="my-[1rem] allTime md:flex-1">
  //                 <h3 className="text-center text-white mb-[1rem]">All Time</h3>
  //                 {leaderBoardIsLoading ? (
  //                   <div className="flex justify-center items-center h-100">
  //                     <Loader />
  //                   </div>
  //                 ) : (
  //                   <>
  //                     {leaderBoardAllTime.length > 0 ? (
  //                       <LeaderBoardTable leaderBoardData={leaderBoardAllTime} address={address ?? ""} />
  //                     ) : (
  //                       <div className="text-center">{"Connect Wallet to Check"}</div>
  //                     )}
  //                   </>
  //                 )}
  //               </div>
  //               <div className="my-[1rem] monthly md:flex-1">
  //                 <h3 className="text-center text-white mb-[1rem]">
  //                   Monthly ({leaderBoardMonthString.replace("_", "-20")}) {inDateStringDebugMode && <span className="text-red-100"> IN DEBUG MODE!</span>}
  //                 </h3>
  //                 {leaderBoardIsLoading ? (
  //                   <div className="flex justify-center items-center h-100">
  //                     <Loader />
  //                   </div>
  //                 ) : (
  //                   <>
  //                     {leaderBoardMonthly.length > 0 ? (
  //                       <LeaderBoardTable leaderBoardData={leaderBoardMonthly} address={address ?? ""} />
  //                     ) : (
  //                       <div className="text-center">{"Connect Wallet to Check"}</div>
  //                     )}
  //                   </>
  //                 )}
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //         {leaderBoardAllTime.length > 0 && <GiveBitzBase />}
  //         <Faq />
  //       </>
  //     )}
  //   </div>
  // );
};

export default GetBitzSol;
