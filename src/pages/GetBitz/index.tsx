import React from "react";
import { GetBitzMvx } from "./GetBitzMvx";
import GetBitzSol from "./GetBitzSol";
import { useWallet } from "@solana/wallet-adapter-react";

const GetBitz: React.FC<any> = (props) => {
  const { modalMode } = props;
  const { connected } = useWallet();

  return <div>{!connected ? <GetBitzMvx modalMode={modalMode} /> : <GetBitzSol modalMode={modalMode} />}</div>;
};

export default GetBitz;
