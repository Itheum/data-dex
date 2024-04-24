import React, { useEffect, useState } from "react";
import { BondContract, Compensation } from "@itheum/sdk-mx-data-nft/out";
import { IS_DEVNET } from "../../../libs/config";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks";

type CompensationNftsType = {
  nonce: number;
  tokenIdentifier: string;
};

export const CompensationCards: React.FC = () => {
  const { address } = useGetAccountInfo();
  const bondContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const [compensation, setCompensation] = useState<Array<Compensation>>([]);

  useEffect(() => {
    (async () => {
      const itemsForCompensation: Array<CompensationNftsType> = [];
      const contractBonds = await bondContract.viewAllBonds();
      console.log("contractBonds", contractBonds);
      contractBonds.map((bond) => {
        if (bond.address !== address) return;
        itemsForCompensation.push({ nonce: bond.nonce, tokenIdentifier: bond.tokenIdentifier });
      });
      if (contractBonds.length === 0) {
        return;
      }
      const _compensation = await bondContract.viewCompensations(itemsForCompensation);
      setCompensation(_compensation.reverse());
    })();
  }, []);
  return <></>;
};
