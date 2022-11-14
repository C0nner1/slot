let balance = 1000000;

let allowedLines;
let allowedBets;
let lineIndex;
let betIndex;
let freeSpinsAmount;
let bonusSymbol;
let symbolsData;
let totalSymbolsPerReel = 0;
let totalSymbolsPerReelFreeSpins = 0;
let spinSound;
let lineSound;
let win1Sound;
let win2Sound;
let win3Sound;
let sounds = true;
let turbo = false;
let auto = false;
let symbolsInColumn = [];
let contourColor;
let backgroundColor;



fetch("../settings/config.json").then(function (resp) {

    return resp.json();
    
}).then(function (data) {

    allowedLines = data.allowedLinesNumbers;
    lineIndex = allowedLines.indexOf(data.defaultLinesNumber);
    allowedBets = data.allowedBetAmounts;
    betIndex = allowedBets.indexOf(data.defaultBetAmount);
    freeSpinsAmount = data.freeSpinsAmount;
    backgroundColor = data.backgroundColor;
    contourColor = data.contourColor;
    titleColor = data.titleColor;
    

    document.getElementById("panelTop").style.backgroundColor = backgroundColor;
    document.getElementById("container").style.backgroundColor = backgroundColor;
    document.getElementById("panelBottom").style.backgroundColor = backgroundColor;

    document.getElementById("container").style.border = "1vh solid " + contourColor;

    const freeSpinsTexts = Array.from(document.getElementsByClassName("freeSpinsText"));

    freeSpinsTexts.forEach(freeSpinsText => {
        freeSpinsText.style.color = titleColor;

    });

    const lines = Array.from(document.getElementsByClassName("blueLine"));

    lines.forEach(blueLine => {
        blueLine.style.backgroundColor = contourColor;

    });


    symbolsData = new Array(data.symbols.length);
    for (let i = 0; i < symbolsData.length; i++) {
        spinSound = data.sounds[0].path;
        lineSound = data.sounds[1].path;
        win1Sound = data.sounds[2].path;
        win2Sound = data.sounds[3].path;
        win3Sound = data.sounds[4].path;
        symbolsData[i] = new Array(5);
        symbolsData[i][0] = data.symbols[i].name;
        symbolsData[i][1] = data.symbols[i].imagePath;
        symbolsData[i][2] = data.symbols[i].amountPerReel;
        totalSymbolsPerReel += data.symbols[i].amountPerReel;
        symbolsData[i][3] = data.symbols[i].amountPerReelFreeSpins;
        totalSymbolsPerReelFreeSpins += data.symbols[i].amountPerReelFreeSpins;
        if (data.symbols[i].isBonus) {
            bonusSymbol = data.symbols[i];
        }
        symbolsData[i][4] = new Array(4);
        for (var j = 0; j < 4; j++) {
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
            symbolsData[i][4][j] = data.symbols[i].multipliers[j];
        }
    }
    handleMistakes();
    updateTexts();
    showSymbols();
    loadSounds();


});






function showSymbols() {
    document.getElementById("freeSpinsLeft").textContent = "";
    document.getElementById("multiplier").textContent = "";
    document.getElementById("multiplierText").textContent = "";
    for(var i = 1; i < 6; i++) {
        for(var j = 2; j < 5; j++) {
            document.getElementById("symbol" + i + "-" + j).src = symbolsData[j - 1][1];
        }
    }
    document.getElementById("bonusSymbol").src = bonusSymbol["imagePath"];
}

function maxBet() {
    if(!freeSpinsRunning && !isSpinning && betIndex < allowedBets.length - 1) {
        betIndex = allowedBets.length - 1;
        for(let i = 0; i < allowedBets.length; i++) {
            if(allowedBets[i] > balance) {
                betIndex = i - 1;
                break;
            }
        }
        if(betIndex < 0) {
            betIndex = 0;
}
        updateTexts();
    }
}

function autoSpin() {
    auto = !auto;

    if (auto){
        document.getElementById("autoSpinText").style.color = "red";
    } else{
        document.getElementById("autoSpinText").style.color = "black";
    }
    if(!isSpinning) {
        startSpin();
        
    }
}

function loadSounds() {
    spinSound = new Howl({
        src: spinSound,
        html5: true
    });
    lineSound = new Howl({
        src: lineSound,
        html5: true
    });
    win1Sound = new Howl({
        src: win1Sound,
        html5: true
    });
    win2Sound = new Howl({
        src: win2Sound,
        html5: true
    });
    win3Sound = new Howl({
        src: win3Sound,
        html5: true
    });
    isSpinning = false;
}

