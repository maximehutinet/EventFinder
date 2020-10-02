/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

"use strict"

const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const eventfulClient = require('./EventfulClient.js');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();
const db = require("./DB/DB.js");

// Make sure that the user token is valid
let auth = async(req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, process.env.JWT_SECRET);
        let checkToken = await db.checkToken(data.userId, token);
        if(!checkToken) {
            throw new Error();
        }
        req.userId = data.userId;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send( { error: 'Not authorized to access this resource' } );
    }
}

// Redirect the user to the /map route
app.get('/', (req, res) => {
    res.redirect('/map');
});

// Send the register.html file
app.get('/register', (req, res) => {
    res.sendFile("./views/register.html", { root: __dirname });
});

// Save the user in the database
app.post('/register', async (req, res) => {
    let isValid = await db.registration(req.body.username, req.body.pass, req.body.name);
    if(!isValid) {
        res.status(409).json( {error: "username already used"} );
    } else {
        res.sendStatus(200).send();
    }
});

// Send the login.html file
app.get('/login', (req, res) => {
    res.sendFile("./views/login.html", { root: __dirname });
});

// Save the user token in the database
app.post("/login", async (req,res) => {
    let isValid = await db.login(req.body.username, req.body.pass);

    if(!isValid) {
        res.status(401).json( {error: "authentication error"} );
    } else {
        let user = await db.getProfilByUsername(req.body.username);
        let token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '24h'});
        let isSaved = await db.saveToken(user.username, token);
        if(isSaved){
          res.status(200).send( {user: user, token:token} );
        }
    }
});

// Delete the token from the database
app.get('/logout', auth, async (req, res) => {
    let response = await db.deleteToken(req.userId);
    if(response){
      res.status(200).send();
    }

 });

// Send the map.html file
app.get('/map', (req, res) => {
    res.sendFile("./views/map.html", { root: __dirname });
});

// Return the username and name of the current user
app.get('/profil', auth, async (req, res) => {
    let user = await db.getProfilById(req.userId);
    res.status(200).json( {username: user.username, name: user.name, token: req.token} );
});

// Return a list of the users favorite events
app.get('/profil/favorite', auth, async (req, res) => {
    let username = (await db.getProfilById(req.userId)).username;
    let events = await db.getEventInProfil(username);
    res.status(200).json( {events: events, token: req.token} );
});

// Add an event to the users profil
app.post('/profil/event', auth, async (req, res) => {
    new eventfulClient().searchEvent(req.body.eventID).then( async(results) => {
        let username = (await db.getProfilById(req.userId)).username;
        let response = await db.pushEventInProfil(username, results);
        if(response){
            res.status(200).send( {token: req.token} );
        }
        else {
            res.status(409).send();
        }
    });
});

// Return a list of events depending of latitude, longitude and radius
app.get('/event/:latitude/:longitude/:radius', auth, (req, res) => {
    new eventfulClient().search( req.params.latitude,
                                 req.params.longitude,
                                 req.params.radius)
                        .then( results=> {
                            res.status(200).send( {events: results, token: req.token} );
                        });                        
});

// Return a list of profil matching a keyword
app.get('/profil/names/:name', auth, async (req, res) => {
    let users = await db.searchProfil(req.params.name);
    if(users){
      res.status(200).json( {users: users, token:req.token} );
    }
});

// Return one single profil depending on id (used to show a profil user)
app.get('/profil/:name', auth, async (req, res) => {
    let user = await db.searchProfil(req.params.name);
    if(user){
      res.status(200).json( {user: user[0], token:req.token} );
    }
    else{
      res.status(401).send( {token:token} );
    }
});

// Delete a specific event from the users profil
app.delete('/profil/event/:eventID', auth, async (req, res) => {
    let username = (await db.getProfilById(req.userId)).username;
    let response = await db.removeEventInProfil(username, req.params.eventID)
    if(response){
      res.status(200).send( {token: req.token} );
    }
  });

// Check if a username is already used before edition
app.post('/profil/edit/check', auth, async (req, res) => {
    let username = (await db.getProfilById(req.userId)).username;
    let isValid = true;
    if(req.body.username !== username) 
        isValid = !(await db.containUsername(req.body.username));
    res.status(200).send( {valid:isValid, token: req.token} );
});

// Verify login before active password modification
app.post('/profil/edit/activate', auth, async (req, res) => {
    let username = (await db.getProfilById(req.userId)).username;
    let isValid = await db.login(username, req.body.pass);
    res.status(200).send( {valid:isValid, token: req.token} );
});

// Verify login before active password modification
app.post('/profil/edit', auth, async (req, res) => {
    let user = (await db.getProfilById(req.userId));
    let username = user.username;
    let name = user.name;
    if(req.body.username !== "" && req.body.username !== username) {
        await db.modifyUsername(req.userId, req.body.username);
    }
    if(req.body.name !== "" && req.body.name !== name) {
        await db.modifyName(req.userId, req.body.name);
    }
    if(req.body.pass !== "undefined") {
        await db.modifyPass(req.userId, req.body.pass);
    }
    res.status(200).send( {token:req.token} );

});

app.use(auth);
app.listen(8080);
