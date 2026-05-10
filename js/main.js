var board = null;
var game = new Chess();
var $status = $('#status');

// Link para o Worker do Stockfish (IA nível profissional)
var stockfishURL = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";
var engine = new Worker(stockfishURL);

function onDragStart (source, piece, position, orientation) {
    // Não permite mover peças se o jogo acabou ou se for a vez das pretas (IA)
    if (game.game_over()) return false;
    if (piece.search(/^b/) !== -1) return false;
}

function makeBestMove() {
    if (game.game_over()) return;

    $status.html('IA pensando...');

    // Manda a posição atual para o Stockfish
    engine.postMessage('position fen ' + game.fen());
    // "go depth 12" faz a IA olhar 12 jogadas à frente
    engine.postMessage('go depth 12');

    engine.onmessage = function(event) {
        if (event.data.startsWith('bestmove')) {
            var move = event.data.split(' ')[1];
            
            game.move({
                from: move.substring(0, 2),
                to: move.substring(2, 4),
                promotion: 'q'
            });

            board.position(game.fen());
            updateStatus();
        }
    };
}

function onDrop (source, target) {
    // Tenta fazer o movimento do jogador
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    // Se o movimento for ilegal
    if (move === null) return 'snapback';

    updateStatus();
    // Chama a IA após 250ms
    window.setTimeout(makeBestMove, 250);
}

function updateStatus () {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Pretas (IA)' : 'Brancas (Você)';

    if (game.in_checkmate()) {
        status = 'Jogo encerrado! ' + moveColor + ' está em Xeque-mate.';
    } else if (game.in_draw()) {
        status = 'Jogo encerrado! Empate.';
    } else {
        status = moveColor + ' jogam.';
        if (game.in_check()) status += ' (Xeque!)';
    }

    $status.html(status);
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    // Peças oficiais da Wikipedia hospedadas online
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('myBoard', config);
updateStatus();