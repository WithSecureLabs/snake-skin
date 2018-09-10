export function getItem(obj, path) {
  try {
    // TODO: Handle arrays not sure the below can handle that
    return path.split('.').reduce((value, el) => value[el], obj);
  } catch (err) {
    return {};
  }
}

export function toCaps(string) {
  // Split on space then capitalise
  const words = [];
  string.split(' ').forEach((word) => {
    words.push(word.charAt(0).toUpperCase() + word.slice(1));
  });
  return words.join(' ');
}

export function sorted(unordered) {
  const ordered = {};
  Object.keys(unordered).sort().forEach((key) => {
    ordered[key] = unordered[key];
  });
  return ordered;
}
