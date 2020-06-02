window.addEventListener("click", () => {
  setTimeout(handleButtonVisibility, 200);
  setTimeout(handleButtonVisibility, 500); // Execute a second time if computer is too slow and haven't had time to add modal
});

const scriptString = `
function sendMessageAsHTML() {
  var $form = $("#newMessageForm");

  if ($form.valid() === false) {
    return false;
  }

  if ($("#SendToRedirectDiv").length) {
    if ($("#SendToRedirectDiv input[type=checkbox]:checked").length === 0) {
      $("#SendToRedirectError").text("Minst en mottagare måste anges");
      return false;
    }
  }
  if ($("#msgRecipients").tagsinput('items').length === 0) {
    $("#dlg_errorMessage").text('Minst en mottagare måste väljas.').show(400, function() {});
    return false;
  }

  var formData = new FormData();
  formData.append("Subject", htmlEncode($('#Subject').val()));
  formData.append("Body", "<noscript> Detta meddelande har skickats som HTML med Progress Messenger och kanske inte fungerar ordentligt på mobil. För att se meddelandet gå in på https://progress.thorengruppen.se </noscript>\\n" + $('#Body').val() );
  formData.append("SendMail", $('#SendMail:checked').length > 0);
  formData.append("OtherRecipientsHiddenForRecipients", $('#OtherRecipientsHiddenForRecipients:checked').length > 0);

  $("#newMessageForm").find('input[name=SendToRedirect]:checked').each(function(i, x) {
    console.log('SendToRedirectDiv', x.value);
    formData.append("SendToRedirect", htmlEncode(x.value));
  });

  $("#newMessageForm").find("input[type=file]").each(function(i, x) {
    formData.append("files", x.files[0]);
  });

  $.each(actorList, function(i, a) {
    formData.append("Recipients[" + i + "].Name", a.name);
    formData.append("Recipients[" + i + "].ClassName", a.className);
    formData.append("Recipients[" + i + "].ActorType", a.actorType);
    formData.append("Recipients[" + i + "].Id", a.id);
    formData.append("Recipients[" + i + "].Role", a.role);
    formData.append("Recipients[" + i + "].Username", a.username);
    formData.append("Recipients[" + i + "].UserType", a.userType);
  });

  setModalLoadingState('dlgModalState', 'loading');

  $.ajax({
    type: 'POST',
    url: window.progressContext.schoolApiBaseUrl + '/messages/sendWithFiles',
    data: formData,
    processData: false,
    contentType: false,
    traditional: true
  }).done(function(response) {
    // Close the dialog
    $('#btnDlgSubmit').hide();
    $('.modal-body').html('' +
      '<div class="msg-dialog-success">' +
      Handlebars.compile($('#send-result-template').html())(response) +
      '</div>');
    setModalLoadingState('dlgModalState', 'hidden');
  }).fail(function(jqXHR) {
    if (jqXHR.responseJSON) {
      $("#dlg_errorMessage").text(jqXHR.responseJSON.detail || jqXHR.responseJSON.title).show(400, function() {});
    } else {
      $("#dlg_errorMessage").text('Ett oväntat fel har inträffat.').show(400, function() {});
    }
    setModalLoadingState('dlgModalState', 'hidden');
  });

  return false;
}`

const newScript = document.createElement("script");
newScript.innerHTML = scriptString;
newScript.type = "text/javascript";
document.getElementsByTagName("head")[0].appendChild(newScript);

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