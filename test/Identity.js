const Identity = artifacts.require("./Identity.sol");

const { expect } = require("chai");

contract("Identity", () => {

  let identity;

  before(async () => {
    identity = await Identity.new();
    assert(identity);
    const txHash = identity.transactionHash;
    const tx = web3.eth.getTransactionReceipt(txHash);
    // console.log(tx.logs[0].topics);
  })

  it("Adds the msg.sender as management key upon creation", async () => {
    const key = web3.sha3(web3.eth.accounts[0], {encoding: "hex"});
    const keyDetails = await identity.getKey(key);
    expect(keyDetails[0].toNumber()).to.equal(1);
    expect(keyDetails[1].toNumber()).to.equal(1);
    expect(keyDetails[2]).to.equal(key);

    const mgmtKey = await identity.keyHasPurpose(key, 1);
    assert(mgmtKey);
  })
})