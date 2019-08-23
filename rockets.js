class Rocket {
    constructor(movements) {
        this.position = createVector(40, height / 2);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.friction = createVector(0, 0);
        this.movements = movements;
        this.mutation = 0.15;
        this.fitness = 0;
        this.movementId = 0;
        this.movementCooldown = movements[0].cd;
        this.pauseSimulation = false;
        this.color = color(random(50, 255), random(50, 255), random(50, 255), 100);
    }

    calculateFitness() {
        // distance from start point, to end point, minus distance away from the end point
        this.fitness = -dist(this.position.x, this.position.y, goal.x, goal.y);
    }

    generateMovements() {
        this.movements;
        for (let j = 0; j < 5; j++) {
            movements.push({x : random(-0.3, 0.3), y : random(-0.3, 0.3), cd : random(10, 30)});
        }
    }

    update() {
        // run the movements of the rocket
        if (this.movementCooldown <= 0) {
            this.movementId++;
            if (this.movementId >= this.movements.length) {
                // reached the end of created movements. We need to add a new movement
                this.calculateFitness();
                this.pauseSimulation = true;
                return;
            }
            this.movementCooldown = this.movements[this.movementId].cd;
        }
        this.movementCooldown--;
        this.acceleration.x += this.movements[this.movementId].x;
        this.acceleration.y += this.movements[this.movementId].y;
        // velocity is affected by acceleration
       this.velocity.add(this.acceleration);

       // friction affects the velocity- oh boy some math
       this.friction = this.velocity.copy();
       this.friction.normalize();
       this.friction.mult(-0.1);
       this.velocity.add(this.friction);

       // position is affected by velocity
       this.position.add(this.velocity);
       this.position.x = constrain(this.position.x, 0, width);
       this.position.y = constrain(this.position.y, 0, height);
       if (this.position.y == height)
           this.velocity.y = 0;

       // acceleration isn't continuous, fade over time
       this.acceleration.mult(0.3);
       this.calculateFitness();
    }

    render() {
        fill(this.color);
        noStroke();
        ellipse(this.position.x, this.position.y, 10, 10);
    }
}
