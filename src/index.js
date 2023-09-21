const express = require('express');
const RoundRobin = require('./roundrobin');

const app = express();
app.use(express.json());
const port = process.env.PORT || 8000;

const loadBalancer = new RoundRobin();

app.post('/roundrobin/post', async (request, response) => {
    try{
        const res = await loadBalancer.handleRequest(request);     
        response.status(200).json(res.data);
    }catch(error){
        console.log(error.message);
        response.status(500).send(error.message);
    }
});

app.post('/roundrobin/configure', (req, res) => {
    const addresses = req.body;
    loadBalancer.registerEndpoints(addresses);
    res.status(200).send(loadBalancer.endpoints);
})

 app.listen(port, () => {
    console.log("Round Robin server listening on port:", port);
})