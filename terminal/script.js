document.addEventListener("DOMContentLoaded", function () {
    const terminal = document.getElementById("terminal");
    const bootScreen = document.getElementById("boot-screen");
    const loadingBarContainer = document.getElementById("loading-bar-container");
    const loadingBar = document.getElementById("loading-bar");
    const output = document.getElementById("output");
    const inputLine = document.getElementById("input-line");
    const input = document.getElementById("command-input");
    const powerButton = document.getElementById("power-button");

    terminal.classList.add("terminal-off");

    // 🎵 Load sounds
    const sounds = {
        ambient: new Audio("sounds/ComputerAmbient.mp3"),
        keypress: new Audio("sounds/KeyboardPressed.mp3"),
        boot: new Audio("sounds/ComputerBoot.mp3"),
        beep: new Audio("sounds/ComputerBeep.mp3"),
    };

    sounds.ambient.loop = true;
    sounds.ambient.volume = 0;

    let audioStarted = false;
    let terminalOn = false;
    let bootTimeout = null;
    let ambientTimeout = null;
    let fadeInterval = null; // 🔥 Fix: Prevent multiple fade processes

    const bootMessages = [
        "Initializing System...",
        "Loading BIOS...",
        "Checking hardware...",
        "Booting OS...",
        "Starting terminal...",
        "System ready!"
    ];

    function startAudio() {
        if (!audioStarted) {
            audioStarted = true;

            if (bootTimeout) clearTimeout(bootTimeout);
            if (ambientTimeout) clearTimeout(ambientTimeout);
            if (fadeInterval) clearInterval(fadeInterval); // 🔥 Fix: Prevent multiple fades

            showBootAnimation();
            sounds.boot.currentTime = 0;
            sounds.boot.volume = 1;
            sounds.boot.play();

            // ⏳ Start ambient sound **1 second before boot ends**
            ambientTimeout = setTimeout(() => {
                if (terminalOn) {
                    sounds.ambient.currentTime = 0;
                    sounds.ambient.volume = 0; // Start ambient at 0 volume
                    sounds.ambient.play();
                    crossfadeAudio(sounds.boot, sounds.ambient, 3000); // 🔥 Smooth fade
                }
            }, sounds.boot.duration * 1000 - 4000);

            bootTimeout = setTimeout(() => {
                if (terminalOn) {
                    hideBootAnimation();
                }
            }, sounds.boot.duration * 1000);
        }
    }

    function showBootAnimation() {
        bootScreen.innerHTML = "";
        bootScreen.style.display = "block";
        loadingBarContainer.style.display = "block";
        output.style.display = "none";
        inputLine.style.display = "none";
        loadingBar.style.width = "0";

        let index = 0;

        function showNextLine() {
            if (index < bootMessages.length) {
                bootScreen.innerHTML += `<div>${bootMessages[index]}</div>`;
                loadingBar.style.width = `${(index / bootMessages.length) * 100}%`;
                index++;
                setTimeout(showNextLine, 800);
            }
        }

        showNextLine();
    }

    function hideBootAnimation() {
        bootScreen.style.display = "none";
        output.style.display = "block";
        inputLine.style.display = "flex";
        loadingBarContainer.style.display = "none";
        input.focus();
    }

    function crossfadeAudio(outgoing, incoming, duration) {
        if (fadeInterval) clearInterval(fadeInterval); // 🔥 Fix: Clear previous fade process

        let step = 0.01;
        let intervalTime = duration / (1 / step);

        fadeInterval = setInterval(() => {
            if (outgoing.volume > 0) {
                outgoing.volume = Math.max(0, outgoing.volume - step);
            }
            if (incoming.volume < 1) {
                incoming.volume = Math.min(0.2, incoming.volume + step);
            }

            if (outgoing.volume === 0 && incoming.volume === 1) {
                clearInterval(fadeInterval);
                fadeInterval = null; // 🔥 Ensure no lingering fade process
            }
        }, intervalTime);
    }

    powerButton.addEventListener("click", function () {
        if (!terminalOn) {
            // Turning ON
            terminal.classList.remove("terminal-off");
            terminal.classList.add("terminal-on");
            powerButton.textContent = "ON";
            powerButton.classList.add("on");
            startAudio();
        } else {
            // Turning OFF
            terminal.classList.remove("terminal-on");
            terminal.classList.add("terminal-off");
            powerButton.textContent = "OFF";
            powerButton.classList.remove("on");

            stopAllSounds();
            resetTerminal(); // 🔥 Reset terminal state

            audioStarted = false;
            bootScreen.style.display = "none";
            loadingBarContainer.style.display = "none";
        }
        terminalOn = !terminalOn;
    });

// 🔥 New Function: Fully Reset Terminal State
    function resetTerminal() {
        output.innerHTML = ""; // Clear all previous commands
        commandHistory = []; // Reset command history
        historyIndex = -1; // Reset history index
        currentDirectory = fileSystem.home; // Reset to home directory
        currentPath = "~"; // Reset prompt to home
        updatePrompt(); // Update the prompt UI
    }


    function stopAllSounds() {
        if (bootTimeout) clearTimeout(bootTimeout);
        if (ambientTimeout) clearTimeout(ambientTimeout);
        if (fadeInterval) clearInterval(fadeInterval); // 🔥 Fix: Stop fade process

        sounds.boot.pause();
        sounds.boot.currentTime = 0;
        sounds.boot.volume = 1; // 🔥 Fix: Reset volume for next boot

        sounds.ambient.pause();
        sounds.ambient.currentTime = 0;
        sounds.ambient.volume = 0; // 🔥 Fix: Reset volume for next boot

        sounds.keypress.pause();
        sounds.keypress.currentTime = 0;
        sounds.beep.pause();
        sounds.beep.currentTime = 0;
    }

    let commandHistory = [];
    let historyIndex = -1;

    const fileSystem = {
        home: {
            "about_me.txt":
                "<----------------------------------------->\n\n" +
                "20 years old Back-end developer.\n\n " +
                "Skills: Java, Rust, Js, Ts, Anchor, Redis, SQL\n" +
                "\n<----------------------------------------->\n\n " +
                "For the last year working on project in solana blockchain.\n" +
                "Gained new skills in last year:\n" +
                "  1) Writing solana smart contracts\n" +
                "  2) Creating cpi`s\n" +
                "  3) Working with rpc methods\n" +
                "  4) Solana CLI\n" +
                "  5) Working with redis\n" +
                "  6) Jupiter API\n" +
                "\n<----------------------------------------->\n\n" +
                "Working experience:\n" +
                "  (2024) Solana blockchain developer - Clandai\n" +
                "  (2022) Team Leader of repair engineers - SKLO\n" +
                "  (2021) Repair engineer (iphone) - SKLO\n" +
                "\n<----------------------------------------->\n\n" +
                "Education:\n" +
                "  (2022-2025) Technological University of the Shannon - Ireland\n" +
                "  (2019-2023) Kyiv College of Communication - Ukraine/remote\n" +
                "\n<----------------------------------------->\n\n",
            "contact.txt": "Email: hontarvladie@gmail.com",
            "UFO.exe": "",
            projects: {
                "EQUI.txt": "(private repo)\n\nEQUI is a solana blockchain based project which works on providing equal prices in the pool for token pairs across the DEXes as much as its possible, also earning a bit while equaling out the prices.\n\n" +
                    "this project is still in progress and is on final stage",
                "kevin_xyz.txt": "(public repo)\n\nKevin is an ESP32 based project written in MicroPython which is a device that can be hold in hand to ask AI any questions and entertain user with game as well as provide useful information.\n\n" +
                    " Kevin is a working name for the university's last year project.\nthis project is still in progress and will be finished by the april 1",
                "SEEFOOD.txt": "(public repo)\n\nSEEFOOD is an Android app inspired by the Silicon Valley TV series. It replicates the 'hotdog or not hotdog' functionality, has completely same UI and enhances it with additional features.\n\n" +
                    "this project is finished but still have things to perfect",
                "Library_ERP.txt": "(public repo)\n\nLibrary ERP is a Java-based library management system that handles users and books. It was developed to showcase my Java skills."
            },
        },
    };

    let currentDirectory = fileSystem.home;
    let currentPath = "~"; // Represents the home directory

    const commands = {
        help: "Available commands: help, ls, cd, cat, clear",

        ls: function () {
            return Object.keys(currentDirectory).join("\n");
        },
        cd: function (dir) {
            if (dir === "..") {
                if (currentPath !== "~") {
                    currentDirectory = fileSystem.home;
                    currentPath = "~";
                }
                return "Moved to home directory.";
            } else if (currentDirectory[dir] && typeof currentDirectory[dir] === "object") {
                currentDirectory = currentDirectory[dir];
                currentPath = `~/${dir}`;
                return `Moved into ${currentPath}`;
            }
            return `Directory not found: ${dir}`;
        },
        cat: function (file) {
            if (currentDirectory[file]) {
                return currentDirectory[file].replace(/\n/g, "<br>");
            }
            return `File not found: ${file}`;
        },
        clear: function () {
            output.innerHTML = "";
            return "";
        },
        "./": function (filename) {
            if (filename === "UFO.exe") {
                startUFOShooter(output, inputLine, input, terminal); // Pass the required variables
                return "Starting UFO Shooter game...";
            } else {
                return `File not found or not executable: ${filename}`;
            }
        },
    };

    input.addEventListener("keydown", function (event) {
        if (!terminalOn) return;

        sounds.keypress.currentTime = 0;
        sounds.keypress.play();

        if (event.key === "Enter") {
            event.preventDefault();
            let command = input.value.trim();
            if (command) {
                sounds.beep.play();
                processCommand(command);
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = "";
            }
        }
    });


    function processCommand(inputText) {
        if (!inputText.trim()) return; // Ignore empty commands

        // Save command in history
        commandHistory.push(inputText);
        historyIndex = commandHistory.length; // Reset index after a new command

        let args = inputText.split(" ");
        let command = args[0];
        let arg = args[1];

        // Display command with current directory
        output.innerHTML += `<div><span class="prompt">${currentPath} $</span> ${inputText}</div>`;

        if (command.startsWith("./")) {
            let filename = command.slice(2); // Remove "./" from the command
            output.innerHTML += `<div>${commands["./"](filename)}</div>`;
        } else if (commands[command]) {
            let response =
                typeof commands[command] === "function" ? commands[command](arg) : commands[command];

            if (response) {
                output.innerHTML += `<div>${response}</div>`;
            }

            // Update the prompt dynamically after `cd` command
            updatePrompt();
        } else {
            output.innerHTML += `<div>Command not found: ${command}</div>`;
        }

        terminal.scrollTop = terminal.scrollHeight; // Auto-scroll to the bottom
        input.value = ""; // Clear input field
    }

// 🔥 New Function: Update Prompt Based on Current Path
    function updatePrompt() {
        inputLine.querySelector(".prompt").textContent = `${currentPath} $`;
    }

});


