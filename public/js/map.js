/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

/***************************************************************
 * Constants definition for jwt header and jwt jstorage
 ***************************************************************/

let jsonHeader = function() {
  return {
    "Content-Type": "application/json",
    "Authorization": 'Bearer ' + localStorage.getItem("token")
  }
};
let formHeader = () => {
  return {
      "contentType": 'application/x-www-form-urlencoded; charset=UTF-8',
      "Authorization": 'Bearer ' + localStorage.getItem("token")
  }
};
let storeToken = (token) => {
  localStorage.setItem('token', token);
}




/***************************************************************
 * Map initialization
 ***************************************************************/

let map = L.map('map').setView([46.2, 6.1667], 13);
let searchChoice = "city";

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


getEvents();




/***************************************************************
 * Ask user geolocalisation and recenter map if needed
 ***************************************************************/

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
}
function showPosition(position) {
  map = map.setView([position.coords.latitude, position.coords.longitude], 13);
}
getLocation();




/***************************************************************
 * Manage favorite events card
 ***************************************************************/

$("#cards-favorite-events").hide();

// Close the favorite event card when clicking on the x
$(".close-favorite-events").on('click', function(){
  $("#button-fav").fadeIn();
  $("#cards-favorite-events").toggle("slide");
});


// Show the favorite events
$("#button-fav").on('click', function(){
  getFavoriteEvents();
  $("#button-fav").fadeOut();
  $("#cards-favorite-events").toggle("show");
});

// Get the favorite event and insert them into a div
function getFavoriteEvents() {
  let URL = '/profil/favorite';
  $.ajax( {
    type: "GET",
    url: URL,
    headers: formHeader(),
    success: (data) => {
      storeToken(data.token);
      $('.card-body-event').empty();
      data.events.forEach( event => {$('.card-body-event').append(currentFavoriteEvent(event))});
      $('.card-favorite').html(data.events.length + ' events');
    },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
        alert("getFavoriteEvents");
        window.location = "/login";
      }
    }
  });
}

// Check if the user press add on an event and add it to his list
$(document.body).on('click', "#add-to-list", function(e){
  let URL = 'profil/event/';
  $.ajax( {
    type: "POST",
    url: URL,
    headers: formHeader(),
    data: { "eventID": String(e.target.getAttribute('data-eventID')) },
    success: (data) => {
      storeToken(data.token);
      getFavoriteEvents();
      alertSWR("Event added", ".welcome", "");
    },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
        window.location = "/login";
      } else if( erreur === "Conflict" ) {
        alertSWR("Event already added", ".welcome", "");
      } else {
        alert( "Server unreachable !" );
      }
    }
  });
});

// Check if the user press delete on an favorite event and delete it from the list
$(document.body).on('click', "#delete-event", function(e){
  let eventID = String( e.target.getAttribute('data-eventID'));
  deleteEvent(eventID);
  getFavoriteEvents();
  alertSWR("Event deleted", ".welcome", "");
});

//delete an event depending on its ID
function deleteEvent(eventID){
  let URL = 'profil/event/' + eventID;
  $.ajax({
      url: URL,
      type: 'DELETE',
      headers: jsonHeader(),
      success: function(data) {
        storeToken(data.token);
      },
      fail: function() {
        alert("Oups looks like the event you try to remove doesn't exist");
      }
  });
}



/***************************************************************
 * Manage events on map
 ***************************************************************/

// Get the radius of the map depending of the current view
function getMapRadiusKM(){
  let mapBoundNorthEast = map.getBounds().getNorthEast();
  let mapDistance = mapBoundNorthEast.distanceTo(map.getCenter());
  return mapDistance/1000;
}

