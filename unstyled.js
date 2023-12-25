const table = document.querySelector("#dashboard-table");
const tableHead = table.querySelector("thead");
const tableBody = table.querySelector("tbody");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");

const firstJson = 'https://storage.googleapis.com/humains-core-dev.appspot.com/dash_data/GcD67kmvcdvuKvfcyJyyDvh'

let lastHash = null;

function hashData(data) {
  let hash = 0,
    i, chr;
  if (data.length === 0) return hash;
  for (i = 0; i < data.length; i++) {
    chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function formatHeader(header) {
  return header.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}

function createTableHeaders(data) {
  const headers = Object.keys(data);
  const headerRow = tableHead.querySelector("tr");

  // Clear existing headers
  headerRow.innerHTML = "";

  // Add headers from JSON data
  headers.forEach(header => {
    headerRow.insertAdjacentHTML("beforeend", `<th>${formatHeader(header)}</th>`);
  });
}

function updateTable(id, data) {
  let existingRow = document.getElementById(id);

  if (existingRow) {
    // Update the existing row
    existingRow.innerHTML = '';
  } else {
    // Create a new row
    existingRow = document.createElement("tr");
    existingRow.id = id;
    tableBody.appendChild(existingRow);
  }

  for (const key in data) {
    const cellValue = key === 'conversation_sentiment' && (data[key].toLowerCase() === 'positive' || data[key].toLowerCase() === 'negative')
      ? `<span style="color: white;">${data[key]}</span>`
      : data[key];
    const cellColor = key === 'conversation_sentiment' && data[key].toLowerCase() === 'positive'
      ? 'green'
      : key === 'conversation_sentiment' && data[key].toLowerCase() === 'negative'
      ? 'red'
      : '';
    
    const headerExists = Array.from(tableHead.querySelectorAll("th")).some(th => formatHeader(key) === th.textContent);
    if (headerExists) {
      existingRow.insertAdjacentHTML("beforeend", `<td style="background-color: ${cellColor};">${cellValue}</td>`);
    }
  }
}

function makeTable(data) {

  var jsonData = {};
  try {
    jsonData = JSON.parse(data);
    // console.log(obj);
  } catch (error) {
      console.error("Error parsing JSON:", error);
  }

  for (i=0; i < jsonData["data"].length; i++) {

    var rowData = {
      client_id: jsonData["client_id"],
      conversation_id: jsonData["conversation_id"],
      analysis: jsonData["data"][i]["content"]["json_metadata"]["analysis"],
      customer: jsonData["data"][i]["content"]["json_metadata"]["customer"],
      step: jsonData["data"][i]["content"]["json_metadata"]["step"],
      content: jsonData["data"][i]["content"]["convers_content"],
      tag: jsonData["data"][i]["tag"]
    };
  
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
      debugger;

      // Handle the file contents here
      // console.log(fileContents);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

$("#refresh-button").click(function () {
  // const headers = new Headers();
  // headers.append('Content-Type', 'application/json');

  // const request = new Request(fileURL, {
  //   method: 'GET',
  //   headers: headers,
  //   body: JSON.stringify(params),
  // });

  const baseURL = 'http://127.0.0.1:5000/dashboard-conv'
  const params = {
    conversation_id : 'GcD67kmvcdvuKvfcyJyyDvh',
    client_id : 'test:d4n4',
    state_name : 'D4N4_CHAT_STATE'
  }

  fullURL = `${baseURL}/${params["client_id"]}/${params["conversation_id"]}/${params["state_name"]}`
  
  fetchData(fullURL);
});

// function fetchData(file) {
//  const URL = 'https://storage.googleapis.com/json_amit/' + file + '?t=' + new Date().getTime();
//   fetch(file)
//     // .then(response => response.json())
//     .then(fetchedData => {
//       if (!lastHash) {
//         // Create table headers based on the first item in the fetched data
//         createTableHeaders(fetchedData[0]);
//       }

//       const newHash = hashData(JSON.stringify(fetchedData));
//       if (newHash !== lastHash) {
//         lastHash = newHash;
//         tableBody.innerHTML = '';
//         fetchedData.forEach(event => {
//           updateTable(event.id.toString(), event);
//         });
//       }
//       setTimeout(() => fetchData(file), 5000); // Fetch data every 5 seconds
//     })
//     .catch(error => {
//       console.error('Error fetching data:', error);
//       setTimeout(() => fetchData(file), 5000);
//     });
// }
