// Enhanced Grade Changer - Simple editable grades with original calculation logic

// Debug mode - set to false for production
const DEBUG_MODE = false;
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

// Track if any values have been edited
let hasEdits = false;

// Global storage for editable values
let editableMarks = new Map();
let editableWeights = new Map();
let editablePossiblePoints = new Map();
let originalValues = new Map(); // Store original values for reset
let originalOverallGrade = null; // Store the original overall grade from SchoolCloud

// Debounce helper
let debounceTimer = null;
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Create debounced calculation function
const debouncedCalculate = debounce(calculateFinalAverage, 300);

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
                        debugLog("Course Summary popup detected - reinitializing editable grades");
                        setTimeout(() => {
                            initializeEditableGrades();
                            calculateFinalAverage();
                        }, 500);
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

// Enhanced table average calculation - with proper table total calculation
function calculateTableAverage(table, sectionIndex, tableIndex) {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    let validAssignments = 0;

    const rows = table.querySelectorAll('tbody tr');

    // Iterate through each row to calculate weighted average for the table
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
                try {
                    mark = parseFloat(markInput.value);
                    if (isNaN(mark)) {
                        console.log(`Skipping row with invalid mark input: "${markInput.value}"`);
                        return;
                    }
                } catch (e) {
                    console.log(`Error parsing mark input: ${e.message}`);
                    return;
                }
            } else if (markCell) {
                const markText = markCell.textContent.trim().toLowerCase();

                // Handle special status values
                if (markText === 'nhi' || markText === 'n.h.i.' || markText === 'n.h.i') {
                    mark = 0; // Not Handed In = 0
                } else if (markText === 'completed' || markText === 'complete') {
                    // COMPLETED typically means assignment done but not graded - skip it
                    console.log(`Skipping row with status: "${markText}"`);
                    return;
                } else if (markText === 'absent' || markText === 'excused' || markText === 'collected' || markText === 'exc' || markText === 'abs') {
                    // Skip non-graded statuses
                    console.log(`Skipping row with status: "${markText}"`);
                    return;
                } else if (markText === '' || markText === '-' || markText === 'n/a') {
                    // Skip empty or not applicable
                    console.log(`Skipping row with empty/N/A mark`);
                    return;
                } else {
                    try {
                        // Remove % symbol if present, then parse
                        const cleanText = markText.replace('%', '');
                        mark = parseFloat(cleanText);
                        if (isNaN(mark)) {
                            console.log(`Skipping row with non-numeric mark: "${markText}"`);
                            return;
                        }
                    } catch (e) {
                        console.log(`Error parsing mark: ${e.message}`);
                        return;
                    }
                }
            } else {
                // No mark found, skip this row
                console.log(`Skipping row with no mark found`);
                return;
            }
        }
        
        // Get possible points
        if (editablePossiblePoints.has(cellId)) {
            possiblePoints = editablePossiblePoints.get(cellId);
        } else {
            const pointsInput = row.querySelector('.points-input');
            const pointsCell = row.querySelector('td[data-label="Points"]');
            if (pointsInput && pointsInput.value !== '') {
                try {
                    possiblePoints = parseFloat(pointsInput.value);
                    if (isNaN(possiblePoints) || possiblePoints <= 0) {
                        console.log(`Skipping row with invalid points input: "${pointsInput.value}"`);
                        return;
                    }
                } catch (e) {
                    console.log(`Error parsing points input: ${e.message}`);
                    return;
                }
            } else if (pointsCell) {
                const pointsText = pointsCell.textContent.trim();
                try {
                    possiblePoints = parseFloat(pointsText);
                    if (isNaN(possiblePoints) || possiblePoints <= 0) {
                        console.log(`Skipping row with invalid points: "${pointsText}"`);
                        return;
                    }
                } catch (e) {
                    console.log(`Error parsing points: ${e.message}`);
                    return;
                }
            } else {
                console.log(`Skipping row with no points found`);
                return;
            }
        }
        
        // Get weight
        if (editableWeights.has(cellId)) {
            weight = editableWeights.get(cellId);
        } else {
            const weightInput = row.querySelector('.weight-input');
            const weightCell = row.querySelector('td[data-label="Weight"]');
            if (weightInput && weightInput.value !== '') {
                try {
                    weight = parseFloat(weightInput.value);
                    if (isNaN(weight)) {
                        weight = 1;
                        console.log(`Invalid weight input, defaulting to 1`);
                    }
                } catch (e) {
                    weight = 1;
                    console.log(`Error parsing weight input: ${e.message}, defaulting to 1`);
                }
            } else if (weightCell) {
                const weightText = weightCell.textContent.trim();
                try {
                    weight = weightText === '' ? 1 : parseFloat(weightText);
                    if (isNaN(weight)) {
                        weight = 1;
                    }
                } catch (e) {
                    weight = 1;
                    console.log(`Error parsing weight: ${e.message}, defaulting to 1`);
                }
            } else {
                weight = 1; // Default weight if not specified
            }
        }

        // Only process if we have valid data
        if (!isNaN(mark) && !isNaN(possiblePoints) && !isNaN(weight) && possiblePoints > 0 && mark >= 0) {
            debugLog(`Mark found: ${mark}, Possible Points: ${possiblePoints}, Weight: ${weight}`);

            // Update individual assignment overall mark
            const assignmentPercentage = (mark / possiblePoints) * 100;
            updateAssignmentOverallMark(row, assignmentPercentage);

            // Skip assignments with 0 weight (they don't count toward grade)
            if (weight === 0) {
                debugLog(`Assignment has weight 0 - not counting toward grade`);
                return;
            }

            // Add to table totals for weighted average calculation
            totalWeightedScore += (assignmentPercentage * weight);
            totalWeight += weight;
            validAssignments++;
        } else {
            console.log("Invalid mark, possible points, or weight found.");
        }
    });

    // Only calculate if we have valid assignments
    if (validAssignments === 0 || totalWeight === 0) {
        debugLog(`Skipping table - no valid assignments (${validAssignments} assignments, ${totalWeight} total weight)`);
        return null; // Return null to indicate no valid data
    }

    // Calculate table's weighted average percentage
    const tableWeightedAverage = totalWeightedScore / totalWeight;

    debugLog(`Table calculation: ${totalWeightedScore.toFixed(4)} ÷ ${totalWeight} = ${tableWeightedAverage.toFixed(4)}%`);
    debugLog(`Table has ${validAssignments} valid assignments`);

    // Update table overall mark with the weighted percentage
    updateTableOverallMark(table, tableWeightedAverage);

    // Convert back to decimal for the original calculation system
    const average = tableWeightedAverage / 100;
    debugLog('Table Average (for system):', average.toFixed(4));

    return average;
}

