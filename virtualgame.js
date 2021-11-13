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
            if (game.states.length > 20 && getVirtualWinner(game) !== "" && fromStart(game)) {
                setBeginOdds(game)
                savedGames.push(game)
                // console.log(maxOdds(game))
            } else if (game.states.length <= 20)
                console.log("noo length " + game.playerAName + "-vs-" + game.playerBName + "-" + game.time)
            else if (getVirtualWinner(game) !== "")
                console.log("noo winner " + game.playerAName + "-vs-" + game.playerBName + "-" + game.time)
            else if (fromStart(game))
                console.log("noo winner " + game.playerAName + "-vs-" + game.playerBName + "-" + game.time)


        }
        setGames();
        calcPointsScored();
        stats();
        calcOddsWithOdds();
        // chanceOffOddRisingInRound()
        // console.log(JSON.stringify(savedGames))
    });
}

function stats() {
    let firstSetWins = 0;
    let k = 0
    savedGames.forEach(game => {
        if (game.beginOddsB>1.80 && game.beginOddsA <1.88) {
            k++;
            if (getFirstSetWins(game))
                firstSetWins++;
        }
    });
    printStats("firstSetWins", firstSetWins, k)

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
        if (aSets === 3 || (aSets === 2 && bSets < 2) || (aSets === 2 && bSets === 2 && scoreA[scoreA.length - 1] > scoreB[scoreB.length - 1]))
            return "a";
        if (bSets === 3 || (bSets === 2 && aSets < 2) || (bSets === 2 && aSets === 2 && scoreB[scoreB.length - 1] > scoreA[scoreA.length - 1]))
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

function setBeginOdds(game) {
    if (fromStart(game) && parseFloat(game.beginOddsA) === 0) {
        game.beginOddsA = game.states[0].oddA;
        game.beginOddsB = game.states[0].oddB;
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
    if (parseFloat(game.beginOddsA) !== 0 && parseFloat(game.beginOddsB) !== 0)
        return true;
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


function getPlayers(game) {
    let playerA = new Player(game.beginOddsA, maxOdds(game)[0], getVirtualWinner(game) === "a", getMaxOddsSets(game)[0], game.states[game.states.length - 1].scoreA);
    let playerB = new Player(game.beginOddsB, maxOdds(game)[1], getVirtualWinner(game) === "b", getMaxOddsSets(game)[1], game.states[game.states.length - 1].scoreB);
    return [playerA, playerB]
}

function getMaxOddsSets(game) {
    let out = [[], []]
    for (let k = 0; k < 5; k++) {
        let mxA = 0
        let mxB = 0
        for (let i = 0; i < game.states.length; i++) {
            let sets = getSets(game.states[i]);
            if (sets <= k + 1 && game.states[i].oddA > mxA)
                mxA = game.states[i].oddA;
            if (sets <= k + 1 && game.states[i].oddB > mxB)
                mxB = game.states[i].oddB;
        }
        out[0].push(mxA)
        out[1].push(mxB)
    }
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
    for (let s = 0; s < 5; s++) {
        let yDev = []
        // let xDev = [0, 1, 1.35, 1.7, 2.05, 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8, 3, 3.3, 3.7, 4.5, 5.2, 6, 8,10,12,12.5]
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
        oddsList.push(xDev)
        // oddsList.push([0,0])
        for (let i = 0; i < yD; i++) {
            let line = [];
            line.push(yDev[i][yDev[i].length - 1].beginOdd)
            let maxT = [0, 0, 0, 0, 0]
            for (let k = 1; k < xDev.length; k++) {
                // line.push(getWinPercentageSet(yDev[i], xDev[k], s))
                let wp = getWinPercentageSet(yDev[i], xDev[k], s);
                // wp[0] = Math.max(0,wp[0]-5);
                // wp[1] = Math.max(0,wp[1]-3);
                // line.push(wp[1]===0? 0:wp[0] /  wp[1])
                line.push(wp[0] + "/ " + wp[1])
                // line.push(rnd(wp[1]===0? 0: findBestBet(wp[0] /  wp[1], xDev[k])) + "  " +rnd(wp[0] /  wp[1]))
                let prft = wp[0] * xDev[k] - wp[1]
                if (prft < 0)
                    prft = 0
                // line.push(rnd(prft))
                if (wp[1] > 0 && prft > 0 && prft >= maxT[0]) {
                    maxT[0] = prft;
                    maxT[1] = xDev[k];
                    maxT[2] = wp[0];
                    maxT[3] = wp[1];
                    maxT[4] = findBestBet(wp[0] / wp[1], xDev[k])
                }
            }
            // line.push(maxT[1])
            oddsList.push(line);
        }
        setOddList.push(oddsList)
    }
    if (true)
        for (let i = 0; i < setOddList.length; i++)
            for (let k = 0; k < setOddList[i].length; k++)
                for (let j = 0; j < setOddList[i][k].length; j++)
                    setOddList[i][k][j] = addSpace(setOddList[i][k][j], 8)

    console.log(setOddList)
    console.log(JSON.stringify(setOddList))
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

// function specialBestAmountToBet(setOddList){
//     for (let s = 0; s< setOddList.length; s++)
//         for (let i = )
//
// }
//
// function simulateSpecialBestAmountToBet(returns, line, percentages){
//
// }
//
// function allPossibleDevisions(length, value){
//     let out = []
//     let option = []
//     while
// }

function getAverageTotalPoints(players) {
    let totalPoints = 0;
    players.forEach(player => {
        totalPoints += getTotalPoints(player.lastScore) / getSetsScore(player.lastScore)
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
    //     let totalMaxA = 0;²ç
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