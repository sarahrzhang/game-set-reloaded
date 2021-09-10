// global button enabled booleans
var playerOneDisabled = true;
var playerTwoDisabled = true;
// global time variables
var totalSeconds = 0;
var timerVar;
// start timer
function startClock() {
    totalSeconds = 0;
    endClock();
    timerVar = setInterval(setTime, 1000);
}
// stop timer
function endClock() {
    clearInterval(timerVar);
}
// increment time
function setTime()
{
    ++totalSeconds;
}

// setup card class
class Card {
    constructor(color, shape, number, shading) {
        this.color = color;
        this.shape = shape;
        this.number = number;
        this.shading = shading;
        this.image = null;
        this.shaded = false;
    }
    // create static member attribute arrays
    static color = ['red', 'blue', 'green'];
    static shape = ['oval', 'wave', 'diamond'];
    static number = ['1', '2', '3'];
    static shading = ['solid', 'striped', 'blank'];

    // returns the image element of a card object
    getCardImage() {
        let name = "images/" + this.color + "_" + this.shape + "_" + this.number + "_" + this.shading + ".png";
        let image = document.createElement("img");
        image.classList.add("card");
        image.src = name;
        return image;
    }

    // style image using shaded class when it gets selected
    // @param card
    //      an instance of the Card class
    static shadeCard(card) {
        // if card is already shaded / selected, deselect
        return function select () {
            if(card.image.classList.contains("shaded")) {
                card.image.classList.remove("shaded");
            } else { // select card if it has not already been clicked
                card.image.classList.add("shaded");
            }
        }
    }
}

// deck class
class Deck {
    constructor(){
        // instance field deck
        this.deck = [];
        this.board = [];
        this.createDeck();
        this.table = document.createElement("table");
        this.buttons = document.createElement("table");
        this.scoreboard = document.createElement("table");
        this.players = [];
        this.currentPlayerIndex = 0;
        this.createPlayers();
    }
    
    // create array of players
    createPlayers() {
        for (let i = 0; i < 2; i++) {
            this.players.push(new Player(i+1));
        }
    }
    
    // create deck of cards
    createDeck() {
        for(let i = 0; i < 3; i++) {
            for(let j = 0; j < 3; j++) {
                for(let k = 0; k < 3; k++) {
                    for(let l = 0; l < 3; l++) {
                        this.deck.push(new Card(Card.color[i], Card.shape[j], Card.number[k], Card.shading[l]));
                    }
                }
            }
        } 
        return this.deck;
    }

