import React from "react";
import { Button, Text, Tooltip, Box } from "@chakra-ui/react";
import { useGetLoginInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { EXPLORER_APP_SUPPORTED_TOKENS, EXPLORER_APP_FOR_TOKEN } from "libs/config";

export default function ExploreAppButton({
  collection,
  nonce,
  w,
  size,
  fontSize,
  customLabel,
  customMargin,
}: {
  collection: string;
  nonce: number;
  w?: object;
  size?: any;
  fontSize?: any;
  customLabel?: string;
  customMargin?: number;
}) {
  const { chainID } = useGetNetworkConfig();
  const { tokenLogin } = useGetLoginInfo();

  const shouldShowTheButton = () => {
    const tokenMap = EXPLORER_APP_SUPPORTED_TOKENS[chainID];
    for (const key in tokenMap) {
      for (const token of tokenMap[key]) {
        if (token.tokenIdentifier === collection && token.nonce === nonce) {
          return true;
        }
      }
    }
    return false;
  };

  const shouldShowTheButtonVariable = shouldShowTheButton();

  return (
    <>
      {shouldShowTheButtonVariable && (
        <Box m={customMargin ? customMargin : "initial"}>
          <Tooltip hasArrow label="Unlocks custom app on Itheum Explorer">
            <Button
              size={size ? size : "sm"}
              bgGradient="linear(to-r, #ffce00, #ff7201)"
              _hover={{
                bgGradient: "linear(to-r, #ff7201, #ffce00)",
              }}
              w={w ? w : "full"}
              onClick={() => {
                const appNonceMappings = EXPLORER_APP_SUPPORTED_TOKENS[chainID];

                let appKey = undefined;
                // find the app key id based on nonce
                for (const key of Object.keys(appNonceMappings)) {
                  for (const token of appNonceMappings[key]) {
                    if (token.tokenIdentifier === collection && token.nonce === nonce) {
                      appKey = key;
                      break;
                    }
                  }
                }

                if (appKey) {
                  if (tokenLogin && tokenLogin.nativeAuthToken) {
                    window.open(`${EXPLORER_APP_FOR_TOKEN[chainID][appKey]}/?accessToken=${tokenLogin?.nativeAuthToken}`)?.focus();
                  } else {
                    window.open(`${EXPLORER_APP_FOR_TOKEN[chainID][appKey]}`)?.focus();
                  }
                }
              }}>
              <Text py={3} color="black" fontSize={fontSize ? fontSize : ""}>
                {customLabel ? customLabel : "Open App"}
              </Text>
            </Button>
          </Tooltip>
        </Box>
      )}
    </>
  );
}
