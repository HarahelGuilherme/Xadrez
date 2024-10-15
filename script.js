let board = null;
let game = new Chess();
let difficulty = "facil"; // Valor inicial para a dificuldade

function startGame() {
    difficulty = document.getElementById("difficulty-select").value;
    
    // Inicializar o tabuleiro de xadrez
    board = Chessboard('board', {
        draggable: true,   // Permite arrastar as peças
        position: 'start', // Posição inicial padrão
        onDrop: handleMove // Função para lidar com os movimentos
    });
    
    // Reiniciar o estado do jogo
    game.reset();
}

function handleMove(source, target) {
    // Tentar realizar o movimento
    const move = game.move({ from: source, to: target });
    if (move === null) return 'snapback'; // Se o movimento for inválido, retornar peça ao lugar

    // Movimenta o bot com base na dificuldade
    window.setTimeout(makeBotMove, 250);
}

function makeBotMove() {
    let moves = game.ugly_moves();
    let move = null;

    // Estratégias baseadas na dificuldade
    if (difficulty === "facil") {
        // Estratégia fácil: Escolhe um movimento aleatório
        move = randomMove(moves);
    } else if (difficulty === "medio") {
        // Estratégia média: Avalia movimentos simples
        move = basicBestMove(moves);
    } else if (difficulty === "dificil") {
        // Estratégia difícil: Movimento com minimax ou outro algoritmo de busca
        move = bestMoveMinimax(game, 2); // Profundidade 2
    }

    // Realizar o movimento do bot e atualizar o tabuleiro
    game.move(move);
    board.position(game.fen());
}

function randomMove(moves) {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
}

function basicBestMove(moves) {
    let bestMove = null;
    let bestValue = -9999;

    moves.forEach(move => {
        game.move(move);
        let value = evaluateBoard(game.board());
        game.undo();
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    });
    return bestMove;
}

function bestMoveMinimax(game, depth) {
    let bestMove = null;
    let bestValue = -9999;

    game.ugly_moves().forEach(move => {
        game.move(move);
        let value = minimax(game, depth - 1, -10000, 10000, false);
        game.undo();
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    });
    return bestMove;
}

function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0) {
        return evaluateBoard(game.board());
    }

    const moves = game.ugly_moves();

    if (isMaximizingPlayer) {
        let maxEval = -9999;
        for (let move of moves) {
            game.move(move);
            const eval = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = 9999;
        for (let move of moves) {
            game.move(move);
            const eval = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function evaluateBoard(board) {
    let totalEvaluation = 0;
    for (let row of board) {
        for (let piece of row) {
            totalEvaluation += getPieceValue(piece);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece) {
    if (piece === null) return 0;
    const pieceValues = {
        p: 10, n: 30, b: 30, r: 50, q: 90, k: 900,
        P: -10, N: -30, B: -30, R: -50, Q: -90, K: -900
    };
    return pieceValues[piece.type] || 0;
}
