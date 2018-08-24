import { SNAKE_API } from '@/settings';
import Vue from 'vue';

export function getScale(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}`).then((response) => {
      resolve(response.data.data.scale);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}

export function getScaleCommands(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}/commands`).then((response) => {
      resolve(response.data.data.commands);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}

export function getScaleInterface(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}/interface`).then((response) => {
      resolve(response.data.data.interface);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}

export function getScaleUpload(scale) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/scale/${scale}/upload`).then((response) => {
      resolve(response.data.data.upload);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}

export function getScales(fileType) {
  let path = 'scales';
  if (typeof fileType !== 'undefined') {
    path = `${path}?file_type=${fileType}`;
  }
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/${path}`).then((response) => {
      resolve(response.data.data.scales);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}

export function pullScaleInterface(scale, pull, SHA256Digest, format) {
  const data = {
    sha256_digest: SHA256Digest,
    type: 'pull',
    format: 'plaintext',
    command: pull,
  };
  if (typeof format !== 'undefined') {
    data.format = format;
  }
  return new Promise((resolve) => {
    Vue.http.post(`${SNAKE_API}/scale/${scale}/interface`, data).then((response) => {
      resolve(response.data.data.interface);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      if (typeof e.body === 'undefined') {
        resolve({ output: e.statusText });
      } else {
        resolve({ output: e.body.message });
      }
    });
  });
}
