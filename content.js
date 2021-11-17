console.log('hi content')


let myGame = "";
let lookingForGame = false;
let fillingInBet = false;

let auto = "yes" === localStorage.getItem("auto");
localStorage.setItem("auto", "no");

function changeAuto() {
    console.log("autooo")
    console.log(upcomingGames)
    auto = !auto;
    if (!auto)
        localStorage.setItem("auto", 'no')
}

let oddSaverCounter = 0;


let gamePageWaiter = -1;
let lastWasG = false;
let notifiedGames = [];
let upcomingGames = Array.isArray(JSON.parse(localStorage.getItem("upcomingGames"+getSite()))) ? JSON.parse(localStorage.getItem("upcomingGames"+getSite())): []
let watchingGames = getWatchingGames();
let restarter = 0

function addUpcomingGames(){
    try {
        getUpcomingGames().forEach(game => {
            let exists = false;
            for (let i = 0; i < upcomingGames.length; i++) {
                if (stringTimeToUnix(upcomingGames[i].time) +60*60*24< getCurrentUnixTime()){
                    upcomingGames.splice(i,1)
                    i--;
                }
                if (upcomingGames[i].playerAName === game.playerAName &&
                    upcomingGames[i].playerBName === game.playerBName &&
                    upcomingGames[i].time === game.time) {
                    upcomingGames[i].beginOddsA = game.beginOddsA;
                    upcomingGames[i].beginOddsB = game.beginOddsB;
                    exists = true;
                }
            }
            if (!exists)
                upcomingGames.push(game)
        });
        localStorage.setItem("upcomingGames" + getSite(), JSON.stringify(upcomingGames))
    }catch(e){}
}

console.log(watchingGames)

function getWatchingGames(){
    try {
        return Array.isArray(JSON.parse(localStorage.getItem("watchingGames" + getSite()))) ? JSON.parse(localStorage.getItem("watchingGames" + getSite())) : []
    }catch (e){
        return []
    }
}

function saveWatchingGames(){
    localStorage.setItem("watchingGames"+getSite(),JSON.stringify(watchingGames))
}

function addWatchingGame(playerA, playerB){
    watchingGames = getWatchingGames();
    let changed = false;
    watchingGames.forEach(game =>{
        if (game[0] === playerA && game[1] === playerB) {
            game[2] = getCurrentUnixTime()+""
            changed = true;
        }
    })
    if (!changed)
       watchingGames.push([playerA,playerB,getCurrentUnixTime()+""])
    saveWatchingGames()
}

function isWatchingGame(playerA, playerB) {
    watchingGames = getWatchingGames();
    for (let i = 0; i < watchingGames.length; i++) {
        console.log(parseFloat(watchingGames[i][2]), getCurrentUnixTime(), parseFloat(watchingGames[i][2])- getCurrentUnixTime())
        if (getCurrentUnixTime()- parseFloat(watchingGames[i][2]) >  15 ) {
            watchingGames.splice(i, 1)
            saveWatchingGames()
            i--;
        } else if (playerA === watchingGames[i][0] && playerB === watchingGames[i][1])
            return true;
    }
    return false;
}

setInterval(function () {
    let notify = notifyOnNewGame();
    if (notify !== undefined)
        notifiedGames.push(notify);
    addUpcomingGames();

    if (auto) {
        restarter++;
        if (restarter > 60*50/3){
            localStorage.setItem("auto", "yes");
            window.location.href = getGameListPage();
        }
        if (window.location.href.startsWith(getGameListPage())) {
            if (lastWasG)
                gotMessage("savebtn", "", "")
            lastWasG = false;
            myGame = "";

            if (gamePageWaiter < 0){
                gamePageWaiter = 0;
                return;
            }

            gamePageWaiter = 10*2/3;



            goToGame();

            if (oddSaverCounter <= 0) {
                // saveAutoOddList();
                oddSaverCounter = 60 * 60 * 5/3
            }
            oddSaverCounter--;
        } else {
            if (!lookingForGame)
                gotMessage("startbtn", "", "")
            lastWasG = true;
            gamePageWaiter--;
            if (gamePageWaiter >= 0)
                return
            if (gameIsDone()) {
                gotMessage("savebtn", "", "")
                setTimeout(function () {
                    localStorage.setItem("auto", "yes");
                    window.location.href = getGameListPage();
                }, 1000 + Math.random() * 500);
            }
        }

    }
}, 3000)

