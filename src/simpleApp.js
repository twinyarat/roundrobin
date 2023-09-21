const express = require('express');
const client = require('prom-client');
const register = new client.Registry();
client.collectDefaultMetrics({register});
const port = process.env.PORT || parseInt(process.argv[2]) || 3000; 

const app = express();
app.use(express.json());
app.set('port', port);

app.post('/echo', (req, res) => {
    res.status(200).json(req.body);
});

app.get('/echo/cpu', async (req, res) => {
	try {
		res.set('Content-Type', register.contentType);
        const metrics = await register.getSingleMetricAsString('process_cpu_user_seconds_total');
		const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g;
        const cpuTime = metrics.match(NUMERIC_REGEXP);
        res.json({cpu_time: parseFloat(cpuTime)});
	} catch (err) {
		res.status(500).end(err);
	}
});

app.listen(port, () => {
    console.log("Simple App server listening on port:", port);
});
