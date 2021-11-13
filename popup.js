console.log("hi popup")


document.getElementById("startbtn").onclick = function () {sendMessage("startbtn")}
document.getElementById("savebtn").onclick = function () {sendMessage("savebtn")}
document.getElementById("auto").onclick = function () {sendMessage("auto")}
document.getElementById("play").onclick = function () {sendMessage(["play",
    parseFloat(document.getElementById("beginA").value),
    parseFloat(document.getElementById("beginB").value),
    parseFloat(document.getElementById("money").value)])}
document.getElementById("spend").onclick = function () {sendMessage(["spendMoney",
    parseFloat(document.getElementById("moneySpend").value)])}




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
