const POWER_BALL_NUMBERS = 70;

// isLucky Generator
const K_BASE = 3;
const K_MULTI = 17;
const L_SPREAD = 100000;

// Lucky Play
const L_PLAY = 200;
const L_MATCH = 20;

if (L_PLAY < L_MATCH) {
  throw new Error('No plays will be lucky!');
}

let numbers = []; // From 1 to 70
for (let i = 1; i <= POWER_BALL_NUMBERS; i += 1) {
  numbers.push(i);
}

function isFeelingLuckyGenerator(x) {
  let k;

  return (x) => {
    k = Math.floor(Math.random() * K_MULTI) + K_BASE;
    return (Math.floor(Math.random() * L_SPREAD) % k) === 0;
  }
}

function pickNumbers(count = 5) {
  let picksRemaining = count;

  const isFeelingLucky = isFeelingLuckyGenerator();

  function isForcePick(x) {
    let numbersRemaining = POWER_BALL_NUMBERS - x;
    let forcePick = numbersRemaining <= (picksRemaining - 1);
    return forcePick;
  }

  function shouldPick(x) {
    if (picksRemaining > 0) {
      return isFeelingLucky(x) || isForcePick(x);
    }

    return false;
  }

  return numbers.filter((x) => {
    if (shouldPick(x)) {
      picksRemaining -= 1;
      return true;
    }

    return false;
  });
}

function isLuckyPlay(picks, megaBall) {
  return Math.ceil(Math.random() * L_PLAY) === L_MATCH;
}

function generateMegaMillionsPlay() {
  let picks = pickNumbers();
  let megaBall = Math.floor(Math.random() * 25) + 1;
  let lucky = isLuckyPlay(picks, megaBall);

  return {
    picks: picks,
    megaBall: megaBall,
    lucky: lucky
  };
}

function printPlay(play) {
  console.log(play.picks.join(' ') + ' m: ' + play.megaBall + ' Lucky: ' + play.lucky);
  return play;
}

function printPlaySpreadsheetRow(play) {
  console.log(play.picks.concat([play.megaBall, play.lucky]).join(' '));
}

function playMegaMillionsRound() {
  return printPlay(generateMegaMillionsPlay());
}

function playMegaMillions(rounds = 1, luckyOnly, luckyRounds) {
  let round = 1;
  let plays = [];

  // Play
  for (; round < rounds; round += 1) {
    let play = generateMegaMillionsPlay();

    if (!luckyOnly || play.lucky) {
      plays.push(play);

      if (luckyOnly && plays.length >= luckyRounds) {
        break;
      }
    }
  }

  let results = {
    input: {
      rounds,
      luckyOnly,
      luckyRounds
    },
    totalRounds: round,
    plays: plays
  };

  return results;
}

function printPlayResultsHeader() {
  console.log(JSON.stringify({
    ...results,
    plays: undefined
  }));
  console.log('--------- PLAYS ----------')
}

function printPlayResults(results) {
  printPlayResultsHeader(results);
  results.plays.forEach((x) => printPlay(x));
}

function printSpreadsheetPlayResults(results) {
  printPlayResultsHeader(results);
  results.plays.forEach((x) => printPlaySpreadsheetRow(x));
}

const LUCKY_ONLY = Boolean(process.argv[3] === 'true') || false;
const ROUNDS = Number(process.argv[2]) || ((LUCKY_ONLY) ? 1000 : 1);
const LUCKY_ROUNDS = Number(process.argv[4]) || 1;
const SPREADSHEET_PRINT = Boolean(process.argv[5] === 'true') || false;

let results = playMegaMillions(ROUNDS, LUCKY_ONLY, LUCKY_ROUNDS);

// Print Results
((SPREADSHEET_PRINT) ? printSpreadsheetPlayResults : printPlayResults)(results);
