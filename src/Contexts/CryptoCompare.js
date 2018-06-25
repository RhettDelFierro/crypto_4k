import React, { Component } from "react";

import { alignTimes, COIN_LIST, getAverageOfGains, getCounts, getHistoryTop300, getMinAndMaxPrices, getRatios, getPrices } from '../helpers/api'

export const CryptoCompareContext = React.createContext();

class CryptoCompareProvider extends Component {
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
            const prices = await getPrices()
            const history = await getHistoryTop300(prices)
            // const minAndMaxPrices = history.map(getMinAndMax)
            const alignedCoins = history.map(v => alignTimes(BTC_Times, v))
            const countedOccurances = alignedCoins.map(getCounts)
            const filteredCountedOccurances = countedOccurances.filter(_ => ((_ !== undefined) && (_.successPercentage > 0)))
            const sortedFilteredCountedOccurances = filteredCountedOccurances.sort((a,b) => b.successPercentage - a.successPercentage)
            const averageGainedyFilteredCountedOccurances = sortedFilteredCountedOccurances.map(v => {
                const averageOfGains = getAverageOfGains(v)
                return {
                    symbol: v.symbol,
                    successPercentage: v.successPercentage,
                    gainOccurances: v.gainOccurances,
                    averageOfGains
                }
            })
            const sortedAverageGainedByFilteredCountedOccurances = averageGainedyFilteredCountedOccurances.sort((a,b) => b.averageOfGains - a.averageOfGains)
            console.log(sortedAverageGainedByFilteredCountedOccurances)
            console.log(sortedAverageGainedByFilteredCountedOccurances.sort((a,b) => b.successPercentage - a.successPercentage))
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
      <CryptoCompareContext.Provider value={{...this.state}}>
        {this.props.children}
      </CryptoCompareContext.Provider>
    );
  }
}

export default CryptoCompareProvider;
