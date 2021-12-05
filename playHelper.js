console.log("help tool v2")

// let All_Players = [];
// fetch(chrome.runtime.getURL("./ALL_PLAYERS.json"))
//     .then(response => {
//         console.log(response)
//         return response.json();
//     })
//     .then(data => {
//         All_Players = data;
//         console.log(All_Players)
//     });

let money = 0;
let moneySpendGame = 0;
let mBeginA = 0;
let mBeginB = 0;

let maxA = [0, 0, 0, 0, 0];
let maxB = [0, 0, 0, 0, 0];

let betHistory = [];

let lastState = new State(0, 0, 0, 0);

let playingGame = false;

function playGame(beginA, beginB, mony) {
    maxA = [0, 0, 0, 0, 0];
    maxB = [0, 0, 0, 0, 0];
    money = mony;
    mBeginA = beginA;
    mBeginB = beginB;
    if (mBeginA === 0) mBeginA = 1000;
    if (mBeginB === 0) mBeginB = 1000;
    playingGame = true;
    betHistory = [];
    console.log("playing game", mBeginA, mBeginB, money)
}


function addSpendMoney(mony) {
    console.log("adding " + mony + " to spendmoney")
    moneySpendGame += mony;
    money -= mony;
    // betNumber++;
}

function newScore(state) {
    return lastState === "" || (JSON.stringify(state.scoreA) !== JSON.stringify(lastState.scoreA) || JSON.stringify(state.scoreB) !== JSON.stringify(lastState.scoreB)) &&
        (state.oddA !== lastState.oddA && state.oddB !== lastState.oddB)
}


setInterval(
    function () {
        if (playingGame) {
            let state = getState()
            // console.log(state);
            if (state !== "" && newScore(state)) {
                lastState = state;
                let set = Math.max(0, getSets(state) - 1);
                let oddA = state.oddA;
                let oddB = state.oddB;
                if (oddA > maxA[set]) maxA[set] = oddA;
                if (oddB > maxB[set]) maxB[set] = oddB;

                betIfNeeded(state)
                // getChanceAmountAndLog(state, mBeginA, mBeginB, true);
            }
        }
    }, 100);

function betIfNeeded(state) {
    let set = Math.max(0, getSets(state) - 1);
    let betOnSetA = false;
    let betOnSetB = false;
    betHistory.forEach(bet => {
        if (bet.set === set) {
            console.log(bet.player)
            if (bet.player !== myGame.playerBName)
                betOnSetA = true;
            if (bet.player !== myGame.playerAName)
                betOnSetB = true;
        }
    });
    console.log(mBeginA,mBeginB)
    if (mBeginA <= 1 || mBeginB <= 1 || mBeginA>10 || mBeginB>10 ||
    state.oddA <=1 || state.oddB<=1)
        return;
    console.log("betOnSetA", betOnSetA)
    console.log("betOnSetB", betOnSetB)

    let setsA = getSetWinners(state.scoreA, state.scoreB)
    let setsB = getSetWinners(state.scoreB, state.scoreA)
    let pA = getUpcomingPoints(All_Players, mBeginA, setsA)
    let pB = getUpcomingPoints(All_Players, mBeginB, setsB)

    let chances = winChanceGame(state.scoreA, state.scoreB, pA, pB);
    console.log(rnd(chances), rnd(oneOver(chances)))
    console.log(state.scoreA, state.scoreB)
    console.log(rnd(oneOver([state.oddA, state.oddB])), rnd([state.oddA, state.oddB]))


    let betAmountA = Math.min(money * .3, Math.max(0.1, money * getPercentageToBet(state.oddA+.1)/2));
    let betAmountB = Math.min(money * .3, Math.max(0.1, money * getPercentageToBet(state.oddB+.1)/2));
    if (!betOnSetA && 1 / (state.oddA-.05) < chances[0] - .05 && mBeginA <= 2.5) fillInBet("a", betAmountA, state.oddA, [state.scoreA, state.scoreB])
    if (!betOnSetB && 1 / (state.oddB-.05) < chances[1] - .05 && mBeginB <= 2.5) fillInBet("b", betAmountB, state.oddB, [state.scoreA, state.scoreB])
}

function getPercentageToBet(odd) {
    return 1 - nthRoot(.5, getBaseLog(1 - 1 / odd, 1 / 10000));
}


