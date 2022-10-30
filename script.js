"use strict";

// Factory function for players
const playerFactory = (name, symbol) => {
    return { name, symbol }
};

// A module pattern for the gameboard and displayController
const gameBoard = (() => {
    const board = ["X", "", "", "", "", "O", "", "", ""];
})();

const displayController = (() => {
    // stuff
})();

// Testing
const jeff = playerFactory("Oscar", "X");