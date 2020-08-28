require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mqtt = require('mqtt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
/* const GoogleStrategy = require('passport-google-oauth20').Strategy; */

/* const client  = mqtt.connect('mqtt://test.mosquitto.org'); */
/* const client = mqtt.connect('mqtt://192.168.1.15:1883'); */
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function () {
    client.subscribe('#', function (err) {
      if (!err) {
        client.publish('presence', 'Hello mqtt')
      }
    })
  })
  
  client.on('message', function (topic, message) {
    // message is Buffer
    for(let i = 1; i <= 10; i++){
        if(i = 10){
          if (topic.toString() == ("ardu/I" + i)) { //acá coloco el topic
              document.getElementById("I" + i).textContent = message.toString()
            }
        }else{
          if (topic.toString() == "ardu/I0" + i) { //acá coloco el topic
              document.getElementById("I" + i).textContent = message.toString()
            }
        }
    }
  })

  function OnOff(dato, I) {
    client.publish(I, dato)
  }

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());



mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true, });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);


passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){ 
    res.render('home');
});

app.get('/login', function(req, res){ 
    res.render('login');
});

app.get('/logout', function(req, res){
    req.logOut();
    res.redirect('/');
});

app.get('/about', function(req, res){ 
    res.render('about');
});

app.get('/dashboard', function(req, res){ 
    if(req.isAuthenticated()){
        res.render('dashboard');
    }else{
        res.redirect('/login');
    }
});

app.get('/register', function(req, res){
    const username = "oscarumana1021@gmail.com";
    const password = "12345";
    User.register({username: username}, password, function(err, user){
    if(err){
        console.log(err);
    }else{
        passport.authenticate('local')(req, res, function(){
            res.redirect('/dashboard');
        })
    }
});
});

app.post('/login', function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req, res, function(){
                res.redirect('/dashboard');
            });
        }
    });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

