console.log("virtual game runnin")


try {
    document.getElementById("fileinput").addEventListener("change", function (ev) {
        multipleFileHandler(ev)
    }, false);

    document.getElementById("games").onchange = function () {
        console.log("chose game");
        let e = document.getElementById("games")
        playGame(e.options[e.selectedIndex].value)
    }

    document.getElementById("nextStep").onclick = function () {
        nextState()
    }
    document.getElementById("skip10").onclick = function () {
        for (let i = 0; i < 10; i++)
            nextState()
    }
    document.getElementById("oddA").onclick = function () {
        bet(parseFloat(document.getElementById("betA").value), parseFloat(document.getElementById("oddA").innerText), "a")
    }
    document.getElementById("oddB").onclick = function () {
        bet(parseFloat(document.getElementById("betB").value), parseFloat(document.getElementById("oddB").innerText), "b")
    }
    document.getElementById("simulate").onclick = function () {
        console.log("simulate")
        console.log(savedGames)
        savedGames = savedGames.sort(function () {
            return 0.5 - Math.random();
        })
        // savedGames.sort(function () {
        //     return 0.5 - Math.random();
        // })
        console.log(savedGames)
        // updateData();
        setGames();
        money = 100;
        simulate = !simulate;
    }
} catch (e) {

}


let simulate = false;
let savedGames = [];
let gamePlaying = -1;
let state = 0;
let payedOut = false;
let betsA = [];
let betsB = [];
money = 100


function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
        let fr = new FileReader();
        fr.onload = function () {
            resolve(fr.result);
        };
        fr.onerror = function () {
            reject(fr);
        };
        fr.readAsText(file);
    });
}

function multipleFileHandler(ev) {
    let files = ev.currentTarget.files;
    let readers = [];
    if (!files.length) return;
    for (let i = 0; i < files.length; i++)
        readers.push(readFileAsText(files[i]));

    Promise.all(readers).then((values) => {
        savedGames = [];
        for (let i = 0; i < values.length; i++) {
            let game = JSON.parse(values[i]);
            if (game.states)
                cleanStates(game.states)
            if (game.states.length > 20 && getVirtualWinner(game) !== "" && fromStart(game) && !savedGamesContainsGame(game)) {
                setBeginOdds(game)
                savedGames.push(game)
                // console.log(maxOdds(game))
            } else if (game.states.length <= 20)
                console.log("noo length " + game.playerAName + "-vs-" + game.playerBName + "-" + game.time)
            else if (getVirtualWinner(game) === "")
                console.log("noo winner " + game.playerAName + "-vs-" + game.playerBName + "-" + game.time)
            else if (!fromStart(game))
                console.log("not from start " + game.playerAName + "-vs-" + game.playerBName + "-" + game.time)
            else if (savedGamesContainsGame(game))
                console.log("noo contained already " + game.playerAName + "-vs-" + game.playerBName + "-" + game.time)


        }
        setGames();
        calcPointsScored();
        stats();
        calcChanceRandomStates();
        // calcOddsWithOdds();
        // arbitrageFinder();
        // chanceOffOddRisingInRound()
        // console.log(JSON.stringify(savedGames))
    });
}

setTimeout(function () {
    console.log(All_Players)
    getUpcomingPoints(All_Players, 1.35, [])
}, 1000)

function calcChanceRandomStates() {

    let predictions = [];
    for (let i = 0; i < 15000; i++) {
        let game = savedGames[Math.floor(savedGames.length * Math.random())]
        let state = game.states[Math.floor(game.states.length * Math.random())]

        let setsA = getSetWinners(state.scoreA, state.scoreB)
        let setsB = getSetWinners(state.scoreB, state.scoreA)
        let pA = getUpcomingPoints(All_Players, game.beginOddsA, setsA)
        let pB = getUpcomingPoints(All_Players, game.beginOddsB, setsB)

        let chances = winChanceGame(state.scoreA, state.scoreB, pA, pB);
        let winner = getVirtualWinner(game)

        predictions.push({
            "chance": chances[0],
            "win": winner === "a",
            "score0": state.scoreA,
            "score1": state.scoreB,
            "beginOdd": game.beginOddsA
        })
        predictions.push({
            "chance": chances[1],
            "win": winner === "b",
            "score0": state.scoreB,
            "score1": state.scoreA,
            "beginOdd": game.beginOddsB
        })
    }
    predictions = predictions.sort(function (a, b) {
        return a.beginOdd - b.beginOdd
    })
    console.log(predictions)

    let lastmo = 0
    for (let b = 1; b <= 6; b++) {
        let mo = predictions[Math.min(predictions.length - 1, Math.floor(predictions.length * b / 6))].beginOdd;
        let subP = [[mo]]
        for (let i = 0; i < 100; i += 10) {
            let pwt = [0, 0, 0, 0, i, 0]
            predictions.forEach(p => {
                if (p.chance * 100 >= i && p.chance * 100 <= i + 10 &&
                    p.beginOdd <= mo && p.beginOdd >= lastmo) {
                    if (p.win)
                        pwt[1]++;
                    pwt[2]++;
                    pwt[3] += p.chance
                }
            });
            pwt[0] = rnd(pwt[1] / pwt[2]);
            pwt[3] = rnd(pwt[3] / pwt[2]);
            pwt[5] = Math.max(0, parseFloat(pwt[3]) - parseFloat(pwt[0])) + ''
            subP.push(pwt)
        }
        console.log(subP)
        lastmo = mo;
    }

    // getUpcomingPoints(ALL_Players, 1.85, [])
    // getUpcomingPoints(ALL_Players, 1.85, [0,1,1])
    // getUpcomingPoints(ALL_Players, 1.85, [1,0,0])
    // getUpcomingPoints(ALL_Players, 1.85, [1,1,0])

}

