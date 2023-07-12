import React from "react";
import { FaBrush } from "react-icons/fa";
import { MdFavoriteBorder, MdOutlineShoppingBag } from "react-icons/md";
import { BsClockHistory } from "react-icons/bs";
import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useColorMode } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";

export const DataCreatorTabs: React.FC = () => {
  const { colorMode } = useColorMode();
  const profileTabs = [
    {
      tabName: "Created Data NFT(s)",
      icon: FaBrush,
      isDisabled: false,
      pieces: 12,
    },
    {
      tabName: "Listed Data NFT(s)",
      icon: MdOutlineShoppingBag,
      isDisabled: false,
      pieces: 1,
    },
    {
      tabName: "Owned Data NFT(s)",
      icon: MdFavoriteBorder,
      isDisabled: true,
    },
    {
      tabName: "Other NFT(s)/Reputation",
      icon: BsClockHistory,
      isDisabled: false,
    },
  ];

  return (
    <>
      <Tabs pt={10}>
        <TabList overflowX={{ base: "scroll", md: "scroll", xl: "unset", "2xl": "unset" }} maxW="100%" overflowY="hidden">
          {profileTabs.map((tab, index) => {
            return (
              <Tab key={index} isDisabled={tab.isDisabled} _selected={{ borderBottom: "5px solid", borderBottomColor: "teal.200" }}>
                <Flex ml="4.7rem" alignItems="center" py={3} overflow="hidden">
                  <Icon as={tab.icon} mx={2} size="0.95rem" textColor={colorMode === "dark" ? "white" : "black"} />
                  <Text fontSize="lg" fontWeight="medium" color={colorMode === "dark" ? "white" : "black"} w="max-content">
                    {tab.tabName}
                  </Text>
                  <Text fontSize="sm" px={2} color="whiteAlpha.800">
                    {tab.pieces}
                  </Text>
                </Flex>
              </Tab>
            );
          })}
        </TabList>
        <TabPanels>
          <TabPanel mt={2} width={"full"}>
            Hello im here
          </TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
          <TabPanel>Nothing here yet...</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};