function switchSounds() {
    let buttonImage = document.getElementById("speakerImage");
    let status;
    if(sounds) {
        status = "OFF";
        sounds = false;
    }else {
        status = "ON";
        sounds = true;
    }
    buttonImage.src = "images/Speaker" + status + ".png";
}

function switchTurbo() {
    let buttonImage = document.getElementById("turboImage");
    let status;
    if(turbo) {
        status = "OFF";
        turbo = false;
    }else {
        status = "ON";
        turbo = true;
    }
    buttonImage.src = "images/Turbo" + status + ".png";
}



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

const lines = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[1,0,0,0,1],[1,2,2,2,1],[2,2,1,0,0],[0,0,1,2,2],[2,1,1,1,0]];
let isSpinning = true;
let columnToStop;
let animation;
let multiplierAnimation;
let lastWin = 0;
let freeSpinsRunning = false;
let freeSpinsMultiplier = 0;
let freeSpinsLeft = 0;
let symbols = new Array(5);





for(var i = 0; i < symbols.length; i++){
    symbols[i] = new Array(3);
};

function updateTexts() {
    document.getElementById("balance").textContent = balance;
    document.getElementById("bet").textContent = allowedBets[betIndex];
    document.getElementById("lines").textContent = allowedLines[lineIndex];
    
}

function getRandomImage() {
    var index;
    if(freeSpinsRunning) {
        index = Math.floor(Math.random() * symbolsData.length - 1) + 1;
    }else {
        index = Math.floor(Math.random() * symbolsData.length);
    }
    
    return symbolsData[index][1]; 
}

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

function setPosition(id, position) {
            document.getElementById(id).classList.add("notransition");
            document.getElementById(id).style.top = position;
            document.getElementById(id).offsetHeight;
            document.getElementById(id).classList.remove("notransition");
}

function hideLines() {
    for(var i = 1; i <= 10; i++) {
        document.getElementById("line" + i).style.visibility = "hidden";
    }
}

function betUp() {
    if(!freeSpinsRunning && !isSpinning && betIndex < allowedBets.length - 1) {
        betIndex++;
        updateTexts();
    }
}

function betDown() {
    
    if(!freeSpinsRunning && !isSpinning && betIndex > 0) {
        betIndex--;
        updateTexts();
    }
}

function linesUp() {
    if(!freeSpinsRunning && !isSpinning && lineIndex < allowedLines.length - 1) {
        lineIndex++;
        updateTexts();
    }
}

function linesDown() {
    if(!freeSpinsRunning && !isSpinning && lineIndex > 0) {
        lineIndex--;
        updateTexts();
    }
}

function startSpin() {
    
    if(isSpinning) {
        return;
    }

    if(freeSpinsRunning) {
        
        freeSpinsLeft--;
        clearInterval(multiplierAnimation);
        freeSpinsMultiplier = Math.floor(Math.random() * 9) + 2;
        document.getElementById("multiplier").textContent = freeSpinsMultiplier + "x";
    }else {
        if(balance < allowedBets[betIndex]) {
            auto = false;
            document.getElementById("autoSpinText").style.color = "black"
            return;
        }
        var moneyPlaced = allowedBets[betIndex]
        balance -= allowedBets[betIndex];
        updateTexts();
    }
    if(sounds) {
        spinSound.play();
    }

    if(lastWin != 0) {
        document.getElementById("win").textContent = "Last WIN " + lastWin;
        lastWin = 0;
    }
    isSpinning = true;
    hideLines();
    columnToStop = 0;
    for(var i = 1; i < 6; i++) {
        for(var k = 1; k < 5; k++) {
            var id = "symbol" + i + "-" + k;
            setPosition(id, "-6.5vh");
        }
    }

    var symbolToSend = 1;
    
    let delay = 400;
    if(turbo) {
        delay = 0;
    }

    animation = setInterval(function() {
        for(var i = 1; i < 6; i++) {
            var column = i + columnToStop;
            if(column > 5) {
                break;
            }
            var id = "symbol" + column + "-" + symbolToSend;
            setPosition(id, "-6.5vh");
            document.getElementById(id).src = getRandomImage();
            document.getElementById(id).style.top = "83.5vh";
        }
        
        

        symbolToSend++;
        if(symbolToSend > 4) {
           symbolToSend = 1;
        } 
    }, 75);
    setTimeout(stopSpin, delay);   
}

