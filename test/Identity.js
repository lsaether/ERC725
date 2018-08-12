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
    const account9 = web3.eth.accounts[9];
    const executeParams = {
      to: account9,
      value: web3.toWei("3", "gwei"),
      data: web3.sha3("Some data"),
    };

    web3.eth.sendTransaction({
      from: web3.eth.accounts[0],
      to: identity.address,
      value: executeParams.value,  
    })

    const account9BalanceBefore = web3.eth.getBalance(account9);

    const executeTx = await identity.execute(
      executeParams.to,
      executeParams.value,
      executeParams.data,
      {
        from: web3.eth.accounts[0],
      }
    );

    const { logs } = executeTx;
    expect(logs[0].event).to.equal("ExecutionRequest");
    expect(logs[0].args.executionId.toNumber()).to.equal(0);
    expect(logs[0].args.to).to.equal(executeParams.to);
    expect(logs[0].args.value.toString()).to.equal(executeParams.value);
    expect(logs[0].args.data).to.equal(executeParams.data);

    expect(logs[1].event).to.equal("Approved");
    expect(logs[1].args.executionId.toNumber()).to.equal(0);
    expect(logs[1].args.approved).to.equal(true);

    expect(logs[2].event).to.equal("Executed");
    expect(logs[2].args.executionId.toNumber()).to.equal(0);
    expect(logs[2].args.to).to.equal(executeParams.to);
    expect(logs[2].args.value.toString()).to.equal(executeParams.value);
    expect(logs[2].args.data).to.equal(executeParams.data);

    const account9BalanceAfter = web3.eth.getBalance(account9);

    expect(account9BalanceAfter.toNumber()).to.equal(account9BalanceBefore.toNumber() + parseInt(executeParams.value, 10));
  })

  it("Executes a transaction from action key", async () => {

  })

  it("Disallows removing a key when sent from action key", async () => {

  })

  it("Removes a key when sent from management key", async () => {

  })
})