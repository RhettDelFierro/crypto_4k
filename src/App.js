import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import CryptoCompareProvider from "./Contexts/CryptoCompare";
import TensorFlowComponent from './Components/TensorFlowComponent'
class App extends Component {
  render() {
    return (
      <CryptoCompareProvider>
        <TensorFlowComponent />
      </CryptoCompareProvider>
    );
  }
}

export default App;
