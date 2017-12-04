import 'reflect-metadata';

import { Container } from 'typedi';
import {
  Connection,
  createConnection,
  EntityManager,
  useContainer,
} from 'typeorm';

import { Controllers, Policies, Policy } from './api';
import { NextFunction, Request, Response, Router } from './api/yoshi';
import * as Config from './config';
import * as Services from './service';
import { logger } from './util/logger';

if (Services) {
  logger.info('Service Injected');
}

const allowedMethods = ['get', 'post', 'delete', 'put', 'patch'];

export class Engine {
  router: Router;
  config: any;

  constructor(config: any) {
    this.config = config;
    this.router = Router();
    this.run();
  }

  parseRouteKey(str: string) {
    const [method, url] = str.split(' ');
    return [method.toLowerCase(), url];
  }

  assertMethod(method: string) {
    if (!allowedMethods.some(x => x === method)) {
      throw new Error('RouteConfigError: Invalid method');
    }
  }

  parseRouteValue(str: string) {
    return Config.ROUTE_LIST[str].split('.');
  }

  buildPolicies(
    controllerName: string,
    funcName: string,
    connection: Connection,
  ) {
    const controllerPolicy = Config.POLICY_LIST[controllerName];
    if (!controllerPolicy) {
      logger.warn(`No policy found for ${controllerName}, skipping..`);
      return [];
    }

    const funcPolicies = controllerPolicy[funcName];
    if (!funcPolicies) {
      logger.warn(
        `No policy found for ${controllerName}.${funcName}, skipping..`,
      );
      return [];
    }
    return funcPolicies.map((item: string) => {
      const policy = <Policy>Container.get(Policies[item]);
      if (!policy) {
        throw new Error('PolicyConfigError: Invalid policy name');
      }
      return async (req: Request, res: Response, next: NextFunction) => {
        try {
          return await connection.transaction(async tx => {
            await policy.run(req, res, next, tx);
          });
        } catch (err) {
          return next(err);
        }
      };
    });
  }

  getControllerFunc(
    controllerName: string,
    funcName: string,
  ): (req: Request, res: Response, tx?: EntityManager) => Promise<any> {
    const controller = Container.get(Controllers[controllerName]);
    if (!controller) {
      throw new Error('RouteConfigError: Invalid contoller');
    }

    const controllerFunc = controller[funcName];
    if (!controllerFunc) {
      throw new Error('RouteConfigError: Invalid contoller function');
    }
    return controllerFunc;
  }

  setRoute(connection: Connection) {
    Object.keys(Config.ROUTE_LIST).forEach(key => {
      try {
        const [method, url] = this.parseRouteKey(key);
        const [controller, func] = this.parseRouteValue(key);
        this.assertMethod(method);
        const funcToRun = this.getControllerFunc(controller, func);
        const policy = this.buildPolicies(controller, func, connection);
        this.router[method](
          url,
          policy,
          async (req: Request, res: Response, next: NextFunction) => {
            try {
              return await connection.transaction(async tx => {
                await funcToRun(req, res, tx);
              });
            } catch (err) {
              return next(err);
            }
          },
        );
      } catch (err) {
        logger.error(err);
        logger.error(
          `Error Occured while processing - '${key}': '${
            Config.ROUTE_LIST[key]
          }'`,
        );
        process.exit(-1);
      }
    });
  }

  run() {
    useContainer(Container);
    createConnection(Config.pgConfig)
      .then(connection => this.setRoute(connection))
      .catch(err => logger.error(err));
  }
}

export default new Engine(Config).router;
