(() => {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Theme switch
    const root = document.body;
    const themeSwitch = document.getElementById("mood");
    const themeData = root.getAttribute("data-theme");
    
    // Sync theme from html to body if html has it set (from head script)
    const htmlTheme = document.documentElement.getAttribute("data-theme");
    if (htmlTheme && !root.getAttribute("data-theme")) {
      root.setAttribute("data-theme", htmlTheme);
    }

    if (themeSwitch) {
      initTheme(localStorage.getItem("theme"));
      themeSwitch.addEventListener("click", () =>
        toggleTheme(localStorage.getItem("theme"))
      );

      function toggleTheme(state) {
        if (state === "dark") {
          localStorage.setItem("theme", "light");
          root.removeAttribute("data-theme");
          document.documentElement.removeAttribute("data-theme");
        } else if (state === "light") {
          localStorage.setItem("theme", "dark");
          document.body.setAttribute("data-theme", "dark");
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          initTheme(state);
        }
      }

      function initTheme(state) {
        if (state === "dark") {
          document.body.setAttribute("data-theme", "dark");
          document.documentElement.setAttribute("data-theme", "dark");
        } else if (state === "light") {
          root.removeAttribute("data-theme");
          document.documentElement.removeAttribute("data-theme");
        } else {
          localStorage.setItem("theme", themeData);
        }
      }
    }

    // SPA Navigation
    (function() {
      // Get current origin to check if link is internal
      const currentOrigin = window.location.origin;
      
      // Function to check if a link is internal
      function isInternalLink(link) {
        try {
          const url = new URL(link.href, window.location.href);
          return url.origin === currentOrigin && !link.hasAttribute('target') && !link.hasAttribute('download');
        } catch (e) {
          return false;
        }
      }

      // Function to update active menu link
      function updateActiveMenuLink(url) {
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
          const linkUrl = new URL(link.href, window.location.href).pathname;
          if (linkUrl === url || (url === '/' && linkUrl === '/')) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }

      // Function to extract content from HTML string
      function extractContent(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const wrapper = doc.querySelector('.wrapper');
        const title = doc.querySelector('title');
        return {
          content: wrapper ? wrapper.innerHTML : '',
          title: title ? title.textContent : document.title
        };
      }

      // Function to navigate to a new page
      async function navigateTo(url) {
        try {
          // Update URL without reload
          window.history.pushState({}, '', url);
          
          // Fetch the new page
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const html = await response.text();
          const { content, title } = extractContent(html);
          
          // Update page title
          document.title = title;
          
          // Update content
          const wrapper = document.querySelector('.wrapper');
          if (wrapper && content) {
            wrapper.innerHTML = content;
          }
          
          // Update active menu link
          updateActiveMenuLink(new URL(url, window.location.href).pathname);
          
          // Scroll to top
          window.scrollTo(0, 0);
          
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback to full page reload on error
          window.location.href = url;
        }
      }

      // Intercept link clicks
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        // Skip if modifier keys are pressed (Ctrl/Cmd for new tab, etc.)
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        
        // Skip if it's the theme toggle
        if (link.id === 'mood') return;
        
        // Only handle internal links
        if (isInternalLink(link)) {
          e.preventDefault();
          const url = link.href;
          navigateTo(url);
        }
      });

      // Handle browser back/forward buttons
      window.addEventListener('popstate', function(e) {
        navigateTo(window.location.href);
      });
    })();

    // Contact form submission handler (using event delegation for SPA navigation)
    document.addEventListener("submit", function(event) {
      const form = event.target;
      if (form.id !== "contact-form") return;
      
      event.preventDefault();

      const formData = new FormData(form);
      const messageElement = document.getElementById("form-message");
      const submitButton = document.getElementById("submit-button");
      const originalButtonText = submitButton ? submitButton.textContent : "Send Message";

      // Hide any previous messages
      if (messageElement) {
        messageElement.style.display = "none";
        messageElement.textContent = "";
        messageElement.className = "form-message";
      }

      // Show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        submitButton.style.opacity = "0.7";
        submitButton.style.cursor = "not-allowed";
      }

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
        .then(response => {
          if (response.ok) {
            // Success
            if (messageElement) {
              messageElement.style.display = "block";
              messageElement.className = "form-message success";
              messageElement.innerHTML = "Thank you!<br>Your message has been sent successfully. I'll respond within 24-48 hours.";
              
              // Scroll to message
              messageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
            
            // Reset form
            form.reset();
          } else {
            throw new Error("Form submission failed");
          }
        })
        .catch(error => {
          // Show error message
          if (messageElement) {
            messageElement.style.display = "block";
            messageElement.className = "form-message error";
            messageElement.innerHTML = "Oops!<br>There was a problem submitting your form. Please try again.";
            
            // Scroll to message
            messageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        })
        .finally(() => {
          // Reset button state
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
            submitButton.style.opacity = "1";
            submitButton.style.cursor = "pointer";
          }
        });
    });
  }
})();
