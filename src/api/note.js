import { SNAKE_API } from '@/settings';
import Vue from 'vue';

export function getNote(SHA256Digest) {
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/note/${SHA256Digest}`).then((response) => {
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

export function patchNote(SHA256Digest, data) {
  const note = data;
  note.sha256_digest = SHA256Digest;
  return new Promise((resolve) => {
    Vue.http.patch(`${SNAKE_API}/note/${SHA256Digest}`, data).then((response) => {
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

export function postNote(SHA256Digest, data) {
  const note = data;
  note.sha256_digest = SHA256Digest;
  return new Promise((resolve) => {
    Vue.http.post(`${SNAKE_API}/note`, data).then((response) => {
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
