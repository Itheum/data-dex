import React from "react";
import { Compensation, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Box, Flex, Text } from "@chakra-ui/react";
import ShortAddress from "../../../components/UtilComps/ShortAddress";
import BigNumber from "bignumber.js";

type CompensationDashboardProps = {
  compensationBondNft: Compensation;
  bondDataNft: Array<DataNft>;
};

export const CompensationDashboard: React.FC<CompensationDashboardProps> = (props) => {
  const { compensationBondNft, bondDataNft } = props;
  // console.log(compensationBondNft, bondDataNft);
  return (
    <Flex flexDirection="column" w="full" gap={5}>
      <Flex flexDirection="row" gap={5}>
        <Box w="full">
          {bondDataNft.map((dataNft, index) => {
            if (dataNft.tokenIdentifier === compensationBondNft.tokenIdentifier + "-" + compensationBondNft.nonce.toString(16)) {
              return (
                <Flex flexDirection="column" key={index}>
                  <Flex justifyContent="space-between" py={10}>
                    <Flex flexDirection="column">
                      <Text fontSize="1.5rem">{dataNft.tokenName}</Text>
                      <Text fontSize="1.1rem">
                        Creator: <ShortAddress address={dataNft.creator} fontSize="1.1rem" />
                      </Text>
                      <Text fontSize="1.4rem" fontWeight="600" textColor="indianred">
                        {BigNumber(compensationBondNft.accumulatedAmount)
                          .dividedBy(10 ** 18)
                          .toNumber()}{" "}
                        $ITHEUM Penalties can be claimed
                      </Text>
                      <Text fontSize="1.4rem" fontWeight="600" textColor="teal.200">
                        Compensation claiming is live
                      </Text>
                    </Flex>
                    <Flex flexDirection="column">
                      <Text fontSize="1.35rem" fontWeight="600">
                        Compensation End Date: {new Date(compensationBondNft.endDate * 1000).toDateString()}
                      </Text>
                      <Text fontSize="1.35rem" fontWeight="600">
                        Deposited Data NFT&apos;s for Claiming Compensation
                      </Text>
                      <Flex alignItems="center">
                        <Box pt={10}>
                          <img src={dataNft.nftImgUrl} width="15%" />
                        </Box>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              );
            }
          })}
        </Box>
      </Flex>
    </Flex>
  );
};
