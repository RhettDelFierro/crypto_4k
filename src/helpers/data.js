import moment from 'moment'
import {CONSTANTS} from './constants'

export const getZeroDerivativePoints = ({ symbol, history }) => {
  return {
    symbol,
    maxMinBlocks: getMaxMinBlocks(history)
  }
}

const getMaxMinBlocks = history =>
  history.map((v, i) => {
    if (i === 0 || i === history.length - 1) return v;
    if (history[i - 1].open < v.open && history[i + 1].open < v.open)
      return Object.assign(v, { maxIndex: i })
    if (history[i - 1].open > v.open && history[i + 1].open > v.open)
      return Object.assign(v, { minIndex: i })
    return v
  })

export const removeZero = ({ symbol, history }) => ({
  symbol,
  history: history.filter(
    v =>
      Boolean(v.close) &&
      Boolean(v.open) &&
      Boolean(v.volumefrom) &&
      Boolean(v.volumeto)
  )
})

export const convertTime = time => moment.unix(time).format('MMMM DD YYYY')

export const bossPoints = (maxMins, numberOfMaxes, numberOfMins) => {
    const { maxMinBlocks } = maxMins
  const CURRENT_TIMESTAMP = moment().unix()
  const LAST_FIVE_MONTHS = moment().subtract(5, "month").unix();
  

  const maxes = maxMinBlocks
    .filter(v => Boolean(v.maxIndex))
    .filter(v => v.time > LAST_FIVE_MONTHS)
    .sort((a, b) => b.open - a.open)

  const mins = maxMinBlocks
    .filter(v => Boolean(v.minIndex))
    .filter(v => v.time > LAST_FIVE_MONTHS)
    .sort((a, b) => a.open - b.open)


  const bossMaxes = maxes.filter((_, i) => i < numberOfMaxes)
  const bossMins = mins.filter((_, i) => i < numberOfMins)
    

    return {
        ...maxMins,
        bossMaxes,
        bossMins
    }
};

export const travelPath = (withBosses) => {
    const {symbol, maxMinBlocks, bossMaxes, bossMins} = withBosses
    const sortedMaxBossesByIndex = bossMaxes.sort((a,b) => a.maxIndex - b.maxIndex)
    const sortedMinBossesByIndex = bossMins.sort((a,b) => a.minIndex - b.minIndex)
    const [x1,x2,x3,x4,x5] = sortedMaxBossesByIndex
    const [n1,n2,n3,n4,n5] = sortedMinBossesByIndex

    const x1_x2 = maxMinBlocks.filter((_,i) => (i > x1.maxIndex) && (i < x2.maxIndex))
    const x2_x3 = maxMinBlocks.filter((_,i) => (i > x2.maxIndex) && (i < x3.maxIndex))
    const x3_x4 = maxMinBlocks.filter((_,i) => (i > x3.maxIndex) && (i < x4.maxIndex))
    const x4_x5 = maxMinBlocks.filter((_,i) => (i > x4.maxIndex) && (i < x5.maxIndex))
    const x5_end = maxMinBlocks.filter((_,i) => (i > x5.maxIndex))

    const x1_end = {
        x1_x2,
        x2_x3,
        x3_x4,
        x4_x5,
        x5_end
    }

    const n1_n2 = maxMinBlocks.filter((_,i) => (i > n1.minIndex) && (i < n2.minIndex))
    const n2_n3 = maxMinBlocks.filter((_,i) => (i > n2.minIndex) && (i < n3.minIndex))
    const n3_n4 = maxMinBlocks.filter((_,i) => (i > n3.minIndex) && (i < n4.minIndex))
    const n4_n5 = maxMinBlocks.filter((_,i) => (i > n4.minIndex) && (i < n5.minIndex))
    const n5_end = maxMinBlocks.filter((_,i) => (i > n5.minIndex))

    const n1_end = {
        n1_n2,
        n2_n3,
        n3_n4,
        n4_n5,
        n5_end
    }

    // const mixesBetween = {}
    // let arr = []
    // for (i = 0; i < sortedMaxBossesByIndex.length - 1; i ++) {
    //     let checkMaxIndex = sortedMaxBossesByIndex[i].maxIndex
    //     let nextCheckMaxIndex = maxMinBlocks.length - 1
    //     if (i !== sortedMaxBossesByIndex.length - 1) {
    //         nextCheckMaxIndex = sortedMaxBossesByIndex[i + 1].maxIndex
    //     }
    //     for (j = 0; j < maxMinBlock.length - 1; j++) {
    //         if (j > checkMaxIndex && j < nextCheckMaxIndex) {
    //             mixesBetween[`${checkMaxIndex}_${nextCheckMaxIndex}`] = [maxMinBlock[j],...arr]

    //         }
    //     }
    //     arr= []
    // }
    // const _ = sortedMaxBossesByIndex.map((max, maxIndex) => 
    //     maxMinBlocks
    //         .filter((maxmin, i) => {
    //             if (maxIndex !== sortedMaxBossesByIndex.length - 1) {
    //                 return (i > max.maxIndex) && ((i < sortedMaxBossesByIndex[maxIndex + 1].maxIndex))
    //             }
    //             return false
    //         })
    return {
        ...withBosses,
        x1_end,
        n1_end
    }
}