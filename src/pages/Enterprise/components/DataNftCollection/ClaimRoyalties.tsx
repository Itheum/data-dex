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

type ClaimRoyaltiesProps = {
  nftMinter: NftMinter;
  claimAddress: string;
};

export const ClaimRoyalties: React.FC<ClaimRoyaltiesProps> = (props) => {
  const { nftMinter, claimAddress } = props;
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const mxClaimsContract = new ClaimsContract(chainID);
  const factory = new Factory("devnet");
  const [viewAddressToken, setAddressToken] = useState<Array<Record<any, any>>>([{}]);
  const [amountToClaim, setAmountToClaim] = useState<Array<any>>([{}]);
  const [factoryClaimToken, setFactoryClaimToken] = useState<string>("");

  const { minterAddress } = useParams();

  const getAddressToken = async () => {
    const url = `https://${getApi(chainID)}/accounts/${minterAddress}/tokens?size=10000`;
    const { data } = await axios.get(url);
    const claimsDatadex = await mxClaimsContract.getClaims(minterAddress ?? "");
    const getFactoryClaimToken = await factory.viewClaimsTokenIdentifier();

    setAddressToken(data);
    setAmountToClaim(claimsDatadex?.data ?? []);
    setFactoryClaimToken(getFactoryClaimToken);
  };

  const claimRoyalties = async () => {
    const tx = nftMinter.claimRoyalties(new Address(address), factoryClaimToken);
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
      {viewAddressToken.map((token, index) => {
        return (
          <Button colorScheme="teal" size="lg" key={index}>
            {token.name} {token.type}
          </Button>
        );
      })}
      {amountToClaim.map((token, index) => {
        if (token.amount !== 0) {
          return (
            <Button colorScheme="teal" size="lg" key={index} onClick={() => claimRoyalties()}>
              {token.amount / 10 ** 18}&nbsp;{factoryClaimToken.split("-")[0]}
            </Button>
          );
        }
      })}
    </Box>
  );
};
