import React, { useEffect, useState } from "react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Box, Container, Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { NftMedia } from "libs/types";
import Card3DAnimation from "./Card3DAnimation";

interface NftMediaComponentProps {
  imageUrls?: string[];
  nftMedia?: NftMedia[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  imageWidth?: string;
  imageHeight?: string;
  marginTop?: string;
  borderRadius?: string;
  shouldDisplayArrows?: boolean;
  onLoad?: () => void;
  openNftDetailsDrawer?: () => void;
}

// Spring animation parameters
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
};

const NftMediaComponent: React.FC<NftMediaComponentProps> = (props) => {
  const {
    imageUrls,
    nftMedia,
    autoSlide = false,
    autoSlideInterval = 6000,
    imageWidth = "210px",
    imageHeight = "210px",
    marginTop = "0px",
    borderRadius = "32px",
    shouldDisplayArrows = true,
    onLoad,
    openNftDetailsDrawer,
  } = props;

  const [imageIndex, setImageIndex] = useState(0);
  const [switchedImageManually, setSwitchedImageManually] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const makeFlip = nextImageIndex !== imageIndex;
  const isMobile = window.innerWidth <= 480;
  let media: string[] = [];

  // if they send both nftMedia and imageUrls, only use imageUrls first if nftMedia has a default issue (known issue in Private PRC)
  if (nftMedia && imageUrls && nftMedia?.length > 0 && imageUrls?.length > 0) {
    const nftMediaSentAndMainIsADefaultOne = Boolean(nftMedia?.find((mediaObj) => mediaObj.url.includes("default.png")));

    if (nftMediaSentAndMainIsADefaultOne) {
      media = imageUrls;
    } else {
      media = nftMedia?.map((mediaObj) => mediaObj.url);
    }
  } else {
    // default to normal legacy logic
    media = imageUrls || nftMedia?.map((mediaObj) => mediaObj.url) || [DEFAULT_NFT_IMAGE];
  }

  useEffect(() => {
    if (autoSlide && media.length > 1 && !switchedImageManually) {
      const interval = setInterval(() => {
        goToNextImage();
      }, autoSlideInterval);
      return () => clearInterval(interval);
    }
  }, [switchedImageManually]);

  function transformSizeInNumber(input: string): number {
    return Number(input.replace(/\D+/g, ""));
  }

  function computeLeftMargin(input: string): string {
    return input.replace(/\d+/g, (match) => "-" + String(Math.floor(Number(match) / 2.1)));
  }

  function goToPreviousImage(autoSwitch = false) {
    setNextImageIndex((prevIndex) => (prevIndex === 0 ? media.length - 1 : prevIndex - 1));
    setSwitchedImageManually(autoSwitch);
  }

  function goToNextImage(autoSwitch = false) {
    setNextImageIndex((prevIndex) => (prevIndex === media.length - 1 ? 0 : prevIndex + 1));
    setSwitchedImageManually(autoSwitch);
  }

  return (
    <Container justifyContent="center" mt="0" h={imageHeight ? String(transformSizeInNumber(imageHeight) + 25) + "px" : "290px"} position="relative">
      <Box style={{ marginTop: marginTop }} alignItems={"center"} justifyContent={"center"}>
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
                  {nftMedia && nftMedia[imageIndex]?.fileType === "video/mp4" ? (
                    <Box width={imageWidth} height={imageHeight} as="div" borderRadius={borderRadius} overflow={"hidden"}>
                      <Box
                        as="div"
                        width={transformSizeInNumber(imageWidth) * 2 + "px"}
                        height={transformSizeInNumber(imageHeight) * 2 + "px"}
                        ml={computeLeftMargin(imageWidth)}>
                        <video
                          width={transformSizeInNumber(imageWidth) * 2 + "px"}
                          height={transformSizeInNumber(imageHeight) * 2 + "px"}
                          autoPlay={isMobile ? false : true}
                          loop
                          muted
                          playsInline>
                          <source src={media[imageIndex]} type="video/mp4" />
                        </video>
                      </Box>
                    </Box>
                  ) : (
                    <Image
                      w={imageWidth}
                      h={imageHeight}
                      borderRadius={borderRadius}
                      src={media[imageIndex]}
                      onLoad={onLoad}
                      onError={({ currentTarget }) => {
                        currentTarget.src = DEFAULT_NFT_IMAGE;
                      }}
                    />
                  )}
                </motion.div>
                {makeFlip && (
                  <motion.div
                    initial={{ rotateY: 180 }}
                    animate={{
                      rotateY: makeFlip ? 0 : 180,
                    }}
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
                      borderRadius={borderRadius}
                      src={media[nextImageIndex]}
                      onLoad={onLoad}
                      onError={({ currentTarget }) => {
                        currentTarget.src = DEFAULT_NFT_IMAGE;
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </Card3DAnimation>
          </Flex>

          {shouldDisplayArrows && media.length > 1 && (
            <Flex justifyContent="center" my={2}>
              <IconButton
                isDisabled={makeFlip}
                colorScheme={"teal"}
                mx={3}
                aria-label="Previous image"
                size="sm"
                icon={<ArrowBackIcon />}
                onClick={() => goToPreviousImage(true)}
              />
              <IconButton
                isDisabled={makeFlip}
                colorScheme={"teal"}
                mx={3}
                aria-label="Next image"
                size="sm"
                icon={<ArrowForwardIcon />}
                onClick={() => goToNextImage(true)}
              />
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
            marginInlineStart: "1.2rem",
            marginInlineEnd: "1rem",
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

export default NftMediaComponent;
