window.addEventListener("click", () => {
  setTimeout(handleButtonVisibility, 200);
  setTimeout(handleButtonVisibility, 500); // Execute a second time if computer is too slow and haven't had time to add modal
});

function handleButtonVisibility() { // Add or hide button depending on when it is needed
  const messageButtonsContainers = document.getElementsByClassName("modal-footer");
  const messageSendButton = document.getElementById("btnDlgSubmit");

  if (messageButtonsContainers.length > 0 && messageSendButton) {
    if (document.getElementById("pluginButton")) {
      if (messageSendButton.style.cssText === "display: none;") {
        document.getElementById("pluginButton").style.cssText = "display: none;";
      }
      return false; // Don't add new button if one already exists
    }

    const newButton = document.createElement("div");
    newButton.className = messageSendButton.className;
    newButton.id = "pluginButton";
    newButton.setAttribute("onClick","sendMessageAsHTML()");
    newButton.innerHTML = "<span class='glyphicon glyphicon-send'></span>  Skicka som HTML"; // span tag gives the little paper airplane icon

    messageButtonsContainers[1].insertBefore(newButton, messageSendButton);
  }
}