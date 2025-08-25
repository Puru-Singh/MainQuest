// script.js
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const secretWord = 'COFFEE';
    const maxTries = 5;
    const wordLength = 6;
    let currentRow = 0;
    let currentGuess = '';

    const themeSwitch = document.getElementById('checkbox');
    themeSwitch.addEventListener('change', toggleTheme);

    function toggleTheme() {
        if (themeSwitch.checked) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
    }

    function renderScreen(screen) {
        appContainer.innerHTML = '';
        const screenElement = document.createElement('div');
        screenElement.innerHTML = screen;
        appContainer.appendChild(screenElement);
    }

    // --- Introduction Screen ---
    const introScreen = `
        <h1>Let's Debug a Riddle...</h1>
        <p>I’ve encountered a 6-letter bug. You have five tries to solve it.</p>
        <button id="startButton" class="button">Start</button>
    `;

    renderScreen(introScreen);
    document.getElementById('startButton').addEventListener('click', renderGameScreen);

    // --- Game Screen ---
    function renderGameScreen() {
        const gameScreen = `
            <h1>The Coffee Quest</h1>
            <p class="hint">Hint: A popular beverage, and a major export from Karnataka.</p>
            <div id="game-grid"></div>
            <div id="keyboard"></div>
            <div id="feedback" class="feedback"></div>
        `;

        renderScreen(gameScreen);
        setupGameGrid();
        setupKeyboard();
    }

    function setupGameGrid() {
        const grid = document.getElementById('game-grid');
        for (let i = 0; i < maxTries; i++) {
            const row = document.createElement('div');
            row.classList.add('row');
            for (let j = 0; j < wordLength; j++) {
                const box = document.createElement('div');
                box.classList.add('box');
                row.appendChild(box);
            }
            grid.appendChild(row);
        }
    }

    function setupKeyboard() {
        const keyboard = document.getElementById('keyboard');
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
        ];

        keyboardLayout.forEach(rowKeys => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('key-row');
            rowKeys.forEach(key => {
                const keyBtn = document.createElement('button');
                keyBtn.classList.add('key');
                keyBtn.textContent = key;
                keyBtn.id = `${key.toLowerCase()}-key`;
                rowDiv.appendChild(keyBtn);
                keyBtn.addEventListener('click', () => handleKeyPress(key));
            });
            keyboard.appendChild(rowDiv);
        });

        document.addEventListener('keydown', (event) => {
            const key = event.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE' || (key.length === 1 && key.match(/[a-zA-Z]/))) {
                handleKeyPress(key);
            }
        });
    }

    function handleKeyPress(key) {
        const feedbackDiv = document.getElementById('feedback');
        feedbackDiv.textContent = '';

        if (key === 'ENTER') {
            if (currentGuess.length === wordLength) {
                checkGuess();
            } else {
                feedbackDiv.textContent = 'Not enough letters!';
            }
        } else if (key === 'BACK' || key === 'BACKSPACE') {
            currentGuess = currentGuess.slice(0, -1);
            updateGrid();
        } else if (currentGuess.length < wordLength) {
            currentGuess += key;
            updateGrid();
        }
    }

    function updateGrid() {
        const row = document.getElementById('game-grid').children[currentRow];
        const boxes = row.querySelectorAll('.box');
        for (let i = 0; i < wordLength; i++) {
            boxes[i].textContent = currentGuess[i] || '';
        }
    }

    function checkGuess() {
        const guess = currentGuess;
        const secret = secretWord.toUpperCase();
        const feedbackDiv = document.getElementById('feedback');
        const row = document.getElementById('game-grid').children[currentRow];
        const boxes = row.querySelectorAll('.box');

        const secretLetters = secret.split('');
        const guessLetters = guess.split('');
        const letterStatus = {};

        // First pass: find correct letters
        for (let i = 0; i < wordLength; i++) {
            if (guessLetters[i] === secretLetters[i]) {
                boxes[i].classList.add('correct');
                letterStatus[guessLetters[i]] = 'correct';
                secretLetters[i] = null;
            }
        }

        // Second pass: find present and absent letters
        for (let i = 0; i < wordLength; i++) {
            if (!boxes[i].classList.contains('correct')) {
                if (secretLetters.includes(guessLetters[i])) {
                    boxes[i].classList.add('present');
                    if (letterStatus[guessLetters[i]] !== 'correct') {
                        letterStatus[guessLetters[i]] = 'present';
                    }
                    secretLetters[secretLetters.indexOf(guessLetters[i])] = null;
                } else {
                    boxes[i].classList.add('absent');
                    if (!letterStatus[guessLetters[i]]) {
                        letterStatus[guessLetters[i]] = 'absent';
                    }
                }
            }
        }

        updateKeyboardColors(letterStatus);

        if (guess === secret) {
            setTimeout(renderWinScreen, 1000);
        } else if (currentRow === maxTries - 1) {
            setTimeout(renderLossScreen, 1000);
        } else {
            currentRow++;
            currentGuess = '';
        }
    }

    function updateKeyboardColors(status) {
        for (const key in status) {
            const keyBtn = document.getElementById(`${key.toLowerCase()}-key`);
            if (keyBtn) {
                const currentStatus = status[key];
                if (currentStatus === 'correct') {
                    keyBtn.classList.remove('present', 'absent');
                    keyBtn.classList.add('correct');
                } else if (currentStatus === 'present' && !keyBtn.classList.contains('correct')) {
                    keyBtn.classList.remove('absent');
                    keyBtn.classList.add('present');
                } else if (currentStatus === 'absent' && !keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
                    keyBtn.classList.add('absent');
                }
            }
        }
    }

    // --- Win Screen ---
    function renderWinScreen() {
        const winScreen = `
            <h1>Correct! Bug Squashed! 🎉</h1>
            <p>Since you're so good at solving puzzles, I was wondering if you'd be up for grabbing a coffee sometime?</p>
            <button id="winButton" class="button">Let's do it!</button>
        `;
        renderScreen(winScreen);
    }

    // --- Loss Screen ---
    function renderLossScreen() {
        const lossScreen = `
            <h1>System Overload! 🥵</h1>
            <p>It looks like the bug won this time. But I'll tell you the answer: It was ${secretWord}. I still think we should grab one sometime. 😉</p>
            <button id="lossButton" class="button">Okay, I'm in.</button>
        `;
        renderScreen(lossScreen);
    }
});