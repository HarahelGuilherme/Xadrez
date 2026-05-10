$(document).ready(function () {
    var board = null;
    var game = new Chess();
    var $status = $('#status');
    var engine = null;

    // --- SOLUÇÃO PARA O ERRO DE SECURITY / WORKER ---
    const stockfishURL = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";

    fetch(stockfishURL)
        .then(response => response.text())
        .then(code => {
            const blob = new Blob([code], { type: 'application/javascript' });
            engine = new Worker(URL.createObjectURL(blob));
            console.log("IA Stockfish carregada com sucesso.");
            updateStatus();
        })
        .catch(err => {
            $status.html("Erro ao carregar IA. Verifique sua conexão.");
            console.error(err);
        });

    // --- LÓGICA DO JOGO ---
    function onDragStart(source, piece, position, orientation) {
        if (game.game_over()) return false;
        // Só permite mover brancas
        if (piece.search(/^b/) !== -1) return false;
    }

    function makeBestMove() {
        if (!engine || game.game_over()) return;

        const depth = $('#depth-level').val();
        $status.html('IA está pensando...');

        engine.postMessage('position fen ' + game.fen());
        engine.postMessage('go depth ' + depth);

        engine.onmessage = function (event) {
            if (event.data.startsWith('bestmove')) {
                const moveMsg = event.data.split(' ')[1];
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

    function onDrop(source, target) {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) return 'snapback';

        updateStatus();
        window.setTimeout(makeBestMove, 250);
    }

    function updateStatus() {
        let status = '';
        const moveColor = (game.turn() === 'b') ? 'Pretas (IA)' : 'Brancas (Você)';

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

    // --- INICIALIZAÇÃO DO TABULEIRO ---
    var config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('myBoard', config);

    $('#resetBtn').on('click', function() {
        game.reset();
        board.start();
        updateStatus();
    });
});