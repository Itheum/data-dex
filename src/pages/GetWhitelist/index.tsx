import React from "react";
import { Flex } from "@chakra-ui/react";
import { LandingPage } from "./components/LandingPage";
import { UseCases } from "./components/UseCases";
import { TrendingData } from "./components/TrendingData";
import { Testimonials } from "./components/Testimonials";
import { FeaturedArticles } from "./components/FeaturedArticles";

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
