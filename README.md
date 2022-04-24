# Structured logging with request context

## Install
```
# using npm
npm install node-app-logger
 
# using yarn
yarn add node-app-logger
```

## Usage
```
# using require
const { Correlation, Logger } = require('node-app-logger');
 
# using import
import { Correlation, Logger } from 'node-app-logger';
```


## Example

### Without correlation
```
import { Logger } from 'node-app-logger';

const LOG_DIR = './.logs';
const LOG_FILE_PREFIX = 'my_app';

const logger = new Logger(LOG_DIR_NAME, LOG_FILE_PREFIX);

# info log
logger.info('info message', ['TEST', 'INFO']);

# error log
const error = new Error('Test Error');
logger.error('error message', error, ['TEST', 'ERROR']);

# debug log
# for debug log, "process.env.LOG_LEVEL = 'debug';" is required, default is 'info'.
logger.debug('debug message', ['TEST', 'DEBUG']);

# warn log
logger.warn('warn message', ['TEST,' 'WARN']);
```

###  With correlation
```
import express from 'express';
import { Correlation, Logger } from 'node-app-logger';

const app = express();

const LOG_DIR = './.logs';
const LOG_FILE_PREFIX = 'my_app';

const logger = new Logger(LOG_DIR, LOG_FILE_PREFIX);

// Set the Correlation middleware for collecting http request information
app.use(Correlation.setData);

app.get('/api/v1/user/1', (req: any, res: any, next: any) => {
    const customerId = '123';
    Correlation.updateCustomerId(customerId);
    logger.info('info message', ['USER', 'API']);
    res.send(200);
});

app.listen(3000, () => {
    logger.info('App is listening on port 3000', ['APP']);
});
```


A new file will be created under the specified dir with the following content including customer id and other http request information.
```
{"@timestamp":"2022-04-24T08:12:24.038Z","customerId":"","fileName":"","host":"197NODMB27479.local","level":"info","message":"App is listening on port 3000","pid":49970,"request":{"method":"","normalizedUrl":"","remoteAddress":"","url":""},"requestId":"","tags":["APP"]}

{"@timestamp":"2022-04-24T08:12:29.026Z","customerId":"123","fileName":"","host":"197NODMB27479.local","level":"info","message":"info message","pid":49970,"request":{"method":"GET","normalizedUrl":"","remoteAddress":"::1","url":"/api/v1/user/1"},"requestId":"6539df3b-bcbb-4209-afb9-600781dcdb38","tags":["USER","API"]}


```

## Note
```
When "NODE_ENV !== production" the logs will be printed to the console and file.
When "NODE_ENV === production" the logs will be printed to the file only.
```