// Update individual assignment overall mark - FIXED
function updateAssignmentOverallMark(row, percentage) {
    const overallMarkCell = row.querySelector('td[data-label="Overall Mark"]');
    if (overallMarkCell) {
        // Only update if this cell doesn't already have our custom display
        if (!overallMarkCell.classList.contains('updated-overall-mark')) {
            overallMarkCell.classList.add('updated-overall-mark');
            overallMarkCell.style.fontWeight = 'bold';
            overallMarkCell.style.color = '#2E7D32';
        }
        
        // Update the text content directly
        overallMarkCell.textContent = `${percentage.toFixed(4)}%`;
    }
}

// Updated table overall mark function - targets the tfoot th element
function updateTableOverallMark(table, percentage) {
    debugLog(`🎯 Updating table overall mark to ${percentage.toFixed(4)}%`);
    
    // Method 1: Look specifically in tfoot for the th element
    const tfoot = table.querySelector('tfoot');
    let targetCell = null;
    
    if (tfoot) {
        const tfootRow = tfoot.querySelector('tr');
        if (tfootRow) {
            const thElements = tfootRow.querySelectorAll('th');
            if (thElements.length > 0) {
                // Get the last th element (rightmost column)
                targetCell = thElements[thElements.length - 1];
                console.log(`📍 Found tfoot th element: "${targetCell.textContent.trim()}"`);
            }
        }
    }
    
    // Method 2: If no tfoot, look for any th element in the last rows that might contain percentage
    if (!targetCell) {
        console.log("🔍 No tfoot found, searching for th elements in table...");
        const allRows = table.querySelectorAll('tr');
        
        // Check last few rows for th elements
        for (let i = allRows.length - 1; i >= Math.max(0, allRows.length - 3); i--) {
            const row = allRows[i];
            const thElements = row.querySelectorAll('th');
            
            if (thElements.length > 0) {
                // Look for th that contains percentage or is empty
                for (let j = thElements.length - 1; j >= 0; j--) {
                    const th = thElements[j];
                    const thText = th.textContent.trim();
                    if (thText.includes('%') || thText === '' || thText.match(/^\d+(\.\d+)?%?$/)) {
                        targetCell = th;
                        console.log(`📍 Found th element in row ${i}: "${thText}"`);
                        break;
                    }
                }
                if (targetCell) break;
            }
        }
    }
    
    // Method 3: Fallback to any th element in the table
    if (!targetCell) {
        console.log("🔍 Fallback: looking for any th element...");
        const allTh = table.querySelectorAll('th');
        if (allTh.length > 0) {
            targetCell = allTh[allTh.length - 1];
            console.log(`📍 Using fallback th element: "${targetCell.textContent.trim()}"`);
        }
    }
    
    if (targetCell) {
        // Style the cell to match the existing table styling
        if (!targetCell.classList.contains('updated-table-mark')) {
            targetCell.classList.add('updated-table-mark');
            targetCell.style.color = '#FFFFFF'; // White text to stand out against dark green
            targetCell.style.fontWeight = 'bold';
            targetCell.style.textAlign = 'center';
            // Don't change background, font size, padding, or border-radius to match existing styling
        }
        
        targetCell.textContent = `${percentage.toFixed(4)}%`;
        console.log(`Table overall mark updated successfully: ${percentage.toFixed(4)}%`);
    } else {
        console.log("Could not find target th cell for table overall mark");
        
        // Debug: Log table structure with focus on th elements
        console.log("Table structure:");
        const allRows = table.querySelectorAll('tr');
        allRows.forEach((row, i) => {
            const cells = row.querySelectorAll('td, th');
            const cellData = Array.from(cells).map(cell => ({
                tag: cell.tagName.toLowerCase(),
                text: cell.textContent.trim()
            }));
            console.log(`Row ${i}:`, cellData);
        });
    }
}

