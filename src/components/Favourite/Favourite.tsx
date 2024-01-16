import React, { useEffect } from "react";
import { Text, Tooltip } from "@chakra-ui/react";
import { FaRegStar } from "react-icons/fa";
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
          <Text fontSize="1.5rem" color="yellow" _hover={{ color: "goldenrod", fill: "yellow", cursor: "pointer" }} w="10%" onClick={removeFavourite}>
            <FaRegStar />
          </Text>
        </Tooltip>
      ) : (
        <Tooltip label="Add to favourite">
          <Text fontSize="1.5rem" _hover={{ color: "yellow", fill: "yellow", cursor: "pointer" }} w="10%" onClick={addFavourite}>
            <FaRegStar />
          </Text>
        </Tooltip>
      )}
    </>
  );
};
