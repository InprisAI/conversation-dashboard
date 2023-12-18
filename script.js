const table = document.querySelector("#dashboard-table");
const tableHead = table.querySelector("thead");
const tableBody = table.querySelector("tbody");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");

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

function fetchData(file) {
  fetch('https://storage.googleapis.com/json_amit/' + file + '?t=' + new Date().getTime())
    .then(response => response.json())
    .then(fetchedData => {
      if (!lastHash) {
        // Create table headers based on the first item in the fetched data
        createTableHeaders(fetchedData[0]);
      }

      const newHash = hashData(JSON.stringify(fetchedData));
      if (newHash !== lastHash) {
        lastHash = newHash;
        tableBody.innerHTML = '';
        fetchedData.forEach(event => {
          updateTable(event.id.toString(), event);
        });
      }
      setTimeout(() => fetchData(file), 5000); // Fetch data every 5 seconds
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setTimeout(() => fetchData(file), 5000);
    });
}

function search() {
  const searchValue = parseInt(searchInput.value.trim());
  const rows = tableBody.querySelectorAll("tr");

  rows.forEach(row => {
    const id = parseInt(row.querySelector("td").textContent);
    if (searchValue && id !== searchValue) {
      row.style.display = "none";
    } else {
      row.style.display = "";
    }
  });
}

searchInput.addEventListener("input", search);
searchButton.addEventListener("click", search);

fetchData('data5.json');