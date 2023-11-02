import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, Flex, Link, Text } from "@chakra-ui/react";
import { DeployedContract, Factory } from "@itheum/sdk-mx-enterprise/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import ShortAddress from "../../components/UtilComps/ShortAddress";
import { useWindowSize } from "../../libs/utils/UseWindowSize";
import { CHAIN_TX_VIEWER } from "../../libs/config";
import { ExternalLinkIcon } from "@chakra-ui/icons";

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

  const [minterVersion, setMinterVersion] = useState<string>("");

  const { chainID } = useGetNetworkConfig();
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const factory = new Factory("devnet");
  const windowSize = useWindowSize();
  // const factoryAddress = factory.getContractAddress();
  // const dataNftMinter = new NftMinter(process.env.REACT_APP_ENV_NETWORK ?? "", factoryAddress);

  const deployNewMinter = async (senderAddress: IAddress, version: string) => {
    console.log(factory.deployContract(senderAddress, version));
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
      <Box>
        <Text fontSize="36px" fontFamily="Clash-Medium" mt="10">
          Itheum Enterprise
        </Text>
        <Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light">
          Management Dashboard
        </Text>
      </Box>
      <Flex pt={3}>
        {isWhitelistNeeded ? (
          <>
            {isAddressWhitelisted ? (
              <Flex flexDirection="row" justifyItems="center" alignItems="center">
                <Box rounded="full" bgColor="green" h={3} w={3}></Box>
                <Text>&nbsp;You are whitelisted to use Itheum Enterprise</Text>
              </Flex>
            ) : (
              <Flex flexDirection="row" justifyItems="center" alignItems="center">
                <Box rounded="full" bgColor="red" h={3} w={3}></Box>
                <Text>&nbsp;You are NOT whitelisted yet. Get Whitelisted today (should go to a landing page)</Text>
              </Flex>
            )}
          </>
        ) : (
          <Flex flexDirection="row" justifyItems="center" alignItems="center">
            <Box rounded="full" bgColor="green" h={3} w={3}></Box>
            <Text>&nbsp;You are whitelisted to use Itheum Enterprise</Text>
          </Flex>
        )}
      </Flex>
      <Box as="div" flexDirection="column">
        <Text fontSize="2xl" fontFamily="Clash-Bold" pb={2}>
          Enterprise Factory Settings:
        </Text>
        <Text fontSize="lg">Protocol Tax: {factoryTaxPercentage}%</Text>
        <Text fontSize="lg">
          Protocol Treasury: {factoryTreasuryAddress?.toString()}&nbsp;
          <Link
            href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${factoryTreasuryAddress?.toString()}`}
            isExternal
            textColor="teal.200">
            <ExternalLinkIcon />
          </Link>
        </Text>
        <Text fontSize="lg">
          Claims Contract: {claimsContractAddress?.toString()}&nbsp;
          <Link
            href={`${CHAIN_TX_VIEWER[chainID as keyof typeof CHAIN_TX_VIEWER]}/accounts/${claimsContractAddress?.toString()}`}
            isExternal
            textColor="teal.200">
            <ExternalLinkIcon />
          </Link>
        </Text>
        <Text fontSize="lg">Claims Token: {claimsTokenIdentifier}</Text>
      </Box>
      <Flex flexDirection={{ base: "column", md: "row" }} gap={4}>
        <Text fontSize="2xl" fontFamily="Clash-Bold">
          Available Data NFT Minter software versions:
        </Text>
        <Flex flexDirection={"row"} alignItems="center" justifyContent={{ base: "center", md: "start" }} gap={4}>
          {factoryVersions.map((version, index) => {
            return (
              <Box key={index}>
                {minterVersion === version ? (
                  <Button onClick={() => setMinterVersion(version)} size="sm" colorScheme="teal">
                    {version}
                  </Button>
                ) : (
                  <Button onClick={() => setMinterVersion(version)} size="sm" colorScheme="teal" variant="outline">
                    {version}
                  </Button>
                )}
              </Box>
            );
          })}
        </Flex>
      </Flex>
      <Box as="div" flexDirection="column">
        <Text fontSize="2xl" fontFamily="Clash-Bold" pb={2}>
          Your Enterprise Data NFT Minters
        </Text>
        <Flex flexDirection={"row"} flexWrap="wrap" gap={4} justifyContent="space-between" wordBreak="break-word">
          {viewAddressContracts.map((contractAddress, index) => {
            return (
              <Box key={index}>
                <Button px={3} py={1.5} size="lg" w="auto" colorScheme="teal" variant="outline">
                  <Flex flexDirection="column" gap={1.5}>
                    <Text textAlign="left">v{contractAddress.version}</Text>
                    <Text textAlign="left">
                      {windowSize.width <= 650 ? <ShortAddress address={contractAddress.address} fontSize="md" /> : contractAddress.address}
                    </Text>
                  </Flex>
                </Button>
              </Box>
            );
          })}
        </Flex>
      </Box>
      <Box as="div" flexDirection="column" justifyItems="center" alignItems="center">
        <Text fontSize="2xl" fontFamily="Clash-Bold" pb={2}>
          Ready to deploy a new minter?
        </Text>
        <Flex flexDirection="row" alignItems="center" justifyContent="space-between" gap={4}>
          <Flex mt="4 !important" flexDirection="column">
            <Button
              colorScheme="teal"
              variant="outline"
              size={{ base: "sm", md: "md" }}
              fontSize={{ base: "sm", md: "lg" }}
              onClick={() => window.open("https://itheum.com/legal/termsofuse")}>
              Read Terms of Use
            </Button>
            <Checkbox size="sm" pt={3} isChecked={readTermsChecked} onChange={(e) => setReadTermsChecked(e.target.checked)}>
              I have read all terms and agree to them
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
      </Box>
    </Flex>
  );
};
