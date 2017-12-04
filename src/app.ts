import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as logger from 'morgan';

import Engine from './engine';

import { ErrorHandler, NotFoundError } from './api/controller/error';
import { addResponses } from './api/response';

// Creates and configures an ExpressJS web server.
class App {
  // ref to Express instance
  public express: express.Application;

  // Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.errors();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(addResponses);
    this.express.use(logger('dev'));
    this.express.use(cors());
    this.express.use(bodyParser.json({ limit: '50mb' }));
    this.express.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use('/api/v1/', Engine);
  }

  private errors(): void {
    this.express.use(NotFoundError);
    this.express.use(ErrorHandler);
  }
}

export default new App().express;
