import React from "react";
import { useParams } from "react-router-dom";
import TokenTxTable from "Tables/TokenTxTable";

export default function DataNFTDetails() {
  const { tokenId } = useParams();



  return <TokenTxTable page={1} tokenId={tokenId} />;
}