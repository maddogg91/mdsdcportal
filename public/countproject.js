var web= 0;
var mobile= 0;
var app= 0;

projectdata.forEach(countType);

function countType(x){

  switch(x.type){
    case 'website':

        web++;
        document.getElementById("web").innerHTML= web;
        break;
    case 'mobile':
        mobile++;
        document.getElementById("mobile").innerHTML= mobile;
        break;
      case 'webapp':
        app++;
        document.getElementById("webapp").innerHTML= webapp;
        break;
}       
}