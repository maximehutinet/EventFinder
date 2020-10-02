
/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

// Content of a search user result
const searchUser = (username, name) => {
    return `
      <div class="card card-body">
        <div id="info-user" style="margin-bottom:1rem">
          Username : ${username} <br>
          Name : ${name}
        </div>
        <button type="button" class="btn btn-primary" id="see-profil" data-profilID="${username}"> See profil</button>
      </div>
    `;
};

// Content of popup event marker
const eventMarker = (event) => {
  const description = event.description > 0 ? `<br><b>Description : </b> ${event.description}` : "";
  return `
    <br> <b>${event.title}</b>
    <br> <b>Starts : </b> ${event.eventStartTime}
    <br> <b>Venue : </b> ${event.venueName}
    <br> <b>Address : </b> ${event.address} - ${event.zipCode} ${event.cityName}
    ${description}
    <br> <button type="button" class="btn btn-warning" id="add-to-list" data-eventID="${event.eventfulID}">Add</button>
    <a target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="btn-more-info" href="${event.URL}" >More info</a>
  `;
}

// Content of a favorite event of current user
const currentFavoriteEvent = (event) => {
  return `
    <div class="card text-white bg-dark mb-3" data-cardeventID="${event.eventfulID}" style="max-width: 18rem;">
      <div class="card-header"> ${event.title}</div>
      <div class="card-body">
        <h5 class="card-title"> ${event.eventStartTime}</h5>
        <p class="card-text"> ${event.description}</p>
        <br><a target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="btn-more-info" href="${event.URL}" >More info</a>
        <button type="button" class="btn btn-danger" id="delete-event" data-eventID="${event.eventfulID}">Delete</button>
      </div>
    </div>
  `;
}

// Container for view of a remote user favorites
const remoteProfilUser = () => {
  return `
    <div class="col-lg-12 d-flex align-items-stretch justify-content-center flex-wrap" id="remoteProfil"></div>
  `;
}

// Content of a favorite event of remote user
const remoteFavoriteEvent = (event) => {
  return `
    <div class="card text-center text-white bg-dark mb-3" data-cardeventID="${event.eventfulID}" style="max-width: 16rem">
      <div class="card-header"> ${event.title}</div>
      <div class="card-body">
        <h5 class="card-title"> ${event.eventStartTime}</h5>
        <p class="card-text"> ${event.venueName}</p>
        <p class="card-text"> ${event.cityName}</p>
      </div>
      <div class="card-footer ">
        <button type="button" class="btn btn-warning" id="add-to-list" data-eventID="${event.eventfulID}">Add</button>
        <a target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="btn-more-info" href="${event.URL}" >More info</a>
      </div>
    </div>
  `;
}

// Content of popup event marker
const editProfilUser = (username, name, age) => {
  return `
    <div class="form-group">
      <label for="username"><B>Username</B></label>
      <input type="text" value=${username} class="form-control" id="username">
      
      <div style="margin-top:10px">
        Username should be unique : 
        <button type="button" class="btn btn-warning" id="checkUserName">Check</button>
      </div>

    </div>

    <div style="margin-top:30px" class="form-group">
      <label for="name"><B>Name</B></label>
      <input type="text" value=${name} class="form-control" id="name">
    </div>

    <div id="passContainer">

      <div style="margin-top:30px" class="form-group">
        <label for="pass"><B>Password</B></label>
        <input type="password" class="form-control" id="passCheck">
      </div>

      <div style="margin-top:10px">
        Please enter your password to activate password modification :
        <button type="button" class="btn btn-warning" id="activatePass">Activate</button>
      </div>

    </div>

    <div><button id="saveEdit" type="button" class="btn btn-primary" style="display:block;margin:auto;margin-top:40px">Save</button></div>
  `;
}

const editProfilPassword = (username, name) => {
  return `
  <div style="margin-top:30px" class="form-group">
    <label for="pass"><B>New password</B></label>
    <input type="password" class="form-control" id="pass" placeholder="new password" >
  </div>

  <div class="form-group">
    <input type="password" class="form-control" id="rePass" placeholder="Retype password" >
    <div id="badPass" style="color:brown">Password mismatch</div>
  </div>
  `;
}



