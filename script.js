// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM
    const canvas = document.getElementById("game-board"); // Tablero del juego
    const ctx = canvas.getContext("2d"); // Contexto 2D para dibujar en el canvas
    const playerNameInput = document.getElementById("player-name"); // Entrada para el nombre del jugador
    const difficultySelect = document.getElementById("difficulty"); // Selector de dificultad
    const startForm = document.getElementById("start-form"); // Formulario inicial
    const menu = document.getElementById("menu"); // Menú principal
    const game = document.getElementById("game"); // Contenedor del juego
    const scorePanel = document.getElementById("score-panel"); // Panel de puntajes
    const scoreElement = document.getElementById("score"); // Elemento que muestra el puntaje actual
    const highScoreElement = document.getElementById("high-score"); // Elemento que muestra el puntaje más alto
    const restartButton = document.getElementById("restart-button"); // Botón para reiniciar el juego
    const viewScoresButton = document.getElementById("view-scores"); // Botón para ver los puntajes
    const backButton = document.getElementById("back-button"); // Botón para volver al juego
    const scoreBoard = document.getElementById("score-board"); // Contenedor del marcador
    const scoreList = document.getElementById("score-list"); // Lista de puntajes
    const mainMenuButton = document.getElementById("main-menu-button"); // Botón para volver al menú principal
    const eatSound = document.getElementById("beep"); // Sonido al comer

    // Variables del juego
    let playerName = ""; // Nombre del jugador
    let difficulty = "easy"; // Dificultad seleccionada
    let score = 0; // Puntaje actual
    let highScore = localStorage.getItem("highScore") || 0; // Puntaje más alto guardado
    let scores = JSON.parse(localStorage.getItem("scores")) || []; // Lista de puntajes guardados
    let gameInterval; // Intervalo del bucle del juego
    let snake, food, direction, speed; // Variables relacionadas con la serpiente y el juego

    // Inicializa el juego
    function initializeGame() {
        snake = [{ x: 200, y: 200 }]; // Posición inicial de la serpiente
        food = spawnFood(); // Genera la comida
        direction = { x: 20, y: 0 }; // Dirección inicial de la serpiente
        score = 0; // Reinicia el puntaje
        speed = difficulty === "easy" ? 200 : difficulty === "medium" ? 150 : 100; // Ajusta la velocidad según la dificultad
        updateScore(); // Actualiza los puntajes en pantalla
        gameInterval = setInterval(gameLoop, speed); // Inicia el bucle del juego
    }

    // Genera comida en una posición aleatoria
    function spawnFood() {
        const x = Math.floor((Math.random() * canvas.width) / 20) * 20;
        const y = Math.floor((Math.random() * canvas.height) / 20) * 20;
        return { x, y };
    }

    // Actualiza los puntajes mostrados en pantalla
    function updateScore() {
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
    }

    // Bucle principal del juego
    function gameLoop() {
        moveSnake(); // Mueve la serpiente
        if (isGameOver()) { // Verifica si el juego terminó
            endGame(); // Finaliza el juego
        } else {
            drawGame(); // Dibuja los elementos en el canvas
        }
    }

    // Mueve la serpiente en la dirección actual
    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }; // Nueva posición de la cabeza
        snake.unshift(head); // Agrega la nueva cabeza al inicio del arreglo

        if (head.x === food.x && head.y === food.y) { // Si la serpiente come la comida
            score += 10; // Incrementa el puntaje
            eatSound.currentTime = 0; // Reinicia el sonido
            eatSound.play(); // Reproduce el sonido

            if (score > highScore) { // Actualiza el puntaje más alto si es necesario
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
            food = spawnFood(); // Genera nueva comida
        } else {
            snake.pop(); // Elimina la cola si no comió
        }
        updateScore(); // Actualiza los puntajes
    }

    // Limpia los puntajes guardados
    document.getElementById("clear-scores-button").addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas borrar todos los puntajes?")) {
            localStorage.removeItem("scores"); // Borra los puntajes del almacenamiento local
            scores = []; // Limpia la variable local
            scoreList.innerHTML = "<li>No hay puntajes registrados.</li>"; // Muestra mensaje en la lista
            alert("Todos los puntajes han sido borrados."); // Alerta de confirmación
        }
    });

    // Verifica si el juego terminó
    function isGameOver() {
        const head = snake[0]; // Posición de la cabeza
        return (
            head.x < 0 || head.y < 0 || // Si la cabeza está fuera del canvas
            head.x >= canvas.width || head.y >= canvas.height || // Límites del canvas
            snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y) // Si la cabeza colisiona con el cuerpo
        );
    }

    // Finaliza el juego
    function endGame() {
        clearInterval(gameInterval); // Detiene el bucle del juego
        const gameOverSound = document.getElementById("game-over-sound"); // Sonido de "Game Over"
        gameOverSound.currentTime = 0;
        gameOverSound.play();

        // Dibuja la pantalla de "Game Over"
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Presiona 'Nueva Partida' para intentarlo de nuevo", canvas.width / 2, canvas.height / 2 + 50);
        saveScore(); // Guarda el puntaje
    }

    // Guarda el puntaje actual
    function saveScore() {
        scores.push({ name: playerName, score });
        scores.sort((a, b) => b.score - a.score); // Ordena los puntajes en orden descendente
        localStorage.setItem("scores", JSON.stringify(scores)); // Guarda los puntajes en almacenamiento local
    }

    // Dibuja el juego en el canvas
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas
        drawSnake(); // Dibuja la serpiente
        drawFood(); // Dibuja la comida
    }

    // Dibuja la serpiente en el canvas
    function drawSnake() {
        ctx.fillStyle = "green"; // Color de la serpiente
        snake.forEach(segment => {
            ctx.beginPath();
            ctx.arc(
                segment.x + 10, // Ajuste de posición para centrar el círculo
                segment.y + 10, // Ajuste de posición para centrar el círculo
                10,             // Radio del círculo
                0,              // Ángulo inicial
                Math.PI * 2     // Ángulo final (círculo completo)
            );
            ctx.fill();
        });
    }

    // Dibuja la comida en el canvas
    function drawFood() {
        ctx.fillStyle = "red"; // Color de la comida
        ctx.fillRect(food.x, food.y, 20, 20); // Dibuja la comida como un cuadrado
    }

 // Event Listeners

