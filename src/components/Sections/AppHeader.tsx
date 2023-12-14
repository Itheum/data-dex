import React, { useState } from "react";
import { WarningTwoIcon, SunIcon } from "@chakra-ui/icons";
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
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { AiFillHome } from "react-icons/ai";
import { FaStore, FaUserCheck, FaLaptop } from "react-icons/fa";
import { MdAccountBalanceWallet, MdDarkMode, MdMenu, MdPerson, MdSpaceDashboard } from "react-icons/md";
import { RiExchangeFill } from "react-icons/ri";
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

const exploreRouterMenu = [
  {
    sectionId: "MainSections",
    sectionLabel: "Main Sections",
    sectionItems: [
      {
        menuEnum: MENU.PROFILE,
        path: "/profile",
        label: "Profile",
        shortLbl: "Profile",
        Icon: MdPerson,
        needToBeLoggedIn: true,
        isHidden: true,
      },
      {
        menuEnum: MENU.HOME,
        path: "/dashboard",
        label: "Dashboard",
        shortLbl: "Dash",
        Icon: MdSpaceDashboard,
        needToBeLoggedIn: true,
        isHidden: false,
      },
      {
        menuEnum: MENU.SELL,
        path: "/tradedata",
        label: "Trade Data",
        shortLbl: "Trade",
        Icon: RiExchangeFill,
        needToBeLoggedIn: true,
        isHidden: false,
      },
      {
        menuEnum: MENU.NFTMINE,
        path: "/datanfts/wallet",
        label: "Data NFT Wallet",
        shortLbl: "Wallet",
        Icon: MdAccountBalanceWallet,
        needToBeLoggedIn: true,
        isHidden: false,
      },
      {
        menuEnum: MENU.NFTALL,
        path: "/datanfts/marketplace",
        label: "Data NFT Marketplace",
        shortLbl: "Market",
        Icon: FaStore,
        needToBeLoggedIn: false,
        isHidden: false,
      },
      {
        menuEnum: MENU.GETWHITELISTED,
        path: "/getwhitelisted",
        label: "Get Whitelisted to Mint Data NFTs",
        shortLbl: "Get Whitelisted to Mint Data NFTs",
        Icon: FaUserCheck,
        needToBeLoggedIn: false,
        needToBeLoggedOut: true,
        isHidden: false,
      },
    ],
  },
];

const menuItemsMap: Map<number, any> = new Map(exploreRouterMenu[0].sectionItems.map((row) => [row.menuEnum, row]));

