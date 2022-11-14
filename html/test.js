let allowedLines;
let allowedBets;
let lineIndex;
let betIndex;
let freeSpinsAmount;
let bonusSymbol;
let symbolsData;
let totalSymbolsPerReel = 0;
let totalSymbolsPerReelFreeSpins = 0;

fetch("../settings/config.json").then(function(resp) {
    return resp.json();
}).then(function(data) {
    allowedLines = data.allowedLinesNumbers;
    lineIndex = allowedLines.indexOf(data.defaultLinesNumber);
    allowedBets = data.allowedBetAmounts;
    betIndex = allowedBets.indexOf(data.defaultBetAmount);
    freeSpinsAmount = data.freeSpinsAmount;

    symbolsData = new Array(data.symbols.length);
    for(let i = 0; i < symbolsData.length; i++) {
        symbolsData[i] = new Array(5);
        symbolsData[i][0] = data.symbols[i].name;
        symbolsData[i][1] = data.symbols[i].imagePath;
        symbolsData[i][2] = data.symbols[i].amountPerReel;
        totalSymbolsPerReel += data.symbols[i].amountPerReel;
        symbolsData[i][3] = data.symbols[i].amountPerReelFreeSpins;
        totalSymbolsPerReelFreeSpins += data.symbols[i].amountPerReelFreeSpins;
        if(data.symbols[i].isBonus) {
            bonusSymbol = data.symbols[i];
        }
        symbolsData[i][4] = new Array(4);
        for(var j = 0; j < 4; j++) {
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
        }
    }
    handleMistakes();
    isSpinning = false
});

function handleMistakes() {
    if(lineIndex == -1) {
        console.log("WARNING: The default lines number is not an allowed lines number. The value got set to the lowest allowed lines number. Please correct the value in the config.json");
        lineIndex = 0;
    }
    if(betIndex == -1) {
        console.log("WARNING: The default bet amount is not an allowed bet amount. The value got set to the lowest allowed bet amount. Please correct the value in the config.json");
        betIndex = 0;
    }
}

const lines = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[2,1,0,1,2],[0,1,2,1,0],[1,0,0,0,1],[1,2,2,2,1],[2,2,1,0,0],[0,0,1,2,2],[2,1,1,1,0]];
let isSpinning = true;
let columnToStop;
let animation;
let multiplierAnimation;
let balance = 0;
let lastWin = 0;
let freeSpinsRunning = false;
let freeSpinsMultiplier = 0;
let freeSpinsLeft = 0;
let symbols = new Array(5);
let symbolsInColumn = [];

for(var i = 0; i < symbols.length; i++){
    symbols[i] = new Array(3);
};

function getRandomSymbol() {
    const number = Math.random();
    var numberToCheck = 0;
    var symbolArray;
    var totalSymbols;
    var index;
    if(freeSpinsRunning) {
        index = 3;
        totalSymbols = totalSymbolsPerReelFreeSpins;
        
    }else {
        index = 2;
        totalSymbols = totalSymbolsPerReel;
    }
    for(var i = 0; i < symbolsInColumn.length; i++) {
        totalSymbols -= symbolsInColumn[i][index];
    }
    var remainingSymbols = symbolsData.filter( function( symbolsData ) {
        return !symbolsInColumn.includes( symbolsData );
      } );

    
    for(var i = 0; i < remainingSymbols.length; i++) {
        if(numberToCheck + (remainingSymbols[i][index] / totalSymbols) > number) {
            symbolsInColumn.push(remainingSymbols[i]);
            return remainingSymbols[i];
        }
        numberToCheck += remainingSymbols[i][index] / totalSymbols;
    }
}

function test(runs) {
    balance = 0;
    var balanceBefore = balance;
    for(var a = 0; a < runs; a++) {
        if(freeSpinsRunning) {
            freeSpinsLeft--;
            freeSpinsMultiplier = Math.floor(Math.random() * 9) + 2;
        }else {
            balance--;
        }
        if(lastWin != 0) {
            lastWin = 0;
        }
        for(var j = 0; j < 5; j++) {
            for(var k = 0; k < 3; k++) {
                symbols[j][k] = getRandomSymbol()[0];
            }
            symbolsInColumn = [];
        }
        var bonusSymbols = 0;
        var winningLength = 1;
        for(var i = 0; i < 5; i++) {
            for(var k = 0; k < 3; k++){
                if(symbols[i][k] === bonusSymbol["name"]) {
                   bonusSymbols++;
                }
            }
        }
        for(var i = 0; i < allowedLines[lineIndex]; i++) {
            for(var k = 1; k < 5; k++) {
                if(symbols[k][lines[i][k]] != symbols[k-1][lines[i][k-1]]) {
                    break;
                }
                winningLength++;
            }
            if(winningLength > 1) {
                handleWin(i+1, winningLength);
            }
            winningLength = 1;
        }
        if(freeSpinsRunning && freeSpinsLeft == 0) {
            freeSpinsRunning = false;
        }else if(bonusSymbols >= 3) {
            freeSpinsRunning = true;
            freeSpinsLeft = freeSpinsAmount;
        }
        balance += lastWin;
    }
    console.log((balance / runs) * 100 + "%");
}

function handleWin(line, winningLength) {
    if(winningLength > 1) {
        var indexSymbol = lines[line - 1][0];
        const index = symbolsData.findIndex(symbolsData => symbolsData[0] == symbols[0][indexSymbol]);
        const multiplier = symbolsData[index][4][winningLength - 2] / allowedLines[lineIndex];
        if(multiplier > 0) {
            var win = multiplier * allowedBets[betIndex];
            if(freeSpinsRunning) {
                win *= freeSpinsMultiplier;
            }
            lastWin += win;
            return true;
        }
        return false;
    }

}