    // shuffle deck randomly
    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            let randomCard = Math.floor(Math.random() * (i + 1));
            let temp = this.deck[i];
            this.deck[i] = this.deck[randomCard];
            this.deck[randomCard] = temp;
        }
    }

    // draw a new card, add it to board, and removes from deck
    drawCard() {
        // remove first element of array and add to front of board
        if(this.deck.length>0){
            this.board.push(this.deck.shift());
        }
        else {
            document.getElementById("addThreeButton").disabled = true;
        }
        
    }

    // draws 12 cards, removes from the deck, and adds to board
    drawTwelve() {
        for(let i = 0; i < 12; i++) {
            this.drawCard();
        }
    }

    // add three cards to board & deck
    addThreeCards() {
        for(let i = 0; i < 3; i++) {
            this.drawCard();
        }
    }

    // add and draw three cards to the board for event
    // @param deck 
    //      an instance of the Deck class
    static addThreeClick(deck) {
        return function add () {
            deck.addThreeCards();
            deck.drawBoardCards();
        }
    }

    // start the timer for player 1 and enable check button
    // @param deck 
    //      an instance of the Deck class
    static playerOneClick(deck) {
        return function play () {
            deck.currentPlayerIndex = 0;
            document.getElementById("checkButton").disabled = false;
            startClock();
        }
    }

    // start the timer for player 2 and enable check button
    // @param deck 
    //      an instance of the Deck class
    static playerTwoClick(deck) {
        return function play () {
            deck.currentPlayerIndex = 1;
            document.getElementById("checkButton").disabled = false;
            startClock();
        }
    }

    // check whether the selected cards are a set, remove them from the board, redraw the board, update player stats, and determine if game has ended.
    // @param deck 
    //      an instance of the Deck class
    // @param board 
    //      an instance field of the Deck class
    static checkSetClick(board, deck) {
        return function check () {
            // array of selected cards and keep track of their indicies
            var selected = [];
            var indices = [];
            //  get selected cards
            for(let i = 0; i < board.length; i++) {
                if (board[i].image.classList.contains("shaded")){
                    selected[selected.length] = board[i];
                    indices.push(i);
                }
            }
            // check if the are a set
            if (checkSet(selected)) {
                alert("this is a set!");
                //remove the selected cards if they were a set
                board.splice(indices[2], 1);
                board.splice(indices[1], 1);
                board.splice(indices[0], 1);
                // add 3 cards if less than 12 are on the board and there are still cards remaining in deck
                if (board.length< 12 && deck.deck.length>0)
                {
                    deck.addThreeCards();
                }
                // redraw board
                deck.drawBoardCards();
                // update player score, time, and scoreboard table
                deck.players[deck.currentPlayerIndex].scorePoint();
                deck.players[deck.currentPlayerIndex].addTime(totalSeconds);
                endClock();
                deck.drawScoreBoard();
                // diasable check button before next player's turn
                document.getElementById("checkButton").disabled = true;
                // determing if game should continue
                if(deck.gameOver()) {
                    var winner = deck.winner();
                    alert("Game Over. Player " + winner + " wins!");
                    location.reload();
                }
            } else {
                alert("not a set");
            }
        }
    }

    // find sets on board and return one
    // @param deck 
    //      an instance of the Deck class
    // @param board 
    //      an instance field of the Deck class
    static hintClick(deck, board) {
        return function check () {
            // pass the current board into the subset fnt
            var allCombos = subset(board, 3);
            var allSets = [];
            // loop through the 3 card combos, check if they make a set
            for (let i = 1; i < allCombos.length; i++)
            {
                if (checkSet(allCombos[i])) {
                    allSets[allSets.length] = allCombos[i];
                }
            }
            //alert("allSets.length" + allSets.length);
            if (allSets.length>0){
                deck.drawBoardCards();
                //go through the first set found and shade them.
                for (let j = 0; j < 3; j++){
                    //alert(allSets[0][j].shading);
                    allSets[0][j].image.classList.add("shaded");
                }
                alert("one set has been selected");
            }
            else{
                alert("there are no sets on the board");
            }
            
        }
    }

    // return the player number of the winning player
    winner() {
        if(this.players[0].score > this.players[1].score) {
            return this.players[0].playerNum;
        } else if(this.players[0].score < this.players[1].score){
            return this.players[1].playerNum;
        } else { // tied score use time as a tiebreaker
            if(this.players[0].playerTime > this.players[1].playerTime) {
                return this.players[0].playerNum;
            } else if (this.players[0].playerTime < this.players[1].playerTime) {
                return this.players[1].playerNum;
            } else {
                return;
            }
        }
    }

    // determine whether game should end
    gameOver() {
        var noSets = false;
        var allCombos = subset(this.board, 3);
        var allSets = [];
        // loop through the 3 card combos, check if they make a set
        for (let i = 1; i < allCombos.length; i++) {
            if (checkSet(allCombos[i])) {
                allSets[allSets.length] = allCombos[i];
            }
        }
        if (this.deck.length == 0 && allSets.length == 0) {
            noSets = true;
        }
        return noSets;
    }

    // quits the game and outputs winner. reloads page
    // @param deck 
    //      an instance of the Deck class
    static quitClick(deck) {
        return function quit() {
            var winner = deck.winner();
            if (winner) {
                alert("Game Over. Player " + winner + " wins!");
            } else {
                alert("Game Over. There is no winner.");
            }
            // reload the pagee to start a new game
            location.reload();
        }
    }

    // check set button
    checkSetButton () {
        var button = document.createElement("button");
        button.innerHTML = "Check";
        button.id = "checkButton";
        button.classList.add("playerbutton");
        var check = Deck.checkSetClick(this.board, this);
        button.addEventListener("click", check);
        return button;
    }

    // button for finding a set
    hintButton () {
        var button = document.createElement("button");
        button.innerHTML = "Hint";
        button.classList.add("playerbutton");
        var hint = Deck.hintClick(this, this.board);
        button.addEventListener("click", hint);
        return button;
    }

    // button for adding 3 cards
    addThreeButton () {
        var button = document.createElement("button");
        button.innerHTML = "Add Three";
        button.id = "addThreeButton";
        button.classList.add("playerbutton");
        var add = Deck.addThreeClick(this);
        button.addEventListener("click", add);
        return button;
    }

    // button for player one taking their turn
    playerOneButton () {
        var button = document.createElement("button");
        button.innerHTML = "Player 1";
        button.classList.add("playerbutton")
        var play = Deck.playerOneClick(this);
        button.addEventListener("click", play);
        return button;
    }

    // button for player one taking their turn
    playerTwoButton () {
        var button = document.createElement("button");
        button.innerHTML = "Player 2";
        button.classList.add("playerbutton");
        var play = Deck.playerTwoClick(this);
        button.addEventListener("click", play);
        return button;
    }

    // button to quit the game
    quitButton() {
        var button = document.createElement("button");
        button.innerHTML = "Quit";
        button.classList.add("playerbutton");
        var quit = Deck.quitClick(this);
        button.addEventListener("click", quit);
        return button;
    }

    // diaplay on the page how many cards are left in the deck
    cardsRemaining() {
        // display cards remaining
        var div = document.createElement("div");
        document.getElementById('game-of-set').appendChild(div);
        div.classList.add("remaining_heading_container");
        var remaining = document.createElement("h3");
        div.appendChild(remaining);
        remaining.classList.add("remaining_heading");
        remaining.innerHTML = "There are " + this.deck.length + " remaining cards in the deck.";
    }

    // update the number of cards left in the deck
    updateCardsRemaining() {
        var remaining = document.getElementsByTagName("h3")[2];
        remaining.innerHTML = "There are " + this.deck.length + " remaining cards in the deck.";
    }

    // display whichever cards in the board in a table element
    drawBoardCards() {
        // clear board
        while (this.table.firstChild){
            this.table.removeChild(this.table.firstChild);
        }
        this.updateCardsRemaining();
        // create table row and datas 
        for(let j = 0; j < this.board.length/3; j++) {
            var threeCards = document.createElement("tr");
            this.table.appendChild(threeCards);
            
            // in each row, add 3 cards
            for (let i = 0; i < 3; i++) {
                var card = document.createElement("td");
                threeCards.appendChild(card);
                var image = this.board[3*j+i].getCardImage();
                this.board[3*j+i].image = image;
                //alert(image);
                card.appendChild(image);
                // add event listener to each card for when it gets selected to be 
                //var select = Card.shadeCard(image);
                card.addEventListener("click", Card.shadeCard(this.board[3*j+i]));
            }
        }
        
    }
    // display whichever cards in the board in a table element
    drawButtons() {
        // add class to buttons table
        this.buttons.classList.add("buttons");
        var buttonsrow1 = document.createElement("tr");
        var buttonsrow2 = document.createElement("tr");
        this.buttons.appendChild(buttonsrow1);
        this.buttons.appendChild(buttonsrow2);

        // create check button
        var check = document.createElement("td");
        buttonsrow1.appendChild(check);
        var checkButton = this.checkSetButton();
        checkButton.disabled = true;
        check.append(checkButton);

        // hint button
        var hint = document.createElement("td");
        buttonsrow1.appendChild(hint);
        var hintButton = this.hintButton();
        hint.append(hintButton);

        // add three button
        var addThree = document.createElement("td");
        buttonsrow2.appendChild(addThree);
        var addThreeButton = this.addThreeButton();
        addThree.append(addThreeButton);
        
        // quit button
        var quit = document.createElement("td");
        buttonsrow2.appendChild(quit);
        var quitButton = this.quitButton();
        quit.append(quitButton);
        
    }

    // draw player buttons and score board
    drawScoreBoard() {
        this.scoreboard.classList.add("scoreboard");
        // clear board 
        while (this.scoreboard.firstChild){
            this.scoreboard.removeChild(this.scoreboard.firstChild);
        }

        // players and score table headers
        var headers = document.createElement("tr");
        this.scoreboard.appendChild(headers);
        var player = document.createElement("th");
        headers.appendChild(player);
        player.innerHTML = "Player";
        var score = document.createElement("th");
        headers.appendChild(score);
        score.innerHTML = "Score";
        var time = document.createElement("th");
        headers.appendChild(time);
        time.innerHTML = "Time (sec)";

        // add class to buttons table
        var player1 = document.createElement("tr");
        var player2 = document.createElement("tr");
        this.scoreboard.appendChild(player1);
        this.scoreboard.appendChild(player2);

        // create player 1 button
        var p1 = document.createElement("td");
        player1.appendChild(p1);
        var p1Button = this.playerOneButton();
        p1Button.id = "player1";
        p1Button.disabled = playerOneDisabled;
        p1.append(p1Button);

        // player 1 score
        var p1score = document.createElement("td");
        player1.appendChild(p1score);
        p1score.innerHTML = this.players[0].score;

        // player 1 time
        var p1time = document.createElement("td");
        player1.appendChild(p1time);
        p1time.innerHTML = this.players[0].playerTime;

        // create player 2 button
        var p2 = document.createElement("td");
        player2.appendChild(p2);
        var p2Button = this.playerTwoButton();
        p2Button.id = "player2";
        p2Button.disabled = playerTwoDisabled;
        p2.append(p2Button);

        // player 2 score
        var p2score = document.createElement("td");
        player2.appendChild(p2score);
        p2score.innerHTML = this.players[1].score;

        // player 1 time
        var p2time = document.createElement("td");
        player2.appendChild(p2time);
        p2time.innerHTML = this.players[1].playerTime;
    }

}

