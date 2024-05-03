import React, { useEffect } from "react";
import { Box, Button, Flex, FormControl, FormErrorMessage, Input, Text } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { BondContract, Compensation, createTokenIdentifier, DataNft } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { BlacklistModal } from "./BlacklistModal";
import { ProposalButton } from "../../../components/ProposalButton";
import ShortAddress from "../../../components/UtilComps/ShortAddress";
import { IS_DEVNET } from "../../../libs/config";

type CompensationDashboardProps = {
  compensationBondNft: Compensation;
  bondDataNft: Array<DataNft>;
};

type CompensationDashboardFormType = {
  compensationEndDate: Date;
  blacklistAddresses: string;
};

export const CompensationDashboard: React.FC<CompensationDashboardProps> = (props) => {
  const { compensationBondNft, bondDataNft } = props;
  const { address } = useGetAccountInfo();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const isMultiSig = import.meta.env.VITE_MULTISIG_STATE;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [addressRefund, setAddressRefund] = React.useState<Record<any, any>>({});

  const validationSchema = Yup.object().shape({
    compensationEndDate: Yup.date().required("Required"),
    blacklistAddresses: Yup.string().required("Required"),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<CompensationDashboardFormType>({
    defaultValues: {
      compensationEndDate: new Date(),
      blacklistAddresses: "erd",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const compensationEndDate = watch("compensationEndDate");
  const blacklistAddresses = watch("blacklistAddresses");

  useEffect(() => {
    (async () => {
      if (compensationBondNft.endDate === 0) return;
      const data = await bondContract.viewAddressRefundForCompensation(new Address(address), compensationBondNft.tokenIdentifier, compensationBondNft.nonce);
      setAddressRefund(data);
    })();
  }, []);

  const handleInitiateRefund = async (tokenIdentifier: string, nonce: number, timestamp: Date) => {
    const timestampDate = new Date(timestamp).getTime() / 1000;
    const tx = bondContract.initiateRefund(new Address(address), tokenIdentifier, nonce, timestampDate);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const handleInitiateBlacklistLoad = async (compensationId: number, addresses: string) => {
    const splittedAddresses = addresses.split(",").map((addressModified: string) => new Address(addressModified.trim()));

    const tx = bondContract.setBlacklist(new Address(address), compensationId, splittedAddresses);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const handleOpenBlacklistModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <Flex flexDirection="column" w="full" gap={5}>
      <Flex flexDirection="row" gap={5}>
        <Box w="full">
          {bondDataNft.map((dataNft, index) => {
            if (dataNft.tokenIdentifier === createTokenIdentifier(compensationBondNft.tokenIdentifier, compensationBondNft.nonce)) {
              return (
                <Flex flexDirection="column" key={index}>
                  <Flex justifyContent="space-between" py={10}>
                    <Flex flexDirection="column" w="50%">
                      <Text fontSize="1.5rem">{dataNft.tokenName}</Text>
                      <Text fontSize="1.1rem">
                        Creator: <ShortAddress address={dataNft.creator} fontSize="1.1rem" />
                      </Text>
                      {compensationBondNft.endDate * 1000 === 0 ? (
                        <></>
                      ) : (
                        <>
                          {new Date().getTime() < new Date(compensationBondNft.endDate).getTime() ? (
                            <Text fontSize="1.4rem" fontWeight="600" textColor="indianred">
                              {BigNumber(compensationBondNft.accumulatedAmount)
                                .dividedBy(10 ** 18)
                                .toNumber()}{" "}
                              $ITHEUM Penalties can be claimed
                            </Text>
                          ) : (
                            <Text fontSize="1.4rem" fontWeight="600" textColor="teal.200">
                              Compensation claiming is live
                            </Text>
                          )}
                        </>
                      )}
                    </Flex>
                    <Flex flexDirection="column" w="50%">
                      <Text fontSize="1.35rem" fontWeight="600" pb={2}>
                        Compensation End Date:{" "}
                        {compensationBondNft.endDate * 1000 !== 0 ? new Date(compensationBondNft.endDate * 1000).toDateString() : "Not Set"}
                      </Text>
                      <form onSubmit={handleSubmit(() => handleInitiateRefund(dataNft.collection, dataNft.nonce, compensationEndDate))}>
                        <FormControl isInvalid={!!errors.compensationEndDate} isRequired minH={"3.5rem"}>
                          <Flex flexDirection="row" alignItems="center" gap={3}>
                            <Controller
                              control={control}
                              render={({ field: { onChange } }) => (
                                <Input
                                  mt="1 !important"
                                  id="compensationEndDate"
                                  type="datetime-local"
                                  w="40%"
                                  onChange={(event) => {
                                    onChange(event.target.value);
                                  }}
                                />
                              )}
                              name={"compensationEndDate"}
                            />
                            <FormErrorMessage>{errors?.compensationEndDate?.message}</FormErrorMessage>
                            {isMultiSig === "false" ? (
                              <Button colorScheme="teal" type="submit">
                                Set
                              </Button>
                            ) : (
                              <ProposalButton
                                proposalTitle={"Set Compensation End Data"}
                                proposalDescription={`This is a propose to change the Compensation Date to ${new Date(compensationEndDate).toDateString()}`}
                                contractAddress={bondContract.getContractAddress().bech32()}
                                endpoint={"initiateRefund"}
                                proposalArguments={[dataNft.tokenIdentifier, dataNft.nonce, new Date(compensationEndDate).getTime() / 1000]}
                              />
                            )}
                          </Flex>
                        </FormControl>
                      </form>
                      <Text fontSize="1.20rem" fontWeight="600">
                        Deposited Data NFT&apos;s for Claiming Compensation
                      </Text>
                      <Flex alignItems="center" gap={6} pt={3} w="full">
                        <img src={dataNft.nftImgUrl} width="15%" />
                        <Flex flexDirection="column" w="full">
                          {addressRefund && addressRefund.refund?.compensationId === compensationBondNft.compensationId ? (
                            <Flex gap={1} h="5rem" overflowY="scroll">
                              <Text>
                                Depositor: <ShortAddress address={addressRefund.refund.address} fontSize="1rem" /> |
                              </Text>
                              <Text>Amount: {addressRefund.refund.proofOfRefund.amount} </Text>
                            </Flex>
                          ) : (
                            <></>
                          )}
                        </Flex>
                      </Flex>
                      <Text fontSize="1.20rem" fontWeight="600" pt={3}>
                        Blacklist Load Window
                      </Text>
                      <form onSubmit={handleSubmit(() => handleInitiateBlacklistLoad(compensationBondNft.compensationId, blacklistAddresses))}>
                        <FormControl isInvalid={!!errors.blacklistAddresses} isRequired minH={"3.5rem"}>
                          <Flex flexDirection="row" alignItems="center" gap={3}>
                            <Controller
                              control={control}
                              render={({ field: { onChange } }) => (
                                <Input
                                  mt="1 !important"
                                  id="blacklistAddresses"
                                  type="text"
                                  w="40%"
                                  onChange={(event) => {
                                    onChange(event.target.value);
                                  }}
                                />
                              )}
                              name={"blacklistAddresses"}
                            />
                            <Button colorScheme="teal" type="submit">
                              Load
                            </Button>
                            <Button colorScheme="teal" variant="outline" onClick={handleOpenBlacklistModal}>
                              View Blacklist
                            </Button>
                          </Flex>
                          <FormErrorMessage>{errors?.blacklistAddresses?.message}</FormErrorMessage>
                        </FormControl>
                      </form>
                    </Flex>
                  </Flex>
                  <BlacklistModal isModalOpen={isModalOpen} onModalClose={handleOpenBlacklistModal} compensationId={compensationBondNft.compensationId} />
                </Flex>
              );
            }
          })}
        </Box>
      </Flex>
    </Flex>
  );
};
