
  async function refreshProperties(url, req, res, db, path){
    db= require('./mongoinfo.js');
    if(req.session.user){
     req.session.user= await db.loadUser(req.session.user);
       req.session.notifications= await db.loadNotifications(req.session.user);

       if(!req.session.notifications){
         req.session.notifications= []
       }
       if(!req.session.projects){

        req.session.projects= await db.loadRequest(req.session.user);

         res.render(path.join(__dirname, './templates/'+ url+ '.html'), {'user': req.session.user, 'request': req.session.projects, 'data':JSON.stringify(req.session.projects), 'notifications': req.session.notifications,
  'messages':JSON.stringify(req.session.notifications)                                                   });
      }
         else if(req.session.projects){
            req.session.projects= await db.loadRequest(req.session.user);
            res.render(path.join(__dirname, './templates/'+ url+ '.html'), {'user': req.session.user, 'request': req.session.projects, 'data':JSON.stringify(req.session.projects),'notifications': req.session.notifications, 'messages':JSON.stringify(req.session.notifications)});
         }

      else{
         res.render(path.join(__dirname, './templates/'+ url+ '.html'), {'user': req.session.user, 'request': [], 'data': [], 'notifications': req.session.notificiations, 'messages':JSON.stringify(req.session.notifications)});

      }

    }
    else{
      res.redirect('/')
    }
  }

module.exports = {refreshProperties}