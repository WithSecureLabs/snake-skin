import { SNAKE_API } from '@/settings';
import Vue from 'vue';

export function getScale(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}`).then((response) => {
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

export function getScaleCommands(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}/commands`).then((response) => {
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

export function getScaleInterface(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}/interface`).then((response) => {
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

export function getScaleUpload(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}/upload`).then((response) => {
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

export function getScales({ fileType } = {}) {
  let path = 'scales';
  if (fileType) {
    path = `${path}?file_type=${fileType}`;
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

export function postScaleInterface(
  scale, type, command, SHA256Digest,
  { args, format, timeout } = {},
) {
  const data = {
    format: 'json',
    sha256_digest: SHA256Digest,
    command,
    type,
  };
  if (format) {
    data.format = format;
  }
  if (args) {
    data.args = args;
  }
  if (timeout) {
    data.timeout = timeout;
  }
  return new Promise((resolve) => {
    Vue.http.post(`${SNAKE_API}/scale/${scale}/interface`, data).then((response) => {
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
