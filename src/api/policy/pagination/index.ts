import { NextFunction, Request, Response } from '../../yoshi';
import { Policy } from '../policy';

export class Pagination implements Policy {
  DEFAULT = {
    limit: 25,
    offset: 0,
    sortColumn: 'createTime',
    sortOrder: 'ASC',
    search: '{}',
  };

  run = async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    req.pageOptions = {
      limit: +query.limit || this.DEFAULT.limit,
      offset: +query.offset || this.DEFAULT.offset,
      sortColumn: query.sortColumn || this.DEFAULT.sortColumn,
      sortOrder: query.sortOrder || this.DEFAULT.sortOrder,
    };
    if (!['ASC', 'DESC'].includes(req.pageOptions.sortOrder)) {
      return res.badRequest({
        message: 'Invalid Sort Order',
      });
    }
    try {
      req.query.search = JSON.parse(
        decodeURIComponent(query.search || this.DEFAULT.search),
      );
      return next();
    } catch (err) {
      if (err instanceof URIError) {
        return res.badRequest({ message: 'Malformed URI ' });
      }
      throw err;
    }
  };
}
