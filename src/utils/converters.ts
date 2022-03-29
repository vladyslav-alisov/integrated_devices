import {Buffer} from 'buffer';

export default class Converters {
  static addZero = (str: string): string =>
    str.length === 1 ? `0${str}` : str;

  static base64ToHex = (base64: string | undefined | null): Array<string> => {
    const array: string[] = [];
    if (base64 !== null && base64 !== undefined) {
      const hexString = Buffer.from(base64, 'base64').toString('hex');
      for (let i = 0, charsLength = hexString.length; i < charsLength; i += 2) {
        array.push(hexString.substring(i, i + 2));
      }
    }
    return array;
  };

  static hexToBase64 = (hexString: string): string => {
    let base64String = '';
    base64String = Buffer.from(hexString, 'hex').toString('base64');
    return base64String;
  };
}