// Original calculation function with editable support
function calculateFinalAverage() {
    let sectionaverage = 0;
    let wholedenomglobalscope = 0;
    let globalsectionweight = 0;
    let finaloutput = 0;

    debugLog("Calculating final average...");

    const courseSummaryElement = document.getElementById('CourseSummary');
    debugLog("Course Summary Element:", courseSummaryElement);

    if (!courseSummaryElement) {
        debugLog("CourseSummary not found");
        return;
    }

    const courseSections = courseSummaryElement.querySelectorAll('li');
    debugLog("Course Sections:", courseSections);

    // Iterate through each section
    courseSections.forEach((section, sectionIndex) => {
        debugLog(`Processing section ${sectionIndex + 1}...`);

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
            debugLog(`Overall weight of section ${sectionIndex + 1}: ${sectionWeight}`);
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

                // Skip tables with no valid data
                if (tableAverage === null || isNaN(tableAverage)) {
                    debugLog(`Skipping table ${tableIndex + 1} in section ${sectionIndex + 1} - no valid data`);
                    return; // Skip this table entirely
                }

                // Calculate the weighted average for this table
                debugLog("this is the table weight: ", tableWeight)
                if (tableWeight > 0) {
                    wholedenom += tableWeight;
                    tableWeightedAverage = tableAverage * tableWeight;
                }
                else if (tableWeight < 0 && sectionWeight <= 0) {
                    tableWeightedAverage = 0;
                }
                else {
                    tableWeightedAverage = tableAverage;
                }

                debugLog(`Weighted average for table ${tableIndex + 1} in section ${sectionIndex + 1}: ${tableWeightedAverage.toFixed(4)}`);

                if (!isNaN(tableWeightedAverage)) {
                    sectionaverage += tableWeightedAverage;
                }
                debugLog("this is section average every time: ", sectionaverage);
            }
        });

        debugLog("this is section average: ", sectionaverage);

        // Skip sections with no valid data
        if (sectionaverage === 0 && wholedenom === 0) {
            debugLog(`Skipping section ${sectionIndex + 1} - no valid data`);
            return; // Skip this section entirely
        }

        if (wholedenom > 0 && sectionWeight > 0) {
            sectionaverage = sectionaverage / wholedenom;
        }

        debugLog("this is the section average: ", sectionaverage, " this is the whole denom: ", wholedenom);

        // if there is a section weight, apply it
        if (sectionWeight > 0) {
            sectiontotal = sectionaverage * sectionWeight;
        }
        else {
            sectiontotal = sectionaverage;
        }

        debugLog("this is the section average ", sectionaverage, " this is the section weight: ", sectionWeight, " this is the section total ", sectiontotal);
        globalsectionweight += sectionWeight
        wholedenomglobalscope = wholedenom;
        finaloutput += sectiontotal;
        sectionaverage = 0;
        sectiontotal = 0;
    });

    // Final calculation with division by zero guards
    console.log("denom: ", wholedenomglobalscope, "finaloutput: ", finaloutput, "global section weight: ", globalsectionweight)

    if (wholedenomglobalscope != 0 && globalsectionweight == 0) {
        finaloutput = finaloutput / wholedenomglobalscope;
        console.log("Using table weights calculation")
    } else if (globalsectionweight != 0) {
        finaloutput = finaloutput / globalsectionweight;
        console.log("Using section weights calculation")
    } else if (wholedenomglobalscope == 0 && globalsectionweight == 0 && finaloutput != 0) {
        // Edge case: no weights found but we have a result - use as-is
        console.log("No weights found, using raw average")
    } else {
        // Both denominators are 0 and finaloutput is 0 - likely no valid data
        finaloutput = 0;
        console.log("No valid grade data found, defaulting to 0")
    }

    console.log("Total weighted average: ", finaloutput.toFixed(4));

    // Update display with enhanced features
    updateGradeDisplay(finaloutput);
}

