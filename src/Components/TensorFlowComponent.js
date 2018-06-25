import React, { Component } from "react";
import { CryptoCompareContext } from "../Contexts/CryptoCompare";

class TensorFlowComponent extends Component {
  render() {
    return (
      <CryptoCompareContext.Consumer>
        {CryptoCompare => null}
      </CryptoCompareContext.Consumer>
    );
  }
}

export default TensorFlowComponent;
