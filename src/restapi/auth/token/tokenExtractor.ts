import { Request } from 'express';
/**
 * @description cookie extractor(clousure)
 *
 * @param key : cookie key
 * @return (req: Request) => string | null
 * */
export const createCookieExtractor = (key: string) => {
  return (req: Request) => {
    let value = null;

    if (req && req.cookies) {
      value = req.cookies[key];
    }
    return value;
  };
};
