const socketCliente = io();

const messageInput = document.getElementById('message-input');
const form = document.getElementById('form')
const sendButton = document.getElementById('send-button');
let user;
Swal.fire({
    title: "Bienvenido",
    text: "Ingrese su nombre de usuario:",
    input: "text",
    allowOutsideClick: false,
    inputValidator: (value) => {
        if (!value) {
            return 'Necesitas escribir un nombre de usuario';
        }
    },
}).then(result => {     
    user = result.value  
    socketCliente.emit('authenticated', user);
})
form.onsubmit=(e)=>{
    e.preventDefault()
    const message = messageInput.value.trim(); 
    if(message.length > 0){
        socketCliente.emit('message', { user: user, message: message })  
        messageInput.value = '';
    }
}

socketCliente.on('messageLogs', data => {
    if (!user) return;
    const messagesLog = document.getElementById('messages-log');
    let messages = "";
    data.forEach(data => {
        messages = messages + `${data.user} dice: ${data.message} </br>`
    })
    messagesLog.innerHTML = messages;
})