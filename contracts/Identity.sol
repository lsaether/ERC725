pragma solidity ^0.4.24;

import "./ERC725.sol";

contract Identity is ERC725 {

    uint256 nonce;
    mapping (bytes32 => Key) keys;
    mapping (uint256 => bytes32[]) keysByPurpose;
    
    constructor() public {
        bytes32 origKey = hashAddr(msg.sender);
        keys[origKey] = Key({
            purpose: 1,
            keyType: 1,
            key: origKey
        });

        keysByPurpose[1].push(origKey);

        emit KeyAdded(origKey, 1, 1);
    }

    function getKey(bytes32 _key)
        public view returns (uint256 purpose, uint256 keyType, bytes32 key)
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
        public view returns (bytes32[])
    {
        return keysByPurpose[_purpose];
    }

    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType)
        public returns (bool success)
    {
        require(keys[_key].key == 0x0, "Cannot overwrite key.");
        if (msg.sender != address(this)) {
            require(keyHasPurpose(hashAddr(msg.sender), 1), "Sender must be manangement key.");
        }

        // TODO approval process

        keys[_key] = Key({
            purpose: _purpose,
            keyType: _keyType,
            key: _key
        });

        keysByPurpose[_purpose].push(_key);

        emit KeyAdded(_key, _purpose, _keyType);

        success = true;
    }

    function removeKey(bytes32 _key, uint256 _purpose)
        public returns (bool success)
    {
        require(keys[_key].key != 0x0, "Key does not exist!");
        if (msg.sender != address(this)) {
            require(keyHasPurpose(hashAddr(msg.sender), 1), "Sender must be management key.");
        }

        // TODO approval process

        require(keys[_key].purpose == _purpose, "Purpose does not exist for key!");

        // Put some state in memory
        uint256 keyType = keys[_key].keyType;

        delete keys[_key];

        for (uint256 i = 0; i < keysByPurpose[_purpose].length; i++) {
            if (keysByPurpose[_purpose][i] == _key) {
                delete keysByPurpose[_purpose];
            }
        }

        emit KeyRemoved(_key, _purpose, keyType);

        success = true;
    }

    function execute(address _to, uint256 _value, bytes _data)
        public returns (uint256 executionId)
    {
        bytes32 key = hashAddr(msg.sender);
        require(keyHasPurpose(key, 1) || keyHasPurpose(key, 2), "Sender must be management or action key.");

        emit ExecutionRequest(nonce, _to, _value, _data);

        bool isApproved = approve(nonce, true);

        if (isApproved) {
            bool wasSuccessful = _to.call.value(_value)(_data);
            if (wasSuccessful) {
                emit Executed(nonce, _to, _value, _data);
            }
        }

        nonce++;
        return nonce-1;
    }

    function approve(uint256 _id, bool _approved)
        public returns (bool success)
    {
        bytes32 key = hashAddr(msg.sender);
        require(keyHasPurpose(key, 1) || keyHasPurpose(key, 2), "Sender must be management or action key.");

        emit Approved(_id, _approved);

        return true;
    }

    function hashAddr(address _addr)
        private pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(_addr));
    }
}
