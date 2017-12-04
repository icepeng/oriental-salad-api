import { NextFunction, Request, Router } from 'express';
import { MyResponse } from './response';

interface MyRequest extends Request {
  params: {
    id: string;
  };
  query: {
    offset: number;
    limit: number;
    sortColumn: string;
    sortOrder: 'ASC' | 'DESC';
    search: any;
  };
  pageOptions: {
    offset: number;
    limit: number;
    sortColumn: string;
    sortOrder: 'ASC' | 'DESC';
  };
}

export { MyResponse as Response, MyRequest as Request, NextFunction, Router };
