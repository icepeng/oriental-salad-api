import { NextFunction, Request, Response } from '../../yoshi';

export function NotFoundError(req: Request, res: Response, next: NextFunction) {
  return res.notFound({
    message: 'Not Found',
  });
}

export function ErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof SyntaxError) {
    return res.badRequest({
      message: 'Malformed JSON data',
    });
  }

  return res.serverError(err);
}
