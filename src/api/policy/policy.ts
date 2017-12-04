import { EntityManager } from 'typeorm';
import { NextFunction, Request, Response } from '../yoshi';
export interface Policy {
  run: (
    req: Request,
    res: Response,
    next: NextFunction,
    tx: EntityManager,
  ) => Promise<Response | void>;
}