// Update grade display - always use calculated value
function updateGradeDisplay(finaloutput) {
    var tableElement = document.querySelector('.printed-block.sixty-percent');

    if (tableElement) {
        var markElement = tableElement.querySelectorAll('td span')[1];

        if (markElement) {
            // Store original grade if we haven't already
            if (originalOverallGrade === null) {
                originalOverallGrade = parseFloat(markElement.textContent.trim());
                debugLog(`Stored original overall grade: ${originalOverallGrade}%`);
            }

            const calculatedGrade = (finaloutput * 100);

            debugLog(`Calculated: ${calculatedGrade.toFixed(4)}%, Original: ${originalOverallGrade}%`);

            // Always use the calculated grade
            markElement.textContent = calculatedGrade.toFixed(4);

            // Highlight if values have been edited
            if (hasEdits) {
                markElement.style.backgroundColor = '#fff3cd';
                markElement.style.padding = '4px 8px';
                markElement.style.borderRadius = '4px';
                markElement.style.fontWeight = 'bold';
            }

            // Add original mark display and reset button
            addOriginalMarkAndReset(markElement, tableElement);

            // Add disclaimer next to mark
            addDisclaimerText(markElement);

            debugLog(`Grade updated to calculated value: ${calculatedGrade.toFixed(4)}%`);
        }
    }
}

// Add original mark display (removed - just keeping function for compatibility)
function addOriginalMarkAndReset(markElement, tableElement) {
    // Function removed - no longer showing original mark or reset button
}

