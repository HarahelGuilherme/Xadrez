var board = null;
var game = new Chess();
var $status = $('#status');

// Inicializa a IA Stockfish via Worker
var stockfishURL = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";
var engine = new Worker(stockfishURL);

function onDragStart (source, piece, position, orientation) {
    // Não permite mover se o jogo acabou ou se for a vez da IA
    if (game.game_over()) return false;
    if (game.turn() === 'b') return false; 
}

function makeBestMove() {
    if (game.game_over()) return;

    var depth = $('#depth-level').val();
    $status.html('IA pensando (Profundidade ' + depth + ')...');

    engine.postMessage('position fen ' + game.fen());
    engine.postMessage('go depth ' + depth);

    engine.onmessage = function(event) {
        if (event.data.startsWith('bestmove')) {
            var moveMsg = event.data.split(' ')[1];
            
            game.move({
                from: moveMsg.substring(0, 2),
                to: moveMsg.substring(2, 4),
                promotion: 'q'
            });

            board.position(game.fen());
            updateStatus();
        }
    };
}

function onDrop (source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    updateStatus();
    window.setTimeout(makeBestMove, 250);
}

function updateStatus () {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Pretas (IA)' : 'Brancas (Você)';

    if (game.in_checkmate()) {
        status = 'Fim de Jogo: ' + moveColor + ' sofreu Xeque-mate.';
    } else if (game.in_draw()) {
        status = 'Fim de Jogo: Empate.';
    } else {
        status = 'Vez das ' + moveColor;
        if (game.in_check()) status += ' (Xeque!)';
    }

    $status.html(status);
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('myBoard', config);
updateStatus();