"use strict";

// Factory function for players
const playerFactory = (name, symbol) => {
    return { name, symbol }
};

// A module pattern for the gameboard and displayController
const gameBoard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];
    let player1 = "";
    let player2 = "";
    let round = 1;
    let winner = "";
    let gameMode = "";
    let botPlayer = "";
    let humanPlayer = "";
    let modBoard = [];


    const createPlayer = (playerNumber, name) => {
        let symbol = "";
        if (playerNumber === "player1") {
            symbol = "X";
            player1 = playerFactory(name, symbol);
        } else {
            symbol = "O";
            player2 = playerFactory(name, symbol);
        }
    };

    const switchMarks = () => {
        let temp = player1.name;
        player1.name = player2.name;
        player2.name = temp;
        resetBoard();
        if ((gameMode === "botEasy" || gameMode === "botHard") && player1.name === "Bot") {
            displayController.displayTurn(player2.name, false);
            displayController.refreshGameBoard();
        } else if ((gameMode === "botEasy" || gameMode === "botHard") && player1.name !== "Bot") {
            displayController.displayTurn(player1.name, false);
            displayController.refreshGameBoard();
        } else {
            displayController.displayTurn(player1.name, false);
        }
    };

    const getNextName = (player) => {
        if (player === player1) {
            return player2.name;
        } else {
            return player1.name;
        }
    };

    const getField = (index) => {
        if (index > board.length) return;
        return board[index];
    };

    const setField = (index, player) => {
        board[index] = player.symbol;
    };

    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
        winner = "";
        round = 1;
        displayController.refreshGameBoard();
        if (gameMode === "botEasy" && player1.name === "Bot") {
            aiBotPlay("easy", player1);
            displayController.refreshGameBoard();
            displayController.displayTurn(player2.name, false);
        } else if (gameMode === "botHard" && player1.name === "Bot") {
            aiBotPlay("hard", player1);
            displayController.refreshGameBoard();
            displayController.displayTurn(player2.name, false);
        } else if ((gameMode === "botEasy" || gameMode === "botHard") && player1.name !== "Bot") {
            displayController.displayTurn(player1.name, false);
        }
    };

    const playRound = (index) => {
        if (player1.name === "Bot") {
            botPlayer = player1;
            humanPlayer = player2;
        } else if (player2.name === "Bot") {
            botPlayer = player2;
            humanPlayer = player1;
        } else if (gameMode = "pvp" && round % 2 === 0) {
            humanPlayer = player2;
            round++;
        } else {
            humanPlayer = player1;
            round++;
        }

        setField(index, humanPlayer);
        if (checkWinner(board, humanPlayer)) winner = humanPlayer;

        // If playing vs computer
        if (board.includes("") && winner === "" && gameMode === "botEasy") {
            aiBotPlay("easy", botPlayer);
        } else if (board.includes("") && winner === "" && gameMode === "botHard") {
            modBoard = transformBoard(board);
            aiBotPlay("hard", botPlayer);
        }

        // Display next turn or winner message
        if (winner === humanPlayer) {
            displayController.displayTurn(humanPlayer.name, true);
        } else if (winner !== "" && winner !== humanPlayer) {
            displayController.displayTurn(getNextName(humanPlayer), true);
        } else if (gameMode === "botEasy" || gameMode === "botHard") {
            displayController.displayTurn(humanPlayer.name, false);
        } else {
            displayController.displayTurn(getNextName(humanPlayer), false);
        }
    };

    const setGameMode = (mode) => {
        gameMode = mode;
    };

    const isGameOver = () => {
        if (!board.includes("") || winner !== "") {
            return true;
        } else {
            return false;
        }
    };

    const checkWinner = (board, player) => {
        const winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        let gameWon = false;
        winningConditions.forEach((row) => {
            let a = row[0];
            let b = row[1];
            let c = row[2];
            if (board[a] !== "" && board[a] === board[b] && board[b] === board[c] && board[a] === player.symbol) {
                gameWon = true;
            }
        });
        return gameWon;
    };

    // AI Bot
    const aiBotPlay = (difficulty, botPlayer) => {
        if (difficulty === "easy") {
            setField(aiBotEasy(), botPlayer);
        } else {
            setField(aiBotHard(botPlayer), botPlayer);
        }
        round++;
        if (checkWinner(board, botPlayer)) winner = botPlayer;
    };

    const aiBotEasy = () => {
        let found = false;
        let randomField = "";
        while (found === false) {
            randomField = Math.floor(Math.random() * 9);
            if (board[randomField] === "") found = true;
        }
        return randomField;
    };

    const aiBotHard = (bot) => {
        return minimax(modBoard, bot).index;
    };

    // Transform empty spaces of board array to his index number
    const transformBoard = (currentBoard) => {
        let transBoard = [];
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === "") {
                transBoard[i] = i;
            } else {
                transBoard[i] = currentBoard[i];
            }
        }
        return transBoard;
    };

    // Get transformed board and delete X and O leaving only numbers (empty spaces)
    const emptySquares = () => {
        return modBoard.filter(element => typeof element === "number");
    };
    
    // Minimax algorithm function
    const minimax = (newBoard, currentPlayer) => {
        let availSpots = emptySquares();

        if (checkWinner(newBoard, humanPlayer)) {
            return { score: -10 };
        } else if (checkWinner(newBoard, botPlayer)) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        let moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            let move = {};
            move.index = newBoard[availSpots[i]];
            newBoard[availSpots[i]] = currentPlayer.symbol;
    
            if (currentPlayer == botPlayer) {
                let result = minimax(newBoard, humanPlayer);
                move.score = result.score;
            } else {
                let result = minimax(newBoard, botPlayer);
                move.score = result.score;
            }
    
            newBoard[availSpots[i]] = move.index;
    
            moves.push(move);
        }

        let bestMove = "";
        if (currentPlayer === botPlayer) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    };

    return { createPlayer, switchMarks, getField, resetBoard, playRound, setGameMode, isGameOver };
})();

