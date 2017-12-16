import axios from 'axios';
import { createConnection, Repository } from 'typeorm';

import * as Config from '../config';
import { HSReplayStatEntity, JudgeEntity, UploadEntity } from '../core';
import { hsreplayMap } from './hsreplay';

const UPDATE_INTERVAL = 1000 * 60 * 5;

export type PlayerClass =
  | 'MAGE'
  | 'DRUID'
  | 'HUNTER'
  | 'PRIEST'
  | 'WARLOCK'
  | 'SHAMAN'
  | 'WARRIOR'
  | 'ROGUE'
  | 'PALADIN';

async function run() {
  try {
    const hsreplayResponse: HSReplayResponse<CardPopularity> = await axios
      .get(
        // tslint:disable-next-line:max-line-length
        'http://hsreplay.net/analytics/query/card_included_popularity_report/?GameType=RANKED_STANDARD&RankRange=ALL&TimeRange=CURRENT_EXPANSION',
      )
      .then(res => res.data);
    const data = hsreplayResponse.series.data;
    const transformedData = await getTransformedData();
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
            value: transformedData[x.cardCode].value,
            potential: transformedData[x.cardCode].potential,
            archetypes: transformedData[x.cardCode].archetypes,
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
          value: transformedData[x.cardCode].value,
          potential: transformedData[x.cardCode].potential,
          archetypes: transformedData[x.cardCode].archetypes,
        },
      ];
    }, []);

    const connection = await createConnection(Config.pgConfig);
    await connection.transaction(async tx => {
      await connection.getRepository(HSReplayStatEntity).save(hsreplayStats);
      await calculateScores(tx.getRepository(UploadEntity));
    });
    await connection.close();

    console.log('inserted');
    setTimeout(run, UPDATE_INTERVAL);
  } catch (err) {
    console.error(err);
    setTimeout(run, UPDATE_INTERVAL);
  }
}

run();

async function calculateScores(repo: Repository<UploadEntity>) {
  const uploads = <({
    judges: ({ hsreplay: HSReplayStatEntity } & JudgeEntity)[];
  } & UploadEntity)[]>await repo
    .createQueryBuilder('upload')
    .leftJoinAndSelect('upload.judges', 'judges')
    .leftJoinAndMapOne(
      'judges.hsreplay',
      HSReplayStatEntity,
      'hsreplay',
      'hsreplay.cardCode = judges.cardCode',
    )
    .getMany();
  const scores = uploads
    .map(upload => {
      return {
        id: upload.id,
        count: upload.judges.length,
        score: (
          720 / 7 -
          upload.judges.reduce(
            (sum, judge) =>
              sum +
              (judge.value - +judge.hsreplay.value) *
                (judge.value - +judge.hsreplay.value) +
              (judge.potential - +judge.hsreplay.potential) *
                (judge.potential - +judge.hsreplay.potential),
            0,
          ) /
            upload.judges.length /
            17.5
        ).toString(),
        rank: <number | null>null,
      };
    })
    .sort((a, b) => +b.score - +a.score);

  let rank = 1;
  scores.forEach(score => {
    if (score.count >= 100) {
      score.rank = rank;
      rank += 1;
    }
  });
  return repo.save(scores);
}

