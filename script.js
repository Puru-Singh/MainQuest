// script.js
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const secretWord = 'COFFEE';
    const maxTries = 5;
    const wordLength = 6;
    let currentRow = 0;
    let currentGuess = '';

    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const storageKey = 'theme-preference';

    const onClick = () => {
        // flip current value
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setPreference(newTheme);
    };

    const getColorPreference = () => {
        if (localStorage.getItem(storageKey)) {
            return localStorage.getItem(storageKey);
        } else {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
    };

    const setPreference = (themeValue) => {
        localStorage.setItem(storageKey, themeValue);
        reflectPreference(themeValue);
    };

    const reflectPreference = (themeValue) => {
        document.body.setAttribute('data-theme', themeValue);
        document.querySelector('#theme-toggle')?.setAttribute('aria-label', themeValue);
    };

    const initialTheme = getColorPreference();
    reflectPreference(initialTheme);

    window.onload = () => {
        // now this script can find and listen for clicks on the control
        document.querySelector('#theme-toggle').addEventListener('click', onClick);
    };

    // sync with system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
        const newTheme = isDark ? 'dark' : 'light';
        setPreference(newTheme);
    });

    // --- Game Logic ---
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
            <h1>Bug hunting!</h1>
            <p class="hint">Hint: It's something you love, and Karnataka's popular for it.</p>
            <p class="hint">Pink means that the character is present but position is incorrect.</p>
            <p class="hint">Green means it's present and the position is correct as well.</p>
            <p class="hint">Grey means the position and the character both are incorrect.</p>
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
            ['DELETE', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
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
        } else if (key === 'DELETE' || key === 'BACKSPACE') {
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
    
    // New function to handle the AJAX form submissions for both screens
    function setupFormSubmission(formId) {
        const form = document.getElementById(formId);

        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // This is the key line that stops the redirect

            const data = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const responseType = data.get('response');
                    renderFinalScreen(responseType);
                } else {
                    renderErrorScreen();
                }
            } catch (error) {
                console.error('Submission error:', error);
                renderErrorScreen();
            }
        });
    }

    // New function to render the final message screen
    function renderFinalScreen(responseType) {
        let message = '';
        if (responseType === 'Yes - from Win Screen' || responseType === 'Yes - from Loss Screen') {
            message = "Great!! I look forward to seeing you :D ";
        } else if (responseType === 'No - from Win Screen' || responseType === 'No - from Loss Screen') {
            message = "I understand, thank you for going through this mini game though :') I hope for nothing but the best for you!";
        }

        const finalScreen = `
            <div class="final-message-container">
                <p class="body">${message}</p>
            </div>
        `;
        renderScreen(finalScreen);
        document.body.classList.add('black-background'); // Add class to make the body black
        document.querySelector('.theme-switch-wrapper').style.display = 'none'; // Hide the theme switch
    }

    // New function to render the error screen
    function renderErrorScreen() {
        const errorScreen = `
            <div class="final-message-container">
                <p class="body">Response isn't recorded, can you please DM me back :')</p>
            </div>
        `;
        renderScreen(errorScreen);
        document.body.classList.add('black-background'); // Add class to make the body black
        document.querySelector('.theme-switch-wrapper').style.display = 'none'; // Hide the theme switch
    }

    function renderWinScreen() {
        document.body.classList.add('game-over');
        const winScreen = `
            <h1>Correct! You've Won! 🎉</h1>
            <p>Well... Since you're so good at solving puzzles, I was wondering if you'd be up for grabbing a coffee this Sunday? :D</p>
            
            <form id="winFormYes" action="https://formspree.io/f/xyzdyylp" method="POST">
                <input type="hidden" name="response" value="Yes - from Win Screen">
                <button type="submit" class="button">Sure, Let's do it!</button>
            </form>

            <form id="winFormNo" action="https://formspree.io/f/xyzdyylp" method="POST">
                <input type="hidden" name="response" value="No - from Win Screen">
                <button type="submit" class="button_2">I can't.</button>
            </form>
        `;
        renderScreen(winScreen);
        setupFormSubmission('winFormYes');
        setupFormSubmission('winFormNo');
    }

    function renderLossScreen() {
        document.body.classList.add('game-over');
        const lossScreen = `
            <h1>Sorryy but you lost.. :')</h1>
            <p>But I'll tell you the answer: It was Coffee! Something I was wondering if you'd be up to have one with me this Sunday? :D</p>
            
            <form id="lossFormYes" action="https://formspree.io/f/xyzdyylp" method="POST">
                <input type="hidden" name="response" value="Yes - from Loss Screen">
                <button type="submit" class="button">Okay, I'm in.</button>
            </form>

            <form id="lossFormNo" action="https://formspree.io/f/xyzdyylp" method="POST">
                <input type="hidden" name="response" value="No - from Loss Screen">
                <button type="submit" class="button_2">I'm out.</button>
            </form>
        `;
        renderScreen(lossScreen);
        setupFormSubmission('lossFormYes');
        setupFormSubmission('lossFormNo');
    }
});