const { createContext, CryptoFactory } = require('sawtooth-sdk/signing');
const cbor = require('cbor');
const { createHash } = require('crypto');
const { protobuf } = require('sawtooth-sdk');
const request = require('request');

const context = createContext('secp256k1');
const privateKey = context.newRandomPrivateKey();
const signer = new CryptoFactory(context).newSigner(privateKey);

const payload = {
  id: 'John',
  action: 'deposit',
  data: {
    name: 'John',
    amount: 10000
  }
}

const payloadBytes = cbor.encode(payload);

const transactionHeaderBytes = protobuf.TransactionHeader.encode({
  // Public key for the client who added this transaction to a batch
  batcherPublicKey: signer.getPublicKey().asHex(),
  // A list of transaction signatures that describe the transactions that
  // must be processed before this transaction can be valid
  dependencies: [],
  // The family name correlates to the transaction processor's family name
  // that this transaction can be processed on, for example 'intkey'
  familyName: 'wallet-fammily',
  // The family version correlates to the transaction processor's family
  // version that this transaction can be processed on, for example "1.0"
  familyVersion: '1.0',
  // A list of addresses that are given to the context manager and control
  // what addresses the transaction processor is allowed to read from.
  inputs: [],
  // A random string that provides uniqueness for transactions with
  // otherwise identical fields.
  nonce: '',
  // A list of addresses that are given to the context manager and control
  // what addresses the transaction processor is allowed to write to.
  outputs: [],
  //The sha512 hash of the encoded payload
  payloadSha512: createHash('sha512').update(payloadBytes).digest('hex'),
  // Public key for the client that signed the TransactionHeader
  signerPublicKey: signer.getPublicKey().asHex()
}).finish();

const transactionHeaderSignature = signer.sign(transactionHeaderBytes);

const transaction = protobuf.Transaction.create({
  // The serialized version of the TransactionHeader
  header: transactionHeaderBytes,
  // The signature derived from signing the header
  headerSignature: transactionHeaderSignature,
  // The payload is the encoded family specific information of the transaction
  payload: payloadBytes
});

const transactions = [transaction];

const batchHeaderBytes = protobuf.BatchHeader.encode({
  signerPublicKey: signer.getPublicKey().asHex(),
  transactionIds: transactions.map(txn => txn.headerSignature)
}).finish();

const batchHeaderSignature = signer.sign(batchHeaderBytes);

const batch = protobuf.Batch.create({
  header: batchHeaderBytes,
  headerSignature: batchHeaderSignature,
  transactions: transactions
});

const batchListBytes = protobuf.BatchList.encode({
  batches: [batch]
}).finish();

request.post({
  url: 'http://localhost:8008/batches',
  body: batchListBytes,
  headers: {'Content-Type': 'application/octet-stream'}
}, (err, response) => {
  if (err) {
    return console.log(err);
  }

  console.log(response.body);
});
