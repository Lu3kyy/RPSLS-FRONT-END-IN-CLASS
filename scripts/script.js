//-------Game State Variables-------//
let aMode = "cpu"; // "cpu" or "human"

// in pvp player 1 is always the first to play
// we store player ones choice temp until player 2 has played
let aPendingChoice = "";

//track how many ties
// track total wins for each player
let aP1Score = 0;
let aP2Score = 0;
let aTies = 0;

//--------API CONFIGURATION--------//
// CHANGE THIS TO OUR API ENDPOINT THAT WILL RETURN A RANDOM MOVE
//EXAMPLE OPTIONS YOUR API COULD RETURN ROCK PAPER OR SCISSORS
//create a var to hold our url
const aCpuApiUrl =
  "https://guptilllsg2526-fqapfdeffbdegwc5.westus3-01.azurewebsites.net/api/Game/random";

//---------DOM references---------//
// Gets the CPU mode button from the HTML
const aBtnModeCpu = document.getElementById("btnModeCpu");

// Gets the PVP mode button from the HTML
const aBtnModePvp = document.getElementById("btnModePvp");

// Gets the text element that explains the current mode
const aModeHint = document.getElementById("modeHint");

// Gets the element that displays Player 1's choice
const aP1PickEl = document.getElementById("p1Pick");

// Gets the element that displays Player 2's choice
const aP2PickEl = document.getElementById("p2Pick");

// Gets the element that displays the result of the round
const aRoundResultEl = document.getElementById("roundResult");

// Gets the entire Player 2 section (hidden in CPU mode)
const aP2Section = document.getElementById("p2Section");

// Gets the hint text shown to Player 2
const aP2Hint = document.getElementById("p2Hint");

// Gets the element that displays Player 1's score
const aP1ScoreEl = document.getElementById("p1Score");

// Gets the element that displays Player 2's score
const aP2ScoreEl = document.getElementById("p2Score");

// Gets the element that displays tie count
const aTiesEl = document.getElementById("ties");

// Gets the "Play Again" button
const aBtnPlayAgain = document.getElementById("btnPlayAgain");

// Gets the "Reset Game" button
const aBtnReset = document.getElementById("btnReset");

// Player 1 choice buttons
const aBtnP1Rock = document.getElementById("btnP1Rock");
const aBtnP1Paper = document.getElementById("btnP1Paper");
const aBtnP1Scissors = document.getElementById("btnP1Scissors");
const aBtnP1Lizard = document.getElementById("btnP1Lizard");
const aBtnP1Spock = document.getElementById("btnP1Spock");

// Player 2 choice buttons (only used in PVP mode)
const aBtnP2Rock = document.getElementById("btnP2Rock");
const aBtnP2Paper = document.getElementById("btnP2Paper");
const aBtnP2Scissors = document.getElementById("btnP2Scissors");
const aBtnP2Lizard = document.getElementById("btnP2Lizard");
const aBtnP2Spock = document.getElementById("btnP2Spock");

//helper functions
function aSetMode(aNewMode) {
  //update global game mode
  aMode = aNewMode;
  //clear any stored player 1 choices
  aPendingChoice = "";

  //reset the ui  (not created yet)
  aClearPicksUI();

  //if cpu mode is selected
  if (aMode === "cpu") {
    //highlight cpu button
    aBtnModeCpu.classList.add("active");
    aBtnModePvp.classList.remove("active");

    //hide player 2 controlls
    aP2Section.style.display = "none";
    //update instructions
    aModeHint.innerText = "You are playing against the CPU. Make your choice!";
  } else {
    // Highlight the PVP button
    aBtnModePvp.classList.add("active");

    // Remove highlight from CPU button
    aBtnModeCpu.classList.remove("active");

    // Show Player 2 controls
    aP2Section.style.display = "block";

    // Update instructions
    aModeHint.textContent = "Player 1 picks first, then Player 2 picks.";

    // Tell Player 2 to wait
    aP2Hint.textContent = "Waiting for Player 1...";
  }
}
//clear the visuals of previous round
//does not reset scores IMPORTNANT!
function aClearPicksUI() {
  // Clear Player 1's pick display
  aP1PickEl.textContent = "_";
  // Clear Player 2's pick display
  aP2PickEl.textContent = "_";
  // Clear round result display
  aRoundResultEl.textContent = "Make your choice!";
  // Hide Play Again button
  aBtnPlayAgain.style.display = "none";
}

function aUpdateScoresUI() {
  // Update Player 1's score display
  aP1ScoreEl.textContent = aP1Score;
  // Update Player 2's score display
  aP2ScoreEl.textContent = aP2Score;
  // Update ties display
  aTiesEl.textContent = aTies;
}

function aRandomCpuChoice() {
  //generate a random number between 0 and 4
  const aNum = Math.floor(Math.random() * 5);
  //map number to choice
  const aChoices = ["rock", "paper", "scissors", "lizard", "spock"];
  return aChoices[aNum];
}

//--------get the cpus choice from our api endpoint --------//
//Expectations: the api will return a json object with a choice property
//Example: { "choice": "rock" }
function aGetCpuChoiceFromAPI() {
  return fetch(aCpuApiUrl)
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      // Try to parse JSON like { "choice": "rock" }, otherwise treat as plain text
      try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.choice) return String(parsed.choice).trim().toLowerCase();
      } catch (e) {
        // not JSON, fall through
      }
      return text.trim().toLowerCase();
    });
}

