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
        if (gameMode === "botEasy") {
            displayController.displayTurn(player2.name, false);
            displayController.refreshGameBoard();
        } else if (gameMode === "botHard") {
            displayController.displayTurn(player2.name, false);
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
            aiBotPlay(aiBotEasy, player1);
            displayController.refreshGameBoard();
            displayController.displayTurn(player2.name, false);
        } else if (gameMode === "botHard" && player1.name === "Bot") {
            aiBotPlay(aiBotHard, player1);
            displayController.refreshGameBoard();
            displayController.displayTurn(player2.name, false);
        } else if ((gameMode === "botEasy" || gameMode === "botHard") && player1.name !== "Bot") {
            displayController.displayTurn(player1.name, false);
        }
    };

    const playRound = (index) => {
        let currentPlayer = "";
        let bot = "";
        if (round % 2 === 0) {
            currentPlayer = player2;
            bot = player1;
        } else {
            currentPlayer = player1;
            bot = player2;
        }
        round++;
        setField(index, currentPlayer);
        checkWinner(currentPlayer);
        // If playing vs computer
        if (winner === "" && gameMode === "botEasy") {
            aiBotPlay(aiBotEasy, bot);
        } else if (winner === "" && gameMode === "botHard") {
            aiBotPlay(aiBotHard, bot);
        }
        // Display next turn or winner message
        if (winner === currentPlayer) {
            displayController.displayTurn(currentPlayer.name, true);
        } else if (winner !== "" && winner !== currentPlayer) {
            displayController.displayTurn(getNextName(currentPlayer), true);
        } else if (gameMode === "botEasy") {
            displayController.displayTurn(currentPlayer.name, false);
        } else {
            displayController.displayTurn(getNextName(currentPlayer), false);
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

    const checkWinner = (currentPlayer) => {
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
        winningConditions.forEach((row) => {
            let a = row[0];
            let b = row[1];
            let c = row[2];
            if (board[a] !== "" && board[a] === board[b] && board[b] === board[c]) {
                winner = currentPlayer;
            };
        });
    };

    // AI Bot
    const aiBotPlay = (difficulty, botPlayer) => {
        setField(difficulty(), botPlayer);
        round++;
        checkWinner(botPlayer);
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

// Testing
