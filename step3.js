/*
 * Step 3: Remove a snowman part when there's no match for a clicked keyboard key
 */
var words = ["APPLE", "PANCAKES", "COMPUTER", "PARIS", "MICROPHONE", "PASTRY", "SNOWMAN", "CHRISTMAS",
    "SNOW", "WINTER", "REINDEER", "PRESENTS", "SANTA", "NEW YEAR", "HOLIDAY", "DECORATIONS", "JINGLE BELLS",
    "DECEMBER", "WRAPPING", "GIFTS", "ELF", "NORTH POLE", "CANDY CANE", "GINGERBREAD HOUSE", "GINGERBREAD MAN",
    "JOLY", "CAROAL", "BLIZARD", "TREE"];
var randomWord = getRandomWord(words);
var keyboardContainer = document.querySelector("#keyboard-container");

// New
var snowmanParts = [
    ".hat",
    ".face",
    ".scarf",
    ".hands",
    ".body-top",
    ".body-middle",
    ".body-bottom",
];

keyboardContainer.addEventListener("click", handleKeyboardClick);

generateHiddenWord(randomWord);

// `hasMatch` variable is new
function checkForMatch(clickedLetter) {
    var hiddenLetterElements = document.querySelectorAll(".hidden");
    var hasMatch = false;

    for (var hiddenLetterElement of hiddenLetterElements) {
        var hiddenLetter = hiddenLetterElement.textContent;
        if (hiddenLetter === clickedLetter) {
            hiddenLetterElement.classList.remove("hidden");
            hasMatch = true;
        }
    }

    return hasMatch;
}

function handleKeyboardClick(event) {
    var clickedElement = event.target;

    // prettier-ignore
    if (!clickedElement.classList.contains("letter") || clickedElement.classList.contains("selected")) return;

    clickedElement.classList.add("selected");

    var clickedLetter = clickedElement.textContent;
    var hasMatch = checkForMatch(clickedLetter);

    // New
    if (!hasMatch) {
        removeSnowmanPart();
    }
}

function generateHiddenWord(word) {
    var letters = word.split("");
    var emptyLetterContainer = document.querySelector("#empty-letter-container");

    var lettersHTML = "";
    for (var letter of letters) {
        var letterHTML = `<p class="letter-container"><span class="letter hidden">${letter}</span></p>`;
        lettersHTML += letterHTML;
    }
    emptyLetterContainer.innerHTML = lettersHTML;
}

function getRandomWord(words) {
    var randomIndex = Math.floor(Math.random() * words.length);
    var randomWord = words[randomIndex];
    return randomWord;
}

// New
function removeSnowmanPart() {
    var snowmanPart = snowmanParts.shift();
    var partsToRemove = document.querySelectorAll(snowmanPart);

    for (var partToRemove of partsToRemove) {
        partToRemove.remove();
    }
}