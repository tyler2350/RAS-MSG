/*
* RAS implementation
*/

'use strict'

const http = require('http');
const UUID = require('uuid');
const url = require('url');
var message = require('./message.js').msg;
const msg_state = require('./message.js').msg_state;
const colors = require('colors');

const CRLF = '\r\n';
function trace(arg) {
  console.log(arg.gray + '\n');
}

function error(arg) {
  console.log(arg.red + '\n');
}

function info(arg) {
  console.log(arg.green + '\n');
}
function send(res, status_code, content) {

  res.writeHead(status_code, {
    "Content-Type": "application/octet-stream",
    "Connection": "Keep-Alive"
  });
  res.write(content);
  res.end();

  info(content);
}
/*----------------------------------------------------------------------------------- */
http.createServer((req, res) => {
  let chunk = [];

  req.on('data', function (data) {
    chunk.push(data);
  });

  req.on('end', function () {
    let buf = Buffer.concat(chunk);
    console.log('~~~~~data~~~~~~~');
    info(buf.toString());

    OnMessage(buf, req, res);
    // if (req.method == 'POST') {
    //   let uuid = UUID.v1();
    //   send(res, 200, JSON.stringify({ "uuid": uuid }));
    // }
    // else
    //   send(res, 200, 'OK');
  })
}).listen(8000);

function OnMessage(data, req, res) {
  if (req.headers) {
    trace(JSON.stringify(req.headers));
  }

  let dataStr;

  if (typeof data !== 'string') {
    dataStr = data.toString();
  } else {
    dataStr = data;
  }
  let dataObj;//JSON format
  try {
    trace(dataStr);

    dataObj = JSON.parse(dataStr);
  }
  catch (e) {
    error('Invalid parameters! Can\'t parse!');
    send(res, 400, 'Invalid parameters! Can\'t parse!');
    return;
  }

  if (dataObj === undefined) {
    error('Invalid parameters! Can\'t parse!');
    send(res, 400, 'Invalid parameters! Can\'t parse!');
    return;
  }

  let uri = url.parse(req.url, true);
  if (uri.pathname == '/msg') {
    switch (req.method) {
      case 'POST':
        prepare(res, dataObj, uri.query.topic);
        break;
      case 'PUT':
        publish(res, uri.query.id);
        break;
      case 'DELETE':
        consume(res, uri.query.id);
        break;
    }
  }
  error('API Not found!');
  send(res, 400, 'API Not found!');
}

function prepare(res, data, topic) {
  // create msg
  let msg = new message(data, topic);
  var msg_id = UUID.v1();
  // store msg
  //todo...
  // monitor msg
  msg.on('prepared timeout', () => {
    // todo...
  });
  // return 200 OK
  send(res, 200, JSON.stringify({ "uuid": msg_id }));
}

function publish(res, id) {
  // get msg by id
  let msg;
  // todo...
  // clear prepared timeout
  msg.ClearTimeout();
  // change msg state and monitor msg
  msg.ChangeState(msg_state[1]);
  msg.SetTimeout();
  msg.on('published timeout', () => {
    // todo...
  });
  // post msg to MQ
  // todo...
  // return 200 OK
  send(res, 200, "OK");

}

function consume(res, id) {
  // get msg by id
  let msg;
  // todo...
  // clear published timeout
  msg.ClearTimeout();
  // remove msg
  // todo...
  // return 200 OK
  send(res, 200, "OK");
}