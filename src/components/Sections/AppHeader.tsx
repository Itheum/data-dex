import React, { useEffect, useState } from "react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionItem,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Link,
  List,
  ListIcon,
  ListItem,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { AiFillHome } from "react-icons/ai";
import { FaStore, FaUserCheck } from "react-icons/fa";
import { MdAccountBalanceWallet, MdDarkMode, MdMenu, MdPerson, MdSpaceDashboard } from "react-icons/md";
import { RiExchangeFill } from "react-icons/ri";
import { TbSunset2 } from "react-icons/tb";
import { TiArrowSortedDown } from "react-icons/ti";
import { Link as ReactRouterLink, useLocation, useNavigate } from "react-router-dom";
import logoSmlL from "assets/img/logo-icon-b.png";
import logoSmlD from "assets/img/logo-sml-d.png";
import ClaimsHistory from "components/ClaimsHistory";
import InteractionsHistory from "components/Tables/InteractionHistory";
import ChainSupportedComponent from "components/UtilComps/ChainSupportedComponent";
import ShortAddress from "components/UtilComps/ShortAddress";
import { CHAIN_TOKEN_SYMBOL, CHAINS, MENU } from "libs/config";
import { formatNumberRoundFloor } from "libs/utils";
import { useAccountStore } from "store";
import { useChainMeta } from "store/ChainMetaContext";
import { NativeAuthClient } from "@multiversx/sdk-native-auth-client";

const exploreRouterMenu = [
  {
    sectionId: "MainSections",
    sectionLabel: "Main Sections",
    sectionItems: [
      {
        menuEnum: MENU.HOME,
        path: "/dashboard",
        label: "Dashboard",
        shortLbl: "Dash",
        Icon: MdSpaceDashboard,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.SELL,
        path: "/tradedata",
        label: "Trade Data",
        shortLbl: "Trade",
        Icon: RiExchangeFill,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.NFTMINE,
        path: "/datanfts/wallet",
        label: "Data NFT Wallet",
        shortLbl: "Wallet",
        Icon: MdAccountBalanceWallet,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.NFTALL,
        path: "/datanfts/marketplace/market",
        label: "Data NFT Marketplace",
        shortLbl: "Market",
        Icon: FaStore,
        needToBeLoggedIn: false,
      },
      {
        menuEnum: MENU.GETWHITELISTED,
        path: "/getwhitelisted",
        label: "Get whitelisted to mint Data NFTs",
        shortLbl: "Get whitelisted to mint Data NFTs",
        Icon: FaUserCheck,
        needToBeLoggedIn: false,
        needToBeLoggedOut: true,
      },
    ],
  },
];

const menuItmesMap: Map<number, any> = new Map(exploreRouterMenu[0].sectionItems.map((row) => [row.menuEnum, row]));

