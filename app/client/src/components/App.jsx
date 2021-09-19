import React, { useEffect, useState } from 'react';
import './App.css';
import Web3 from 'web3';
import Color from '../contracts/Color.json';

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [colors, setColors] = useState([]);
  const [inputColor, setInputColor] = useState('');

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const networkData = Color.networks[networkId];
    if (networkData) {
      const abi = Color.abi;
      const address = networkData.address;
      const loadedContract = new web3.eth.Contract(abi, address);
      setContract(loadedContract);
      // console.log('loadedContract.methods', loadedContract.methods.totalSupply);
      const contractTotalSupply = await loadedContract.methods
        .totalSupply()
        .call();
      const colorList = [...colors];
      for (var i = 1; i <= contractTotalSupply; i++) {
        const color = await loadedContract.methods.colors(i - 1).call();
        colorList.push(color);
      }
      setColors(colorList);
    } else {
      window.alert('Smart contract not deployed to detected network.');
    }
  };

  const mint = (color) => {
    color = color === '' ? '#777777' : color;
    color = (color.startsWith('#') ? color : `#${color}`).toUpperCase();
    contract.methods
      .mint(color)
      .send({ from: account })
      .once('receipt', (receipt) => {
        console.log('receipt', receipt);
        setColors([...colors, color]);
      });
  };

  return (
    <div>
      <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
        <a
          className='navbar-brand col-sm-3 col-md-2 mr-0'
          href='http://www.dappuniversity.com/bootcamp'
          target='_blank'
          rel='noopener noreferrer'
        >
          Color Tokens
        </a>
        <ul className='navbar-nav px-3'>
          <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
            <small className='text-white'>
              <span id='account'>{account}</span>
            </small>
          </li>
        </ul>
      </nav>
      <div className='container-fluid mt-5'>
        <div className='row'>
          <main role='main' className='col-lg-12 d-flex text-center'>
            <div className='content mr-auto ml-auto'>
              <h1>Issue Token</h1>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  mint(inputColor);
                }}
              >
                <input
                  type='text'
                  className='form-control mb-1'
                  placeholder='e.g. #FFFFFF'
                  onChange={(input) => {
                    setInputColor(input.target.value);
                  }}
                />
                <input
                  type='submit'
                  className='btn btn-block btn-primary'
                  value='MINT'
                />
              </form>
            </div>
          </main>
        </div>
        <hr />
        <div className='row text-center'>
          {colors.map((color, key) => {
            return (
              <div key={key} className='col-md-3 mb-3'>
                <div className='token' style={{ backgroundColor: color }}></div>
                <div>{color}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
