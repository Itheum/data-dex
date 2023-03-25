import React, { useState, useEffect } from "react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import {
  Flex,
  Heading,
  Image,
  HStack,
  Button,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  IconButton,
  Link,
  Box,
  Spinner,
  Stack,
  Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuDivider,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerCloseButton, DrawerBody, Accordion, AccordionItem, AccordionButton, AccordionPanel, List, ListIcon, ListItem,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { AiFillHome } from "react-icons/ai";
import { MdDarkMode, MdExpandLess, MdExpandMore, MdLightMode, MdMenu } from "react-icons/md";
import { MdOutlineAccountBalanceWallet, MdOutlineDataSaverOn, MdOnlinePrediction } from "react-icons/md";
import { Link as ReactRouterLink } from "react-router-dom";

import logoSmlD from "img/logo-sml-d.png";
import logoSmlL from "img/logo-sml-l.png";
import {
  CHAINS,
  CHAIN_TOKEN_SYMBOL,
  formatNumberRoundFloor,
  MENU,
} from "libs/util";
import ClaimsHistory from "MultiversX/ClaimsHistory";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";
import ChainSupportedComponent from "UtilComps/ChainSupportedComponent";
import ShortAddress from "UtilComps/ShortAddress";

const exploreRouterMenu = [
  {
    sectionId: "Movies",
    sectionLabel: "Movies",
    sectionItems: [
      {
        menuEnum: MENU.SELL,
        path: "tradedata",
        label: "Trade Data",
        shortLbl: "Trade",
        Icon: MdOutlineDataSaverOn,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.NFTMINE,
        path: "datanfts/wallet",
        label: "Data NFT Wallet",
        shortLbl: "Wallet",
        Icon: MdOutlineAccountBalanceWallet,
        needToBeLoggedIn: true,
      },
      {
        menuEnum: MENU.NFTALL,
        path: "datanfts/marketplace/market/0",
        label: "Data NFT Marketplace",
        shortLbl: "Market",
        Icon: MdOnlinePrediction,
        needToBeLoggedIn: false,
      },
    ],
  },
];

