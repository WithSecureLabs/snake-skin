import { SNAKE_API } from '@/settings';
import Vue from 'vue';

export function getCommand(SHA256Digest, scale, command, { format } = {}) {
  let path = 'command';
  const args = [
    `sha256_digest=${SHA256Digest}`,
    `scale=${scale}`,
    `command=${command}`,
  ];
  if (format) {
    args.push(`format=${format}`);
  }
  path = `${path}?${args.join('&')}`;
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/${path}`).then((response) => {
      resolve(response.data);
    }).catch((e) => {
      if (typeof e.body !== 'undefined') {
        resolve(e.body);
      } else {
        console.error(e);
        resolve({
          data: null,
          message: e,
          status: 'error',
        });
      }
    });
  });
}

export function postCommand(SHA256Digest, scale, command, { args, format, timeout } = {}) {
  const data = {
    sha256_digest: SHA256Digest,
    scale,
    command,
    asynchronous: 'true',
  };
  if (args) {
    data.args = args;
  }
  if (format) {
    data.format = format;
  }
  if (timeout) {
    data.timeout = timeout;
  }
  return new Promise((resolve) => {
    Vue.http.post(`${SNAKE_API}/command`, data).then((response) => {
      resolve(response.data);
    }).catch((e) => {
      if (typeof e.body !== 'undefined') {
        resolve(e.body);
      } else {
        console.error(e);
        resolve({
          data: null,
          message: e,
          status: 'error',
        });
      }
    });
  });
}

export function getCommands({ SHA256Digest } = {}) {
  let path = 'commands';
  if (SHA256Digest) {
    path = `${path}?sha256_digest=${SHA256Digest}`;
  }
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/${path}`).then((response) => {
      resolve(response.data);
    }).catch((e) => {
      if (typeof e.body !== 'undefined') {
        resolve(e.body);
      } else {
        console.error(e);
        resolve({
          data: null,
          message: e,
          status: 'error',
        });
      }
    });
  });
}

export function postCommands(data) {
  return new Promise((resolve) => {
    Vue.http.post(`${SNAKE_API}/commands`, data).then((response) => {
      resolve(response.data);
    }).catch((e) => {
      if (typeof e.body !== 'undefined') {
        resolve(e.body);
      } else {
        console.error(e);
        resolve({
          data: null,
          message: e,
          status: 'error',
        });
      }
    });
  });
}
