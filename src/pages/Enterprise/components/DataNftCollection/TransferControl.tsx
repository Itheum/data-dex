import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Flex, FormControl, FormErrorMessage, FormLabel, IconButton, Image, Input, Text, Tooltip, useToast } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { ContractConfiguration, NftMinter } from "@itheum/sdk-mx-data-nft/out";
import { Address, IAddress } from "@multiversx/sdk-core/out";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import { useForm } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";
import * as Yup from "yup";
import dataDexLogo from "assets/img/enterprise/dataDexLogo.png";
import xoxnoLogo from "assets/img/enterprise/xoxnoLogo.png";
import { IS_DEVNET } from "libs/config";
import ShortAddress from "../../../../components/UtilComps/ShortAddress";

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
    if (IS_DEVNET) {
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
      <Text fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200">
        Transfer Control:
      </Text>
      <Text fontSize="1rem" opacity=".7" fontFamily="Satoshi-Regular" py={1}>
        Make Collection Transferable
      </Text>
      <Button onClick={() => setRoles(new Address(address))} colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
        Enable
      </Button>

      <Text fontSize="0.85rem" opacity=".7" fontFamily="Satoshi-Regular" py={1}>
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
                <ButtonGroup size="sm" isAttached variant="outline" colorScheme="teal">
                  <Box border="1px solid" borderColor="teal.200" rounded="lg" roundedRight="0px">
                    <Text color="teal.200" px={2} cursor="default" pt={0.5}>
                      <ShortAddress address={role} fontSize="lg" />
                    </Text>
                  </Box>

                  <Tooltip label="Exclude address" aria-label="Exclude address">
                    <IconButton
                      aria-label="Exclude Address"
                      icon={<AiOutlineClose />}
                      roundedLeft="0"
                      bgColor="#00C7970D"
                      onClick={() => unsetTransferRole(role)}
                    />
                  </Tooltip>
                </ButtonGroup>
              </Flex>
            );
          })}
          {viewTransferRoles.length === 0 && (
            <Text color="#B86350" fontSize="md">
              *No addresses yet
            </Text>
          )}
        </Flex>

        <Flex pt={2} fontSize="xl" w="full">
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <FormControl isInvalid={!!errors.addressToSetRoleForTransfer} id="addressToSetRoleForTransfer" isRequired minH={"6rem"}>
              <FormLabel fontWeight="bold" fontSize="md">
                Allow Address to Transfer:
              </FormLabel>
              <Flex flexDirection="row" alignItems="center" gap={2}>
                <Input {...register("addressToSetRoleForTransfer", { required: "Address is required!" })} w="80%" placeholder="Enter Address" />
                <Button type="submit" variant="outline" colorScheme="teal" isLoading={hasPendingTransactions} loadingText="Loading">
                  Allow
                </Button>
              </Flex>
              <FormErrorMessage>{errors?.addressToSetRoleForTransfer?.message}</FormErrorMessage>
            </FormControl>
          </form>
        </Flex>

        <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pb={5} fontSize="xl" justifyContent="center" alignItems="center">
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
