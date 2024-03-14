import React, { Fragment, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BondingParameters } from "./components/BondingParameters";
import { CollectionDashboard } from "./components/CollectionDashboard";
import { Bond, BondContract, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { NoDataHere } from "../../components/Sections/NoDataHere";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";

export const Bonding: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContract = new BondContract(chainID === "D" ? "devnet" : "mainnet");
  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
  const [bondingDataNfts, setBondingDataNfts] = useState<Array<DataNft>>([]);
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);

  useEffect(() => {
    (async () => {
      const contractBonds = await bondContract.viewAllBonds();
      const myBonds = contractBonds.filter((bond) => bond.address === address);
      // console.log(myBonds);
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(myBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));
      setContractBonds(myBonds);
      setBondingDataNfts(dataNfts);
    })();
  }, [hasPendingTransactions]);
  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} gap={8}>
      <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={20} mt={5} bg="#1b1b1b50">
        <Flex justifyContent="space-between" alignItems="center" px={10}>
          <Flex flexDirection="column" justifyContent="center">
            <Text fontSize="3.1rem" fontFamily="Clash-Medium">
              Itheum Life: Bonding
            </Text>
          </Flex>
        </Flex>
      </Box>
      <BondingParameters />
      <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
        <Flex justifyContent="space-between" alignItems="center" px={10}>
          <Flex flexDirection="column" justifyContent="center">
            <Text fontSize="2rem" fontFamily="Clash-Medium" textColor="teal.200">
              Total Bonded: 30,000 $ITHEUM
            </Text>
          </Flex>
        </Flex>
      </Box>
      <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50">
        <Flex justifyContent="space-between" alignItems="center" px={10}>
          <Flex flexDirection="column" justifyContent="center" w="full" gap={5}>
            <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
              Collection Dashboard
            </Text>
            {contractBonds.length === 0 ? (
              <NoDataHere />
            ) : (
              contractBonds.map((bond, index) => (
                <Fragment key={index}>
                  <CollectionDashboard bondNft={bond} bondDataNft={bondingDataNfts} />
                </Fragment>
              ))
            )}
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};