// Reset all values to original
function resetAllValues() {
    // Reset all editable inputs to original values
    editableMarks.forEach((value, cellId) => {
        const originalMark = originalValues.get(`${cellId}_mark`);
        if (originalMark !== undefined) {
            editableMarks.set(cellId, originalMark);
        }
    });

    editablePossiblePoints.forEach((value, cellId) => {
        const originalPoints = originalValues.get(`${cellId}_points`);
        if (originalPoints !== undefined) {
            editablePossiblePoints.set(cellId, originalPoints);
        }
    });

    editableWeights.forEach((value, cellId) => {
        const originalWeight = originalValues.get(`${cellId}_weight`);
        if (originalWeight !== undefined) {
            editableWeights.set(cellId, originalWeight);
        }
    });

    // Reset hasEdits flag
    hasEdits = false;

    // Re-initialize the UI with original values
    const courseSummaryElement = document.getElementById('CourseSummary');
    if (courseSummaryElement) {
        // Clear existing inputs and re-create them with original values
        courseSummaryElement.querySelectorAll('.mark-input, .points-input, .weight-input').forEach(input => {
            const cellIdMatch = input.className.match(/cell-(.+)/);
            if (cellIdMatch) {
                const cellId = cellIdMatch[1];
                if (input.classList.contains('mark-input')) {
                    const originalMark = originalValues.get(`${cellId}_mark`);
                    if (originalMark !== undefined) {
                        input.value = originalMark;
                        input.style.background = 'white';
                        input.style.borderColor = '#4CAF50';
                    }
                } else if (input.classList.contains('points-input')) {
                    const originalPoints = originalValues.get(`${cellId}_points`);
                    if (originalPoints !== undefined) {
                        input.value = originalPoints;
                        input.style.background = 'white';
                        input.style.borderColor = '#2196F3';
                    }
                } else if (input.classList.contains('weight-input')) {
                    const originalWeight = originalValues.get(`${cellId}_weight`);
                    if (originalWeight !== undefined) {
                        input.value = originalWeight;
                        input.style.background = 'white';
                        input.style.borderColor = '#FF9800';
                    }
                }
            }
        });
    }

    // Recalculate with original values
    calculateFinalAverage();
}

// Add disclaimer text next to the final mark
function addDisclaimerText(markElement) {
    // Check if disclaimer already exists
    const parentCell = markElement.closest('td');
    if (!parentCell || parentCell.querySelector('.bsc-disclaimer')) {
        return;
    }

    const disclaimer = document.createElement('span');
    disclaimer.className = 'bsc-disclaimer';
    disclaimer.style.cssText = `
        display: block;
        font-size: 10px;
        color: #856404;
        margin-top: 4px;
        font-style: italic;
    `;
    disclaimer.textContent = 'BetterSchoolCloud calculation - verify with official grades';

    parentCell.appendChild(disclaimer);
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

    // Check if inputs already exist - if so, don't reinitialize
    const hasExistingInputs = courseSummaryElement.querySelector('.mark-input, .points-input, .weight-input');
    if (hasExistingInputs) {
        console.log("Inputs already exist - keeping current data and recalculating");
        // Just recalculate with existing data, don't clear anything
        return;
    }

    // Starting fresh - clear data and read original values
    console.log("Starting fresh - clearing data and reading original values");
    editableMarks.clear();
    editableWeights.clear();
    editablePossiblePoints.clear();
    originalValues.clear();
    originalOverallGrade = null; // Reset stored original grade

    const courseSections = courseSummaryElement.querySelectorAll('li');
    console.log(`Found ${courseSections.length} sections`);
    
    courseSections.forEach((section, sectionIndex) => {
        const tables = section.querySelectorAll('table');
        
        tables.forEach((table, tableIndex) => {
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach((row, rowIndex) => {
                const cellId = createCellId(sectionIndex, tableIndex, rowIndex);
                
                // Make mark editable - only read from span elements (original data)
                const markCell = row.querySelector('td[data-label="Mark"] span');
                if (markCell && !row.querySelector('.mark-input')) {
                    makeMarkEditable(markCell, cellId);
                }
                
                // Make possible points editable - only read from text content (original data)
                const pointsCell = row.querySelector('td[data-label="Points"]');
                if (pointsCell && pointsCell.textContent.trim() && !pointsCell.querySelector('input')) {
                    makePointsEditable(pointsCell, cellId);
                }
                
                // Make weight editable - only read from text content (original data)
                const weightCell = row.querySelector('td[data-label="Weight"]');
                if (weightCell && !weightCell.querySelector('input')) {
                    makeWeightEditable(weightCell, cellId);
                }
            });
        });
    });
    
    console.log(`Grades are now editable - ${editableMarks.size} marks, ${editablePossiblePoints.size} points, ${editableWeights.size} weights`);
    console.log("Original values stored:", originalValues);
}

