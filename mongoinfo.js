const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
const fs = require('fs');
const CryptoJS = require('crypto-js');
const user= process.env['user'];
const pass= process.env['pass'];
const url= 'mongodb+srv://'+user+':'+pass+'@cluster0.4grai.mongodb.net/';
const client = new MongoClient(url);
const multer  = require('multer');
const emails= require('./config/email.js')


client.connect();
const database= client.db("mdgportal");
const users= database.collection("users");
const requests= database.collection("requests");
const archived= database.collection("archivedreq");
const trashedNotification= database.collection("archnotif")
const notifications= database.collection("notifications");
const verifications= database.collection("verify")
trashedNotification.createIndex({ date: 1 }, { expireAfterSeconds: 2592000 });
archived.createIndex({ date: 1 }, { expireAfterSeconds: 2592000 });
verifications.createIndex({ date: 1 }, { expireAfterSeconds: 1800});

function enc(txt){

return  CryptoJS.AES.encrypt(txt, 'mdg').toString();
}

function dec(data){
  const bytes = CryptoJS.AES.decrypt(data, 'mdg');
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}

async function register(email,pass, name, country, bday, phone){
	const new_user= {
		email: email,
		passw: enc(pass),
    name: name,
    country: country,
    bday: bday,
    usertype: "customer",      url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
		joindate: new Date().toLocaleString(),
    phone: phone,
    verified: false
	}
	const user= await users.findOne({email: new_user.email});
	console.log(user);
	if(!user){
		users.insertOne(new_user);
    const ver= {
      _id: Math.floor(Math.random()*90000) + 10000,
      email: new_user.email,
      date: new Date().toLocaleString()
    }
    verifications.insertOne(ver);
    emails.emailRegistrationCode(ver);
		return user;
	}
	else{
		console.log("Username exists");
		return false;
	}
}
async function createWebSiteRequest(user, body, type){
  var pgcount;
  var updates;
  switch (body.package){
    case "1":
        body.pagecount= 3
        body.updates= 0
        break;
    case "2":
        body.pagecount= 5
        body.updates= 1
        break;
    case "3":
        body.pagecount= 8
        body.updates= 3
        break;
    
  }
  const new_request= {
    user: user,
    request: body,
    creationdate: new Date().toLocaleString(),
    status: 'initiate',
    type: type,
    balance: body.total
  }
  requests.insertOne(new_request);
}

async function loadRequest(user){
 
  const req= await requests.find({'user._id': user._id.toString()}).toArray(function(err, result) {
    if (err) throw err;
     });

  if(req!= null){
   
    return req;
  }
  return null;
}
async function loadUser(user){

  const req= await users.findOne({'_id': new ObjectID(user._id)});

  if(req!= null){

    return req;
  }
  return null;
}
async function loadNotifications(user){
  
  var filter= "";
  if(user.usertype== "Admin"){
    filter= {'user': "Admin"};
  }
  else{
    filter= {'user': user._id};
  }

  const notif= await notifications.find(filter).toArray(function(err, result) {
    
    if (err) throw err;
     });
  
  return notif;
}
async function updateNotification(body){
    notifications.updateOne({'_id': new ObjectID(body._id)}, {$set: {'isRead': true}});
}
async function deleteNotification(body){
  trashedNotification.insertOne(body);
  notifications.deleteOne({'_id': new ObjectID(body._id)});
}
async function loadArchived(body, user){
  const archivedData= {
     'data': ' ',
     'type': ' '
   }
  switch(body){
     
     
     case 'notifications':
   
      var filter= "";
      if(user.usertype== "Admin"){
        filter= {'user': "Admin"};
      }
      else{
        filter= {'user': user._id};
      }
     
      archivedData.data= await trashedNotification.find(filter).toArray(function(err, result) {
       
        if (err) throw err;
       
         });
      
      archivedData.type="notification";
       return archivedData;

      case 'projects':
      filter = {'user._id': user._id}
       archivedData.data= archived.find(filter).toArray(function(err, result) {

        if (err) throw err;
       
         });
      archivedData.type="project";
       return archivedData;
   }
}

async function restore(body, type, user){
  const restore= []
  switch(type){
    case 'notification':
      restore.push(body.forEach((item=> lookup(item, trashedNotification) 
        )));
      break;
    case 'project':
      restore.push();
      break;
  
  }
  console.log(restore);
}