const displayController = (() => {
    // Start game buttons and divs
    const startGameBtn = document.getElementById("startGameBtn");
    const startGameDiv = document.querySelector(".startGame");
    const gameStartedDiv = document.querySelector(".gameStarted");
    // AI or player buttons
    const aiBotBtn = document.getElementById("aiBot");
    const pvpBtn = document.getElementById("playerVsPlayer");
    const playerModalDiv = document.getElementById("playersModal");
    const overlayDiv = document.querySelector(".overlay");
    const gameDiv = document.querySelector(".game");
    const formElement = document.querySelector(".playersForm");
    const botModalDiv = document.getElementById("botModal");
    const botEasyBtn = document.getElementById("botEasyBtn");
    const botHardBtn = document.getElementById("botHardBtn");
    // Game related items
    const fieldElements = document.querySelectorAll(".field");
    const playerMsg = document.querySelector(".playerMsg");
    const gameRestartBtn = document.getElementById("gameBoardRestart");
    const switchMarksBtn = document.getElementById("switchMarks");

    // Game start
    startGameBtn.addEventListener("click", () => {
        startGameDiv.classList.toggle("active");
        gameStartedDiv.classList.toggle("active");
    });

    // Select opponent
    aiBotBtn.addEventListener("click", () => toggleModals(botModalDiv));

    botEasyBtn.addEventListener("click", () => {
        botGame();
        gameBoard.setGameMode("botEasy");
        toggleModals(botModalDiv);
    });

    botHardBtn.addEventListener("click", () => {
        botGame();
        gameBoard.setGameMode("botHard");
        toggleModals(botModalDiv);
    });

    pvpBtn.addEventListener("click", () => toggleModals(playerModalDiv));

    formElement.addEventListener("submit", e => {
        e.preventDefault();
        gameBoard.resetBoard();
        gameBoard.setGameMode("pvp");
        gameBoard.createPlayer("player1", document.getElementById("player1Name").value);
        gameBoard.createPlayer("player2", document.getElementById("player2Name").value);
        toggleModals(playerModalDiv);
        gameDiv.classList.add("active");
        playerMsg.textContent = `It's ${document.getElementById("player1Name").value}'s turn!`
    });

    overlayDiv.addEventListener("click", () => {
        playerModalDiv.classList.remove("active");
        botModalDiv.classList.remove("active");
        overlayDiv.classList.remove("active");
    });

    // Player selection
    fieldElements.forEach(element => {
        element.addEventListener("click", (e) => {
            if (checkConditions(e.target.dataset.index)) return;
            if (gameBoard.isGameOver()) return;
            gameBoard.playRound(e.target.dataset.index);
            refreshGameBoard();
        });
    });

    // Restart button
    gameRestartBtn.addEventListener("click", () => {
        gameBoard.resetBoard();
    });

    // Switch Marks button
    switchMarksBtn.addEventListener("click", () => gameBoard.switchMarks());

    // Functions
    const toggleModals = (modal) => {
        modal.classList.toggle("active");
        overlayDiv.classList.toggle("active");
    };

    const refreshGameBoard = () => {
        for (let i = 0; i < fieldElements.length; i++) {
            fieldElements[i].textContent = gameBoard.getField(i);
        }
    };

    const checkConditions = (field) => {
        if (fieldElements[field].textContent !== "") return true;
    };

    const botGame = () => {
        gameBoard.resetBoard();
        gameBoard.createPlayer("player1", "Player");
        gameBoard.createPlayer("player2", "Bot");
        gameDiv.classList.add("active");
        playerMsg.textContent = `It's Player's turn!`
    };

    // Display winner
    const displayTurn = (playerName, win) => {
        if (win) {
            playerMsg.textContent = `${playerName} won!`;
        } else if (!win && gameBoard.isGameOver()) {
            playerMsg.textContent = `It's a tie!`;
        } else {
            playerMsg.textContent = `It's ${playerName}'s turn!`;
        }
    };

    return { refreshGameBoard, displayTurn }
})();