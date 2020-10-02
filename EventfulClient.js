/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

const request = require('request');
let Event = require('./Event.js');

function EventfulClient() { }

// To replace with your own key
var APIKey = "";

EventfulClient.prototype.search = async function(latitude, longitude, radius) {

    let URL = "http://api.eventful.com/json/events/search" +
                                "?app_key=" + APIKey +
                                "&where=" + latitude + "," + longitude +
                                "&within=" + radius +
                                "&units=km" +
                                "&category=festivals_parades,music" +
                                "&sort_order=popularity" +
                                "&page_size=50";
    return  await requestEvents(URL);
}

EventfulClient.prototype.searchEvent = async function(eventID) {
    let URL = "http://api.eventful.com/json/events/get" +
                                "?app_key=" + APIKey +
                                "&id=" + eventID;
    return await requestUniqueEvent(URL);
}

function requestEvents(url) {
  return new Promise( resolve => {

    request(url, (err,response, body) => {

      let lstEvents = [];

      try { data = JSON.parse(body); } 
      catch(error) { data = []; }
      
      if( data["total_items"] > 0) {
        events = data["events"]["event"];
        lstEvents = events.map(e => new Event( e["title"],
                                               e["description"],
                                               e["latitude"],
                                               e["longitude"],
                                               e["venue_address"],
                                               e["postal_code"],
                                               e["id"],
                                               e["city_name"],
                                               e["country_name"],
                                               e["start_time"],
                                               e["venue_name"],
                                               e["url"] ));
        resolve(lstEvents);
      }
    });
  });
}

function requestUniqueEvent(url) {
  return new Promise( resolve => {
    request(url, (err,response, body) => {

      let event = [];

      data = JSON.parse(body);

      event = new Event( data["title"],
                         data["description"],
                         data["latitude"],
                         data["longitude"],
                         data["address"],
                         data["postal_code"],
                         data["id"],
                         data["city"],
                         data["country_name"],
                         data["start_time"],
                         data["venue_name"],
                         data["url"] );
        resolve(event);

    });
  });
}


module.exports = EventfulClient;