function savedGamesContainsGame(game) {
    let out = false;
    savedGames.forEach(g => {
        if (game.beginOddsA === g.beginOddsA
            && game.beginOddsB === g.beginOddsB
            && game.time === g.time
            && game.playerAName === g.playerAName
            && game.playerBName === g.playerBName
            && getVirtualWinner(game) === getVirtualWinner(g)
        ) out = true;
    })
    return out

}

function stats() {
    let firstSetWins = 0;
    let k = 0
    let aWins = 0
    let bWins = 0
    let beginA = 0
    let beginB = 0
    savedGames.forEach(game => {
        if (game.beginOddsB > 1.80 && game.beginOddsA < 1.88) {
            k++;
            if (getFirstSetWins(game))
                firstSetWins++;
        }
        if (getVirtualWinner(game) === "a") aWins++; else bWins++;
        beginA += game.beginOddsA;
        beginB += game.beginOddsB
    });
    printStats("firstSetWins", firstSetWins, k)
    printStats("aWins", aWins, bWins)
    printStats("beginA", beginA / savedGames.length, beginB / savedGames.length)
}

function printStats(name, a, b) {
    console.log(name + ": " + a + " / " + b)
}

function getFirstSetWins(game) {
    return getVirtualWinner(game).length > 0 && getWinnerRounds(game)[0] === getVirtualWinner(game);
}


function bet(bet, odd, player) {
    // moneySpendGame += bet;
    addSpendMoney(bet)
    // betNumber++;
    let points = getPoints(savedGames[gamePlaying].states[state].scoreA, savedGames[gamePlaying].states[state].scoreB);
    let maxO = 0;
    if (player === "a") maxO = maxOdds(savedGames[gamePlaying])[0];
    if (player === "b") maxO = maxOdds(savedGames[gamePlaying])[1];

    console.log("betting " + bet + "  with odd: " + odd + " on " + player + "  " + state + "/" + (savedGames[gamePlaying].states.length - 1) + "   " + points + "  " + maxO)
    if (player === 'a')
        betsA.push([bet, odd])
    else
        betsB.push([bet, odd])
    // money -= bet;
    updateData();
}


function playVirtualGame(k) {
    gamePlaying = parseInt(k);
    playGame(savedGames[k].beginOddsA, savedGames[k].beginOddsB, money)
    playingGame = false;
    console.log("playging game " + k + " money: " + money)
    state = 0;
    payedOut = false;
    betsA = [];
    betsB = [];
    maxA = 0;
    maxB = 0;
    moneySpendGame = 0;
    updateData();
}


function updateData() {
    document.getElementById("playerA").innerHTML = savedGames[gamePlaying].playerAName;
    document.getElementById("playerB").innerHTML = savedGames[gamePlaying].playerBName;
    document.getElementById("money").innerHTML = money + "";
    document.getElementById("scoreA").innerHTML = savedGames[gamePlaying].states[state].scoreA;
    document.getElementById("scoreB").innerHTML = savedGames[gamePlaying].states[state].scoreB;
    document.getElementById("oddA").innerHTML = savedGames[gamePlaying].states[state].oddA;
    document.getElementById("oddB").innerHTML = savedGames[gamePlaying].states[state].oddB;
    document.getElementById("beginOddsA").innerHTML = savedGames[gamePlaying].beginOddsA;
    document.getElementById("beginOddsB").innerHTML = savedGames[gamePlaying].beginOddsB;
    document.getElementById("statestatus").innerHTML = state + "/" + (savedGames[gamePlaying].states.length - 1);
    let betInfo = getChanceAmountAndLog(savedGames[gamePlaying].states[state],
        savedGames[gamePlaying].beginOddsA,
        savedGames[gamePlaying].beginOddsB,
        false
    )
    document.getElementById("betInfoA").innerHTML = betInfo[4];
    document.getElementById("betInfoB").innerHTML = betInfo[5];

}


