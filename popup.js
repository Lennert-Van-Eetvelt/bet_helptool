console.log("hi popup")

let auto = false;
let autoSpend = false;

sendMessage("?")

document.getElementById("startbtn").onclick = function () {sendMessage("startbtn")}
document.getElementById("savebtn").onclick = function () {sendMessage("savebtn")}
document.getElementById("auto").onclick = function () {sendMessage("auto");sendMessage("?");}
document.getElementById("autoSpend").onclick = function () {sendMessage("autoSpend");sendMessage("?");}
document.getElementById("play").onclick = function () {sendMessage(["play",
    parseFloat(document.getElementById("beginA").value),
    parseFloat(document.getElementById("beginB").value),
    parseFloat(document.getElementById("money").value)])}
document.getElementById("spend").onclick = function () {sendMessage(["spendMoney",
    parseFloat(document.getElementById("moneySpend").value)])}

function updateUi(){
    if (auto)
        document.getElementById("auto").style.backgroundColor = "lightgreen";
    else
        document.getElementById("auto").style.backgroundColor = "";
    if (autoSpend)
        document.getElementById("autoSpend").style.backgroundColor = "lightgreen";
    else
        document.getElementById("autoSpend").style.backgroundColor = "";
}



function sendMessage(msg){
    let params = {
        active: true,
        currentWindow: true
    }
    chrome.tabs.query(params, gotTabs)

    function gotTabs(tabs) {
        console.log(tabs)

        chrome.tabs.sendMessage(tabs[0].id, msg)
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request)
        Object.keys(request).forEach(key => {
            if (key === 'auto')
                auto = request[key]
            if (key === "autoSpend")
                autoSpend = request[key];
            console.log( request[key])
        })
        updateUi()
    }
);
