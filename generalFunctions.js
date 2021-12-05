console.log("hi general functions")


let site = getSite();
console.log("site is "  + site)

function getSite() {
    if (window.location.href.includes("unibet"))
        return "unibet";
    if (window.location.href.includes("betway"))
        return "betway";
}

function isUnibet() {
    return site === "unibet";
}

function isBetway() {
    return site === "betway";
}

function isTimeOut() {
    if (isUnibet())
        return isTimeOutUnibet();
    if (isBetway())
        return isTimeOutBetway();
}

function getStateInfo() {
    if (isUnibet())
        return getStateInfoUnibet();
    if (isBetway())
        return getStateInfoBetway();
}

function getPlayerNames() {
    if (isUnibet())
        return getPlayerNamesUnibet();
    if (isBetway())
        return getPlayerNamesBetway();
}

function getGameListPage() {
    if (isUnibet())
        return getGameListPageUnibet();
    if (isBetway())
        return getGameListPageBetway();
}

function getOddList() {
    if (isUnibet())
        return getOddListUnibet();
    if (isBetway())
        return getOddListBetway();
}

function gameIsDone() {
    if (isUnibet())
        return gameIsDoneUnibet();
    if (isBetway())
        return gameIsDoneBetway();
}

function goToGame() {
    if (isUnibet())
        return goToGameUnibet();
    if (isBetway())
        return goToGameBetway();
}

function notifyOnNewGame(){
    if (isUnibet())
        return  notifyOnNewGameUnibet();
}
function fillInBet(player,bet, odd,score){
    if (isUnibet())
        return fillInBetUnibet(player, bet, odd,score)
}

function getUpcomingGames(){
    if (isUnibet())
        return getUpcomingGamesUnibet();
    // if (isBetway())
    //     return getUpcomingGamesBetway();
}

function getMoneyInBank(){
    if (isUnibet())
        return getMoneyInBankUnibet();
}