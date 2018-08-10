const Identity = artifacts.require("./Identity.sol");

module.exports = (deployer) => {
  return deployer.deploy(Identity);
};
