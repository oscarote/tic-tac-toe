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

    const getName = (playerNumber) => {
        if (playerNumber === "player1") {
            return player1.name;
        } else {
            return player2.name;
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
    }

    const playRound = (index) => {
        let currentPlayer = "";
        if (round % 2 === 0) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;

        }
        round++;
        setField(index, currentPlayer);
        console.log(checkWinner(currentPlayer));
        checkWinner(currentPlayer)
        if (winner !== "") {
            console.log("won");
            displayController.displayTurn(currentPlayer.name, true);
        } else {
            console.log("not yet");
            displayController.displayTurn(getNextName(currentPlayer), false);
        }
        return currentPlayer;
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

    const checkVar = () => {
        console.log(player1, player2);
        console.log(round);
        console.log(board);
        console.log(winner);
    };

    return { createPlayer, getName, getNextName, getField, resetBoard, playRound, isGameOver, checkWinner, checkVar };
})();

const displayController = (() => {
    // Start game buttons and divs
    const startGameBtn = document.getElementById("startGameBtn");
    const startGameDiv = document.querySelector(".startGame");
    const gameStartedDiv = document.querySelector(".gameStarted");
    // AI or player buttons
    const aiBotBtn = document.getElementById("aiBot");
    const pvpBtn = document.getElementById("playerVsPlayer");
    const modalDiv = document.querySelector(".modal");
    const overlayDiv = document.querySelector(".overlay");
    const gameDiv = document.querySelector(".game");
    const formElement = document.querySelector(".playersForm");
    // Game related items
    const fieldElements = document.querySelectorAll(".field");
    const playerMsg = document.querySelector(".playerMsg");
    const gameRestartBtn = document.getElementById("gameBoardRestart");

    // Game start
    startGameBtn.addEventListener("click", () => {
        startGameDiv.classList.toggle("active");
        gameStartedDiv.classList.toggle("active");
    });

    // Select opponent
    pvpBtn.addEventListener("click", () => toggleModals());

    formElement.addEventListener("submit", e => {
        e.preventDefault();
        gameBoard.resetBoard();
        gameBoard.createPlayer("player1", document.getElementById("player1Name").value);
        gameBoard.createPlayer("player2", document.getElementById("player2Name").value);
        toggleModals();
        gameDiv.classList.add("active");
        playerMsg.textContent = `It's ${document.getElementById("player1Name").value}'s turn!`
    });

    overlayDiv.addEventListener("click", () => toggleModals());

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
        playerMsg.textContent = `It's ${gameBoard.getName("player1")}'s turn!`
    });

    // Functions
    const toggleModals = () => {
        modalDiv.classList.toggle("active");
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

    // Display winner
    const displayTurn = (player, win) => {
        if (win) {
            playerMsg.textContent = `${player} won!`;
        } else if (!win && gameBoard.isGameOver()) {
            playerMsg.textContent = `It's a tie!`;
        } else {
            playerMsg.textContent = `It's ${player}'s turn!`;
        }
    };

    return { refreshGameBoard, displayTurn }
})();

// Testing