function getVirtualWinner(game) {
    try {
        let aSets = 0, bSets = 0;
        let scoreA = game.states[game.states.length - 1].scoreA;
        let scoreB = game.states[game.states.length - 1].scoreB;
        for (let i = 0; i < scoreA.length; i++) {
            if (scoreA[i] > scoreB[i] && scoreA[i] >= 11)
                aSets++;
            else if (scoreB[i] > scoreA[i] && scoreB[i] >= 11)
                bSets++;
        }
        if (aSets >= 3 || (aSets === 2 && bSets < 2) || (aSets === 2 && bSets === 2 && scoreA[scoreA.length - 1] > scoreB[scoreB.length - 1]))
            return "a";
        if (bSets >= 3 || (bSets === 2 && aSets < 2) || (bSets === 2 && aSets === 2 && scoreB[scoreB.length - 1] > scoreA[scoreA.length - 1]))
            return "b";
    } catch (e) {
        // console.log(e)
    }
    return ""
}

function cleanStates(states) {
    for (let i = 0; i < states.length; i++) {
        let obj = states[i]
        if ((Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype) || obj === undefined
            // ||(i >= 1 && JSON.stringify(states[i].scoreA) === JSON.stringify(states[i-1].scoreA) &&  JSON.stringify(states[i].scoreB) === JSON.stringify(states[i-1].scoreB))
        ) {
            states.splice(i, 1)
            i--;
        }
    }
}


function endGame() {
    gameFinished = true;
    if (!payedOut) {
        console.log("+++++ ending game +++++")
        let winner = getVirtualWinner(savedGames[gamePlaying])
        let betz = []
        if ("a" === winner)
            betz = betsA;
        if ("b" === winner)
            betz = betsB;
        let profit = 0;
        for (let i = 0; i < betz.length; i++)
            profit += betz[i][0] * betz[i][1]

        money += profit;

        if (profit > moneySpendGame)
            console.log("%cwinner is " + winner + " moneyspend: " + moneySpendGame + " profit:  " + (profit - moneySpendGame), 'background: #222; color: green')
        else if (profit < moneySpendGame)
            console.log("%cwinner is " + winner + " moneyspend: " + moneySpendGame + " profit:  " + (profit - moneySpendGame), 'background: #222; color: red')
        else
            console.log("%cwinner is " + winner + " moneyspend: " + moneySpendGame + " profit:  " + (profit - moneySpendGame), 'background: #222; color: blue')
    }
    console.log(money)
    payedOut = true;
}


function setGames() {
    console.log("setting gazmes")
    let games_ = document.getElementById("games")
    let out = "<option selected disabled value=\"-1\">Choose a game</option>";
    console.log(savedGames.length)
    for (let i = 0; i < savedGames.length; i++) {
        console.log("hiiiii")
        out += "<option onclick='function(){playVirtualGame(" + i + ")} ' value='" + i + "'>" + savedGames[i].playerAName + " vs " + savedGames[i].playerBName + "  " + savedGames[i].time + "</option>"
    }
    games_.innerHTML = out;
}

function sum(list) {
    let out = 0;
    list.forEach(m => {
        out += m
    })
    return out;
}


function setBeginOdds(game) {
    for (let i = 0; i < game.states.length; i++) {
        let state = game.states[i]
        if (sum(state.scoreA) !== 0 || sum(state.scoreB) !== 0)
            return
        if (state.oddA !== 0 && state.oddB !== 0) {
            game.beginOddsA = state.oddA;
            game.beginOddsB = state.oddB;
        }
    }
}


function maxOdds(game) {
    let maxA = 0
    for (let i = 0; i < game.states.length; i++)
        if (maxA < game.states[i].oddA)
            maxA = game.states[i].oddA;
    let maxB = 0
    for (let i = 0; i < game.states.length; i++)
        if (maxB < game.states[i].oddB)
            maxB = game.states[i].oddB;
    return [maxA, maxB];
}


let gameFinished = true;
let lastOddA, lastOddB
let betedOnGame = false;

