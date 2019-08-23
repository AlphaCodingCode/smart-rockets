// rockets and amount of rockets to display
let rockets = [];
let rocketCount = 40;

// percent rate of mutation on movements
let mutationRate = 5;

// current generation
let generationCount = 0;

// goal position to reach
let goal = {x : 700, y : 400};

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    for (let i = 0; i < rocketCount; i++) {
        // generate 5 random acceleration vectors for each rocket
        let movement = [];
        for (let j = 0; j < 5; j++) {
            movement.push({x : random(-0.15, 0.15), y : random(-0.15, 0.15), cd : random(10, 40)});
        }
        rockets.push(new Rocket(movement));
    }
}

function draw() {
    // Update
    let allDone = true;
    for (let i = 0; i < rockets.length; i++) {
        rockets[i].update();
        if (!rockets[i].pauseSimulation)
            allDone = false;
    }
    // all rockets are done their movements, make a new generation
    if (allDone) {
        generationCount++;
        newGeneration();
    }
    // Render
    background(0);
    noFill();
    stroke(255);
    ellipse(goal.x, goal.y, 50, 50);
    strokeWeight(3);
    stroke(255, 0, 0);

    // draw a line from the goal to the closest rocket to it
    rockets.sort((a, b) => b.fitness - a.fitness);
    line(goal.x, goal.y, rockets[0].position.x, rockets[0].position.y);
    strokeWeight(1);
    stroke(0);
    // render rockets
    for (let i = 0; i < rockets.length; i++) {
        rockets[i].render();
        // if a rocket has reached the goal, then stop animation
        if (dist(rockets[i].position.x, rockets[i].position.y, goal.x, goal.y) < 2) {
            noLoop();
            console.log("achieved perfection");
        }
    }
    // draw generation count
    fill(255);
    textAlign(LEFT);
    textSize(20);
    text("Generation: " + generationCount, 0, 40);
}

function getParent() {
    let fitnessThreshold = random(0, 100);
    let scoreRange = 100;
    for (let i = 0; i < rockets.length; i++) {
        scoreRange -= rockets[i].fitness;
        if (scoreRange <= fitnessThreshold)
            return rockets[i];
    }
}

function newGeneration() {
    let childRockets = [];

    // best rocket enters new generation untouched - make it white
    rockets.sort((a, b) => b.fitness - a.fitness);
    rockets.splice(round(rockets.length / 2), round(rockets.length / 2)); // worst half of generation out of parent pool
    childRockets.push(new Rocket(rockets[0].movements));
    childRockets[0].color = color(255, 255, 255);

    // go through the rockets and recompute fitness to be a number between 1 - 100
    let fitnessSum = 0;
    for (let i = 0; i < rockets.length; i++) {
        rockets[i].fitness = Math.pow(width, 3) + (Math.pow(rockets[i].fitness, 3));
        fitnessSum += rockets[i].fitness;
    }
    for (let i = 0; i < rockets.length; i++)
        rockets[i].fitness = (rockets[i].fitness / fitnessSum) * 100;

    while (childRockets.length < rocketCount) {
        // weighted parent selection
        let parent1 = getParent();
        let parent2 = getParent();

        // crossover
        let newMovements = [...parent1.movements.slice(0, round(parent1.movements.length / 2)),
            ...parent2.movements.slice(round(parent2.movements.length / 2))];

        // apply mutation
        for (let i = 0; i <= newMovements.length; i++) {
            if (random(0, 100) <= mutationRate) {
                newMovements[i] = {x : random(-0.1, 0.1), y : random(-0.1, 0.1), cd : random(20, 60)};
                break;
            }
        }
        childRockets.push(new Rocket(newMovements));
    }
    rockets = childRockets;
}


function mouseClicked() {
    goal.x = mouseX;
    goal.y = mouseY;
}
