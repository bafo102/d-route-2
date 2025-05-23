// VARIABLE INITIALIZATION
let pasteButton = document.querySelector("#pasteBtn");
let copyButton = document.querySelector("#copyBtn");
let downloadButton = document.querySelector("#downloadBtn");
let clearButton = document.querySelector("#clearBtn");
let uploadButton = document.querySelector("#uploadBtn");
let uploadInput = document.querySelector("#upload");
let editButton = document.querySelector("#editBtn");
let deleteButton = document.querySelector("#deleteBtn");

let targetElement = '';
let targetElementType = ''; // shortcut / shortcut blank / group blank / group

let contextMenu = document.querySelector("#context-menu");
let contextmenuOverlay = document.querySelector("#contextmenu-overlay");

let editItem = document.querySelector("#edit-item");
let deleteItem = document.querySelector("#delete-item");

let dialog = document.querySelector("#dialog");
let dialogOverlay = document.querySelector("#dialog-overlay");

let dialogName = document.querySelector("#dialog-name");

let groupComponent = document.querySelector("#dialog-for-group");
let groupNameInput = document.querySelector("#group-name-input");
let groupBgInputColor = document.querySelector("#group-bg-input-color");
let groupBgInputText = document.querySelector("#group-bg-input-text");

let shortcutComponent = document.querySelector("#dialog-for-shortcut");
let shortcutNameInput = document.querySelector("#shortcut-name-input");
let linkInput = document.querySelector("#link-input");

let cancelDialog = document.querySelector("#dialog-cancel");
let saveDialog = document.querySelector("#dialog-save");

let elementToBeDeleted = '';

// CREATE SHORTCUTS BASED ON STORED DATA
createShortcut(); // has addAllEventListeners
checkAndAddBlanks(); // has updateCurrentCodes, which has convertRbgToHex and store data
rearrangeGroupIds(); // has updateCurrentCodes, which has convertRbgToHex and store data
updateHeader();

// UPLOAD DATA
function invokeUploadInput() {
    uploadInput.click();
}

function uploadFile(event) {
    // only get the first file
    console.log(event);
    const file = event.target.files[0];
    console.log('x');

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            // read data from excel
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {raw: false, defval: null}); // defval is to get the blank cell value

            // store data
            localStorage.setItem('shortcut_data', JSON.stringify(jsonData));

            // store data time
            now = new Date();
            shortcutDataTime = now.toLocaleString('vi-VN');
            localStorage.setItem('shortcut_data_time', shortcutDataTime);

            // create shortcuts based on data stored
            createShortcut();

            // check and add blank shortcuts
            checkAndAddBlanks();

            // rearrange group ids
            rearrangeGroupIds();

            // update header buttons
            updateHeader();

            // add all event listeners
            addAllEventListeners();
        };
        reader.readAsArrayBuffer(file); // Read the file as an array buffer

    } else {
        console.log('No file selected');
    }
};

// add function invokeUploadInput to uploadButton
uploadButton.addEventListener('click', invokeUploadInput);
// add function uploadFile to uploadInput
uploadInput.addEventListener('change', uploadFile);

// COPY CODES
copyButton.addEventListener('click', () => {
    data_time = localStorage.getItem('shortcut_data_time');
    storedCodes = localStorage.getItem('shortcut_data');
    storedCodesJson = JSON.parse(storedCodes);
    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(storedCodes);
    alert(`Codes copied: ${storedCodes}`);
});

// CLEAR DATA
clearButton.addEventListener('click', () => {
    if (confirm('Clear all data?')) {
        // clear shortcut data
        localStorage.removeItem('shortcut_data');
        // clear shortcut data store time
        localStorage.removeItem('shortcut_data_time');
        // update header buttons
        updateHeader();
        // restore default html
        mainDiv = document.getElementById('main');
        while (mainDiv.firstChild) {
            mainDiv.removeChild(mainDiv.firstChild);
        }
        mainDiv.innerHTML = '<div id="group-1" class="group blank only"><i class="fa-solid fa-folder-plus"></i></div>';
        // add all event listeners
        addAllEventListeners();
    }
});


