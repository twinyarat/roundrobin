const assert = require('assert');
const nock = require('nock');
const sinon = require('sinon');
const { default: axios } = require('axios');
const RoundRobin = require('../src/roundrobin');

describe('RoundRobin', function () {
    const loadBalancer = new RoundRobin();
    const endpoints = [
        'http://localhost:3000/echo',
        'http://localhost:3001/echo',
        'http://localhost:3002/echo',
        'http://localhost:3003/echo',
    ];

    const testReq = { method: 'POST', body: {
        username: 'user',
        email: 'user@gmail.com'
    }};


    describe('handleRequest()', function () {
        it('throws an error when configured with zero endpoints', () => {
            assert.rejects(
                async () => await loadBalancer.handleRequest({}), 
                Error('Load balancer configured over 0 endpoint')
            );
        })

        it('makes requests cyclically and uniformly across all endpoints', async () => {
            // mock each simple app endpoint to echo twice
            for (let ep of endpoints){
                nock(ep)
                .post('', testReq.body)
                .reply(200, testReq.body)
                .post('', testReq.body)
                .reply(200, testReq.body);
            }

            const spy = sinon.spy(axios, 'post');
            loadBalancer.registerEndpoints(endpoints);
            const reqs = Array(8).fill(testReq);

            const promiseArray = reqs.map(async (req) => await loadBalancer.handleRequest(req));           
            await Promise.all(promiseArray);

            const endpointsCalledArgs = spy.args.map((arg) => arg[0]);
            const endpointsTwice = endpoints.concat(endpoints);
        
            assert.deepEqual(endpointsCalledArgs, endpointsTwice);
        });

        it('returns JSON back to client', async () => {
            for (let ep of endpoints){
                nock(ep)
                .post('', testReq.body)
                .reply(200, testReq.body);
            }
            const response = await loadBalancer.handleRequest(testReq);
            assert.ok(response);
            assert.strictEqual(JSON.stringify(response.data), JSON.stringify(testReq.body));

        })
    });

    describe('registerEndpoints()', function () {
        it('sets endpoints to array of unique api addresses', () => {
            const endpoints = [
                'http://localhost:3000/echo',
                'http://localhost:3001/echo',
                'http://localhost:3002/echo',
                'http://localhost:3000/echo',
            ];

            loadBalancer.registerEndpoints(endpoints);
            assert.equal(loadBalancer.endpoints.length, 3);
        });
    })
});