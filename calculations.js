
// findBestBets();


function findBestBets(){
    let i = 0;
    let bestOdds = [];
    for (let odd = 1; odd <= 10; odd +=.1){//.1
        let line = [];
        for (let chance = .0; chance <=1; chance+=.01){//.01
            line.push(bestBet(chance,odd))
        }
        bestOdds.push(line);
    }
    console.log(bestOdds)
    console.log(JSON.stringify(bestOdds))
    console.log(bestBet(.7,3))
    console.log(findBestBet(.7,3))
    console.log("-----")
    console.log(bestBet(.63,2.8))
    console.log(findBestBet(.63,2.8))

    console.log("-----")
    console.log(bestBet(.48,2))
    console.log(findBestBet(.48,2))

    console.log("-----")
    console.log(bestBet(.48,28))
    console.log(findBestBet(.48,28))


    console.log("-----")
    console.log(bestBet(.48,100))
    console.log(findBestBet(.48,100))


    console.log("-----")
    console.log(bestBet(.5,2.5))
    console.log(findBestBet(.5,2.5))
}



function bestBet(chance, odd) {
    // for (let change = .5; change < 0.99; change +=.05) {
    let bestamount = 0;
    let maxWin = 0;
    let maxRooth = 0;
    for (let betamount = .01; betamount <= 1; betamount += .01  ) {

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
        let total = list[Math.floor(times*.05)]


        // let marginalWin = nthroot(total,200)
        // if ((marginalWin>maxRooth && !total>maxWin) ||(!marginalWin>maxRooth && total>maxWin))
        //     console.log("potilitiess ")

        if (total>maxWin) {
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
        if(negate)
            x = -x;
        var possible = Math.pow(x, 1 / n);
        n = Math.pow(possible, n);
        if(Math.abs(x - n) < 1 && (x > 0 == n > 0))
            return negate ? -possible : possible;
    } catch(e){}
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