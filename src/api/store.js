import { SNAKE_API } from '@/settings';

export function getStore({
  fileType, filter, limit, sort,
} = {}) {
  let path = 'store';
  const args = [];
  if (typeof fileType !== 'undefined') {
    args.push(`file_type=${fileType}`);
  }
  if (typeof filter !== 'undefined') {
    // NOTE: Preformatted for now, not built here
    args.push(filter);
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
    fetch(`${SNAKE_API}/${path}`).then(res => res.json()).then((data) => {
      resolve(data.data.samples);
    }).catch((e) => {
      console.error(e);
      resolve(null);
    });
  });
}