// draw singlerplayer and two player buttons
function drawPlayerModeButtons() {
    // create singleplayer mode button
    var mode1 = document.createElement("button");
    document.getElementsByClassName("container")[0].appendChild(mode1);
    mode1.innerHTML = "Single Player";
    mode1.id = "singleplayer";
    mode1.classList.add("homebutton");
    mode1.addEventListener("click", singleplayerClick);
    
    // create singleplayer mode button
    var mode2 = document.createElement("button");
    document.getElementsByClassName("container")[0].appendChild(mode2);
    mode2.innerHTML = "Two Players";
    mode2.id = "twoplayer";
    mode2.classList.add("homebutton");
    mode2.addEventListener("click", twoPlayersClick);
}

// disable player 2 button if singleplayer is selected 
function singleplayerClick() {
    document.getElementById("player1").disabled = false;
    playerOneDisabled = false;
    document.getElementById("player2").disabled = true;
    playerTwoDisabled = true;
}

// enable both player buttons if two players selected
function twoPlayersClick() {
    document.getElementById("player1").disabled = false;
    playerOneDisabled = false;
    document.getElementById("player2").disabled = false;
    playerTwoDisabled = false;
}

// used in the hint-related methods.
// @param array
//      the array of cards on the board
// @param num
//      the number of elements per combintaion, 3
function subset(array, num)
{
  var resultSet = [], result;
  for(var x = 0; x < Math.pow(2, array.length); x++)
  {
    result = [];
    i = array.length - 1; 
    do
    {
      if((x & (1 << i)) !== 0){
        result.push(array[i]);
      }
    } while(i--);
    
    if(result.length == num){
      resultSet.push(result);
    }
  }
  return resultSet; 
}

