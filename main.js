const HUMAN = "X";
const COMPUTER = "O";
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const cells = document.querySelectorAll(".cell");
const statusEl = document.querySelector(".turn");
const difficultyButtons = document.querySelectorAll(".difficulty button");
const playAgainButton = document.querySelector(".play_again");

let board,
  gameOver,
  difficulty = "easy";

/* ---------- Game logic (no UI) ---------- */

function getEmptyCells(b) {
  return b.map((v, i) => (v === null ? i : null)).filter((i) => i !== null);
}

// Returns { player, line } if someone won, "draw" if full, otherwise null
function checkResult(b) {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { player: b[a], line };
    }
  }
  return getEmptyCells(b).length === 0 ? "draw" : null;
}

function getNullIndex(b, a, c, d) {
  if (b[a] === null) return a;
  if (b[c] === null) return c;
  if (b[d] === null) return d;
  return null; // Return null if none of them are null
}

/* ---------- Computer algorithms ---------- */

function easyMove(b) {
  const empty = getEmptyCells(b);
  return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove(b) {
  function findCompletingMove(b, player) {
    for (const line of LINES) {
      const mine = line.filter((i) => b[i] === player).length;
      const empties = line.filter((i) => b[i] === null);
      if (mine === 2 && empties.length === 1) return empties[0];
    }
    return null;
  }
  // 1. Win if possible
  let move = findCompletingMove(b, COMPUTER);
  if (move !== null) return move;

  // 2. Block the human
  move = findCompletingMove(b, HUMAN);
  if (move !== null) return move;

  // 3. Otherwise random (or use the center/corners/edges priority list)
  const empty = getEmptyCells(b);
  return empty[Math.floor(Math.random() * empty.length)];
}

function hardMove(b) {
  //   const empty = getEmptyCells(b);
  return null;
}

// Add medium and hard here later
const strategies = {
  easy: easyMove,
  medium: mediumMove,
  hard: hardMove,
};

/* ---------- UI ---------- */

function placeMark(index, player) {
  board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
}

function finishIfOver() {
  const result = checkResult(board);
  if (!result) return false;

  gameOver = true;
  if (result === "draw") {
    statusEl.textContent = "It's a draw!";
    playAgainButton.style = "display: unset;";
  } else {
    statusEl.textContent =
      result.player === HUMAN ? "You win!" : "Computer wins!";
    result.line.forEach((i) => cells[i].classList.add("win"));
    playAgainButton.style = "display: unset;";
  }
  cells.forEach((c) => (c.disabled = true));
  return true;
}

function computerTurn() {
  if (gameOver) return;
  const index = strategies[difficulty](board);
  console.log("computerTurn " + index);
  placeMark(index, COMPUTER);
  if (!finishIfOver()) {
    statusEl.textContent = "Your turn";
    enableEmptyCells();
  }
}

function enableEmptyCells() {
  getEmptyCells(board).forEach((i) => (cells[i].disabled = false));
}

function handleHumanClick(e) {
  const index = Number(e.target.dataset.index);
  if (gameOver || board[index] !== null) return;

  placeMark(index, HUMAN);
  if (finishIfOver()) return;

  // Lock the board while the computer "thinks"
  statusEl.textContent = "Computer is thinking...";
  cells.forEach((c) => (c.disabled = true));
  setTimeout(computerTurn, 400);
}

function startGame() {
  board = Array(9).fill(null);
  gameOver = false;
  statusEl.textContent = "Your turn";
  playAgainButton.style = "display: none;";
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("x", "o", "win");
  });
}

/* ---------- Events ---------- */

cells.forEach((cell) => cell.addEventListener("click", handleHumanClick));

difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    difficulty = btn.value;
    difficultyButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    startGame(); // changing level restarts the game
  });
});

playAgainButton.addEventListener("click", function () {
  startGame();
});

startGame();
