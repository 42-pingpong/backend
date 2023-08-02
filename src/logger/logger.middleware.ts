import { NextFunction, Request } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log('logger: ', req.baseUrl);
  next();
}
