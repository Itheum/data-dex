export const labels = {
  "ERR_URL_MISSING_HTTPS_OR_IPNS":
    "Some of your url inputs don't seem to be valid. For e.g. stream URLs or marshal service URLs need to have https:// , ipfs:// or ipns:// in it. (ER-1)",
  "ERR_DATA_MARSHAL_DOWN": "Data Marshal service is not responding. (ER-2)",
  "ERR_DATA_MARSHAL_GEN_ACCESS_FAIL": "Data Marshal responded with an unknown error trying to generate your access links. (ER-3)",
  "ERR_WALLET_SIG_GEN_MALFORMED": "Signature result from wallet was malformed. (ER-4)",
  "ERR_WALLET_SIG_NOT_SUPPORTED":
    "Signature verifications do not work on Web Wallet. Please use the XPortal App, Ledger or the DeFi Wallet Browser Plugin. (ER-5)",
  "ERR_WALLET_SIG_GENERIC": "Signature result not received from wallet. (ER-6)",
  "ERR_BURN_NO_NFT_SELECTED": "No Data NFT was selected for burning. (ER-7)",
  "ERR_BURN_NO_WALLET_CONN": "Connect your wallet to proceed with burn. (ER-8)",
  "ERR_MINT_FORM_NFT_IMG_GEN_AND_STORAGE_CATCH_HIT": "Uploading the image on IPFS has failed. (ER-9)",
  "ERR_MINT_FORM_NFT_IMG_GEN_ISSUE": "Uploading the image on IPFS has failed. (ER-10)",
  "ERR_MINT_FORM_ENCRYPT_MARSHAL_FAIL": "Data Marshal failed trying to generate your encrypted link. (ER-11)",
  "ERR_MINT_FORM_ENCRYPT_MARSHAL_UNKNOWN_FAIL": "Data Marshal responded with an unknown error trying to generate your encrypted link. (ER-12)",
  "ERR_MINT_FORM_MINT_AGAIN_WAIT": "(ER-13) You can mint next Data NFT-FT after ",
  "ERR_MINT_FORM_NO_WALLET_CONN": "Connect your wallet to proceed with mint. (ER-14)",
  "ERR_MINT_NO_TX": "Cannot send transaction to the blockchain. (ER-15)",
  "ERR_SET_AS_PRIMARY_NF_ME_ID_VAULT_TX": "Failed to set Data NFT as a primary NFMe ID Vault. (ER-30)",
  "ERR_PROCURE_UPTIME_CHECK_DOWN":
    "The Data Marshal is unavailable to provide a status check on this Data Stream URL. This may mean that the Data Stream is unavailable. Do not proceed with the transaction. (ER-16)",
  "ERR_MARKET_REQ_FAIL": "Could not fetch marketplace requirements. (ER-17)",
  "ERR_MARKET_OFFERS_FAIL": "Could not fetch marketplace offers. (ER-18)",
  "ERR_MINT_FORM_NOT_ENOUGH_TAX": "You have insufficient $ITHEUM tokens for the Anti-Spam Tax. (ER-19)",
  "ERR_MINT_FORM_GEN_IMG_API_DOWN": "Generative image generation service is not responding. (ER-20)",
  "ERR_CONTRACT_PARAM_READ": "Could not fetch parameters from the smart contract. (ER-21)",
  "ERR_API_ISSUE_DATA_NFT_DETAILS": "Could not fetch Data NFT-FT details. (ER-22)",
  "ERR_API_ISSUE_DATA_NFT_OFFERS": "Could not fetch Data NFT-FT offers. (ER-23)",
  "ERR_MARKET_OFFER_NOT_FOUND": "Data NFT offer not found (ER-24)",
  "ERR_IPFS_ASSET_SAVE_FAILED":
    "Could not save the img and or metadata assets to IPFS. There is a chance that your firewall is blocking IPFS, please disable it and try again. (ER-31)",
  "ERR_MINT_TX_GEN_COMMAND_FAILED": "Could not generate the Data NFT mint transaction. (ER-32)",
  "ERR_NATIVE_AUTH_TOKEN_MISSING": "Your wallet did not produce a Native Auth token (ER-25)",
  "ERR_PROCURE_UPTIME_CHECK_DOWN_NON_HTTP":
    "The Data Marshal is unavailable to provide a status check on this Data Stream URL. This may mean that the Data Stream is unavailable or that your network is blocking the check. You may proceed with the transaction at your own risk. (ER-26)",
  "ERR_BONDING_STAKING_COULD_NOT_GET_DATA_NFTS":
    "Could not get a list of all your Data NFTs to show liveliness bonding status on each. Could be related to you having too many or the network is slow (ER-33)",

  "MINT_FORM_POPUP_INFO_DATA_STREAM":
    "The URL of the hosted data asset that you would like to trade. This URL should be publicly accessible behind a secure domain (one that starts with https://)",
  "MINT_FORM_POPUP_INFO_DATA_PREVIEW":
    "A URL of a free preview of full data asset which should be publicly accessible behind a secure domain (one that starts with https://)",
  "MINT_FORM_POPUP_INFO_DATA_MARSHAL": "The Data Marshal is the service that brokers the on-chain access control for your data asset",
  "MINT_FORM_POPUP_INFO_TOKEN_NAME": "A short title to describe your data asset. This will be used as the NFT token name",
  "MINT_FORM_POPUP_INFO_TITLE": "A longer title to describe your data asset",
  "MINT_FORM_POPUP_INFO_DESC": "A description of your data asset",
  "MINT_FORM_POPUP_INFO_SUPPLY": 'The total "supply" you would like to mint (i.e. individual copies of your data access license)',
  "MINT_FORM_POPUP_INFO_ROYALTY": 'The "Creator Royalty" you will earn each time a copy is re-traded in the Data NFT Marketplace',
  "ADD_FAVORITE_FAILS": "Could not add to favorites. (ER-27)",
  "REMOVE_FAVORITE_FAILS": "Could not remove from favorites. (ER-28)",
  "ERR_MARKET_NR_OFFERS_FAIL": "Could not fetch number of marketplace offers. (ER-29)",
  "ERR_MINT_FORM_NOT_ENOUGH_BOND":
    "You have insufficient $ITHEUM tokens for the Liveness Bonding (Note that you need enough for both the bonding and the Anti-Spam Tax).",
};