function stopSpin() {
    let delay = 250;
    if(turbo) {
        delay = 175;
    }
    const columnStopper = setInterval(function() {
        columnToStop++;
        if(columnToStop > 4) {
            clearInterval(animation);
            clearInterval(columnStopper);
            setTimeout(checkWins, 75);
        }
        for(var i = 1; i < 5; i++) {
            const id = "symbol" + columnToStop + "-" + i;
            const randomSymbol = getRandomSymbol();
            if(i > 1) {
                symbols[columnToStop - 1][i - 2] = randomSymbol[0];
            }
            document.getElementById(id).src = randomSymbol[1];
            var position = -6.7 + ((i-1) * 22.9) + "%"
            setPosition(id, position);
        }
        symbolsInColumn = [];
    }, delay);

}

function checkWins() {
    var bonusSymbols = 0;
    var winningLength = 1;
    for(var i = 0; i < 5; i++) {
        for(var k = 0; k < 3; k++){
            if(symbols[i][k] === bonusSymbol["name"]) {
               bonusSymbols++;
            }
        }
    }
    var winningLines = [];
    for(var i = 0; i < allowedLines[lineIndex]; i++) {
        for(var k = 1; k < 5; k++) {
            if(symbols[k][lines[i][k]] != symbols[k-1][lines[i][k-1]]) {
                break;
            }
            winningLength++;
        }
        if(winningLength > 1) {
            if(handleWin(i+1, winningLength)) {
                winningLines.push(i+1);
            }
        }
        winningLength = 1;
    }
    
    balance += lastWin;
    var win = lastWin;

    if(lastWin != 0) {
        //$.post('http://'+resourceName+'/AddMoneyFromWin', JSON.stringify({win}));
        document.getElementById("win").textContent = "WIN " + lastWin;
        if(winningLines.length > 1) {
            document.getElementById("line" + (winningLines[0])).style.visibility = "visible";
            if(sounds) {
                lineSound.play();
            }
            var index = 1;
            const lineAnimation = setInterval(function() {
                document.getElementById("line" + (winningLines[index])).style.visibility = "visible";
                if(sounds) {
                    lineSound.play();
                }
                index++;
                if(index >= winningLines.length) {
                    setTimeout(function() {spinEnd(bonusSymbols)}, 300);
                    clearInterval(lineAnimation);
                }
            }, 300);
        }
        
    }else {
        document.getElementById("win").textContent = "";
    }
    if(winningLines.length <= 1) {
        if(winningLines.length == 1) {
            document.getElementById("line" + (winningLines[0])).style.visibility = "visible";
        }
        spinEnd(bonusSymbols);
    }
    
}

function spinEnd(bonusSymbols) {
    if(sounds) {
        if(lastWin > 0) {
            if(lastWin / allowedBets[betIndex] < 5) {
                win1Sound.play();
            }else if(lastWin / allowedBets[betIndex] < 50){
                win2Sound.play();   
            }else {
                win3Sound.play();
            }
        }
    }
    
    if(freeSpinsRunning) {
        updateFreeSpins();
    }
    isSpinning = false;
    if(bonusSymbols >= 3) {
        freeSpins();
    }
    updateTexts();
    if(auto) {
        setTimeout(autoStart, 500);

    }
}

function autoStart() {
    if(isSpinning || !auto) {
        auto = false;
        document.getElementById("autoSpinText").style.color = "black"
        return;
    }
    startSpin();
}

function freeSpins() {
    document.getElementById("freeSpinsInfo").style.visibility = "hidden";
    document.getElementById("multiplierText").style.color = titleColor;
    document.getElementById("multiplierText").textContent = "Multiplier";
    document.getElementById("multiplierText").style.color = titleColor;

    freeSpinsRunning = true;
    freeSpinsLeft = freeSpinsAmount;
    updateFreeSpins();
    
}

function updateFreeSpins() {
    if(freeSpinsLeft == 0) {
        freeSpinsRunning = false;
        document.getElementById("freeSpinsLeft").textContent = "";
        document.getElementById("multiplier").textContent = "";
        document.getElementById("multiplierText").textContent = "";
        document.getElementById("multiplierText").style.color = titleColor;
        document.getElementById("freeSpinsInfo").style.color = titleColor;
        document.getElementById("freeSpinsInfo").style.visibility = "visible";
        return;
    }
    document.getElementById("freeSpinsLeft").style.color = titleColor;

    document.getElementById("freeSpinsLeft").textContent = freeSpinsLeft + " Free Spins left";
    var lastRandomNumber = 0;
    multiplierAnimation = setInterval(function() {
        var randomNumber;
        do {
            randomNumber = Math.floor(Math.random() * 9) + 2;
        }while(randomNumber == lastRandomNumber);
        lastRandomNumber = randomNumber;
        document.getElementById("multiplier").style.color = titleColor;

        document.getElementById("multiplier").textContent = randomNumber + "x";
    }, 200);
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