// UPDATE AND STORE DATA WHEN THERE ARE CHANGES
function convertRbgToHex() {
    elementsWithStyle = document.querySelectorAll('[style]');

    for (i = 0; i < elementsWithStyle.length; ++i) {
        styleString = elementsWithStyle[i].getAttribute("style");
        hex = '';
        if (styleString.includes("rgb")) {
            rgbValuesAsString = styleString.match(/\d+/g); // Use regex to find all numbers
            rgbValuesAsNumber = rgbValuesAsString.map(Number); // Convert strings to numbers
            rHex = rgbValuesAsNumber[0].toString(16).padStart(2, '0'); // 2 is the length, "0" will be added if the string is only 1-digit long
            gHex = rgbValuesAsNumber[1].toString(16).padStart(2, '0');
            bHex = rgbValuesAsNumber[2].toString(16).padStart(2, '0');
            hex = `#${rHex}${gHex}${bHex}`;
            elementsWithStyle[i].setAttribute("style", `background-color: ${hex}`);
        }
    }
}

// FUNCTION TO UPDATE CURRENT CODES
function updateCurrentCodes() {
    convertRbgToHex();
    // clear current codes
    currentCodesJson = [];

    // find all groupID from class "group"
    groupElements = document.querySelectorAll('.group');
    groupIDs = Array.from(groupElements).map(element => element.id);

    // loop thru all groupIDs
    for (i = 0; i < groupIDs.length; ++i) {
        // find groupName
        groupID = groupIDs[i];
        group = document.querySelector(`#${groupID}`);

        // if group not blank
        if (!group.classList.contains("blank")) {
            groupName = group.children[1].textContent;
            // find groupBg
            groupBg = group.children[1].getAttribute('style').slice(-7);
            // loop thru all shortcuts
            shortcutContainer = group.children[2];
            for (j = 0; j < shortcutContainer.children.length; j++) {
                shortcut = shortcutContainer.children[j];
                shortcutName = '';
                link = '';
                // if shortcut not blank
                if (!shortcut.classList.contains('blank')) {
                    // shortcutName, link
                    shortcutName = shortcut.children[2].textContent;
                    link = shortcut.children[0].href;
                }
                else {
                    shortcutName = null;
                    link = null;
                }
                toStore = {
                    "groupID": groupID,
                    "groupName": groupName,
                    "groupBg": groupBg,
                    "shortcutName": shortcutName,
                    "link": link
                };
                currentCodesJson.push(toStore);
            }
        }
        else { // if group blank
            groupName = null;
            groupBg = null;
            shortcutName = null;
            link = null;
            toStore = {
                "groupID": groupID,
                "groupName": groupName,
                "groupBg": groupBg,
                "shortcutName": shortcutName,
                "link": link
            };
            currentCodesJson.push(toStore);
        };
    }

    // check last group and remove from codes if blank
    lastObject = currentCodesJson[currentCodesJson.length - 1];
    if (lastObject) {
        if (lastObject["groupName"] == null && lastObject["groupBg"] == null) {
            currentCodesJson.pop();
        }
    }

    currentCodes = JSON.stringify(currentCodesJson);
    
    if (currentCodes != "[]") {
        // store data
        localStorage.setItem('shortcut_data', currentCodes);

        // store data time
        now = new Date();
        shortcutDataTime = now.toLocaleString('vi-VN');
        localStorage.setItem('shortcut_data_time', shortcutDataTime);
    }
}

// PASTE CODES
pasteButton.addEventListener('click', () => {
    codes = prompt('Paste your codes here:');
    if (codes && codes != "null" && codes != null) {
        // store data
        localStorage.setItem('shortcut_data', codes);
        // update data info
        now = new Date();
        shortcutDataTime = now.toLocaleString('vi-VN');
        localStorage.setItem('shortcut_data_time', shortcutDataTime);
        // create shortcuts
        createShortcut();

        // check and add blank shortcuts
        checkAndAddBlanks();

        // rearrange group ids
        rearrangeGroupIds();

        // update header button
        updateHeader();
    }
});