// Function to get the different event from our API and adding markers on the map
function getEvents() {
  latitude = map.getCenter()['lat'];
  longitude = map.getCenter()['lng'];
  radius = getMapRadiusKM();
  let URL = 'event/' + latitude + '/' + longitude + '/' + radius;
  $.ajax( {
    type: "GET",
    url: URL,
    headers: jsonHeader(),
    success: (data) => {
      console.log("DATA get event", data);
      storeToken(data.token);
      if(data.events) {
        data.events.forEach( event => {
          L.marker([event.latitude, event.longitude])
          .addTo(map)
          .bindPopup( eventMarker(event) );
        });
      }
    },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
        alert("getEvents");
        window.location = "/login";
      }
    }
  });
}

// Request event when the user zoom on the map
map.on('zoom',function(e){
  getEvents();
});

// Request event when the user move the map
map.on('dragend',function(e){
  getEvents();
});




/***************************************************************
* Manage searches
***************************************************************/

// Get the value of the search dropdown
const dropdown = document.getElementById("dropdown-choice");
dropdown.addEventListener('change', e => {
	searchChoice = dropdown.options[dropdown.selectedIndex].value;
});

// Search a keyword either in the city or friends depending of the dropbox choice
$('#search').submit( function() {
    let keyword = $('#search input').val();
    if(searchChoice == "city"){ getCity(keyword); }
    else if(searchChoice == "users") { showFriends(keyword); }
    else { alert("Something went wrong !"); }
    return false;
});

// Get the different cities based on a name
function getCity(name) {
    let uri = 'https://nominatim.openstreetmap.org/search?city='+name+'&format=json';
    $.getJSON(uri, function(data){
        if(data.length > 0) {
          map.setView([data[0]['lat'], data[0]['lon']]);
          getEvents();
        }
    });
}

// Search and display on a modal the different friends matching a keyword
function showFriends(name){
  let URL = "/profil/names/" + name;
  $.ajax( {
    type: "GET",
    url: URL,
    headers: jsonHeader(),
    success: (data) => {
      storeToken(data.token);
      $("#modal-users-body").empty();
      if( data.users.length === 0) {
        $("#modal-users-body").html("no match found");
      }
      data.users.forEach( user => {
        $("#modal-users-body").append( searchUser(user.username, user.name) );
      });
    },
    fail: function() { alert("Oups something went wrong"); },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
        window.location = "/login";
      }
    }
  });
  $("#modal-users-title").html("User matching : " + name);
  $("#modal-container").removeClass("modal-xl");
  $("#modal-users").modal('show');
}

// Show events of a remote user
$(document.body).on('click', "#see-profil", function(e){
  let username = e.target.getAttribute('data-profilID');
  let URL = '/profil/' + username;
  $.ajax({
    url: URL,
    type: 'GET',
    headers: jsonHeader(),
    success: (data) => {
      storeToken(data.token);
      $("#modal-users-body").empty();
      if( data.user.preferences.length === 0) {
        $("#modal-users-body").html("no favorites yet");
      }
      $("#modal-users-body").append(remoteProfilUser());
      data.user.preferences.forEach( p => {
        $("#remoteProfil").append(remoteFavoriteEvent(p));
      });
      $("#modal-users-title").html("Favorite events of <B>" + data.user.name + "</B>");
      $("#modal-container").addClass("modal-xl");
    },
    fail: (message) => {
      console.log(message)
    },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
        window.location = "/login";
      }
    }
  });
});




/***************************************************************
* Manage alert messages
***************************************************************/

// Show welcome message
$("#welcome").hide();
$.ajax({
  url: '/profil',
  type: 'GET',
  headers: jsonHeader(),
  success: (data) => {
      storeToken(data.token);
      $("#welcomeText").html("Hey <B>" + data.name + "</B>, How is it going today?&ensp;");
      $("#welcome").show();
  },
  error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
          window.location = "/login";
      }
  }
});

// Close the welcome alert when clicking on the x
$(".close-welcome").on('click', function() {
  $(".welcome").toggle("slide");
});

