module.exports = function(app, path, db){

  const payment = require('../payment.js');
  const refresh= require('../refresh.js');
  
  app.post('/customerPay', async function (req, res){
   let sessionurl= '';
    url= `${req.protocol}://${req.get('host')}`

    amount = req.body.balance * 100;
   sessionurl= await payment.payment(amount, url, res, req.body._id);
    res.writeHead(200, {'content-type': 'text/plain'});
    res.end(sessionurl);

  })

  app.get('/dashboard', async function(req, res){
      refresh.refreshProperties('home', req, res, db, path);
  });
  app.get('/request', function(req, res){
    if(req.session.user){
      res.render(path.join(__dirname, '../templates/createproj.html'), {'user': req.session.user})
    }
    else{
      res.redirect('/')
    }
  });

  app.get('/manage', async function(req, res){
    if(req.session.user){
      req.session.projects= await db.loadRequest(req.session.user);
      req.session.projects.forEach(change);
      const url= []
      url.push(req.session.projects.forEach(getUrl));
      res.render(path.join(__dirname, '../templates/projects.html'), {'user': req.session.user, 'projects': req.session.projects, 'data':JSON.stringify(req.session.projects), 'images':url, 'notifications': req.session.notifications})
    }
    else{
      res.redirect('/')
    }
  });

  app.post('/websiterequest', async function(req,res){
    const body= req.body;
    db.createWebSiteRequest(req.session.user, body, "website");
    req.session.projects= await db.loadRequest(req.session.user);
    res.redirect('/manage');
  });
  app.post('/webapprequest', async function(req,res){
    const body= req.body;
    db.createWebSiteRequest(req.session.user, body, "webapp");
    req.session.projects= await db.loadRequest(req.session.user);
    res.redirect('/manage');
  });
  app.post('/mobilerequest', async function(req,res){
    const body= req.body;
    db.createWebSiteRequest(req.session.user, body, "mobile");
    req.session.projects= await db.loadRequest(req.session.user);
    res.redirect('/manage');

  });
  app.post('/update', async function(req,res){
    const body= req.body;
    db.updateRequest(body);
    req.session.projects= await db.loadRequest(req.session.user);
    res.redirect('/manage');
  });
  app.post('/updatenotification', async function(req,res){
    const body= req.body;
    db.updateNotification(body);
    req.session.notifications= await db.loadNotifications(req.session.user);
  });
  app.post('/deletenotification', async function(req,res){
    const body= req.body;
    db.deleteNotification(body);
    req.session.notifications= await db.loadNotifications(req.session.user);
  });
  app.post('/deleteproject', async function(req, res){
    const body= req.body;
    db.deleteProject(body);
    req.session.projects= await db.loadRequest(req.session.user);
  })
  app.post('/notifyupdate', async function(req,res){
    const body= req.body;
    const header= "Request for Project Update";
    const user= "Admin";
    db.notifyUpdate(header, user, body);
  });
  app.get('/inbox', async function(req, res){
   
    refresh.refreshProperties('inbox', req, res, db, path);
  });

  function getUrl(item){
    switch(item.type){
      case 'website':
        return "https://cdn-icons-png.flaticon.com/512/1006/1006771.png";
      case 'webapp':
        return "https://icon-library.com/images/web-application-icon/web-application-icon-13.jpg";
      case 'mobile':
        return "https://cdn2.iconfinder.com/data/icons/iphone-x-feature/64/iphonexiconCvt_Download-512.png";
    }
  }

  function change(item){
     switch (item.request.package){
      case "1": 
        item.request.package= "Basic Package" 
        break; 
      case "2": 
        item.request.package= "Plus Package" 
        break; 
      case "3": 
        item.request.package= "Premium Package" 
        break; 
      }  
    switch(item.request.type){
      case "1":
        item.request.type= "Static"
        break;
      case "2":
        item.request.type= "Dynamic"
        break;
    }
  }      
  app.get('/form1', function(req,res){
    if(req.session.user){
      res.render(path.join(__dirname, '../templates/websiteform.html'), {'user': req.session.user})
    }
    else{
      res.redirect('/')
    }
  })

  app.post('/resend',async function(req,res, next){
    const body= req.body;
    const send= await db.resendVerification(body);
    if(send){
      res.redirect(307, '/verify');
      next();
    }
    else{
      res.redirect(307, '/verify');
      next()
    }
   
  })

  app.get('/forgot', function(req,res){
    res.render(path.join(__dirname,'../templates/resetpassw.html'))
  });
  

  app.post('/forgot', function(req,res, next){
    const email= req.body.email;
    db.createResetToken(email);
    res.redirect('/');
    next();
  });

  app.get('/reset', function(req,res){
   const id= req.query.code;
  
    if (id== null) {
      res.redirect('/')
      return;
    }
    res.render(path.join(__dirname,'../templates/reset.html'),{code: id, al: ''});
    
  });

  app.post('/reset', async function(req,res,next){
    const body= req.body;

    const request= await db.resetPassword(body);
    if(!request){
  res.render(path.join(__dirname,'../templates/reset.html'),{code: body.code, al: "Request either timed out or Email was invalid"});
    }
    else{
      res.render(path.join(__dirname,'../templates/reset.html'),{code: body.code, al: "Password succesfully updated! Return to login page"});
      next();
     
    }
  })

}