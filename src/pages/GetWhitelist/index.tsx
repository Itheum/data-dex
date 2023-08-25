import React from "react";
import { Flex } from "@chakra-ui/react";
import { LandingPage } from "./LandingPage/LandingPage";
import { UseCases } from "./UseCases/UseCases";
import { TrendingData } from "./TrendingData/TrendingData";
import { Testimonials } from "./Testimonials/Testimonials";
import { FeaturedArticles } from "./FeaturedArticle/FeaturedArticles";

export const GetWhitelist: React.FC = () => {
  return (
    <Flex w="full" h="full" flexDirection="column">
      <LandingPage />
      <UseCases />
      <TrendingData />
      <Testimonials />
      <FeaturedArticles />
    </Flex>
  );
};
