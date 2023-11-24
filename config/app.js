const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser');


const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const yt= require('../youtube.js');
const auth= require('../oauth.js');
var rateLimit = require("express-rate-limit");
var ejs = require('ejs');
var json= require('json');

const cors=require("cors");
var formidable = require('formidable');
const http = require('http');


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
  mode: 'no-cors'
}

function getApp(path, passport){
  app.use(sessions({
    secret: process.env['session'],
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: true 
  }));
  app.use(passport.initialize());
  app.set('views', path.join(__dirname, 'templates'));
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(express.static('public'));
  app.use(express.static('images'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(limiter);
  app.use(cookieParser());
  app.use(cors(corsOptions));
  return app;
}
module.exports= {getApp};