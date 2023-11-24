module.exports = function(app, passport){

  app.get('/google',
  passport.authenticate('youtube'));

  app.get('/oauth2callback/google/', function(req,res){
    const token= req.query.code;
   // yt.upload('test-short.mp4', 'test-video #Shorts', 'i am testing', 'private', token);
    res.redirect('/');

  });


}