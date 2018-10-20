const POWER_BALL_NUMBERS = 70;

let numbers = []; // From 1 to 70
for (let i = 1; i <= POWER_BALL_NUMBERS; i += 1) {
  numbers.push(i);
}

function isFeelingLucky(x) {
  return (Math.floor(Math.random() * 10000) % 7) === 0;
}

function pickNumbers(count = 5) {
  let picksRemaining = count;

  function isForcePick(x) {
    let numbersRemaining = POWER_BALL_NUMBERS - x;
    let forcePick = numbersRemaining <= picksRemaining;
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
  return Math.ceil(Math.random() * 100) === 100;
}

function generateMegaMillionsPlay() {
  let picks = pickNumbers();
  let megaBall = Math.min(Math.floor(Math.random() * 25) + 1, 6);
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

function printPlayResults(results) {
  console.log(JSON.stringify({
    ...results,
    plays: undefined
  }));
  console.log('--------- PLAYS ----------')
  results.plays.forEach((x) => printPlay(x));
}

const LUCKY_ONLY = Boolean(process.argv[3]) || false;
const ROUNDS = Number(process.argv[2]) || (LUCKY_ONLY) ? 1000 : 1;
const LUCKY_ROUNDS = Number(process.argv[4]) || 1;

let results = playMegaMillions(ROUNDS, LUCKY_ONLY, LUCKY_ROUNDS);

// Print Results
printPlayResults(results);