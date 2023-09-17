const ws = new WebSocket("ws://localhost:8080");
const leftArea = document.querySelector(".left");
const rightArea = document.querySelector(".right");
const btnSend = document.querySelector(".btn-send");
const msgInput = document.querySelector("[name=msg]");
const userId = new Date().getTime().toString();
let targetUserId, clientList;

ws.addEventListener("open", () => {
  console.log("Connected to the WebSocket");
  leftArea.innerHTML += `<div>已進入聊天室，你的ID是：${userId}</div>`;
  let prarms = {
    type: "register",
    userId: userId
  }
  ws.send(JSON.stringify(prarms));
});

btnSend.addEventListener("click", ()=>{
  sendMessage()
});

msgInput.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){
    sendMessage()
  }
});

ws.addEventListener("message", async (event) => {
  let resutlt = JSON.parse(event.data);
  if(resutlt.type === "registered"){
    clientList = resutlt.otherClients;
    setClientList();
    return;
  }
  if(resutlt.type === "message"){
    let fromID = resutlt.fromID;
    let toFix = `<span class="px-2">說</span>`;
    if(fromID === userId){
      fromID = "我自己";
    }
    if(resutlt.private === true){
      toFix = `<span class="px-2">對你悄悄說</span>`;
    }
    let icon = `<span class="badge bg-primary d-flex align-itmes-center">${fromID}</span>`
    let msg = `<span">${resutlt.message}</span>`;
    leftArea.innerHTML += `<div class="d-flex align-itmes-center mb-1">${icon}${toFix}${msg}</div>`;
    scrollToBottom();
    return;
  }
  if(resutlt.type === "disconnected"){
    clientList = resutlt.otherClients;
    setClientList();
    if(resutlt.disconnectedID){
      leftArea.innerHTML += `<div>${userId} 已離開聊天室</div>`;
    };
    return;
  }
});


function sendMessage() {
  var message = msgInput.value;
  let prarms = {
    type: "message",
    message,
    fromID: userId
  }
  if(targetUserId){
    prarms.targetUserId = targetUserId;
  }
  ws.send(JSON.stringify(prarms));
  msgInput.value = "";
  if(targetUserId){
    let icon1 = `<span class="badge bg-primary d-flex align-itmes-center pt-1 me-1">我自己</span>`
    let icon2 = `<span class="badge bg-primary d-flex align-itmes-center pt-1 ms-1">${targetUserId}</span>`
    let toFix = `<span class="px-2">悄悄說</span>`;
    let msg = `<span">${message}</span>`;
    leftArea.innerHTML += `<div class="d-flex align-itmes-center mb-1">${icon1}對${icon2}${toFix}：${msg}</div>`;
  }
}

function setClientList(){
  console.log(clientList)
  clientDOM = "";
  clientList.forEach((client)=>{
    if(client !== userId){
      let dom = `<div idn="${client}" class="btn btn-secondary w-100 mb-1">${client}</div>`
      clientDOM+=dom;
    }
  });
  rightArea.innerHTML = clientDOM;
  let btns = rightArea.querySelectorAll(".btn");
  btns.forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      let target = e.currentTarget;
      let idn = e.currentTarget.getAttribute("idn");
      if(targetUserId && targetUserId !== idn){
        return false;
      }
      if(target.classList.contains("btn-danger")){
        target.classList.remove("btn-danger");
        targetUserId = undefined;
      }else{
        target.classList.add("btn-danger");
        targetUserId = idn;
      }
    })
  })
}

function scrollToBottom() {
  leftArea.scrollTop = leftArea.scrollHeight - leftArea.clientHeight;
}


