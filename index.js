const express = require('express');
const app = express();
const promBundle = require("express-prom-bundle");
const { Histogram, Counter } = require('prom-client');

const requestCounter = new Counter({
    name: 'request_count',
    help: 'A counter of total requests',
    labelNames: ['api']
});

// Add the options to the prometheus middleware most option are for http_request_duration_seconds histogram metric
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: { project_name: 'hello_world', project_type: 'test_metrics_labels' },
    metricsType: Histogram,
    promClient: {
        collectDefaultMetrics: {
        }
    }
});
// add the prometheus middleware to all routes
app.use(metricsMiddleware)

// default endpoint
app.get("/", (req, res) => res.json({
    "GET /": "All Routes",
    "GET /hello": "{hello:world}",
    "GET /metrics": "Metrics data",
    "POST /bye": "POST Request: + post data"
}));

// hello world rest endpoint
app.get("/hello", async (req, res) => {
    if (typeof process._getActiveRequests !== 'function') {
        return;
    }
    requestCounter.inc({ api: 'hello' });
    //await delay(2000);
    res.json({ hello: "world", active_req: process._getActiveRequests().length });
});

app.post("/bye", (req, res) => {
    requestCounter.inc({ api: 'bye' });
    res.send("POST Request : " + req);
});

app.listen(8080, function () {
    console.log('Listening at http://localhost:8080');
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function run() {
    await delay(1000);
}

