// script.js
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const secretWord = 'COFFEE';
    let attempts = 3;

    function renderScreen(screen) {
        appContainer.innerHTML = ''; // Clear previous screen
        const screenElement = document.createElement('div');
        screenElement.innerHTML = screen;
        appContainer.appendChild(screenElement);
    }

    // --- Introduction Screen ---
    const introScreen = `
        <h1>Let's Debug a Riddle...</h1>
        <p>I’ve encountered a bug that’s a 6-letter word. Think you can solve it in three tries?</p>
        <button id="startButton" class="button">Start</button>
    `;

    renderScreen(introScreen);
    document.getElementById('startButton').addEventListener('click', renderGameScreen);

    // --- Game Screen ---
    function renderGameScreen() {
        const gameScreen = `
            <h1>The Coffee Quest</h1>
            <p>Attempts Remaining: <span id="attempts-counter">${attempts}</span></p>
            <p class="hint">Hint: A popular beverage, and a major export from Karnataka.</p>
            <div class="input-group">
                <input type="text" id="guessInput" placeholder="Enter your guess" maxlength="6" autofocus>
                <button id="guessButton" class="button">Submit Guess</button>
            </div>
            <div id="feedback" class="feedback"></div>
        `;

        renderScreen(gameScreen);

        const guessInput = document.getElementById('guessInput');
        const guessButton = document.getElementById('guessButton');
        const feedbackDiv = document.getElementById('feedback');
        const attemptsCounter = document.getElementById('attempts-counter');

        guessButton.addEventListener('click', handleGuess);
        guessInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleGuess();
            }
        });

        function handleGuess() {
            const guess = guessInput.value.trim().toUpperCase();
            if (guess.length !== secretWord.length) {
                feedbackDiv.textContent = `Please enter a 6-letter word.`;
                feedbackDiv.classList.add('incorrect');
                return;
            }

            attempts--;
            attemptsCounter.textContent = attempts;
            feedbackDiv.classList.remove('incorrect', 'correct');

            if (guess === secretWord) {
                renderWinScreen();
            } else if (attempts === 0) {
                renderLossScreen();
            } else {
                feedbackDiv.textContent = `Incorrect guess. Try again!`;
                feedbackDiv.classList.add('incorrect');
                guessInput.value = '';
                guessInput.focus();
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