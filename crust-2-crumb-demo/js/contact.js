(function () {
  var form = document.getElementById("contact-form");
  var done = document.getElementById("contact-done");
  var error = document.getElementById("contact-error");
  var note = document.getElementById("catering-note");
  var topic = "";

  function setTopic(value) {
    topic = value;
    Array.prototype.forEach.call(document.querySelectorAll("[data-topic]"), function (button) {
      button.setAttribute("aria-checked", button.getAttribute("data-topic") === value ? "true" : "false");
    });
    note.hidden = value !== "catering";
  }

  document.body.addEventListener("click", function (event) {
    var choice = event.target.closest("[data-topic]");
    if (choice) setTopic(choice.getAttribute("data-topic"));
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("contact-name").value.trim();
    var email = document.getElementById("contact-email").value.trim();
    var message = document.getElementById("contact-message").value.trim();
    if (!name || !email || !message || !topic) {
      error.textContent = "Add your name, email, a topic, and a message.";
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
