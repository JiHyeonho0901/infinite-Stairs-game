let score=0;
const scoreText=document.getElementById("score");
const MIN_X=0;
const MAX_X=600;
const START_X=320;

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
        pos=pos+40;
    } else{
        pos=pos-40;
    }

    directions.push(dir);
    stairX.push(pos);
    drawStair(pos,directions.length*40);
}

for (let i=0; i<20; i++) {
    addStair();
}

function drawStair(left, bottom) {
    const stair = document.createElement("div");
    stair.className= "stair";
    stair.style.left= left+"px";
    stair.style.bottom= bottom+"px";
    world.appendChild(stair);
}



const player= document.createElement("div");
player.className="player";
player.style.left=(START_X+19)+"px";
player.style.bottom="10px";
world.appendChild(player);

let current=0;

function moveCamera() {
    const dx = game.clientWidth / 2- (stairX[current]+30);
    const dy = Math.max(0, current-2)*40;
    world.style.transform="translate("+dx+"px, "+ dy + "px)";
}

function moveUp() {
    if(current>=stairX.length-1){
        return;
    }
    current=current+1;
    player.style.left=(stairX[current]+15)+"px";
    player.style.bottom=(current*40+10)+"px";
    moveCamera();

    while (directions.length - current<20) {
        addStair();
    }
}

let facing="right";
let gameOver= false;

function step(button) {
    if (gameOver || current >= directions.length){
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
    score=score+1;
    scoreText.textContent=score;
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
    gameoverBox.style.display="flex";
}

function tryRestart() {
    if (gameOver && Date.now() - gameOverTime > 700) {
        location.reload();
    }
}

document.addEventListener("pointerdown", function () {
    tryRestart();
});

moveCamera();


