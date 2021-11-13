let set = false;
let storage = true;
try {
    chrome.storage.sync.get(['key'], function(result) {
        storage = result.key;
                updateUi()
    });
}catch (e) {
    console.log(e);
}

    $(document).click(function () {
        if (event.srcElement.id === "button") {
            if (storage === true) {
                storage = false;
                save();
            }else{
                storage = true;
                save();
            }
            updateUi();
        }
    });

function save() {
    chrome.storage.sync.set({key: storage}, function() {
    });
}





function updateUi() {
    setTimeout(function () {
        if (!set) {
            set = true;
            document.getElementById("button").classList.add("set");
        }
    },10);

    if (storage === true) {
        document.getElementById("button").classList.add("active");
    }else{
        document.getElementById("button").classList.remove("active");
    }
}
