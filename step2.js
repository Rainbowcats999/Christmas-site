/*
 * Step 2: Check for a match when clicking a keyboard key
 */
var words = ["APPLE", "PANCAKES", "COMPUTER", "PARIS", "MICROPHONE", "PASTRY", "SNOWMAN", "CHRISTMAS",
    "SNOW", "WINTER", "REINDEER", "PRESENTS", "SANTA", "NEWYEAR", "HOLIDAY", "DECORATIONS", "JINGLEBELLS",
    "DECEMBER", "WRAPPING", "GIFTS", "ELF", "NORTHPOLE", "CANDYCANE", "GINGERBREADHOUSE", "GINGERBREADMAN",
    "JOLY", "CAROAL", "BLIZARD", "TREE"];
var randomWord = getRandomWord(words);
var keyboardContainer = document.querySelector("#keyboard-container");

keyboardContainer.addEventListener("click", handleKeyboardClick);

generateHiddenWord(randomWord);

// New
function checkForMatch(clickedLetter) {
    var hiddenLetterElements = document.querySelectorAll(".hidden");

    for (var hiddenLetterElement of hiddenLetterElements) {
        var hiddenLetter = hiddenLetterElement.textContent;
        if (hiddenLetter === clickedLetter) {
            hiddenLetterElement.classList.remove("hidden");
        }
    }
}

function handleKeyboardClick(event) {
    var clickedElement = event.target;

    // prettier-ignore
    if (!clickedElement.classList.contains("letter") || clickedElement.classList.contains("selected")) return;

    clickedElement.classList.add("selected");

    // New
    var clickedLetter = clickedElement.textContent;
    checkForMatch(clickedLetter);
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