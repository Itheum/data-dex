import React from "react";
import { Button, Text, Tooltip } from "@chakra-ui/react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { EXPLORER_APP_SUPPORTED_NONCES, EXPLORER_APP_FOR_NONCE } from "libs/config";
import { networkIdBasedOnLoggedInStatus } from "libs/utils";
import { useChainMeta } from "store/ChainMetaContext";

export default function ExploreAppButton({ nonce, w, size, fontSize }: { nonce: number; w?: any; size?: any; fontSize?: any }) {
  const { chainMeta: _chainMeta } = useChainMeta();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const networkId = networkIdBasedOnLoggedInStatus(isMxLoggedIn, _chainMeta.networkId);

  return (
    <>
      {Object.values(EXPLORER_APP_SUPPORTED_NONCES[networkId]).flat().indexOf(nonce) >= 0 && (
        <Tooltip hasArrow label="Unlocks custom app on Itheum Explorer">
          <Button
            size={size ? size : "sm"}
            bgGradient="linear(to-r, #ffce00, #ff7201)"
            _hover={{
              bgGradient: "linear(to-r, #ff7201, #ffce00)",
            }}
            w={w ? w : "full"}
            onClick={() => {
              const appNonceMappings = EXPLORER_APP_SUPPORTED_NONCES[networkId];

              // find the app key id based on nonce
              const appKey = Object.keys(appNonceMappings).find((_appKey) => {
                return appNonceMappings[_appKey].includes(nonce);
              });

              if (appKey) {
                window.open(EXPLORER_APP_FOR_NONCE[networkId][appKey])?.focus();
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
