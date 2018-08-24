import { SNAKE_API } from '@/settings';
import Vue from 'vue';

export function getCommands(SHA256Digest) {
  let path = 'commands';
  if (typeof SHA256Digest !== 'undefined') {
    path = `${path}?sha256_digest=${SHA256Digest}`;
  }
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/${path}`).then((response) => {
      resolve(response.data.data.commands);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}
