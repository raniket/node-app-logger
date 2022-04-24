export interface ILogger {
    info(message: string, tags: string[], response?: IResponse): void;
    error(message: string, error: any | Error, tags: string[]): void;
    debug(message: string, tags: string[]): void;
    warn(message: string, tags: string[]): void;
}

export interface IResponse {
    statusCode: number;
    data?: any;
    headers?: any;
}

export interface IInfo {
    message: string;
    tags: string[];
    response?: IResponse;
}

export interface IError {
    message: string;
    error: string;
    tags: string[];
}

export interface IDebug {
    message: string;
    tags: string[];
}

export interface IWarn {
    message: string;
    tags: string[];
}

export interface ILog {
    level: string;
    message: string;
    tags: string[];
}
