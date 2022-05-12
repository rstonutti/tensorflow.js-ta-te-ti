window.addEventListener('DOMContentLoaded', () => {
    console.log('Las X son la IA')
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';


    /*
        Indexes within the board
        [0] [1] [2]
        [3] [4] [5]
        [6] [7] [8]
    */

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            return;
        }

        if (!board.includes(''))
            announce(TIE);
    }

    const announce = (type) => {
        switch (type) {
            case PLAYERO_WON:
                announcer.innerHTML = 'Gana el jugador <span class="playerO">O</span>';
                break;
            case PLAYERX_WON:
                announcer.innerHTML = 'Gana el jugador <span class="playerX">X</span>';
                break;
            case TIE:
                announcer.innerText = 'Empate';
        }
        announcer.classList.remove('hide');
    };

    const isValidAction = (tile) => {
        if (tile.innerText === 'X' || tile.innerText === 'O') {
            return false;
        }

        return true;
    };

    const updateBoard = (index) => {
        board[index] = currentPlayer;
    }

    const changePlayer = () => {
        playerDisplay.classList.remove(`player${currentPlayer}`);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add(`player${currentPlayer}`);
    }

    const userAction = (tile, index, tiles) => {

        if (isValidAction(tile) && isGameActive) {
            tile.innerText = currentPlayer;
            tile.classList.add(`player${currentPlayer}`);
            updateBoard(index);
            handleResultValidation();
            changePlayer();
        }

        const tensor = [];

        tiles.forEach(posicion => {

            if (posicion.innerHTML == 'X') {
                tensor.push(1);
            } else if (posicion.innerHTML == 'O') {
                tensor.push(-1);
            } else {
                tensor.push(0);
            };

            /* console.log(posicion.innerHTML) */
        });

        tf.ready().then(() => {
            const modelPath = "model/ttt_model.json";
            tf.tidy(() => {
                tf.loadLayersModel(modelPath).then((model) => {
                    // Three board states
                    const juegoReal = tf.tensor(tensor);

                    // Stack states into a shape [3, 9]
                    const matches = tf.stack([juegoReal]);
                    const result = model.predict(matches);
                    // Log the results
                    result.print();

                });
            });
        });

    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        announcer.classList.add('hide');

        if (currentPlayer === 'O') {
            changePlayer();
        }

        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX');
            tile.classList.remove('playerO');
        });
    };
    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index, tiles));
    });

    resetButton.addEventListener('click', resetBoard);
});