function aGetWinner(aP1, aP2) {
  if (aP1 === aP2) return "tie";

  // Rock beats Scissors and Lizard
  if (aP1 === "rock" && (aP2 === "scissors" || aP2 === "lizard")) return "p1";
  
  // Paper beats Rock and Spock
  if (aP1 === "paper" && (aP2 === "rock" || aP2 === "spock")) return "p1";
  
  // Scissors beats Paper and Lizard
  if (aP1 === "scissors" && (aP2 === "paper" || aP2 === "lizard")) return "p1";
  
  // Lizard beats Paper and Spock
  if (aP1 === "lizard" && (aP2 === "paper" || aP2 === "spock")) return "p1";
  
  // Spock beats Scissors and Rock
  if (aP1 === "spock" && (aP2 === "scissors" || aP2 === "rock")) return "p1";

  return "p2";
}

//execute a full round of the game
function aPlayRound(aP1Choice, aP2Choice) {
  //display player choices
  aP1PickEl.textContent = aP1Choice;
  aP2PickEl.textContent = aP2Choice;

  //determine winner
  let aWinner = aGetWinner(aP1Choice, aP2Choice);

  //handle tie case
  if (aWinner === "tie") {
    aTies += 1;
    aRoundResultEl.textContent = "It's a tie!";
  }
  //handle player win cases
  else if (aWinner === "p1") {
    aRoundResultEl.textContent = "Player 1 wins!";
    aP1Score += 1;
  } else {
    aRoundResultEl.textContent = "Player 2 wins!";
    aP2Score += 1;
    if (aMode === "cpu") {
      aRoundResultEl.textContent = "CPU wins!";
    } else {
      aRoundResultEl.textContent = "Player 2 wins!";
    }
  }
  aUpdateScoresUI();
}

//------- event listeners -------//
function aHandleP1Pick(aChoice) {
  // This function runs when Player 1 picks rock, paper, or scissors
  // aChoice is the string passed in ("rock", "paper", or "scissors")

  // Check if the game is in CPU mode
  if (aMode === "cpu") {
     //api can take longer to come back so we show quick status while waiting
    aP1PickEl.textContent = aChoice;
    aP2PickEl.textContent = "...";
    aRoundResultEl.textContent = "CPU is making its choice...";
    //get cpu choice from api
    aGetCpuChoiceFromAPI()
    .then(function(aCpuChoice){
    // Play the round with Player 1's choice and the CPU's choice
      aPlayRound(aChoice, aCpuChoice);

    })

    // Stop the function so PVP logic does NOT run
    return;
  }

  // ----- PVP MODE LOGIC -----

  // Store Player 1's choice temporarily
  // Player 2 has not picked yet
  aPendingChoice = aChoice;

  // Show Player 1's choice on the screen
  aP1PickEl.textContent = aChoice;

  // Hide Player 2's choice until they pick
  aP2PickEl.textContent = "?";

  // Update the round message to tell Player 2 to pick
  aRoundResultEl.textContent = "Player 2, make your pick!";

  // Update Player 2 hint text
  aP2Hint.textContent = "Your turn!";
}

// Handle Player 2 pick (PVP)
function aHandleP2Pick(aChoice) {
  // Defensive: if somehow P2 buttons are used in CPU mode
  if (aMode === "cpu") {
    aPlayRound(aRandomCpuChoice(), aChoice);
    return;
  }

  if (!aPendingChoice) {
    // Player 1 hasn't picked yet
    aP2Hint.textContent = "Waiting for Player 1...";
    return;
  }

  // Play round using stored Player 1 choice
  aPlayRound(aPendingChoice, aChoice);
  aPendingChoice = "";
  aP2Hint.textContent = "Waiting for Player 1...";
}

// ------- event listeners -------
// Mode buttons
aBtnModeCpu.addEventListener("click", () => {
  aSetMode("cpu");
});
aBtnModePvp.addEventListener("click", () => {
  aSetMode("human");
});

// Player 1 choice buttons
aBtnP1Rock.addEventListener("click", () => {
  aHandleP1Pick("rock");
});
aBtnP1Paper.addEventListener("click", () => {
  aHandleP1Pick("paper");
});
aBtnP1Scissors.addEventListener("click", () => {
  aHandleP1Pick("scissors");
});
aBtnP1Lizard.addEventListener("click", () => {
  aHandleP1Pick("lizard");
});
aBtnP1Spock.addEventListener("click", () => {
  aHandleP1Pick("spock");
});

// Player 2 choice buttons
aBtnP2Rock.addEventListener("click", () => {
  aHandleP2Pick("rock");
});
aBtnP2Paper.addEventListener("click", () => {
  aHandleP2Pick("paper");
});
aBtnP2Scissors.addEventListener("click", () => {
  aHandleP2Pick("scissors");
});
aBtnP2Lizard.addEventListener("click", () => {
  aHandleP2Pick("lizard");
});
aBtnP2Spock.addEventListener("click", () => {
  aHandleP2Pick("spock");
});

// Play Again button
aBtnPlayAgain.addEventListener("click", () => {
  aClearPicksUI();
  if (aMode === "human") aP2Hint.textContent = "Waiting for Player 1...";
});

// Reset Game button
aBtnReset.addEventListener("click", () => {
  aP1Score = 0;
  aP2Score = 0;
  aTies = 0;
  aUpdateScoresUI();
  aClearPicksUI();
  if (aMode === "human") aP2Hint.textContent = "Waiting for Player 1...";
});
