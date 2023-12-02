module.exports = function(app, path, db){

  app.get('/login', function(req, res){
    res.sendFile(path.join(__dirname, '../templates/login.html'))
  });

  app.post('/login', async function(req, res, next){
    const body= req.body;
     user = await db.login(body.email,body.password);
    if(!user || user== null){
       res.render(path.join(__dirname, '../templates/login.html'), {al: 'al'});
      next();
      return;
    }
  
    if(!user.verified){
      res.redirect('/verify');
      next();
      return;
    }
    req.session.user= user
    if(req.session.user){
      res.redirect('/dashboard')
    }
    else{
      res.render(path.join(__dirname, '../templates/login.html'), {al: 'al'});
    }
  });

  app.get('/verify', function(req, res){
     res.render(path.join(__dirname, '../templates/verify.html'));
  });

  app.post('/verify', function(req,res, next){
    var body= req.body;
    
    const success= db.verify(body);
    if(success){
      res.redirect(307, '/dashboard');
      next()
    }
    else{
      res.redirect(307, '/verify');
      next()
    }
  });


}