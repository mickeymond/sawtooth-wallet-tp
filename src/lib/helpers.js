const crypto = require('crypto');
const cbor = require('cbor');

const decodeData = (payload) => {
  return new Promise((resolve, reject) => {
    let result = cbor.decode(payload);
    return result ? resolve(result) : reject(result);
  });
}

const hash = x => crypto.createHash('sha512').update(x).digest('hex').toLocaleLowerCase();

module.exports = {
  decodeData,
  hash
}