// FUNCTION TO CREATE SHORTCUTS
function createShortcut() {
    storedCodes = localStorage.getItem('shortcut_data');
    if (storedCodes) {
        storedCodesJson = JSON.parse(localStorage.getItem('shortcut_data'));
        // delete all current elements in main
        mainDiv = document.getElementById('main');
        while (mainDiv.firstChild) {
            mainDiv.removeChild(mainDiv.firstChild);
        }
        // loop thru all objects in Json
        for (i = 0; i < storedCodesJson.length; i++) {
            groupID = storedCodesJson[i]["groupID"];
            groupName = storedCodesJson[i]["groupName"];
            groupBg = storedCodesJson[i]["groupBg"];
            shortcutName = storedCodesJson[i]["shortcutName"];
            link = storedCodesJson[i]["link"];

            // create normal group, ignore blank group from data
            if (groupName != null & groupBg != null) {
                // create group, handle, group-name, shortcut-container if not available
                if (!mainDiv.querySelector(`#${groupID}`)) {
                    // create group
                    newGroup = document.createElement('div');
                    newGroup.setAttribute("id", `${groupID}`); // set id
                    newGroup.classList.add("group"); // add class
                    mainDiv.appendChild(newGroup); // add group to main

                    // create handle
                    newHandle = document.createElement('div');
                    newHandle.classList.add("handle"); // add class
                    newHandle.innerHTML = '<i class="fa-solid fa-arrows-up-down"></i>'; // add icon
                    newGroup.appendChild(newHandle); // add handle to group

                    // create group-name
                    newGroupName = document.createElement('div');
                    newGroupName.classList.add("group-name"); // add class
                    newGroupName.setAttribute("style", `background-color: ${groupBg}`); // set style
                    newGroupName.textContent = groupName; // set textContent
                    newGroup.appendChild(newGroupName); // add group-name to group

                    // create shorcut-container
                    newShortcutContainer = document.createElement('div');
                    newShortcutContainer.classList.add("shortcut-container"); // add class
                    newGroup.appendChild(newShortcutContainer); // add shorcut-container to group
                }
                
                // re-declare parent div
                shortcutContainer = mainDiv.querySelector(`#${groupID} .shortcut-container`);

                // create shortcut
                if (shortcutName == null || link == null) { // create blank shorcut
                    newBlankShortcut = document.createElement('div');
                    newBlankShortcut.classList.add("shortcut"); // add class
                    newBlankShortcut.classList.add("blank"); // add class
                    newBlankShortcut.innerHTML = '<i class="fa-solid fa-plus"></i>'; // add icon
                    shortcutContainer.appendChild(newBlankShortcut); // add shorcut blank to shortcut-container

                    // create a
                    newA = document.createElement('a');
                    newBlankShortcut.appendChild(newA); // add a to shortcut
                }
                else { // create normal shortcut
                    newShortcut = document.createElement('div');
                    newShortcut.classList.add("shortcut"); // add class zz
                    shortcutContainer.appendChild(newShortcut); // add shorcut to shortcut-container

                    // create a
                    newA = document.createElement('a');
                    newA.href = link; // set link
                    newA.title = shortcutName; // set title
                    newShortcut.appendChild(newA); // add a to shortcut

                    // create icon
                    newIcon = document.createElement('img');

                    
                    // function to get favicon
                    function faviconURL(u) { // https://developer.chrome.com/docs/extensions/how-to/ui/favicons
                        url = new URL(chrome.runtime.getURL("/_favicon/"));
                        url.searchParams.set("pageUrl", u);
                        url.searchParams.set("size", "32");
                        return url.toString();
                    }

                    newIcon.src = faviconURL(link)
                    newShortcut.appendChild(newIcon); // add a to shortcut

                    // create shortcut-name
                    newShortcutName = document.createElement('div');
                    newShortcutName.classList.add("shortcut-name"); // add class
                    newShortcutName.textContent = shortcutName; // set textContent
                    newShortcut.appendChild(newShortcutName); // add shorcut-name to shortcut
                }
            }
        }
        // make group sortable
        $( function() {
            $( "#main" ).sortable({
            placeholder: "placeholder-group",
            handle: ".handle",
            stop: function() {
                checkAndAddBlanks(); // already have updateCurrentCodes and convertRbgToHex
                rearrangeGroupIds();
            }
            });
        } );
        
        $( function() {
        $( ".shortcut-container" ).sortable({
            // helper: "clone",
            forceHelperSize: true,
            connectWith: ".shortcut-container",
            tolerance: "pointer",
            stop: function() {
                checkAndAddBlanks(); // already have updateCurrentCodes and convertRbgToHex
                rearrangeGroupIds();
            }
        })
        } );
    addAllEventListeners();
    }
};


