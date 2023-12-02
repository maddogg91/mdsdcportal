const multer = require('multer');
const path = require('path');
const passport = require('passport');
const app = require('./config/app.js').getApp(path, passport);
const upload = multer({ dest: __dirname+ '/tmp/'});
const fs = require('fs');
const db= require('./mongoinfo.js');
const refresh= require('./refresh.js');
const register= require('./routes/registration.js')(app, path, db);
const login= require('./routes/login.js')(app,path,db);
const google= require('./routes/google.js')(app, passport, db);
const customer= require('./routes/customer.js')(app, path, db);
const admin= require('./hidden/admin.js')(app, db, refresh, path);
var nodemailer = require('nodemailer');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.get('/success', function(req, res) {
  const id= req.query.id;
  db.makeFullPayment(id);
  res.sendFile(path.join(__dirname, 'templates/success.html'));
});

app.get('/cancel', function(req, res) {
 
  res.sendFile(path.join(__dirname, 'templates/cancel.html'));
});

app.get('/header', function(req,res){
  res.sendFile(path.join(__dirname, 'templates/newhome.html'));
});

app.get('/terms', function(req,res){
  res.render(path.join(__dirname, 'templates/terms.html'))

})

app.get('/privacy', function(req,res){
  res.render(path.join(__dirname, 'templates/privacy.html'))

})

app.get('/logout', function(req,res){
  req.session.user= '';
  req.session.projects='';
  res.redirect('/');
});

app.get('/profile', async function(req, res){
  refreshProperties('profile', req, res);
});

app.get('/archived', async function(req,res){
  if(!req.session.user){
     res.redirect('/')
    }
    
  var data = await db.loadArchived(req.query.data, req.session.user);

  res.render(path.join(__dirname, 'templates/archived.html'), {'data' : data.data, 'type': data.type});
 
})

app.post('/restore', function(req,res){
  db.restore(req.body.data, req.body.type, req.session.user);

})

app.post('/profile', async function(req, res){
  const body= req.body;
  if(req.session.user){
    await db.updateProfile(req.session.user, body, req.session.path)
  
    res.redirect('/profile');
  }
  else{
    res.redirect('/')
  }

});

app.post('/saveAvatar', upload.single('file'),async function (req,res){
  var tmp_path = req.file.path;
  var filename= String(Math.floor(Math.random() * 90000) + 10000);
  var target_path = 'public/images/user' + String(req.session.user._id) + "/" + filename + req.file.originalname;
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  db.updateUserAvatar(target_path, req.session.user);
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end(target_path);
  /*
  var destination= __dirname+ "/public/images/user"+ String(req.session.user._id);

 
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
     var path= files.filepath;

    var new_path=
      destination+filename+path;
    fs.rename(path, new_path, function(err){
    });
});
*/
});

app.listen(3000, () => {
  // Code.....
});


