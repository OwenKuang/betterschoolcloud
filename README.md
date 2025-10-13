# BetterSchoolCloud

A Chrome extension that enhances the SchoolCloud grade viewing experience with interactive grade editing, weighted averages, and visual improvements.

## ⚠️ Disclaimer

**BetterSchoolCloud is for educational and planning purposes only.**
- Grade calculations may contain errors
- Always verify with official SchoolCloud grades
- Developers are not responsible for academic decisions based on this tool
- Use at your own risk

## Features

### Course List View (Main Page)
- **Editable Marks**: Click to edit grades for each course
- **Custom Weightings**: Assign weight values to courses (default: 1)
- **Weighted Average**: Automatically calculated weighted average across all courses
- **Unweighted Average**: Simple average of all course grades
- **Custom Background**: Upload and save custom background images
- **Student Info Display**: Shows student details in a clean header

### Individual Course View (Course Details Popup)
- **Interactive Grade Editing**:
  - Edit marks (green border)
  - Edit possible points (blue border)
  - Edit assignment weights (orange border)
- **Visual Change Indicators**: Yellow highlighting shows modified values
- **Auto-Recalculation**: All totals update automatically
- **Individual Assignment %**: Shows percentage for each assignment
- **Category Totals**: Weighted averages for Tests, Assignments, etc.
- **Overall Course Grade**: Dynamically recalculated final percentage
- **Smart Handling**:
  - Converts "NHI" (Not Handed In) to 0
  - Skips non-numeric marks (absent, excused, collected)
  - Precision to 4 decimal places

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `betterschoolcloud` folder

## Usage

1. Navigate to SchoolCloud website (schoolcloud.ca)
2. On first use, accept the disclaimer
3. **On Course List page**: Edit course grades and weights, view averages
4. **On Course Detail page**: Click any course to open popup, edit individual assignments
5. Changed values appear with yellow highlighting
6. All calculations update automatically

## Technical Details

### Weighted Grade Calculation
- **Individual Assignment**: `(mark / possiblePoints) × 100`
- **Table Average**: `Σ(assignmentPercentage × weight) / Σ(weight)`
- **Section Average**: Applies table weights within sections
- **Final Grade**: Applies section weights across all sections

### Files
- `gradechanger.js`: Individual course grade editing and calculation
- `avandweightcalc.js`: Course list weighted/unweighted averages
- `backgroundsave.js`: UI enhancements and background customization
- `manifest.json`: Chrome extension configuration
- `popup.html`: Extension popup interface
- `style.css`: Custom styling

## Development

### Debug Mode
Set `DEBUG_MODE = true` in `gradechanger.js` to enable console logging for development.

### Permissions
- Runs on: `https://schoolcloud.ca/Student*` and `https://schoolcloud.ca/ParentStudent/Search`
- No special permissions required

## Credits

**Developed by**: Owen Kuang and Ronald Li
**Special Thanks To**: Youssef Soliman

## Version

Current Version: 1.5.3

## License

For educational purposes only. Use at your own risk.