// Display an alert on the user screen
function alertSWR(message, element, color){
  $(element).toggle("show");
  setTimeout(function(){
    $(element).toggle("slide");
  }, 3000);
  $(element).css("background-color", color);
  $(element).html(message);
}




/***************************************************************
* Logout user
***************************************************************/

// Logout the user and redirect him on login page
$(document.body).on('click', "#logout", () => {
  let URL = '/logout';
  $.ajax( {
    type: "GET",
    url: URL,
    headers: jsonHeader(),
    success: () => {
      window.location = '/login';
    },
  });
});




/***************************************************************
* Edit user
***************************************************************/

// Open edition of user profile
$("#edit").click( () => {
  $.ajax({
    url: '/profil',
    type: 'GET',
    headers: jsonHeader(),
    success: (data) => {
      storeToken(data.token);
      $("#modal-users-body").empty();
      $("#modal-users-body").append(editProfilUser(data.username, data.name));
      $("#modal-users-title").html("Edit Profil");
      $("#modal-container").addClass("modal-xl");
      $("#badPass").hide();
      $("#modal-users").modal('show');
    },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
          window.location = "/login";
      }
    }
  });
});

// Check if new username is already used
$(document.body).on('click', "#checkUserName", () => {
  checkUserName();
});

// Modify user profil
$(document.body).on('click', "#saveEdit", async function() {
  
  let isValidPass = checkPass();
  let isValidUsername = await checkUserName();

  if(isValidPass && isValidUsername) {
    $.ajax({
      url: '/profil/edit',
      type: 'POST',
      headers: formHeader(),
      data: { "username": String( $("#username").val() ),
              "name": String( $("#name").val() ),
              "pass": String( $("#pass").val() ) },
      success: (data) => {
        storeToken(data.token);
        $("#modal-users").modal('hide');
        alertSWR("Modification saved", ".welcome", "");
      },
      error: (resultat, statut, erreur) => {
        if( erreur === "Unauthorized") {
            window.location = "/login";
        }
      }
    });
  } else {
    $("#modal-users").modal('hide');
    alertSWR("Errors in edition : no information saved", ".welcome", "");
  }
});

// Activate password modification after password verification
$(document.body).on('click', "#activatePass", () => {
  $.ajax({
    url: '/profil/edit/activate',
    type: 'POST',
    headers: formHeader(),
    data: { "pass": String( $("#passCheck").val() ) },
    success: (data) => {
      storeToken(data.token);
      if(data.valid) {
        $('#passContainer').empty();
        $('#passContainer').html( editProfilPassword() );
        $("#badPass").hide();
      }
    },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
          window.location = "/login";
      }
    }
  });
});

// Verify if second password matches first password during typing
$(document.body).on('input', "#rePass", () => {
  checkPass();
});

// Function called to check first and second password
function checkPass() {
  let isValid = false;

  if( $("#rePass").val() !== "" && $("#rePass").val() !== $("#pass").val() ) {
    $("#rePass").removeClass('form-control is-valid');
    $("#rePass").addClass('form-control is-invalid');
    $("#badPass").show();
  } else {
    $("#rePass").removeClass('form-control is-invalid');
    $("#rePass").addClass('form-control is-valid');
    $("#badPass").hide();
    isValid = true;
  }

  return isValid;
}

// Function called to activate password modification
async function checkUserName() {
  let isValid = false;

  await $.ajax({
    url: '/profil/edit/check',
    type: 'POST',
    headers: formHeader(),
    data: { "username": String( $("#username").val() ), },
    success: (data) => {
      storeToken(data.token);
      if(data.valid) {
        $("#username").removeClass('is-invalid');
        $("#username").addClass('is-valid');
        isValid = true;
      } else {
        $("#username").removeClass('is-valid');
        $("#username").addClass('is-invalid');
      }
    },
    error: (resultat, statut, erreur) => {
      if( erreur === "Unauthorized") {
          window.location = "/login";
      }
    }
  })

  return isValid;
}

