import BigNumber from "bignumber.js";

export const formatNumberRoundFloor = (num: number, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return (Math.floor(num * factor) / factor).toFixed(2);
};

export const formatNumberToShort = (number: number) => {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    const thousands = Math.floor(number / 1000);
    const remainder = number % 1000;
    return `${thousands},${remainder !== 0 ? remainder : ""}`;
  } else {
    const millions = Math.floor(number / 1000000);
    const thousands = Math.floor((number % 1000000) / 1000);
    const remainder = number % 1000;
    return `${millions},${thousands !== 0 ? `${thousands}` : ""},${remainder !== 0 ? remainder : ""}`;
  }
};
//
const BIG_NUMBER_ROUNDING_MODE = BigNumber.ROUND_FLOOR;
export const DEFAULT_DECIMALS = 18;

export const convertWeiToEsdt = (amount: BigNumber.Value | null | undefined, decimals?: number, precision?: number): BigNumber => {
  if (amount == null) {
    return new BigNumber(0);
  } else {
    return new BigNumber(amount)
      .decimalPlaces(0, BIG_NUMBER_ROUNDING_MODE)
      .shiftedBy(typeof decimals !== "undefined" ? -decimals : -DEFAULT_DECIMALS)
      .decimalPlaces(typeof precision !== "undefined" ? precision : 4, BIG_NUMBER_ROUNDING_MODE);
  }
};

export const convertEsdtToWei = (amount: BigNumber.Value | null | undefined, decimals?: number): BigNumber => {
  if (amount == null) {
    return new BigNumber(0);
  } else {
    return new BigNumber(amount).shiftedBy(typeof decimals !== "undefined" ? decimals : DEFAULT_DECIMALS).decimalPlaces(0, BIG_NUMBER_ROUNDING_MODE);
  }
};

//
export const tryParseInt = (value: any, defaultValue = 0) => {
  if (defaultValue < 0) defaultValue = 0;
  const intValue = parseInt(value);
  return Number.isNaN(intValue) ? defaultValue : intValue;
};

export const isValidNumericCharacter = (char: any) => {
  return char.match(/[0-9]/);
};

export const convertToLocalString = (value: BigNumber.Value, precision?: number): string => {
  return new BigNumber(value)
    .decimalPlaces(precision ? precision : 4, BigNumber.ROUND_FLOOR)
    .toNumber()
    .toLocaleString();
};
