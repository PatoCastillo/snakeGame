document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game-board");
    const ctx = canvas.getContext("2d");
    const playerNameInput = document.getElementById("player-name");
    const difficultySelect = document.getElementById("difficulty");
    const startForm = document.getElementById("start-form");
    const menu = document.getElementById("menu");
    const game = document.getElementById("game");
    const scorePanel = document.getElementById("score-panel");
    const scoreElement = document.getElementById("score");
    const highScoreElement = document.getElementById("high-score");
    const restartButton = document.getElementById("restart-button");
    const viewScoresButton = document.getElementById("view-scores");
    const backButton = document.getElementById("back-button");
    const scoreBoard = document.getElementById("score-board");
    const scoreList = document.getElementById("score-list");
    const mainMenuButton = document.getElementById("main-menu-button");
    const eatSound = document.getElementById("beep"); // Sonido al comer

    let playerName = "";
    let difficulty = "easy";
    let score = 0;
    let highScore = localStorage.getItem("highScore") || 0;
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    let gameInterval;
    let snake, food, direction, speed;

    // Snake Game Initialization
    function initializeGame() {
        snake = [{ x: 200, y: 200 }];
        food = spawnFood();
        direction = { x: 20, y: 0 };
        score = 0;
        speed = difficulty === "easy" ? 200 : difficulty === "medium" ? 150 : 100;
        updateScore();
        gameInterval = setInterval(gameLoop, speed);
    }

    function spawnFood() {
        const x = Math.floor((Math.random() * canvas.width) / 20) * 20;
        const y = Math.floor((Math.random() * canvas.height) / 20) * 20;
        return { x, y };
    }

    function updateScore() {
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
    }

    function gameLoop() {
        moveSnake();
        if (isGameOver()) {
            endGame();
        } else {
            drawGame();
        }
    }

    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            // Reproduce el sonido cuando la serpiente come
            eatSound.currentTime = 0; // Reinicia el sonido
            eatSound.play();
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
            food = spawnFood();
        } else {
            snake.pop();
        }
        updateScore();
    }

    document.getElementById("clear-scores-button").addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas borrar todos los puntajes?")) {
            // Limpia los puntajes del almacenamiento local
            localStorage.removeItem("scores");
            scores = []; // Limpia la variable local
    
            // Actualiza la lista de puntajes en la interfaz
            scoreList.innerHTML = "<li>No hay puntajes registrados.</li>";
            alert("Todos los puntajes han sido borrados.");
        }
    });

    function isGameOver() {
        const head = snake[0];
        return (
            head.x < 0 || head.y < 0 ||
            head.x >= canvas.width || head.y >= canvas.height ||
            snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
        );
    }

    function endGame() {
        clearInterval(gameInterval);
    // Reproduce el sonido de "Game Over"
    const gameOverSound = document.getElementById("game-over-sound");
    gameOverSound.currentTime = 0; // Reinicia el sonido por si ya se había reproducido
    gameOverSound.play();

    // Dibuja "Game Over" en el canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);

    ctx.font = "20px Arial";
    ctx.fillText("Presiona 'Nueva Partida' para intentarlo de nuevo", canvas.width / 2, canvas.height / 2 + 50);
        saveScore();
    }

    function saveScore() {
        scores.push({ name: playerName, score });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem("scores", JSON.stringify(scores));
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSnake();
        drawFood();
    }

    function drawSnake() {
        ctx.fillStyle = "green";
        snake.forEach(segment => {
            // Dibujar círculos para cada segmento
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
    

    function drawFood() {
        ctx.fillStyle = "red";
        ctx.fillRect(food.x, food.y, 20, 20);
    }

    // Event Listeners
    startForm.addEventListener("submit", (e) => {
        e.preventDefault();
        playerName = playerNameInput.value;
        difficulty = difficultySelect.value;
        menu.style.display = "none";
        game.style.display = "block";
        initializeGame();
    });

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "ArrowUp":
                if (direction.y === 0) direction = { x: 0, y: -20 };
                break;
            case "ArrowDown":
                if (direction.y === 0) direction = { x: 0, y: 20 };
                break;
            case "ArrowLeft":
                if (direction.x === 0) direction = { x: -20, y: 0 };
                break;
            case "ArrowRight":
                if (direction.x === 0) direction = { x: 20, y: 0 };
                break;
        }
    });

    mainMenuButton.addEventListener("click", () => {
        // Detener el juego actual
        clearInterval(gameInterval);

        // Restablecer la interfaz
        game.style.display = "none";
        scoreBoard.style.display = "none";
        menu.style.display = "block";

        // Limpiar campos (opcional)
        playerNameInput.value = "";
        difficultySelect.value = "easy";
    });

    restartButton.addEventListener("click", () => {
        clearInterval(gameInterval);
        initializeGame();
    });

    viewScoresButton.addEventListener("click", () => {
        game.style.display = "none";
        scoreBoard.style.display = "block";
        scoreList.innerHTML = scores.map(score => `<li>${score.name}: ${score.score}</li>`).join("");
    });

    backButton.addEventListener("click", () => {
        scoreBoard.style.display = "none";
        game.style.display = "block";
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

