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
    for (let i =0; i<bettingOptions.length; i++) {

        if (bettingOptions[i].getElementsByClassName("KambiBC-bet-offer-subcategory__label")[0].innerHTML !== "Noteringen wedstrijd")
            break;

        let oddA = parseFloat(bettingOptions[i].getElementsByClassName("OutcomeButton__Odds-sc-lxwzc0-5")[0].innerHTML);
        let oddB = parseFloat(bettingOptions[i].getElementsByClassName("OutcomeButton__Odds-sc-lxwzc0-5")[1].innerHTML);
        return [scoreA, scoreB, oddA, oddB]
    }
    return [scoreA,scoreB,0,0]
}

function getPlayerNamesUnibet(){
    let nameA = document.getElementsByClassName("KambiBC-modularized-scoreboard__participant-name")[0].innerHTML;
    let nameB = document.getElementsByClassName("KambiBC-modularized-scoreboard__participant-name")[1].innerHTML;
    return [nameA, nameB]
}

function getGameListPageUnibet(){
    return "https://nl-sports.unibet.be/betting/sports/filter/table_tennis/matches"
}

function getOddListUnibet(){
    return "<link rel=\"stylesheet\" href=\"oddStyle.css\">" + document.getElementsByClassName("d8aff")[0].outerHTML.replaceAll("<svg", "<svg style=\"display:none\"");
}

function gameIsDoneUnibet() {
    let geen = document.getElementsByClassName("KambiBC-bet-offer-categories__no-betoffers-msg")
    return (getWinner(myGame) !== "" || geen.length > 0 || !window.location.href.startsWith("https://nl-sports.unibet.be/betting/sports/event/live"));
}

function goToGameUnibet(){
    let gamz = document.getElementsByClassName("fa117");
    for (let i = 0; i < gamz.length; i++)
        if (gamz[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML === "Set 1") {
            let rtn = false;

            let el = gamz[i].getElementsByClassName("d36c5")
            for (let i =0; i< el.length;i++)
                if(el[i].innerText !== "0")
                    rtn = true;

            let nameA = gamz[i].getElementsByClassName("af24c")[0].textContent;
            let nameB = gamz[i].getElementsByClassName("af24c")[1].textContent;
            upcomingGames.forEach(game =>{
                if (game.playerAName === nameA && game.playerBName === nameB && sameTime(game.time, currentDateAndTime()))
                    rtn = false;})
            if (rtn)
                break;
            gamz[i].childNodes[0].click();
            console.log('pressing buttn');
            if (!lookingForGame)
                gotMessage("startbtn", "", "")
        }
}

function notifyOnNewGameUnibet(){
    let btns = document.getElementsByClassName("_086a2");
    for (let i = 0 ; i< btns.length; i++)
        if (btns[i].getElementsByClassName("_2f0dd").length < 1)
            btns[i].childNodes[0].click();

    if (window.location.href === getGameListPageUnibet()){
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

function fillInBetUnibet(player, bet){
    if(document.getElementsByClassName("KambiBC-bet-offer-subcategory__label")[0].innerHTML !== "Noteringen wedstrijd")
        return;
    let openButtons = document.getElementsByClassName("mod-KambiBC-betslip-outcome__close-btn");
    console.log(openButtons)
    for (let i = 0; i< openButtons.length; i++)
        openButtons[i].click();
    let pl = 0;
    if (player === "b")
        pl = 1;
    document.getElementsByClassName("OutcomeButton-sc-lxwzc0-10")[pl].click();
    setTimeout(function (){
        // let betS = Math.ceil(bet*100)/100 + "";
        // let ele = document.getElementsByClassName("mod-KambiBC-stake-input mod-KambiBC-js-stake-input")[0];
        // ele.value = 0;
        // for (let i = 0; i<betS.length;i++)
        //     setTimeout(function () {
        //         let ele = document.getElementsByClassName("mod-KambiBC-stake-input mod-KambiBC-js-stake-input")[0];
        //         console.log(ele)
        //         let m = ""+ele.value +betS.charAt(i);
        //         if (m.includes(".") || m.includes(","))
        //         ele.value = m;
        //         else
        //             ele.value = parseFloat(m);
        //     },85)

        sendInput(null,null,null,bet)
    },300+openButtons.length*100)

}

function getUpcomingGamesUnibet() {
    let m = document.getElementsByClassName("fa117");
    let gamz = []
    for (let i = 0; i< m.length; i++){
        try{
            let nameA = m[i].getElementsByClassName("af24c")[0].textContent;
            let nameB = m[i].getElementsByClassName("af24c")[1].textContent;
            let oddA = m[i].getElementsByClassName("_5a5c0")[0].textContent;
            let oddB = m[i].getElementsByClassName("_5a5c0")[1].textContent;
            let tme = m[i].getElementsByClassName("f0bd5")[0].childNodes[0].textContent;
            if (tme.includes(":")){
                let hour = parseFloat(tme.split(":")[0])
                let minute = parseFloat(tme.split(":")[1])
                let today = new Date();
                today.setSeconds(0)
                if (today.getHours()*60+today.getMinutes()>hour*60+minute)
                today.setDate(today.getDate()+1);

                today.setHours(hour)
                today.setMinutes(minute)
                let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

                let game = new Game(nameA,nameB, oddA,oddB);
                game.time=  date + ' ' + time;
                gamz.push(game)
            }
        }catch (e){}
    }
    return gamz;
}
