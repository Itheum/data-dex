import React, { useEffect, useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { NftMinter } from "@itheum/sdk-mx-data-nft/out";
import axios from "axios";
import { useParams } from "react-router-dom";

type ClaimRoyaltiesProps = {
  nftMinter: NftMinter;
  claimAddress: string;
};

export const ClaimRoyalties: React.FC<ClaimRoyaltiesProps> = (props) => {
  const { claimAddress } = props;
  const [viewAddressToken, setAddressToken] = useState<Array<Record<any, any>>>([{}]);

  const { minterAddress } = useParams();

  const getAddressToken = async () => {
    const url = `https://api.multiversx.com/accounts/${minterAddress}/tokens?size=10000`;
    const { data } = await axios.get(url);
    setAddressToken(data);
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
    </Box>
  );
};