setInterval(function () {
    if (simulate) {
        if (gameFinished) {
            if (gamePlaying === savedGames.length - 1) {
                simulate = false;
                gamePlaying = 0;
                return;
            }

            console.log("--------- next game --------")
            gameFinished = !nextGame();
            lastOddA = savedGames[gamePlaying].states[state].oddA;
            lastOddB = savedGames[gamePlaying].states[state].oddB;
            betedOnGame = false;
        } else
            nextState()
        let game = savedGames[gamePlaying];


        let oddA = savedGames[gamePlaying].states[state].oddA;
        let oddB = savedGames[gamePlaying].states[state].oddB;
        let betInfo = getChanceAmountAndLog(savedGames[gamePlaying].states[state], savedGames[gamePlaying].beginOddsA, savedGames[gamePlaying].beginOddsB, true)
        let chanceA = betInfo[0];
        let bestAmountA = betInfo[1];
        let chanceB = betInfo[2];
        let bestAmountB = betInfo[3];

        let scoreRising = getScoreRising(savedGames[gamePlaying].states[state])

        /*
                if (bestAmountA - totalBetsA() > 0)
                    // bet(bestAmountA- totalBetsA() , oddA, "a")
                    // bet(money*.15 , oddA, "a")
                    bet(Math.max(0, Math.min(money*.1, (totalBetsA() + money) * .3 - totalBetsA())), oddA, "a")
                // bet(Math.max(0, Math.min(bestAmountA, (totalBetsA()+money)*.3-totalBetsA())) , oddA, "a")


                if (bestAmountB - totalBetsB() > 0)
                    // bet(bestAmountB - totalBetsB(), oddB, "b")
                    // bet(money*.15, oddB, "b")
                    bet(Math.max(0, Math.min(money*.1, (totalBetsB() + money) * .3 - totalBetsB())), oddB, "b")
                // bet(Math.max(0, Math.min(bestAmountB, (totalBetsB()+money)*.3-totalBetsB())), oddB, "b")
        */

        // bet(Math.min(bestAmountB, (totalBetsB()+ money)*.3-totalBetsB()), oddB, "b");

        gameFinished = game.states.length - 1 === state;
    }
})

function totalBetsA() {
    let out = 0;
    for (let i = 0; i < betsA.length; i++)
        out += betsA[i][0]
    return out;
}

function totalBetsB() {
    let out = 0;
    for (let i = 0; i < betsB.length; i++)
        out += betsB[i][0]
    return out;
}


function nextState() {
    state += 1;
    if (state >= savedGames[gamePlaying].states.length - 1)
        endGame();
    if (savedGames[gamePlaying].states[state].oddA > maxA)
        maxA = savedGames[gamePlaying].states[state].oddA;
    if (savedGames[gamePlaying].states[state].oddB > maxB)
        maxB = savedGames[gamePlaying].states[state].oddB;
    updateData();
}

function fromStart(game) {
    if (parseFloat(game.beginOddsA) !== 0 && parseFloat(game.beginOddsB) !== 0) {
        game.beginOddsA = parseFloat(game.beginOddsA);
        game.beginOddsB = parseFloat(game.beginOddsB);
        return true;
    }
    let fstart = true;
    let states = game.states
    for (let k = 0; k < states[0].scoreA.length; k++)
        if (states[0].scoreA[k] !== "0" && states[0].scoreA[k] !== 0)
            fstart = false;
    for (let k = 0; k < states[0].scoreB.length; k++)
        if (states[0].scoreB[k] !== "0" && states[0].scoreB[k] !== 0)
            fstart = false;
    return fstart;
}

function gameToLine(game) {
    return addSpace(game.playerAName + "  vs  " + game.playerBName, 65) +
        addSpace("  \t" + game.beginOddsA + "   " + game.beginOddsB, 15) +
        addSpace("  \t" + getVirtualWinner(game) + "  \t" + maxOdds(game)[0] + "   " + maxOdds(game)[1], 15) +
        "  \t" + game.states[game.states.length - 1].scoreA + "   " + game.states[game.states.length - 1].scoreB;
}

function playerWithHighestOddsWins(game) {
    let winner = getVirtualWinner(game);
    return (game.beginOddsA < game.beginOddsB && winner === "a") || (game.beginOddsB < game.beginOddsA && winner === "b")
}

function getAllPlayers(games) {
    let out = [];
    games.forEach(game => {
        let plys = getPlayers(game)
        plys.forEach(player => {
            out.push(player)
        })
    })
    return out;
}

function getPlayers(game) {
    let playerA = new Player(game.beginOddsA, getVirtualWinner(game) === "a", clone(game.states));
    let playerB = new Player(game.beginOddsB, getVirtualWinner(game) === "b", clone(swapGame(game).states));
    return [playerA, playerB]
}


