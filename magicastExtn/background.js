// background.js
// let color = "#3aa757";

chrome.runtime.onInstalled.addListener(() => {
  // chrome.storage.sync.set({ color });/
  // openTab()
  // console.log("Default background color set to %cgreen", `color: ${color}`);
});

 function openTab(link) {
  if (!link) {
    link =
      "https://www.youtube.com/watch?v=59Q_lhgGANc&list=RD59Q_lhgGANc&start_radio=1";
  }
  let tab = chrome.tabs.create({
    url: link,
  });
  return tab;
}
 function closeTab() {
  chrome.tabs.query({ active: true }, function (tabs) {
    chrome.tabs.remove(tabs[0].id);
  });
}
// chrome.runtime.onMessage.addListener(
//   (request, sender, resp) => {
//     alert("hello")
//     console.log("request is ", request)
//     let { task, link } = request;
//     switch (task) {
//       case "open":
//         openTab(link);
//         break;
//       case "close":
//         closeTab();
//         break;
//     }
//     setTimeout(()=>{
//       resp("completed")
//     },10000)
//     return true

  
// });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    try{
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    switch (request.task) {
      case "open":
        openTab(request.link);
        pressKeyDown()
        break;
      case "close":
        closeTab();
        break;
      case "play":
        pressKeyDown()
        break;
    }         
    if (request.greeting === "hello")
      sendResponse({farewell: "goodbye"});
  }catch(err){
    sendResponse({farewell:"error"+err})
  }
  }
);

// chrome.runtime.onStartup.addListener(()=>{
//   console.log("started")
//   openTab()
// })

// chrome.runtime.reload.addListener(()=>{
//   console.log("started")
//   openTab()
// })

/*

*/


function pressKeyDown(){
  var keyboardEvent = document.createEvent('KeyboardEvent');
var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? 'initKeyboardEvent' : 'initKeyEvent';

keyboardEvent[initMethod](
  'keydown', // event type: keydown, keyup, keypress
  true, // bubbles
  true, // cancelable
  window, // view: should be window
  false, // ctrlKey
  false, // altKey
  false, // shiftKey
  false, // metaKey
  32, // keyCode: unsigned long - the virtual key code, else 0
  0, // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
);
document.dispatchEvent(keyboardEvent);
}