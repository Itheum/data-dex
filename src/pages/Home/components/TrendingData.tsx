import React, { useEffect, useState } from "react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { TrendingNft } from "../../../libs/MultiversX/types";
import { getTrendingFromBackendApi } from "../../../libs/MultiversX";

export const TrendingData: React.FC = () => {
  const { chainID } = useGetNetworkConfig();
  const [trendingData, setTrendingData] = useState<Array<TrendingNft>>([]);
  useEffect(() => {
    (async () => {
      const getTrendingData = await getTrendingFromBackendApi(chainID);
      console.log(getTrendingData);
      setTrendingData(getTrendingData);
    })();
  }, []);
  console.log(trendingData);
  return <></>;
};
