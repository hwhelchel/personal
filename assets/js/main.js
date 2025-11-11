(() => {
  // Theme switch
  const root = document.body;
  const themeSwitch = document.getElementById("mood");
  const themeData = root.getAttribute("data-theme");

  if (themeSwitch) {
    initTheme(localStorage.getItem("theme"));
    themeSwitch.addEventListener("click", () =>
      toggleTheme(localStorage.getItem("theme"))
    );

    function toggleTheme(state) {
      if (state === "dark") {
        localStorage.setItem("theme", "light");
        root.removeAttribute("data-theme");
      } else if (state === "light") {
        localStorage.setItem("theme", "dark");
        document.body.setAttribute("data-theme", "dark");
      } else {
        initTheme(state);
      }
    }

    function initTheme(state) {
      if (state === "dark") {
        document.body.setAttribute("data-theme", "dark");
      } else if (state === "light") {
        root.removeAttribute("data-theme");
      } else {
        localStorage.setItem("theme", themeData);
      }
    }
  }

  // Contact form submission handler
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function(event) {
      event.preventDefault();

      const form = event.target;
      const formData = new FormData(form);
      const messageElement = document.getElementById("form-message");
      const submitButton = document.getElementById("submit-button");
      const originalButtonText = submitButton.textContent;

      // Hide any previous messages
      messageElement.style.display = "none";
      messageElement.textContent = "";

      // Show loading state
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      submitButton.style.opacity = "0.7";
      submitButton.style.cursor = "not-allowed";

      try {
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(formData).toString(),
        });

        if (response.ok) {
          // Success
          messageElement.style.display = "block";
          messageElement.style.backgroundColor = "#d4edda";
          messageElement.style.color = "#155724";
          messageElement.style.border = "1px solid #c3e6cb";
          messageElement.style.padding = "16px 20px";
          messageElement.style.lineHeight = "1.6";
          messageElement.innerHTML = "Thank you!<br>Your message has been sent successfully. I'll respond within 24-48 hours.";
          
          // Reset form
          form.reset();
          
          // Scroll to message
          messageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          // Error
          throw new Error("Form submission failed");
        }
      } catch (error) {
        // Show error message
        messageElement.style.display = "block";
        messageElement.style.backgroundColor = "#f8d7da";
        messageElement.style.color = "#721c24";
        messageElement.style.border = "1px solid #f5c6cb";
        messageElement.style.padding = "16px 20px";
        messageElement.style.lineHeight = "1.6";
        messageElement.innerHTML = "Oops!<br>There was a problem submitting your form. Please try again.";
        
        // Scroll to message
        messageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        submitButton.style.opacity = "1";
        submitButton.style.cursor = "pointer";
      }
    });
  }
})();
