import React from "react";
import { Button, Text, Tooltip } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { TRAILBLAZER_NONCES } from "libs/config";
import { routeChainIDBasedOnLoggedInStatus, getExplorerTrailBlazerURL } from "libs/utils";

export default function ExploreAppButton({ nonce, w, size }: { nonce: number; w?: string; size?: any }) {
  const { chainID } = useGetNetworkConfig();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const routedChainID = routeChainIDBasedOnLoggedInStatus(isMxLoggedIn, chainID);

  return (
    <>
      {TRAILBLAZER_NONCES[routedChainID].indexOf(nonce) >= 0 && (
        <Tooltip hasArrow label="Unlocks custom app on Itheum Explorer">
          <Button
            size={size ? size : "sm"}
            bgGradient="linear(to-r, #ffce00, #ff7201)"
            _hover={{
              bgGradient: "linear(to-r, #ff7201, #ffce00)",
            }}
            w={w ? w : "full"}
            onClick={() => {
              window.open(getExplorerTrailBlazerURL(routedChainID))?.focus();
            }}>
            <Text py={3} color="black">
              Explore
            </Text>
          </Button>
        </Tooltip>
      )}
    </>
  );
}
