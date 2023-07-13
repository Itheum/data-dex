import React, { ReactNode, FC } from "react";

interface ConditionalRenderProps {
  checkFunction: boolean;
  fallback: ReactNode;
  children: ReactNode;
}

const ConditionalRender: FC<ConditionalRenderProps> = ({ checkFunction, fallback, children }) => {
  return <>{checkFunction ? children : fallback}</>;
};

export default ConditionalRender;
