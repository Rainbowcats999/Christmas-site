var words = ["APPLE", "PANCAKES", "COMPUTER", "PARIS", "MICROPHONE", "PASTRY", "SNOWMAN", "CHRISTMAS",
    "SNOW", "WINTER", "REINDEER", "PRESENTS", "SANTA", "NEWYEAR", "HOLIDAY", "DECORATIONS", "JINGLEBELLS",
    "DECEMBER", "WRAPPING", "GIFTS", "ELF", "NORTHPOLE", "CANDYCANE", "GINGERBREADHOUSE", "GINGERBREADMAN",
    "JOLLY", "CAROL", "BLIZZARD", "TREE", "RED", "GREEN"];
var randomWord = getRandomWord(words);
var keyboardContainer = document.querySelector("#keyboard-container");
var snowmanContainer = document.querySelector("#snowman-container");

// Save original HTML so we can restore on restart
var originalKeyboardHTML = keyboardContainer.innerHTML;
var originalSnowmanHTML = snowmanContainer.innerHTML;

// Track game state
var gameActive = true;

// snowmanParts are resettable (ensure proper selectors, note the dot on .hands)
var snowmanParts = [];
function resetSnowmanParts() {
    snowmanParts = [
        ".hat",
        ".face",
        ".scarf",
        ".hands",
        ".body-top",
        ".body-middle",
        ".body-bottom",
    ];
}

resetSnowmanParts();
// Audio / mute
var audioContext = null;
var isMuted = false;
function ensureAudio() {
    if (audioContext == null) audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(type) {
    if (isMuted) return;
    ensureAudio();
    var ctx = audioContext;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    var now = ctx.currentTime;
    if (type === "correct") {
        o.frequency.value = 880;
        g.gain.value = 0.04;
        o.start(now);
        o.stop(now + 0.08);
    } else if (type === "incorrect") {
        o.frequency.value = 220;
        g.gain.value = 0.06;
        o.start(now);
        o.stop(now + 0.16);
    } else if (type === "win") {
        var freqs = [880, 1100, 1320];
        freqs.forEach(function (f, i) {
            var o2 = ctx.createOscillator();
            var g2 = ctx.createGain();
            o2.connect(g2);
            g2.connect(ctx.destination);
            o2.frequency.value = f;
            g2.gain.value = 0.02;
            var t = now + i * 0.12;
            o2.start(t);
            o2.stop(t + 0.12);
        });
    } else if (type === "lose") {
        o.frequency.value = 120;
        g.gain.value = 0.08;
        o.start(now);
        o.stop(now + 0.6);
    }
}

// scoreboard (localStorage)
var scoreboard = { wins: 0, losses: 0, bestStreak: 0, currentStreak: 0 };
function loadScoreboard() {
    try {
        var raw = localStorage.getItem("snowmanScore");
        if (raw) scoreboard = JSON.parse(raw);
    } catch (e) {
        /* ignore */
    }
    updateScoreboardUI();
}

function saveScoreboard() {
    try {
        localStorage.setItem("snowmanScore", JSON.stringify(scoreboard));
    } catch (e) {}
}

function updateScoreboardUI() {
    var winsEl = document.querySelector("#wins");
    var lossesEl = document.querySelector("#losses");
    var bestEl = document.querySelector("#best-streak");
    if (winsEl) winsEl.textContent = scoreboard.wins;
    if (lossesEl) lossesEl.textContent = scoreboard.losses;
    if (bestEl) bestEl.textContent = scoreboard.bestStreak;
}

// mute button hookup
var muteBtn = document.querySelector("#mute-btn");
if (muteBtn) {
    try {
        var m = localStorage.getItem("snowmanMuted");
        if (m === "true") {
            isMuted = true;
            muteBtn.textContent = "🔇";
            muteBtn.setAttribute("aria-pressed", "true");
        }
    } catch (e) {}
    muteBtn.addEventListener("click", function () {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? "🔇" : "🔊";
        muteBtn.setAttribute("aria-pressed", isMuted ? "true" : "false");
        try {
            localStorage.setItem("snowmanMuted", String(isMuted));
        } catch (e) {}
    });
}

loadScoreboard();

keyboardContainer.addEventListener("click", handleKeyboardClick);

generateHiddenWord(randomWord);

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

    if (hasMatch) playTone("correct");
    return hasMatch;
}

