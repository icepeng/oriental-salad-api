import axios from 'axios';
import { createConnection } from 'typeorm';

import * as Config from '../config';
import { HSReplayStatEntity } from '../core';
import { hsreplayMap } from './hsreplay';

async function run() {
  try {
    const hsreplayResponse: HSReplayResponse = await axios
      .get(
        // tslint:disable-next-line:max-line-length
        'http://hsreplay.net/analytics/query/card_included_popularity_report/?GameType=RANKED_STANDARD&RankRange=ALL&TimeRange=CURRENT_EXPANSION',
      )
      .then(res => res.data);
    const data = hsreplayResponse.series.data;
    const hsreplayStats: HSReplayStatEntity[] = hsreplayMap.reduce((arr, x) => {
      const matchedCardFromAll = data.ALL.find(card => card.dbf_id === x.dbfId);
      if (!matchedCardFromAll) {
        throw new Error(x.name);
      }
      if (x.cardClass === 'NEUTRAL') {
        return [
          ...arr,
          {
            updateTime: hsreplayResponse.as_of,
            dbfId: x.dbfId,
            name: x.name,
            popularityAll: matchedCardFromAll.popularity.toString(),
            popularityClass: null,
            winRate: matchedCardFromAll.winrate.toString(),
            count: matchedCardFromAll.count.toString(),
            decks: matchedCardFromAll.decks,
            cardCode: x.cardCode,
          },
        ];
      }
      const matchedCardFromClass = data[x.cardClass].find(
        card => card.dbf_id === x.dbfId,
      );
      if (!matchedCardFromClass) {
        throw new Error(x.name);
      }
      return [
        ...arr,
        {
          updateTime: hsreplayResponse.as_of,
          dbfId: x.dbfId,
          name: x.name,
          popularityAll: matchedCardFromAll.popularity.toString(),
          popularityClass: matchedCardFromClass.popularity.toString(),
          winRate: matchedCardFromAll.winrate.toString(),
          count: matchedCardFromAll.count.toString(),
          decks: matchedCardFromAll.decks,
          cardCode: x.cardCode,
        },
      ];
    }, []);

    const connection = await createConnection(Config.pgConfig);
    await connection.getRepository(HSReplayStatEntity).save(hsreplayStats);
    await connection.close();

    console.log('inserted');
    setTimeout(run, 1000 * 60 * 10);
  } catch (err) {
    console.error(err);
    setTimeout(run, 1000 * 60 * 10);
  }
}

run();

// async function yoshi() {
//   const connection = await createConnection(Config.pgConfig);
//   const res = await connection
//     .getRepository(CardEntity)
//     .find({ relations: ['hsreplayStat', 'stat'] });
//   await connection.close();
//   const stats = res.map(x => {
//     if (!x.hsreplayStat || !x.stat) {
//       throw new Error('Fuck');
//     }
//     return {
//       ...x.hsreplayStat,
//       ...x.stat,
//     };
//   });
//   stats.forEach(x => console.log(x.cardCode, x.value.mean, x.value.stdev, x.potential.mean, x.potential.stdev, x.winRate, x.popularity));
//   const meanValue = stats.reduce((sum, stat) => sum + stat.value.mean, 0) / stats.length;
//   console.log(meanValue);
//   const meanPotential = stats.reduce((sum, stat) => sum + stat.potential.mean, 0) / stats.length;
//   console.log(meanPotential);
//   const normalized = stats.map(x => {
//     return {
//       value: (x.value.mean - 50) / 60,
//       potential: (x.potential.mean - 50),
//       winrate: x.winRate,
//       popularity: x.popularity,
//     };
//   });
//   console.log(normalized);
// }

// yoshi();

interface HSReplayData {
  dbf_id: number;
  popularity: number;
  winrate: number;
  count: number;
  decks: number;
}

interface HSReplayResponse {
  as_of: string;
  render_as: string;
  series: {
    metadata: {
      total_played_decks_count: number;
    };
    data: {
      ALL: HSReplayData[];
      DRUID: HSReplayData[];
      HUNTER: HSReplayData[];
      MAGE: HSReplayData[];
      PALADIN: HSReplayData[];
      PRIEST: HSReplayData[];
      ROGUE: HSReplayData[];
      SHAMAN: HSReplayData[];
      WARLOCK: HSReplayData[];
      WARRIOR: HSReplayData[];
    };
  };
}
