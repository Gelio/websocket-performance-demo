package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var messagesPerMinute float64 = 8 * 10000

func main() {
	fs := http.FileServer(http.Dir("../../frontend"))
	http.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		switch r.Header.Get("Upgrade") {
		case "websocket":
			conn, err := websocket.Upgrade(rw, r, nil, 1024, 1024)
			if err != nil {
				log.Println("Error when upgrading", err)
				return
			}
			handleNewConnection(conn)

		default:
			fs.ServeHTTP(rw, r)
		}
	})

	const PORT = 3000

	log.Printf("Listening on 0.0.0.0:%d\n", PORT)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil); err != nil {
		log.Println("Error", err)
	}
}

func handleNewConnection(conn *websocket.Conn) {
	defer func() {
		conn.Close()
		log.Println("Client disconnected")
	}()
	log.Println("Client connected")

	var readyMsg readyMessage

	// NOTE: pings and pongs to detect when connection closes is not implemented
	// to keep the complexity of the demo lower

	for {
		_, rawMessage, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error while reading message", err)
			return
		}

		if len(rawMessage) == 0 {
			continue
		}

		err = json.Unmarshal(rawMessage, &readyMsg)
		if err == nil && readyMsg.Type == "ready" {
			break
		}

		log.Println("Unexpected message", rawMessage)
	}

	durationBetweenMessages := time.Duration(60000/messagesPerMinute*1000*1000) * time.Nanosecond
	ticker := time.NewTicker(durationBetweenMessages)
	defer ticker.Stop()

	for range ticker.C {
		updateMessage := getRandomTableUpdate(readyMsg.TableSize)
		rawMessage, err := json.Marshal(updateMessage)
		if err != nil {
			log.Println("Error marshalling table update message", err)
			return
		}

		if err = conn.WriteMessage(websocket.TextMessage, rawMessage); err != nil {
			log.Println("Error writing message", err)
			return
		}
	}
}

type readyMessage struct {
	Type      string    `json:"type"`
	TableSize tableSize `json:"tableSize"`
}

type tableSize struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

type tableUpdateMessage struct {
	Type       string          `json:"type"`
	UpdateData tableUpdateData `json:"updateData"`
}

type tableUpdateData struct {
	Row    int `json:"row"`
	Column int `json:"column"`
	Value  int `json:"value"`
}

func getRandomTableUpdate(size tableSize) tableUpdateMessage {
	return tableUpdateMessage{
		Type: "table update",
		UpdateData: tableUpdateData{
			Row:    rand.Intn(size.Height),
			Column: rand.Intn(size.Width),
			Value:  1 + rand.Intn(100),
		},
	}
}