// Make mark cell editable
function makeMarkEditable(element, cellId) {
    const originalText = element.textContent.trim();
    let originalValue;
    
    // Handle special cases
    if (originalText.toLowerCase() === 'nhi') {
        originalValue = 0; // NHI (Not Handed In) = 0
        console.log(`Found NHI assignment - converting "${originalText}" to 0`);
    } else if (isNaN(parseFloat(originalText))) {
        // Skip non-numeric values like "absent", "excused", "collected"
        console.log(`Skipping non-numeric mark: "${originalText}"`);
        return;
    } else {
        originalValue = parseFloat(originalText);
    }
    
    // Store original value for reset
    originalValues.set(`${cellId}_mark`, originalValue);
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

        // Visual indicator if changed from original
        const originalMark = originalValues.get(`${cellId}_mark`);
        if (Math.abs(newValue - originalMark) > 0.01) {
            this.style.background = '#fff3cd';
            this.style.borderColor = '#ffc107';
            hasEdits = true;
        } else {
            this.style.background = 'white';
            this.style.borderColor = '#4CAF50';
        }

        debouncedCalculate();
    });
    
    element.parentNode.replaceChild(input, element);
}

// Make points cell editable
function makePointsEditable(element, cellId) {
    const originalValue = parseFloat(element.textContent.trim());
    if (isNaN(originalValue) || originalValue <= 0) return;

    // Store original value for reset
    originalValues.set(`${cellId}_points`, originalValue);
    editablePossiblePoints.set(cellId, originalValue);

    const input = document.createElement('input');
    input.type = 'number';
    input.value = originalValue;
    input.min = '0.1';
    input.step = '0.5';
    input.classList.add('points-input');
    input.style.width = '50px';
    input.style.border = '2px solid #2196F3';
    input.style.borderRadius = '4px';
    input.style.padding = '2px';
    input.style.textAlign = 'center';

    input.addEventListener('input', function() {
        const newValue = parseFloat(this.value) || 1;
        editablePossiblePoints.set(cellId, newValue);

        // Visual indicator if changed from original
        const originalPoints = originalValues.get(`${cellId}_points`);
        if (newValue !== originalPoints) {
            this.style.background = '#fff3cd';
            this.style.borderColor = '#ffc107';
            hasEdits = true;
        } else {
            this.style.background = 'white';
            this.style.borderColor = '#2196F3';
        }

        debouncedCalculate();
    });
    
    element.innerHTML = '';
    element.appendChild(input);
}

// Make weight cell editable
function makeWeightEditable(element, cellId) {
    const originalText = element.textContent.trim();
    const originalValue = originalText === '' ? 1 : parseFloat(originalText);
    
    // Store original value for reset (keep 0 if it's 0)
    originalValues.set(`${cellId}_weight`, originalValue);
    editableWeights.set(cellId, originalValue);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.value = originalValue;
    input.min = '0';
    input.step = '0.1';
    input.classList.add('weight-input');
    input.style.width = '50px';
    input.style.border = '2px solid #FF9800';
    input.style.borderRadius = '4px';
    input.style.padding = '2px';
    input.style.textAlign = 'center';
    
    input.addEventListener('input', function() {
        const newValue = parseFloat(this.value);
        // Allow 0 weights, only default to 0.1 if NaN
        editableWeights.set(cellId, isNaN(newValue) ? 0.1 : newValue);

        // Visual indicator if changed from original
        const originalWeight = originalValues.get(`${cellId}_weight`);
        const currentValue = isNaN(newValue) ? 0.1 : newValue;
        if (Math.abs(currentValue - originalWeight) > 0.01) {
            this.style.background = '#fff3cd';
            this.style.borderColor = '#ffc107';
            hasEdits = true;
        } else {
            this.style.background = 'white';
            this.style.borderColor = '#FF9800';
        }

        debouncedCalculate();
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