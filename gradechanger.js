// Enhanced Grade Changer - Simple editable grades with original calculation logic

// Global storage for editable values
let editableMarks = new Map(); 
let editableWeights = new Map(); 
let editablePossiblePoints = new Map(); 

// Function to create unique identifier for each grade cell
function createCellId(sectionIndex, tableIndex, rowIndex) {
    return `s${sectionIndex}_t${tableIndex}_r${rowIndex}`;
}

// Function to update container text (original logic)
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

// Enhanced mutation observer that detects popup reopening
function handleMutation(mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Check if CourseSummary was added (popup opened)
            for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if this node or its children contain CourseSummary
                    const courseSummary = node.id === 'CourseSummary' ? node : node.querySelector('#CourseSummary');
                    if (courseSummary) {
                        console.log("🔄 Course Summary popup detected - reinitializing editable grades");
                        setTimeout(() => {
                            initializeEditableGrades();
                            calculateFinalAverage();
                        }, 500); // Small delay to let popup fully render
                        return;
                    }
                }
            }
        }
    }
    
    // Original update logic
    updateContainerText();
}

// Set up a MutationObserver to watch for changes in the DOM (original logic)
var observer = new MutationObserver(handleMutation);
var targetNode = document.body;
var config = { childList: true, subtree: true };
observer.observe(targetNode, config);

// Enhanced table average calculation using editable values when available
function calculateTableAverage(table, sectionIndex, tableIndex) {
    let totalMarks = 0;
    let totalPossiblePoints = 0;
    let totalCells = 0;

    const rows = table.querySelectorAll('tbody tr');

    // Iterate through each row
    rows.forEach((row, rowIndex) => {
        const cellId = createCellId(sectionIndex, tableIndex, rowIndex);
        
        // Try to get editable values first, then fall back to original DOM extraction
        let mark, possiblePoints, weight;
        
        // Get mark
        if (editableMarks.has(cellId)) {
            mark = editableMarks.get(cellId);
        } else {
            const markInput = row.querySelector('.mark-input');
            const markCell = row.querySelector('td[data-label="Mark"] span');
            if (markInput && markInput.value !== '') {
                mark = parseFloat(markInput.value);
            } else if (markCell) {
                mark = parseFloat(markCell.textContent.trim());
            }
        }
        
        // Get possible points
        if (editablePossiblePoints.has(cellId)) {
            possiblePoints = editablePossiblePoints.get(cellId);
        } else {
            const pointsInput = row.querySelector('.points-input');
            const pointsCell = row.querySelector('td[data-label="Points"]');
            if (pointsInput && pointsInput.value !== '') {
                possiblePoints = parseInt(pointsInput.value);
            } else if (pointsCell) {
                possiblePoints = parseInt(pointsCell.textContent.trim());
            }
        }
        
        // Get weight
        if (editableWeights.has(cellId)) {
            weight = editableWeights.get(cellId);
        } else {
            const weightInput = row.querySelector('.weight-input');
            const weightCell = row.querySelector('td[data-label="Weight"]');
            if (weightInput && weightInput.value !== '') {
                weight = parseFloat(weightInput.value);
            } else if (weightCell) {
                weight = parseFloat(weightCell.textContent.trim());
            } else {
                weight = 1; // Default weight if not specified
            }
        }

        if (!isNaN(mark) && !isNaN(possiblePoints) && !isNaN(weight) && possiblePoints > 0) {
            console.log(`Mark found: ${mark}, Possible Points: ${possiblePoints}, Weight: ${weight}`);
            totalMarks += ((mark / possiblePoints) * weight);
            totalPossiblePoints += weight;
            totalCells++;
        } else {
            console.log("Invalid mark, possible points, or weight found.");
        }
    });

    // Calculate the average for this table
    const average = totalPossiblePoints > 0 ? totalMarks / totalPossiblePoints : 0;
    console.log("Total marks: ", totalMarks);
    console.log("Possible: ", totalPossiblePoints);
    console.log('Table Average:', average.toFixed(4));
    return average;
}

