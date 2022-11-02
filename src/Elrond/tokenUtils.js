export const roundDown = (num, precision) => {
    let number;
    if (typeof num === 'string') {
      number = parseFloat(num);
    } else {
      number = num;
    }
    const m = Math.pow(10, precision);
    return Math.floor(number * m) / m;
  };
  
export const hexZero = (nr) => {
    let hexnonce = nr.toString(16);
    if (hexnonce.length % 2 !== 0) {
      hexnonce = '0' + hexnonce;
    }
    return hexnonce;
  };
  
export const getTokenWantedRepresentation = (token, nonce) => {
    if (nonce > 0) {
      const hexnonce = hexZero(nonce);
      return `${token}-${hexnonce}`;
    } else {
      return token.split('-')[0];
    }
  };
  
export const getTokenImgSrc = (token_identifier, token_nonce) => {
    if (token_nonce > 0 && !token_identifier.includes('LKMEX')) {
      return `https://api.elrond.com/nfts/${token_identifier}-${hexZero(
        token_nonce
      )}/thumbnail`;
    } else {
      return `https://media.elrond.com/tokens/asset/${token_identifier}/logo.png`;
    }
  };
  
export const tokenDecimals = (token_identifier) => {
    if (
      token_identifier === 'VITAL-bc0917' ||
      token_identifier === 'PLATA-9ba6c3'
    ) {
      return 8;
    } else if (
      token_identifier === 'EGLD' ||
      token_identifier === 'LKMEX-aab910' ||
      token_identifier === 'CHAKRA-9ebfe5' ||
      token_identifier === 'MEX-455c57' ||
      token_identifier === 'WEGLD-bd4d79' ||
      token_identifier === 'ZPAY-247875' ||
      token_identifier === 'RIDE-7d18e9' ||
      token_identifier === 'UTK-2f80e9' ||
      token_identifier === 'ITHEUM-df6f26' ||
      token_identifier === 'ITHEUM-a61317' ||
      token_identifier === 'BHAT-c1fde3' ||
      token_identifier === 'CRT-52decf' ||
      token_identifier === 'PROTEO-0c7311' ||
      token_identifier === 'AERO-458bbf' ||
      token_identifier === 'LAND-40f26f' ||
      token_identifier === 'KRO-df97ec' ||
      token_identifier === 'EPUNKS-dc0f59' ||
      token_identifier === 'EFFORT-a13513'
    ) {
      return 18;
    } else if (
      token_identifier === 'USDC-c76f1f' ||
      token_identifier === 'QWT-46ac01' ||
      token_identifier === 'ISET-84e55e'
    ) {
      return 6;
    } else if (token_identifier === 'OFE-29eb54') {
      return 4;
    } else return 0;
  };