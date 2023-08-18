import React from "react";
import { Button, Text, Tooltip } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { EXPLORER_APP_SUPPORTED_NONCES, EXPLORER_APP_FOR_NONCE } from "libs/config";
import { getExplorerTrailBlazerURL, routeChainIDBasedOnLoggedInStatus } from "libs/utils";

export default function ExploreAppButton({ nonce, w, size, fontSize }: { nonce: number; w?: object; size?: any; fontSize?: any }) {
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const routedChainID = routeChainIDBasedOnLoggedInStatus(isMxLoggedIn, chainID);

  return (
    <>
      {Object.values(EXPLORER_APP_SUPPORTED_NONCES[routedChainID]).flat().indexOf(nonce) >= 0 && (
        <Tooltip hasArrow label="Unlocks custom app on Itheum Explorer">
          <Button
            size={size ? size : "sm"}
            bgGradient="linear(to-r, #ffce00, #ff7201)"
            _hover={{
              bgGradient: "linear(to-r, #ff7201, #ffce00)",
            }}
            w={w ? w : "full"}
            onClick={() => {
              const appNonceMappings = EXPLORER_APP_SUPPORTED_NONCES[routedChainID];

              // find the app key id based on nonce
              const appKey = Object.keys(appNonceMappings).find((_appKey) => {
                return appNonceMappings[_appKey].includes(nonce);
              });

              if (appKey) {
                window.open(EXPLORER_APP_FOR_NONCE[routedChainID][appKey])?.focus();
              }
            }}>
            <Text py={3} color="black" fontSize={fontSize ? fontSize : ""}>
              Explore
            </Text>
          </Button>
        </Tooltip>
      )}
    </>
  );
}
