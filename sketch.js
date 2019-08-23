// rockets and amount of rockets to display
let rockets = [];
let rocketCount = 40;
let mutationRate = 5;
let generationCount = 0; // current generation
let goal = {x : 700, y : 400}; // goal position to reach

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    // initialize rockets
    for (let i = 0; i < rocketCount; i++) {
        rockets.push(new Rocket(movement));
        rockets[i].generateMovements();
    }
}

function mouseClicked() {
    // click mouse to change goal position
    goal.x = mouseX;
    goal.y = mouseY;
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
    rockets.splice(round(3 * rockets.length / 4), round(rockets.length / 4)); // worst quarter of generation out of parent pool
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
        while (parent1 === parent2)
            parent2 = getParent();

        // crossover
        let len = round(parent2.movements.length / 5);
        let part1 = parent1.movements.slice(0, 1);
        let part2 = parent2.movements.slice(1, 2);
        let part3 = parent1.movements.slice(2, 3);
        let part4 = parent2.movements.slice(3, 4);
        let part5 = parent1.movements.slice(4, 5);
        let newMovements = [...part1, ...part2, ...part3, ...part4, ...part5];

        // apply mutation
        for (let i = 0; i < newMovements.length; i++) {
            if (random(0, 100) <= mutationRate)
                newMovements[i] = {x : random(-0.3, 0.3), y : random(-0.3, 0.3), cd : random(10, 30)};
        }
        childRockets.push(new Rocket(newMovements));
    }
    rockets = childRockets;
}
