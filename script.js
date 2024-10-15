document.addEventListener('DOMContentLoaded', function() {
    const boardElement = document.getElementById('board');
    const startButton = document.getElementById('start-button');
    const difficultySelect = document.getElementById('difficulty-level');

    // Inicializar o tabuleiro de xadrez
    let chessboard = Chessboard(boardElement, {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true
    });

    // Função para iniciar o jogo
    startButton.addEventListener('click', function() {
        const difficulty = difficultySelect.value;
        console.log("Dificuldade escolhida:", difficulty);

        // Iniciar o tabuleiro com as peças na posição inicial
        chessboard.start();

        // Dependendo da dificuldade, você pode alterar o comportamento ou regras.
        if (difficulty === 'easy') {
            console.log('Iniciando jogo fácil...');
        } else if (difficulty === 'medium') {
            console.log('Iniciando jogo médio...');
        } else if (difficulty === 'hard') {
            console.log('Iniciando jogo difícil...');
        }
    });
});
