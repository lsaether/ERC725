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

  it("Adds a new key when sent from management key", async () => {
    const keyToAdd = web3.sha3(web3.eth.accounts[3], {encoding: "hex"});
    const success = await identity.addKey(keyToAdd, 2, 1, {from: web3.eth.accounts[0]});
    assert(success);

    const keyDetails = await identity.getKey(keyToAdd);
    expect(keyDetails[0].toNumber()).to.equal(2);
    expect(keyDetails[1].toNumber()).to.equal(1);
    expect(keyDetails[2]).to.equal(keyToAdd);

    const mgmtKey = await identity.keyHasPurpose(keyToAdd, 1);
    assert.isFalse(mgmtKey);
    
    const actionKey = await identity.keyHasPurpose(keyToAdd, 2);
    assert(actionKey);
  })

  it("Disallows adding a new key when sent from action key", async () => {
    const keyToAdd = web3.sha3(web3.eth.accounts[7], {encoding: "hex"});
    let returnVal;
    try {
      returnVal = await identity.addKey(keyToAdd, 2, 1, {from: web3.eth.accounts[3]});
    } catch (e) {
      const reverted = e.toString().indexOf("VM Exception while processing transaction: revert");
      expect(reverted).to.not.equal(-1);
    }

    expect(returnVal).to.be.undefined;
  })

  it("Gets keys by purpose", async () => {
    const mgmtKeys = await identity.getKeysByPurpose(1);
    expect(mgmtKeys[0]).to.equal(web3.sha3(web3.eth.accounts[0], {encoding: "hex"}));

    const actionKeys = await identity.getKeysByPurpose(2);
    expect(actionKeys[0]).to.equal(web3.sha3(web3.eth.accounts[3], {encoding: "hex"}));

    expect(mgmtKeys.length).to.equal(1);
    expect(actionKeys.length).to.equal(1);
  })

  it("Executes a transaction from management key", async () => {

  })

  it("Executes a transaction from action key", async () => {

  })

  it("Disallows removing a key when sent from action key", async () => {

  })

  it("Removes a key when sent from management key", async () => {

  })
})