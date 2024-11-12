import React from "react";
import { Button } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";
import { Text } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import { useGetLoginInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { PREVIEW_DATA_ON_DEVNET_SESSION_KEY } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { shouldPreviewDataBeEnabled, viewDataDisabledMessage, isNFMeIDVaultClassDataNFT } from "libs/utils";

type PreviewDataButtonPropType = {
  previewDataURL: string;
  buttonSize?: any;
  buttonWidth?: string;
  tokenName?: string | undefined;
};

export default function PreviewDataButton(props: PreviewDataButtonPropType) {
  const { loginMethod } = useGetLoginInfo();
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const [previewDataOnDevnetSession] = useLocalStorage(PREVIEW_DATA_ON_DEVNET_SESSION_KEY, null);
  const { colorMode } = useColorMode();
  const { previewDataURL, buttonSize = "sm", buttonWidth = "full", tokenName } = props;
  const isNFMeIDVaultDataNFT = isNFMeIDVaultClassDataNFT(tokenName);

  return previewDataURL && !isNFMeIDVaultDataNFT ? (
    <Tooltip
      colorScheme="teal"
      hasArrow
      label={viewDataDisabledMessage(loginMethod)}
      isDisabled={shouldPreviewDataBeEnabled(chainID, loginMethod, previewDataOnDevnetSession)}>
      <Button
        size={buttonSize}
        colorScheme="teal"
        w={buttonWidth}
        variant="outline"
        isDisabled={!shouldPreviewDataBeEnabled(chainID, loginMethod, previewDataOnDevnetSession)}
        onClick={() => {
          window.open(previewDataURL);
        }}>
        <Text py={3} color={colorMode === "dark" ? "white" : "black"}>
          Preview Data
        </Text>
      </Button>
    </Tooltip>
  ) : (
    <Box height="37px">&nbsp;</Box>
  );
}
