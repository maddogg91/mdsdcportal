
module.exports = function(app, db, refresh, path){
app.get('/admin', async function(req, res){
  req.session.user= await db.login("beserkxero@yahoo.com","Delete007$$$")

  refresh.refreshProperties('/home', req, res, db, path)
});
app.get('/adminreset', async function(req, res){
  req.session.user= await db.reset("beserkxero@yahoo.com","Delete007$$$")

  res.redirect('/dashboard')
});

}