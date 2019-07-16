
const sleep = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  });
}

const firstTrue = (promises: Array<Promise<boolean>>) => {
    const newPromises = promises.map(p => new Promise(
        (resolve, reject) => p.then(v => v && resolve(true), reject)
    ));
    newPromises.push(Promise.all(promises).then(() => false));
    return Promise.race(newPromises);
}

const getRandom = (arr: Array<any>, n: number) => {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len) {
      return [... arr];
    }
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

export { sleep, firstTrue, getRandom };
