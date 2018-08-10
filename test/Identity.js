const Identity = artifacts.require("./Identity.sol");

const { expect } = require("chai");

contract("Identity", () => {

  let identity;

  before(async () => {
    identity = await Identity.new();
    assert(identity);
  })

  it("Adds the msg.sender as management key upon creation", async () => {
    const key = web3.sha3(web3.eth.accounts[0]);
    const keyDetails = await identity.getKey(key);
    console.log(keyDetails);
    const mgmtKey = await identity.keyHasPurpose(key, 1);
    console.log(mgmtKey);
  })
})