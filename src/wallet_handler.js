const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InternalError, InvalidTransaction } = require('sawtooth-sdk').exceptions;
const { decodeData, hash } = require('./lib/helpers');

const FAMILY_NAME = "wallet-fammily", VERSION = "1.0", NAMESPACE = ["wallet", "wallfam", hash(FAMILY_NAME).substr(0, 6)];

class WalletHandler extends TransactionHandler {
  constructor() {
    super(FAMILY_NAME, VERSION, NAMESPACE);
  }

  apply(transactionRequest, context) {
    return decodeData(transactionRequest.payload)
      .then(payload => {
        if (!payload.action) {
          throw new InvalidTransaction("Payload does not contain the action");
        }

        if (!payload.id) {
          throw new InvalidTransaction("Payload does not contain the ID");
        }

        let action = payload.action;
        let address = NAMESPACE[2] + hash(payload.id).substring(0, 64);

        switch(action) {
          case "deposit":

          default:
            throw new InvalidTransaction("The action in Invalid or not supported by this transaction processor");
        }
      })
      .catch(err => {
        throw new InternalError("Error while decoding payload");
      })
  }
}