const AppHeader = ({ onLaunchMode, tokenBalance, menuItem, setMenuItem, handleLogout }: { onLaunchMode?: any, tokenBalance?: number, menuItem: number, setMenuItem: any, handleLogout: any }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user: _user } = useUser();
  const { chainMeta: _chainMeta } = useChainMeta();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address: mxAddress } = useGetAccountInfo();
  const [mxShowClaimsHistory, setMxShowClaimsHistory] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();

  // useEffect(() => {
  //   console.log('********** AppHeader LOAD _chainMeta ', _chainMeta);
  //   console.log('********** AppHeader LOAD _user ', _user);
  // }, []);

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
    if (isMenuItemSelected(currentMenuItem)) {
      styleProps = {
        opacity: 1,
        ...styleProps,
      };
    }
    return styleProps;
  };

  const chainFriendlyName = CHAINS[_chainMeta.networkId as keyof typeof CHAINS];

  return (
    <>
      <Flex
        h="5rem"
        alignItems="center"
        backgroundColor={colorMode === "light" ? "white" : "black"}
        borderBottom="solid .1rem"
        borderColor="teal.300"
        p="5">

        <HStack alignItems={"center"} backgroundColor="none" width="15rem">
          {isMxLoggedIn &&
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
          }

          <Link
            as={ReactRouterLink}
            to={isMxLoggedIn ? "/home" : "/"}
            style={{ textDecoration: "none", pointerEvents: hasPendingTransactions ? "none" : undefined }}
            onClick={() => {
              navigateToDiscover(isMxLoggedIn ? MENU.HOME : MENU.LANDING);
            }}>
            <HStack>
              <Image boxSize="48px" height="auto" src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />
              <Heading size={"md"}>
                Itheum Data DEX
              </Heading>
            </HStack>
          </Link>
        </HStack>

        <Flex backgroundColor="none" flex="1" justifyContent="right">
          <HStack alignItems={"center"} spacing={2}>
            <HStack display={{ base: "none", md: "none", xl: "block" }}>
              {exploreRouterMenu[0].sectionItems.map((quickMenuItem) => {
                const { path, menuEnum, shortLbl, Icon } = quickMenuItem;
                return (
                  <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path} display={shouldDisplayquickMenuItem(quickMenuItem, isMxLoggedIn)}>
                    <Button
                      colorScheme="teal"
                      variant="outline"
                      isDisabled={isMenuItemSelected(menuEnum) || hasPendingTransactions}
                      _disabled={menuButtonDisabledStyle(menuEnum)}
                      opacity={0.6}
                      key={shortLbl}
                      leftIcon={<Icon size={"1.25em"} />}
                      size="sm"
                      onClick={() => navigateToDiscover(menuEnum)}>
                      {shortLbl}
                    </Button>
                  </Link>
                );
              })}
            </HStack>
            {isMxLoggedIn &&
              <>
                <ItheumTokenBalanceBadge tokenBalance={tokenBalance} displayParams={["none", null, "block"]} />
                <LoggedInChainBadge chain={chainFriendlyName} displayParams={["none", null, "block"]} />
                <Box display={{ base: "none", md: "block" }}>
                  {exploreRouterMenu.map((menu) => (
                    <Menu key={menu.sectionId}>
                      <MenuButton as={Button} size={"sm"} rightIcon={<MdExpandMore />}>
                        <ShortAddress address={mxAddress} fontSize="md" />
                      </MenuButton>
                      <MenuList maxW={"fit-content"}>
                        {menu.sectionItems.map((menuItem) => {
                          const { label, path, menuEnum, Icon } = menuItem;
                          return (
                            <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                              <MenuItem key={label} isDisabled={hasPendingTransactions} onClick={() => navigateToDiscover(menuEnum)}>
                                <Icon size={"1.25em"} style={{ marginRight: "1rem" }} />
                                {label}
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
                </Box><Link as={ReactRouterLink} to={"home"} style={{ textDecoration: "none" }}>
                  <IconButton
                    size={"sm"}
                    icon={<AiFillHome />}
                    aria-label={"Back to Home"}
                    isDisabled={isMenuItemSelected(MENU.HOME) || hasPendingTransactions}
                    _disabled={menuButtonDisabledStyle(MENU.HOME)}
                    opacity={0.6}
                    onClick={() => {
                      navigateToDiscover(MENU.HOME);
                    }} />
                </Link><IconButton size="sm" icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />} aria-label="Change Color Theme" onClick={toggleColorMode} /></>
            }
          </HStack>
          {(onLaunchMode && !isMxLoggedIn) && <PopupChainSelectorForWallet onMxEnvPick={onLaunchMode} />}
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
                      <AccordionButton display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                        <Text m={0} fontWeight={"bold"}>
                          <ShortAddress address={mxAddress} fontSize="md" />
                        </Text>
                        {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                      </AccordionButton>
                      <AccordionPanel p={0}>
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
                      </AccordionPanel>
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
          <Button colorScheme="teal" fontSize={{ base: "sm", md: "md" }}>
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

function shouldDisplayquickMenuItem(quickMenuItem: any, isMxLoggedIn: boolean) {
  return quickMenuItem.needToBeLoggedIn ? isMxLoggedIn ? "inline" : "none" : "inline";
}

function ItheumTokenBalanceBadge({ tokenBalance, displayParams }: { tokenBalance: any; displayParams: any }) {
  const { chainMeta: _chainMeta } = useChainMeta();

  return (
    <Box
      display={displayParams}
      fontSize={["xs", "md"]}
      minWidth="5.5rem"
      textAlign="center"
      color="white"
      fontWeight="bold"
      borderRadius="md"
      height="2rem"
      padding="6px 11px"
      bgGradient="linear(to-l, #7928CA, #FF0080)">
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
      color="rgb(243, 183, 30)"
      fontWeight="bold"
      bg="rgba(243, 132, 30, 0.05)"
      borderRadius="md"
      height="2rem"
      padding="6px 11px">
      {chain || "..."}
    </Box>
  );
}