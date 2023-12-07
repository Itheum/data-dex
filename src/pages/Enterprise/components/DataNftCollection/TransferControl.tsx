import React, { useEffect, useState } from "react";
import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Image, Input, Text, Tooltip, useToast } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { useForm } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";
import * as Yup from "yup";
import dataDexLogo from "assets/img/enterprise/dataDexLogo.png";
import xoxnoLogo from "assets/img/enterprise/xoxnoLogo.png";

type TransferControlFormType = {
  addressToSetRoleForTransfer: string;
};

type TransferControlProps = {
  nftMinter: NftMinter;
  viewContractConfig: ContractConfiguration;
};
export const TransferControl: React.FC<TransferControlProps> = (props) => {
  const { nftMinter, viewContractConfig } = props;
  const toast = useToast();

  const [viewTransferRoles, setViewTransferRoles] = useState<Array<string>>([]);

  const { hasPendingTransactions } = useGetPendingTransactions();
  const { address } = useGetAccountInfo();
  const { chainID } = useGetNetworkConfig();

  const validationSchema = Yup.object().shape({
    addressToSetRoleForTransfer: Yup.string().required("You have to enter the address to allow!"),
  });
  const setRoles = async (senderAddress: IAddress) => {
    if (!viewContractConfig.rolesAreSet) {
      await sendTransactions({
        transactions: [nftMinter.setLocalRoles(senderAddress)],
      });
    } else {
      toast({
        title: "Roles already set",
        description: "Base role for collection already set.",
        status: "warning",
        isClosable: true,
        duration: 20000,
      });
    }
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<TransferControlFormType>({
    defaultValues: {
      addressToSetRoleForTransfer: "",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    (async () => {
      const getTransferRoles = await nftMinter.viewTransferRoles();

      setViewTransferRoles(getTransferRoles);
    })();
  }, [hasPendingTransactions]);

  const setTransferRole = async (addressToSet: string) => {
    const tx = nftMinter.setTransferRole(new Address(address), new Address(addressToSet));
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const unsetTransferRole = async (addressToUnset: string) => {
    const tx = nftMinter.unsetTransferRole(new Address(address), new Address(addressToUnset));
    tx.setGasLimit(100000000);
    await sendTransactions({
      transactions: [tx],
    });
  };

  const quickAdd = (marketplace: string) => {
    const dataDexDevnet = "erd1qqqqqqqqqqqqqpgqlhewm06p4c9qhq32p239hs45dvry948tfsxshx3e0l";
    const dataDexMainnet = "erd1qqqqqqqqqqqqqpgqay2r64l9nhhvmaqw4qanywfd0954w2m3c77qm7drxc";
    const xoxnoDevnet = "erd1qqqqqqqqqqqqqpgql0dnz6n5hpuw8cptlt00khd0nn4ja8eadsfq2xrqw4";
    const xoxnoMainnet = "erd1qqqqqqqqqqqqqpgq6wegs2xkypfpync8mn2sa5cmpqjlvrhwz5nqgepyg8";
    if (chainID === "D") {
      if (marketplace === "dataDex") {
        setTransferRole(dataDexDevnet);
      } else {
        setTransferRole(xoxnoDevnet);
      }
    } else {
      if (marketplace === "dataDex") {
        setTransferRole(dataDexMainnet);
      } else {
        setTransferRole(xoxnoMainnet);
      }
    }
  };

  const onSubmit = (data: TransferControlFormType) => {
    setTransferRole(data.addressToSetRoleForTransfer);
  };

  return (
    <Box as="div" flexDirection="column">
      <Text fontSize="1.5rem" fontFamily="Clash-Bold" color="teal.200">
        Transfer Control:
      </Text>
      <Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" pb={3}>
        Use these settings to control the “soulbound” nature of your tokens
      </Text>
      <Button onClick={() => setRoles(new Address(address))} colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
        Make collection Non-Transferable
      </Button>

      <Text size="1rem" opacity=".7" fontFamily="Satoshi-Medium" fontWeight="light" py={1}>
        * Set the “base roles” for the minter to make NFTs non-transferable
      </Text>

      <Flex flexDirection="column" justifyItems="start" alignItems="start" gap={3}>
        <Text fontSize="xl" fontFamily="Clash-Medium" pt={4}>
          Addresses allowed to transfer:
        </Text>

        <Flex flexDirection={"row"} flexWrap="wrap" gap={4} justifyContent="space-between" wordBreak="break-word">
          {viewTransferRoles.map((role, index) => {
            return (
              <Flex key={index} justifyContent="center" alignItems="center">
                <Box background="transparent" border="1px solid" borderColor="teal.200" rounded="lg" roundedEnd="0px">
                  <Text color="teal.200" p={2}>
                    {role}
                  </Text>
                </Box>
                <Tooltip label="Exclude address" aria-label="Exclude address">
                  <Button size="md" variant="outline" color="red.200" borderColor="red.200" roundedStart="0px" ml="2px" onClick={() => unsetTransferRole(role)}>
                    <AiOutlineClose />
                  </Button>
                </Tooltip>
              </Flex>
            );
          })}
        </Flex>

        <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={5} fontSize="xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.addressToSetRoleForTransfer} id="addressToSetRoleForTransfer" isRequired minH={"6.25rem"}>
              <FormLabel fontWeight="bold" fontSize="md">
                Allow Address to Transfer:
              </FormLabel>
              <Input mt="1 !important" {...register("addressToSetRoleForTransfer", { required: "Address is required!" })} />
              <FormErrorMessage>{errors?.addressToSetRoleForTransfer?.message}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
              Allow
            </Button>
          </form>
        </Flex>

        <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={5} fontSize="xl" justifyContent="center" alignItems="center">
          <Text fontSize="xl" fontFamily="Clash-Medium">
            Quick Add
          </Text>
          <Box width="3.5rem" h="1.5rem">
            <Image src={dataDexLogo} alt="data dex logo" style={{ cursor: "pointer" }} onClick={() => quickAdd("dataDex")} />
          </Box>

          <Box width="3.5rem">
            <Image src={xoxnoLogo} alt="data dex logo" style={{ cursor: "pointer" }} onClick={() => quickAdd("xoxno")} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