// Checks whether the 3 cards form a set
// @param threeCards
//      array of three selected Cards
function checkSet(threeCards) {
    // make sure only 3 cards are selected
    if (threeCards.length != 3) {
        alert("Invalid selection. You must select 3 cards");
        return false;
    }
    
    // create map containing all possible attributes
    let attrCount = new Map();
    attrCount['red'] = 0;
    attrCount['blue'] = 0;
    attrCount['green'] = 0;
    attrCount['wave'] = 0;
    attrCount['oval'] = 0;
    attrCount['diamond'] = 0;
    attrCount['1'] = 0;
    attrCount['2'] = 0;
    attrCount['3'] = 0;
    attrCount['solid'] = 0;
    attrCount['striped'] = 0;
    attrCount['blank'] = 0;

    // count all attributes
    console.log("here");
    for (let i = 0; i < 3; i++) {
        attrCount[threeCards[i].color]++;
        attrCount[threeCards[i].shape]++;
        attrCount[threeCards[i].shading]++;
        attrCount[threeCards[i].number]++;
    }
    // if any attribute is counted exactly twice, it is not a set
    if (attrCount['red'] == 2 || attrCount['blue'] == 2 || attrCount['green'] == 2 || attrCount['wave'] == 2 || attrCount['oval'] == 2 || attrCount['diamond'] == 2 || attrCount['1'] == 2 || attrCount['2'] == 2 || attrCount['3'] == 2 || attrCount['solid'] == 2 || attrCount['striped'] == 2 || attrCount['blank'] == 2) {
        return false;
    }
    return true;
}


// player class 
class Player {
    constructor(playerNum){
        this.score = 0;
        this.playerNum = playerNum;
        this.playerTime = 0.0;
    }

    // udate score
    scorePoint(){
        this.score++;
    }

    // calculate player turn time
    addTime(turnTime){
        this.playerTime += turnTime;
    }
}

