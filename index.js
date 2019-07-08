const { Account } = require('./account');
const { Message } = require('./message');

const start = async () => {
  const a = new Account();
  console.log(a.pubKey)
  const m = new Message();
  console.log(m.nonce)
}

start();
