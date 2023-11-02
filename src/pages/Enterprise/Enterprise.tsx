import React, { useEffect, useState } from "react";
import { Badge, Box, Button, Checkbox, Flex, Text } from "@chakra-ui/react";
import { Factory } from "@itheum/sdk-mx-enterprise/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";

export const Enterprise: React.FC = () => {
  const [isAddressWhitelisted, setAddressWhitelisted] = useState<boolean>(false);
  const [isWhitelistNeeded, setWhitelistNeeded] = useState<boolean>(false);
  const [factoryTaxPercentage, setFactoryTaxPercentage] = useState<number>(0);
  const [factoryVersions, setFactoryVersions] = useState<Array<string>>([]);
  const [factoryTreasuryAddress, setFactoryTreasuryAddress] = useState<IAddress>(new Address());
  const [claimsContractAddress, setClaimsContractAddress] = useState<IAddress>(new Address());
  const [claimsTokenIdentifier, setClaimsTokenIdentifier] = useState<string>("");
  // const [viewAddressContracts, setViewAddressContracts] = useState<Array<DeployedContract>>([]);
  const [readTermsChecked, setReadTermsChecked] = useState<boolean>(false);

  const { address } = useGetAccountInfo();
  const factory = new Factory("devnet");
  // const factoryAddress = factory.getContractAddress();
  // const dataNftMinter = new NftMinter(process.env.REACT_APP_ENV_NETWORK ?? "", factoryAddress);
  // console.log(dataNftMinter);
  // console.log(factoryTreasuryAddress?.toString());

  // console.log(whitelistedAddress);

  useEffect(() => {
    (async () => {
      const whitelistedAddress = await factory.viewAddressIsWhitelisted(new Address(address));
      const whitelistNeeded = await factory.viewWhitelistState();
      const factoryTax = await factory.viewTaxPercentage();
      const _factoryVersions = await factory.viewVersions();
      const factoryAddress = await factory.viewTreasuryAddress();
      const claimAddress = await factory.viewClaimsContractAddress();
      const claimToken = await factory.viewClaimsTokenIdentifier();
      // const contractAddress = await factory.viewAddressContracts(new Address(address));

      setAddressWhitelisted(whitelistedAddress);
      setWhitelistNeeded(whitelistNeeded);
      setFactoryTaxPercentage(factoryTax);
      setFactoryVersions(_factoryVersions);
      setFactoryTreasuryAddress(factoryAddress);
      setClaimsContractAddress(claimAddress);
      setClaimsTokenIdentifier(claimToken);
      // setViewAddressContracts(contractAddress);
      // console.log(whitelistNeeded);
    })();
  }, []);
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
        {isAddressWhitelisted && isWhitelistNeeded ? (
          <Flex flexDirection="row" justifyItems="center" alignItems="center">
            <Box rounded="full" bgColor="green" h={3} w={3}></Box>
            <Text>You are whitelisted to use Itheum Enterprise</Text>
          </Flex>
        ) : (
          <Flex flexDirection="row" justifyItems="center" alignItems="center">
            <Box rounded="full" bgColor="red" h={3} w={3}></Box>
            <Text>&nbsp;You are NOT whitelisted yet. Get Whitelisted today (should go to a landing page) {isWhitelistNeeded}</Text>
          </Flex>
        )}
      </Flex>
      <Box as="div" flexDirection="column">
        <Text fontSize="2xl" fontFamily="Clash-Bold" pb={2}>
          Enterprise Factory Settings:
        </Text>
        <Text fontSize="lg">Protocol Tax: {factoryTaxPercentage}%</Text>
        <Text fontSize="lg">Protocol Treasury: {factoryTreasuryAddress?.toString()}</Text>
        <Text fontSize="lg">Claims Contract: {claimsContractAddress?.toString()}</Text>
        <Text fontSize="lg">Claims Token: {claimsTokenIdentifier}</Text>
      </Box>
      <Flex flexDirection={{ base: "column", md: "row" }} gap={4}>
        <Text fontSize="2xl" fontFamily="Clash-Bold" pb={2}>
          Available Data NFT Minter software versions:
        </Text>
        <Flex flexDirection={"row"} alignItems="center" gap={4}>
          {factoryVersions.map((version, index) => {
            return (
              <Badge key={index} px={3} py={1.5} _hover={{ cursor: "pointer" }}>
                {version}
              </Badge>
            );
          })}
        </Flex>
      </Flex>
      <Box as="div" flexDirection="column">
        <Text fontSize="2xl" fontFamily="Clash-Bold" pb={2}>
          Your Enterprise Data NFT Minters
        </Text>
        {/*{viewAddressContracts.map((contractAddress, index) => {*/}
        {/*  return (*/}
        {/*    <Badge key={index} px={3} py={1.5} _hover={{ cursor: "pointer" }}>*/}
        {/*      <Flex>*/}
        {/*        <Text>{contractAddress.version}</Text>*/}
        {/*        <Text>{contractAddress.address}</Text>*/}
        {/*      </Flex>*/}
        {/*    </Badge>*/}
        {/*  );*/}
        {/*})}*/}
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
          <Button colorScheme="teal">Deplay new Minter</Button>
        </Flex>
      </Box>
    </Flex>
  );
};
