// purely in memory; it will be cleared when node shuts down.
const users = {};

// responds WITH a json object
const respondJSON = (request, response, status, object) => {
  // header object
  const headers = {
    'Content-Type': 'application/json',
  };

  // send response with json object
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// responds WITHOUT a json object
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // sending response without json object, just heaers
  response.writeHead(status, headers);
  response.end();
};

// calculating a 200
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };

  // returns 200 message
  return respondJSON(request, response, 200, responseJSON);
};

// returns 200 without message, just the meta data
const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

// function for 404
const notFound = (request, response) => {
  // creating error message for response
  const responseJSON = {
    id: 'notFound',
    message: 'The page you are looking for was not found',

  };

  // returning 404 with a message
  respondJSON(request, response, 404, responseJSON);
};

// 404 without message
const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

// Adding a user from a POST body
const addUser = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name and age are both required.',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // defaulting status code to 204
  let responseCode = 204;

  // if user does not exist yet
  if (!users[body.name]) {
    // Set status code to 201 and creates empty user
    responseCode = 201;
    users[body.name] = {};
  }

  // updating fields for this user name
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  // if response is created then we set message and response with message.
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';

    return respondJSON(request, response, responseCode, responseJSON);
  }

  // 204 will not alter whe browser, since
  // it has an empty payload it sends a success. There is no message being sent.
  return respondJSONMeta(request, response, responseCode);
};

module.exports = {
  getUsers,
  getUsersMeta,
  notFound,
  notFoundMeta,
  addUser,
};