// Evento que se activa al enviar el formulario de inicio
startForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    playerName = playerNameInput.value; // Obtiene el nombre del jugador del campo de entrada
    difficulty = difficultySelect.value; // Obtiene la dificultad seleccionada
    menu.style.display = "none"; // Oculta el menú principal
    game.style.display = "block"; // Muestra la pantalla del juego
    initializeGame(); // Inicializa el juego
});

// Evento que escucha las teclas de dirección para mover la serpiente
document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowUp":
            // Cambia la dirección hacia arriba si no se está moviendo ya hacia abajo
            if (direction.y === 0) direction = { x: 0, y: -20 };
            break;
        case "ArrowDown":
            // Cambia la dirección hacia abajo si no se está moviendo ya hacia arriba
            if (direction.y === 0) direction = { x: 0, y: 20 };
            break;
        case "ArrowLeft":
            // Cambia la dirección hacia la izquierda si no se está moviendo ya hacia la derecha
            if (direction.x === 0) direction = { x: -20, y: 0 };
            break;
        case "ArrowRight":
            // Cambia la dirección hacia la derecha si no se está moviendo ya hacia la izquierda
            if (direction.x === 0) direction = { x: 20, y: 0 };
            break;
    }
});

// Evento para regresar al menú principal
mainMenuButton.addEventListener("click", () => {
    clearInterval(gameInterval); // Detiene el juego actual

    // Restablece la interfaz a su estado inicial
    game.style.display = "none"; // Oculta la pantalla del juego
    scoreBoard.style.display = "none"; // Oculta el tablero de puntajes
    menu.style.display = "block"; // Muestra el menú principal

    // Limpia los campos de entrada y restablece la dificultad (opcional)
    playerNameInput.value = ""; 
    difficultySelect.value = "easy";
});

// Evento para reiniciar el juego actual
restartButton.addEventListener("click", () => {
    clearInterval(gameInterval); // Detiene el juego actual
    initializeGame(); // Reinicia el juego
});

// Evento para mostrar el tablero de puntajes
viewScoresButton.addEventListener("click", () => {
    game.style.display = "none"; // Oculta la pantalla del juego
    scoreBoard.style.display = "block"; // Muestra el tablero de puntajes

    // Actualiza la lista de puntajes con los datos almacenados
    scoreList.innerHTML = scores
        .map(score => `<li>${score.name}: ${score.score}</li>`) // Convierte cada puntaje en un elemento de lista
        .join(""); // Combina todos los elementos en un solo string
});

// Evento para regresar al juego desde el tablero de puntajes
backButton.addEventListener("click", () => {
    scoreBoard.style.display = "none"; // Oculta el tablero de puntajes
    game.style.display = "block"; // Muestra la pantalla del juego
});

});

/*let showGameOver = true;
let gameOverInterval = setInterval(() => {
    if (showGameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    }
    showGameOver = !showGameOver; // Alterna entre mostrar y ocultar el texto
}, 500); // Cambia cada 500ms
*/

