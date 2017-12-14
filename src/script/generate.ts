import * as fs from 'fs';

import { CARD_LIST } from '../service/card/cards';

const collectible = require('./collectible');

function ssb() {
  const result = CARD_LIST.map(card => {
    const matchedCard = collectible.find((x: any) => x.name === card.name);
    return {
      dbfId: matchedCard.dbfId,
      cardClass: matchedCard.cardClass,
      name: card.name,
      cardCode: card.code,
    };
  });

  fs.writeFile('./aa.json', JSON.stringify(result), 'utf8', () => {
    console.log('done');
  });
}

ssb();