setInterval(
    function () {
        if (lookingForGame) {
            if (myGame === "")
                myGame = startGame();
            else
                addWatchingGame(myGame.playerAName, myGame.playerBName)
            let state = getState();
            if (state !== "" && myGame.playerAName)
                myGame.addState(state)
        }
    }, 500);

try {
    chrome.runtime.onMessage.addListener(gotMessage);
}catch (e){

}
function gotMessage(message, sender, sendResponse) {
    console.log(message);
    if ("startbtn" === message) {
        myGame = "";
        lookingForGame = !lookingForGame;
    }
    if ("savebtn" === message)
        saveGame();
    if ("auto" === message)
        changeAuto();
    if (message.length > 0 && message[0] === "play")
        playGame(message[1], message[2], message[3]);
    if (message.length > 0 && message[0] === "spendMoney")
        // addSpendMoney(message[1])
        fillInBet("a",.1+Math.random()*.10, getStateInfo()[2]);


}


function saveAutoOddList() {
    download(getOddList(), "odds " + Math.random() + " " + getSite() + ".html");
}


function startGame() {
    try {
        let names = getPlayerNames();
        let nameA = names[0];
        let nameB = names[1];
        let beginOddsA = 0;
        let beginOddsB = 0;

        let game = new Game(nameA, nameB, beginOddsA, beginOddsB);
        for (let i = 0; i< upcomingGames.length; i++)
            if (game.playerAName === upcomingGames[i].playerAName &&
            game.playerBName === upcomingGames[i].playerBName &&
                sameTime(game.time, upcomingGames[i].time)){
                console.log("------- old game -------")
                game = new Game(upcomingGames[i].playerAName,upcomingGames[i].playerBName,upcomingGames[i].beginOddsA,upcomingGames[i].beginOddsB)
                game.time = upcomingGames[i].time;
                game.log()
                return game;
            }
        game.log()
        return game;
    } catch (e) {
    }
    return "";
}

function stringTimeToUnix(tme1){
    let date1 = tme1.split(" ")[0].split("-");
    let time1 = tme1.split(" ")[1].split(":");
    return new Date(date1[0],date1[1],date1[2],time1[0],time1[1],time1[2]).getTime()/1000
}

function getCurrentUnixTime(){
    return (new Date()).getTime() / 1000
}


function sameTime(tme1, tme2){
    let l1 = stringTimeToUnix(tme1)
    let l2 = stringTimeToUnix(tme2)

    console.log(l1, l2)
    return l1 +45*60 >l2 && l1-45*60 <l2
}


function getState() {
    try {
        // if (isTimeOut()) {console.log("time out");return ""}
        let stateInfo = getStateInfo();
        // console.log(stateInfo)
        if (stateInfo.includes(undefined) || stateInfo[0].length === 0 || stateInfo[1].length === 0)
            return ""
        return new State(stateInfo[0], stateInfo[1], stateInfo[2], stateInfo[3]);
    } catch (e) {
        console.log(e)
    }
    return "";
}

function successFilledInBet(player,bet, odd){
    console.log("success " , player,bet,odd)
}

function saveGame() {
    console.log(JSON.stringify(myGame))
    if (myGame.playerAName !== undefined || myGame.playerBName !== undefined)
        download(JSON.stringify(myGame), myGame.playerAName + "-vs-" + myGame.playerBName + "-" + myGame.time + "_" + getSite() + ".txt");
}

function download(text, filename) {
    var blob = new Blob([text], {type: "text/plain"});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
