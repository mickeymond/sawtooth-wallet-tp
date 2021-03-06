const { TransactionProcessor } = require('sawtooth-sdk/processor');
const WalletHandler = require('./src/wallet_handler');

const transactionProcessor = new TransactionProcessor('tcp://localhost:4004');

// Add Transaction Processor Handler to TP
transactionProcessor.addHandler(new WalletHandler());

// Start Transaction Processor
transactionProcessor.start();

// Handle Stop Process
process.on('SIGUSR2', () => {
  transactionProcessor._handleShutdown();
});

process.on('beforeExit', async () => {
  await transactionProcessor._handleShutdown();
})

console.log('Transaction Processor Connected');
