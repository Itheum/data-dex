import React from "react";
import { GetBitzMvx } from "./GetBitzMvx";
import GetBitzSol from "./GetBitzSol";
import { useWallet } from "@solana/wallet-adapter-react";

const GetBitz: React.FC<any> = (props) => {
  const { modalMode } = props;
  const { connected } = useWallet();

  return <>{!connected ? <GetBitzMvx modalMode={modalMode} /> : <GetBitzSol modalMode={modalMode} />}</>;
};

export default GetBitz;
