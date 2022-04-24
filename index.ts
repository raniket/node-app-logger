import os from 'os';
import fs from 'fs';
import * as Util from 'util';
import winston from 'winston';
require('winston-daily-rotate-file');
import { Correlation, SessionKey } from './Correlation';
import {
  ILogger,
  IInfo,
  IError,
  IDebug,
  IWarn,
  IResponse,
  ILog
} from './ILogger';

const HOSTNAME = os.hostname();

interface LogInfo {
  '@timestamp': string;
  message: string;
  customerId?: string;
  requestId?: string;
  pid: number;
  host: string;
  fileName: string;
  tags?: string[];
  error?: string;
  level?: string;
  name?: string;
  request?: {
    method: string;
    url: string;
    normalizedUrl: string;
    remoteAddress: string;
  };
  response?: {
    statusCode: number;
    responseTime?: number;
    fullHeaders: string;
    data?: any;
  };
}

/**
 * Format messages before logging.
 */
class Formate {
  transform(info: any): any {
    const result: LogInfo = {
      '@timestamp': info['@timestamp'] || new Date().toISOString(),
      host: HOSTNAME,
      fileName: info.fileName || '',
      message: info.message || '',
      customerId: Correlation.getValueByName(SessionKey.CUSTOMER_ID) || '',
      requestId: Correlation.getValueByName(SessionKey.REQUEST_IDENTIFIER) || '',
      pid: process.pid,
      tags: info.tags,
      error: info.error ? info.error : undefined,
      level: info.level,
      name: info.name,
    };

    result.request = {
      method: Correlation.getValueByName(SessionKey.REQUEST_METHOD) || '',
      url: Correlation.getValueByName(SessionKey.REQUEST_URL) || '',
      normalizedUrl: Correlation.getValueByName(SessionKey.NORMALIZED_URL) || '',
      remoteAddress: Correlation.getValueByName(SessionKey.REMOTE_ADDRESS) || '',
    };

    const { response } = info;

    if (response) {
      result.response = {
        statusCode: response.statusCode,
        fullHeaders: Util.inspect(response.headers),
        data: Util.inspect(response.data),
      };
    }

    return result;
  }
}

const formate = new Formate();


/**
 * Formatted Logger
 * @class Logger
 * @implements ILogger
 */
class Logger implements ILogger {
  logger: winston.Logger;

  constructor(dirName: string, filePrefix: string) {
    this.createDir(dirName);
    const consoleLogger = new winston.transports.Console();
    // @ts-ignore
    const fileLogger = new winston.transports.DailyRotateFile({
      filename: `${dirName}/${filePrefix}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxDays: 15,
      maxSize: 250 * 1024 * 1024,
    });
    const transports = [fileLogger];
    if (process.env.NODE_ENV !== 'production') {
      transports.push(consoleLogger);
    }
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info', // process.env.LOG_LEVEL can be "info" | "debug" | "warn" | "error"
      transports: transports,
    });
  }

  private createDir(dirName: string): void {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }
  }

  /**
   * Log info message
   * @param  {string} message 
   * @param  {string[]} tags 
   * @param  {IResponse} [response] 
   * @return {void}
   * @memberof Logger
   */
  info(message: string, tags: string[], response?: IResponse): void {
    const data: IInfo = {
      message: message,
      tags: tags,
      response: response
    };
    this.logger.info(formate.transform(data));
  }

  /**
   * Log error message
   * @param  {string} message 
   * @param  {(any | Error)} error 
   * @param  {string[]} tags 
   * @return {void}
   * @memberof Logger
   */
  error(message: string, error: any | Error, tags: string[]): void {
    const data: IError = {
      message: message,
      error: Util.inspect(error, { depth: 5 }),
      tags: tags
    };
    this.logger.error(formate.transform(data));
  }

  /**
   * Log debug message
   * @param  {string} message 
   * @param  {string[]} tags 
   * @return {void}
   * @memberof Logger
   */
  debug(message: string, tags: string[]): void {
    const data: IDebug = {
      message: message,
      tags: tags
    };
    this.logger.debug(formate.transform(data));
  }

  /**
   * Log warn message
   * @param  {string} message 
   * @param  {string[]} tags 
   * @return {void}
   * @memberof Logger
   */
  warn(message: string, tags: string[]): void {
    const data: IWarn = {
      message: message,
      tags: tags
    };
    this.logger.warn(formate.transform(data));
  }

}

export {
  ILogger,
  SessionKey,
  Correlation,
  Logger,
}
