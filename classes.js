console.log('hi classes')

class State {
    constructor(scoreA, scoreB, oddA, oddB) {
        this.scoreA = scoreA;
        this.scoreB = scoreB;
        this.oddA = oddA;
        this.oddB = oddB;
    }
}

function areSameStates(state1, state2) {
    try {
        return JSON.stringify(state1.scoreA) === JSON.stringify(state2.scoreA) &&
            JSON.stringify(state1.scoreB) === JSON.stringify(state2.scoreB) &&
            state1.oddA === state2.oddA &&
            state1.oddB === state2.oddB;
    } catch (e) {
        return false;
    }
}

function currentDateAndTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    return date + ' ' + time;
}


class Game {
    constructor(playerAName, playerBName, beginOddsA, beginOddsB) {
        this.playerAName = playerAName;
        this.playerBName = playerBName;
        this.beginOddsA = beginOddsA;
        this.beginOddsB = beginOddsB;
        this.states = [];


        this.time = currentDateAndTime();

    }

    log() {
        console.log("------- new Game ------")
        console.log(this.playerAName)
        console.log(this.playerBName)
        console.log(this.beginOddsA)
        console.log(this.beginOddsB)
    }


    addState(state) {
        if (!areSameStates(state, this.states[this.states.length - 1])) {
            this.states.push(state);
            console.log("------- new State ------")
            console.log(state.scoreA)
            console.log(state.scoreB)
            console.log(state.oddA)
            console.log(state.oddB)
        }
    }
}

function getWinner(game) {
    try {
        let aSets = 0, bSets = 0;
        let scoreA = game.states[game.states.length - 1].scoreA;
        let scoreB = game.states[game.states.length - 1].scoreB;
        for (let i = 0; i < scoreA.length; i++) {
            if (scoreA > scoreB + 1 && scoreA >= 11)
                aSets++;
            else if (scoreB > scoreA + 1 && scoreB >= 11)
                bSets++;
        }
        if (aSets === 3)
            return "A";
        if (bSets === 3)
            return "B";
    } catch (e) {

    }
    return ""
}


class ScoreRound {
    constructor(game, stateN) {
        let state = game.states[stateN];

        this.pointsA = getSetPoints(state)[0];
        this.pointsB = getSetPoints(state)[1];
        this.roundN = 0;
        this.oddA = state.oddA;
        this.oddB = state.oddB;
        this.maxComingA = state.oddA;
        this.maxComingB = state.oddB;

        for (let i = state.scoreB.length - 1; i >= 0; i--)
            if (state.scoreB[i] !== 0 || state.scoreA[i] !== 0)
                this.roundN++;


        for (let k = stateN; k < game.states.length; k++) {
            let roundC = 0;
            for (let i = game.states[k].scoreB.length - 1; i >= 0; i--)
                if (game.states[k].scoreB[i] !== 0 || game.states[k].scoreA[i] !== 0)
                    roundC++;
            // console.log(roundC + "\t " + " roundN : " + this.roundN )
            if (roundC > this.roundN)
                break;
            if (game.states[k].oddA > this.maxComingA)
                this.maxComingA = game.states[k].oddA;
            if (game.states[k].oddB > this.maxComingB)
                this.maxComingB = game.states[k].oddB;
        }

        this.beginA = game.beginOddsA;
        this.beginB = game.beginOddsB;

        this.winnerGame = getVirtualWinner(game)
        this.winnerRound = getWinnerRounds(game)[this.roundN - 1];
    }
}


class Player {
    constructor(beginOdd, maxOdd, wins, maxOddSets, lastScore) {
        this.beginOdd = beginOdd;
        this.maxOdd = maxOdd;
        this.wins = wins;
        this.maxOddSets = maxOddSets;
        this.lastScore = lastScore;
    }
}
