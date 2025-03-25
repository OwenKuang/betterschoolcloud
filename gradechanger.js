// Function to update container text
function updateContainerText() {
    var containerElement = document.querySelector('.container.container-transform.vertical-spacer');

    if (containerElement) {
        console.log("Found");

        // Temporarily disconnect the observer
        observer.disconnect();

        // Perform the calculation or any DOM modifications
        calculateFinalAverage();

        // Reconnect the observer
        observer.observe(targetNode, config);
    }
}

// Function to be called when a mutation occurs
function handleMutation(mutationsList, observer) {
    // Call the updateContainerText function when a mutation occurs
    updateContainerText();
}

// Set up a MutationObserver to watch for changes in the DOM
var observer = new MutationObserver(handleMutation);

// Define the target node 
var targetNode = document.body;

// Specify the types of mutations 
var config = { childList: true, subtree: true };

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// find the average of the user 

var tableElementglobal = document.querySelector('.printed-block.sixty-percent');

var actualgrade = 0;
// Check if the table element exists
if (tableElementglobal) {
    // Select the td element containing the mark
    actualgrade = tableElement.querySelectorAll('td span')[1];

}

// Function to calculate the final user average
function calculateFinalAverage() {

    let sectionaverage = 0; // Initialize sectionaverage
    let wholedenomglobalscope = 0;
    let globalsectionweight = 0;
    let finaloutput = 0;

    console.log("Calculating final average...");

    const courseSummaryElement = document.getElementById('CourseSummary'); // Select the CourseSummary container
    console.log("Course Summary Element:", courseSummaryElement);

    const courseSections = courseSummaryElement.querySelectorAll('li'); // Select all sections
    console.log("Course Sections:", courseSections);

    // Iterate through each section
    courseSections.forEach((section, sectionIndex) => {
        console.log(`Processing section ${sectionIndex + 1}...`);

        // Check for h2 element to get section weight
        let sectionWeight = 0; // Default weight
        let checked = false;
        let sectiontotal = 0; // Initialize sectiontotal
        let wholedenom = 0;
        const h2Element = section.querySelector('h2');
        if (h2Element) {
            const h2Text = h2Element.textContent.trim();
            const weightMatch = h2Text.match(/(\d+(\.\d+)?)\s*[^%\d]*(?=%\s*of)/); // Match weight in parentheses
            if (weightMatch) {
                sectionWeight = parseFloat(weightMatch[1]) / 100; // Convert percentage to decimal
                checked = true;
            }
            console.log(`Overall weight of section ${sectionIndex + 1}: ${sectionWeight}`);
        } else {
            console.log(`No overall weight specified for section ${sectionIndex + 1}. Assuming default weight: ${sectionWeight}`);
        }

        const tables = section.querySelectorAll('table'); // Select all tables within the section

        // Iterate through each table
        tables.forEach((table, tableIndex) => {
            console.log(`Processing table ${tableIndex + 1} in section ${sectionIndex + 1}...`);
            let tableWeight = -1; // Initialize tableWeight
            let tableWeightedAverage = 0; // Initialize tableWeightedAverage


            if ((checked && sectionWeight !== 0) || (!checked && sectionWeight === 0)) {
                // Check for header cell to get table weight
                const headerCell = table.querySelector('.search-model-title-header');
                if (headerCell) {
                    const headerText = headerCell.textContent.trim();
                    const weightMatch = headerText.match(/\((\d+(\.\d+)?)%\s*of/); // Match weight in parentheses
                    if (weightMatch) {
                        tableWeight = parseFloat(weightMatch[1]) / 100; // Convert percentage to decimal
                    }
                    console.log(`Weight of table ${tableIndex + 1} in section ${sectionIndex + 1}: ${tableWeight}`);
                }

                // Calculate the average for this table
                let tableAverage = calculateTableAverage(table);

                // Calculate the weighted average for this table
                console.log("this is the table weight: ", tableWeight)
                if (tableWeight > 0 && !isNaN(tableAverage)) {
                    wholedenom += tableWeight;
                    tableWeightedAverage = tableAverage * tableWeight;
                }
                else if (tableWeight < 0 && sectionWeight <= 0) {
                    tableWeightedAverage = 0;
                }
                else {
                    tableWeightedAverage = tableAverage;
                }

                console.log(`Weighted average for table ${tableIndex + 1} in section ${sectionIndex + 1}: ${tableWeightedAverage.toFixed(4)}`);

                //make sure NaN doesnt get returned 
                if (!isNaN(tableWeightedAverage)) {
                    sectionaverage += tableWeightedAverage;
                }
                console.log("this is section avergage every time: ", sectionaverage);
            }

            // this is during when the indiviidual parts of the table is being visited 

        });

        // this is after everything in the table is visited 

        console.log("this is section avergage: ", sectionaverage);

        if (wholedenom > 0 && sectionWeight > 0) {
            sectionaverage = sectionaverage / wholedenom;
        }

        console.log("this is the sectionavarege: ", sectionaverage, " this is the whole denom: ", wholedenom);

        // if there is a section weight, apply it 
        if (sectionWeight > 0) {
            sectiontotal = sectionaverage * sectionWeight;
        }
        else {
            sectiontotal = sectionaverage;
        }


        console.log("this is the section average ", sectionaverage, " this is the section weight: ", sectionWeight, " this is the section total ", sectiontotal);
        globalsectionweight += sectionWeight
        wholedenomglobalscope = wholedenom;
        finaloutput += sectiontotal;
        sectionaverage = 0;
        sectiontotal = 0;

    });
    // this is for the final output of the grade when all of the tables are visited 
    console.log(Math.abs(((wholedenomglobalscope / finaloutput) * 100)));
    console.log("denom: ", wholedenomglobalscope, "finaloutput: ", finaloutput, "global section weight: ", globalsectionweight)
    if (wholedenomglobalscope != 0 && globalsectionweight == 0) {
        finaloutput = finaloutput / wholedenomglobalscope;
        console.log("passed infinity and .5 check")
    }
    else if (globalsectionweight != 0) {
        finaloutput = finaloutput / globalsectionweight
    }
    console.log("Total weighted average: ", finaloutput.toFixed(4));

    var tableElement = document.querySelector('.printed-block.sixty-percent');

    // Check if the table element exists
    if (tableElement) {
        // Select the td element containing the mark
        var markElement = tableElement.querySelectorAll('td span')[1];

        // Check if the mark element exists
        if (markElement && Math.abs((markElement).textContent - (finaloutput * 100).toFixed(2)) < .5) {
            // Change the text content to the new mark
            markElement.textContent = (finaloutput * 100).toFixed(2);
            var popupContainer = document.createElement('div');
            popupContainer.classList.add('popup-container');
            popupContainer.style.position = 'relative';
            popupContainer.style.display = 'inline-block';

            // Create the popup text span
            var popupText = document.createElement('span');
            popupText.classList.add('popuptext');
            popupText.textContent = 'Please note that the decimal is predicted by BetterSchoolCloud and may not be fully accurate.';
            popupText.style.visibility = 'hidden';
            popupText.style.width = '160px';
            popupText.style.backgroundColor = '#555';
            popupText.style.color = '#fff';
            popupText.style.textAlign = 'center';
            popupText.style.borderRadius = '6px';
            popupText.style.padding = '8px 0';
            popupText.style.position = 'absolute';
            popupText.style.zIndex = '1';
            popupText.style.bottom = '125%';
            popupText.style.left = '50%';
            popupText.style.marginLeft = '-80px';

            // Create the arrow for the popup
            var popupArrow = document.createElement('span');
            popupArrow.style.content = '""';
            popupArrow.style.position = 'absolute';
            popupArrow.style.top = '100%';
            popupArrow.style.left = '50%';
            popupArrow.style.marginLeft = '-5px';
            popupArrow.style.borderWidth = '5px';
            popupArrow.style.borderStyle = 'solid';
            popupArrow.style.borderColor = '#555 transparent transparent transparent';
            popupText.appendChild(popupArrow);

            // Style the "?" mark
            var questionMark = document.createElement('span');
            var questionMark = document.createElement('span');
            questionMark.textContent = '?';
            questionMark.style.color = 'white';
            questionMark.style.background = 'linear-gradient(to right, #538e96, #2f4f4f)'; // Gradient background
            questionMark.style.borderRadius = '50%'; // Fully rounded corners
            questionMark.style.fontWeight = 'bold'; // Bold text
            questionMark.style.marginLeft = '5px'; // Space between the text and the "?"
            questionMark.style.cursor = 'pointer';
            questionMark.style.display = 'inline-flex'; // Ensure content is centered
            questionMark.style.alignItems = 'center'; // Center content vertically
            questionMark.style.justifyContent = 'center'; // Center content horizontally

            // Use viewport units for responsiveness
            questionMark.style.width = '1vw'; // Width as a percentage of viewport width
            questionMark.style.height = '1vw'; // Height as a percentage of viewport width (same as width to maintain circular shape)
            questionMark.style.minWidth = '10px'; // Minimum width
            questionMark.style.minHeight = '10px'; // Minimum height


            // Add the popup functionality
            questionMark.addEventListener('mouseenter', function () {
                popupText.style.visibility = 'visible';
            });
            questionMark.addEventListener('mouseleave', function () {
                popupText.style.visibility = 'hidden';
            });

            // Insert the popup container and text into the DOM
            markElement.parentNode.insertBefore(popupContainer, markElement);
            popupContainer.appendChild(markElement);
            popupContainer.appendChild(questionMark);
            popupContainer.appendChild(popupText);
        } else if (markElement) {
            var popupContainer = document.createElement('div');
            popupContainer.classList.add('popup-container');
            popupContainer.style.position = 'relative';
            popupContainer.style.display = 'inline-block';

            // Create the popup text span
            var popupText = document.createElement('span');
            popupText.classList.add('popuptext');
            popupText.textContent = 'The decimal cannot be displayed as the calculated mark differs by more then 0.5%. This may be due to improper or missing weightings.';
            popupText.style.visibility = 'hidden';
            popupText.style.width = '160px';
            popupText.style.backgroundColor = '#555';
            popupText.style.color = '#fff';
            popupText.style.textAlign = 'center';
            popupText.style.borderRadius = '6px';
            popupText.style.padding = '8px 0';
            popupText.style.position = 'absolute';
            popupText.style.zIndex = '1';
            popupText.style.bottom = '125%';
            popupText.style.left = '50%';
            popupText.style.marginLeft = '-80px';

            // Create the arrow for the popup
            var popupArrow = document.createElement('span');
            popupArrow.style.content = '""';
            popupArrow.style.position = 'absolute';
            popupArrow.style.top = '100%';
            popupArrow.style.left = '50%';
            popupArrow.style.marginLeft = '-5px';
            popupArrow.style.borderWidth = '5px';
            popupArrow.style.borderStyle = 'solid';
            popupArrow.style.borderColor = '#555 transparent transparent transparent';
            popupText.appendChild(popupArrow);

            // Style the "?" mark
            var questionMark = document.createElement('span');
            var questionMark = document.createElement('span');
            questionMark.textContent = '?';
            questionMark.style.color = 'white';
            questionMark.style.background = 'linear-gradient(to right, #538e96, #2f4f4f)'; // Gradient background
            questionMark.style.borderRadius = '50%'; // Fully rounded corners
            questionMark.style.fontWeight = 'bold'; // Bold text
            questionMark.style.marginLeft = '5px'; // Space between the text and the "?"
            questionMark.style.cursor = 'pointer';
            questionMark.style.display = 'inline-flex'; // Ensure content is centered
            questionMark.style.alignItems = 'center'; // Center content vertically
            questionMark.style.justifyContent = 'center'; // Center content horizontally

            // Use viewport units for responsiveness
            questionMark.style.width = '1vw'; // Width as a percentage of viewport width
            questionMark.style.height = '1vw'; // Height as a percentage of viewport width (same as width to maintain circular shape)
            questionMark.style.minWidth = '10px'; // Minimum width
            questionMark.style.minHeight = '10px'; // Minimum height


            // Add the popup functionality
            questionMark.addEventListener('mouseenter', function () {
                popupText.style.visibility = 'visible';
            });
            questionMark.addEventListener('mouseleave', function () {
                popupText.style.visibility = 'hidden';
            });

            // Insert the popup container and text into the DOM
            markElement.parentNode.insertBefore(popupContainer, markElement);
            popupContainer.appendChild(markElement);
            popupContainer.appendChild(questionMark);
            popupContainer.appendChild(popupText);

            // markElement.textContent += " ?";

        } else {
            console.log('Table element not found.'); 54
        }

        // Reset variables
        sectiontotal = 0;
        sectionaverage = 0;
        wholedenom = 0;
        finaloutput = 0;
    };
};

// Function to calculate the average for a table
function calculateTableAverage(table) {
    let totalMarks = 0;
    let totalPossiblePoints = 0;
    let totalCells = 0;


    const rows = table.querySelectorAll('tbody tr'); // Select all rows within the table

    // Iterate through each row
    rows.forEach((row, rowIndex) => {
        const markCell = row.querySelector('td[data-label="Mark"] span'); // Select the mark cell
        const pointsCell = row.querySelector('td[data-label="Points"]'); // Select the cell containing possible points
        const weightCell = row.querySelector('td[data-label="Weight"]'); // Select the cell containing the weight
        let weight = 0; // Default weight

        if (markCell && pointsCell) {
            const mark = parseFloat(markCell.textContent.trim()); // Parse the mark value
            const possiblePoints = parseInt(pointsCell.textContent.trim()); // Parse possible points value

            if (weightCell) {
                weight = parseFloat(weightCell.textContent.trim()); // Parse the weight value
            }

            if (!isNaN(mark) && !isNaN(possiblePoints) && !isNaN(weight)) {
                console.log(`Mark found: ${mark}, Possible Points: ${possiblePoints}, Weight: ${weight}`);
                totalMarks += ((mark / possiblePoints) * weight); // Add weighted mark to totalMarks
                totalPossiblePoints += weight; // Add weighted possible points to totalPossiblePoints
                totalCells++; // Increment totalCells
            } else {
                console.log("Invalid mark, possible points, or weight found.");
            }

        } else {
            console.log("Mark cell or points cell not found in the row.");
        }
    });

    // Calculate the average for this table
    const average = totalMarks / totalPossiblePoints;
    console.log("Total marks: ", totalMarks);
    console.log("Possible: ", totalPossiblePoints);
    console.log('Table Average:', average.toFixed(4));
    return average;
};

// Call the function initially
calculateFinalAverage();