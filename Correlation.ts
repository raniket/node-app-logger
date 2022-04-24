import * as http from 'http';
import * as uuid from 'uuid';
import * as cls from 'cls-hooked';
import { get } from 'lodash';

export enum SessionKey {
  SESSION_NAME = 'SESSION_NAME',
  REQUEST_URL = 'REQUEST_URL',
  REQUEST_IDENTIFIER = 'REQUEST_IDENTIFIER',
  CUSTOMER_ID = 'CUSTOMER_ID',
  REQUEST_METHOD = 'REQUEST_METHOD',
  NORMALIZED_URL = 'NORMALIZED_URL',
  REMOTE_ADDRESS = 'REMOTE_ADDRESS',
}

type SessionKeys = keyof typeof SessionKey;


/**
 * Given an express request, returns the normalized URL of the request.
 *
 * The basic idea here is when someone visits
 * "/api/v2/User/5ddc3ed8643713eb372b993a", we want to collect metrics about
 * the endpoint "/api/v2/User/:id".  This works for Exegesis paths, too.
 *
 */
function normalizeExpressPath(req: http.IncomingMessage) {
  const expressReq = req as any;
  if ('route' in expressReq && expressReq.route.path !== undefined) {
    return (expressReq.baseUrl || '') + expressReq.route.path.toString();
  }
  return '';
}

/**
 * Create correlation for every incoming HTTP request
 * This class helps us to maintain the context for every HTTP request.
 * @export
 * @class Correlation
 */
export class Correlation {

  /**
   * A Session object for each incoming HTTP request
   * @private
   * @static
   * @memberof Correlation
   */
  private static session = cls.createNamespace(SessionKey.SESSION_NAME);

  /**
   * Set data in Storage object for each incoming HTTP request
   * @static
   * @param  {*} req
   * @param  {*} res
   * @param  {*} next
   * @return
   * @memberof Correlation
   */
  public static setData(req: any, res: any, next: any): Promise<void> {
    return Correlation.session.runPromise(async () => {
      Correlation.session.set(
        SessionKey.REQUEST_IDENTIFIER, get(req, 'headers.x-request-id') || uuid.v4(),
      );
      Correlation.session.set(SessionKey.REQUEST_URL, req.originalUrl || req.url || '');
      Correlation.session.set(
        SessionKey.CUSTOMER_ID,
        get(req, 'headers[x-user-id]') ||
        get(req, 'query.custId') ||
        get(req, 'query.userId') ||
        get(req, 'query.customerId') ||
        get(req, 'query.customer_id') ||
        get(req, 'body.customer_id') ||
        get(req, 'body.user_id') ||
        get(req, 'body.userId') ||
        get(req, 'body.customerId'),
      );
      Correlation.session.set(SessionKey.REQUEST_METHOD, get(req, 'method', ''));
      Correlation.session.set(SessionKey.NORMALIZED_URL, normalizeExpressPath(req));
      Correlation.session.set(SessionKey.REMOTE_ADDRESS, get(req, 'ip', ''));
      next();
    });
  }

  /**
   * Updates the customer id in Storage object
   * @static
   * @param  {string} id Customer id
   * @return {void}
   * @memberof Correlation
   */
  public static updateCustomerId(id: string): Promise<void> {
    return Correlation.session.runPromise(async () => {
      Correlation.session.set(SessionKey.CUSTOMER_ID, id);
    })
  }

  /**
   * Gets the value from Storage object by key
   * @static
   * @param  {SessionKeys} name Key name
   * @return Value from Storage object
   * @memberof Correlation
   */
  public static getValueByName(name: SessionKeys): string {
    let value = '';
    Correlation.session.run(() => {
      value = Correlation.session.get(name);
    })
    return value;
  }
}