async function getTransformedData() {
  const archetypePopularity: HSReplayResponse<ArchetypePopularity> = await axios
    .get(
      // tslint:disable-next-line:max-line-length
      'https://hsreplay.net/analytics/query/archetype_popularity_distribution_stats/?GameType=RANKED_STANDARD&RankRange=LEGEND_THROUGH_TWENTY&Region=ALL&TimeRange=LAST_7_DAYS',
    )
    .then(res => res.data);

  const archetypes = [
    'MAGE',
    'DRUID',
    'HUNTER',
    'PRIEST',
    'WARLOCK',
    'SHAMAN',
    'WARRIOR',
    'ROGUE',
    'PALADIN',
  ].reduce((arr, playerClass: PlayerClass) => {
    const items = archetypePopularity.series.data[playerClass].filter(
      x => x.archetype_id > 0,
    );
    return [...arr, ...items];
  }, []);

  const archetypeDetails = await Promise.all(
    archetypes.map(archetype =>
      axios
        .get(
          `https://hsreplay.net/api/v1/archetypes/${archetype.archetype_id}/`,
        )
        .then((res: { data: ArchetypeDetail }) => ({
          ...res.data,
          pct_of_class: archetype.pct_of_class,
          pct_of_total: archetype.pct_of_total,
          total_games: archetype.total_games,
          win_rate: archetype.win_rate,
        })),
    ),
  );

  const cardWeight = hsreplayMap.map(item => ({
    archetypes: archetypeDetails.reduce((arr, detail) => {
      const matched = detail.standard_signature.components.find(
        component => component[0] === item.dbfId && component[1] > 0.1,
      );
      if (!matched) {
        return arr;
      }
      return [
        ...arr,
        {
          id: detail.id,
          name: detail.name,
          playerClass: detail.player_class_name,
          url: detail.url,
          winRate: detail.win_rate,
          popularity: detail.pct_of_total,
          popularityClass: detail.pct_of_class,
          totalGames: detail.total_games,
          weight: matched[1],
        },
      ];
    }, []),
    dbfId: item.dbfId,
    name: item.name,
    cardCode: item.cardCode,
  }));

  const rawResult = cardWeight.map(card => {
    const value = card.archetypes.reduce((sum, x) => sum + x.totalGames, 0);
    const potential = card.archetypes.reduce(
      (sum, x) => sum + x.weight * x.totalGames,
      0,
    );
    return {
      value: Math.log(value || 1),
      potential: Math.log(potential || 1),
      name: card.name,
      dbfId: card.dbfId,
      cardCode: card.cardCode,
      archetypes: card.archetypes,
    };
  });

  const valueFiltered = rawResult.filter(x => x.value > 0);
  const potentialFiltered = rawResult.filter(x => x.potential > 0);

  const meanValue =
    valueFiltered.reduce((sum, x) => sum + x.value, 0) / valueFiltered.length;
  const stdevValue = Math.sqrt(
    valueFiltered.reduce(
      (sum, x) => sum + (meanValue - x.value) * (meanValue - x.value),
      0,
    ) /
      (valueFiltered.length - 1),
  );
  const meanPotential =
    potentialFiltered.reduce((sum, x) => sum + x.potential, 0) /
    potentialFiltered.length;
  const stdevPotential = Math.sqrt(
    potentialFiltered.reduce(
      (sum, x) =>
        sum + (meanPotential - x.potential) * (meanPotential - x.potential),
      0,
    ) /
      (potentialFiltered.length - 1),
  );

  return rawResult.reduce(
    (obj, card) => {
      const value =
        card.value > 0 ? (card.value - meanValue) / stdevValue * 15 + 55 : 20;
      const potential =
        card.potential > 0
          ? (card.potential - meanPotential) / stdevPotential * 15 + 55
          : 20;
      return {
        ...obj,
        [card.cardCode]: {
          value: value.toString(),
          potential: potential.toString(),
          archetypes: card.archetypes,
        },
      };
    },
    {} as {
      [cardCode: string]: { value: string; potential: string; archetypes: any };
    },
  );
}

interface CardPopularity {
  dbf_id: number;
  popularity: number;
  winrate: number;
  count: number;
  decks: number;
}

interface ArchetypePopularity {
  archetype_id: number;
  pct_of_class: number;
  pct_of_total: number;
  total_games: number;
  win_rate: number;
}

interface HSReplayResponse<T> {
  as_of: string;
  render_as: string;
  series: {
    data: { [key in PlayerClass | 'ALL']: T[] };
  };
}

interface ArchetypeDetail {
  id: number;
  name: string;
  player_class: number;
  player_class_name: PlayerClass;
  url: string;
  standard_signature: {
    as_of: string;
    format: number;
    components: [number, number][];
  };
  wild_signature: {};
  sankey_visualization: {
    links: { source: string; target: string; value: number }[];
    nodes: { name: string }[];
  };
}