// FUNCTION TO CHECK AND ADD BLANK SHORTCUTS AND GROUPS
function checkAndAddBlanks() {
    // find all groupID from class "group"
    groupElements = document.querySelectorAll('.group');
    groupIDs = Array.from(groupElements).map(element => element.id);
    lastID = groupIDs[groupIDs.length - 1]
    lastGroupElement = document.querySelector(`#${lastID}`);

    // only execute if there is a group
    if (lastGroupElement != null) {

        // check and create blank group
        if (!lastGroupElement.classList.contains("blank")) {
            newBlankGroup = document.createElement('div');
            newBlankGroup.setAttribute("id", `group-${groupIDs.length + 1}`); // set id
            newBlankGroup.classList.add("group"); // add class
            newBlankGroup.classList.add("blank"); // add class
            newBlankGroup.innerHTML = '<i class="fa-solid fa-folder-plus"></i>'; // add icon
            document.querySelector("#main").appendChild(newBlankGroup); // add shorcut blank to main
        }
        
        // loop thru all groupIDs to check and create blank shortcut
        for (i = 0; i < groupIDs.length; ++i) {
            // find groupName
            groupID = groupIDs[i];
            group = document.querySelector(`#${groupID}`);
            
            // if shortcutContainer not blank
            if (!group.classList.contains("blank")) {
                shortcutContainer = group.children[2];
                numberOfShortcuts = shortcutContainer.children.length;
                lastShortcut = shortcutContainer.children[numberOfShortcuts - 1];

                // add shortcut if shortcutContainer has less than 10 shortcuts
                if (numberOfShortcuts < 10 && !lastShortcut.classList.contains('blank')) {
                    newBlankShortcut = document.createElement('div');
                    newBlankShortcut.classList.add("shortcut"); // add class
                    newBlankShortcut.classList.add("blank"); // add class
                    newBlankShortcut.innerHTML = '<i class="fa-solid fa-plus"></i>'; // add icon
                    shortcutContainer.appendChild(newBlankShortcut); // add shorcut blank to shortcut-container

                    // create a
                    newA = document.createElement('a');
                    // newA.href = ""; // set link
                    // newA.title = ""; // set title
                    newBlankShortcut.appendChild(newA); // add a to shortcut
                }

                // remove last shortcut if shortcutContainer has more than 10 shortcuts
                if (numberOfShortcuts > 10 && lastShortcut.classList.contains('blank')) {
                    lastShortcut = shortcutContainer.children[numberOfShortcuts - 1];
                    lastShortcut.remove();
                }
            }
        }
    };
    // update codes
    updateCurrentCodes();
};

// FUNCTION TO REARRANGE GROUP IDS
function rearrangeGroupIds() {
    // find all groups as children of main
    main = document.querySelector('#main');
    // loop thru all children
    for (i = 0; i < main.children.length; ++i) {
        group = main.children[i];
        group.id = `group-${i+1}`;
    }
    // update codes
    updateCurrentCodes();
};

