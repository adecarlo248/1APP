(function () {
  var form = document.getElementById("contact-form");
  var done = document.getElementById("contact-done");
  var error = document.getElementById("contact-error");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("contact-name").value.trim();
    var phone = document.getElementById("contact-phone").value.trim();
    var email = document.getElementById("contact-email").value.trim();
    var details = document.getElementById("contact-details").value.trim();
    var location = document.getElementById("contact-location").value.trim();
    var when = document.getElementById("contact-when").value.trim();
    if (!name || !phone || !email || !details || !location || !when) {
      error.textContent = "Add your name, phone number, email, event details, location, and time and date.";
      return;
    }
    if (email.indexOf("@") < 1) {
      error.textContent = "That email needs an @.";
      return;
    }
    error.textContent = "";
    form.hidden = true;
    done.hidden = false;
  });
})();