// function checkForWinner() {
//   var hiddenLetterElements = document.querySelectorAll(".hidden");

//   if (hiddenLetterElements.length === 0) {
//     keyboardContainer.innerHTML = `
//       <button class="win-btn">
//         🎄 You Win!
//       </button>
//     `;
//   }
// }

// function checkForWinner() {
//   var hiddenLetterElements = document.querySelectorAll(".hidden");

//   if (hiddenLetterElements.length === 0) {
//     keyboardContainer.innerHTML = `
//       <button class="win-btn">
//         🎄 You Win!
//       </button>
//     `;
//   }
// }


function checkForLoser() {
    if (snowmanParts.length === 0) {
        gameActive = false;
        document.querySelector("#snowman-container").innerHTML = "<h2>You lost, game over!</h2>";
        keyboardContainer.innerHTML = `<h2>The word was: ${randomWord}</h2><button id="restart-btn">Play Again</button>`;
        var restartBtn = document.querySelector("#restart-btn");
        restartBtn.addEventListener("click", initGame);
        // scoreboard
        scoreboard.losses += 1;
        scoreboard.currentStreak = 0;
        saveScoreboard();
        updateScoreboardUI();
        playTone("lose");
    }
}

function checkForWinner() {
    var hiddenLetterElements = document.querySelectorAll(".hidden");
    if (hiddenLetterElements.length === 0) {
        gameActive = false;
        keyboardContainer.innerHTML = "<h2>You win!</h2><button id=\"restart-btn\">Play Again</button>";
        var restartBtn = document.querySelector("#restart-btn");
        restartBtn.addEventListener("click", initGame);
        // scoreboard
        scoreboard.wins += 1;
        scoreboard.currentStreak += 1;
        if (scoreboard.currentStreak > scoreboard.bestStreak) scoreboard.bestStreak = scoreboard.currentStreak;
        saveScoreboard();
        updateScoreboardUI();
        playTone("win");
    }
}

function handleKeyboardClick(event) {
    var clickedElement = event.target;

    // ignore clicks when the game is over
    if (!gameActive) return;

    // prettier-ignore
    if (!clickedElement.classList.contains("letter") || clickedElement.classList.contains("selected")) return;

    clickedElement.classList.add("selected");

    var clickedLetter = clickedElement.textContent;
    var hasMatch = checkForMatch(clickedLetter);

    if (!hasMatch) {
        removeSnowmanPart();
        checkForLoser();
    } else {
        checkForWinner();
    }
}

function initGame() {
    // reset runtime state
    gameActive = true;
    resetSnowmanParts();

    // restore UI content
    keyboardContainer.innerHTML = originalKeyboardHTML;
    snowmanContainer.innerHTML = originalSnowmanHTML;

    // choose a new word and generate hidden letters
    randomWord = getRandomWord(words);
    generateHiddenWord(randomWord);
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

function removeSnowmanPart() {
    var snowmanPart = snowmanParts.shift();
    var partsToRemove = document.querySelectorAll(snowmanPart);
    for (var partToRemove of partsToRemove) {
        // animate then remove when transition finishes
        partToRemove.classList.add("removing");
        partToRemove.addEventListener(
            "transitionend",
            function (ev) {
                try {
                    ev.target.remove();
                } catch (err) {}
            },
            { once: true }
        );
    }
    // play a sound for incorrect
    playTone("incorrect");
}

// Support real keyboard input (A-Z)
window.addEventListener("keydown", function (e) {
    if (!gameActive) return;
    var key = e.key.toUpperCase();
    if (!/^[A-Z]$/.test(key)) return;
    // find matching letter element that is not yet selected
    var letters = document.querySelectorAll("#keyboard-container .letter");
    for (var letterEl of letters) {
        if (letterEl.textContent === key && !letterEl.classList.contains("selected")) {
            // simulate click for consistent behavior
            letterEl.click();
            break;
        }
    }
});