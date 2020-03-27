var proxy = require('cors-anywhere');
proxy.createServer({}).listen(8080, "0.0.0.0",  () => {
    console.log("Running CORS Anywhere proxy on localhost on port 8080");
});
