import React, { useEffect, useState } from "react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Image } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Card3DAnimation from "./Card3DAnimation";
interface ImageSliderProps {
  imageUrls: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  imageWidth?: string;
  imageHeight?: string;
  onLoad?: () => void;
  onError?: (event: any) => void;
}
//Spring animation parameters
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
};

const ImageSlider: React.FC<ImageSliderProps> = ({
  imageUrls,
  onLoad,
  onError,
  autoSlide = false,
  autoSlideInterval = 6000,
  imageHeight = "210px",
  imageWidth = "210px",
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [switchedImageManually, setSwitchedImageManually] = useState(false);
  // const { pathname } = useLocation();
  // const marketplaceDrawer = "/datanfts/marketplace/market";
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const makeFlip = nextImageIndex !== imageIndex;

  useEffect(() => {
    if (autoSlide && imageUrls.length > 1 && !switchedImageManually) {
      const interval = setInterval(() => {
        goToNextImage();
      }, autoSlideInterval);
      return () => clearInterval(interval);
    }
  }, [switchedImageManually]);

  function goToPreviousImage(autoSwitch = false) {
    setNextImageIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    setSwitchedImageManually(autoSwitch);
  }

  function goToNextImage(autoSwitch = false) {
    setNextImageIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    setSwitchedImageManually(autoSwitch);
  }

  return (
    <Flex justifyContent={{ base: "center" }} alignItems={"center"} flexDirection="column">
      <Flex justifyContent="center">
        <Card3DAnimation onClick={() => goToNextImage(true)}>
          <div
            style={{
              perspective: "1200px",
              transformStyle: "preserve-3d",
              width: imageWidth,
              height: imageHeight,
            }}>
            <motion.div
              transition={spring}
              style={{
                width: "100%",
                height: "100%",
                opacity: makeFlip ? 0 : 1,
                backfaceVisibility: "hidden",
                position: "absolute",
              }}>
              <Image
                w={imageWidth}
                h={imageHeight}
                borderRadius={"32px"}
                src={imageUrls[imageIndex]}
                alt={"Data NFT Image1"}
                onLoad={onLoad}
                onError={onError}
              />
            </motion.div>
            <motion.div
              initial={{ rotateY: 180 }}
              animate={{ rotateY: makeFlip ? 0 : 180 }}
              transition={spring}
              style={{
                width: "100%",
                height: "100%",
                opacity: makeFlip ? 1 : 0,
                backfaceVisibility: "hidden",
                position: "absolute",
              }}
              onAnimationComplete={() => {
                setImageIndex(nextImageIndex);
              }}>
              <Image
                w={imageWidth}
                h={imageHeight}
                borderRadius={"32px"}
                src={imageUrls[nextImageIndex]}
                alt={"Data NFT Image2"}
                onLoad={onLoad}
                onError={onError}
              />
            </motion.div>
          </div>
        </Card3DAnimation>
      </Flex>
      {imageUrls.length > 1 && (
        <Flex justifyContent="center" my={2}>
          <IconButton colorScheme={"teal"} mx={3} aria-label="Previous image" size="sm" icon={<ArrowBackIcon />} onClick={() => goToPreviousImage(true)} />
          <IconButton colorScheme={"teal"} mx={3} aria-label="Next image" size="sm" icon={<ArrowForwardIcon />} onClick={() => goToNextImage(true)} />
        </Flex>
      )}
    </Flex>
  );
};

export default ImageSlider;
