// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

contract MemeVIP is Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, PausableUpgradeable, OwnableUpgradeable, ERC721BurnableUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    address proxyRegistryAddress;
    uint256 basePrice;
    uint256 _totalSupply;
    bytes32 merkleRoot;
    bool _wlMint;
    bool _publicMint;

    CountersUpgradeable.Counter private _tokenIdCounter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() initializer public {
        __ERC721_init("Meme VIP", "MVIP");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Pausable_init();
        __Ownable_init();
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
        address _proxyRegistryAddress = 0xa5409ec958C83C3f309868babACA7c86DCB077c1;
        proxyRegistryAddress = _proxyRegistryAddress;
        basePrice = 80000000000000000;
        _totalSupply = 3555;
        _tokenIdCounter.increment();
        _wlMint = false;
        _publicMint = false;
    }

    function wlMint(uint256 count, bytes32[] calldata proof) public payable {
        require(_wlMint == true, 'MINTING NOT YET STARTED');
        require(count <= 10, 'MAX 10 PER TRANSACTION');
        require(msg.value >= basePrice * count, 'INCREASE PAYMENT TO MINT');
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProofUpgradeable.verify(proof, merkleRoot, leaf),'NOT ON WHITELIST');
        for(uint256 i=0; i< count; i++){
            uint256 tokenId = _tokenIdCounter.current();
            require(tokenId <= _totalSupply);
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
        }
    }

    function batchMint(uint256 count) public payable {
        require(_publicMint == true, 'PUBLIC MINTING NOT YET STARTED');
        require(count <= 10, 'MAX 10 PER TRANSACTION');
        require(msg.value >= basePrice * count, 'INCREASE PAYMENT TO MINT');
        for(uint256 i=0; i< count; i++){
            uint256 tokenId = _tokenIdCounter.current();
            require(tokenId <= _totalSupply);
            _tokenIdCounter.increment();
            _safeMint(msg.sender, tokenId);
        }
    }  

    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function commenceWlMint() public onlyOwner {
        _wlMint = true;
    }
    
    function commencePublicMint() public onlyOwner {
        _publicMint = true;
    }

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        override
        public
        view
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }

    function currentToken() public view returns (uint256) {
        uint256 currentNFT = _tokenIdCounter.current();
        return currentNFT;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.goatkeepers.sh/v1/meme/metadata/";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function withdrawAll() public {
        uint256 amount = address(this).balance;
        require(payable(owner()).send(amount));
    }
}