'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
const {authenticate} = require('@google-cloud/local-auth');
const Youtube = require("youtube-api")
const opn = require("opn")
const Lien = require("lien")

// initialize the Youtube API library
//const youtube = google.youtube('v3');


let oauth = Youtube.authenticate({
    type: "oauth"
  , client_id: process.env['authid']
  , client_secret: process.env['authsec']
  , redirect_url: "https://mdsdcportal.maddogg91.repl.co/oauth2callback/google/"
});



opn(oauth.generateAuthUrl({
    access_type: "offline"
  , scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));



async function upload(fileName, title, desc, status, tok){
  const {tokens} = await oauth.getToken(tok)
  oauth.setCredentials(tokens);
         
          var req = Youtube.videos.insert({
              resource: {
                  // Video title and description
                  snippet: {
                      title: title
                    , description: desc
                  }
                  // I don't want to spam my subscribers
                , status: {
                      privacyStatus: status
                  }
              }
              // This is for the callback function
            , part: "snippet,status"

              // Create the readable stream to upload the video
            , media: {
                  body: fs.createReadStream(fileName)
              }
          }, (err, data) => {
              console.log("Done.");
              if(err){
                console.log("Check Credentials");
              }
              
              
          });

      };
 

async function uploadFullVideo(fileName, title, desc, status){
 
  const fileSize = fs.statSync(fileName).size;
    const res = await youtube.videos.insert(
      {
        part: 'id,snippet,status',
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: title,
            description: desc,
          },
          status: {
            privacyStatus: status,
          },
        },
        media: {
          body: fs.createReadStream(fileName),
        },
      },
      {
        // Use the `onUploadProgress` event from Axios to track the
        // number of bytes uploaded to this point.
        onUploadProgress: evt => {
          const progress = (evt.bytesRead / fileSize) * 100;
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0, null);
          process.stdout.write(`${Math.round(progress)}% complete`);
        },
      }
    );
    console.log('\n\n');
    console.log(res.data);
    return res.data;
  }

module.exports = {uploadFullVideo, upload};