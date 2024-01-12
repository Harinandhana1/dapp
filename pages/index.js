import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async (amount) => {
    if (atm) {
      let tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async (amount) => {
    if (atm) {
      let tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <h1 style={{ fontSize: "2em", color: "#fff" }}>Choose your option:</h1>
        <button
          style={{
            backgroundColor: "#FF9933", // Saffron
            margin: "10px 0",
            padding: "15px",
            fontSize: "1.5em",
            display: "block",
          }}
          onClick={() => handleTransaction("deposit")}
        >
          1. Deposit
        </button>
        <button
          style={{
            backgroundColor: "#ffffff", // White
            margin: "10px 0",
            padding: "15px",
            fontSize: "1.5em",
            display: "block",
          }}
          onClick={() => handleTransaction("withdraw")}
        >
          2. Withdraw
        </button>
        <button
          style={{
            backgroundColor: "#28a745", // Green
            margin: "10px 0",
            padding: "15px",
            fontSize: "1.5em",
            display: "block",
          }}
          onClick={() => handleTransaction("balanceEnquiry")}
        >
          3. Balance Enquiry
        </button>
      </div>
    );
  };

  const handleTransaction = async (transactionType) => {
    if (transactionType === "balanceEnquiry") {
      alert(`Your current balance is: ${balance} ETH`);
    } else {
      let amount;
      do {
        amount = prompt(`Enter the amount of ETH to ${transactionType}:`);
      } while (isNaN(amount) || amount <= 0);

      if (transactionType === "deposit") {
        await deposit(parseFloat(amount));
      } else if (transactionType === "withdraw") {
        await withdraw(parseFloat(amount));
      }
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome my dear user</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #3498db; /* Some other color */
          padding: 20px;
          color: #fff;
        }
      `}</style>
    </main>
  );
}