const AppHeader = ({ onShowConnectWalletModal, setMenuItem, handleLogout }: { onShowConnectWalletModal?: any; setMenuItem: any; handleLogout: any }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address: mxAddress } = useGetAccountInfo();
  const { colorMode, setColorMode } = useColorMode();
  const { pathname } = useLocation();

  const [mxShowClaimsHistory, setMxShowClaimsHistory] = useState(false);
  const [mxShowInteractionsHistory, setMxInteractionsHistory] = useState(false);

  const connectBtnTitle = useBreakpointValue({ base: "Connect Wallet", md: "Connect MultiversX Wallet" });

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

  const chainFriendlyName = CHAINS[chainID as keyof typeof CHAINS];

  const handleGuardrails = () => {
    navigate("/guardrails");
    if (isOpen) onClose();
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
        <HStack alignItems={"center"} backgroundColor="none" width={{ base: "full", md: "10rem" }} justifyContent="space-around">
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
                fontFamily="Clash-Medium"
                fontWeight="400"
                lineHeight="16.29px">
                Data&nbsp;
                <Text fontWeight="700">DEX</Text>
              </Heading>
            </HStack>
          </Link>
          {/* {isMxLoggedIn ? (
            <Box display={{ base: "block", md: "none" }}>
              <IconButton
                size="lg"
                icon={colorMode === "light" ? <MdDarkMode fontSize={"1.4rem"} /> : <TbSunset2 fontSize={"1.4rem"} />}
                aria-label="Change Color Theme"
                color="teal.200"
                onClick={toggleColorMode}
              />
            </Box>
          ) : (
            <Box display={{ base: "block", md: "none" }}>
              <IconButton
                size="md"
                ml={12}
                bgColor=""
                icon={colorMode === "light" ? <MdDarkMode fontSize={"1.4rem"} /> : <TbSunset2 fontSize={"1.4rem"} />}
                aria-label="Change Color Theme"
                color="teal.200"
                onClick={toggleColorMode}
              />
            </Box>
          )} */}
        </HStack>
        <Flex backgroundColor="none">
          <HStack alignItems={"center"} spacing={2}>
            <HStack display={{ base: "none", md: "none", xl: "block", "2xl": "block" }}>
              {exploreRouterMenu[0].sectionItems.map((quickMenuItem) => {
                const { path, menuEnum, shortLbl, isHidden, Icon } = quickMenuItem;
                return (
                  <Link
                    as={ReactRouterLink}
                    to={path}
                    mx={"4px"}
                    style={{ textDecoration: "none" }}
                    key={path}
                    display={shouldDisplayQuickMenuItem(quickMenuItem, isMxLoggedIn)}>
                    <Button
                      borderColor="teal.200"
                      fontSize="md"
                      variant="outline"
                      display={isHidden ? "none" : "initial"}
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
                        <Link as={ReactRouterLink} to={`/profile/${mxAddress}`} style={{ textDecoration: "none" }}>
                          <MenuItem
                            isDisabled={
                              isMenuItemSelected(`/profile/${mxAddress}`) ||
                              hasPendingTransactions ||
                              isMenuItemSelected(`/profile/${mxAddress}/created`) ||
                              isMenuItemSelected(`/profile/${mxAddress}/listed`)
                            }
                            onClick={() => navigateToDiscover(MENU.PROFILE)}
                            color="teal.200"
                            backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                            <MdPerson size={"1.25em"} style={{ marginRight: "1rem" }} />
                            <Text color={colorMode === "dark" ? "bgWhite" : "black"}>Profile</Text>
                          </MenuItem>
                        </Link>
                        {menu.sectionItems.map((menuItem) => {
                          const { label, path, menuEnum, isHidden, Icon } = menuItem;
                          return (
                            <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                              <MenuItem
                                key={label}
                                isDisabled={isMenuItemSelected(path) || hasPendingTransactions}
                                onClick={() => navigateToDiscover(menuEnum)}
                                display={isHidden ? "none" : "flex"}
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
                            <Text as={"div"} color="teal.200" fontWeight={"bold"}>
                              <ShortAddress address={mxAddress} fontSize="md" marginLeftSet="-20px" isCopyAddress={true} />
                            </Text>
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
                    p="2 !important"
                    color="teal.200"
                    icon={<AiFillHome fontSize={"1.4rem"} />}
                    aria-label={"Back to home"}
                    isDisabled={isMenuItemSelected(menuItemsMap.get(MENU.LANDING)?.path) || hasPendingTransactions}
                    _disabled={menuButtonDisabledStyle(menuItemsMap.get(MENU.LANDING)?.path)}
                    onClick={() => {
                      navigateToDiscover(MENU.LANDING);
                    }}
                  />
                </Link>
              </>
            )}
            {onShowConnectWalletModal && !isMxLoggedIn && (
              <Button
                colorScheme="teal"
                fontSize={{ base: "sm", md: "md" }}
                size={{ base: "sm", lg: "lg" }}
                onClick={() => {
                  localStorage?.removeItem("itm-datacat-linked");
                  onShowConnectWalletModal("mx");
                }}>
                {connectBtnTitle}
              </Button>
            )}

            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                size={{ base: "sm", lg: "lg" }}
                p="2 !important"
                color="teal.200"
                icon={colorMode === "light" ? <SunIcon fontSize={"1.4rem"} /> : <MdDarkMode fontSize={"1.4rem"} />}
                variant="solid"
              />
              <MenuList backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                <MenuItem
                  icon={<SunIcon color="teal.200" />}
                  onClick={() => setColorMode("light")}
                  backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                  Light
                </MenuItem>
                <MenuItem
                  icon={<MdDarkMode color="#00C797" />}
                  onClick={() => setColorMode("dark")}
                  backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                  Dark
                </MenuItem>
                <MenuItem
                  icon={<FaLaptop color="#00C797" />}
                  onClick={() => setColorMode("system")}
                  backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                  System
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Flex>

      {mxShowClaimsHistory && <ClaimsHistory mxAddress={mxAddress} onAfterCloseChaimsHistory={() => setMxShowClaimsHistory(false)} />}
      {mxShowInteractionsHistory && <InteractionsHistory mxAddress={mxAddress} onAfterCloseInteractionsHistory={() => setMxInteractionsHistory(false)} />}

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
                  {() => (
                    <>
                      <Text as={"header"} fontWeight="700" fontSize="md" ml={4} mt={2}>
                        My Address Quick Copy
                      </Text>
                      <Text as={"div"} m={"2 !important"} pl={8} color="teal.200" fontWeight={"bold"}>
                        <ShortAddress address={mxAddress} fontSize="md" marginLeftSet="-20px" isCopyAddress={true} />
                      </Text>
                      <hr />
                      <List>
                        <Link as={ReactRouterLink} to={`/profile/${mxAddress}`} style={{ textDecoration: "none" }}>
                          <ListItem
                            onClick={() => navigateToDiscover(MENU.PROFILE)}
                            as={Button}
                            variant={"ghost"}
                            w={"full"}
                            borderRadius={"0"}
                            display={"flex"}
                            justifyContent={"start"}
                            p={3}>
                            <MdPerson size={"1.25em"} style={{ marginRight: "1rem" }} />
                            <Text color={colorMode === "dark" ? "bgWhite" : "black"}>Profile</Text>
                          </ListItem>
                        </Link>
                        {menu.sectionItems.map((menuItem) => {
                          const { label, menuEnum, path, isHidden, Icon } = menuItem;
                          return (
                            <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                              <ListItem
                                as={Button}
                                variant={"ghost"}
                                w={"full"}
                                borderRadius={"0"}
                                display={isHidden ? "none" : "flex"}
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
                          onClick={handleGuardrails}
                          variant={"ghost"}
                          w={"full"}
                          borderRadius={"0"}
                          justifyContent={"start"}
                          p={3}
                          isDisabled={hasPendingTransactions}
                          backgroundColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
                          CanaryNet Dashboard
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

function shouldDisplayQuickMenuItem(quickMenuItem: any, isMxLoggedIn: boolean) {
  if (quickMenuItem.needToBeLoggedOut === undefined) {
    return quickMenuItem.needToBeLoggedIn ? (isMxLoggedIn ? "inline" : "none") : "inline";
  } else {
    return quickMenuItem.needToBeLoggedOut ? (isMxLoggedIn ? "none" : "inline") : "inline";
  }
}

function ItheumTokenBalanceBadge({ displayParams }: { displayParams: any }) {
  const { chainID } = useGetNetworkConfig();
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
          {CHAIN_TOKEN_SYMBOL(chainID)} {formatNumberRoundFloor(itheumBalance)}
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
