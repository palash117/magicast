package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var (
	wsChan              = make(chan string)
	link                = ""
	EMPTY_WS_REQUEST, _ = json.Marshal(&WsRequest{Task: "empty"})
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
	w.Header().Set("Access-Control-Allow-Credentials", "true")
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
	fmt.Println("connected")
	ticker := time.NewTicker(10 * time.Second)
	for {
		select {
		case <-ticker.C:
			fmt.Println("closing websocket")
			conn.Close()
			return
		case message := <-wsChan:
			fmt.Println(string(message))

			if err := conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
				log.Println(err)
				return
			}
			conn.WriteMessage(websocket.TextMessage, EMPTY_WS_REQUEST)
		}

	}
}
func setupRoutes() {
	http.HandleFunc("/", homePage)
	http.HandleFunc("/cast", cast)
	http.HandleFunc("/ws", wsEndpoint)
	http.HandleFunc("/link", fetchLink)
	http.HandleFunc("/ip", getIp)
}

func main() {
	fmt.Println("Hello World")
	setupRoutes()

	log.Fatal(http.ListenAndServe(":8080", nil))

}

func getIp(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "192.168.1.10")
}

func cast(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var t CastRequest
	err := decoder.Decode(&t)

	wsReq := &WsRequest{
		Task: t.Cast,
	}
	if err != nil {
		panic(err)
	}
	if t.Cast == "open" {
		link = t.Link
		wsReq.Link = t.Link
	}

	jsonData, _ := json.Marshal(wsReq)
	wsChan <- string(jsonData)
}

type CastRequest struct {
	Link string `json:"link"`
	Cast string `json:"cast"`
}

type WsRequest struct {
	Task string `json:"task"`
	Link string `json:"link"`
}