const AppHeader = ({ onLaunchMode, menuItem, setMenuItem, handleLogout }: { onLaunchMode?: any; menuItem: number; setMenuItem: any; handleLogout: any }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address: mxAddress } = useGetAccountInfo();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { pathname } = useLocation();

  const [mxShowClaimsHistory, setMxShowClaimsHistory] = useState(false);
  const [mxShowInteractionsHistory, setMxInteractionsHistory] = useState(false);

  const navigate = useNavigate();

  const navigateToDiscover = (menuEnum: number) => {
    setMenuItem(menuEnum);

    if (isOpen) onClose();
  };

  function isMenuItemSelected(itemPath: string): boolean {
    return pathname.startsWith(itemPath);
  }

  const menuButtonDisabledStyle = (itemPath: string) => {
    let styleProps: any = {
      cursor: "not-allowed",
    };
    if (isMenuItemSelected(itemPath) && colorMode === "dark") {
      styleProps = {
        backgroundColor: "#44444450",
        opacity: 0.6,
        ...styleProps,
      };
    } else if (isMenuItemSelected(itemPath) && colorMode !== "dark") {
      styleProps = {
        backgroundColor: "#EDF2F7",
        ...styleProps,
      };
    }
    return styleProps;
  };

  const chainFriendlyName = CHAINS[_chainMeta.networkId as keyof typeof CHAINS];

  const handleGuardrails = () => {
    navigate("/guardRails");
  };

  return (
    <>
      <Flex
        h="6rem"
        justifyContent={isMxLoggedIn ? "space-around" : "inherit"}
        paddingX={!isMxLoggedIn ? { base: 5, md: 20, xl: 36 } : 0}
        alignItems="center"
        backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}
        borderBottom="solid .1rem"
        borderColor="teal.200"
        paddingY="5">
        <HStack
          alignItems={"center"}
          backgroundColor="none"
          width={{ base: "full", md: "15rem" }}
          justifyContent={{ base: "space-around", md: "space-around" }}>
          {isMxLoggedIn && (
            <IconButton
              fontSize="2rem"
              variant={"ghost"}
              icon={
                <MdMenu
                  style={{
                    transform: "translateX(15%)",
                  }}
                />
              }
              display={{
                xl: "none",
              }}
              textColor="teal.200"
              aria-label={"Open Menu"}
              onClick={isOpen ? onClose : onOpen}
            />
          )}

          <Link
            as={ReactRouterLink}
            to={"/"}
            style={{ textDecoration: "none", pointerEvents: hasPendingTransactions ? "none" : undefined }}
            onClick={() => {
              navigateToDiscover(MENU.LANDING);
            }}>
            <HStack>
              <Image w="45px" ml={{ base: 0, md: 5 }} src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />
              <Heading
                display={{ base: "flex", md: "flex", xl: "flex" }}
                fontSize={{ base: "md", xl: "xl" }}
                fontWeight="400"
                lineHeight="16.29px"
                fontFamily="">
                Data&nbsp;
                <Text fontWeight="700">DEX</Text>
              </Heading>
            </HStack>
          </Link>
          <Box></Box>
        </HStack>
        <Flex backgroundColor="none">
          <HStack alignItems={"center"} spacing={2}>
            <HStack display={{ base: "none", md: "none", xl: "block", "2xl": "block" }}>
              {exploreRouterMenu[0].sectionItems.map((quickMenuItem) => {
                const { path, menuEnum, shortLbl, Icon } = quickMenuItem;
                return (
                  <Link
                    as={ReactRouterLink}
                    to={path}
                    style={{ textDecoration: "none" }}
                    key={path}
                    display={shouldDisplayQuickMenuItem(quickMenuItem, isMxLoggedIn)}>
                    <Button
                      borderColor="teal.200"
                      fontSize="md"
                      variant="outline"
                      h={"12"}
                      isDisabled={isMenuItemSelected(path) || hasPendingTransactions}
                      _disabled={menuButtonDisabledStyle(path)}
                      key={shortLbl}
                      size={isMxLoggedIn ? "sm" : "md"}
                      onClick={() => navigateToDiscover(menuEnum)}>
                      <Flex justifyContent="center" alignItems="center" px={{ base: 0, "2xl": 1.5 }} color="teal.200" pointerEvents="none">
                        <Icon size={"1.6em"} />
                        <Text pl={2} fontSize={{ base: isMxLoggedIn ? "sm" : "md", "2xl": "lg" }} color={colorMode === "dark" ? "white" : "black"}>
                          {shortLbl}
                        </Text>
                      </Flex>
                    </Button>
                  </Link>
                );
              })}
            </HStack>
            {isMxLoggedIn && (
              <>
                <ItheumTokenBalanceBadge displayParams={["none", null, "block"]} />
                <LoggedInChainBadge chain={chainFriendlyName} displayParams={["none", null, "block"]} />
                <Box display={{ base: "none", md: "block" }} zIndex="10">
                  {exploreRouterMenu.map((menu) => (
                    <Menu key={menu.sectionId} isLazy>
                      <MenuButton as={Button} size={{ md: "md", "2xl": "lg" }} rightIcon={<TiArrowSortedDown size="18px" />}>
                        <ShortAddress address={mxAddress} fontSize="md" />
                      </MenuButton>
                      <MenuList maxW={"fit-content"} backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                        <Link as={ReactRouterLink} to="/profile" style={{ textDecoration: "none" }}>
                          <MenuItem
                            isDisabled={
                              isMenuItemSelected("/profile") ||
                              hasPendingTransactions ||
                              isMenuItemSelected("/profile/created") ||
                              isMenuItemSelected("/profile/listed")
                            }
                            onClick={() => navigateToDiscover(MENU.PROFILE)}
                            color="teal.200"
                            backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                            <MdPerson size={"1.25em"} style={{ marginRight: "1rem" }} />
                            <Text color={colorMode === "dark" ? "bgWhite" : "black"}>Profile</Text>
                          </MenuItem>
                        </Link>
                        {menu.sectionItems.map((menuItem) => {
                          const { label, path, menuEnum, Icon } = menuItem;
                          return (
                            <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                              <MenuItem
                                key={label}
                                isDisabled={isMenuItemSelected(path) || hasPendingTransactions}
                                onClick={() => navigateToDiscover(menuEnum)}
                                color="teal.200"
                                backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                                <Icon size={"1.25em"} style={{ marginRight: "1rem" }} />
                                <Text color={colorMode === "dark" ? "bgWhite" : "black"}>{label}</Text>
                              </MenuItem>
                            </Link>
                          );
                        })}

                        <MenuDivider />

                        <MenuGroup title="My Address Quick Copy">
                          <MenuItemOption closeOnSelect={false} backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                            <ShortAddress address={mxAddress} fontSize="md" marginLeftSet="-20px" />
                          </MenuItemOption>

                          <MenuDivider />
                        </MenuGroup>

                        <MenuGroup>
                          {isMxLoggedIn && (
                            <ChainSupportedComponent feature={MENU.CLAIMS}>
                              <MenuItem
                                closeOnSelect={false}
                                isDisabled={hasPendingTransactions}
                                onClick={() => setMxShowClaimsHistory(true)}
                                backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                                <Text fontSize="lg" fontWeight="500">
                                  View Claims History
                                </Text>
                              </MenuItem>
                              <MenuItem
                                closeOnSelect={false}
                                isDisabled={hasPendingTransactions}
                                onClick={() => setMxInteractionsHistory(true)}
                                backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                                <Text fontSize="lg" fontWeight="500">
                                  View Data NFT Interactions History
                                </Text>
                              </MenuItem>
                            </ChainSupportedComponent>
                          )}

                          <MenuItem
                            onClick={handleGuardrails}
                            fontSize="lg"
                            fontWeight="500"
                            isDisabled={hasPendingTransactions}
                            backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                            CanaryNet Dashboard
                          </MenuItem>

                          <MenuItem
                            onClick={handleLogout}
                            fontSize="lg"
                            fontWeight="500"
                            isDisabled={hasPendingTransactions}
                            backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                            Logout
                          </MenuItem>
                        </MenuGroup>
                      </MenuList>
                    </Menu>
                  ))}
                </Box>
                <Link as={ReactRouterLink} to={"/"}>
                  <IconButton
                    display={{ base: "none", md: "inline-flex" }}
                    size={{ md: "md", xl: "lg", "2xl": "lg" }}
                    px="2 !important"
                    color="teal.200"
                    icon={<AiFillHome fontSize={"1.4rem"} />}
                    aria-label={"Back to home"}
                    isDisabled={isMenuItemSelected(menuItmesMap.get(MENU.LANDING)?.path) || hasPendingTransactions}
                    _disabled={menuButtonDisabledStyle(menuItmesMap.get(MENU.LANDING)?.path)}
                    onClick={() => {
                      navigateToDiscover(MENU.LANDING);
                    }}
                  />
                </Link>
              </>
            )}
            {onLaunchMode && !isMxLoggedIn && <PopupChainSelectorForWallet onMxEnvPick={onLaunchMode} />}
            Toggle Mode
            <Box display={{ base: "none", md: "block", xl: "block" }}>
              <IconButton
                size={{ md: "md", xl: "lg", "2xl": "lg" }}
                px="2 !important"
                mr={{ md: "1", xl: "0" }}
                icon={colorMode === "light" ? <MdDarkMode fontSize={"1.4rem"} /> : <TbSunset2 fontSize={"1.4rem"} />}
                aria-label="Change Color Theme"
                color="teal.200"
                onClick={toggleColorMode}
              />
            </Box>
          </HStack>
        </Flex>
      </Flex>

      {mxShowClaimsHistory && (
        <ClaimsHistory mxAddress={mxAddress} networkId={_chainMeta.networkId} onAfterCloseChaimsHistory={() => setMxShowClaimsHistory(false)} />
      )}
      {mxShowInteractionsHistory && (
        <InteractionsHistory mxAddress={mxAddress} networkId={_chainMeta.networkId} onAfterCloseInteractionsHistory={() => setMxInteractionsHistory(false)} />
      )}

      <Drawer placement={"left"} onClose={onClose} isOpen={isOpen} blockScrollOnMount={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"} display={"flex"} alignItems={"center"} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
            <Heading size={"sm"} onClick={onClose}>
              Itheum Data DEX
            </Heading>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody p={0} bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
            <Accordion allowMultiple>
              {exploreRouterMenu.map((menu) => (
                <AccordionItem key={menu.sectionId}>
                  {({ isExpanded }) => (
                    <>
                      <Text as={"header"} fontWeight="700" fontSize="md" ml={4} mt={2}>
                        My Address Quick Copy
                      </Text>
                      <Text as={"div"} m={"2 !important"} pl={8} color="teal.200" fontWeight={"bold"}>
                        <ShortAddress address={mxAddress} fontSize="md" marginLeftSet="-20px" />
                      </Text>
                      <hr />
                      <List>
                        {menu.sectionItems.map((menuItem) => {
                          const { label, menuEnum, path, Icon } = menuItem;
                          return (
                            <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                              <ListItem
                                as={Button}
                                variant={"ghost"}
                                w={"full"}
                                borderRadius={"0"}
                                display={"flex"}
                                justifyContent={"start"}
                                p={3}
                                key={label}
                                onClick={() => navigateToDiscover(menuEnum)}>
                                <ListIcon
                                  as={() =>
                                    Icon({
                                      size: "1.25em",
                                      style: { marginRight: "0.75rem" },
                                    })
                                  }
                                />
                                <Text mt={-1}>{label}</Text>
                              </ListItem>
                            </Link>
                          );
                        })}

                        <ListItem
                          as={Button}
                          variant={"ghost"}
                          w={"full"}
                          borderRadius={"0"}
                          display={"flex"}
                          justifyContent={"start"}
                          p={3}
                          onClick={() => setMxShowClaimsHistory(true)}>
                          View Claims History
                        </ListItem>
                        <ListItem
                          as={Button}
                          variant={"ghost"}
                          w={"full"}
                          borderRadius={"0"}
                          display={"flex"}
                          justifyContent={"start"}
                          p={3}
                          onClick={() => setMxInteractionsHistory(true)}>
                          View Interactions History
                        </ListItem>

                        <ListItem
                          as={Button}
                          variant={"ghost"}
                          w={"full"}
                          borderRadius={"0"}
                          display={"flex"}
                          justifyContent={"start"}
                          p={3}
                          onClick={handleLogout}>
                          Logout
                        </ListItem>
                      </List>
                    </>
                  )}
                </AccordionItem>
              ))}
            </Accordion>

            <Stack width="60%" spacing="3" m="1rem auto">
              <LoggedInChainBadge chain={chainFriendlyName} displayParams={["block", null, "none"]} />
              <ItheumTokenBalanceBadge displayParams={["block", null, "none"]} />
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AppHeader;

const PopupChainSelectorForWallet = ({ onMxEnvPick }: { onMxEnvPick: any }) => {
  const [showMxEnvPicker, setShowMxEnvPicker] = useState(false);
  const [initToken, setInitToken] = useState<string>("");
  const { address: mxAddress } = useGetAccountInfo();

  const client = new NativeAuthClient({ origin: "test" });

  useEffect(() => {
    (async () => {
      setInitToken(await client.initialize());
    })();
  }, []);

  const parts = initToken.split(".");
  const signature = mxAddress + parts.slice(1).join(".");

  const accessToken = client.getToken(mxAddress, initToken, signature);

  return (
    <Popover
      isOpen={showMxEnvPicker}
      onOpen={() => setShowMxEnvPicker(true)}
      onClose={() => setShowMxEnvPicker(false)}
      closeOnBlur={true}
      isLazy
      lazyBehavior="keepMounted">
      <HStack marginLeft={3}>
        <PopoverTrigger>
          <Button colorScheme="teal" fontSize={{ base: "sm", md: "md" }} size={{ base: "sm", lg: "lg" }}>
            Connect MultiversX Wallet
          </Button>
        </PopoverTrigger>
      </HStack>

      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Text fontSize="md">Please pick a MultiversX environment</Text>
        </PopoverHeader>
        <PopoverBody>
          <Button
            size="sm"
            onClick={() => {
              setShowMxEnvPicker(false);
              onMxEnvPick("mx", "mainnet");
            }}>
            {" "}
            Mainnet
          </Button>

          <Button
            size="sm"
            ml="2"
            onClick={() => {
              setShowMxEnvPicker(false);
              onMxEnvPick("mx", "devnet");
            }}>
            {" "}
            Devnet
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

function shouldDisplayQuickMenuItem(quickMenuItem: any, isMxLoggedIn: boolean) {
  if (quickMenuItem.needToBeLoggedOut === undefined) {
    return quickMenuItem.needToBeLoggedIn ? (isMxLoggedIn ? "inline" : "none") : "inline";
  } else {
    return quickMenuItem.needToBeLoggedOut ? (isMxLoggedIn ? "none" : "inline") : "inline";
  }
}

function ItheumTokenBalanceBadge({ displayParams }: { displayParams: any }) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const itheumBalance = useAccountStore((state) => state.itheumBalance);

  return (
    <Box
      display={displayParams}
      fontSize={{ md: "sm", "2xl": "md" }}
      minWidth="5.5rem"
      textAlign="center"
      color="black"
      bgColor="teal.200"
      borderRadius="md"
      paddingX={{ md: "3", xl: "5" }}
      paddingY={{ md: "10px", xl: "14px" }}>
      {itheumBalance === -1 ? (
        <Spinner size="xs" />
      ) : itheumBalance === -2 ? (
        <WarningTwoIcon />
      ) : (
        <>
          {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} {formatNumberRoundFloor(itheumBalance)}
        </>
      )}
    </Box>
  );
}

function LoggedInChainBadge({ chain, displayParams }: { chain: any; displayParams: any }) {
  return (
    <Box
      display={displayParams}
      fontSize={{ md: "sm", "2xl": "md" }}
      textAlign="center"
      color="teal.200"
      fontWeight="semibold"
      borderRadius="md"
      height="2rem"
      padding={{ md: "6px 5px", xl: "6px 11px" }}>
      {chain || "..."}
    </Box>
  );
}
