// websocket.test.js
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("WebSocket Server", () => {
  let io, clientSocket, serverSocket;

  beforeAll((done) => {
    // Create server
    io = new Server(5001);
    
    // Set up server-side socket handlers
    io.on("connection", (socket) => {
      serverSocket = socket;
      
      // Handle room joining
      socket.on("joinRoom", (room) => {
        socket.join(room);
      });
      
      // Handle message sending
      socket.on("sendMessage", ({ room, message }) => {
        io.to(room).emit("receiveMessage", message);
      });
    });
    
    // Connect client
    clientSocket = new Client("http://localhost:5001", {
      transports: ["websocket"],
      forceNew: true
    });
    
    clientSocket.on("connect", done);
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it("should receive messages in the correct room", (done) => {
    const room = "testRoom";
    const message = { sender: "user2", content: "Hello!" };
    
    // Set up listener first before joining room
    clientSocket.on("receiveMessage", (data) => {
      expect(data).toEqual(message);
      done();
    });
    
    // Join room and send message once joined
    clientSocket.emit("joinRoom", room);
    
    // Use small timeout to ensure room joining completes
    setTimeout(() => {
      clientSocket.emit("sendMessage", { room, message });
    }, 100);
  });
});