// UPDATE HEADER BUTTONS
function updateHeader() {
    storedCodes = localStorage.getItem('shortcut_data');
    if (!storedCodes) {
        copyButton.disabled = true;
        downloadButton.disabled = true;
        clearButton.disabled = true;
        editButton.disabled = true;
        deleteButton.disabled = true;
    }
    else {
        copyButton.disabled = false;
        downloadButton.disabled = false;
        clearButton.disabled = false;
        editButton.disabled = false;
        deleteButton.disabled = false;
    }
}

// DOWNLOAD DATA
downloadButton.addEventListener('click', () => {
    storedCodes = localStorage.getItem('shortcut_data');
    storedCodesJson = JSON.parse(storedCodes);
    // Create a new workbook and a worksheet
    wb = XLSX.utils.book_new();
    ws_data = storedCodesJson;
    ws = XLSX.utils.json_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "data");

    // Generate a file and trigger the download
    saveTime = getFormattedDateAndTime();
    XLSX.writeFile(wb, `Shortcut Data - ${saveTime}.xlsx`);
});

function getFormattedDateAndTime() {
    now = new Date();
    year = now.getFullYear();
    month = String(now.getMonth() + 1).padStart(2, '0');
    day = String(now.getDate()).padStart(2, '0');
    hours = String(now.getHours()).padStart(2, '0');
    minutes = String(now.getMinutes()).padStart(2, '0');
    seconds = String(now.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}.${minutes}.${seconds}`;
}

// ENABLE SHORTCUT-EDIT MODE
editButton.addEventListener('click', () => {
    // if enabled
    if (editButton.classList.contains("enabled")) {
        editButton.classList.remove("enabled");
        deleteButton.disabled = false;
    }
    // if disabled
    else {
        editButton.classList.add("enabled");
        deleteButton.disabled = true;
    }
});

// ENABLE SHORTCUT-DELETE MODE
deleteButton.addEventListener('click', () => {
    if (deleteButton.classList.contains("enabled")) {
        deleteButton.classList.remove("enabled");
        editButton.disabled = false;
    }
    else {
        deleteButton.classList.add("enabled");
        editButton.disabled = true;
    }
});


// MAKE SORTABLES
// group
$( function() {
  $( "#main" ).sortable({
    placeholder: "placeholder-group",
    handle: ".handle",
    stop: function() {
        checkAndAddBlanks(); // already have updateCurrentCodes and convertRbgToHex
        rearrangeGroupIds();
    }
  });
} );

// shortcut
$( function() {
$( ".shortcut-container" ).sortable({
    // helper: "clone",
    forceHelperSize: true,
    connectWith: ".shortcut-container",
    tolerance: "pointer",
    stop: function() {
        checkAndAddBlanks(); // already have updateCurrentCodes and convertRbgToHex
        rearrangeGroupIds();
    }
})
} );

// dialog
$( function() {
    $( "#dialog" ).draggable();
  } );



// TARGET ELEMENT
function getTarget(event) {
    clickedElement = event.target;
    console.log('clickedElement: ',clickedElement);
    // if shortcut
    if (clickedElement.tagName == "A" && !clickedElement.parentNode.classList.contains("blank")) {
        targetElement = clickedElement.parentNode;
        targetElementType = 'shortcut';
    }

    // if shortcut blank
    else if (clickedElement.className == 'fa-solid fa-plus') { // if clicking on <i> of a blank shortcut
        targetElement = clickedElement.parentNode;
        targetElementType = 'shortcut blank';
    }
    else if (clickedElement.parentNode.classList.contains("shortcut") && clickedElement.parentNode.classList.contains("blank")) {
        targetElement = clickedElement.parentNode;
        targetElementType = 'shortcut blank';
    }

    // if group blank
    else if (clickedElement.className == 'fa-solid fa-folder-plus') { // if clicking on <i> of a blank group
        targetElement = clickedElement.parentNode;
        targetElementType = 'group blank';
    }
    else if (clickedElement.className == "group blank" || clickedElement.className == "group blank only") {
        targetElement = clickedElement;
        targetElementType = 'group blank';
    }

    // if group
    else if (clickedElement.className == 'group') {
        targetElement = clickedElement;
        targetElementType = 'group';
    }
    else {
        targetElement = clickedElement.parentNode;
        targetElementType = 'group';
    }
    
    // add class to target
    // targetElement.classList.add("target");

    console.log('targetElement: ',targetElement);
    console.log('targetElementType: ',targetElementType);
}

// add function getTarget to shortcut, shortcut blank, group blank when left-clicking
document.querySelectorAll(".shortcut, .group.blank").forEach(elem => (elem.addEventListener("click", getTarget)));

// add function getTarget to shortcut, shortcut blank, group when right-clicking
document.querySelectorAll(".shortcut, .group:not(.blank)").forEach(elem => (elem.addEventListener("contextmenu", getTarget)));


// CONTEXT MENU


// OPEN CONTEXT MENU
// function openContextMenu(event) {
    // event.preventDefault(); 
    // show context menu at mouse
    // contextMenu.hidden = false;
    // contextMenu.style.top = event.pageY + "px";
    // contextMenu.style.left = event.pageX + "px";
    // show contextmenuOverlay
    // contextmenuOverlay.hidden = false;
// }

// add function openContextMenu to shortcut, shortcut blank, group when right-clicking
// document.querySelectorAll(".shortcut, .group:not(.blank)").forEach(elem => (elem.addEventListener("contextmenu", openContextMenu)));

// CLOSE CONTEXT MENU
function closeContextMenu() {
    // hide context menu
    contextMenu.hidden = true;
    // hide contextmenuOverlay
    contextmenuOverlay.hidden = true;
    // reset target
    resetTarget();
}

// add function closeContextMenu to contextmenuOverlay
contextmenuOverlay.addEventListener('click', closeContextMenu);


// DIALOG


// OPEN DIALOG
function showDialogComponent() { // shortcut / shortcut blank / group blank / group
    // shortcut
    if (targetElementType == "shortcut") {
        // edit dialog name
        dialogName.textContent = "Edit Shortcut";

        // hide group component
        groupComponent.hidden = true;
        groupNameInput.value = '';
        groupBgInputColor.value = '';
        groupBgInputText.value = '';

        // show shortcut component
        shortcutComponent.hidden = false;
        shortcutNameInput.value = targetElement.children[1].textContent;
        linkInput.value = targetElement.children[0].href;
    }

    // shortcut blank
    else if (targetElementType == "shortcut blank") {
        // edit dialog name
        dialogName.textContent = "Create New Shortcut";

        // hide group component
        groupComponent.hidden = true;
        groupNameInput.value = '';
        groupBgInputColor.value = '';
        groupBgInputText.value = '';

        // show shortcut component
        shortcutComponent.hidden = false;
        shortcutNameInput.value = '';
        linkInput.value = '';
    }

    // group
    else if (targetElementType == "group") {
        // edit dialog name
        dialogName.textContent = "Edit Group";
    
        // show group component
        groupComponent.hidden = false;
        groupNameInput.value = targetElement.children[1].textContent;
        groupBgInputColor.value = targetElement.children[1].getAttribute("style").slice(-7);
        groupBgInputText.value = targetElement.children[1].getAttribute("style").slice(-7);

        // hide shortcut component
        shortcutComponent.hidden = true;
        shortcutNameInput.value = '';
        linkInput.value = '';
    }

    // group blank
    else if (targetElementType == "group blank") {
        // edit dialog name
        dialogName.textContent = "Create New Group";
    
        // show group component
        groupComponent.hidden = false;
        groupNameInput.value = '';
        groupBgInputColor.value = '';
        groupBgInputText.value = '';

        // hide shortcut component
        shortcutComponent.hidden = true;
        shortcutNameInput.value = '';
        linkInput.value = '';
    }
}

function openDialog() {
    // show component
    showDialogComponent();
    // show dialog
    dialog.hidden = false;
    // show dialogOverlay
    dialogOverlay.hidden = false;
    // hide contextMenu
    contextMenu.hidden = true;
    // hide contextmenuOverlay
    contextmenuOverlay.hidden = true;
}

// add function openDialog to editItem
editItem.addEventListener('click', openDialog);

// add function openDialog to shortcut blank, group blank when left-clicking
document.querySelectorAll(".blank").forEach(elem => (elem.addEventListener("click", openDialog)));

// CLOSE DIALOG
function resetTarget() {
    // clear all class target from html
    document.querySelectorAll(".target").forEach(elem => {
        elem.classList.remove("target");
    });
    // reset targetElement
    targetElement = '';
    // reset targetElementType
    targetElementType = '';
}

function closeDialog() {
    // hide dialog
    dialog.hidden = true;
    // hide dialogOverlay
    dialogOverlay.hidden = true;
    // reset target
    resetTarget();
}

// add function closeDialog to cancelDialog
cancelDialog.addEventListener('click', closeDialog);

// add function closeDialog to dialogOverlay
dialogOverlay.addEventListener('click', closeDialog);


// DELETE GROUP AND SHORTCUT
function deletegGroupAndShortcut() {
    // delete element
    confirmMessage = '';
    if (targetElementType == "shortcut") {
        confirmMessage = "Delete shortcut?"
    }
    else if (targetElementType == "shortcut blank") {
        confirmMessage = "Delete blank shortcut?"
    }
    else {
        confirmMessage = "Delete group and shortcuts inside?"
    }

    if (confirm(confirmMessage)) {
        console.log('targetElement: ',targetElement);
        elementToBeDeleted = targetElement;
        console.log("elementToBeDeleted: ", elementToBeDeleted);
        elementToBeDeleted.remove();
        elementToBeDeleted = '';
    }

    // close context menu
    closeContextMenu();

    // update codes
    checkAndAddBlanks(); // already have updateCurrentCodes and convertRbgToHex
    rearrangeGroupIds();
}

// add function deletegGroupAndShortcut to deleteItem
deleteItem.addEventListener('click', deletegGroupAndShortcut);



// SAVE DIALOG

function syncColorInputs(inputChanged) {
    if (inputChanged == 'groupBgInputColor') {
        groupBgInputText.value = groupBgInputColor.value;
    }
    else if (inputChanged == 'groupBgInputText') {
        groupBgInputColor.value = groupBgInputText.value;
    }
}

// add function syncColorInputs to groupBgInputColor, groupBgInputText
groupBgInputColor.addEventListener('input', () => {syncColorInputs('groupBgInputColor');});
groupBgInputText.addEventListener('input', () => {syncColorInputs('groupBgInputText');});

function saveDialogChanges() {
    // update the changes
    if (targetElementType == "shortcut") { // shortcut
        targetElement.children[1].textContent = shortcutNameInput.value;
        targetElement.children[0].href = linkInput.value;
    }

    else if (targetElementType == "shortcut blank") { // shortcut blank
        // remove icon
        targetElement.children[0].remove();
        // update link
        targetElement.children[0].href = linkInput.value;
        // set title
        targetElement.children[0].title = shortcutNameInput.value
        // create icon
        newIcon = document.createElement('img');
        // function to get favicon
        function faviconURL(u) { // https://developer.chrome.com/docs/extensions/how-to/ui/favicons
            url = new URL(chrome.runtime.getURL("/_favicon/"));
            url.searchParams.set("pageUrl", u);
            url.searchParams.set("size", "32");
            return url.toString();
        }

        newIcon.src = faviconURL(linkInput.value)
        newShortcut.appendChild(newIcon); // add a to shortcut

        // create shortcut-name
        newShortcutName = document.createElement('div');
        newShortcutName.classList.add("shortcut-name"); // add class
        newShortcutName.textContent = shortcutNameInput.value; // set textContent
        targetElement.appendChild(newShortcutName); // add shorcut-name to targetElement zz
        // update blank class
        targetElement.classList.remove("blank");

    }
    else if (targetElementType == "group") { // group
        targetElement.children[1].textContent = groupNameInput.value;
        targetElement.children[1].setAttribute("style", `background-color: ${groupBgInputColor.value}`);
    }
    else if (targetElementType == "group blank") { // group blank
        // remove icon
        targetElement.children[0].remove();
        // create handle
        newHandle = document.createElement('div');
        newHandle.classList.add("handle"); // add class
        newHandle.innerHTML = '<i class="fa-solid fa-arrows-up-down"></i>'; // add icon
        targetElement.appendChild(newHandle); // add handle to targetElement

        // create group-name
        newGroupName = document.createElement('div');
        newGroupName.classList.add("group-name"); // add class
        newGroupName.setAttribute("style", `background-color: ${groupBgInputColor.value}`); // set style
        newGroupName.textContent = groupNameInput.value; // set textContent
        targetElement.appendChild(newGroupName); // add group-name to targetElement

        // create shorcut-container
        newShortcutContainer = document.createElement('div');
        newShortcutContainer.classList.add("shortcut-container"); // add class
        targetElement.appendChild(newShortcutContainer); // add shorcut-container to targetElement

        // create blank shorcut
        newBlankShortcut = document.createElement('div');
        newBlankShortcut.classList.add("shortcut"); // add class
        newBlankShortcut.classList.add("blank"); // add class
        newBlankShortcut.innerHTML = '<i class="fa-solid fa-plus"></i>'; // add icon
        newShortcutContainer.appendChild(newBlankShortcut); // add shorcut blank to newShortcutContainer

        // create a
        newA = document.createElement('a');
        newBlankShortcut.appendChild(newA); // add a to newBlankShortcut

        // update blank class
        targetElement.classList.remove("blank");

    }
    // update codes
    checkAndAddBlanks(); // already have updateCurrentCodes and convertRbgToHex
    rearrangeGroupIds();
    // close dialog
    closeDialog();
    addAllEventListeners();
    updateHeader();
    // make sortable
    $( function() {
        $( ".shortcut-container" ).sortable({
            // helper: "clone",
            forceHelperSize: true,
            connectWith: ".shortcut-container",
            tolerance: "pointer",
            stop: function() {
                checkAndAddBlanks(); // already have updateCurrentCodes and convertRbgToHex
                rearrangeGroupIds();
            }
        })
    } );
}


// add function saveDialogChanges to saveDialog
saveDialog.addEventListener('click', saveDialogChanges);


// ADD EVENT LISTENER
function addAllEventListeners() {
    // add function getTarget to shortcut, shortcut blank, group blank when left-clicking
    document.querySelectorAll(".shortcut, .group.blank").forEach(elem => (elem.addEventListener("click", getTarget)));

    // add function getTarget to shortcut, shortcut blank, group when right-clicking
    document.querySelectorAll(".shortcut, .group:not(.blank)").forEach(elem => (elem.addEventListener("contextmenu", getTarget)));

    // add function openContextMenu to shortcut, shortcut blank, group when right-clicking
    // document.querySelectorAll(".shortcut, .group:not(.blank)").forEach(elem => (elem.addEventListener("contextmenu", openContextMenu)));

    // add function closeContextMenu to contextmenuOverlay
    contextmenuOverlay.addEventListener('click', closeContextMenu);

    // add function openDialog to editItem
    editItem.addEventListener('click', openDialog);

    // add function openDialog to shortcut blank, group blank when left-clicking
    document.querySelectorAll(".blank").forEach(elem => (elem.addEventListener("click", openDialog)));

    // add function closeDialog to cancelDialog
    cancelDialog.addEventListener('click', closeDialog);

    // add function closeDialog to dialogOverlay
    dialogOverlay.addEventListener('click', closeDialog);

    // add function deletegGroupAndShortcut to deleteItem
    deleteItem.addEventListener('click', deletegGroupAndShortcut);

    // add function syncColorInputs to groupBgInputColor, groupBgInputText
    groupBgInputColor.addEventListener('input', () => {syncColorInputs('groupBgInputColor');});
    groupBgInputText.addEventListener('input', () => {syncColorInputs('groupBgInputText');});

    // add function saveDialogChanges to saveDialog
    saveDialog.addEventListener('click', saveDialogChanges);
}