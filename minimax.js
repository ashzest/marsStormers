var boardGame;                          //Game board of 9 cells
var PresentPlayTag = $("#PresentTurn"); // Display the current player's name
var MultiPlayer = false;   
var player = "X";                       //Minimizing Player (human player)
var player_2 = "O";                     //Maximizing Player (AI agent)
var PresentTurn = player;
var EndOfGame = 1;
var maxDepth = 10;
var truedepth = maxDepth;              //Stores the actual maxdepth according to level and comes handy at the time of suggestions 
var depth;
const WinningCombs = [                 //Stores the winning combinations for everyplayer
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

const cells = $(".cell");          //Selects each cell class on HTML 

function SetLevelOne() {           //Sets the depth with which the AI plays according to the level selected
  maxDepth = 1;                    //Sets maxdepth in recursion tree as 1
  truedepth = maxDepth;
}

function SetLevelTwo() {            //Sets maxdepth in recursion tree as 2
  maxDepth = 2;
  truedepth = maxDepth;
}

function SetLevelThree() {          //Sets maxdepth in recursion tree as 3
  maxDepth = 3;
  truedepth = maxDepth;
}

function SetLevelInf() {            //Sets maxdepth in recursion tree as 9
  maxDepth = 9;
  truedepth = maxDepth;
}
$(".button").on("click", function () {   //Adds the desired effect to the level buttons
  $(".btn-group").addClass("noHover");   // btn-group class is there is Levels on HTML
  $(this).css("color", "#723267");
});

function startGame() {
  maxDepth = 10;
  truedepth = 10;
  $(".button").css("color", "white");      
  $(".sug").css("color", "#723267");      //Increases the opacity of table(boardgame) and suggestion button as the game starts
  $("table").animate({
    opacity: "1",
  });
  if (MultiPlayer == true) {              // When two human players are playing only the suggestions button is enabled
    $(".sug").removeClass("disabled");
    $(".sug").removeClass("noHover");
  }
  if (MultiPlayer == false) {            //When playing with AI in single mode, the levels btn-group and the suggestions button are enabled
    $(".btn-group").removeClass("disabled");
    $(".btn-group").removeClass("noHover");
    $(".sug").removeClass("disabled");
    $(".sug").removeClass("noHover");
  }
  PresentTurn = player;                          //Stores the turn of the current player
  PresentPlayTag = $("#PresentTurn");
  $("#f1").text(PresentTurn);
  $("#f2").text(PresentTurn == "X" ? "O" : "X"); //These tags display the turn alternatively

  cells.on("click", PresentTurnClick);           //Enables the player to play the turn by clicking the cell
  EndOfGame = 0;
  $(".end-game").value = "none";
  boardGame = Array.from(Array(9).keys());       //Generates key for each cell with cell id
  ClearTicTacToe();                     
}

function endGame() {                             //disables the boardgame on endgame
  $("table").animate({
    opacity: "0.4",
  });
  EndOfGame = 1;
  ClearTicTacToe();
  PresentPlayTag.text("- - - - - - - -");
  cells.off("click");

  $(".btn-group").addClass("disabled");          //disables the suggestion and level buttons on endgame
  $(".sug").addClass("disabled");
  maxDepth = 10;
  $(".button").css("color", "white");
}

function PresentTurnClick(square) {
  if (typeof boardGame[square.target.id] == "number") {   //Allows the player to play the turn only if the cell is empty
    turn(square.target.id, PresentTurn);                  //Plays the turn on the selected cell using PresentTurn
    if (!CheckForWin(boardGame, player) && !CheckForTie()) {  //If the terminal i.e. Win or Tie state has not been reached
      if (MultiPlayer === false) {
        cells.off("click");                                //Disables the cells to ensure only one click per user
        setTimeout(function () {
          turn(bestChoice(false), player_2);               //Chooses the best possible move for the AI agent according to the Level
          cells.on("click", PresentTurnClick);
          $(".sug").on("click", function () {
            suggestions(bestChoice(true), player);         //Suggests the best possible move for the player irresepective of the Level
          });
        }, 700);
      } else if (MultiPlayer === true) {
        $(".sug").on("click", function () {
          suggestions(bestChoice(true), player);           //Suggests the best possible move for the player in Two Player Mode
        });
      }
    }
  }
}

function turn(boxId, player) {                //Takes the boxid and player and fills the html cell with boxid with player id
  currentPlayer = player == "X" ? "O" : "X";  //Gives the chance to next player
  if (MultiPlayer == false) {
    if (currentPlayer != player_2)            //player_2 is the AI player
      PresentPlayTag.text("You Play Next: " + currentPlayer);
    else PresentPlayTag.text("AI's turn " + currentPlayer);
  } else PresentPlayTag.text("You Play Next: " + currentPlayer);
  boardGame[boxId] = player;                  //Changes the boxid to the player's id
  $("#" + boxId).text(player);                //Displays the boxid as the player's id
  let gameFinished = CheckForWin(boardGame, player);  //Passes the boardgame with the currentplayer and checks for win
  if (gameFinished) {
    gameOver(gameFinished);
  }

  PresentTurn = PresentTurn == "X" ? "O" : "X";
}

function MinMax(PresentGameBoard, currentPlayer, depth, flag) {
  if (flag == true) maxDepth = 10;            //For suggestions
  if (flag == false) maxDepth = truedepth;    //For AI agent
  var availableMoves = AvailableMoves();      //Get an array of empty cells from the present board state

  if (CheckForWin(PresentGameBoard, player)) {//If terminal state is reached
    return {
      score: -100 + depth,                   //Adds the depth to the score of the Minimizing player to ensure that AI agent selects Shortest path to Win
    };                                       
  } else if (CheckForWin(PresentGameBoard, player_2)) {
    return {
      score: 100 - depth,                     //Not only the AI wants to win, but also wants to anticipate the shortest way to win
    };                                        //Hence our agent proves to be UTILITY BASED 
  } else if (availableMoves.length === 0 || depth == maxDepth) {
    return {
      score: 0,                               //Score is returned as zero in case of tie or when the setLevel condition is reached 
    };
  }

  var moves = [];                   //A var that stores the the outcomes of minimax on every pending cell of the present state of board
  for (var i = 0; i < availableMoves.length; i++) {  //Loop for avaiable moves of present state
    var move = {};                                   //A var that stores information of present move for every iteration
    move.index = PresentGameBoard[availableMoves[i]];     //Sets the index of move as the boxid of the cell on present board
    PresentGameBoard[availableMoves[i]] = currentPlayer;  //Sets the boxid of that cell as player id to anticipate next moves of the alternate player

    if (currentPlayer == player_2) {
      var maxScoreIndex = MinMax(PresentGameBoard, player, depth + 1, flag); //call minimax for the alternate player and increase depth by one to indicate next move
      move.score = maxScoreIndex.score;                                      //Store score of current move as score of minimax if that move is played
    } else {
      var maxScoreIndex = MinMax(PresentGameBoard, player_2, depth + 1, flag);
      move.score = maxScoreIndex.score;
    }

    PresentGameBoard[availableMoves[i]] = move.index;                        //Removes the playerid of the currentplayer from the board cell and puts original id of the cell
                                                                             //as that was just put to anticipate next moves.
    moves.push(move);                                                        //push info of the current move in moves
  }

  var bestChoice;                                                            //Made to store index of the best possible move from moves array
  if (currentPlayer === player_2) {
    var bestScore = -10000;                                                  //Setting the score as minimum possible for the maximizing player
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {                                      //chooses the move with maximum score from the moves array 
        bestScore = moves[i].score;
        bestChoice = i;                                                      //stores index of the move with maximum score by the end of the loop
      }
    }
  } else {
    var bestScore = 10000;                                                   //Setting the score as maximum possible for minimizing player
    for (var i = 0; i < moves.length; i++) {                                
      if (moves[i].score < bestScore) {                                      //Chooses the move with minimum score from the moves array
        bestScore = moves[i].score;
        bestChoice = i;                                                      //Stores index of the move with minimim score by the end of the loop
      }
    }
  }

  return moves[bestChoice];                                                  //Returns the best move from the moves array by bestchoice index
}

