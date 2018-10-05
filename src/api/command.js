import { SNAKE_API } from '@/settings';
import Vue from 'vue';

export function getCommand(SHA256Digest, scale, command, { args, format } = {}) {
  let path = 'command';
  const params = [
    `sha256_digest=${SHA256Digest}`,
    `scale=${scale}`,
    `command=${command}`,
  ];
  if (args) {
    params.push(`args=${JSON.stringify(args)}`);
  }
  if (format) {
    params.push(`format=${format}`);
  }
  path = `${path}?${params.join('&')}`;
  return new Promise((resolve) => {
    fetch(`${SNAKE_API}/${path}`).then(res => res.json()).then((data) => {
      resolve(data);
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

export function getCommands({ noOutput, SHA256Digest } = {}) {
  let path = 'commands';
  const params = [];
  if (noOutput) {
    params.push(`output=${!noOutput}`);
  }
  if (SHA256Digest) {
    params.push(`sha256_digest=${SHA256Digest}`);
  }
  if (params.length > 0) {
    path = `${path}?${params.join('&')}`;
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
