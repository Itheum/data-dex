import React from "react";
import { CloseButton, Drawer, DrawerContent, DrawerHeader, DrawerOverlay, HStack, useColorMode } from "@chakra-ui/react";

type TradeForm = {
  isOpen: boolean;
};
export const TradeForm: React.FC<TradeForm> = (props) => {
  const { isOpen } = props;
  const { colorMode } = useColorMode();

  const onClose = () => {
    return;
  };
  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="xl" closeOnEsc={true} closeOnOverlayClick={true}>
      <DrawerOverlay backdropFilter="blur(10px)" />
      <DrawerContent>
        <DrawerHeader bgColor={colorMode === "dark" ? "#181818" : "bgWhite"}>
          <HStack spacing="5">
            <CloseButton
              size="lg"
              onClick={() => {
                onClose();
              }}
            />
          </HStack>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};
