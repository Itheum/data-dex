import React from "react";
import { Button, Text, Tooltip } from "@chakra-ui/react";
import { useGetLoginInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { EXPLORER_APP_SUPPORTED_NONCES, EXPLORER_APP_FOR_NONCE } from "libs/config";

export default function ExploreAppButton({ nonce, w, size, fontSize }: { nonce: number; w?: object; size?: any; fontSize?: any }) {
  const { chainID } = useGetNetworkConfig();
  const { tokenLogin } = useGetLoginInfo();

  return (
    <>
      {Object.values(EXPLORER_APP_SUPPORTED_NONCES[chainID]).flat().indexOf(nonce) >= 0 && (
        <Tooltip hasArrow label="Unlocks custom app on Itheum Explorer">
          <Button
            size={size ? size : "sm"}
            bgGradient="linear(to-r, #ffce00, #ff7201)"
            _hover={{
              bgGradient: "linear(to-r, #ff7201, #ffce00)",
            }}
            w={w ? w : "full"}
            onClick={() => {
              const appNonceMappings = EXPLORER_APP_SUPPORTED_NONCES[chainID];

              // find the app key id based on nonce
              const appKey = Object.keys(appNonceMappings).find((_appKey) => {
                return appNonceMappings[_appKey].includes(nonce);
              });

              if (appKey) {
                if (tokenLogin && tokenLogin.nativeAuthToken) {
                  window.open(`${EXPLORER_APP_FOR_NONCE[chainID][appKey]}/?accessToken=${tokenLogin?.nativeAuthToken}`)?.focus();
                } else {
                  window.open(`${EXPLORER_APP_FOR_NONCE[chainID][appKey]}`)?.focus();
                }
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
