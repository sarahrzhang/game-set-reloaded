// create new deck, shuffle and add 12 to board
let deck = new Deck();
deck.shuffle();
deck.drawTwelve();

// add cards remaining message
deck.cardsRemaining();

// create div container for game board
var container = document.createElement("div");
document.getElementById('game-of-set').appendChild(container);
container.id = "game-board";

// create div for buttons and scoreboard
var container = document.createElement("div");
document.getElementById('game-of-set').appendChild(container);
container.id = "game-buttons";


// add card, buttons, and scoreboard to respective divs
document.getElementById('game-board').appendChild(deck.table);
document.getElementById('game-buttons').appendChild(deck.buttons);
document.getElementById('game-buttons').appendChild(deck.scoreboard);

// draw all tables
deck.drawBoardCards();
deck.drawButtons();
deck.drawScoreBoard();

// create buttons to select player mode
drawPlayerModeButtons();

