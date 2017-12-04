import { NextFunction, Request, Response } from 'express';
import { badRequest } from './badRequest';
import { notFound } from './notFound';
import { ok } from './ok';
import { serverError } from './serverError';
import { unauthorized } from './unauthorized';

export interface MyResponse extends Response {
  // declare Responses here
  ok: (data?: any) => MyResponse;
  notFound: (data?: any) => MyResponse;
  badRequest: (data?: any) => MyResponse;
  serverError: (data?: any) => MyResponse;
  unauthorized: (data?: any) => MyResponse;
}

export function addResponses(
  req: Request,
  res: MyResponse,
  next: NextFunction,
) {
  // set response functions here
  res.ok = ok;
  res.notFound = notFound;
  res.badRequest = badRequest;
  res.serverError = serverError;
  res.unauthorized = unauthorized;
  next();
}
