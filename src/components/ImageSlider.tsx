import React, { useEffect, useState } from "react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Image } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSpring } from "framer-motion";

interface ImageSliderProps {
  imageUrls: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ imageUrls, autoSlide = false, autoSlideInterval = 6000 }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [switchedImageManually, setSwitchedImageManually] = useState(false);
  const { pathname } = useLocation();
  const marketplaceDrawer = "/datanfts/marketplace/market";

  useEffect(() => {
    if (autoSlide && imageUrls.length > 1) {
      const interval = setInterval(() => {
        if (switchedImageManually) {
          setSwitchedImageManually(false);
        } else {
          goToNextImage();
        }
      }, autoSlideInterval);
      return () => clearInterval(interval);
    }
  }, []);

  function goToPreviousImage(autoSwitch = false) {
    setImageIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    setSwitchedImageManually(autoSwitch);
  }

  function goToNextImage(autoSwitch = false) {
    setImageIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    setSwitchedImageManually(autoSwitch);
  }

  return (
    <Flex justifyContent={{ base: "center" }} alignItems={"center"} flexDirection="column">
      <AnimatePresence mode="wait">
        <Image
          as={motion.img}
          initial={{ opacity: 0.1 }}
          animate={{
            opacity: 1,
            rotateY: [0, 180],
            transition: { duration: 0.5 },
          }}
          style={{ transformStyle: "preserve-3d" }}
          exit={{ opacity: 0.1 }}
          key={imageIndex}
          w={{ base: "210px", xl: "260px" }}
          h={{ base: "210px", xl: "260px" }}
          borderRadius={"44px"}
          py={2}
          objectFit={"contain"}
          src={imageUrls[imageIndex]}
          alt={"Data NFT Image"}
          mr={pathname === marketplaceDrawer ? 0 : { base: 0, lg: 0 }}
        />
        <Image
          as={motion.img}
          initial={{ opacity: 0.1 }}
          animate={{
            opacity: 1,
            rotateY: [0, 180],
            transition: { duration: 0.5 },
          }}
          style={{ transformStyle: "preserve-3d" }}
          exit={{ opacity: 0.1 }}
          key={imageIndex}
          w={{ base: "210px", xl: "260px" }}
          h={{ base: "210px", xl: "260px" }}
          borderRadius={"44px"}
          py={2}
          objectFit={"contain"}
          src={imageUrls[imageIndex]}
          alt={"Data NFT Image"}
          mr={pathname === marketplaceDrawer ? 0 : { base: 0, lg: 0 }}
        />
      </AnimatePresence>
      {imageUrls.length > 1 && (
        <Flex justifyContent="center" mb={1}>
          <IconButton colorScheme={"teal"} mx={3} aria-label="Previous image" size="sm" icon={<ArrowBackIcon />} onClick={() => goToPreviousImage()} />
          <IconButton colorScheme={"teal"} mx={3} aria-label="Next image" size="sm" icon={<ArrowForwardIcon />} onClick={() => goToNextImage()} />
        </Flex>
      )}
    </Flex>
  );
};

export default ImageSlider;
