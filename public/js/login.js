
/**
 * @author Hutinet Maxime <maxime@hutinet.ch>
 * @author Foltz Justin <justin.foltz@gmail.com>
 */

$('.alert').hide();

$("#login").click( () => {
  if( !checkForm(["username","pass"]) ) {
    return;
  }
  $.post("/login", {
      username: String( $("#username").val() ),
      pass: String( $("#pass").val() )
  }, (data) => {
        localStorage.setItem('token', data.token);
        window.location = "/map";
  }).fail( () => {
    window.location = "/login";
  });
});


function checkForm(inputs) {
  return inputs.every( i => checkInput(i) );
}

function checkInput(input) {
  if($("#"+input).val() === "") {
    $("#"+input).removeClass('is-valid');
    $("#"+input).addClass('is-invalid');
    return false;
  }
  $("#"+input).removeClass('is-invalid');
  return true;
}



