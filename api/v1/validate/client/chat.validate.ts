import { Request, Response, NextFunction } from 'express';

export const chat = (req: Request, res: Response, next: NextFunction): Response | void => {
    next();
}