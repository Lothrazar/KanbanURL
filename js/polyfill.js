
// polyfill since structuredClone doesnt exist old browsers, chrome98+ etc
const deepClone = (obj) => {
  if (typeof structuredClone === 'function') return structuredClone(obj);

  return JSON.parse(JSON.stringify(obj));
};

//inspired by jquery
const $ = id => document.getElementById(id);
