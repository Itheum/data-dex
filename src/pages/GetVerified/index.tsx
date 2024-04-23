import React from "react";
import { Flex } from "@chakra-ui/react";
import { FeaturedArticles } from "./FeaturedArticle/FeaturedArticles";
import { LandingPage } from "./LandingPage/LandingPage";
import { Testimonials } from "./Testimonials/Testimonials";
import { TrendingData } from "./TrendingData/TrendingData";
import { UseCases } from "./UseCases/UseCases";

export const GetVerified: React.FC = () => {
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
