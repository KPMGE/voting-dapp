// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Turing is ERC20 {
    struct User {
        address addr;
        uint256 votingMask;
        uint code;
    }

    address private deployer;
    address private teacherAddress = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    mapping(string => User) private nameAuthorizedUsersMap;
    mapping(address => User) private addrAuthorizedUsersMap;
    uint private currentIdxAccounts = 0;
    bool public votingActive = true;
   
    constructor() ERC20("Turing", "TRC"){
        deployer = msg.sender;

        _addAuthorizedUser("nome2", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        _addAuthorizedUser("nome3", 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        _addAuthorizedUser("nome4", 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        _addAuthorizedUser("nome5", 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65);
        _addAuthorizedUser("nome6", 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc);
        _addAuthorizedUser("nome7", 0x976EA74026E726554dB657fA54763abd0C3a0aa9);
        _addAuthorizedUser("nome8", 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955);
        _addAuthorizedUser("nome9", 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f);
        _addAuthorizedUser("nome10", 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720);
        _addAuthorizedUser("nome11", 0xBcd4042DE499D14e55001CcbB24a551F3b954096);
        _addAuthorizedUser("nome12", 0x71bE63f3384f5fb98995898A86B02Fb2426c5788);
        _addAuthorizedUser("nome13", 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a);
        _addAuthorizedUser("nome14", 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec);
        _addAuthorizedUser("nome15", 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097);
        _addAuthorizedUser("nome16", 0xcd3B766CCDd6AE721141F452C550Ca635964ce71);
        _addAuthorizedUser("nome17", 0x2546BcD3c84621e976D8185a91A922aE77ECEc30);
        _addAuthorizedUser("nome18", 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E);
        _addAuthorizedUser("nome19", 0xdD2FD4581271e230360230F9337D5c0430Bf44C0);
        _addAuthorizedUser("nome20", 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199);
    }

    function issueToken(string memory accountCode, uint256 amount) public onlyTeacherOrOwner {
        require(nameAuthorizedUsersMap[accountCode].addr != address(0), "Turing: Account code not found!");
        _mint(nameAuthorizedUsersMap[accountCode].addr, amount);
    }

    function vote(string memory accountCode, uint256 amount) public onlyAuthorized onlyOnVotingActive {
        User memory receipt = nameAuthorizedUsersMap[accountCode];
        User memory voter = addrAuthorizedUsersMap[msg.sender];

        require(voter.votingMask == 0 || voter.votingMask & (0x1 << receipt.code) == 0, "Turing: Cannot vote twice on the same user!");
        require(amount < 200000000000000000, "Turing: Cannot vote more than 2 TRC");
        require(msg.sender != receipt.addr, "Turing: Cannot vote on yourself!");

        addrAuthorizedUsersMap[msg.sender].votingMask |= (0x1 << receipt.code);

        _mint(receipt.addr, amount);
        // the voter gets 0,2 turing
        _mint(msg.sender, 20000000000000000);
    }

    function votingOn() public onlyTeacherOrOwner {
        votingActive = true;
    }

    function votingOff() public onlyTeacherOrOwner {
        votingActive = false;
    }

    function _addAuthorizedUser(string memory accountCode, address user) internal {
        nameAuthorizedUsersMap[accountCode] = User(user, 0, currentIdxAccounts);
        addrAuthorizedUsersMap[user] = User(user, 0, currentIdxAccounts);
        currentIdxAccounts += 1;
    }

    modifier onlyTeacherOrOwner() {
        require(
            msg.sender == teacherAddress || msg.sender == deployer,
            "Turing: Method can only be called by teacher or owner"
        );
        _;
    }

    modifier onlyAuthorized() {
        require(addrAuthorizedUsersMap[msg.sender].addr != address(0), "Turing: Unauthorized!");
        _;
    }

    modifier onlyOnVotingActive() {
        require(votingActive, "Turing: Voting is not active at the moment!");
        _;
    }
}