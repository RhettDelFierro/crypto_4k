import React, { Component } from "react";

import { alignTimes, COIN_LIST, getZeroDerivativePoints, getAverageOfGains, getCounts, getCoinHistory, getHistoryTop300, getMinAndMaxPrices, getRatios, getPrices, removeZero } from '../helpers/api'

export const SingleCompareContext = React.createContext();

class SingleCompareProvider extends Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [],
            prices: []
        }
    }

    async componentDidMount() {
        try {
            const BTC_Times = await getRatios()
            const singlePrice = await getCoinHistory('ENG')
            const maxMins = await getZeroDerivativePoints(removeZero(singlePrice))
            console.log(maxMins)
            // const aligned = alignTimes(BTC_Times, removeZero(singlePrice))
            // console.log(aligned)
        } catch (error) {
            console.log(error)
        }
    }

    getAveragesForField = field =>
        this[field].reduce((acc, v) => {
            return acc + v;
        }, 0) / this[field].length;

    getStandardDeviations = field =>
        this[field].reduce((acc, v) => {
            return acc + v;
        }, 0) / this[field].length;

    // getCoinsWithMaxSupplies = () =>
    //     this.state.BOSSES.filter(c => !!c.max_supply)

  render() {
    return (
      <SingleCompareContext.Provider value={{...this.state}}>
        {this.props.children}
      </SingleCompareContext.Provider>
    );
  }
}

export default SingleCompareProvider;