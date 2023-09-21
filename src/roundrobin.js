const axios = require('axios');

class RoundRobin{
    endpoints = [];
    curr = 0;

    async handleRequest(req){
        if(this.endpoints.length == 0){
            throw new Error(`Load balancer configured over 0 endpoint`);
        }

        const endpoint = this.endpoints[this.curr];
        this.curr = (this.curr + 1) % this.endpoints.length;
        try{
            console.log(`Load balancer directing request to ${endpoint}`);
            const res = await axios.post(endpoint, req.body);
            return res;
        }catch(error){
            console.log(`Error making request at ${endpoint}:`);
            throw error;
        }
    } 

    registerEndpoints(addresses){
        this.curr = 0;
        this.endpoints = [...new Set(addresses)];
        console.log(`Load balancer configured over ${this.endpoints.length} endpoints: `, this.endpoints);     
    }
}

module.exports = RoundRobin;