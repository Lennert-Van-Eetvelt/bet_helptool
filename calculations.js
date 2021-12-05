// findBestBets();

setTimeout(function () {
    // console.log(winChance([14, 13], 9, 8))
    // console.log(winChance([9, 6], 9, 8))
    // console.log(winChanceSetCalc([14, 13], 9, 8))
    // console.log(winChanceSetCalc([9, 6], 9, 8))
    // console.log(winChanceGame([11, 8, 11, 5, 0], [9, 11, 3, 11, 0], 8, 9))
    // let wC = winChanceGame([11], [0], 9, 9);
    // console.log(oneOver(winChanceGame([12,11,8,8], [10,9,11,5], 9.904878048780489, 8.2)));
    console.log((winChanceGame([8,11,11,12], [11,8,8,13], 8.871485943775099,9.445528455284554)));
    // console.log(wC)
    // console.log(1/wC[0], 1/wC[1])
}, 100);

function oneOver(val){
    let out = [];
    val.forEach(v =>{out.push(1/v)})
    return out;
}


function winChanceGame(scoreA, scoreB, pointsA, pointsB) {
    let pA = 0;
    let pB = 0;
    for (let i = 0; i < scoreA.length; i++)
        if (scoreA[i] >= 11 && scoreA[i] > scoreB[i] + 1)
            pA++;
        else if (scoreB[i] >= 11 && scoreB[i] > scoreA[i] + 1)
            pB++;
    let cPA = 0;
    let cPB = 0;
    for (let i = 0; i < scoreA.length; i++)
        if ((scoreA[i] !== 0 || scoreB[i] !== 0) && !(scoreA[i] >= 11 && scoreA[i] > scoreB[i] + 1) && !(scoreB[i] >= 11 && scoreB[i] > scoreA[i] + 1)) {
            cPA = scoreA[i];
            cPB = scoreB[i];
        }
    let opts = optionsGame([pA, pB])
    // console.log(opts)

    let cA = 0;
    let cB = 0;
    opts.forEach(opt => {
        let oC = winChanceSetCalc([cPA, cPB], pointsA, pointsB)[opt[2]];
        for (let i = 3; i < opt.length; i++) oC = oC * winChanceSetCalc([0, 0], pointsA, pointsB)[opt[i]];
        if (opt[0] === 3) cA += oC;
        else cB += oC;
    })

    return [cA, cB]
}


function optionsGame(scoreGame) {
    if (scoreGame[0] === 3 || scoreGame[1] === 3)
        return [scoreGame];
    if (scoreGame[0]>3 || scoreGame[1]>3)
        return [];

    try {
    let optA = clone(scoreGame);
    optA[0]++;
    optA.push(0)
    let optB = clone(scoreGame);
    optB[1]++;
    optB.push(1);

    let outA = optionsGame(optA)
    let outB = optionsGame(optB)

        if (outA.length === 0 && outB.length === 0)
            return []
        if (outA.length === 0)
            return outB
        if (outB.length === 0)
            return outA
        let outwhut = []
        outwhut.push(...outA);
        outwhut.push(...outB);
        return outwhut
    } catch (e) {
        console.log(e, scoreGame)
    }
    return []
}


function winChanceSetCalc(score, pointsA, pointsB) {
    if (score[0] >= 11 && score[0] > score[1] + 1)
        return [1, 0]
    if (score[1] >= 11 && score[1] > score[0] + 1)
        return [0, 1]
    while (score[0] > 9 && score[1] > 9) {
        score[0]--;
        score[1]--;
    }
    let cA = 0;
    let cB = 0;
    let pCA = pointsA / (pointsA + pointsB);
    let pCB = pointsB / (pointsA + pointsB);
    for (let i = 0; i <= 9 - score[1]; i++) {
        let pA = 11 - score[0];
        let pB = i
        let pC = posCombi(pA, pB)
        cA += Math.pow(pCA, pA) * Math.pow(pCB, pB) * pC;
    }
    for (let i = 0; i <= 9 - score[0]; i++) {
        let pB = 11 - score[1];
        let pA = i;
        let pC = posCombi(pB, pA)
        cB += Math.pow(pCA, pA) * Math.pow(pCB, pB) * pC;
    }

    let rest = 1 - (cA + cB);//  Math.pow(pCA, 10-score[0]) * Math.pow(pCB, 10-score[1]) * posCombi(10-score[0], 10-score[1]+1);

    let rA = 0
    let rB = 0;
    for (let i = 0; i <= 0; i++) {
        let pA = 2;
        let pB = i
        let pC = posCombi(pA, pB)
        rA += Math.pow(pCA, pA) * Math.pow(pCB, pB) * pC;
    }
    for (let i = 0; i <= 0; i++) {
        let pB = 2;
        let pA = i;
        let pC = posCombi(pB, pA)
        rB += Math.pow(pCA, pA) * Math.pow(pCB, pB) * pC;
    }
    cA += rest * rA / (rA + rB);
    cB += rest * rB / (rA + rB);
    return [cA, cB]

}


function posCombi(pW, pL) {
    let mx = []
    let my = [];
    for (let i = 0; i <= pL; i++)
        my.push(1)
    mx.push(my)
    for (let i = 1; i < pW; i++)
        mx.push([1])
    for (let i = 1; i < mx.length; i++)
        for (let k = 1; k <= pL; k++)
            mx[i].push(mx[i][k - 1] + mx[i - 1][k])

    // console.log(mx)
    return mx[pW - 1][pL]
}

