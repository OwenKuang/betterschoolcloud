function twofunctions() {
  calculate();
  let sum = 0;
  let count = 0;
  const marks = document.querySelectorAll(".newmark");
  for (let i = 0; i < marks.length; i++) {
    const input2 = parseFloat(marks[i].value);
    if (!isNaN(input2)) {
      sum += input2;
      count += 1;
    }
  }
  let av = sum / count;
  av = parseFloat(av.toFixed(2));
  const resultElement = document.querySelector(".unweightedmark");
  resultElement.innerHTML = '<span class ="unweightedmark" style="color:black"><b>' + av + " (Unweighted)" + '<weighted></span>';
}

function calculate() {
  let newsum = 0;
  let count = 0;
  const input = document.querySelectorAll(".newmark");
  const weightings = document.querySelectorAll("#weights");
  for (let j = 0; j < weightings.length; j++) {
    const weightings1 = parseFloat(weightings[j].value);
    const input1 = parseFloat(input[j].value);
    if (!isNaN(weightings1) && !isNaN(input1)) {
      newsum += weightings1 * input1;
      count += weightings1;


    }
    let average = newsum / count;
    average = parseFloat(average.toFixed(2));
    // Update the page with the new result
    const resultElement = document.querySelector(".newweightedmark");
    resultElement.innerHTML = '<span class ="newweightedmark" style="color:black"><b>' + average + " (Weighted)" + '</b></span>';
  }
}

// average grade calculator
console.log("Developed by: Owen Kuang | Special Thanks To: Youssef Soliman")
const gradeCells = document.querySelectorAll('td[data-url-dialog] span');
const remakerows = document.querySelectorAll('.studentcoursedetail tbody tr');
let average = 0;
let newsum = 0;
let sum = 0;
let count = 0;

remakerows.forEach(mark => {
  const currentMark = mark.querySelector('td:nth-child(3)')

  // get the grade value
  const grade = currentMark.textContent.trim()

  var isrealgrade = parseInt(grade)
  if (Number.isInteger(isrealgrade) == true && grade.includes("-") == false) {
    // create a new input element
    newgrade = isrealgrade
    const input = document.createElement('input')
    input.type = 'text'
    input.value = grade
    input.classList.add('newmark');
    input.style.width = "20%";
    input.style.height = "15%";

    // create a new td element
    const td = document.createElement('td')
    // Add the class 'newmark' to the td element

    // append the input element to the td element
    td.appendChild(input);

    // replace the "Current Mark" td element with the new td element
    currentMark.replaceWith(td);

    sum += newgrade;
    count++;

  }
})

// Calculate the average grade

av = sum / count;
average = parseFloat(average.toFixed(2));
av = parseFloat(av.toFixed(2));

//makes the bottom bar thing
var tbodyRef = document.querySelector('.studentcoursedetail');

// Insert a row at the end of table
var newRow = tbodyRef.insertRow();

// Insert cells into the row
var newCell1 = newRow.insertCell();
var newCell2 = newRow.insertCell();
var newCell3 = newRow.insertCell();
var newCell4 = newRow.insertCell();


// Add content to the cells
newCell1.innerHTML = '<span style="color:black" style="font-weight:bold" ><b>Averages</b></span>';
// newCell2.innerHTML = '<a style="color:black" class="icon-mail" href="mailto:owen.kuang@webberacademy.ca"><b>Email me any feedback or bugs! - owen.kuang52@gmail.com</b></a>';
newCell3.innerHTML = '<span class ="unweightedmark" style="color:black"><b>' + av + " (Unweighted)" + '<b/></span>';
newCell4.innerHTML = '<span style="color:black" class ="newweightedmark" ><b>' + average + " (Weighted)" + '</b></span>';


//makes the new mark section
// Get the table element by its class name
const tableh = document.querySelector('.studentcoursedetail');

// Get the first tr element within the table's thead element
const tr = tableh.querySelector('thead tr');

// Add an ID to the first tr element
tr.id = 'first-row';

// Or add a class to the first tr element
tr.classList.add('first-row');
// get the table element
var tabley = document.querySelector('.studentcoursedetail');

// get the first row of the table
var firstRow = tabley.querySelector('#first-row');

// create a new table cell element for the "New Mark" column header
var newMarkCell = document.createElement('th');
newMarkCell.textContent = 'Weight';
// insert the new table cell element after the "Current Mark" column header
firstRow.children[2].insertAdjacentElement('afterend', newMarkCell);

// loop through the table rows and add a new table cell element for each row in the "New Mark" column

// loop through the table rows and add a new table cell element for each row in the "New Mark" column



//makes the weight inputter


// Get the table element
const table = document.querySelector('.studentcoursedetail');
const rows = table.querySelectorAll('tr.my-button');
let countwe = 0
let weightslist = []
for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const tds = row.querySelectorAll('td');

  for (let j = 2; j < tds.length; j += 3) {
    const thirdTd = tds[j];
    const inputs = thirdTd.querySelectorAll('input');

    if (inputs.length > 0) {
      if (localStorage.getItem('weightList')) {
        weightslist = JSON.parse(localStorage.getItem('weightList'));

      } else {
        weightslist.push(1)
      }

      const cell = document.createElement('td');
      const input = document.createElement('input');
      input.id = 'weights';
      input.style.width = '20%';
      input.style.height = '15%';
      input.type = 'text';
      input.inputmode = 'numeric';
      input.value = weightslist[countwe];
      countwe = countwe + 1
      cell.appendChild(input);
      row.insertBefore(cell, thirdTd.nextElementSibling);

    } else {
      const cell = document.createElement('td');
      row.insertBefore(cell, thirdTd.nextElementSibling);
    }
  }
}

//makes the newmark inputter
// calculates the new grade with weighting 
// Add event listener to the table element
const givemoreevents = document.querySelectorAll("#weights")
const giveevents = document.querySelectorAll('.newmark');
giveevents.forEach(giveevent => {
  giveevent.addEventListener("input", twofunctions);

});
givemoreevents.forEach(givemoreevent => {
  givemoreevent.addEventListener("input", calculate)

});
// information slide 
//makes the stuff closer together
// get all input elements with class "newmark"
const inputElements = document.querySelectorAll('input.newmark');

// remove box-shadow from each input element
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
  input.style.borderColor = 'transparent';

});
calculate();

// removes the top thing idk what it is
// makes the table a little bit better looking
const table1 = document.querySelector('table');
table1.style.width = "97%";
table1.style.margin = "auto";
table1.style.borderRadius = "5px";
table1.style.overflow = "hidden";
table1.deleteRow(0);
const heightoftable = 1.5 * (table1.clientHeight);
const longer = document.querySelector(".noPrint");
longer.style.height = heightoftable + "px";


// Get the table element
// removes the last td 
// Get the last row in the table body
const lastRow = table1.tBodies[0].lastElementChild;

// Remove the last td element from the last row
lastRow.removeChild(lastRow.lastElementChild);