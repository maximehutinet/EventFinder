/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

let port = 27017
let mongoose = require('mongoose');
let options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, "[DB] - Error with the connexion"));
db.once('open', function (){
    console.log(console.log("[DB] - Connected"));
});

// Schema definition
let profilSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  pass: {
    type: String,
    required: true,
    select: false,
  },
  name: String,
  age: String,
  preferences: [],
  token: {
    type: String,
    select: false,
  }
});

let Profil = mongoose.model('Profil', profilSchema);

// Check if the username is already in the DB
containUsername = async (username) => {
  const users = await Profil.find({ "username" : username });
  if(users.length > 0) {
      return true;
  }
  return false;
}

// Check if the ID is already in the DB
containId = async (id) => {
  const users = await Profil.find({ "_id" : id });
  if(users.length > 0) {
      return true;
  }
  return false;
}

// Register user
registration = async (username, pass, name) => {
  const containsUsername = await containUsername(username);

  if(containsUsername){
    console.log("[DB] - ID already registered");
    return false;
  }
  let newProfil = new Profil();
  newProfil.username = username;
  newProfil.pass = pass;
  newProfil.name = name;
  newProfil.save(function(err){
    if(err){
      console.log("[DB] - Error saving the profil")
      return false;
    }
  });
  console.log("[DB] - ID registered");
  return true;
}

// Check if the password matches the one provided
authentication = async (username, pass) => {
  const containsUsername = await containUsername(username);
  if(containsUsername){
    const user = await Profil.findOne({ "username" : username }).select('+pass');
    if(user.toObject().pass === pass){
      return true;
    }
  }
  return false;
}

// Retrieve profil from the DB
getProfilByUsername = async (username) => {
  const containsUsername = await containUsername(username);

  if(containsUsername){
    const user = await Profil.findOne({ "username" : username });
    return user.toObject();
  }
  return undefined;
}

// Retrieve profil from the DB
getProfilById = async (id) => {
  const containsId = await containId(id);

  if(containsId){
    const user = await Profil.findOne({ "_id" : id });
    return user.toObject();
  }
  return undefined;
}

// Search for a profil based on the id or name
searchProfil = async (name) => {
    let regex = new RegExp("^" + name);
    const users = await Profil.find({ $or:[{"username" : regex}, {"name" : regex}]  });

    if(users.length > 0){
      return users;
    }
    return undefined;
}

// Update the token field
saveToken = async (username, token) => {
  const containsUsername = await containUsername(username);

  if(containsUsername){
    const res = await Profil.updateOne({ "username" : username }, { "token": token });
    if(res.ok == 1){
      return true;
    }
  }
  return false;
}

// Delete the current token field
deleteToken = async (id) => {

  const containsId= await containId(id);
  
  if(containsId){
    const res = await Profil.updateOne({ "_id" : id }, { "token": undefined });
    if(res.ok == 1){
      return true;
    }
  }
  return false;
}

// Make sure the token is correct in the token field
checkToken = async (id, token) => {
  const containsId = await containId(id);
  if(containsId){
    const user = await Profil.findOne({ "_id" : id }).select('+token');
    if(user.toObject().token !== null && user.toObject().token === token)
      return true; 
  }
  return false; 
}

// Check if event in already in profil
containEvent = async (username, eventID) => {
  const containsUsername = await containUsername(username);
  if(containsUsername){
    const res = await Profil.findOne({ "username" : username }).find({ "preferences.eventfulID" : eventID });
    return res.length > 0;
  }
  return false;
}

// Push event in a profil
pushEventInProfil = async (username, event) => {
  const containsEvent = await containEvent(username, event.eventfulID);

  if(containsEvent){
    return false;
  }
  const res = await Profil.updateOne({ "username" : username }, { $push: { "preferences": event } });
  return res.ok == 1
}

// Remove event in a profil
removeEventInProfil = async (username, eventID) => {
  const containsUsername = await containUsername(username);
  if(containsUsername){
    const res = await Profil.update({ "username" : username }, { $pull : { "preferences" : { "eventfulID" : eventID } } });
    return res.ok == 1;
  }
  return false;
}

// Get the different events in a profil
getEventInProfil = async (username) => {
  const containsUsername = await containUsername(username);
  if(containsUsername){
    const events = await Profil.find({ "username" : username }, "preferences");
    return events[0].preferences;
  }
  return undefined;
}

// Modify username of a user
modifyUsername = async (id, newUsername) => {
  const containsId = await containId(id);
  if(containsId){
    const res = await Profil.updateOne({ "_id" : id }, { "username": newUsername });
    if(res.ok == 1){
      return true;
    }
  }
  return false;
}

// Modify name of a user
modifyName = async (id, newName) => {
  const containsId = await containId(id);
  if(containsId){
    const res = await Profil.updateOne({ "_id" : id }, { "name": newName });
    if(res.ok == 1){
      return true;
    }
  }
  return false;
}

// Modify pass of a user
modifyPass = async (id, newPass) => {
  const containsId = await containId(id);
  if(containsId){
    const res = await Profil.updateOne({ "_id" : id }, { "pass": newPass });
    if(res.ok == 1){
      return true;
    }
  }
  return false;
}


exports.registration = function(username, pass, name){
  return registration(username, pass, name);
}

exports.containId = function(id){
  return containId(id);
}

exports.containUsername = function(username){
  return containUsername(username);
}

exports.login = function(username, pass){
  return authentication(username, pass);
}

exports.getProfilByUsername = function(username){
  return getProfilByUsername(username);
}

exports.getProfilById = function(id){
  return getProfilById(id);
}

exports.saveToken = function(username, token){
  return saveToken(username, token);
}

exports.deleteToken = function(id){
  return deleteToken(id);
}

exports.checkToken = function(id, token){
  return checkToken(id, token);
}

exports.searchProfil = function(name){
  return searchProfil(name);
}

exports.pushEventInProfil = function(username, event){
  return pushEventInProfil(username, event);
}

exports.containEvent = function(username, eventID){
  return containEvent(username, eventID);
}

exports.removeEventInProfil = function(username, eventID){
  return removeEventInProfil(username, eventID);
}

exports.getEventInProfil = function(username){
  return getEventInProfil(username);
}

exports.modifyUsername = function(id, newUsername){
  return modifyUsername(id, newUsername);
}

exports.modifyName = function(id, newName){
  return modifyName(id, newName);
}

exports.modifyPass = function(id, newPass){
  return modifyPass(id, newPass);
}