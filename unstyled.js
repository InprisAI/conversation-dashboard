var currentUrl = '';
var g_phone = '';
const prodURL = 'https://chatwith.humains.com'
const devURL = 'https://humains-core-dev.appspot.com';
const localURL = 'http://127.0.0.1:5000';
var g_url = prodURL;
// const prodURL = 'http://127.0.0.1:5000'; 
const client_id = 'test:d4n4';

function getFormattedDate(inputDateString){
  
  var dateObj = new Date(inputDateString);


  dateObj.setUTCHours(dateObj.getUTCHours() + 2);

  var day = ('0' + dateObj.getUTCDate()).slice(-2);
  var month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2);
  var year = dateObj.getUTCFullYear().toString().slice(-2);
  var hours = ('0' + dateObj.getUTCHours()).slice(-2);
  var minutes = ('0' + dateObj.getUTCMinutes()).slice(-2);
  var seconds = ('0' + dateObj.getUTCSeconds()).slice(-2);

  var formattedDate = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  return formattedDate
}

function getSortedKeys(obj){
  var keys = Object.keys(obj);

  keys.sort(function(key1, key2) {

      var time1 
      var time2 
      try{ 
        time1 = obj[key1][0].time ? new Date(obj[key1][0].time) : new Date(0); 
      }
      catch { 
        time1 = new Date(0); 
      }
      try{ 
        time2 = obj[key2][0].time ? new Date(obj[key2][0].time) : new Date(0);
      }
      catch{
        time2 = new Date(0);
      }
      // Compare the time values in reverse order (latest to soonest)
      return time2 - time1;

  });

  return keys;

}

function makeTable(data) {
  $('#dashboard-table tbody').empty();
  var jsonData = {};
  try {
    jsonData = JSON.parse(data);
    // console.log(obj);
  } catch (error) {
      console.error("Error parsing JSON:", error);
  }

  // var keys = Object.keys(jsonData["data"]);
  var keys = getSortedKeys(jsonData["data"])
  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    for (i=0; i < jsonData["data"][key].length; i++) {
      var newRow = $("<tr>");

      // var rowData = {}
      var currentRow = jsonData["data"][key][i];
      if (currentRow["tag"] == "Customer") {
        newRow.append($("<td >").text(getFormattedDate(currentRow["time"])))
        newRow.append($("<td >").text(currentRow["tag"]))
        newRow.append($("<td class='clickable-serach'>").text(key)) // .substring(0,5)
        newRow.append($("<td >").text("-"))
        newRow.append($("<td >").text("-"))
        newRow.append($("<td >").text(currentRow["content"]))
      }
      else {  
        newRow.append($("<td >").text(getFormattedDate(currentRow["time"])))
        newRow.append($("<td >").text(currentRow["tag"]))
        newRow.append($("<td class='clickable-serach'>").text(key)) // .substring(0,5)
        newRow.append($("<td >").text(currentRow["content"]["json_metadata"]["analysis"]))
        newRow.append($("<td >").text( (currentRow["content"]["json_metadata"]["confirmed_name"] || "-")))
        newRow.append($("<td >").text(currentRow["content"]["convers_content"]))
      }
    
      // Create a new row element and populate it with the data
      // var newRow = $("<tr>");
      // $.each(rowData, function(key, value) {

      //     newRow.append($("<td >").text(value));
      // });

    
      // Append the new row to the table's tbody
      $("#dashboard-table tbody").append(newRow);
    }
  }

  $('.clickable-serach').on('click', function() {
    redirectToConversation(key)
  });
}

function fetchData(url) {
  if (url.length > 10){
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text(); // You can also use response.json() for JSON data
      })
      .then((fileContents) => {
        makeTable(fileContents);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

$(document).ready(function() {
  // Check if the URL contains '/dev' after 'url.com'
  if (window.location.href.includes('dev')) {
      g_url = devURL;
      var h2Element = $('<h2>', {
          text: 'Development environment'
      }).css('color', 'red')
      .css('font-size', '44px'); 

      // Append the <h2> element to the body or any other container
      $('body').prepend(h2Element);
  }
});

function refreshData() {

  fetchData(currentUrl);
}

$("#refresh-button").click(function () {
  // currentUrl = 'https://humains-core-dev.appspot.com/dashboard-conv?client_id=test:an3el2&conversation_id=htdsbgsdbg' htdsbgsdbg an3el2 
  refreshData()
});

function redirectToConversation(key){
  const url = `${g_url}/dashboard-conv?client_id=${client_id}&conversation_id=${key}`
  fetchData(url)
}


$("#sms-button").click(function () {

  let longUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScMcrZVNrUm-V4tV-0mc3GBQ3rG23v1BUCngBHfyqx-ViqCmw/viewform'
  let shortUrl = 'https://shorturl.at/vCGKV'

  text = 'תודה שהשתתפתם בניסוי שיחה עם רובוט לסיוע מערך הגביה. נשמח אם תוכלו לדרג את החוויה בטופס המצ"ב.'
  text2 = 'יתכן שנתקשר אליכם שוב בימים הקרובים לאחר ביצוע עדכונים במערכת'

  fullText = `${text}\n\n${text2}\n\n${shortUrl}`

  if (g_phone){ 
    const url = g_url + '/send_sms?to=' + g_phone + '&text=' + fullText
    $.get(url, function(data, status) {
        console.log('Status:', status);
        console.log('Data:', data);
    }).fail(function(xhr, status, error) {
      // Handle error situation
      console.log('Error:', status, error);
    });
  }
})

$("#hangup-button").click(function () {
  let phone = g_phone
  if (phone.startsWith('0'))
    phone = phone.replace(/^0/, "972")

  console.log('hangup-button')
  const hangupUrl = g_url + '/twilio_hangup?phone=' + phone
  $.get(hangupUrl, function(data, status) {
      console.log('Status:', status);
      console.log('Data:', data);

      const unhangupUrl = g_url + '/twilio_cancel_hangup?phone=' + phone
      setTimeout(function() {
        $.get(unhangupUrl, function(data, status) {
            console.log('Status:', status);
            console.log('Data:', data);
        }).fail(function(xhr, status, error) {
            // Handle error situation
            console.log('Error:', status, error);
        });
    }, 5000);

      // Process the response data here
      // For example, display it in the console or on the webpage
  }).fail(function(xhr, status, error) {
      // Handle error situation
      console.log('Error:', status, error);
  });
  
})

$("#search-button").click(function () {
  var serchString = $('#search-input')[0].value
  var pattern = /[A-Za-z]/;
  if (pattern.test(serchString)) {
    currentUrl = `${g_url}/dashboard-conv?client_id=${client_id}&conversation_id=${serchString}`
  } else {
    let phone = serchString.replace(/[-]/g, '')
    if (phone.startsWith('+972') || phone.startsWith('972')) 
      phone.replace(/^(\+972|972)/, '0');
    g_phone = phone;
    currentUrl = `${g_url}/dashboard-conv?client_id=${client_id}&phone_number=${phone}`
  } 
  fetchData(currentUrl);
});

var intervalId = setInterval(refreshData, 5000);
