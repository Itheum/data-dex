import React from "react";
import { Box, Text, Tooltip } from "@chakra-ui/react";
import { FaRegHeart } from "react-icons/fa";
import { addFavoriteToBackendApi, removeFavoriteFromBackendApi } from "../../libs/MultiversX";

type FavouriteType = {
  chainID: string;
  tokenIdentifier: string;
  bearerToken: string | undefined;
  favouriteItems: Array<string>;
  getFavourites: () => void;
};

export const Favourite: React.FC<FavouriteType> = (props) => {
  const { chainID, tokenIdentifier, bearerToken, favouriteItems, getFavourites } = props;

  const addFavourite = async () => {
    if (bearerToken) {
      await addFavoriteToBackendApi(chainID, tokenIdentifier, bearerToken);
      await getFavourites();
    } else {
      console.log("Please login");
    }
  };
  const removeFavourite = async () => {
    if (bearerToken) {
      await removeFavoriteFromBackendApi(chainID, tokenIdentifier, bearerToken);
      await getFavourites();
    } else {
      console.log("Please login");
    }
  };

  return (
    <>
      {favouriteItems.includes(tokenIdentifier) ? (
        <Tooltip label="Remove from favourite">
          <Text fontSize="1.5rem" color="palevioletred" fill="#64748b" _hover={{ color: "#886973", cursor: "pointer" }} w="10%" onClick={removeFavourite}>
            <FaRegHeart />
          </Text>
        </Tooltip>
      ) : (
        <Tooltip label="Add to favourite">
          <Text fontSize="1.5rem" _hover={{ color: "palevioletred", cursor: "pointer" }} w="10%" onClick={addFavourite}>
            <FaRegHeart />
          </Text>
        </Tooltip>
      )}
    </>
  );
};
