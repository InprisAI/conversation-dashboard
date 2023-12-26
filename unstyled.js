function makeTable(data) {

  $('#dashboard-table tbody').empty();
  var jsonData = {};
  try {
    jsonData = JSON.parse(data);
    // console.log(obj);
  } catch (error) {
      console.error("Error parsing JSON:", error);
  }

  for (i=0; i < jsonData["data"].length; i++) {
    var rowData = {}
    var currentRow = jsonData["data"][i];
    if (currentRow["tag"] == "Customer") {
      rowData["time"] = currentRow["time"]
      rowData["speaker"] = currentRow["tag"]
      rowData["conversation_id"] = jsonData["conversation_id"]
      rowData["analysis"] = "-"
      rowData["customer"] = "-"
      rowData["content"] = currentRow["content"]
    }
    else {  
      rowData["time"] = currentRow["time"]
      rowData["speaker"] = currentRow["tag"]
      rowData["conversation_id"] = jsonData["conversation_id"]
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

$("#refresh-button").click(function () {

  const prodURL = 'https://humains-core-dev.appspot.com/dashboard-conv' 
  const devURL = 'http://127.0.0.1:5000/dashboard-conv' 
  const params = {
    conversation_id : 'bvydjzvbyfjdgdX', //'GcD67kmvcdvuKvfcyJyyDvh',
    client_id : 'test:d4n4',
    state_name : 'D4N4_CHAT_STATE'
  }

  fullURL = `${prodURL}/${params["client_id"]}/${params["conversation_id"]}/${params["state_name"]}`
  
  fetchData(fullURL);
});
