
/*
 * leftover soup + peta - KILDS LUNCH
 * charsia has leftovers for lunch + a peta
 * i can have soup + peta or pinto beans + chips and salsa
 */

const express = require('express');
const bodyParser = require('body-parser');
const Proxies = require('@mesos-playground/seneca-proxies');
const pkg = require('./package.json');

const srv = {
    math: Proxies.MathProxy(pkg.config.endpoints.MathService),
    uuid: Proxies.UuidProxy(pkg.config.endpoints.UuidService)
}

const app = express();

app.use(bodyParser());

app.get('/', function (req, res) { res.sendFile(__dirname+'/index.html'); });

app.get('/api/health/_ping', function(req, res) { res.send('pong'); });

app.get('/api/health/:srv', function(req, res) {
    if(srv.hasOwnProperty(req.params.srv)) {
        srv[req.params.srv].check().then(()=>{
            var ret = {}
            ret[req.params.srv] = "OK";
            res.json(ret);
        }).catch(err=>{
            res.status(503).json({ "message": err.message });
        });

    } else {
        res.status(404).json({ "message": "Unknown Service." });
    }
});

app.get('/api/uuid', function (req, res) {
    srv.uuid.generate().then(id=>{
        res.json({ "uuid": id });
    }).catch(err=>{
        res.status(503).json({ "message": err.message });
    });
});

app.post('/api/math/sum', function(req, res) {
    console.log(req.body);

    var a = Number(req.body.a);
    var b = Number(req.body.b);

    srv.math.sum(a, b).then(sum=>{
        res.json({ "sum": sum });
    }).catch(err=>{
        if(err.details)
            res.status(400).json({ "message": err.details.message });
        else
            res.status(503).json({ "message": "Service not available." });
    });
});

app.post('/api/math/product', function(req, res) {
    console.log(req.body);

    var a = Number(req.body.a) || req.body.a;
    var b = Number(req.body.b) || req.body.b;

    srv.math.product(a, b).then(product=>{
        res.json({ "product": product });
    }).catch(err=>{
        if(err.details)
            res.status(400).json({ "message": err.details.message });
        else
            res.status(503).json({ "message": "Service not available." });
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
