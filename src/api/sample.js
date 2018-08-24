import { SNAKE_API } from '@/settings';
import Vue from 'vue';

// NOTE: A mash of the following apis: file/memory/store

export function getSample(SHA256Digest) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/store/${SHA256Digest}`).then((response) => {
      resolve(response.data.data.sample);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}

export function patchSample(sample, data) {
  return new Promise((resolve) => {
    Vue.http.patch(`${SNAKE_API}/${sample.file_type}/${sample.sha256_digest}`, data).then((response) => {
      resolve(response.data.data[sample.file_type]);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}

export function getSampleHex(sample) {
  // NOTE: Only works for file so blank through for any other
  return new Promise((resolve) => {
    if (sample.file_type === 'file') {
      Vue.http.get(`${SNAKE_API}/file/${sample.sha256_digest}/hex`).then((response) => {
        resolve(response.data.data.hex);
      }).catch((e) => {
        console.log(`An error occured - ${e}`);
        resolve(null);
      });
    } else {
      resolve(null);
    }
  });
}
