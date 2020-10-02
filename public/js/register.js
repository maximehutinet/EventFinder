
/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

$("#conflict").hide();
$("#badPass").hide();

$("#register").click( () => {
  if( checkForm(["username", "name", "pass", "rePass"]) && checkPassMatches()) {
    $.post("/register", { 
        username: String( $("#username").val() ),
        name:     String( $("#name").val() ),
        pass:     String( $("#pass").val() )
      }, () => { window.location = "/login"; }
    ).fail( (data) => {
      if( data.statusText === "Conflict") {
        unvalidate("username");
        $("#conflict").show();
      }
    });
  }
});


function checkForm(inputs) {
  return inputs.every( i => checkInput(i) );
}

function checkPass() {
  return $("#rePass").val() === $("#pass").val();
}

function checkInput(input) {
  if($("#"+input).val() === "") {
    unvalidate(input)
    return false;
  }
  validate(input)
  return true;
}

function unvalidate(input) {
  $("#"+input).removeClass('form-control  is-valid');
  $("#"+input).addClass('form-control  is-invalid');
}

function validate(input) {
  $("#"+input).removeClass('form-control  is-invalid');
  $("#"+input).addClass('form-control is-valid');
}

$('#rePass').on('input', function() {
  checkPassMatches();
});

function checkPassMatches() {
  if( $("#pass").val() !== "" && !checkPass() ) {
    $("#rePass").removeClass('form-control is-valid');
    $("#rePass").addClass('form-control is-invalid');
    $("#badPass").show();
    return false;
  } else {
    $("#rePass").removeClass('form-control is-invalid');
    $("#rePass").addClass('form-control is-valid');
    $("#badPass").hide();
    return true;
  }
}

