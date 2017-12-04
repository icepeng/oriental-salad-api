import { logger } from '../../../util/logger';

export function serverError(err: any = {}) {
  const res = this;
  if (!err.status) {
    err.status = 500;
  }

  if (!err.message) {
    err.message = 'Unknown error';
  }

  logger.error(err);
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  return res.status(500).json({
    message: err.message,
  });
}