function getUpcomingPoints(players, beginOdd, sets) {
    let playerSets = []
    players.forEach(player => {
        let state = player.states[player.states.length - 1];
        let setsMatch = true;
        for (let i = 0; i < sets.length; i++)
            if (sets[i] === 1 && (state.scoreA[i] + 1 < state.scoreB[i] && state.scoreB[i] >= 11))
                setsMatch = false;
            else if (sets[i] === 0 && (state.scoreB[i] + 1 < state.scoreA[i] && state.scoreA[i] >= 11))
                setsMatch = false;
        if (setsMatch)
            playerSets.push(player);
    });
    playerSets = playerSets.sort(function (a, b) {
        return a.beginOdd - b.beginOdd
    })
    let m = 0;
    let p = 0;
    for (let i = 0; i < playerSets.length; i++)
        if (playerSets[i].beginOdd < beginOdd)
            m = i;
        else break;
    for (let i = playerSets.length - 1; i >= 0; i--)
        if (playerSets[i].beginOdd > beginOdd)
            p = i;
        else break;
    let pnts = [];
    // console.log(playerSets)
    for (let i = Math.max(0, Math.floor((m + p) / 2 - (.05) * playerSets.length)); i < Math.min(playerSets.length - 1, Math.ceil((m + p) / 2 + (.05) * playerSets.length)); i++) {
        let ps = 0;
        let z = 0;
        let state = playerSets[i].states[playerSets[i].states.length - 1];
        for (let k = sets.length; k < state.scoreA.length; k++) {
            ps += state.scoreA[k]
            z++;
        }
        pnts.push(ps / z)
    }
    let avgPnts = 0;
    pnts.forEach(p => {
        avgPnts += p
    })
    avgPnts = avgPnts / pnts.length;
    return avgPnts
}


function getSetPoints(state) {
    let pointsA = 0;
    let pointsB = 0;
    // console.log(state)
    for (let i = state.scoreA.length - 1; i >= 0; i--)
        if (state.scoreA[i] !== 0) {
            pointsA = state.scoreA[i];
            break;
        }
    for (let i = state.scoreB.length - 1; i >= 0; i--)
        if (state.scoreB[i] !== 0) {
            pointsB = state.scoreB[i];
            break;
        }
    return [pointsA, pointsB];
}

function getSetWinners(scoreA, scoreB) {
    let out = [];
    for (let i = 0; i < scoreA.length; i++)
        if (scoreA[i] + 1 < scoreB[i] && scoreB[i] >= 11)
            out.push(1);
        else if (scoreB[i] + 1 < scoreA[i] && scoreA[i] >= 11)
            out.push(0);
    return out;
}

function getPlayerSets(scoreA, scoreB) {
    let aSets = 0, bSets = 0;
    for (let i = 0; i < scoreA.length; i++) {
        if (scoreA[i] > scoreB[i] + 1 && scoreA[i] >= 11)
            aSets++;
        else if (scoreB[i] > scoreA[i] + 1 && scoreB[i] >= 11)
            bSets++;
    }
    return [aSets, bSets]
}

function getSets(state) {
    let out = 0;
    for (let i = 0; i < state.scoreA.length; i++)
        if (state.scoreA[i] !== 0 || state.scoreB[i] !== 0)
            out++;
    return out;
}

function getSetsWithScore(scoreA, scoreB) {
    let out = 0;
    for (let i = 0; i < scoreA.length; i++)
        if (scoreA[i] !== 0 || scoreB[i] !== 0)
            out++;
    return out;
}

function getSetsScore(score) {
    let out = 0;
    for (let i = 0; i < score.length; i++)
        if (score[i] !== 0)
            out++;
    return out;
}


function getPoints(scoreA, scoreB) {
    let out = 0;
    for (let i = 0; i < scoreA.length; i++)
        out += scoreA[i]
    for (let i = 0; i < scoreB.length; i++)
        out += scoreB[i]
    return out;
}


function addSpace(str, k) {
    let out = "" + str;
    for (let i = out.length; i < k; i++) {
        out = " " + out;
    }
    return out;
}


function beep() {
    try {
        let snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
        snd.play();
    } catch (e) {
        console.log("something went wrong playing sound", e)
    }
}


function rnd(numb) {
    try {
        return numb.toFixed(2);
    } catch (e) {
        return numb
    }
}

function clickOnElement(ele, keystrokes) {
    let rect = ele.getBoundingClientRect();
    console.log(rect.top, rect.left, rect.bottom, rect.right);
    let relativeX = window.screenX;
    let relativeY = window.screenY + window.outerHeight - window.innerHeight;
    let absoluteX = relativeX + rect.left + (rect.right - rect.left) / 2;
    let absoluteY = relativeY + rect.top + (rect.bottom - rect.top) / 2;

    sendInput(absoluteX, absoluteY, "true", keystrokes)
}


function sendInput(mouseX, mouseY, click, keystrokes) {
    let url = "http://localhost:7777/?"
    if (mouseX !== null) url += "mouseX=" + mouseX + "&"
    if (mouseY !== null) url += "mouseY=" + mouseY + "&"
    if (click !== null) url += "click=" + click + "&"
    if (keystrokes !== null) url += "keystrokes=" + keystrokes + "&"
    url += "delay=1&"
    url += "delayFlux=2"


    let http = new XMLHttpRequest();
    console.log(url)
    http.open("GET", url, true);
    http.send(null);
}