function winChance(score, pointsA, pointsB) {
    console.log("start")
    let opts = options(score)
    opts = opts.sort(function (a, b) {
        return a[0] * 100 - b[0] * 100 + a[1] - b[1]
    })
    // console.log(opts)
    let cA = 0;
    let cB = 0;
    let winA = 0
    let winB = 0;
    opts.forEach(opt => {
        let a = 1
        let b = 1
        if (opt[0] > opt[1])
            winA++;
        else
            winB++;

        for (let i = 2; i < opt.length; i++)
            if (opt[0] > opt[1]) {
                if (opt[i] === 0)
                    a = a * (pointsA / (pointsA + pointsB))
                else
                    a = a * (pointsB / (pointsA + pointsB))
                b = 0
            } else {
                if (opt[i] === 0)
                    b = b * (pointsA / (pointsA + pointsB))
                else
                    b = b * (pointsB / (pointsA + pointsB))
                a = 0
            }
        // console.log(a,b)
        cA += a;
        cB += b;
    });
    // console.log(winA, winB)
    // console.log(cA, cB, cA + cB, cA / cB)
    return [cA, cB]
}

function options(scoreSet) {
    if (scoreSet[0] >= 11 && scoreSet[0] > scoreSet[1] + 1 ||
        scoreSet[1] >= 11 && scoreSet[1] > scoreSet[0] + 1)
        return [scoreSet];
    if (scoreSet[0] > 22 || scoreSet[1] > 22)
        return []

    let optA = clone(scoreSet);
    optA[0]++;
    optA.push(0)
    let optB = clone(scoreSet);
    optB[1]++;
    optB.push(1);

    let outA = options(optA)
    let outB = options(optB)
    // return  out;

    // console.log(scoreSet)
    // console.log(optA)
    // console.log(optB)
    // console.log("outA", outA)
    // console.log("outB", outB)
    try {
        if (outA.length === 0 && outB.length === 0)
            return []
        if (outA.length === 0)
            return outB
        if (outB.length === 0)
            return outA
        let outwhut = []
        outwhut.push(...outA);
        outwhut.push(...outB);
        return outwhut
    } catch (e) {
        console.log(e)
    }
    return []
}


function findBestBets() {
    let i = 0;
    let bestOdds = [];
    for (let odd = 1; odd <= 10; odd += .1) {//.1
        let line = [];
        for (let chance = .0; chance <= 1; chance += .01) {//.01
            line.push(bestBet(chance, odd))
        }
        bestOdds.push(line);
    }
    console.log(bestOdds)
    console.log(JSON.stringify(bestOdds))
    console.log(bestBet(.7, 3))
    console.log(findBestBet(.7, 3))
    console.log("-----")
    console.log(bestBet(.63, 2.8))
    console.log(findBestBet(.63, 2.8))

    console.log("-----")
    console.log(bestBet(.48, 2))
    console.log(findBestBet(.48, 2))

    console.log("-----")
    console.log(bestBet(.48, 28))
    console.log(findBestBet(.48, 28))


    console.log("-----")
    console.log(bestBet(.48, 100))
    console.log(findBestBet(.48, 100))


    console.log("-----")
    console.log(bestBet(.5, 2.5))
    console.log(findBestBet(.5, 2.5))
}


function bestBet(chance, odd) {
    // for (let change = .5; change < 0.99; change +=.05) {
    let bestamount = 0;
    let maxWin = 0;
    let maxRooth = 0;
    for (let betamount = .01; betamount <= 1; betamount += .01) {

        // let change = .7;
        // let betamount = .1;
        let money = 1;
        // let odd = 2;

        let times = 2000;
        let list = [];
        for (let i = 0; i < times; i++)
            list.push(simStreak(chance, betamount, money, odd, 50));

        list.sort((a, b) => a - b);
        // console.log(list)
        // console.log(list[Math.floor(times*.05)])
        let total = list[Math.floor(times * .05)]


        // let marginalWin = nthroot(total,200)
        // if ((marginalWin>maxRooth && !total>maxWin) ||(!marginalWin>maxRooth && total>maxWin))
        //     console.log("potilitiess ")

        if (total > maxWin) {
            maxWin = total;
            // maxRooth = marginalWin;
            bestamount = betamount;
        }

    }
    // console.log(rnd(odd) + '  \t' + rnd(change) + "   \t" + rnd(bestamount) + "   \t"+rnd(maxRooth))
    return bestamount;
}

function nthroot(x, n) {
    try {
        var negate = n % 2 == 1 && x < 0;
        if (negate)
            x = -x;
        var possible = Math.pow(x, 1 / n);
        n = Math.pow(possible, n);
        if (Math.abs(x - n) < 1 && (x > 0 == n > 0))
            return negate ? -possible : possible;
    } catch (e) {
    }
}

function simStreak(chance, betamount, money, odd, times) {

    for (let i = 0; i < times; i++) {
        let pay = 0;
        if (Math.random() < chance)
            pay = 1;
        money += -betamount * money + betamount * money * odd * pay;
    }
    return money;
}