const functionAsString = `function sendMessageAsHTML() {
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
    $('#pluginButton').hide();

    const successMessageTemplate = (
    '<div class="msg-dialog-success">' +
    ' <h1 class="alert alert-success">Meddelandet har skickats</h1>' +
    ' <p>Meddelandet skickades till:</p>' +
    ' <div class="labelbox"></div>' +
    '</div>');
    $('.modal-body').html(successMessageTemplate);
    const labelBox = document.getElementsByClassName("labelbox")[1];
    for (user of response.resultList) {
      let userLabel = document.createElement("span");
      userLabel.className = "label " + window.Progress.actorTypeToClass(user.actorType);
      userLabel.innerText = user.isGuardianString + " " + user.recipientItem.name;
      let labelMeta = document.createElement("span");
      labelMeta.className = "label-meta";
      labelMeta.innerText = "| " + user.messagesSent;
      userLabel.appendChild(labelMeta);
      labelBox.appendChild(userLabel);
    }
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

let scriptElement = document.createElement("script");
scriptElement.innerHTML = functionAsString;
scriptElement.type = "text/javascript";
document.head.appendChild(scriptElement); 

// The above script is injected into the document so that it can use jquery, which is already loaded into the Progress website.
// The function is simply a modified version of the normal message sending function where the body is taken directly without being HTML encoded.