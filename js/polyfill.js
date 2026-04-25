
// structuredClone doesnt exist on old browsers (chrome 98+) so shim a fallback
const deepClone = (obj) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
};