function getMaxOddsSets(game) {
    let out = [[], []]
    let lastI = 0
    for (let k = 0; k < 5; k++) {
        let mxA = 0
        let mxB = 0
        for (let i = lastI; i < game.states.length; i++) {
            let sets = getSets(game.states[i]);
            if (sets > k + 1)
                break;
            if (game.states[i].oddA > mxA)
                mxA = game.states[i].oddA;
            if (game.states[i].oddB > mxB)
                mxB = game.states[i].oddB;
            lastI = i;
        }
        out[0].push(mxA)
        out[1].push(mxB)
    }
    return out;
}

function getMaxOddsScore(game) {
    let out = [[], []]
    for (let i = 0; i < possibleScoreList.length; i++) {
        out[0].push(0)
        out[1].push(0)
    }
    let lastI = 0
    for (let k = 0; k < 5; k++) {
        let mxA = 0
        let mxB = 0
        if (lastI < game.states.length) {
            let scr = getPlayerSets(game.states[lastI].scoreA, game.states[lastI].scoreB)
            for (let i = lastI; i < game.states.length; i++) {
                let sets = getSets(game.states[i]);
                if (sets > k + 1)
                    break;
                if (game.states[i].oddA > mxA)
                    mxA = game.states[i].oddA;
                if (game.states[i].oddB > mxB)
                    mxB = game.states[i].oddB;
                lastI = i;
            }
            out[0][getScoreI(scr)] = mxA;
            out[1][getScoreI([scr[1], scr[0]])] = mxB;
        }
    }
    return out;
}


function arbitrageFinder() {
    return;
    let gameList = getGameListLowA();
    let groupN = 3;
    let groups = [];
    let p = 0;
    for (let i = 0; i < groupN; i++) {
        let line = []
        if (i < groups - gameList.length % groupN) for (let k = 0; k < Math.floor(gameList.length / groupN); k++) {
            line.push(gameList[p]);
            p++;
        }
        else for (let k = 0; k < Math.floor(gameList.length / groupN + 1); k++) {
            line.push(gameList[p]);
            p++;
        }
        groups.push(line);
    }
    console.log(groups)

}

function getGameListLowA() {
    let out = [];
    savedGames.forEach(game => {
        if (game.beginOddsA <= game.beginOddsB)
            out.push(clone(game))
        else
            out.push(swapGame(game))
    });
    out = out.sort(function (a, b) {
        return a.beginOddsA - b.beginOddsA;
    });
    return out;
}

function swapGame(game) {
    let out = clone(game);
    let nA = out.playerAName
    let lA = out.beginOddsA;
    out.playerAName = out.playerBName;
    out.playerBName = nA;
    out.beginOddsA = out.beginOddsB;
    out.beginOddsB = lA;

    out.states.forEach(state => {
        let sA = clone(state.scoreA);
        let nA = state.oddA;
        state.scoreA = clone(state.scoreB);
        state.scoreB = sA;
        state.oddA = state.oddB;
        state.oddB = nA;

    })
    return out;
}


