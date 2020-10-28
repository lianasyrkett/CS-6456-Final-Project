
float x;
float dx;

float xThreshold;
float xCooldown;
float maxXCooldown;

void setup() {
    size(640, 480);
    rectMode(CENTER, CENTER);
    noStroke();

    x = width / 2;
    xThreshold = width / 4;

    maxXCooldown = 40;
    xCooldown = 0;
}

void draw() {
    background(0, 255, 255);
    rect(x, height / 2, 30, 30);

    rect(width / 2 + xThreshold, height / 2, 2, 2);
    rect(width / 2 - xThreshold, height / 2, 2, 2);

    // console.log(gyro_x);
    if (gyro_x.data.length > 0) {
        // 1 is x? 2 is y and 3 is z?
        x += gyro_x.data[gyro_x.data.length - 1][1] / 2.0;
    }
    // console.log(x);

    if (x >= width) {
        x = width;
    }

    if (x <= 0) {
        x = 0;
    }

    // check if beyond threshold
    if (x >= width / 2 + xThreshold) {
        if (xCooldown <= 0) {
            xCooldown = maxXCooldown;

            // console.log("right tilt");
        }
    }

    if (x <= width / 2 - xThreshold) {
        if (xCooldown <= 0) {
            xCooldown = maxXCooldown;

            // console.log("left tilt");
        }
    }

    xCooldown--;

    // console.log(gyro_x.data[gyro_x.data.length - 1]);
    x = width/2 + (x - width/2) * 0.9;
}
