var currentUrl = '';
const prodURL = 'https://humains-core-dev.appspot.com/dashboard-conv';
const devURL = 'http://127.0.0.1:5000/dashboard-conv';
const client_id = 'test:d4n4';

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
      var rowData = {}
      var currentRow = jsonData["data"][key][i];
      if (currentRow["tag"] == "Customer") {
        rowData["time"] = currentRow["time"]
        rowData["speaker"] = currentRow["tag"]
        rowData["conversation_id"] = key
        rowData["analysis"] = "-"
        rowData["customer"] = "-"
        rowData["content"] = currentRow["content"]
      }
      else {  
        rowData["time"] = currentRow["time"]
        rowData["speaker"] = currentRow["tag"]
        rowData["conversation_id"] = key
        rowData["analysis"] = currentRow["content"]["json_metadata"]["analysis"]
        rowData["customer"] = currentRow["content"]["json_metadata"]["customer"]
        rowData["content"] = currentRow["content"]["convers_content"]
      }
    
  
      // Create a new row element and populate it with the data
      var newRow = $("<tr>");
      $.each(rowData, function(key, value) {
          newRow.append($("<td>").text(value));
      });
    
      // Append the new row to the table's tbody
      $("#dashboard-table tbody").append(newRow);
    }
  }
}

function fetchData(url) {

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

function refreshData() {
  fetchData(currentUrl);
}

$("#refresh-button").click(function () {
  refreshData()
});

$("#search-button").click(function () {
  // todo - get the data from search-input
  // determine if its phone number or IdleDeadlinecreate querystring and fetch
  var serchString = $('#search-input')[0].value
  var pattern = /[A-Za-z]/;
  if (pattern.test(serchString)) {
    currentUrl = `${prodURL}?client_id=${client_id}&conversation_id=${serchString}`
  } else {
    currentUrl = `${prodURL}?client_id=${client_id}&phone_number=${serchString}`
  } 
  fetchData(currentUrl);
});

var intervalId = setInterval(refreshData, 5000);
