const studentdetail = document.querySelector(".studentdetailfull");
const numberofli = studentdetail.querySelectorAll("li");
var studentinfo = "User Information: ";

for (let i = 0; i < numberofli.length; i++){
    studentinfo = studentinfo + numberofli[i].textContent + " | ";
}

const buttons = document.querySelectorAll('.my-button');
let dont = 0;
buttons.forEach(button => {
  button.style.border = 'none';
  if (dont == 0 || dont ==  1) {
    dont++; 
  } else {
    button.style.backgroundImage = 'none';
    dont++; 
  }
});

const removethead = document.querySelector("thead");
const numberoftr = removethead.querySelectorAll("tr");


const removetbod = document.querySelector("tbody")
const emptyclass = removetbod.querySelector("tr");
const numberoftd = emptyclass.querySelectorAll("td");


emptyclass.removeChild(numberoftd[0]);

const appendthead = document.createElement('tr');
appendthead.style.width = "2000px";
appendthead.style.backgroundColor = 'rgba(255, 255, 255, .8)'
appendthead.classList.add("userinfo");

const cell = document.createElement('td');
cell.style.textAlign = "center";
cell.textContent = studentinfo;

appendthead.appendChild(cell);
removethead.appendChild(appendthead);

//background changer and weight buttons
// Create a weight saver button 
const saveWeightButton = document.createElement('button');
saveWeightButton.textContent = 'Save';
saveWeightButton.style.padding = '8px 12px';
saveWeightButton.style.fontSize = '13px';
saveWeightButton.style.border = '1px solid #ccc';
saveWeightButton.style.borderRadius = '9px';
saveWeightButton.style.backgroundColor = '#fff';
saveWeightButton.style.marginRight = '15px';

// Create the button to change the background image
const changeBackgroundButton = document.createElement('button');
changeBackgroundButton.textContent = 'Change';
changeBackgroundButton.style.padding = '8px 12px';
changeBackgroundButton.style.fontSize = '13px';
changeBackgroundButton.style.border = '1px solid #ccc';
changeBackgroundButton.style.borderRadius = '6px';
changeBackgroundButton.style.backgroundColor = '#fff';
changeBackgroundButton.style.marginRight = '15px';

// Create the button to save the background image
const saveBackgroundButton = document.createElement('button');
saveBackgroundButton.textContent = 'Save';
saveBackgroundButton.style.padding = '8px 12px';
saveBackgroundButton.style.fontSize = '13px';
saveBackgroundButton.style.border = '1px solid #ccc';
saveBackgroundButton.style.borderRadius = '6px';
saveBackgroundButton.style.backgroundColor = '#fff';
saveBackgroundButton.style.marginRight = '15px';

// Create the button to reset the background image
const resetBackgroundButton = document.createElement('button');
resetBackgroundButton.textContent = 'Reset';
resetBackgroundButton.style.padding = '8px 12px';
resetBackgroundButton.style.fontSize = '13px';
resetBackgroundButton.style.border = '1px solid #ccc';
resetBackgroundButton.style.borderRadius = '6px';
resetBackgroundButton.style.backgroundColor = '#fff';
resetBackgroundButton.style.marginRight = '10px';



// Insert a row at the end of table
var tbodyRef = document.querySelector('.studentcoursedetail');

// Insert a row at the end of table
var newRow = tbodyRef.insertRow();

// Insert cells into the row
var newCell1 = newRow.insertCell();
var newCell2 = newRow.insertCell();
var newCell3 = newRow.insertCell();
var newCell4 = newRow.insertCell();
newCell1.innerHTML = '<span style="color:black" style="font-weight:bold" ><b>Background Settings</b></span>';
newCell2.appendChild(changeBackgroundButton);
newCell2.appendChild(saveBackgroundButton);
newCell2.appendChild(resetBackgroundButton);
newCell3.innerHTML = '<span style="color:black" style="font-weight:bold" ><b>Weight Settings</b></span>';
newCell4.appendChild(saveWeightButton);

// replace background 
const addclassbody = document.querySelector('body')
addclassbody.classList.add("bg")
const replacebackground = document.querySelector(".bg");

// Function to handle the change background button click
changeBackgroundButton.addEventListener('click', () => {
  changeBackgroundButton.style.backgroundColor = '#ccc';
  setTimeout(function() {
  changeBackgroundButton.style.backgroundColor = '#fff';
  }, 150)
  const backgroundImageInput = document.createElement('input');
  backgroundImageInput.type = 'file';
  backgroundImageInput.accept = 'image/*';
  backgroundImageInput.addEventListener('change', () => {
    const file = backgroundImageInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      replacebackground.style.backgroundImage = `url(${reader.result})`;
      replacebackground.style.backgroundSize = "cover";
    };
  });
  backgroundImageInput.click();
});
let weightList = [];

// Check if there's any cached data in localStorage

// Add an event listener to the save weight button
saveWeightButton.addEventListener('click', () => {

  let findweights = document.querySelectorAll("#weights");
  saveWeightButton.style.backgroundColor = '#ccc';
  setTimeout(function() {
    saveWeightButton.style.backgroundColor = '#fff';
  }, 150)

  for (let i = 0; i < findweights.length; i++) {
    const weightValue = findweights[i].value;
    if (weightValue !== '') {
      weightList.push(parseFloat(weightValue));
    }

  }
  // Store the updated weightList in localStorage
  localStorage.setItem('subweightlist' , JSON.stringify(weightList));
  localStorage.setItem('weightList', JSON.stringify(weightList));
  

});

// Function to handle the save background button click
saveBackgroundButton.addEventListener('click', () => {
  saveBackgroundButton.style.backgroundColor = '#ccc';
  setTimeout(function() {
    saveBackgroundButton.style.backgroundColor = '#fff';
  }, 150)
  localStorage.setItem('backgroundImage', replacebackground.style.backgroundImage);

});

// Function to handle the reset background button click
resetBackgroundButton.addEventListener('click', () => {
  resetBackgroundButton.style.backgroundColor = '#ccc';
  setTimeout(function() {
    resetBackgroundButton.style.backgroundColor = '#fff';
  }, 150)
  localStorage.removeItem('backgroundImage');
  replacebackground.style.backgroundImage = '';

});

// Load the saved background image on page load
const savedBackgroundImage = localStorage.getItem('backgroundImage');
if (savedBackgroundImage) {
  replacebackground.style.backgroundImage = savedBackgroundImage;
  replacebackground.style.backgroundRepeat = "no-repeat";
  replacebackground.style.backgroundSize = "cover";
}

// Changes the background of the marks to semi transparent

var firstTable = document.querySelector(".studentcoursedetail.my-theme-6 ");
let weirdhighlighter = document.querySelector('.search-model')
weirdhighlighter.classList.remove("search-model")
firstTable.classList.remove("my-theme-6");
firstTable.style.marginBottom = '0';
let bodyoffirst = document.querySelector('tbody');
bodyoffirst.style.backgroundColor = 'rgba(255, 255, 255, .65)';
let topheaderarea = document.querySelector(".first-row");
topheaderarea.style.backgroundColor = 'rgba(0, 41, 41, 1)';
let firstRow1 = document.querySelector(".first-row");
let thElements = firstRow1.querySelectorAll("th");
for (let i = 0; i < thElements.length; i++) {
  thElements[i].style.color = "white";
}