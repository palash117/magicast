// background.js
let color = "#3aa757";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log("Default background color set to %cgreen", `color: ${color}`);
});

async function openTab(link) {
  if (!link) {
    link =
      "https://www.youtube.com/watch?v=59Q_lhgGANc&list=RD59Q_lhgGANc&start_radio=1";
  }
  let tab = chrome.tabs.create({
    url: link,
  });
  return tab;
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
        let message = event.data;
        if (message == "open") {
          // debugger;
          fetch("http://localhost:8080/link", {
            method: "GET",
            mode: "cors",
          })
            .then((response) => response.text())
            .then((resp) => {
              console.log("resp is ", resp);

              openTab(resp);
            });
          // openTab();
        } else if (message == "close") {
          chrome.tabs.query({ active: true }, function (tabs) {
            chrome.tabs.remove(tabs[0].id);
          });
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
      setTimeout(() => {
        this.reset();
      }, 1000);
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
}

let socketManager = new SocketManager();
socketManager.start();
