import React, { useState } from "react";
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
import { FaStore } from "react-icons/fa";
import { MdAccountBalanceWallet, MdMenu, MdSpaceDashboard } from "react-icons/md";
import { RiExchangeFill } from "react-icons/ri";
import { TiArrowSortedDown } from "react-icons/ti";
import { Link as ReactRouterLink } from "react-router-dom";

import logoSmlD from "img/logo-sml-d.png";
import logoSmlL from "img/logo-sml-l.png";
import { CHAIN_TOKEN_SYMBOL, CHAINS, formatNumberRoundFloor, MENU } from "libs/util";
import ClaimsHistory from "MultiversX/ClaimsHistory";
import { useChainMeta } from "store/ChainMetaContext";
import ChainSupportedComponent from "UtilComps/ChainSupportedComponent";
import ShortAddress from "UtilComps/ShortAddress";

const exploreRouterMenu = [
  {
    sectionId: "MainSections",
    sectionLabel: "Main Sections",
    sectionItems: [
      {
        menuEnum: MENU.HOME,
        path: "dashboard",
        label: "Dashboard",
        shortLbl: "Dashboard",
        Icon: MdSpaceDashboard,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.SELL,
        path: "tradedata",
        label: "Trade Data",
        shortLbl: "Trade",
        Icon: RiExchangeFill,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.NFTMINE,
        path: "datanfts/wallet",
        label: "Data NFT Wallet",
        shortLbl: "Wallet",
        Icon: MdAccountBalanceWallet,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.NFTALL,
        path: "datanfts/marketplace/market",
        label: "Data NFT Marketplace",
        shortLbl: "Market",
        Icon: FaStore,
        needToBeLoggedIn: false,
      },
    ],
  },
];

