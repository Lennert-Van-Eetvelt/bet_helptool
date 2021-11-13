function isTimeOutBetway() {
    return document.getElementsByClassName("marketTitleWrapper")[0].childNodes[0].childNodes[0].innerHTML !== "Match Winner";
}

function getStateInfoBetway() {
    let scoreA = [];
    let scoreB = [];
    let marketListCollection = document.getElementsByClassName("marketListCollection")[0]
    let oddA = parseFloat(marketListCollection.getElementsByClassName("oddsDisplay")[0].childNodes[0].innerHTML);
    let oddB = parseFloat(marketListCollection.getElementsByClassName("oddsDisplay")[1].childNodes[0].innerHTML);
    if (isNaN(oddA) || isNaN(oddB))
        return ""
    let iframe = document.getElementsByTagName("iframe")[0].contentDocument;
    let scores = iframe.getElementsByClassName("sr-lmt-plus-pd-scr__cell sr-lmt-plus-pd-gen__cell");
    for (let i = 0; i < scores.length; i++)
        if (i % 2 === 0)
            scoreA.push(parseFloat(scores[i].innerHTML.replaceAll("-", "0")))
        else
            scoreB.push(parseFloat(scores[i].innerHTML.replaceAll("-", "0")));
    return [scoreA, scoreB, oddA, oddB];

}

function getPlayerNamesBetway() {
    let iframe = document.getElementsByTagName("iframe")[0].contentDocument;
    let nameA = iframe.getElementsByClassName("sr-lmt-plus-scb__team-name")[0].innerHTML;
    let nameB = iframe.getElementsByClassName("sr-lmt-plus-scb__team-name")[1].innerHTML;
    return [nameA,nameB];
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
    }catch (e){
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
        if(!redirected && i>sca.length-1 && sck[i].innerHTML.length>0){// (sca[k].innerHTML === "0" && scb[k].innerHTML === "0") {
            redirected =true;
            console.log(document.getElementsByClassName("scoreboardInfoNames")[i])
            setTimeout(function (){ localStorage.setItem("auto", "yes");
                window.location.href = document.getElementsByClassName("scoreboardInfoNames")[i].href;},900)
        }

    }
}