function calcOddsWithOdds() {
    let yD = 6;
    console.log("calcing odds")
    let listPlayers = [];

    for (let i = 0; i < savedGames.length; i++) {
        listPlayers.push.apply(listPlayers, getPlayers(savedGames[i]))
    }

    listPlayers = listPlayers.sort(function (a, b) {
        return a.beginOdd - b.beginOdd;
    });

    console.log(listPlayers)

    let setOddList = [];
    for (let s = 0; s < possibleScoreList.length; s++) {
        let yDev = []
        // yDev.push(possibleScoreList[s])
        // let xDev = [0, 1,1.1,1.2,1.4,1.5,1.6, 1.7,1.85,1.95, 2.05, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3.2, 3.5, 3.8, 4.1, 4.5, 5, 5.5, 6, 7, 8, 10, 12, 12.5]
        let xDev = [0, 1, 1.35, 1.7, 2.05, 2.3, 2.6, 3, 3.3, 4.5, 5.2, 8]
        let p = 0;
        for (let i = 0; i < yD; i++) {
            let line = []
            if (i < yD - listPlayers.length % yD)
                for (let k = 0; k < Math.floor(listPlayers.length / yD); k++) {
                    line.push(listPlayers[p])
                    p++;
                }
            else
                for (let k = 0; k < Math.floor(listPlayers.length / yD + 1); k++) {
                    line.push(listPlayers[p])
                    p++;
                }
            yDev.push(line);
        }

        let oddsList = [];
        // oddsList.push(possibleScoreList[s])
        oddsList.push(xDev)
        // oddsList.push([0,0])
        for (let i = 0; i < yD; i++) {
            let line = [];
            line.push(yDev[i][yDev[i].length - 1].beginOdd)
            let maxT = [0, 0, 0, 0, 0]
            for (let k = 1; k < xDev.length; k++) {
                // line.push(getWinPercentageSet(yDev[i], xDev[k], s))
                // let wp = getWinPercentageSet(yDev[i], xDev[k], s);
                let wp = getWinPercentageScore(yDev[i], xDev[k], possibleScoreList[s], 30, 7);
                wp[0] = Math.max(0, wp[0] - 4);
                wp[1] = Math.max(0, wp[1] - 3);
                // line.push(wp[1]===0? 0:wp[0] /  wp[1])
                // line.push(wp[0] + "/ " + wp[1])
                // line.push(rnd(wp[1]===0? 0: findBestBet(wp[0] /  wp[1], xDev[k])) + "  " +rnd(wp[0] /  wp[1]))
                let prft = Math.max(0, wp[0] * xDev[k] - wp[1])
                line.push(parseFloat(rnd(prft)))
                if (wp[1] > 0 && prft > 0 && prft >= maxT[0]) {
                    maxT[0] = prft;
                    maxT[1] = xDev[k];
                    maxT[2] = wp[0];
                    maxT[3] = wp[1];
                    // maxT[4] = findBestBet(wp[0] / wp[1], xDev[k])
                }
            }
            // line.push(maxT[1])
            oddsList.push(line);
        }
        setOddList.push(oddsList)
    }

    // fixSetOddMin(setOddList)
    if (true)
        for (let i = 0; i < setOddList.length; i++)
            for (let k = 0; k < setOddList[i].length; k++)
                for (let j = 0; j < setOddList[i][k].length; j++)
                    setOddList[i][k][j] = addSpace(setOddList[i][k][j], 8)

    console.log(setOddList)
    console.log(JSON.stringify(setOddList))
}

function fixSetOddMin(setOddList) {
    for (let s = 0; s < setOddList.length; s++)
        for (let r = 1; r < setOddList[s].length; r++) {
            let max = 0;
            for (let i = 1; i < setOddList[s][r].length; i++)
                max = Math.max(max, setOddList[s][r][i])
            for (let i = 1; i < setOddList[s][r].length; i++)
                if (setOddList[s][r][i] < max)
                    setOddList[s][r][i] = 0.0;
                else
                    break;
        }
}

function calcPointsScored() {
    let yD = 10;
    let listPlayers = [];

    for (let i = 0; i < savedGames.length; i++) {
        listPlayers.push.apply(listPlayers, getPlayers(savedGames[i]))
    }

    listPlayers = listPlayers.sort(function (a, b) {
        return a.beginOdd - b.beginOdd;
    });

    console.log(listPlayers)
    console.log(JSON.stringify(listPlayers))

    let setOddList = [];
    let yDev = []
    // let xDev = [0, 1, 1.35, 1.7, 2.05, 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8, 3, 3.3, 3.7, 4.5, 5.2, 6, 8]
    let p = 0;
    for (let i = 0; i < yD; i++) {
        let line = []
        if (i < yD - listPlayers.length % yD)
            for (let k = 0; k < Math.floor(listPlayers.length / yD); k++) {
                line.push(listPlayers[p])
                p++;
            }
        else
            for (let k = 0; k < Math.floor(listPlayers.length / yD + 1); k++) {
                line.push(listPlayers[p])
                p++;
            }
        yDev.push(line);

    }
    // oddsList.push(xDev)
    console.log(yDev)
    for (let i = 0; i < yD; i++) {
        let line = [];
        line.push(yDev[i][yDev[i].length - 1].beginOdd)
        // for (let k = 1; k < xDev.length; k++) {
        line.push(getAverageTotalPoints(yDev[i]))
        // }
        setOddList.push(line);
    }
    // setOddList.push(oddsList)

    console.log(setOddList)
    console.log(JSON.stringify(setOddList))
}


function getAverageTotalPoints(players) {
    let totalPoints = 0;
    players.forEach(player => {
        totalPoints += getTotalPoints(player.states[player.states.length - 1].scoreA) / getSetsScore(player.states[player.states.length - 1].scoreA)
    })
    return totalPoints / players.length;
}

function getTotalPoints(score) {
    let out = 0;
    score.forEach(points => {
        out += points;
    })
    return out;
}


function bNum(num, length) {
    if (!isNaN(num))
        return addSpace((Math.round(num * 100) / 100).toString(), length);
    else
        return addSpace(num, length);
}


