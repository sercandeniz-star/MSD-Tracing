const { io } = require("socket.io-client");
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to server...");
    
    const HOUR_MS = 3600000;
    const newComponent = {
      id: Date.now().toString(),
      name: 'socket-test-comp',
      thickness: '<=1.4',
      msl: '3',
      cabinet: 'uretim-nem',
      status: 'DRY_CABINET',
      targetTime: 120,
      floorLifeTotal: 168,
      shelfLifeTotal: 8760,
      bakeCount: 0,
      history: ["Socket connection insert test"],
      isSolder: false,
      returnCount: 0,
      isReady: false
    };

    socket.emit("action", { type: "addComponent", payload: newComponent }, (res) => {
        console.log("Add Component Result:", res);
        
        socket.emit("action", { type: "executeDelete", payload: newComponent.id }, (delRes) => {
           console.log("Delete Component Result:", delRes);
           process.exit();
        });
    });
});
