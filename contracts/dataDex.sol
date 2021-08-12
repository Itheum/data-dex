pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts@4.1.0/token/ERC20/ERC20.sol";

contract ItheumDataDex {
    
    ERC20 public mydaToken;
    
    struct DataPack {
        address seller;
        bytes32 dataHash;
    }
    
    mapping(string => DataPack) public dataPacks;
    
    // list of addresses that has access to a dataPackId
    mapping(string => address[]) private accessAllocations;

    // address[dataPackId] will give you the dataHash (i.e. the proof for the progId reponse)
    // in web2, the dataPackId can link to a web2 storage of related meta (programId + program onbaording link etc)
    // ... this is not an issue, as if web2 was compromised in the end we will compare the result to the dataHash for integrity of the proof
    mapping(address => mapping(string => bytes32)) private personalDataProofs;
    
    constructor(ERC20 _mydaToken) {
        mydaToken = _mydaToken;
    }

    event AdvertiseEvent(string dataPackId, address seller);
    event PurchaseEvent(string dataPackId, address buyer, address seller, uint256 feeInMyda);
    
    // Data Owner advertising a data pack for sale
    function advertiseForSale(string calldata dataPackId, string calldata dataHashStr) external {
        bytes32 dataHash = stringToBytes32(dataHashStr);
        
        dataPacks[dataPackId] = DataPack({
            seller: msg.sender,
            dataHash: dataHash
        });

        // add the personal data proof for quick lookup as well
        personalDataProofs[msg.sender][dataPackId] = dataHash;

        emit AdvertiseEvent(dataPackId, msg.sender);
    }
    
    // A buyer, buying access to a advertised data pack
    function buyDataPack(string calldata dataPackId,  uint256 feeInMyda) external payable {
        // require(msg.value == 1 ether, "Amount should be equal to 1 Ether");
        
        uint256 myMyda = mydaToken.balanceOf(msg.sender);
        
        require(myMyda > 0, "You need MYDA to perform this function");
        require(myMyda > feeInMyda, "You dont have sufficient myda to proceed");
        
        uint256 allowance = mydaToken.allowance(msg.sender, address(this));
        require(allowance >= feeInMyda, "Check the token allowance");
        
        DataPack memory targetPack = dataPacks[dataPackId];
        
        mydaToken.transferFrom(msg.sender, targetPack.seller, feeInMyda);
        
        accessAllocations[dataPackId].push(msg.sender);

        emit PurchaseEvent(dataPackId, msg.sender, targetPack.seller, feeInMyda);
        
        // payable(targetPack.seller).transfer(1 ether);
    }
    
    // Verifies on-chain hash with off-chain hash as part of datapack purchase or to verify PDP
    function verifyData(string calldata dataPackId, string calldata dataHashStr) external view returns(bool) {
        bytes32 dataHash = stringToBytes32(dataHashStr);
         
        if (dataPacks[dataPackId].dataHash == dataHash) {
            return true; 
        } else {
            return false;
        }
    }
    
    // is an address as owner of a datapack?
    function checkAccess(string calldata dataPackId) public view returns(bool) {
        address[] memory matchedAllocation = accessAllocations[dataPackId];
        bool hasAccess = false;
        
        for (uint i=0; i < matchedAllocation.length; i++) {
            if (msg.sender == matchedAllocation[i]) {
                hasAccess = true;
                break;
            }
            
        }
        
        return hasAccess;
    }

    // get a personal data proof (PDP)
    function getPersonalDataProof(address calldata proofOwner, string calldata dataPackId) external view returns (bytes32) {
        return personalDataProofs[proofOwner][dataPackId];
    }

    // remove a personal data proof (PDP)
    function removePersonalDataProof(string calldata dataPackId) external returns (bool) {
        address callerOwnedProof = personalDataProofs[msg.sender][dataPackId];

        require(bytes(callerOwnedProof).length > 0, "You do not own that personal data proof");

        delete personalDataProofs[msg.sender][dataPackId];

        return true;
    }
    
    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
    
        assembly {
            result := mload(add(source, 32))
        }
    }
}