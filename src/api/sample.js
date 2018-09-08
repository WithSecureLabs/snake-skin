import { SNAKE_API } from '@/settings';
import Vue from 'vue';

// NOTE: A mash of the following apis: file/memory/store

export function getSample(SHA256Digest) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/store/${SHA256Digest}`).then((response) => {
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

export function patchSample(sample, data) {
  return new Promise((resolve) => {
    Vue.http.patch(`${SNAKE_API}/${sample.file_type}/${sample.sha256_digest}`, data).then((response) => {
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

export function getSampleHex(sample) {
  return new Promise((resolve) => {
    if (sample.file_type === 'file') {
      Vue.http.get(`${SNAKE_API}/file/${sample.sha256_digest}/hex`).then((response) => {
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
    } else {
      resolve({
        data: null,
        message: 'not a file',
        status: 'error',
      });
    }
  });
}
