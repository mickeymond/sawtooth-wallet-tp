const crypto = require('crypto');

const decodeData = (buffer) => (
  new Promise((resolve, reject) =>
    cbor.decodeFirst(buffer, (err, obj) => (err ? reject(err) : resolve(obj)))
  )
);

const hash = x => crypto.createHash('sha512').update(x).digest('hex').toLocaleLowerCase();

module.exports = {
  decodeData,
  hash
}
