import React, { useEffect } from "react";
import { Text } from "@chakra-ui/react";
import { FaRegStar } from "react-icons/fa";
import { addFavoriteToBackendApi, getFavoritesFromBackendApi, removeFavoriteFromBackendApi } from "../../libs/MultiversX";
import { Favorite } from "../../libs/MultiversX/types";

type FavouriteType = {
  chainID: string;
  tokenIdentifier: string;
  bearerToken: string | undefined;
  addOrRemoveFavourite?: () => void;
};

export const Favourite: React.FC<FavouriteType> = (props) => {
  const { chainID, tokenIdentifier, bearerToken, addOrRemoveFavourite } = props;
  const [isFavourite, setIsFavourite] = React.useState<boolean>(false);
  const [favouriteItems, setFavouriteItems] = React.useState<Array<Favorite>>([]);

  const addFavourite = async () => {
    if (bearerToken) {
      const add = await addFavoriteToBackendApi(chainID, tokenIdentifier, bearerToken);
      console.log(add);
      setIsFavourite(true);
    } else {
      console.log("Please login");
    }
  };
  const removeFavourite = async () => {
    if (bearerToken) {
      const remove = await removeFavoriteFromBackendApi(chainID, tokenIdentifier, bearerToken);
      setIsFavourite(false);
    } else {
      console.log("Please login");
    }
  };

  useEffect(() => {
    (async () => {
      if (bearerToken) {
        const getFavourites = await getFavoritesFromBackendApi(chainID, bearerToken);
        console.log(getFavourites);
        setFavouriteItems(getFavourites);
      }
    })();
  }, []);

  return (
    <>
      {!isFavourite ? (
        <Text fontSize="1.5rem" _hover={{ color: "yellow", fill: "yellow", cursor: "pointer" }} w="10%" onClick={addFavourite}>
          <FaRegStar />
        </Text>
      ) : (
        <Text fontSize="1.5rem" color="yellow" _hover={{ color: "white", fill: "yellow", cursor: "pointer" }} w="10%" onClick={removeFavourite}>
          <FaRegStar />
        </Text>
      )}
    </>
  );
};
