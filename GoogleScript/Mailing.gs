/************* REQUIRES MAILGUN ************/

/*
 * dict[data] -> str
 * create a mail subject according to data
 */
function buildMailSubject(data) 
{
  var subject = "";
  
  if(data.from == '' || data.to == '')
  {
    subject = "Ton planning Parkours";
  }
  else
  {
    subject = "Ton planning Parkours du " + data.from + " au " + data.to;
  }
  
  return subject;
}

/*
 * str, dict[data] -> str
 * Generate a mail body with a HTML template
 */
function buildMailBody(fileName, data) 
{
  var htmlTemplate = HtmlService.createTemplateFromFile(fileName);
  
  htmlTemplate.data = data;
  
  return htmlTemplate.evaluate().getContent();
}

/*
 * str, str, str, str -> void
 * Send an email
 */
function sendEmail(from, to, subject, body)
{
  if (from == null || from == "" || to == null || to == "")
    {
      return;
    }
  
  var payload = {
   'from': from,
   'to': to,
   'html': body,
   'subject': subject
 };
 var options = {
   'method' : 'post',
   'contentType': 'application/x-www-form-urlencoded',
   'headers': {
     "Authorization": "Basic " + Utilities.base64Encode('api' + ":" + env.mailgun_key)
   },
   'payload' : payload
 };
  var response = UrlFetchApp.fetch(env.mailgun_api+'/messages', options);

  // error message
  if (response.getResponseCode() !== 200) 
  { 
    throw new Error('L\'envoi d\'email n\'a pas fonctionné'); 
  }
}