function CheckForWin(board, player) {                                        
  let plays = board.reduce(
    (acc, elem, index) => (elem === player ? acc.concat(index) : acc),      //Used the arrow function from jQuery to reduce the board storing the plays of the current player only
    []
  );
  let gameFinished = null;
  for (let [index, win] of WinningCombs.entries()) {                        //For every index of winning combos(row of 3), check if every element of that index is there in the plays of the player
    if (win.every((elem) => plays.indexOf(elem) > -1)) {                    //When every element of that index is found, store the playerid and that index of winning combos
      gameFinished = {                                                      //Store id of player in case of win and the corresponding index of winning combos
        index: index,
        player: player,
      };
      break;
    }
  }
  return gameFinished;
}

function gameOver(gameFinished) {
  EndOfGame = 1;
  maxDepth = 10;
  cells.off("click");                                                     //Disable the cells of boardgame
  cells.animate({
    opacity: "0.4",
  });
  for (let index of WinningCombs[gameFinished.index]) {                   //Animate the cells of the index of Winning combo
    setTimeout(function () {
      $("#" + index).css("background-color", "green");
      $("#" + index).animate({
        opacity: "1",
      });
      $("#PresentTurn").text(gameFinished.player + " WINS");             //Displaying the winner
    }, 500);
  }
}

