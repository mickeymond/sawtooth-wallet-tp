const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InternalError, InvalidTransaction } = require('sawtooth-sdk').exceptions;
const { decodeData, hash } = require('./lib/helpers');
const cbor = require('cbor');

const FAMILY_NAME = "wallet-fammily", VERSION = "1.0", NAMESPACE = ["wallet", "wallfam", hash(FAMILY_NAME).substr(0, 6)];

class WalletHandler extends TransactionHandler {
  constructor() {
    super(FAMILY_NAME, [VERSION], NAMESPACE);

    this.timeout = 500;
  }

  apply(transactionProcessRequest, context) {
    return decodeData(transactionProcessRequest.payload)
      .then(payload => {
        if (!payload.action) {
          throw new InvalidTransaction("Payload does not contain the action");
        }

        if (!payload.id) {
          throw new InvalidTransaction("Payload does not contain the ID");
        }

        if (!payload.data) {
          throw new InvalidTransaction('Payload does not contain the data');
        }

        let action = payload.action;
        let id = payload.id;
        let address = NAMESPACE[2] + hash(id).substring(0, 64);

        switch(action) {
          case "deposit":
            let entries = {
              [address]: cbor.encode(payload.data)
            }
            return context.setState(entries, this.timeout);
          case "withdraw":
            return context.getState([address], this.timeout)
            .then(possibleAddressValues => {
              let stateValue = possibleAddressValues[address];
              if (stateValue && stateValue.length) {
                let value = cbor.decodeFirstSync(stateValue);
                if (value[id]) {
                  if (value[id].amount - payload['data']['amount'] >= 0) {
                    value[id].amount = value[id].amount - payload['data']['amount'];
                  } else {
                    throw new InvalidTransaction('Insufficient funds to complete the transaction');
                  }
                  let entries = {
                    [address]: cbor.encode(value[id])
                  }
                  return context.setState(entries, this.timeout);
                }
              }
            })
          default:
            throw new InvalidTransaction("The action in Invalid or not supported by this transaction processor");
        }
      })
      .catch(err => {
        throw new InternalError("Error while decoding payload");
      })
  }
}

module.exports = WalletHandler;