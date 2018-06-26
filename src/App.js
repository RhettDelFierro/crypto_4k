import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import CryptoCompareProvider from "./Contexts/CryptoCompare";
import SingleCompareProvider from "./Contexts/SingleCompare";
import TensorFlowComponent from './Components/TensorFlowComponent'
class App extends Component {
  render() {
    return (
      <SingleCompareProvider>
        <TensorFlowComponent />
      </SingleCompareProvider>
    );
  }
}

export default App;