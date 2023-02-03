document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archive').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#read-view").style.display = "none"

  // Make the nav menu link active
  var navbar_items = document.querySelectorAll(".item");
  navbar_items.forEach(element => {
    if(element.className === "nav-link h4 item active"){
      element.className = "nav-link h4 item";
    }
  })
  document.querySelector("#compose").className = "nav-link h4 item active"

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Upload the submitted form to the API
  document.querySelector("#compose-form").addEventListener("submit", () =>{
    var recipients = document.querySelector("#compose-recipients").value;
    var subject = document.querySelector("#compose-subject").value;
    var body = document.querySelector("#compose-body").value;

    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      load_mailbox("inbox");
    });
  })

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#read-view").style.display = "none"

  // Make the clicked option active
  var mailbox_options = ["inbox", "sent", "archive", "compose"]
  mailbox_options.forEach(element => {
    if(element === mailbox){
      document.querySelector(`#${element}`).className = "nav-link h4 item flex-sm-fill text-sm-center active";
    }
    else{
      document.querySelector(`#${element}`).className = "nav-link h4 item flex-sm-fill text-sm-center";
    }
  });

  // Get the emails from the API

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    var emails_list = document.querySelector("#emails-list");
    emails_list.innerHTML = "";
    for(let i = 0; i < emails.length; i++){
      let list_item = document.createElement("a");
      if(emails[i].read==true){
        list_item.className = "list-group-item list-group-item-action text-white bg-secondary";
      }
      else{
        list_item.className = "list-group-item list-group-item-action";
      }
      list_item.id = "email-item"
      list_item.href = "#"
      list_item.dataset.id = emails[i].id;
      list_item.innerHTML = `<h3 class="font-weight-bolder">${emails[i].sender}</h3><h5 class="font-weight-light my-0">${emails[i].subject}</h5><p class="mb-0 mt-2 font-weight-lighter">${emails[i].timestamp}</p>`;
      emails_list.append(list_item);
    }
    if(emails_list.innerHTML == ""){
      let message = document.createElement("h1");
      message.className = "";
      if(mailbox === "sent"){
        message.innerHTML = "You haven't sent any messages";
        emails_list.append(message);
      }
      else{
        message.innerHTML = `There are no messages in your ${mailbox}.`;
        emails_list.append(message);
      }
    }
    var email_items = document.querySelectorAll("#email-item");
    email_items.forEach(item => {
      item.addEventListener("click", () => read_email(item.dataset.id, mailbox));
    })
  });

}

function read_email(id, mailbox){
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#read-view").style.display = "block";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    var read_jumbotron = document.querySelector("#read-email-jumbotron");
    read_jumbotron.innerHTML = "";

    let sender_element = document.createElement("h1");
    sender_element.className = "display-4";
    sender_element.innerHTML = `From: ${email.sender}`;

    let recipients_element = document.createElement("p");
    recipients_element.className = "lead";
    recipients_element.innerHTML = `To: ${email.recipients}`;

    let after_recipients_element = document.createElement("hr");
    after_recipients_element.className = "mt-2 mb-3";

    let subject_element = document.createElement("h6");
    subject_element.className = "font-weight-normal mb-3";
    subject_element.innerHTML = `Subject: ${email.subject}`;

    let after_subject_element = document.createElement("hr");
    after_subject_element.className = "mt-2 mb-3";

    let body_element = document.createElement("p");
    body_element.className = "font-weight-light";
    body_element.innerHTML = email.body;

    let after_body_element = document.createElement("hr");
    after_body_element.className = "mt-2 mb-3";

    let timestamp_element = document.createElement("p");
    timestamp_element.className = "font-weight-lighter mb-0";
    timestamp_element.innerHTML = email.timestamp;

    let archive_button = document.createElement("button");
    if(mailbox === "inbox"){
      archive_button.innerHTML = "Archive";
      archive_button.className = "btn btn-primary mb-2";
    }
    else if(mailbox === "archive"){
      archive_button.innerHTML = "Unarchive";
      archive_button.className = "btn btn-secondary mb-2";
    }
    else{
      archive_button = null;
    }

    
    if(archive_button){
      read_jumbotron.append(sender_element, recipients_element, after_recipients_element, subject_element, after_subject_element, body_element, after_body_element, archive_button, timestamp_element,);
    }
    else{
      read_jumbotron.append(sender_element, recipients_element, after_recipients_element, subject_element, after_subject_element, body_element, after_body_element, timestamp_element,);

    }

    archive_button.addEventListener("click", () => {
      if(archive_button.innerHTML === "Archive"){
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: true,
          })
        })
        archive_button.className = "btn btn-secondary mb-2"
        archive_button.innerHTML = "Unarchive"
      }
      else{
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: false,
          })
        })
        archive_button.className = "btn btn-primary mb-2"
        archive_button.innerHTML = "Archive"
      }
    })

  })
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read:true
    })
  })
}