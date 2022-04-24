import { Logger, Correlation }  from '../index';
import * as fs from 'fs';

function getDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}

const LOG_DIR_NAME = './.logs';
const LOG_FILE_PREFIX = 'my_app'

function getFileName() {
    const date = getDate();
    return `${LOG_FILE_PREFIX}-${date}.log`;
}

function getFullFilePath() {
    const fileName = getFileName();
    return `${LOG_DIR_NAME}/${fileName}`;
}

beforeAll(() => {
    const fileName = getFullFilePath();
    const fullPath = __dirname + '/../' + fileName;
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
});


afterAll(() => {
    const fileName = getFullFilePath();
    const fullPath = __dirname + '/../' + fileName;
    setTimeout(async () => {
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }, 1000);
});

describe('Logger', () => {
    it('should print info log in file', () => {
        const logger = new Logger(LOG_DIR_NAME, LOG_FILE_PREFIX);
        const req = {
            url: '/api/v1/users/1',
            headers: {
                'x-user-id': '123',
                'x-request-id': 'req-id-689432',
            },
            method: 'GET',
            ip: '127.0.0.1'
        };
        const res = {
            send: () => {},
        };
        const next = () => {};
        Correlation.setData(req, res, next);
        Correlation.updateCustomerId('123');
        logger.info('info message', ['info']);
        const fileName = getFullFilePath();
        setTimeout(() => {
            expect(fs.existsSync(fileName)).toBeTruthy();
            const logFile = fs.readFileSync(fileName, 'utf8');
            expect(logFile).toContain('info message');
            expect(Correlation.getValueByName('CUSTOMER_ID')).toEqual('123');
        }, 1000);
    })

    it('should print error log in file', () => {
        const logger = new Logger(LOG_DIR_NAME, LOG_FILE_PREFIX);
        const error = new Error('Test Error');
        logger.error('error message', error, ['error']);
        const fileName = getFullFilePath();
        setTimeout(() => {
            const logFile = fs.readFileSync(fileName, 'utf8');
            expect(logFile).toContain('error message');
            expect(logFile).toContain('Test Error');
        }, 1000);
    })

    it('should print debug log in file', () => {
        process.env.LOG_LEVEL = 'debug';
        const logger = new Logger(LOG_DIR_NAME, LOG_FILE_PREFIX);
        logger.debug('debug message', ['debug']);
        const fileName = getFullFilePath();
        setTimeout(() => {
            const logFile = fs.readFileSync(fileName, 'utf8');
            expect(logFile).toContain('debug message');
            process.env.LOG_LEVEL = 'info';
        }, 1000);
    })

    it('should print warn log in file', () => {
        const logger = new Logger(LOG_DIR_NAME, LOG_FILE_PREFIX);
        logger.warn('warn message', ['warn']);
        const fileName = getFullFilePath();
        setTimeout(() => {
            const logFile = fs.readFileSync(fileName, 'utf8');
            expect(logFile).toContain('warn message');
        }, 1000);
    })
})
