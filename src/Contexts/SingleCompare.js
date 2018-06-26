import React, { Component } from "react";

import { alignTimes, COIN_LIST, getAverageOfGains, getCounts, getCoinHistory, getHistoryTop300, getMinAndMaxPrices, getRatios, getPrices, } from '../helpers/api'
import { convertTime, travelPath, bossPoints, getZeroDerivativePoints, removeZero } from '../helpers/data'

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
            // const BTC_Times = await getRatios()
            const singlePrice = await getCoinHistory('ICX')
            const convertedTimes = {
                symbol: singlePrice.symbol,
                history: singlePrice.history.map(v => Object.assign(v, {date: convertTime(v.time)}))
            }
            const maxMins = getZeroDerivativePoints(removeZero(convertedTimes))
            const withBosses = bossPoints(maxMins, 5, 5)
            const betweenBosses = travelPath(withBosses)
            console.log(betweenBosses)
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