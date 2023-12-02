module.exports = function(app, path, db){
app.get('/register', function(req, res){
  res.sendFile(path.join(__dirname, '../templates/register.html'));
});

app.post('/register', async function(req, res){
  const body= req.body;
  reg= db.register(body.email,body.password, body.name, body.country, body.bday, body.phone);
  if(reg!= false){
     res.render(path.join(__dirname, '../templates/verify.html'), {'user': reg});
  }
  else{
    res.sendFile(path.join(__dirname, '../templates/login.html'));
  }

});
  }