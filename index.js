let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
var wifi = require('node-wifi');

wifi.init({
  iface : null // network interface, choose a random wifi interface if set to null
});

io.on('connection', (socket) => {
  
  socket.on('disconnect', function(){
    console.log("used disconnected")  
  });

  socket.on('confirm-network', (network) => {
    console.log("Network: "+network.ssid);
    console.log("Password: "+network.password);
    wifi.connect({ ssid : network.ssid, password : network.password}, (err) => {
      if (err) {
        socket.emit('error-emit', {success :false , err:"Incorrect Password"});
        console.log("Error: "+err);
      }
      else{
        socket.emit('success-emit', {success : true});
        console.log('Connected to '+network.ssid);
      }
    });
  })
  socket.on('get-wifi-networks', () => {
    wifi.scan((err, networks) => {
      if(err){
        socket.emit('error-emit', {success :false , err:err});
        console.log(err);
      }
      else{
        console.log(networks);
        io.emit('networks-sent', {networks: networks});
      }
    })
    
  })
});
 
var port = process.env.PORT || 3001;
 
http.listen(port, function(){
   console.log('listening in http://localhost:' + port);
});