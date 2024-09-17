import React from "react";
import { Link } from "@chakra-ui/react";
import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";

// Function to transform description that have a link into an actual link
export const transformDescription = (description: string) => {
  const regex = /(?:^|[\s\n])(?:\((.*?)\))?((?:https?:\/\/|www\.)[^\s\n]+)/g; // Regex for check if description have link

  return description.split(regex).map((word, i) => {
    if (word?.match(regex)) {
      return (
        <Link key={i} href={word} isExternal color={"blue.300"}>
          {" " + word}
        </Link>
      );
    }
    return word;
  });
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
