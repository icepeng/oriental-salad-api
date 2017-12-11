import axios from 'axios';
import { HSReplayStatEntity } from 'core';
import { createConnection } from 'typeorm';

import * as Config from '../config';
import { CARD_LIST } from '../service/card/cards';

const hsreplay: { name: string; dbfId: number }[] = require('./hsreplay');

async function run() {
  try {
    const hsreplayResponse: HSReplayResponse = await axios
      .get(
        // tslint:disable-next-line:max-line-length
        'http://hsreplay.net/analytics/query/card_included_popularity_report/?GameType=RANKED_STANDARD&RankRange=ALL&TimeRange=CURRENT_EXPANSION',
      )
      .then(res => res.data);
    const data = hsreplayResponse.series.data;
    const namedData = hsreplay
      .reduce((arr, x) => {
        const matchedCard = data.ALL.find(card => card.dbf_id === x.dbfId);
        if (!matchedCard) {
          return arr;
        }
        return [...arr, { x, matchedCard }];
      }, [])
      .map(({ x, matchedCard }) => {
        return {
          dbfId: x.dbfId,
          name: x.name,
          popularity: matchedCard.popularity,
          winRate: matchedCard.winrate,
          count: matchedCard.count,
          decks: matchedCard.decks,
        };
      });
    const hsreplayStats: HSReplayStatEntity[] = namedData.map(x => {
      const matchedCard = CARD_LIST.find(card => card.name === x.name);
      if (!matchedCard) {
        throw new Error(x.name);
      }
      return {
        id: <any>undefined,
        updateTime: hsreplayResponse.as_of,
        decks: x.decks,
        count: x.count.toString(),
        popularity: x.popularity.toString(),
        winRate: x.winRate.toString(),
        cardCode: matchedCard.code,
      };
    });

    const connection = await createConnection(Config.pgConfig);
    await connection.getRepository(HSReplayStatEntity).save(hsreplayStats);
    await connection.close();

    console.log('inserted');
    setTimeout(run, 1000 * 60);
  } catch (err) {
    console.error(err);
    setTimeout(run, 1000 * 60);
  }
}

run();

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
