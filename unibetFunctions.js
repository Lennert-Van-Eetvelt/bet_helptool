setInterval(function () {
    try{
    let popups = document.getElementsByClassName("Modalstyle__Content-sc-13khgzf-3");
    if (popups.length > 0)
        popups[0].getElementsByClassName("LinkButtonstyle__LinkButtonLabel-dm5bqq-0")[0].click();
    popups = document.getElementsByClassName("mod-KambiBC-betslip__overlay mod-KambiBC-betslip__overlay--error");
    if (popups.length>0)
        popups[0].getElementsByClassName("mod-KambiBC-betslip-button mod-KambiBC-betslip-button--highlighted")[0].click();
}catch (e) {}}, 300);


function isTimeOutUnibet() {
    return document.getElementsByClassName("KambiBC-bet-offer-subcategory__label")[0].innerHTML !== "Noteringen wedstrijd"
}

function getStateInfoUnibet() {
    let scoreA = [];
    let scoreB = [];
    let scores = document.getElementsByClassName("KambiBC-modularized-scoreboard__participant-score-set-points")
    for (let i = 0; i < scores.length; i++)
        if (i % 2 === 0)
            scoreA.push(parseFloat(scores[i].innerHTML))
        else
            scoreB.push(parseFloat(scores[i].innerHTML));

    let bettingOptions = document.getElementsByClassName("KambiBC-bet-offer-subcategory__container");
    for (let i = 0; i < bettingOptions.length; i++) {

        if (bettingOptions[i].getElementsByClassName("KambiBC-bet-offer-subcategory__label")[0].innerHTML !== "Noteringen wedstrijd")
            break;

        let oddA = parseFloat(bettingOptions[i].getElementsByClassName("OutcomeButton__Odds-sc-lxwzc0-5")[0].innerHTML);
        let oddB = parseFloat(bettingOptions[i].getElementsByClassName("OutcomeButton__Odds-sc-lxwzc0-5")[1].innerHTML);
        return [scoreA, scoreB, oddA, oddB]
    }
    return [scoreA, scoreB, 0, 0]
}

function getPlayerNamesUnibet() {
    let nameA = document.getElementsByClassName("KambiBC-modularized-scoreboard__participant-name")[0].innerHTML;
    let nameB = document.getElementsByClassName("KambiBC-modularized-scoreboard__participant-name")[1].innerHTML;
    return [nameA, nameB]
}

function getGameListPageUnibet() {
    return "https://nl-sports.unibet.be/betting/sports/filter/table_tennis"
}

function getOddListUnibet() {
    return "<link rel=\"stylesheet\" href=\"oddStyle.css\">" + document.getElementsByClassName("d8aff")[0].outerHTML.replaceAll("<svg", "<svg style=\"display:none\"");
}

function gameIsDoneUnibet() {
    let geen = document.getElementsByClassName("KambiBC-bet-offer-categories__no-betoffers-msg")
    return (getWinner(myGame) !== "" || geen.length > 0 || !window.location.href.startsWith("https://nl-sports.unibet.be/betting/sports/event/live"));
}

