import { useSpring, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface Card3DAnimationProps {
  onClick?: () => void;
  children: JSX.Element;
}

//Spring animation parameters
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
};

const Card3DAnimation: React.FC<Card3DAnimationProps> = ({ onClick, children }) => {
  const [rotateXaxis, setRotateXaxis] = useState(0);
  const [rotateYaxis, setRotateYaxis] = useState(0);
  const ref = useRef(null);

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
    const degreeX = (mouseX / elementWidth) * 30;
    const degreeY = (mouseY / elementHeight) * 30;
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
      onClick={onClick}
      transition={spring}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
        width: "100%",
        height: "100%",
      }}>
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.1 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseEnd}
        transition={spring}
        style={{ width: "100%", height: "100%", rotateX: dx, rotateY: dy }}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Card3DAnimation;