async function lookUp(item, source){
  const lookup= await source.findOne({'_id': new ObjectID(item)});
  return lookup;
}

async function login(email,pass){
	const user= await users.findOne({email: email});
	if(user!= null){
		if(dec(user.passw) === pass){
  
		return user;
		}
		else{
			return null;
		}
	}
	else{
		return null;
	}
}
async function reset(email,pass){
  const user= await users.findOne({email: email});
  if(user!= null){
  user.passw= enc(pass);
  users.updateOne({'_id': new ObjectID(user._id)}, {$set:{passw: user.passw}})
  }
}
async function notifyUpdate(header, user, notification){
  var body={
    header: header,
    user: user,
    notification: notification,
    date: new Date().toLocaleString(),
    isRead: false
  }
  notifications.insertOne(body);
}

async function updateRequest(req){

  requests.updateOne({'_id': new ObjectID(req._id)}, {$set: {request: req.request, balance: req.balance} });
}

async function deleteProject(req){
  
  archived.insertOne(req);
  requests.deleteOne({'_id': new ObjectID(req._id)}, function(err, obj) {
  if (err) throw err;
  console.log("1 document deleted");
  });
}

async function updateProfile(us, body, path){

  us.name= body.name;
  us.email= body.email;
  if(!body.passwordFlag){
    us.passw= body.passw
  }
  else{
    us.passw= enc(body.passw);
  }

  us.phone= body.phone;
  const query= {name: us.name, email: us.email, passw: us.passw, phone: us.phone}
  
  users.updateOne({'_id': new ObjectID(us._id)}, {$set:query})
}

function updateUserAvatar(path, user){
  var p= path.replace("public/","");
  users.updateOne({'_id': new ObjectID(user._id)}, {$set:{avatar: p}});
}
async function createResetToken(email){
  const ver= {
    _id: Math.floor(Math.random()*9000000) + 1000000,
    email: email,
    date: new Date()
  }
  verifications.insertOne(ver);
  emails.resetPassword(ver);
}

async function resetPassword(request){
  const tmp= await verifications.findOne({'_id': parseInt(request.code)})
  console.log(tmp);
  if(tmp!= null){
    users.updateOne({'email': tmp.email}, {$set:{passw: enc(request.password)}});
    verifications.deleteOne({'_id': parseInt(request.code)});
    return true;
  }
  else{
    return false;
  }
}


async function verify(code){
  var vfy= ''
  code.forEach((c) => {
    vfy= vfy + c
  });

  const tmp= await verifications.findOne({'_id': parseInt(vfy)});

  
  if(tmp){
    const user= await users.findOne({'email': tmp.email })
   
    users.updateOne({'_id': new ObjectID(user._id)}, {$set:{verified: true}});

    verifications.deleteOne({'_id': tmp._id});
    
      return true;
    }
  else{
    return false;
  }
  }

function makeFullPayment(id){
  requests.updateOne({'_id': new ObjectID(id)}, {$set: {balance: 0}});
}

async function resendVerification(email){
  const user= await users.findOne({email: email});

  if(user){
    verifications.deleteOne({'email': email});
    const verification= Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      const body={
        email: email,
        code: verification,
        date: new Date()
      }
      verifications.insertOne(body);
      emails.emailRegistrationCode(body);
    }
  return user;
  }

async function googleAuth(googleUser){
  const profile= googleUser._json;
  const email= profile.email;
  const name= profile.name;
  const image= profile.picture;
  const id= profile.sub;
  const user= await users.findOne({email: email});
  if(user){
    return user;
  }
  else{
    const body={
      name: name,
      email: email,
      avatar: image,
      id: id,
      verified: true,
      usertype: "customer",
      date: new Date()
    }
    users.insertOne(body);
    return body;
  }
}
  
  
  

module.exports = { register, login, loadRequest, createWebSiteRequest, updateRequest, notifyUpdate, loadNotifications, deleteProject, updateProfile, reset, updateUserAvatar, loadUser, loadArchived, updateNotification, deleteNotification, verify, makeFullPayment, resendVerification, createResetToken, resetPassword, googleAuth};