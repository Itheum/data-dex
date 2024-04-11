import type { ComponentType } from "react";
import { motion, useSpring } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";
import { JSX } from "react/jsx-runtime";
import { Image } from "@chakra-ui/react";

//Spring animation parameters
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
};

interface CardFlipProps {
  imageUrls: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export const CardFlip: React.FC<CardFlipProps> = ({ imageUrls, autoSlide = false, autoSlideInterval = 6000 }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateXaxis, setRotateXaxis] = useState(0);
  const [rotateYaxis, setRotateYaxis] = useState(0);
  const ref = useRef(null);

  const handleClick = () => {
    setIsFlipped((prevState) => !prevState);
  };

  useEffect(() => {
    setIsFlipped(true);
    setTimeout(() => {
      setIsFlipped(false);
    }, 500);

    /*  if (autoSlide && imageUrls.length > 1) {
      const interval = setInterval(() => {
        if (switchedImageManually) {
          setSwitchedImageManually(false);
        } else {
          goToNextImage();
        }
      }, autoSlideInterval);
      return () => clearInterval(interval);
    } */
  }, []);

  const handleMouseMove = (event: { clientY: number; clientX: number }) => {
    const element: HTMLElement = ref.current as unknown as HTMLElement;
    if (!element) {
      return;
    }
    const elementRect = element.getBoundingClientRect();
    const elementWidth = elementRect.width;
    const elementHeight = elementRect.height;
    const elementCenterX = elementWidth / 2;
    const elementCenterY = elementHeight / 2;
    const mouseX = event.clientY - elementRect.y - elementCenterY;
    const mouseY = event.clientX - elementRect.x - elementCenterX;
    const degreeX = (mouseX / elementWidth) * 60; //The number is the rotation factor
    const degreeY = (mouseY / elementHeight) * 60; //The number is the rotation factor
    setRotateXaxis(degreeX);
    setRotateYaxis(degreeY);
  };

  const handleMouseEnd = () => {
    setRotateXaxis(0);
    setRotateYaxis(0);
  };

  const dx = useSpring(0, spring);
  const dy = useSpring(0, spring);

  useEffect(() => {
    dx.set(-rotateXaxis);
    dy.set(rotateYaxis);
  }, [rotateXaxis, rotateYaxis]);

  return (
    <motion.div
      onClick={handleClick}
      transition={spring}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
        width: "210px",
        height: "210px",
      }}>
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.1 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseEnd}
        transition={spring}
        style={{
          width: "100%",
          height: "100%",
          rotateX: dx,
          rotateY: dy,
        }}>
        <div
          style={{
            perspective: "1200px",
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
          }}>
          <motion.div
            animate={{ rotateY: isFlipped ? -180 : 0 }}
            transition={spring}
            style={{
              width: "100%",
              height: "100%",
              zIndex: isFlipped ? 0 : 1,
              backfaceVisibility: "hidden",
              position: "absolute",
            }}>
            <Image rounded={"3xl"} src={imageUrls[0]} alt={"Data NFT Image1"} />
          </motion.div>
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: isFlipped ? 0 : 180 }}
            transition={spring}
            style={{
              width: "100%",
              height: "100%",
              zIndex: isFlipped ? 1 : 0,
              backfaceVisibility: "hidden",
              position: "absolute",
            }}>
            <Image rounded={"3xl"} src={imageUrls[1]} alt={"Data NFT Image2"} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