function AvailableMoves() {
  return boardGame.filter((s) => typeof s == "number");                 //Returns the array of empty cells from present state
}

function CheckForTie() {
  if (AvailableMoves().length === 0 && CheckForWin != true) {           //If board game is filled and no Winning combo is found
    EndOfGame = 1;
    cells.off("click");
    cells.animate({
      opacity: "0.4",
    });
    PresentPlayTag.text("TIE GAME!");                                   //Displays tie

    return true;
  }
  return false;
}

function bestChoice(flag) {                                            //Flag parameter to differentiate between AI and human player
  return MinMax(boardGame, player_2, 0, flag).index;                   //Returns index of best move
}

function ClearTicTacToe() {
  for (var i = 0; i < cells.length; i++) {
    $("#" + i).text("");
  }

  for (var i = 0; i < cells.length; i++) {
    cells[i].value = "";
    cells[i].style.removeProperty("background-color");
    cells[i].style.removeProperty("opacity");
    cells.on("click", PresentTurnClick);
  }
  PresentPlayTag.text("You Play Next: " + player);
}

function ReverseIt() {                                           //Reverses X and O in two player mode, enabled by glyphicon
  if (EndOfGame === 1 && MultiPlayer == true) {
    PresentTurn = PresentTurn == player ? player_2 : player;     
    player = player == "X" ? "O" : "X";
    player_2 = player_2 == "X" ? "O" : "X";
    PresentFigureCh = $("#f1").text();
    $("#f1").animate({
      opacity: "0",
    });
    $("#f2").animate({
      opacity: "0",
    });
    setTimeout(function () {
      $("#f1").text((PresentFigureCh = PresentFigureCh == "X" ? "O" : "X"));
      $("#f2").text((PresentFigureCh = PresentFigureCh == "X" ? "O" : "X"));
    }, 500);
    $("#f1").animate({
      opacity: "1",
    });
    $("#f2").animate({
      opacity: "1",
    });
  }
}

function activeMultiPlayer() {         //Differentiates between two player mode and one player mode
  if (EndOfGame === 1) {
    if (MultiPlayer) {
      $("#p2").animate({
        opacity: "0.3",
      });
    } else {
      $("#p2").animate({
        opacity: "1",
      });
    }
    MultiPlayer = MultiPlayer == true ? false : true;
  }
}

function suggestions(boxId, player) {        //Takes bestchoice of the currentplayer and creates a blinking effect
  if (AvailableMoves.length != 9) {
    setTimeout(function () {
      $("#" + boxId).animate({
        opacity: "0.6",
      });
    }, 3);
    setTimeout(function () {
      $("#" + boxId).animate({
        opacity: "1",
      });
    }, 7);

    $(".sug").removeClass("disabled");
    $(".sug").removeClass("noHover");
  }
}



  $(".feature").hover(function(){          //Navbar animation on dropdowns
    $(".feat").fadeToggle("slow");
  });
  $(".howtoplay").hover(function(){
    $(".htplay").fadeToggle("slow");
  });
  $(".contactus").hover(function(){
    $(".contactuss").fadeToggle("slow");
  });
