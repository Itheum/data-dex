import React, { useEffect, useState } from "react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Container, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import Card3DAnimation from "./Card3DAnimation";
interface ImageSliderProps {
  imageUrls: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  imageWidth?: string;
  imageHeight?: string;
  onLoad?: () => void;
  openNftDetailsDrawer?: () => void;
}

//Spring animation parameters
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
};

const ImageSlider: React.FC<ImageSliderProps> = (props) => {
  const { imageUrls, autoSlide = false, autoSlideInterval = 6000, imageWidth = "210px", imageHeight = "210px", onLoad, openNftDetailsDrawer } = props;
  const [imageIndex, setImageIndex] = useState(0);
  const [switchedImageManually, setSwitchedImageManually] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const makeFlip = nextImageIndex !== imageIndex;
  const isMobile = window.innerWidth <= 480;

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
    <Container justifyContent="center" mt={"0"} h={"290px"} position={"relative"}>
      <Box position={"absolute"} style={{ marginTop: "1.5rem" }}>
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
                    onLoad={onLoad}
                    onError={({ currentTarget }) => {
                      currentTarget.src = DEFAULT_NFT_IMAGE;
                    }}
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
                    onLoad={onLoad}
                    onError={({ currentTarget }) => {
                      currentTarget.src = DEFAULT_NFT_IMAGE;
                    }}
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
      </Box>

      {openNftDetailsDrawer && (
        <motion.button
          style={{
            position: "absolute",
            zIndex: "10",
            top: "0",
            bottom: "0",
            right: "0",
            left: "0",
            height: "236px",
            width: "236px",
            marginInlineStart: "1rem",
            marginInlineEnd: "1rem",
            marginTop: "1.5rem",
            borderRadius: "32px",
            cursor: "pointer",
            opacity: 0,
          }}
          onLoad={onLoad}
          onClick={openNftDetailsDrawer}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
          }}
          whileInView={
            isMobile
              ? {
                  opacity: 1,
                  backdropFilter: "blur(1px)",
                  backgroundColor: "#1b1b1ba0",
                }
              : undefined
          }
          whileHover={{ opacity: 1, backdropFilter: "blur(1px)", backgroundColor: "#1b1b1ba0" }}
          transition={isMobile ? { duration: 1.2 } : { duration: 0.3 }}>
          <Text as="div" border="1px solid" borderColor="teal.400" borderRadius="5px" variant="outline" w={20} h={8} textAlign="center" mx="20">
            <Text as="p" mt={1} fontWeight="400" textColor="white">
              Details
            </Text>
          </Text>
        </motion.button>
      )}
    </Container>
  );
};

export default ImageSlider;
