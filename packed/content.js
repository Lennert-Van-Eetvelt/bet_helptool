let active = true;


getActive();
//
// $(document).ready(function () {
//
//     updateHover();
// });

$(document).click(function () {
    // updateHover();
    try {
        getActive();
        if (active && $(event.srcElement.parentElement).attr('role') === "link" && $(event.srcElement.parentElement).attr('rlhc') === "1" && event.srcElement.parentElement.rel === "noopener") {
            event.preventDefault();
            window.open(
                event.srcElement.src, "_blank");
        }
    } catch (e) {
        console.log(e)
    }
});

// function updateHover() {
//     $(document).hover(function () {
//         console.log(event.srcElement)
//         a = this.parentElement;
//         // console.log("hover");
//         // console.log(a.getAttribute('role'));
//         // console.log(a.getAttribute('rlhc'));
//         // console.log(a.rel);
//
//         if (this.getAttribute('role') === 'link' && this.getAttribute('rlhc') === '1' && this.rel === 'noopener')
//             console.log("vallid a");
//     });
// }
function getActive() {
    try {
        chrome.storage.sync.get(['key'], function (result) {
            active = result.key;
        });
    } catch (e) {
    }
}