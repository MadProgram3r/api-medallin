const events = require('events');
const emisor = new events.EventEmitter();


function saludar() {
    const emisor = new events.EventEmitter();
    setTimeout(()=>emisor.emit('saluda','Juan'), 3000);
    setTimeout(()=>emisor.emit('saluda','Juana'), 4000);
    setTimeout(()=>emisor.emit('saluda','Oscar'), 5000);
    emisor.emit('saluda', 'Juan');
    return emisor;
}   

let sal = saludar();

sal.on('saluda', (nombre) =>{
    console.log('Hola ' +nombre);
});