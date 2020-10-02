/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

function Event(title, description, latitude, longitude, address, zipCode,
eventfulID, cityName, countryName, eventStartTime, venueName, URL) {
    this.title = title;
    this.description = description!==null?description.substr(0, 100) + "...":"";
    this.latitude = latitude;
    this.longitude = longitude;
    this.address = address;
    this.zipCode = zipCode;
    this.eventfulID = eventfulID;
    this.cityName = cityName;
    this.countryName = countryName;
    this.eventStartTime = eventStartTime;
    this.venueName = venueName;
    this.URL = URL;
}

module.exports = Event;
