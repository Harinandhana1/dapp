// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public fixedSIPAmount;
    uint256 public flexibleSIPAmount;
    uint256 public flexibleSIPIncrementRate;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event FixedSIP(uint256 amount);
    event FlexibleSIP(uint256 amount, uint256 incrementRate);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        fixedSIPAmount = 0;
        flexibleSIPAmount = 0;
        flexibleSIPIncrementRate = 10;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        require(msg.sender == owner, "You are not the owner of this account");

        balance += _amount;

        assert(balance == _previousBalance + _amount);

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;

        assert(balance == (_previousBalance - _withdrawAmount));

        emit Withdraw(_withdrawAmount);
    }

    function startFixedSIP(uint256 _sipAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        fixedSIPAmount = _sipAmount;

        emit FixedSIP(_sipAmount);
    }

    function startFlexibleSIP(uint256 _sipAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        flexibleSIPAmount = _sipAmount;

        emit FlexibleSIP(_sipAmount, flexibleSIPIncrementRate);
    }

    function incrementFlexibleSIP() public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(flexibleSIPAmount > 0, "Flexible SIP not started");

        uint256 incrementAmount = (flexibleSIPAmount * flexibleSIPIncrementRate) / 100;

        flexibleSIPAmount += incrementAmount;

        emit FlexibleSIP(flexibleSIPAmount, flexibleSIPIncrementRate);
    }
}