// Original calculation function with editable support
function calculateFinalAverage() {
    let sectionaverage = 0;
    let wholedenomglobalscope = 0;
    let globalsectionweight = 0;
    let finaloutput = 0;

    console.log("Calculating final average...");

    const courseSummaryElement = document.getElementById('CourseSummary');
    console.log("Course Summary Element:", courseSummaryElement);

    if (!courseSummaryElement) {
        console.log("CourseSummary not found");
        return;
    }

    const courseSections = courseSummaryElement.querySelectorAll('li');
    console.log("Course Sections:", courseSections);

    // Iterate through each section
    courseSections.forEach((section, sectionIndex) => {
        console.log(`Processing section ${sectionIndex + 1}...`);

        // Check for h2 element to get section weight
        let sectionWeight = 0;
        let checked = false;
        let sectiontotal = 0;
        let wholedenom = 0;
        const h2Element = section.querySelector('h2');
        if (h2Element) {
            const h2Text = h2Element.textContent.trim();
            const weightMatch = h2Text.match(/(\d+(\.\d+)?)\s*[^%\d]*(?=%\s*of)/);
            if (weightMatch) {
                sectionWeight = parseFloat(weightMatch[1]) / 100;
                checked = true;
            }
            console.log(`Overall weight of section ${sectionIndex + 1}: ${sectionWeight}`);
        } else {
            console.log(`No overall weight specified for section ${sectionIndex + 1}. Assuming default weight: ${sectionWeight}`);
        }

        const tables = section.querySelectorAll('table');

        // Iterate through each table
        tables.forEach((table, tableIndex) => {
            console.log(`Processing table ${tableIndex + 1} in section ${sectionIndex + 1}...`);
            let tableWeight = -1;
            let tableWeightedAverage = 0;

            if ((checked && sectionWeight !== 0) || (!checked && sectionWeight === 0)) {
                // Check for header cell to get table weight
                const headerCell = table.querySelector('.search-model-title-header');
                if (headerCell) {
                    const headerText = headerCell.textContent.trim();
                    const weightMatch = headerText.match(/\((\d+(\.\d+)?)%\s*of/);
                    if (weightMatch) {
                        tableWeight = parseFloat(weightMatch[1]) / 100;
                    }
                    console.log(`Weight of table ${tableIndex + 1} in section ${sectionIndex + 1}: ${tableWeight}`);
                }

                // Calculate the average for this table (now with editable support)
                let tableAverage = calculateTableAverage(table, sectionIndex, tableIndex);

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

                if (!isNaN(tableWeightedAverage)) {
                    sectionaverage += tableWeightedAverage;
                }
                console.log("this is section avergage every time: ", sectionaverage);
            }
        });

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

    // Final calculation (original logic)
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

    // Update display
    updateGradeDisplay(finaloutput);
}

// Update grade display - always show calculated grade when editing
function updateGradeDisplay(finaloutput) {
    var tableElement = document.querySelector('.printed-block.sixty-percent');

    if (tableElement) {
        var markElement = tableElement.querySelectorAll('td span')[1];

        if (markElement) {
            const calculatedGrade = (finaloutput * 100).toFixed(2);
            
            // Always update the grade display
            markElement.textContent = calculatedGrade;
            
            // Add tooltip indicating it's been calculated by BetterSchoolCloud
            addTooltip(markElement, 'Interactive grade calculated by BetterSchoolCloud. Edit values above to see changes.');
        }
    }
}

// Add tooltip (simplified from original)
function addTooltip(markElement, message) {
    // Remove existing tooltip
    const existingContainer = markElement.closest('.popup-container');
    if (existingContainer) {
        const parent = existingContainer.parentNode;
        parent.insertBefore(markElement, existingContainer);
        parent.removeChild(existingContainer);
    }

    var popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');
    popupContainer.style.position = 'relative';
    popupContainer.style.display = 'inline-block';

    var popupText = document.createElement('span');
    popupText.classList.add('popuptext');
    popupText.textContent = message;
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

    var questionMark = document.createElement('span');
    questionMark.textContent = '?';
    questionMark.style.color = 'white';
    questionMark.style.background = 'linear-gradient(to right, #538e96, #2f4f4f)';
    questionMark.style.borderRadius = '50%';
    questionMark.style.fontWeight = 'bold';
    questionMark.style.marginLeft = '5px';
    questionMark.style.cursor = 'pointer';
    questionMark.style.display = 'inline-flex';
    questionMark.style.alignItems = 'center';
    questionMark.style.justifyContent = 'center';
    questionMark.style.width = '15px';
    questionMark.style.height = '15px';
    questionMark.style.fontSize = '10px';

    questionMark.addEventListener('mouseenter', function () {
        popupText.style.visibility = 'visible';
    });
    questionMark.addEventListener('mouseleave', function () {
        popupText.style.visibility = 'hidden';
    });

    markElement.parentNode.insertBefore(popupContainer, markElement);
    popupContainer.appendChild(markElement);
    popupContainer.appendChild(questionMark);
    popupContainer.appendChild(popupText);
}

// Make grades editable automatically - now handles popup reopening
function initializeEditableGrades() {
    console.log("Making grades editable...");
    
    const courseSummaryElement = document.getElementById('CourseSummary');
    if (!courseSummaryElement) {
        console.log("CourseSummary not found, will retry...");
        return;
    }

    // Clear existing data for fresh start
    editableMarks.clear();
    editableWeights.clear();
    editablePossiblePoints.clear();

    const courseSections = courseSummaryElement.querySelectorAll('li');
    console.log(`Found ${courseSections.length} sections`);
    
    courseSections.forEach((section, sectionIndex) => {
        const tables = section.querySelectorAll('table');
        
        tables.forEach((table, tableIndex) => {
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach((row, rowIndex) => {
                const cellId = createCellId(sectionIndex, tableIndex, rowIndex);
                
                // Make mark editable
                const markCell = row.querySelector('td[data-label="Mark"] span');
                if (markCell && !row.querySelector('.mark-input')) {
                    makeMarkEditable(markCell, cellId);
                }
                
                // Make possible points editable
                const pointsCell = row.querySelector('td[data-label="Points"]');
                if (pointsCell && pointsCell.textContent.trim() && !row.querySelector('.points-input')) {
                    makePointsEditable(pointsCell, cellId);
                }
                
                // Make weight editable
                const weightCell = row.querySelector('td[data-label="Weight"]');
                if (weightCell && !row.querySelector('.weight-input')) {
                    makeWeightEditable(weightCell, cellId);
                }
            });
        });
    });
    
    console.log(`Grades are now editable - ${editableMarks.size} marks, ${editablePossiblePoints.size} points, ${editableWeights.size} weights`);
}

// Make mark cell editable
function makeMarkEditable(element, cellId) {
    const originalValue = parseFloat(element.textContent.trim());
    if (isNaN(originalValue)) return;
    
    editableMarks.set(cellId, originalValue);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = originalValue;
    input.step = '0.01';
    input.classList.add('mark-input');
    input.style.width = '60px';
    input.style.border = '2px solid #4CAF50';
    input.style.borderRadius = '4px';
    input.style.padding = '2px';
    input.style.textAlign = 'center';
    
    input.addEventListener('input', function() {
        const newValue = parseFloat(this.value) || 0;
        editableMarks.set(cellId, newValue);
        setTimeout(calculateFinalAverage, 300);
    });
    
    element.parentNode.replaceChild(input, element);
}

// Make points cell editable
function makePointsEditable(element, cellId) {
    const originalValue = parseInt(element.textContent.trim());
    if (isNaN(originalValue) || originalValue <= 0) return;
    
    editablePossiblePoints.set(cellId, originalValue);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = originalValue;
    input.min = '1';
    input.step = '1';
    input.classList.add('points-input');
    input.style.width = '50px';
    input.style.border = '2px solid #2196F3';
    input.style.borderRadius = '4px';
    input.style.padding = '2px';
    input.style.textAlign = 'center';
    
    input.addEventListener('input', function() {
        const newValue = parseInt(this.value) || 1;
        editablePossiblePoints.set(cellId, newValue);
        setTimeout(calculateFinalAverage, 300);
    });
    
    element.innerHTML = '';
    element.appendChild(input);
}

// Make weight cell editable
function makeWeightEditable(element, cellId) {
    const originalValue = parseFloat(element.textContent.trim()) || 1;
    
    editableWeights.set(cellId, originalValue);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = originalValue;
    input.min = '0.1';
    input.step = '0.1';
    input.classList.add('weight-input');
    input.style.width = '50px';
    input.style.border = '2px solid #FF9800';
    input.style.borderRadius = '4px';
    input.style.padding = '2px';
    input.style.textAlign = 'center';
    
    input.addEventListener('input', function() {
        const newValue = parseFloat(this.value) || 0.1;
        editableWeights.set(cellId, newValue);
        setTimeout(calculateFinalAverage, 300);
    });
    
    element.innerHTML = '';
    element.appendChild(input);
}

// Initialize everything - try immediately and also watch for popup
function startGradeChanger() {
    console.log("🎯 BetterSchoolCloud Enhanced Grade Changer Starting...");
    
    // Try initial initialization
    setTimeout(() => {
        initializeEditableGrades();
        calculateFinalAverage();
    }, 1000);
    
    // Also try a few more times in case popup takes longer to load
    setTimeout(() => {
        if (document.getElementById('CourseSummary')) {
            initializeEditableGrades();
            calculateFinalAverage();
        }
    }, 3000);
}

// Start when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGradeChanger);
} else {
    startGradeChanger();
}

// Call the function initially (original behavior)
calculateFinalAverage();