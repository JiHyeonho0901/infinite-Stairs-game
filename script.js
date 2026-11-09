let score=0;
const scoreText=document.getElementById("score");
const MIN_X=0;
const MAX_X=610;
const START_X=305;
const STAIR_W=61;
const STAIR_H=30;
const PLAYER_W=56;

const game=document.getElementById("game");
const world=document.getElementById("world");

const directions = [];
const stairX = [START_X];
let pos=START_X;
let dir="right";

drawStair(START_X, 0);

function addStair() {
    if (Math.random()< 0.3) {
        if (dir === "right"){
            dir="left";
        } else{
            dir = "right";
        }
    }
    if (dir === "right" && pos>=MAX_X){
        dir = "left";
    }
    if (dir === "left" && pos<=MIN_X){
        dir="right";
    }

    if (dir === "right") {
        pos=pos+STAIR_W;
    } else{
        pos=pos-STAIR_W;
    }

    directions.push(dir);
    stairX.push(pos);
    drawStair(pos,directions.length*STAIR_H);
}

for (let i=0; i<20; i++) {
    addStair();
}

function drawStair(left, bottom) {
    const stair = document.createElement("div");
    stair.className= "stair";
    stair.style.width=STAIR_W+"px";
    stair.style.height=STAIR_H+"px";
    stair.style.left= left+"px";
    stair.style.bottom= bottom+"px";
    world.appendChild(stair);
}



const player= document.createElement("img");
player.className="player";
player.style.left=(START_X+(STAIR_W-PLAYER_W)/2)+"px";
player.style.bottom=STAIR_H+"px";
world.appendChild(player);

let current=0;

function moveCamera() {
    const dx = game.clientWidth / 2- (stairX[current]+STAIR_W/2);
    const dy = Math.max(0, current-2)*STAIR_H;
    world.style.transform="translate("+dx+"px, "+ dy + "px)";
}

function moveUp() {
    if(current>=stairX.length-1){
        return;
    }
    current=current+1;
    playSound(climbSound);
    player.style.left=(stairX[current]+(STAIR_W-PLAYER_W)/2)+"px";
    player.style.bottom=((current+1)*STAIR_H)+"px";
    moveCamera();

    while (directions.length - current<20) {
        addStair();
    }
}

let facing="right";
let gameOver= false;

function step(button) {
    if (selected === false || gameOver || current >= directions.length){
        return;
    }

    const nextDir = directions[current];
    let correct;
    if (nextDir === facing){
        correct = "climb";
    }
    else{
        correct="turn";
    }

    if (button !== correct){
        endGame("게임오버");
        return;
    }

    if (started === false) {
        started = true;
        guide.style.display="none";
        startTimer();
    }
    gauge = Math.min(100, gauge+5);
    gaugeBar.style.width=gauge+"%";

    facing = nextDir;
    updateFacing();
    score=score+1;
    scoreText.textContent=score;

    if(score>best) {
        best = score;
        bestText.textContent = best;
        saveBest(best);
    }
    moveUp();
}

document.addEventListener("keydown", function (event) {
    if (event.repeat) {
        return;
        }
    
    if (event.code==="KeyL"){
        step("climb");
    }

    if (event.code === "Space") {
        event.preventDefault();
        step("turn");
    }

    if (event.code === "KeyK") {
        tryRestart();
    }
});

let gauge=200;
let started= false;
const gaugeBar= document.getElementById("gauge-bar");
const TICK = 50;

function getDrain() {
    if (score<=50) {
        return 2;
    } else if (score<=100) {
        return 2.2;
    } else if (score<=200) {
        return 2.7;
    } else if (score<=350) {
        return 3;
    } else if (score<=600) {
        return 3.5;
    } else if (score<=1000) {
        return 4;
    } else {
        return 4.5;
    }
}

function startTimer() {
    const timerId = setInterval(function(){
        if(gameOver) {
            clearInterval(timerId);
            return;
        }

        gauge=gauge-getDrain()*TICK/100;
        if (gauge<0) {
            gauge =0;
        }
        gaugeBar.style.width= gauge+ "%";

        if (gauge===0) {
            endGame("시간 초과");
        }
    }, TICK);
}

const guide = document.getElementById("guide");

game.addEventListener("pointerdown", function (event) {
    const rect=game.getBoundingClientRect();
    const x=event.clientX - rect.left;
    
    if(x<rect.width/2) {
        step("turn");
    } else {
        step("climb");
    }
});

let gameOverTime=0;
const gameoverBox=document.getElementById("gameover");
const gameoverTitle=document.getElementById("gameover-title");
const gameoverScore=document.getElementById("gameover-score");

function endGame(message) {
    gameOver = true;
    gameOverTime=Date.now();
    gameoverTitle.textContent=message;
    gameoverScore.textContent="점수: "+score;
    
    if (score>startBest) {
        gameoverBest.textContent = "새 기록 갱신!";
    } else {
        gameoverBest.textContent="최고 기록: "+best;
    }
    gameoverBox.style.display="flex";
    playSound(gameoverSound);
}

function tryRestart() {
    if (gameOver && Date.now() - gameOverTime > 700) {
        location.reload();
    }
}

document.addEventListener("pointerdown", function () {
    tryRestart();
});

const climbSound = new Audio("climb.mp3");
const gameoverSound = new Audio("gameover.mp3");

function playSound(sound) {
    sound.currentTime=0;
    sound.play();
}

document.addEventListener("gesturestart", function(event) {
    event.preventDefault();
});

const bestText = document.getElementById("best");
const gameoverBest = document.getElementById("gameover-best");

function loadBest() {
    try {
        return Number(localStorage.getItem("bestScore")) || 0;
    } catch (error) {
        return 0;
    }
}

function saveBest(value) {
    try{
        localStorage.setItem("bestScore", value);
    } catch (error) {

    }
}

let best = loadBest();
const startBest = best;
bestText.textContent = best;

const CHARACTERS = [
    { name: "오우야", image: "char1.png" },
    { name: "해병 1280기", image: "char2.png" },
    { name: "05대장", image: "char3.png" },
    { name: "정원준", image: "char4.png" },
    { name: "제제희야", image: "char5.png" },
    { name: "한남", image: "char6.png" },
    { name: "츠키준호", image: "char7.png" }
];

let selected = false;
const selectBox = document.getElementById("select");
const selectList = document.getElementById("select-list");

function chooseChracter(character) {
    player.src = character.image;
    selected = true;
    selectBox.style.display = "none";
}

function updateFacing() {
    if (facing === "left") {
        player.style.transform = "scaleX(-1)";
    } else {
        player.style.transform = "scale(1)";
    }
}

for(let i=0; i<CHARACTERS.length; i++) {
    const character = CHARACTERS[i];

    const card = document.createElement("div");
    card.className = "select-card";

    const img = document.createElement("img");
    img.src = character.image;

    const label = document.createElement("p");
    label.textContent = character.name;

    card.appendChild(img);
    card.appendChild(label);

    card.addEventListener("click", function() {
        chooseChracter(character);
    });

    selectList.appendChild(card);
}

moveCamera();


