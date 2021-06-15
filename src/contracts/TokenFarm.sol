pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
	string public name = "Dapp Token Farm";
	DappToken public dappToken;
	DaiToken public daiToken;
	address public owner;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	// 1. Stake tokens

	function stakeTokens(uint _amount) public {

		require(_amount > 0, "amount cannot be 0");

		// Transfer Moch Dai token to this contract
		daiToken.transferFrom(msg.sender, address(this), _amount);		

		// Update staking balance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		// Add user to stakers array *only* if they haven't staked already
		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		// Uddate staking status
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;
	}

	// Unstake tokens

	function unstakeTokens() public {
		uint balance = stakingBalance[msg.sender];
		require(balance > 0, "staking balance cannot be 0");
		
		// Withdraw Mock DAI tokens
		daiToken.transfer(msg.sender, balance);
		
		// Reset staking balance
		stakingBalance[msg.sender] = 0;

		// Update staking status
		isStaking[msg.sender] = false;
	}

	// Issuing tokens

	function issueTokens() public {

		require(msg.sender == owner, "caller must be the owner");

		for (uint i = 0; i < stakers.length; i++){
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			if (balance > 0){
				dappToken.transfer(recipient, balance);	
			}			
		}
	}
}