function getWinPercentage(players, maxOdd) {
    let rOdd = 0;
    let rOddW = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].maxOdd >= maxOdd) {
            rOdd++;
            if (players[i].wins)
                rOddW++;
        }
    }
    // console.log(rOdd + "\t" + rOddW + "\t " + maxOdd)
    if (rOdd === 0)
        return bNum(0, 4) + " (" + rOddW + "/" + rOdd + ")";
    return bNum(rOddW / rOdd, 4) + " (" + rOddW + "/" + rOdd + ")";
}

function getWinPercentageScore(players, maxOdd, score, pointsMax, pointsMin) {
    let rOdd = 0;
    let rOddW = 0;
    for (let i = 0; i < players.length; i++) {
        // if (players[i].maxOddSets[getScoreI(score)] >= maxOdd) {
        if (getMaxOdd(players[i].states, score, pointsMax, pointsMin) >= maxOdd) {
            rOdd++;
            if (players[i].wins)
                rOddW++;
        }
    }
    return [rOddW, rOdd]
}

function getMaxOdd(states, score, pointsMax, pointsMin) {
    let max = 0;
    states.forEach(state => {
        let cS = getCurrentScores(state.scoreA, state.scoreB)
        if (JSON.stringify(getPlayerSets(state.scoreA, state.scoreB)) === JSON.stringify(score) &&
            (cS[0] < pointsMax && cS[1] < pointsMax) &&
            (cS[0] >= pointsMin || cS[1] >= pointsMin))
            max = Math.max(max, state.oddA)
    })
    return max;
}

function getCurrentScores(scoreA, scoreB) {
    let a = 0;
    let b = 0
    for (let i = 0; i < scoreA.length; i++)
        if (scoreA[i] !== 0 || scoreB[i] !== 0) {
            a = scoreA[i]
            b = scoreB[i]
        }
    return [a, b]
}


function getWinPercentageSet(players, maxOdd, set) {
    let rOdd = 0;
    let rOddW = 0;
    for (let i = 0; i < players.length; i++) {
        if (players[i].maxOddSets[set] >= maxOdd) {
            rOdd++;
            if (players[i].wins)
                rOddW++;
        }
    }
    // console.log(rOdd + "\t" + rOddW + "\t " + maxOdd)
    // return rOddW + "/ " + rOdd
    return [rOddW, rOdd]
    if (rOdd === 0)
        return 0;//, 4) + " (" + rOddW + "/" + rOdd + ")";
    return rOddW / rOdd; //4) + " (" + rOddW + "/" + rOdd + ")";
}


function getWinnerRounds(game) {
    let out = []
    let aSets = 0, bSets = 0;
    let scoreA = game.states[game.states.length - 1].scoreA;
    let scoreB = game.states[game.states.length - 1].scoreB;
    for (let i = 0; i < scoreA.length; i++) {
        if (scoreA[i] > scoreB[i] && scoreA[i] >= 11) {
            aSets++;
            out.push("a");
        } else if (scoreB[i] > scoreA[i] && scoreB[i] >= 11) {
            bSets++;
            out.push("b")
        }
    }
    if ((aSets === 2 && bSets < 2) || (aSets === 2 && bSets === 2 && scoreA[scoreA.length - 1] > scoreB[scoreB.length - 1]))
        out.push("a")
    if ((bSets === 2 && aSets < 2) || (bSets === 2 && aSets === 2 && scoreB[scoreB.length - 1] > scoreA[scoreA.length - 1]))
        out.push("b")
    return out;
}


