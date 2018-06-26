import axios from 'axios'
import Promise from 'bluebird'
import {LIMITS} from './constants'

const BTC = () => axios.get('https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym=USD&limit=2000').then(_ => _)

export const COIN_LIST = () => axios.get('https://min-api.cryptocompare.com/data/all/coinlist').then(_ => _)

export const getCoinPricesMulti = (str) => axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${str}&tsyms=BTC,USD,EUR`).then(_ => _) 
export const getCoinHistory = (str) => axios.get(`https://min-api.cryptocompare.com/data/histoday?fsym=${str}&tsym=USD&limit=2000`).then(_ => ({symbol: str, history: _.data.Data}))

export const getZeroDerivativePoints = ({symbol, history}) => {
    return {
        symbol, 
        maxMinBlocks: getMaxMinBlocks(history)
    }
}

export const getMaxMinBlocks = (history) => 
    history.map((v,i) => {
        if ((i === 0) || (i === (history.length - 1))) return v
        if ((history[i -1].open < v.open) && (history[i + 1].open < v.open)) return Object.assign(v, {maxIndex: i})
        if ((history[i -1].open > v.open) && (history[i + 1].open > v.open)) return Object.assign(v, {minIndex: 1})
        return v
    })

export const getRatios = async () => {
    const BTC_ARR = await BTC()
    const BTC_DATA = BTC_ARR.data.Data
    return BTC_DATA.map(data => {
        let bitcoinRatio = (data.close / data.open)
        if (bitcoinRatio < 1) {
            bitcoinRatio = bitcoinRatio * -1
        }
        return {
        ...data,
        bitcoinRatio: bitcoinRatio * 100
    }
    })
}

/**
 * Mainly used to order prices of each coin. This will get them in chunks for rate limiting.
 * Because: we can pull off the "Top x" coins.
 * 1 - Gets the price for each coin
 * 2 - sorts prices by highest to lowest
 * ex response: {"ETH":{"BTC":0.07376,"USD":460.27,"EUR":393.32}}
 */
export const getPrices = async () => {
    const ALL_COINS = await COIN_LIST()
    const ALL_COINS_DATA = ALL_COINS.data.Data
    const ALL_COINS_SYMBOLS = Object.values(ALL_COINS_DATA).map(v => v.Symbol)
    const subList = chunk(ALL_COINS_SYMBOLS, 50)
    const symbolStringArr = subList.map(sublist => createSymbolString(sublist))
    const reqs = await Promise.all(symbolStringArr.map(getCoinPricesMulti))
    const allPrices = reqs.map(_ => _.data)
    //concat into one large list
    const noUSDArrRes = [].concat(...allPrices)
    const noUSDArr = noUSDArrRes.map(v => Object.entries(v).map(([key,value]) => ({
        symbol: key,
        ...value
    })))
    const noUSD = [].concat(...noUSDArr)
    return noUSD.sort((a,b) => (b.USD - a.USD))
}

/**
 * Throttles on each request: we get the price history of a coin.
 * ex response: [{"time":1438905600,"close":3,"high":3,"low":0.6747,"open":0.6747,"volumefrom":123.93,"volumeto":371.79}, ...]
 */
const promisesHistory = (arr) => arr.map((symbol) => {
    return new Promise((resolve, reject) => {
        setTimeout(
            () =>
                axios
                    .get(`https://min-api.cryptocompare.com/data/histoday?fsym=${symbol}&tsym=USD&limit=2000`)
                    .then(res => resolve(res))
                    .catch(err => reject(err)),
            2 / LIMITS.HISTO.SECOND
        );
    });
});

export const getHistoryTop300 = async (prices) => {
    const queryCoinSymbols = prices.map(v => v.symbol)
    const top280 = queryCoinSymbols.filter((_,i) => (i < 280))
    return Promise.all(promisesHistory(top280))
    // console.log(reqs)
    // const reqs = await Promise.map(top300, getCoinHistory, {concurrency: 5})
    //return removeZeros(reqs)
}

export const getMinAndMaxPrices = (history) =>
    history.reduce()

export const removeZeros = historyData =>
    historyData.map(({symbol, history}) => ({
        symbol,
        history: history.filter(v => (Boolean(v.close) && Boolean(v.open) && Boolean(v.volumefrom) && Boolean(v.volumeto)))
    }))

export const removeZero = ({symbol, history}) => ({
    symbol,
    history: history.filter(v => (Boolean(v.close) && Boolean(v.open) && Boolean(v.volumefrom) && Boolean(v.volumeto)))
})

export const alignTimes = (BTCTimes, {symbol, history}) => {
    const alignedHistory = BTCTimes.map(bitcoin => {
        const {time, bitcoinRatio} = bitcoin
        const BTCTimeCheck = timeCheck(time)
        const timedHistoryItem = history.find(BTCTimeCheck)
        return timedHistoryItem ? getRatioData(bitcoin, timedHistoryItem) : null
    })
    const filteredHistory = alignedHistory.filter(Boolean)
    return { symbol, alignedHistory: filteredHistory }
}

const getRatioData = (bitcoin, altCoin) => {
    const {close, high, low, open, time, volumefrom, volumeto} = altCoin
    const {bitcoinRatio} = bitcoin
    let ratio = (close / open)
    if (ratio < 1) {
        ratio = ratio * -1
    }
    
    ratio = (ratio * 100)
    
    let btcAndAltPositive = false
    
    const ratioVsBTC = (ratio - bitcoinRatio)
    if ((bitcoinRatio > 1) && (ratio > 1)) btcAndAltPositive = true 
    // if ((bitcoinRatio < 1) && (ratio > 1)) ratioVsBTC = 
    // if ((bitcoinRatio > 1) && (ratio > 1)) ratioVsBTC = 
    // if ((bitcoinRatio > 1) && (ratio < 1)) ratioVsBTC = 
    return {
        time,
        // if positive, that means the alt outgrew btc by some % points that day
        // if negative, that means the alt lost to btc by some % points that day
        ratioVsBTC, // ratioVsBTC < 500 ? (ratio - bitcoinRatio) : 0,
        btcAndAltPositive,
        altCoin,
        bitcoin
    }
}

export const getCounts = ({symbol, alignedHistory}) => {
    // > 0 means it grew more than btc by a certain %
    // < 0 means BTC outgrew it that day by a certain %
    if (symbol !== 'BTC') {
        const gainOccurances = alignedHistory.filter(({ratioVsBTC, btcAndAltPositive}) =>  (btcAndAltPositive && (ratioVsBTC > 0)))
        const successPercentage = gainOccurances.length > 0 ? ((gainOccurances.length / alignedHistory.length) * 100) : 0
        return { symbol, successPercentage, gainOccurances }
    }
}

export const getAverageOfGains = ({gainOccurances}) => {
    const total = gainOccurances.reduce((acc, {ratioVsBTC}) => {
        return acc + ratioVsBTC
    }, 0)
    return total / gainOccurances.length
}

const timeCheck = (BTCTime) => ({time}) => (BTCTime === time)

const chunk = (a, l) => { 
    if (a.length === 0) return []; 
    else return [a.slice(0, l)].concat(chunk(a.slice(l), l)); 
}

const createSymbolString = (arr) => {
    const str = arr.reduce((acc,v) => `${acc},${v}`, '')
    return str.substring(1, str.length)
}