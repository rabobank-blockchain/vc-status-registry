pragma solidity 0.5.2;

contract VcStatusRegistry {

    mapping(address => mapping(address => bool)) private registry;

    event VcStatusSet(
        address indexed issuer,
        address indexed credentialId
    );

    event VcStatusRemoved(
        address indexed issuer,
        address indexed credentialId
    );

    // create or update VcStatus
    function setVcStatus(address credentialId) external {
        registry[msg.sender][credentialId] = true;
        emit VcStatusSet(msg.sender, credentialId);
    }

    function getVcStatus(address issuer, address credentialId) external view returns(bool) {
        return registry[issuer][credentialId];
    }

    function removeVcStatus(address credentialId) external {
        delete registry[msg.sender][credentialId];
        emit VcStatusRemoved(msg.sender, credentialId);
    }
}