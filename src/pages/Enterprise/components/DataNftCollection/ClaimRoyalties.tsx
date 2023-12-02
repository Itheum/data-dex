import React, { useEffect, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { NftMinter } from "@itheum/sdk-mx-data-nft/out";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getApi } from "../../../../libs/MultiversX/api";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { ClaimsContract } from "../../../../libs/MultiversX/claims";
import { Factory } from "@itheum/sdk-mx-enterprise/out";
import { Address } from "@multiversx/sdk-core/out";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { tokenContractAddress_Mx_Devnet, tokenContractAddress_Mx_Mainnet } from "libs/contractAddresses";

type ClaimRoyaltiesProps = {
  nftMinter: NftMinter;
  claimAddress: string;
};

type claimRoyaltiesType = {
  tokenIdentifier: string;
  amount: number;
};

export const ClaimRoyalties: React.FC<ClaimRoyaltiesProps> = (props) => {
  const { nftMinter, claimAddress } = props;
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const mxClaimsContract = new ClaimsContract(chainID);
  const factory = new Factory("devnet");
  const [viewAddressToken, setAddressToken] = useState<Array<Record<any, any>>>([{}]);
  const [claimObject, setClaimObject] = useState<Array<Record<any, any>>>([{}]);

  const { minterAddress } = useParams();

  const getAddressToken = async () => {
    const urlForExternalToken = `https://${getApi(chainID)}/accounts/${minterAddress}/tokens?size=10000`;
    const { data } = await axios.get(urlForExternalToken);
    const getClaimsDatadex = await mxClaimsContract.getClaims(minterAddress ?? "");

    setAddressToken(data);

    if (getClaimsDatadex.data !== undefined) {
      const ithRoyaltiesFromDataDex: number = getClaimsDatadex?.data[3].amount;
      const ithRoyaltiesOutsideDataDex = viewAddressToken.filter((item: any) => {
        if (item.identifier === (chainID === "D" ? tokenContractAddress_Mx_Devnet : tokenContractAddress_Mx_Mainnet)) {
          return item.amount;
        }
      });
      const totalIthRoyaltiesToClaim: number = 0;

      console.log(typeof ithRoyaltiesOutsideDataDex);
      // if(ithRoyaltiesOutsideDataDex.tokenIdenfier)

      setClaimObject(
        claimObject.map(() => {
          if (chainID === "D") {
            return {
              tokenIdentifier: tokenContractAddress_Mx_Devnet,
              amount: ithRoyaltiesFromDataDex,
            };
          } else {
            return {
              tokenIdentifier: tokenContractAddress_Mx_Mainnet,
              amount: ithRoyaltiesFromDataDex,
            };
          }
        })
      );
    }
  };

  const claimRoyalties = async (tokenIdentifierToClaim: string) => {
    const tx = nftMinter.claimRoyalties(new Address(address), tokenIdentifierToClaim);
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  useEffect(() => {
    getAddressToken();
  }, []);

  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" color="teal.200">
        Claim your Royalties!
      </Text>
      <Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
        Claims your royalties below. Note that once your click to claim they will go into your claimsAddress of {claimAddress}
      </Text>
      {claimObject.map((token, index) => {
        return (
          <Button colorScheme="teal" size="lg" key={index} onClick={() => claimRoyalties(token.tokenIdentifier)} isDisabled={token.amount === 0} mt={1}>
            {token.amount} {token.tokenIdentifier?.split("-")[0]}
          </Button>
        );
      })}
      {/*{amountToClaim.map((token, index) => {*/}
      {/*  if (token.amount !== 0) {*/}
      {/*    return (*/}
      {/*      <Button colorScheme="teal" size="lg" key={index} onClick={() => claimRoyalties()}>*/}
      {/*        {token.amount / 10 ** 18}&nbsp;{factoryClaimToken.split("-")[0]}*/}
      {/*      </Button>*/}
      {/*    );*/}
      {/*  } else {*/}
      {/*    return (*/}
      {/*      <Button colorScheme="teal" size="lg" key={index} onClick={() => claimRoyalties()}>*/}
      {/*        0&nbsp;{factoryClaimToken.split("-")[0]}*/}
      {/*      </Button>*/}
      {/*    );*/}
      {/*  }*/}
      {/*})}*/}
    </Box>
  );
};
