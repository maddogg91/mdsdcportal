const passport =require("passport")
const GoogleStrategy = require('passport-google-oauth2').Strategy;
var YoutubeV3Strategy = require('passport-youtube-v3').Strategy

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 
function oauthSignIn() {
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {'client_id': process.env['authid'],
                'redirect_uri': 'https://mdsdcportal.maddogg91.repl.co/oauth2callback/google/',
                'response_type': 'token',
                'scope': 'https://www.googleapis.com/auth/youtube.force-ssl',
                'include_granted_scopes': 'true',
                'state': 'pass-through value'};

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}


*/


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
        done(null, user);
});
/*
passport.use(new GoogleStrategy({
        clientID: process.env['authid'],
        clientSecret: process.env['authsec'],
        callbackURL: "https://mdsdcportal.maddogg91.repl.co/oauth2callback/google/",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
    }
));
*/
passport.use(new YoutubeV3Strategy({
    clientID: process.env['authid'],
    clientSecret: process.env['authsec'],
    callbackURL: "https://mdsdcportal.maddogg91.repl.co/oauth2callback/google/",
    scope:['https://www.googleapis.com/auth/youtube.readonly','https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ userId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
//module.exports= {oauthSignIn};