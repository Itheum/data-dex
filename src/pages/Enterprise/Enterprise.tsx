import React, { useEffect, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Button, Checkbox, Flex, Link, Text } from "@chakra-ui/react";
import { DeployedContract, Factory } from "@itheum/sdk-mx-enterprise/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { useNavigate } from "react-router-dom";
import { gtagGo } from "libs/utils";
import ShortAddress from "../../components/UtilComps/ShortAddress";
import { CHAIN_TX_VIEWER } from "../../libs/config";

export const Enterprise: React.FC = () => {
  const [isAddressWhitelisted, setAddressWhitelisted] = useState<boolean>(false);
  const [isWhitelistNeeded, setWhitelistNeeded] = useState<boolean>(false);
  const [factoryTaxPercentage, setFactoryTaxPercentage] = useState<number>(0);
  const [factoryVersions, setFactoryVersions] = useState<Array<string>>([]);
  const [factoryTreasuryAddress, setFactoryTreasuryAddress] = useState<IAddress>(new Address());
  const [claimsContractAddress, setClaimsContractAddress] = useState<IAddress>(new Address());
  const [claimsTokenIdentifier, setClaimsTokenIdentifier] = useState<string>("");
  const [viewAddressContracts, setViewAddressContracts] = useState<Array<DeployedContract>>([]);
  const [readTermsChecked, setReadTermsChecked] = useState<boolean>(false);

  const [minterVersion, setMinterVersion] = useState<string>("2.0.0");

  const navigate = useNavigate();
  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const factory = new Factory("devnet");

  const deployNewMinter = async (senderAddress: IAddress, version: string) => {
    // console.log(factory);
    await sendTransactions({
      transactions: [factory.deployContract(senderAddress, version)],
    });
  };

  useEffect(() => {
    (async () => {
      const whitelistedAddress = await factory.viewAddressIsWhitelisted(new Address(address));
      const whitelistNeeded = await factory.viewWhitelistState();
      const factoryTax = await factory.viewTaxPercentage();
      const _factoryVersions = await factory.viewVersions();
      const factoryAddress = await factory.viewTreasuryAddress();
      const claimAddress = await factory.viewClaimsContractAddress();
      const claimToken = await factory.viewClaimsTokenIdentifier();
      const contractAddress = await factory.viewAddressContracts(new Address(address));

      setAddressWhitelisted(whitelistedAddress);
      setWhitelistNeeded(whitelistNeeded);
      setFactoryTaxPercentage(factoryTax);
      setFactoryVersions(_factoryVersions);
      setFactoryTreasuryAddress(factoryAddress);
      setClaimsContractAddress(claimAddress);
      setClaimsTokenIdentifier(claimToken);
      setViewAddressContracts(contractAddress);
    })();
  }, [hasPendingTransactions]);

  return (
    <Flex as="div" flexDirection="column" mx={{ base: 10, lg: 24 }} textAlign={{ base: "center", lg: "start" }} gap={8}>
      <Box border="1px solid" borderColor="#00C79740" rounded="3xl" px={10} py={20} mt={5} bg="#1b1b1b50">
        <Flex justifyContent="space-between" alignItems="center" px={10}>
          <Flex flexDirection="column" justifyContent="center">
            <Text fontSize="3.1rem" fontFamily="Clash-Medium">
              Itheum Enterprise
            </Text>
            <Text fontSize="1.75rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" mt="-3">
              Management Dashboard
            </Text>
          </Flex>
          <Flex>
            {isWhitelistNeeded ? (
              <>
                {isAddressWhitelisted ? (
                  <Flex flexDirection="column" justifyItems="center" alignItems="start">
                    <Flex justifyItems="start" alignItems="center">
                      <Text fontSize="1.15rem" color="gray">
                        Whitelist Status:&nbsp;
                      </Text>
                      <Text>Active&nbsp;</Text>
                      <Box rounded="full" bgColor="teal.200" h={2} w={2} mt={1}></Box>
                    </Flex>
                    <Text fontSize="0.85rem" color="teal.200" fontFamily="Satoshi-Regular">
                      Congratulations, you are whitelisted!
                    </Text>
                    <Button
                      as={Link}
                      variant="solid"
                      colorScheme="teal"
                      px={5}
                      py={6}
                      rounded="lg"
                      isDisabled
                      mt={4}
                      onClick={() => {
                        gtagGo("gwl", "join", "hero");
                      }}
                      href="https://share-eu1.hsforms.com/1h2V8AgnkQJKp3tstayTsEAf5yjc"
                      isExternal>
                      Get Whitelisted Today
                    </Button>
                  </Flex>
                ) : (
                  <Flex flexDirection="column" justifyItems="center" alignItems="start">
                    <Flex justifyItems="start" alignItems="center">
                      <Text fontSize="1.15rem" color="gray">
                        Whitelist Status:&nbsp;
                      </Text>
                      <Text>Not Active&nbsp;</Text>
                      <Box rounded="full" bgColor="#B86350" h={2} w={2} mt={1}></Box>
                    </Flex>
                    <Text fontSize="0.85rem" color="#B86350" fontFamily="Satoshi-Regular">
                      Oops, You are not yet Whitelisted!
                    </Text>
                    <Button
                      as={Link}
                      variant="solid"
                      colorScheme="teal"
                      px={5}
                      py={6}
                      rounded="lg"
                      mt={4}
                      onClick={() => {
                        gtagGo("gwl", "join", "hero");
                      }}
                      href="https://share-eu1.hsforms.com/1h2V8AgnkQJKp3tstayTsEAf5yjc"
                      isExternal>
                      Get Whitelisted Today
                    </Button>
                  </Flex>
                )}
              </>
            ) : (
              <Flex flexDirection="column" justifyItems="center" alignItems="start">
                <Flex justifyItems="start" alignItems="center">
                  <Text fontSize="1.15rem" color="gray">
                    Whitelist Status:&nbsp;
                  </Text>
                  <Text>Active&nbsp;</Text>
                  <Box rounded="full" bgColor="teal.200" h={2} w={2} mt={1}></Box>
                </Flex>
                <Text fontSize="0.85rem" color="teal.200" fontFamily="Satoshi-Regular">
                  Congratulations, you are whitelisted!
                </Text>
                <Button
                  as={Link}
                  variant="solid"
                  colorScheme="teal"
                  px={5}
                  py={6}
                  rounded="lg"
                  isDisabled
                  mt={4}
                  onClick={() => {
                    gtagGo("gwl", "join", "hero");
                  }}
                  href="https://share-eu1.hsforms.com/1h2V8AgnkQJKp3tstayTsEAf5yjc"
                  isExternal>
                  Get Whitelisted Today
                </Button>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Box>
      <Flex flexDirection={{ base: "column", xl: "row" }} gap="5">
        <Box as="div" flexDirection="column" border="1px solid" borderColor="#00C79740" rounded="3xl" w={{ base: "auto", xl: "35%" }}>
          <Flex bgColor="#00C7970D" roundedTop="3xl">
            <Text fontSize="1.5rem" fontFamily="Clash-Medium" px={10} py={4}>
              Enterprise Factory Settings:
            </Text>
          </Flex>
          <Flex flexDirection="column" px={10} py={4} bg="#1b1b1b50" roundedBottom="3xl" gap={3} h={{ base: "72%", "2xl": "82%" }}>
            <Text fontSize="lg">Protocol Tax: {factoryTaxPercentage}%</Text>
            <Text fontSize="lg">
              Protocol Treasury: <ShortAddress address={factoryTreasuryAddress?.toString()} fontSize="md" />
              <Link
                href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${factoryTreasuryAddress?.toString()}`}
                isExternal
                textColor="teal.200">
                <ExternalLinkIcon />
              </Link>
            </Text>
            <Text fontSize="lg">
              Claims Contract: <ShortAddress address={claimsContractAddress?.toString()} fontSize="md" />
              <Link
                href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${claimsContractAddress?.toString()}`}
                isExternal
                textColor="teal.200">
                <ExternalLinkIcon />
              </Link>
            </Text>
            <Text fontSize="lg">Claims Token: {claimsTokenIdentifier}</Text>
          </Flex>
        </Box>

        <Flex flexDirection="column" border="0.01rem solid" borderColor="#00C79740" rounded="3xl" w={{ base: "auto", xl: "65%" }}>
          <Box bgColor="#00C7970D" roundedTop="3xl">
            <Text fontSize="1.5rem" fontFamily="Clash-Medium" px={10} py={4}>
              Data NFT Minter
            </Text>
          </Box>
          <Flex justifyContent="space-between" alignItems="center" px={10} bg="#1b1b1b50">
            <Text fontSize="1rem" fontFamily="Satoshi-Regular" pr={3} py={4}>
              Select your desired Data NFT Minter Software version:
            </Text>
            <Flex alignItems="center" gap={3}>
              {factoryVersions.map((version, index) => {
                return (
                  <Box key={index}>
                    {minterVersion === version ? (
                      <Button onClick={() => setMinterVersion(version)} size="sm" colorScheme="teal">
                        Version {version}
                      </Button>
                    ) : (
                      <Button onClick={() => setMinterVersion(version)} size="sm" colorScheme="teal" variant="outline">
                        Version {version}
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Flex>
          </Flex>
          <Flex flexDirection="column" gap={4} alignItems="start" px={10} bg="#1b1b1b50">
            <Text fontSize="1rem" fontFamily="Satoshi-Regular" pr={3} py={4} whiteSpace="nowrap">
              Previously selected Data NFT Minter:
            </Text>
            <Flex flexDirection={"row"} gap={4} justifyContent="space-between" alignItems="center" wordBreak="break-word" w="full" overflowX="scroll">
              {viewAddressContracts.length > 0 ? (
                viewAddressContracts
                  .map((contractAddress, index) => {
                    return (
                      <Box key={index}>
                        <Button
                          mb={4}
                          px={3}
                          py={1.5}
                          size="lg"
                          w="auto"
                          colorScheme="teal"
                          variant="outline"
                          onClick={() => navigate(`${contractAddress.address}`)}>
                          <Flex flexDirection="row" gap={1.5}>
                            <Text textAlign="left" color="white">
                              Version{contractAddress.version}
                            </Text>
                            (<ShortAddress address={contractAddress.address} fontSize="sm" />)
                          </Flex>
                        </Button>
                      </Box>
                    );
                  })
                  .reverse()
              ) : (
                <Text color="#B86350">*No data yet</Text>
              )}
            </Flex>
          </Flex>
          <Flex justifyContent="space-between" alignItems="center" px={10} bg="#1b1b1b50" pt={7} roundedBottom="3xl" pb={4}>
            <Flex mt="4 !important" flexDirection="column">
              <Checkbox size="sm" pt={3} isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
                I have read and agree to the&nbsp;
                <a target="_blank" href="https://itheum.com/legal/datadex/termsofuse#enterprise" rel="noreferrer" style={{ color: "#00C797" }}>
                  terms of use
                </a>
              </Checkbox>
            </Flex>
            <Box>
              <Button
                colorScheme="teal"
                onClick={() => deployNewMinter(new Address(address), minterVersion)}
                isDisabled={!readTermsChecked || minterVersion === ""}
                size={{ base: "sm", md: "lg" }}>
                Deploy new Minter
              </Button>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