function chanceOffOddRisingInRound() {
    let scoreRounds = []
    for (let i = 0; i < savedGames.length; i++) {
        for (let k = 0; k < savedGames[i].states.length; k++) {
            let scoreRound = new ScoreRound(savedGames[i], k);
            fixScoreRound(scoreRound);
            scoreRounds.push(scoreRound);
        }
    }
    scoreRounds = scoreRounds.sort(function (a, b) {
        return a.pointsA * 10000 + a.pointsB * 100 + a.roundN - b.pointsA * 10000 - b.pointsB * 100 - b.roundN;
    })


    let scoreR = [];
    let r = [];
    let cR = -1;
    for (let i = 1; i < scoreRounds.length; i++) {
        if (cR === scoreRounds[i].pointsA * 1000 + scoreRounds[i].pointsB * 10) {
            r.push(scoreRounds[i]);
        } else {
            cR = scoreRounds[i].pointsA * 1000 + scoreRounds[i].pointsB * 10;
            if (r.length > 10)
                scoreR.push(JSON.parse(JSON.stringify(r)));
            r = [scoreRounds[i]];
        }
    }


    let scoreOdds = [];
    let line = [];
    // for (let i = 0; i< scoreR.length; i++){
    //     let line = [scoreR[i][0].pointsA+"/"+scoreR[i][0].pointsB]
    //     let totalOddA = 0;
    //     let totalOddB = 0;
    //     let totalMaxA = 0;????
    //     let totalMaxB = 0;
    //     for (let k = 0; k < scoreR[i].length; k++){
    //         totalOddA += scoreR[i][k].oddA;
    //         totalOddB += scoreR[i][k].oddB;
    //         totalMaxA += scoreR[i][k].maxComingA;
    //         totalMaxB += scoreR[i][k].maxComingB;
    //     }
    //     let len = scoreR[i].length
    //     let avgOddA = totalOddA/len;
    //     let avgOddB = totalOddB/len;
    //     let avgMaxA = totalMaxA/len;
    //     let avgMaxB = totalMaxB/len;
    //     line.push("( " + avgMaxA /  avgOddA + " ) " + " ( " + avgMaxB /   avgOddB + " )")
    //     // line.push("( " + avgOddA+ " / " + avgMaxA + " ) " + " ( " + avgOddB+ " / " + avgMaxB + " )")
    //     scoreOdds.push(JSON.parse(JSON.stringify(line)));
    // }

    for (let i = 0; i < scoreR.length; i++) {
        let line = [scoreR[i][0].pointsA * 1000 + +scoreR[i][0].pointsB]
        let totalOddA = [];
        let totalOddB = [];
        let totalMaxA = [];
        let totalMaxB = [];
        for (let k = 0; k < scoreR[i].length; k++) {
            totalOddA.push(scoreR[i][k].oddA);
            totalOddB.push(scoreR[i][k].oddB);
            totalMaxA.push(scoreR[i][k].maxComingA);
            totalMaxB.push(scoreR[i][k].maxComingB);
        }
        totalOddA = totalOddA.sort(function (a, b) {
            return a - b;
        });
        totalOddB = totalOddB.sort(function (a, b) {
            return a - b;
        });
        totalMaxA = totalMaxA.sort(function (a, b) {
            return a - b;
        });
        totalMaxB = totalMaxB.sort(function (a, b) {
            return a - b;
        });
        let len = scoreR[i].length

        let avgOddA = medianAvg(totalOddA);
        let avgOddB = medianAvg(totalOddB);
        let avgMaxA = medianAvg(totalMaxA);
        let avgMaxB = medianAvg(totalMaxB);
        line.push(avgMaxA / avgOddA);
        line.push(avgMaxB / avgOddB);
        // line.push("( " + avgMaxA /  avgOddA + " ) " + " ( " + avgMaxB /   avgOddB + " )  " + scoreR[i].length)
        // line.push("( " + avgOddA+ " / " + avgMaxA + " ) " + " ( " + avgOddB+ " / " + avgMaxB + " )")
        scoreOdds.push(JSON.parse(JSON.stringify(line)));
    }
    console.log(scoreOdds)
    // console.log(JSON.stringify(scoreOdds))
}

function medianAvg(list) {
    let out = 0;
    let k = 0;
    for (let i = Math.floor(list.length / 2 - list.length * .1); i < Math.ceil(list.length / 2 + list.length * .1); i++) {
        out += list[i];
        k++;
    }
    if (k === 0)
        return 0;
    return out / k;
}

function fixScoreRound(scoreRound) {
    if (scoreRound.pointsA > scoreRound.pointsB || (scoreRound.pointsA === scoreRound.pointsB && Math.random() > .5)) {
        let pA = scoreRound.pointsA;
        let mA = scoreRound.maxComingA;
        let oA = scoreRound.oddA;
        let bA = scoreRound.beginA;
        scoreRound.pointsA = scoreRound.pointsB;
        scoreRound.maxComingA = scoreRound.maxComingB;
        scoreRound.oddA = scoreRound.oddB;
        scoreRound.beginA = scoreRound.beginB;
        scoreRound.pointsB = pA;
        scoreRound.maxComingB = mA;
        scoreRound.oddB = oA;
        scoreRound.beginB = bA;
        if (scoreRound.winnerGame === "a")
            scoreRound.winnerGame = "b";
        else
            scoreRound.winnerGame = "a";
        if (scoreRound.winnerRound === "a")
            scoreRound.winnerRound = "b";
        else
            scoreRound.winnerRound = "a";
    }
}


function nextGame() {
    if (gamePlaying >= savedGames.length - 1)
        return false
    gamePlaying++;
    playVirtualGame(gamePlaying)
    return true;
}