import React from "react";
import { Button, Text, Tooltip } from "@chakra-ui/react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { TRAILBLAZER_NONCES } from "libs/config";
import { networkIdBasedOnLoggedInStatus, getExplorerTrailBlazerURL } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";

export default function ExploreAppButton({ nonce, w, size }: { nonce: number; w?: string; size?: any }) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const networkId = networkIdBasedOnLoggedInStatus(isMxLoggedIn, _chainMeta.networkId);

  return (
    <>
      {TRAILBLAZER_NONCES[networkId].indexOf(nonce) >= 0 && (
        <Tooltip hasArrow label="Unlocks custom app on Itheum Explorer">
          <Button
            size={size ? size : "sm"}
            bgGradient="linear(to-r, #ffce00, #ff7201)"
            _hover={{
              bgGradient: "linear(to-r, #ff7201, #ffce00)",
            }}
            w={w ? w : "full"}
            onClick={() => {
              window.open(getExplorerTrailBlazerURL(networkId))?.focus();
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
