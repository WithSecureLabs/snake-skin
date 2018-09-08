import { SNAKE_API } from '@/settings';

export function getStore({
  fileType, filter, limit, order, sort,
} = {}) {
  let path = 'store';
  const args = [];
  if (fileType) {
    args.push(`file_type=${fileType}`);
  }
  if (filter) {
    // NOTE: Preformatted for now, not built here
    args.push(filter);
  }
  if (limit) {
    args.push(`limit=${limit}`);
  }
  if (order) {
    args.push(`order=${order}`);
  }
  if (sort) {
    args.push(`sort=${sort}`);
  }
  if (args.length > 0) {
    path = `${path}?${args.join('&')}`;
  }
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
