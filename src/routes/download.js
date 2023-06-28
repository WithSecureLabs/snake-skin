import { send } from "api/common";
import { SNAKE_API } from "config";

export async function get(req, res) {
  const fetch = (await import('node-fetch')).default;
  let headers = {};
  let url = `${SNAKE_API}/download/${req.query.sha256_digest}`;
  fetch(url, {
    method: 'GET',
    headers,
  }).then(resp => {
      if (!resp.ok) {
        res.writeHead(resp.status, resp.statusText);
      } else {
        res.setHeader('Content-Disposition', resp.headers.get('content-disposition'));
        res.setHeader('Content-Length', resp.headers.get('content-length'));
        res.setHeader('Content-Type', resp.headers.get('content-type'));
        res.setHeader('Transfer-Encoding', resp.headers.get('transfer-encoding'));
      }
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
