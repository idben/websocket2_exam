import WebSocket, { WebSocketServer } from "ws";
const wss = new WebSocketServer({port: 8080});

const clients = {};

wss.on("connection", (connection) => {
  console.log("新使用者已經連線");

  connection.on("message", (message) => {
    console.log(`收到訊息 => ${message}`);
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === "register") {
      const userId = parsedMessage.userId;
      clients[userId] = connection;
      connection.userId = userId;
      const otherClients = Object.keys(clients);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "registered", otherClients }));
        }
      });
      return;
    }

    if (parsedMessage.type === "message") {
      const targetUserId = parsedMessage.targetUserId;
      const fromID = parsedMessage.fromID
      if(!targetUserId){
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "message", message: parsedMessage.message, fromID: fromID }));
          }
        });
      }else{
        const targetClient = clients[targetUserId];
        if (targetClient && targetClient.readyState === WebSocket.OPEN) {
          targetClient.send(JSON.stringify({ type: "message", message: parsedMessage.message, fromID, private: true}));
        }
      }
    }
  });

  connection.on("close", () => {
    console.log("已經用者斷開連線");
    let dsID = connection.userId;
    if (connection.userId) {
      delete clients[connection.userId];
    }
    const otherClients = Object.keys(clients);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "disconnected", otherClients , disconnectedID: dsID}));
      }
    });
  });
});

