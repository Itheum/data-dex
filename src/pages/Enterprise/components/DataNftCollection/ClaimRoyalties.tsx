import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
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
    // request for minter tokens and egld balance
    const urlForExternalToken = `https://${getApi(chainID)}/accounts/${minterAddress}/tokens?size=10000`;
    const egldAccountBalance = `https://${getApi(chainID)}/accounts/${minterAddress}`;
    const { data: externalTokenData } = await axios.get(urlForExternalToken);
    const { data: egldBalance } = await axios.get(egldAccountBalance);
    // request for claims portal
    const getClaimsDatadex = await mxClaimsContract.getClaims(minterAddress ?? "");

    setAddressToken(externalTokenData);

    // setting the data from claims portal into claim object + adding egld balance
    if (getClaimsDatadex.data !== undefined) {
      const ithRoyaltiesFromDataDex: number = getClaimsDatadex?.data[3].amount;
      const ithRoyaltiesOutsideDataDex = viewAddressToken.find((item: Record<any, any>) => {
        return item.identifier === (chainID === "D" ? tokenContractAddress_Mx_Devnet : tokenContractAddress_Mx_Mainnet);
      });
      const ithRoyaltiesOutsideDataDexAmount: number = ithRoyaltiesOutsideDataDex?.amount;

      if (chainID === "D") {
        setClaimObject([
          {
            tokenIdentifier: tokenContractAddress_Mx_Devnet,
            amount: ithRoyaltiesOutsideDataDexAmount !== undefined ? ithRoyaltiesFromDataDex + ithRoyaltiesOutsideDataDexAmount : ithRoyaltiesFromDataDex,
          },
          {
            tokenIdentifier: "xEGLD",
            amount: Number(egldBalance.balance),
          },
        ]);
      } else {
        setClaimObject([
          {
            tokenIdentifier: tokenContractAddress_Mx_Mainnet,
            amount: ithRoyaltiesOutsideDataDexAmount !== undefined ? ithRoyaltiesFromDataDex + ithRoyaltiesOutsideDataDexAmount : ithRoyaltiesFromDataDex,
          },
          {
            tokenIdentifier: "xEGLD",
            amount: Number(egldBalance.balance),
          },
        ]);
      }
    }

    // adding to the claimObject the external tokens other than ith and egld
    return viewAddressToken.map((item) => {
      if (item) {
        setClaimObject([
          ...claimObject,
          {
            tokenIdentifier: item.identifier,
            amount: Number(item.balance),
          },
        ]);
      }
    });
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
  }, [claimObject.length]);

  return (
    <Box as="div" flexDirection="column" border="1px solid" borderColor="#00C79740" rounded="3xl" w={{ base: "auto", xl: "33%" }}>
      <Box bgColor="#00C7970D" roundedTop="3xl">
        <Text fontSize="1.5rem" fontFamily="Clash-Medium" px={10} py={4}>
          Royalty Claim
        </Text>
      </Box>
      {/*<Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">*/}
      {/*  Claims your royalties below. Note that once your click to claim they will go into your claimsAddress of {claimAddress}*/}
      {/*</Text>*/}
      <Flex flexDirection="column" gap={3}>
        {claimObject &&
          claimObject.map((token, index) => {
            return (
              <Flex key={index} px={10} py={4} flexDirection="row" justifyContent="space-between" alignItems="start" gap={1}>
                <Flex flexDirection="column">
                  <Text fontSize="lg">{token.tokenIdentifier?.split("-")[0]}</Text>
                  <Text fontSize="0.85rem" opacity=".6" fontFamily="Satoshi-Regular">
                    Available now
                  </Text>
                  <Text fontSize="2xl">{token.amount / 10 ** 18}</Text>
                </Flex>
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  onClick={() => claimRoyalties(token.tokenIdentifier)}
                  isDisabled={token.amount === 0}
                  mt={1}>
                  Claim token
                </Button>
              </Flex>
            );
          })}
      </Flex>
    </Box>
  );
};
