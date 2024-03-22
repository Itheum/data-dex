import React, { Fragment, useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Bond, BondContract, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { BondingParameters } from "./components/BondingParameters";
import { CollectionDashboard } from "./components/CollectionDashboard";
import { NoDataHere } from "../../components/Sections/NoDataHere";
import BigNumber from "bignumber.js";
import { useNavigate, useParams } from "react-router-dom";
import { CustomPagination } from "components/CustomPagination";
import useThrottle from "components/UtilComps/UseThrottle";

export const Bonding: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const bondContractAdminDevnet = import.meta.env.VITE_ENV_BONDING_ADMIN_DEVNET;
  const bondContractAdminMainnet = import.meta.env.VITE_ENV_BONDING_ADMIN_MAINNET;
  const bondContract = new BondContract(chainID === "D" ? "devnet" : "mainnet");
  DataNft.setNetworkConfig(chainID === "1" ? "mainnet" : "devnet");
  const [bondingDataNfts, setBondingDataNfts] = useState<Array<DataNft>>([]);
  const [contractBonds, setContractBonds] = useState<Bond[]>([]);
  const [totalAmountBonded, setTotalAmountBonded] = useState<number>(0);
  const navigate = useNavigate();

  // pagination
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 8;
  const { pageNumber } = useParams();
  const pageIndex = pageNumber ? Number(pageNumber) : 0;

  const setPageIndex = (newPageIndex: number) => {
    navigate(`/bonding${newPageIndex > 0 ? "/" + newPageIndex : ""}`);
  };

  const onGotoPage = useThrottle((newPageIndex: number) => {
    if (0 <= newPageIndex && newPageIndex < pageCount) {
      setPageIndex(newPageIndex);
    }
  });

  const checkIfUserIsAdmin = () => {
    //return true;
    if ((address && chainID === "D" && address === bondContractAdminDevnet) || (address && chainID === "1" && address === bondContractAdminMainnet)) {
      return true;
    }
  };

  useEffect(() => {
    (async () => {
      const _contractBonds = await bondContract.viewAllBonds();
      if (_contractBonds.length === 0) {
        return;
      }
      _contractBonds.forEach((bond) => {
        setTotalAmountBonded(
          (prev) =>
            prev +
            BigNumber(bond.bondAmount)
              .dividedBy(10 ** 18)
              .toNumber()
        );
      });
      setPageCount(Math.ceil(_contractBonds.length / pageSize));
      //console.log("ALL BONDS:", _contractBonds);

      //const pagedBonds = await bondContract.viewPagedBonds(Math.max(0, contractBonds.length - 50), contractBonds.length);
      //console.log("PAGED ", pagedBonds);
      // pagedBonds.forEach((bond) => {
      //   setTotalAmountBonded(
      //     (prev) =>
      //       prev +
      //       BigNumber(bond.bondAmount)
      //         .dividedBy(10 ** 18)
      //         .toNumber()
      //   );
      // });

      const dataNfts: DataNft[] = await DataNft.createManyFromApi(
        _contractBonds.reverse().map((bond) => ({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier }))
      );
      setContractBonds(_contractBonds);
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
          <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={5} bg="#1b1b1b50" mb={10}>
            <Flex justifyContent="space-between" alignItems="center" px={10}>
              <Flex flexDirection="column" justifyContent="center" w="full" gap={5}>
                <Flex flexDirection="row" justifyContent="space-between">
                  <Text fontSize="1.75rem" fontFamily="Clash-Medium" textColor="teal.200">
                    Collection Dashboard
                  </Text>{" "}
                  {contractBonds.length > 0 && (
                    <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                      <CustomPagination pageCount={pageCount} pageIndex={pageIndex} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
                    </Flex>
                  )}
                </Flex>
                {contractBonds.length === 0 ? (
                  <NoDataHere />
                ) : (
                  contractBonds.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize).map((bond, index) => (
                    <Fragment key={index}>
                      <CollectionDashboard bondNft={bond} bondDataNft={bondingDataNfts} />
                    </Fragment>
                  ))
                )}
                {contractBonds.length > 0 && (
                  <Flex justifyContent={{ base: "center", md: "center" }} py="5">
                    <CustomPagination pageCount={pageCount} pageIndex={pageIndex} gotoPage={onGotoPage} disabled={hasPendingTransactions} />
                  </Flex>
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