const AppHeader = ({
  onLaunchMode,
  tokenBalance,
  menuItem,
  setMenuItem,
  handleLogout,
}: {
  onLaunchMode?: any;
  tokenBalance?: number;
  menuItem: number;
  setMenuItem: any;
  handleLogout: any;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address: mxAddress } = useGetAccountInfo();
  const [mxShowClaimsHistory, setMxShowClaimsHistory] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();

  const navigateToDiscover = (menuEnum: number) => {
    setMenuItem(menuEnum);

    if (isOpen) onClose();
  };

  const isMenuItemSelected = (currentMenuItem: number) => {
    return menuItem === currentMenuItem;
  };

  const menuButtonDisabledStyle = (currentMenuItem: number) => {
    let styleProps: any = {
      cursor: "not-allowed",
    };
    if (isMenuItemSelected(currentMenuItem) && colorMode === "dark") {
      styleProps = {
        backgroundColor: "#44444450",
        opacity: 0.6,
        ...styleProps,
      };
    } else if (isMenuItemSelected(currentMenuItem) && colorMode !== "dark") {
      styleProps = {
        backgroundColor: "#EDF2F7",
        ...styleProps,
      };
    }
    return styleProps;
  };

  const chainFriendlyName = CHAINS[_chainMeta.networkId as keyof typeof CHAINS];

  return (
    <>
      <Flex
        h="6rem"
        justifyContent={isMxLoggedIn ? "space-evenly" : "inherit"}
        paddingX={!isMxLoggedIn ? { base: 5, lg: 36 } : 0}
        alignItems="center"
        backgroundColor={colorMode === "light" ? "white" : "bgDark"}
        borderBottom="solid .1rem"
        borderColor="teal.200"
        paddingY="5">
        <HStack alignItems={"center"} backgroundColor="none" width="15rem">
          {isMxLoggedIn && (
            <IconButton
              size={"sm"}
              variant={"ghost"}
              icon={
                <MdMenu
                  style={{
                    transform: "translateX(65%)",
                  }}
                />
              }
              display={{
                md: "none",
              }}
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
              <Image boxSize="48px" height="auto" src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />
              <Heading display={{ base: "none", md: "block", xl: "block" }} size={"md"}>
                Itheum Data DEX
              </Heading>
            </HStack>
          </Link>
        </HStack>
        <Flex backgroundColor="none">
          <HStack alignItems={"center"} spacing={2}>
            <HStack display={{ base: "none", md: "block", xl: "block" }}>
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
                      isDisabled={isMenuItemSelected(menuEnum) || hasPendingTransactions}
                      _disabled={menuButtonDisabledStyle(menuEnum)}
                      key={shortLbl}
                      size={isMxLoggedIn ? "sm" : "md"}
                      onClick={() => navigateToDiscover(menuEnum)}>
                      <Flex justifyContent="center" alignItems="center" px={1.5} color="teal.200" pointerEvents="none">
                        <Icon size={"1.6em"} />
                        <Text pl={2} color={colorMode === "dark" ? "white" : "black"}>
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
                <ItheumTokenBalanceBadge tokenBalance={tokenBalance} displayParams={["none", null, "block"]} />
                <LoggedInChainBadge chain={chainFriendlyName} displayParams={["none", null, "block"]} />
                <Box display={{ base: "none", md: "block" }}>
                  {exploreRouterMenu.map((menu) => (
                    <Menu key={menu.sectionId}>
                      <MenuButton as={Button} size={"lg"} rightIcon={<TiArrowSortedDown size="18px" />}>
                        <ShortAddress address={mxAddress} fontSize="md" />
                      </MenuButton>
                      <MenuList maxW={"fit-content"}>
                        {menu.sectionItems.map((menuItem) => {
                          const { label, path, menuEnum, Icon } = menuItem;
                          return (
                            <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                              <MenuItem key={label} isDisabled={hasPendingTransactions} onClick={() => navigateToDiscover(menuEnum)} color="teal.200">
                                <Icon size={"1.25em"} style={{ marginRight: "1rem" }} />
                                <Text color={colorMode === "dark" ? "white" : "black"}>{label}</Text>
                              </MenuItem>
                            </Link>
                          );
                        })}

                        <MenuDivider />

                        <MenuGroup title="My Address Quick Copy">
                          <MenuItemOption closeOnSelect={false}>
                            <ShortAddress address={mxAddress} fontSize="sm" />
                          </MenuItemOption>

                          <MenuDivider />
                        </MenuGroup>

                        <MenuGroup>
                          {isMxLoggedIn && (
                            <ChainSupportedComponent feature={MENU.CLAIMS}>
                              <MenuItem closeOnSelect={false} isDisabled={hasPendingTransactions} onClick={() => setMxShowClaimsHistory(true)}>
                                <Text fontSize="sm">View claims history</Text>
                              </MenuItem>
                            </ChainSupportedComponent>
                          )}

                          <MenuItem onClick={handleLogout} fontSize="sm" isDisabled={hasPendingTransactions}>
                            Logout
                          </MenuItem>
                        </MenuGroup>
                      </MenuList>
                    </Menu>
                  ))}
                </Box>
                <Link as={ReactRouterLink} to={"/"}>
                  <IconButton
                    size={"lg"}
                    color="teal.200"
                    icon={<AiFillHome size={"1.4rem"} />}
                    aria-label={"Back to home"}
                    isDisabled={isMenuItemSelected(MENU.LANDING) || hasPendingTransactions}
                    _disabled={menuButtonDisabledStyle(MENU.LANDING)}
                    onClick={() => {
                      navigateToDiscover(MENU.LANDING);
                    }}
                  />
                </Link>
              </>
            )}

            {onLaunchMode && !isMxLoggedIn && <PopupChainSelectorForWallet onMxEnvPick={onLaunchMode} />}

            {/*Toggle Mode*/}
            {/*<Box display={{ base: "none", md: "block", xl: "block" }}>*/}
            {/*  <IconButton*/}
            {/*    size={"lg"}*/}
            {/*    icon={colorMode === "light" ? <MdDarkMode size={"1.4rem"} /> : <TbSunset2 size={"1.4rem"} />}*/}
            {/*    aria-label="Change Color Theme"*/}
            {/*    color="teal.200"*/}
            {/*    onClick={toggleColorMode}*/}
            {/*  />*/}
            {/*</Box>*/}
          </HStack>
        </Flex>
      </Flex>

      {mxShowClaimsHistory && (
        <ClaimsHistory mxAddress={mxAddress} networkId={_chainMeta.networkId} onAfterCloseChaimsHistory={() => setMxShowClaimsHistory(false)} />
      )}

      <Drawer placement={"left"} onClose={onClose} isOpen={isOpen} blockScrollOnMount={false}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"} display={"flex"} alignItems={"center"}>
            <Heading size={"sm"} onClick={onClose}>
              Itheum Data DEX
            </Heading>
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody p={0}>
            <Accordion allowMultiple>
              {exploreRouterMenu.map((menu) => (
                <AccordionItem key={menu.sectionId}>
                  {({ isExpanded }) => (
                    <>
                      <Text m={"2 !important"} pl={8} color="teal.200" fontWeight={"bold"}>
                        <ShortAddress address={mxAddress} fontSize="md" />
                      </Text>
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
                          View claims history
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
              <ItheumTokenBalanceBadge tokenBalance={tokenBalance} displayParams={["block", null, "none"]} />
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
  return quickMenuItem.needToBeLoggedIn ? (isMxLoggedIn ? "inline" : "none") : "inline";
}

function ItheumTokenBalanceBadge({ tokenBalance, displayParams }: { tokenBalance: any; displayParams: any }) {
  const { chainMeta: _chainMeta } = useChainMeta();

  return (
    <Box
      display={displayParams}
      fontSize={["xs", "md"]}
      minWidth="5.5rem"
      textAlign="center"
      color="black"
      bgColor="teal.200"
      borderRadius="md"
      h={"12"}
      paddingX="5"
      paddingY="14px">
      {tokenBalance === -1 ? (
        <Spinner size="xs" />
      ) : tokenBalance === -2 ? (
        <WarningTwoIcon />
      ) : (
        <>
          {CHAIN_TOKEN_SYMBOL(_chainMeta.networkId)} {formatNumberRoundFloor(tokenBalance)}
        </>
      )}
    </Box>
  );
}

function LoggedInChainBadge({ chain, displayParams }: { chain: any; displayParams: any }) {
  return (
    <Box
      display={displayParams}
      fontSize={["xs", "md"]}
      textAlign="center"
      color="teal.200"
      fontWeight="semibold"
      borderRadius="md"
      height="2rem"
      padding="6px 11px">
      {chain || "..."}
    </Box>
  );
}
