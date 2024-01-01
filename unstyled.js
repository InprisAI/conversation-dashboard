var currentUrl = '';
const prodURL = 'https://humains-core-dev.appspot.com/dashboard-conv';
const devURL = 'http://127.0.0.1:5000/dashboard-conv';
const client_id = 'test:d4n4';

function getFormattedDate(inputDateString){
  
  var dateObj = new Date(inputDateString);

  var day = ('0' + dateObj.getUTCDate()).slice(-2);
  var month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2);
  var year = dateObj.getUTCFullYear().toString().slice(-2);
  var hours = ('0' + dateObj.getUTCHours()).slice(-2);
  var minutes = ('0' + dateObj.getUTCMinutes()).slice(-2);
  var seconds = ('0' + dateObj.getUTCSeconds()).slice(-2);

  var formattedDate = day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + ':' + seconds;
  return formattedDate
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

  var keys = Object.keys(jsonData["data"]);
  for (var j = 0; j < keys.length; j++) {
    var key = keys[j];
    for (i=0; i < jsonData["data"][key].length; i++) {
      var newRow = $("<tr>");

      // var rowData = {}
      var currentRow = jsonData["data"][key][i];
      if (currentRow["tag"] == "Customer") {
        newRow.append($("<td >").text(getFormattedDate(currentRow["time"])))
        newRow.append($("<td >").text(currentRow["tag"]))
        newRow.append($("<td class='clickable-serach'>").text(key.substring(0,5)))
        newRow.append($("<td >").text("-"))
        newRow.append($("<td >").text("-"))
        newRow.append($("<td >").text(currentRow["content"]))
      }
      else {  
        newRow.append($("<td >").text(getFormattedDate(currentRow["time"])))
        newRow.append($("<td >").text(currentRow["tag"]))
        newRow.append($("<td class='clickable-serach'>").text(key.substring(0,5)))
        newRow.append($("<td >").text(currentRow["content"]["json_metadata"]["analysis"]))
        newRow.append($("<td >").text(currentRow["content"]["json_metadata"]["customer"]))
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

function refreshData() {

  fetchData(currentUrl);
}

$("#refresh-button").click(function () {
  // currentUrl = 'https://humains-core-dev.appspot.com/dashboard-conv?client_id=test:d4n4&phone_number=0508717899'
  refreshData()
});

function redirectToConversation(key){
  const url = `${prodURL}?client_id=${client_id}&conversation_id=${key}`
  fetchData(url)
}

$("#search-button").click(function () {
  // todo - get the data from search-input
  // determine if its phone number or IdleDeadlinecreate querystring and fetch
  var serchString = $('#search-input')[0].value
  var pattern = /[A-Za-z]/;
  if (pattern.test(serchString)) {
    currentUrl = `${prodURL}?client_id=${client_id}&conversation_id=${serchString}`
  } else {
    let phone = serchString.replace(/[-]/g, '')
    if (phone.startsWith('+972') || phone.startsWith('972')) 
      phone.replace(/^(\+972|972)/, '0');
    currentUrl = `${prodURL}?client_id=${client_id}&phone_number=${phone}`
  } 
  fetchData(currentUrl);
});

// var intervalId = setInterval(refreshData, 5000);

// $(document).ready(function() {

// })

