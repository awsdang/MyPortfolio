(function () {
  "use strict";

  var dialog = document.getElementById("download-dialog");
  var form = document.getElementById("download-form");
  var phoneInput = document.getElementById("download-phone");
  var skillName = document.getElementById("selected-skill-name");
  var status = document.getElementById("download-status");
  var toast = document.getElementById("download-toast");
  var manualDownload = document.getElementById("manual-download");
  var submitButton = form ? form.querySelector('button[type="submit"]') : null;
  var closeButton = dialog ? dialog.querySelector("[data-dialog-close]") : null;
  var suggestDialog = document.getElementById("suggest-dialog");
  var suggestForm = document.getElementById("suggest-form");
  var suggestOpen = document.querySelector("[data-suggest-open]");
  var suggestClose = suggestDialog
    ? suggestDialog.querySelector("[data-suggest-close]")
    : null;
  var suggestionFields = document.getElementById("suggestion-fields");
  var addSuggestion = document.querySelector("[data-add-suggestion]");
  var suggestStatus = document.getElementById("suggest-status");
  var suggestSubmit = suggestForm
    ? suggestForm.querySelector('button[type="submit"]')
    : null;
  var selectedDownload = "";
  var toastTimer = null;

  if (
    !dialog ||
    !form ||
    !phoneInput ||
    !skillName ||
    !submitButton ||
    !manualDownload ||
    !suggestDialog ||
    !suggestForm ||
    !suggestOpen ||
    !suggestClose ||
    !suggestionFields ||
    !addSuggestion ||
    !suggestStatus ||
    !suggestSubmit
  )
    return;

  function prepareDownload(button) {
    selectedDownload = button.getAttribute("data-download") || "";
    skillName.textContent = button.getAttribute("data-skill") || "AI skill";
    manualDownload.href = selectedDownload;
    manualDownload.download =
      selectedDownload.split("/").pop() || "ai-skill.zip";
    manualDownload.hidden = true;
    status.textContent = "";
  }

  function openDialog() {
    submitButton.disabled = false;
    submitButton.innerHTML =
      'Continue to download <span aria-hidden="true">↓</span>';

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    window.setTimeout(function () {
      phoneInput.focus();
    }, 80);
  }

  function closeDialog() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  function startDownload(showDialogFeedback) {
    if (!selectedDownload) return;

    if (showDialogFeedback) {
      status.textContent = "Your download should be starting now.";
      manualDownload.hidden = false;
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Download again <span aria-hidden="true">↓</span>';
    }

    toast.textContent = skillName.textContent + " download started.";
    toast.classList.add("on");

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("on");
    }, 3200);

    /* Navigating directly to a ZIP is more reliable than a synthetic click in
       Chrome and Safari. ZIP responses download without replacing this page. */
    window.location.assign(selectedDownload);
  }

  function postToGoogle(action, fieldName, value) {
    var response = new URLSearchParams();
    response.append(fieldName, value);

    return window.fetch(action, {
      method: "POST",
      mode: "no-cors",
      body: response,
      keepalive: true,
    });
  }

  function openSuggestDialog() {
    suggestStatus.textContent = "";
    suggestSubmit.disabled = false;
    suggestSubmit.textContent = "Send suggestions";

    if (typeof suggestDialog.showModal === "function") {
      suggestDialog.showModal();
    } else {
      suggestDialog.setAttribute("open", "");
    }

    window.setTimeout(function () {
      var firstSuggestion = suggestionFields.querySelector(
        "[data-suggestion-input]",
      );
      if (firstSuggestion) firstSuggestion.focus();
    }, 80);
  }

  function closeSuggestDialog() {
    if (typeof suggestDialog.close === "function") {
      suggestDialog.close();
    } else {
      suggestDialog.removeAttribute("open");
    }
  }

  function resetAddedSuggestions() {
    suggestionFields
      .querySelectorAll("[data-added-suggestion]")
      .forEach(function (field) {
        field.remove();
      });
  }

  document.querySelectorAll("[data-download]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      prepareDownload(link);
      event.preventDefault();
      openDialog();
    });
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeDialog);
  }

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) closeDialog();
  });

  suggestOpen.addEventListener("click", openSuggestDialog);
  suggestClose.addEventListener("click", closeSuggestDialog);

  suggestDialog.addEventListener("click", function (event) {
    if (event.target === suggestDialog) closeSuggestDialog();
  });

  addSuggestion.addEventListener("click", function () {
    var currentFields = suggestionFields.querySelectorAll(
      "[data-suggestion-input]",
    );

    if (currentFields.length >= 5) {
      suggestStatus.textContent = "You can add up to five skills at once.";
      return;
    }

    var number = currentFields.length + 1;
    var label = document.createElement("label");
    label.setAttribute("data-added-suggestion", "");

    var labelText = document.createElement("span");
    labelText.textContent = "Skill " + number;

    var input = document.createElement("input");
    input.type = "text";
    input.maxLength = 100;
    input.placeholder = "Another skill";
    input.setAttribute("data-suggestion-input", "");

    label.appendChild(labelText);
    label.appendChild(input);
    suggestionFields.appendChild(label);
    input.focus();
  });

  suggestForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var suggestions = Array.prototype.map
      .call(
        suggestionFields.querySelectorAll("[data-suggestion-input]"),
        function (input) {
          return input.value.trim();
        },
      )
      .filter(Boolean);

    if (!suggestions.length) return;

    suggestSubmit.disabled = true;
    suggestSubmit.textContent = "Sending…";
    suggestStatus.textContent = "Saving your suggestions…";

    postToGoogle(
      suggestForm.action,
      "entry.2123198609",
      "AI skill suggestion: " + suggestions.join(", "),
    ).catch(function () {
      /* Keep the thank-you state; the public form may be briefly unavailable. */
    });

    suggestStatus.textContent =
      "Thanks — sent as: " + suggestions.join(", ");
    suggestSubmit.textContent = "Sent ✓";
    suggestForm.reset();
    resetAddedSuggestions();

    window.setTimeout(function () {
      closeSuggestDialog();
      suggestSubmit.disabled = false;
      suggestSubmit.textContent = "Send suggestions";
      suggestStatus.textContent = "";
    }, 1500);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = "Preparing your ZIP…";
    status.textContent = "Saving your response…";

    /* A no-cors, keepalive POST is the supported static-site pattern for
       Google Forms. The responder form itself must be published publicly. */
    postToGoogle(form.action, phoneInput.name, phoneInput.value.trim()).catch(
      function () {
        /* The download stays available even if Google is temporarily down. */
      },
    );

    /* Run inside the original submit gesture so browsers do not block it. */
    startDownload(true);
  });
})();