function startUFOShooter(output, inputLine, input, terminal) {
    console.log("Starting UFO Shooter game..."); // Debugging line

    // Hide terminal UI
    output.style.display = "none";
    inputLine.style.display = "none";

    // Disable terminal input
    input.disabled = true;

    // Create game container
    let gameArea = document.createElement("div");
    gameArea.id = "gameArea";
    gameArea.style.position = "absolute";
    gameArea.style.top = "0";
    gameArea.style.left = "0";
    gameArea.style.width = "100%";
    gameArea.style.height = "100%";
    gameArea.style.backgroundColor = "black";
    gameArea.style.display = "flex";
    gameArea.style.flexDirection = "column";
    gameArea.style.alignItems = "center";
    gameArea.style.justifyContent = "center";
    terminal.appendChild(gameArea);

    console.log("Game area created and appended:", gameArea); // Debugging line

    // Create score display
    let scoreDisplay = document.createElement("div");
    scoreDisplay.style.position = "absolute";
    scoreDisplay.style.top = "10px";
    scoreDisplay.style.left = "50%";
    scoreDisplay.style.transform = "translateX(-50%)";
    scoreDisplay.style.fontSize = "20px";
    scoreDisplay.style.color = "white";
    scoreDisplay.textContent = "Score: 0";
    gameArea.appendChild(scoreDisplay);

    // Create bullet indicator
    let bulletDisplay = document.createElement("div");
    bulletDisplay.style.position = "absolute";
    bulletDisplay.style.top = "40px"; // Position below the score
    bulletDisplay.style.left = "50%";
    bulletDisplay.style.transform = "translateX(-50%)";
    bulletDisplay.style.fontSize = "20px";
    bulletDisplay.style.color = "white";
    bulletDisplay.textContent = "Bullets: 10"; // Initial bullets
    gameArea.appendChild(bulletDisplay);

    // Create player
    let player = document.createElement("div");
    player.textContent = "🔫";
    player.style.position = "absolute";
    player.style.bottom = "10px";
    player.style.left = "50%";
    player.style.transform = "translateX(-50%)";
    player.style.fontSize = "30px";
    gameArea.appendChild(player);

    let ufos = [];
    let score = 0;
    let bulletsLeft = 10; // Initial number of bullets
    let gameRunning = true;

    function spawnUFO() {
        let ufo = document.createElement("div");
        ufo.textContent = "🛸";
        ufo.style.position = "absolute";
        ufo.style.top = `${player.offsetTop - 400}px`; // 400px above the gun
        ufo.style.left = `${Math.random() * (gameArea.clientWidth - 50)}px`; // Random X-axis position
        ufo.style.fontSize = "40px";
        gameArea.appendChild(ufo);
        ufos.push(ufo);

        let direction = Math.random() < 0.5 ? -1 : 1; // Random initial direction (-1 for left, 1 for right)
        let speed = Math.random() * 4 + 1; // Random speed (1 to 3 pixels per frame)

        let moveInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(moveInterval);
                return;
            }

            let newLeft = parseInt(ufo.style.left) + direction * speed;

            // Reverse direction if the UFO hits the edge of the game area
            if (newLeft < 0 || newLeft > gameArea.clientWidth - 50) {
                direction *= -1; // Reverse direction
                newLeft = parseInt(ufo.style.left) + direction * speed; // Move in the new direction
            }

            ufo.style.left = `${newLeft}px`;
        }, 50);

        ufo.dataset.moveInterval = moveInterval;
    }

    function shootBullet() {
        if (bulletsLeft <= 0) return; // Prevent shooting when out of bullets

        bulletsLeft--;
        bulletDisplay.textContent = `Bullets: ${bulletsLeft}`;

        let bullet = document.createElement("div");
        bullet.classList.add("bullet"); // ✅ Add class for easier tracking
        bullet.textContent = "🔴";
        bullet.style.position = "absolute";
        bullet.style.bottom = "40px";
        bullet.style.left = player.style.left;
        bullet.style.transform = "translateX(-50%)";
        bullet.style.fontSize = "15px";
        gameArea.appendChild(bullet);

        let bulletInterval = setInterval(() => {
            if (!gameRunning) {
                clearInterval(bulletInterval);
                return;
            }

            let bulletY = parseInt(bullet.style.bottom);
            if (bulletY > gameArea.clientHeight) {
                clearInterval(bulletInterval);
                gameArea.removeChild(bullet);
            } else {
                bullet.style.bottom = `${bulletY + 10}px`;

                ufos.forEach((ufo, index) => {
                    let bulletRect = bullet.getBoundingClientRect();
                    let ufoRect = ufo.getBoundingClientRect();

                    if (
                        bulletRect.top <= ufoRect.bottom &&
                        bulletRect.bottom >= ufoRect.top &&
                        bulletRect.left >= ufoRect.left &&
                        bulletRect.right <= ufoRect.right
                    ) {
                        clearInterval(bulletInterval);
                        gameArea.removeChild(bullet);
                        gameArea.removeChild(ufo);
                        bulletsLeft += 2; // ✅ Reward bullets after hitting a UFO
                        bulletDisplay.textContent = `Bullets: ${bulletsLeft}`;
                        clearInterval(ufo.dataset.moveInterval);
                        ufos.splice(index, 1);
                        score++;
                        scoreDisplay.textContent = `Score: ${score}`;

                        if (ufos.length < 8) {
                            spawnUFO();
                            spawnUFO();
                        }
                    }
                });
            }

            if (gameArea.querySelectorAll(".bullet").length === 0 && bulletsLeft <= 0) {
                console.log("Out of bullets!");
                quitGame();
            }

        }, 30);
    }


    function quitGame() {
        gameRunning = false;
        gameArea.remove(); // Remove game UI
        output.style.display = "block"; // Restore terminal output
        inputLine.style.display = "flex"; // Restore prompt
        input.disabled = false; // Re-enable terminal input
        output.innerHTML = `<div>🛸 Game Over! Your Score: ${score}</div>`;
        terminal.scrollTop = terminal.scrollHeight;
    }

    function handleKeyPress(event) {
        if (!gameRunning) return;

        console.log("Key pressed:", event.key); // Debugging line

        let playerX = parseInt(player.style.left);
        if (event.key === "ArrowLeft" && playerX > 0) {
            player.style.left = `${playerX - 20}px`;
        } else if (event.key === "ArrowRight" && playerX < gameArea.clientWidth - 50) {
            player.style.left = `${playerX + 20}px`;
        } else if (event.key === " ") {
            shootBullet();
        } else if (event.key.toLowerCase() === "q") {
            document.removeEventListener("keydown", handleKeyPress);
            quitGame();
        }
    }

    document.addEventListener("keydown", handleKeyPress);

    spawnUFO();
    spawnUFO();
}