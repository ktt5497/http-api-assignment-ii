const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Getting entire request body
const parseBody = (request, response, handler) => {
  // since the request comes in pieces, we are storing the pieces in this array.
  const body = [];

  // If there is an error, we write it to the console
  // and send back a 400-Bad Request error to the client.
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // putting chunks into the array.
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // When recieving all the info, we are turning
  // the body array into a single entity using Buffer.concat.
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    // GET request
    handler(request, response, bodyParams);
  });
};

// Creating an object to route our requests to the proper handlers.
// We are using the request.method to return the routing object for each type of method.
const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    '/notReal': jsonHandler.notFound,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    '/notReal': jsonHandler.notFoundMeta,
    notFound: jsonHandler.notFound,
  },

};

// handle POST
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.addUser);
  }
};

// handle GET requests
const handleGet = (request, response, parsedUrl) => {
  // returns 404 of the HEAD version if the request is making anything else.
  if (!urlStruct[request.method]) {
    return urlStruct.HEAD.notFound(request, response);
  }

  if (urlStruct[request.method][parsedUrl.pathname]) {
    return urlStruct[request.method][parsedUrl.pathname](request, response);
  }

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  }

  return urlStruct[request.method].notFound(request, response);
};

// function to handle requests
const onRequest = (request, response) => {
  // parsing information from the url
  const parsedUrl = url.parse(request.url);

  // check if method was POST, otherwise assume GET
  // for the sake of this example
  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

// start server
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