function goToGameUnibet() {
    let gamz = document.getElementsByClassName("fa117");
    for (let i = 0; i < gamz.length; i++)
        if (gamz[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML.startsWith("Set 1")
            || (autoSpend &&
                (gamz[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML.startsWith("Set 2")
                ||gamz[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML.startsWith("Set 3"))
        )) {
            let rtn = autoSpend;//false

            let el = gamz[i].getElementsByClassName("d36c5")
            for (let i = 0; i < el.length; i++)
                if (el[i].innerText !== "0")
                    rtn = true;

            let nameA = gamz[i].getElementsByClassName("af24c")[0].textContent;
            let nameB = gamz[i].getElementsByClassName("af24c")[1].textContent;
            upcomingGames.forEach(game => {
                if (game.playerAName === nameA && game.playerBName === nameB && sameTime(game.time, currentDateAndTime()))
                    if (!autoSpend || game.beginOddsA <= 1.65 || game.beginOddsB <= 1.65)
                        rtn = false;
            })
            console.log(isWatchingGame(nameA, nameB), rtn, nameA, nameB)
            if (isWatchingGame(nameA, nameB) && !autoSpend)
                rtn = true;
            if (rtn)
                break;
            addWatchingGame("", "")
            gamz[i].childNodes[0].click();
            console.log('pressing buttn');
            if (!lookingForGame)
                gotMessage("startbtn", "", "")
        }
}

function notifyOnNewGameUnibet() {
    let btns = document.getElementsByClassName("_086a2");
    for (let i = 0; i < btns.length; i++)
        if (btns[i].getElementsByClassName("_2f0dd").length < 1)
            btns[i].childNodes[0].click();

    if (window.location.href.startsWith(getGameListPageUnibet())) {
        let leagues = document.getElementsByClassName("_37451 _6668f _5d444 _5fa7f");
        for (let k = 0; k < leagues.length; k++) {
            let league = leagues[k].parentElement.parentElement;
            if (league.getElementsByClassName("_086a2").length < 1)
                league.children[0].click();
        }

        let gamz = document.getElementsByClassName("f0bd5");
        for (let i = 0; i < gamz.length; i++)
            if (gamz[i].childNodes[0].class !== "bd83d" && gamz[i].childNodes[0].innerHTML === "Set 1" && !notifiedGames.includes(gamz[i].parentElement.parentElement)) {
                beep();
                return gamz[i].parentElement.parentElement;
            }
    }
}

function fillInBetUnibet(player, bet, odd, score) {
    // setTimeout(function (){fillingInBet = false;},15000)
    console.log("fill in bet ",fillingInBet, player, bet, odd, score)

    if (!window.location.href.startsWith("https://nl-sports.unibet.be/betting/sports/event/live"))
        return;
    if (fillingInBet)
        return;
    try {
        bet = parseFloat(rnd(bet))
        fillingInBet = true;
        if (document.getElementsByClassName("KambiBC-bet-offer-subcategory__label")[0].innerHTML !== "Noteringen wedstrijd")
            return;
        let delay = 0
        if (closeOpenBetsUnibet())
            delay = 500
        setTimeout(async function () {
            let pl = 0;
            if (player === "b")
                pl = 1;
            document.getElementsByClassName("OutcomeButton-sc-lxwzc0-10")[pl].click();
            setTimeout(function () {
                if (odd !== 0 && parseFloat(document.getElementsByClassName("mod-KambiBC-betslip-outcome__odds")[0].innerText) !== odd) {
                    console.log("odd is wrong")
                    fillingInBet = false;
                    return
                }
                clickOnElement(document.getElementsByClassName("mod-KambiBC-stake-input mod-KambiBC-js-stake-input")[0], bet)
                // sendInput(1840, 891, "yes", bet)
                setTimeout(function () {
                    console.log(parseFloat(document.getElementsByClassName("mod-KambiBC-stake-input mod-KambiBC-js-stake-input")[0].value), bet)
                    if (parseFloat(document.getElementsByClassName("mod-KambiBC-stake-input mod-KambiBC-js-stake-input")[0].value) === bet) {
                        console.log("hiss")
                        if (document.getElementsByClassName("mod-KambiBC-betslip__place-bet-btn")[0].innerHTML === "Inzetten") {
                            console.log("hissss")
                            document.getElementsByClassName("mod-KambiBC-betslip__place-bet-btn")[0].click();
                            // sendInput(1770, 986, "yes", null)
                        }
                    } else
                        fillingInBet = false;
                    closeOpenBetsUnibet();
                }, 400)
            }, 700);

            setTimeout(function () {
                checkIfBetIsSuccessUnibet(0, score)
            }, 1000)
        }, delay);
    } catch (e) {
        console.log("something went wrong filling in bet", e)
        fillingInBet = false;
    }
}


function closeOpenBetsUnibet() {
    let out = false;
    let openButtons = document.getElementsByClassName("mod-KambiBC-betslip-outcome__close-btn");
    if (openButtons.length > 0)
        out = true;
    console.log(openButtons)
    for (let i = 0; i < openButtons.length; i++)
        openButtons[i].click();

    return out;
}

function checkIfBetIsSuccessUnibet(time, score) {
    try {
        if (!fillingInBet)
            return;
        console.log("checking if shit is happenin?")
        let receipts = document.getElementsByClassName("mod-KambiBC-betslip__overlay mod-KambiBC-betslip__overlay--information")
        if (receipts.length < 1
            // || receipts[0].getElementsByClassName("mod-KambiBC-betslip-receipt__stake").length < 1
            // || receipts[0].getElementsByClassName("mod-KambiBC-receipt-outcome-item__odds").length < 1
            // || receipts[0].getElementsByClassName("mod-KambiBC-receipt-outcome-item__outcome-label").length < 1
        ) {
            if (time < 15)
                setTimeout(function () {
                    checkIfBetIsSuccessUnibet(time + 1, score)
                }, 1000)
            else
                fillingInBet = false;
            return;
        }
        fillingInBet = false;
        let bet = parseFloat(receipts[0].getElementsByClassName("mod-KambiBC-betslip-receipt__stake")[0].innerHTML.replaceAll("€", ""))
        let odd = parseFloat(receipts[0].getElementsByClassName("mod-KambiBC-receipt-outcome-item__odds")[0].innerHTML)
        let player = receipts[0].getElementsByClassName("mod-KambiBC-receipt-outcome-item__outcome-label")[0].innerHTML
        console.log("whut")
        successFilledInBet(player, bet, odd, score)
        receipts[0].getElementsByClassName("mod-KambiBC-betslip-receipt__close-button")[0].click();
    }catch (e){fillingInBet = false;}
}

function getUpcomingGamesUnibet() {
    let m = document.getElementsByClassName("fa117");
    let gamz = []
    for (let i = 0; i < m.length; i++) {
        try {
            let nameA = m[i].getElementsByClassName("af24c")[0].textContent;
            let nameB = m[i].getElementsByClassName("af24c")[1].textContent;
            let oddA = m[i].getElementsByClassName("_5a5c0")[0].textContent;
            let oddB = m[i].getElementsByClassName("_5a5c0")[1].textContent;
            let tme = m[i].getElementsByClassName("f0bd5")[0].childNodes[0].textContent;
            if (tme.includes(":")) {
                let hour = parseFloat(tme.split(":")[0])
                let minute = parseFloat(tme.split(":")[1])
                let today = new Date();
                today.setSeconds(0)
                if (today.getHours() * 60 + today.getMinutes() > hour * 60 + minute)
                    today.setDate(today.getDate() + 1);

                today.setHours(hour)
                today.setMinutes(minute)
                let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

                let game = new Game(nameA, nameB, oddA, oddB);
                game.time = date + ' ' + time;
                gamz.push(game)
            }
        } catch (e) {
        }
    }
    return gamz;
}


function getMoneyInBankUnibet() {
    try {
        return parseFloat(document.getElementsByClassName("account-container")[0]
            .getElementsByClassName("text total-amount")[0]
            .innerText.replaceAll("€ ", "").replaceAll(",", "."))
    } catch (e) {
        console.log("something went wrong reading bank", e)
        return 0;
    }
}