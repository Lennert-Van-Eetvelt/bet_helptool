function isTimeOutBetway() {
    return document.getElementsByClassName("marketTitleWrapper")[0].childNodes[0].childNodes[0].innerHTML !== "Match Winner";
}

function getStateInfoBetway() {
    let scoreA = [];
    let scoreB = [];
    let iframe = document.getElementsByTagName("iframe")[0].contentDocument;
    let scores = iframe.getElementsByClassName("sr-lmt-plus-pd-scr__cell sr-lmt-plus-pd-gen__cell");
    for (let i = 0; i < scores.length; i++)
        if (i % 2 === 0)
            scoreA.push(parseFloat(scores[i].innerHTML.replaceAll("-", "0")))
        else
            scoreB.push(parseFloat(scores[i].innerHTML.replaceAll("-", "0")));


    let betOptions = document.getElementsByClassName("collapsablePanel");
    for (let i = 0; i < betOptions.length; i++) {
        if (betOptions[i].getElementsByClassName("title").length > 0 &&
            betOptions[i].getElementsByClassName("title")[0].innerHTML === "Match Winner") {
            let oddA = parseFloat(betOptions[i].getElementsByClassName("oddsDisplay")[0].childNodes[0].innerHTML);
            let oddB = parseFloat(betOptions[i].getElementsByClassName("oddsDisplay")[1].childNodes[0].innerHTML);
            if (!isNaN(oddA) && !isNaN(oddB))
                return [scoreA, scoreB, oddA, oddB];
        }
    }
    return [scoreA, scoreB, 0, 0];

}

function getPlayerNamesBetway() {
    let iframe = document.getElementsByTagName("iframe")[0].contentDocument;
    let nameA = iframe.getElementsByClassName("sr-lmt-plus-scb__team-name")[0].innerHTML;
    let nameB = iframe.getElementsByClassName("sr-lmt-plus-scb__team-name")[1].innerHTML;
    return [nameA, nameB];
}

function getGameListPageBetway() {
    return "https://sports.betway.be/en/sports/cat/table-tennis";
}

function getOddListBetway() {
    return "<link rel=\"stylesheet\" href=\"betwayCss.css\">" + document.getElementsByClassName("topGroupEventsListContainer")[0].outerHTML.replaceAll("<div class=\"groupSelectionBar\"", "<div style=\"display:none\"");
}

function gameIsDoneBetway() {
    let gameEnded = false;
    try {
        let iframe = document.getElementsByTagName("iframe")[0].contentDocument;
        let k = iframe.getElementsByClassName("sr-lmt-plus-pd-scr__cell sr-lmt-plus-pd-gen__cell-total srm-highlighted");

        for (let i = 0; i < k.length; i++)
            if (k[i].innerHTML === "3")
                gameEnded = true;
        k = iframe.getElementsByClassName("sr-lmt-plus-pd-scr__cell sr-lmt-plus-pd-gen__cell-total srt-text-secondary srm-highlighted");
        for (let i = 0; i < k.length; i++)
            if (k[i].innerHTML === "3")
                gameEnded = true;
    } catch (e) {
    }
    if (document.getElementsByClassName("secondaryText").length > 0)
        gameEnded = true;
    if (!window.location.href.startsWith("https://sports.betway.be/en/sports/evt/"))
        gameEnded = true;
    return gameEnded;
}

function goToGameBetway() {
    let redirected = false;
    let sca = document.getElementsByClassName("homeTeamScore scoreValue");
    let scb = document.getElementsByClassName("homeTeamScore scoreValue");
    let sck = document.getElementsByClassName("oneLineDateTime");
    for (let i = 0; i < document.getElementsByClassName("scoreboardInfoNames").length; i++) {
        if (!redirected && i > sca.length - 1 && sck[i].innerHTML.length > 0) {// (sca[k].innerHTML === "0" && scb[k].innerHTML === "0") {
            redirected = true;
            console.log(document.getElementsByClassName("scoreboardInfoNames")[i])
            setTimeout(function () {
                localStorage.setItem("auto", "yes");
                window.location.href = document.getElementsByClassName("scoreboardInfoNames")[i].href;
            }, 900)
        }

    }
}


function getUpcomingGamesBetway() {
    let m = document.getElementsByClassName("oneLineEventItem");
    let gamz = []
    for (let i = 0; i < m.length; i++) {
        try {
            let nameA = m[i].getElementsByClassName("teamNameFirstPart teamNameHomeTextFirstPart smallFont")[0].textContent;
            let nameB = m[i].getElementsByClassName("teamNameFirstPart teamNameAwayTextFirstPart smallFont")[0].textContent;
            let oddA = m[i].getElementsByClassName("oddsDisplay")[0].textContent;
            let oddB = m[i].getElementsByClassName("oddsDisplay")[1].textContent;
            let tme = m[i].getElementsByClassName("oneLineDateTime")[0].childNodes[0].textContent;
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