import React, { Fragment, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Bond, BondContract, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from "bignumber.js";
import { useNavigate } from "react-router-dom";
import { IS_DEVNET } from "libs/config";
import { BondingParameters } from "./components/BondingParameters";
import { CollectionDashboard } from "./components/CollectionDashboard";
import { NoDataHere } from "../../components/Sections/NoDataHere";

export const Bonding: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContractAdminDevnet = import.meta.env.VITE_ENV_BONDING_ADMIN_DEVNET;
  const bondContractAdminMainnet = import.meta.env.VITE_ENV_BONDING_ADMIN_MAINNET;
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet");
  const [bondingDataNfts, setBondingDataNfts] = useState<Array<DataNft>>([]);
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [totalAmountBonded, setTotalAmountBonded] = useState<number>(0);
  const navigate = useNavigate();

  const checkIfUserIsAdmin = () => {
    const splittedAddresses = bondContractAdminDevnet.split(", ");
    if (!address) return false;
    const adminAddress: any = IS_DEVNET ? splittedAddresses : bondContractAdminMainnet;
    console.log(adminAddress.includes(address), address, adminAddress, address === adminAddress);
    return adminAddress.includes(address) || address === adminAddress;
  };

  // console.log()

  useEffect(() => {
    (async () => {
      const allContractBonds = await bondContract.viewAllBonds();
      if (allContractBonds.length === 0) {
        return;
      }
      const pagedBonds = await bondContract.viewPagedBonds(Math.max(0, allContractBonds.length - 50), allContractBonds.length - 1);
      let _totalAmountBonded = 0;
      pagedBonds.forEach((bond) => {
        _totalAmountBonded += BigNumber(bond.bondAmount)
          .dividedBy(10 ** 18)
          .toNumber();
      });
      setTotalAmountBonded(_totalAmountBonded);
      const dataNfts: DataNft[] = await DataNft.createManyFromApi(pagedBonds.map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier })));
      setContractBonds(pagedBonds.reverse());
      setBondingDataNfts(dataNfts);
    })();
  }, [hasPendingTransactions]);
  return (
    <>
      {checkIfUserIsAdmin() ? (
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
                  Total Bonded: {totalAmountBonded} $ITHEUM
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
      ) : (
        navigate("/")
      )}
    </>
  );
};
