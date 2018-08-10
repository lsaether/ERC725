pragma solidity ^0.4.24;

import "./ERC725.sol";

contract Identity is ERC725 {

    uint256 nonce;
    mapping (bytes32 => Key) keys;
    mapping (uint256 => bytes32[]) keysByPurpose;
    
    function getKey(bytes32 _key)
        public view returns (uint256[] purposes, uint256 keyType, bytes32 key)
    {
        return (
            keys[_key].purpose,
            keys[_key].keyType,
            keys[_key].key
        );
    }

    function keyHasPurpose(bytes32 _key, uint256 _purpose)
        public view returns (bool exists)
    {
        // Ideally this check should not be needed since DApp implementers
        // should not send illogical _purpose arguments which would return false positives.

        // if (keys[_key].key == 0x0) {
        //     exists = false;
        // }

        return keys[_key].purpose == _purpose;
    }

    function getKeysByPurpose(uint256 _purpose)
        public view returns (bytes32[] keys)
    {
        return keysByPurpose[_purpose];
    }

    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType)
        public returns (bool success)
    {
        require(keys[_key].key == 0x0, "Cannot overwrite key.");
        if (msg.sender != address(this)) {
            require(keyHasPurpose(keccak256(msg.sender), 1), "Sender must be a manangement key.");
        }

        // TODO approval process

        keys[_key] = new Key({
            purpose: _purpose,
            keyType: _keyType,
            key: _key
        });

        keysByPurpose[_purpose].push(_key);

        emit KeyAdded(_key, _purpose, _keyType);

        success = true;
    }

    function execute(address _to, uint256 _value, bytes _data)
        public returns (uint256 executionId)
    {
        
    }
}
