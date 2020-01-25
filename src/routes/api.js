import { send } from "api/common";
import { SNAKE_API } from "config";

async function proxy(req, res) {
  const fetch = require("node-fetch").default;

  // 0. Are we auth'd? No because it is not implemented in the backend yet :P

  // 1. Validate and route app
  let url = SNAKE_API;

  // 2. Validate and append url path
  const path = req.query._path;
  if (path) {
    if (path.match(/^[\d\w\/\-\_\*\:]+$/g) === null) {
      return res.writeHead(400, "invalid path").end();
    }
    url += `/${path.replace(/^\/*/,'')}`;
  }

  // 3. Validate and append query params
  let params = [];
  Object.entries(req.query).forEach(([k, v])=> {
    if (k.startsWith("_")) return;
    params.push(`${k}=${v}`);
  });
  if (params.length) {
    url += `?${params.join("&")}`;
  }

  // 4. Build fetch object
  const opts = {
    headers: {},
    method: req.method,
  };
  if (req._readableState.length && req._readableState.length > 0) {
    opts.body = req;
  } else if (req.body && Object.keys(req.body).length > 0) { // Body parser will consume json...
    opts.body = JSON.stringify(req.body);
  }

  // 5. Passthrough important headers
  const keep = ['authorization', 'content-type', 'referer'];
  keep.forEach(k => {
    if (req.headers[k]) {
      opts.headers[k] = req.headers[k];
    }
  });
  fetch(url, opts).then(resp => {
      res.writeHead(resp.status, resp.statusText, {...resp.headers});
      return resp.body;
    }).then(body => {
      body.on('data', function (chunk) {
        res.write(chunk);
      });
      body.on('end', function (chunk) {
        res.end();
      });
    });
}

// Methods
export async function del(req, res) {
  return proxy(req, res);
}
export async function get(req, res) {
  return proxy(req, res);
}
export async function head(req, res) {
  return proxy(req, res);
}
export async function options(req, res) {
  return proxy(req, res);
}
export async function patch(req, res) {
  return proxy(req, res);
}
export async function post(req, res) {
  return proxy(req, res);
}
export async function put(req, res) {
  return proxy(req, res);
}
