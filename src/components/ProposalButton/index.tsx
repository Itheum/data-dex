import React from "react";
import { Button } from "@chakra-ui/react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { ProposalDeepLinkBuilder } from "@peerme/sdk";
import { IS_DEVNET, PEERME_TEAM_NAME } from "../../libs/config";

type ProposalButtonProps = {
  proposalTitle: string;
  proposalDescription: string;
  contractAddress: string;
  endpoint: string;
  proposalArguments: any;
  isDisabled?: boolean;
};

export const ProposalButton: React.FC<ProposalButtonProps> = (props) => {
  const { contractAddress, endpoint, proposalTitle, proposalDescription, proposalArguments, isDisabled } = props;
  const { tokenLogin } = useGetLoginInfo();

  const addDeeplinkUrl = () => {
    const url = new ProposalDeepLinkBuilder(PEERME_TEAM_NAME, { network: IS_DEVNET ? "devnet" : "mainnet" })
      .authenticate(tokenLogin?.nativeAuthToken ?? "")
      .setTitle(`${proposalTitle}`)
      .setDescription(`${proposalDescription}`)
      .addAction(contractAddress, `${endpoint}`, 0, [proposalArguments], [])
      .build();
    return window.open(url, "_blank");
  };

  return (
    <Button type="button" ml={3} colorScheme="teal" isDisabled={isDisabled} onClick={() => addDeeplinkUrl()}>
      Proposal
    </Button>
  );
};
