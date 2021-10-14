package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var (
	wsChan = make(chan string)
	link   = ""
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Home Page")
}
func fetchLink(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=ascii")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,access-control-allow-origin, access-control-allow-headers")
	w.Write([]byte(link))
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// upgrade this connection to a WebSocket
	// connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	reader(ws)
}

func reader(conn *websocket.Conn) {
	for {
		// read in a message
		message := <-wsChan
		// print out that message for clarity
		fmt.Println(string(message))

		if err := conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			log.Println(err)
			return
		}

	}
}
func setupRoutes() {
	http.HandleFunc("/", homePage)
	http.HandleFunc("/cast", cast)
	http.HandleFunc("/ws", wsEndpoint)
	http.HandleFunc("/link", fetchLink)
}

func main() {
	fmt.Println("Hello World")
	setupRoutes()

	log.Fatal(http.ListenAndServe(":8080", nil))

}

func cast(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var t CastRequest
	err := decoder.Decode(&t)
	if err != nil {
		panic(err)
	}
	if t.Cast == "open" {
		link = t.Link
	}
	wsChan <- t.Cast
}

type CastRequest struct {
	Link string `json:"link"`
	Cast string `json:"cast"`
}
