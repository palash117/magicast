console.log("loaded content script")

// chrome.runtime.sendMessage({task:"open",link:"https://www.youtube.com/"}, 
// ()=>{console.log("got response from background.js")})

function closeTab(){
  chrome.runtime.sendMessage({greeting: "hello",task:"close"}, function(response) {
    console.log(response.farewell);
  });
    console.log("closing tab")
}
function openTab(link){
    chrome.runtime.sendMessage({greeting: "hello",task:"open",link}, function(response) {
      console.log(response.farewell);
    });
    console.log("opening tab")
}
function play(){
    chrome.runtime.sendMessage({greeting: "hello",task:"play"}, function(response) {
      console.log(response.farewell);
    });
    console.log("opening tab")
}
class SocketManager {
    constructor() {
      this.socket = {};
    }
    init() {
      try {
        let resetCall = this.reset.bind(this);
        this.socket = new WebSocket("ws://localhost:8080/ws");
  
        this.socket.onopen = function (e) {
          console.log("[open] Connection established");
          console.log("Sending to server");
          //   this.socket.send("My name is John");
        };
  
        this.socket.onmessage = function (event) {
          console.log(`[message] Data received from server: ${event.data}`);
          debugger
          let message = JSON.parse( event.data);
          if (message.task == "open") {
            debugger;
            // fetch("http://localhost:8080/link"
            // , {
            //   method: "GET",
            //   mode: "cors",
            // }
            // )
            //   .then((response) => response.text())
            //   .then((resp) => {
            //     console.log("resp is ", resp);
                
            //     openTab(resp);
            //   }).catch(err=>{
            //     debugger
            //     console.log("error")
            //     console.error(err)
            //   })
              
            openTab(message.link)
              
            // openTab();
          } else if (message.task == "close") {
            // chrome.tabs.query({ active: true }, function (tabs) {
            //   chrome.tabs.remove(tabs[0].id);
            // });
            closeTab()
          }else if (message.task =="play"){

          }
        };
  
        this.socket.onclose = function (event) {
          if (event.wasClean) {
            console.log(
              `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
            );
          } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            console.log("[close] Connection died");
          }
          resetCall();
        };
  
        this.socket.onerror = function (error) {
          console.log(`[error] ${error.message}`);
        };
      } catch (err) {
       this.reset()
      }
    }
  
    async reset() {
      // debugger;
      this.socket.onopen = function (e) {};
  
      this.socket.onmessage = function (event) {};
  
      this.socket.onclose = function (event) {};
  
      this.socket.onerror = function (error) {};
  
      this.init();
    }
  
    start() {
      this.init();
    }
    async closeAndReset(){
      this.socket.close()
      this.reset()
    }
  }
  
  let socketManager = new SocketManager();
  socketManager.start();
  
  // setInterval(() => {
  //   socketManager.reset()
  // }, 1*60*1000);
  