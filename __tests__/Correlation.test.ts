import {Correlation} from '../index';

describe('Correlation', () => {
    it('should set the values for correlation', () => {
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
        expect(Correlation.getValueByName('REQUEST_IDENTIFIER')).toEqual('req-id-689432');
    })

    it('should update the customer id', () => {
        Correlation.updateCustomerId('123');
        expect(Correlation.getValueByName('CUSTOMER_ID')).toEqual('123');
    })
})