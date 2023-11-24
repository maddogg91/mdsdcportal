'use strict'
var unread= 0;

messages.forEach(countRead);


function countRead(x){
  switch(x.isRead){
    case true:
      break;
    case false:
      unread++;
      document.getElementById("notif").innerHTML= unread;
  }
}