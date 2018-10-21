const POWER_BALL_NUMBERS = 70;
const POWER_BALL_COUNT = 5;

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

const numbers = []; // From 1 to 70
for (let i = 1; i <= POWER_BALL_NUMBERS; i += 1) {
  numbers.push(i);
}

const GENERATORS = {
  /**
   * Generates a copy of the numbers array, then picks 5 indexes sequentially.
   */
  SET_PICK: function () {
    
    function pickNumbers(count = POWER_BALL_COUNT) {
      let set = [].concat(numbers);
      let picks = [];

      for (let i = 0; i < count; i += 1) {
        let index = Math.floor(Math.random() * set.length);
        let number = set.splice(index, 1)[0];
        picks.push(number);
      }

      return picks.sort();  // Result must be sorted in ascending order.
    }

    return pickNumbers;
  },
  /**
   * Generator that picks by iterating over all 70 options and choosing yes or no.
   */
  FEELING_LUCKY: function () {
    function isFeelingLuckyGenerator(x) {
      let k;

      return (x) => {
        k = Math.floor(Math.random() * K_MULTI) + K_BASE;
        return (Math.floor(Math.random() * L_SPREAD) % k) === 0;
      }
    }

    function pickNumbers(count = POWER_BALL_COUNT) {
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

    return pickNumbers;
  }
};

/**
 * Function that takes in the number of numbers to pick, and outputs a sorted array of those numbers in ascending order.
 */
const PICK_NUMBERS = GENERATORS.SET_PICK();

function isLuckyPlay(picks, megaBall) {
  return Math.ceil(Math.random() * L_PLAY) === L_MATCH;
}

function generateMegaMillionsPlay() {
  let picks = PICK_NUMBERS();
  let megaBall = Math.floor(Math.random() * 25) + 1;
  let lucky = isLuckyPlay(picks, megaBall);

  return {
    picks: picks,
    megaBall: megaBall,
    lucky: lucky
  };
}

function printPlay(play) {
  console.log(play.picks.join(' ') + ' m: ' + play.megaBall + ' Lucky: ' + play.lucky + ((play.$repeats) ? (` - r: ${play.$repeats}`) : ''));
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

// MARK: Picks
function pickRepeatNumbers(plays, MINIMUM_REPEATS = 2) {
  const map = {};

  function hashPlay(play) {
    return play.picks.join('-');
  }

  return plays.filter((x) => {
    const hash = hashPlay(x);
    map[hash] = (map[hash]) ? map[hash] + 1 : 1;
    return map[hash] === MINIMUM_REPEATS; // Only select repeats on the first time.
  }).map((x) => {
    const hash = hashPlay(x);
    x.$repeats = map[hash];
    return x;
  });
}

function pickRepeatNumbersFromResults(results, MINIMUM_REPEATS) {
  return {
    ...results,
    plays: pickRepeatNumbers(results.plays, MINIMUM_REPEATS)
  };
}

// MARK: Print
function printPlayResultsHeader() {
  console.log('--------- RESULTS ----------');
  console.log(JSON.stringify({
    ...results,
    plays: results.plays.length
  }));
  console.log('--------- PLAYS ----------');
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
const LUCKY_ROUNDS = Number(process.argv[4]) || ROUNDS;
const PICK_ONLY_REPEATS = Boolean(process.argv[5] === 'true') || ((LUCKY_ONLY) ? false : (ROUNDS >= 10000));
const SPREADSHEET_PRINT = Boolean(process.argv[6] === 'true') || false;
const MINIMUM_REPEATS = Number(process.argv[7]) || 2;

let results = playMegaMillions(ROUNDS, LUCKY_ONLY, LUCKY_ROUNDS);

if (PICK_ONLY_REPEATS && MINIMUM_REPEATS > 1) {
  results.pickOnlyRepeats = true;
  results = pickRepeatNumbersFromResults(results, MINIMUM_REPEATS);
}

// Print Results
((SPREADSHEET_PRINT) ? printSpreadsheetPlayResults : printPlayResults)(results);
