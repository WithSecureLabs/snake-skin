import { SNAKE_API } from '@/settings';
import Vue from 'vue';

export function getStore({fileType, limit, sort} = {}) {
  let path = 'store';
  const args = [];
  if (typeof fileType !== 'undefined') {
    args.push(`file_type=${fileType}`);
  }
  if (typeof limit !== 'undefined') {
    args.push(`limit=${limit}`);
  }
  if (typeof sort !== 'undefined') {
    args.push(`sort=${sort}`);
  }
  if (args.length !== 0) {
    path = `${path}?${args.join('&')}`;
  }
  return new Promise((resolve) => {
    Vue.http.get(`${SNAKE_API}/${path}`).then((response) => {
      resolve(response.data.data.samples);
    }).catch((e) => {
      console.log(`An error occured - ${e}`);
      resolve(null);
    });
  });
}
