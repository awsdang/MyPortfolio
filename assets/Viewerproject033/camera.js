const controls = viewer.context.ifcCamera.cameraControls;

//creates FPS Effect
const EPS = 1e-5;
controls.setPosition(0, 0, EPS);
controls.minDistance = controls.maxDistance = 1;
controls.saveState();


//camera starting position
controls.zoomTo(0.3, true)
controls.moveTo(xAxis, yAxis, zAxis, true)
controls.rotateTo(azAngle, poAngle, false)
    //ADD Keyboard fucntionality
const KEYCODE = {
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    Q: 81,
    E: 69,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
};

const wKey = new holdEvent.KeyboardKeyHold(KEYCODE.W, 16.666);
const aKey = new holdEvent.KeyboardKeyHold(KEYCODE.A, 16.666);
const sKey = new holdEvent.KeyboardKeyHold(KEYCODE.S, 16.666);
const dKey = new holdEvent.KeyboardKeyHold(KEYCODE.D, 16.666);
const qKey = new holdEvent.KeyboardKeyHold(KEYCODE.Q, 16.666);
const eKey = new holdEvent.KeyboardKeyHold(KEYCODE.E, 16.666);

aKey.addEventListener('holding', function(event) {
    controls.truck(-0.007 * event.deltaTime, 0, true)
});
dKey.addEventListener('holding', function(event) {
    controls.truck(0.007 * event.deltaTime, 0, true)
});
wKey.addEventListener('holding', function(event) {
    controls.forward(0.007 * event.deltaTime, true)
});
sKey.addEventListener('holding', function(event) {
    controls.forward(-0.007 * event.deltaTime, true)
});
qKey.addEventListener('holding', function(event) {
    controls.truck(0, -0.007 * event.deltaTime, true)
});
eKey.addEventListener('holding', function(event) {
    controls.truck(0, 0.007 * event.deltaTime, true)
});

const leftKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_LEFT, 100);
const rightKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 100);
const upKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_UP, 100);
const downKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_DOWN, 100);

leftKey.addEventListener('holding', function(event) {
    controls.rotate(0.08 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true)
});
rightKey.addEventListener('holding', function(event) {
    controls.rotate(-0.08 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true)
});
upKey.addEventListener('holding', function(event) {
    controls.rotate(0, 0.03 * THREE.MathUtils.DEG2RAD * event.deltaTime, true)
});
downKey.addEventListener('holding', function(event) {
    controls.rotate(0, -0.03 * THREE.MathUtils.DEG2RAD * event.deltaTime, true)
});

JoyXYstickData = null;

//JoystickScript get value and change camera position
var joy1X = document.getElementById("joy1X");
var joy1Y = document.getElementById("joy1Y");


var Joy1 = new JoyStick('joy1Div', {}, function(stickData) {
    JoyXYstickData = stickData;
});


function BeginMovement() {
    if (JoyXYstickData == null)
        return
    if (JoyXYstickData.x == 0 && JoyXYstickData.y == 0)
        return
    controls.truck(0.0005 * JoyXYstickData.x, 0, true);
    controls.forward(0.0005 * JoyXYstickData.y, 0, true);
}

// //make it active for mobile only

if (window.navigator.userAgent.match(/Android/i) ||
    window.navigator.userAgent.match(/iPhone/i) ||
    window.navigator.userAgent.match(/iPad/i) ||
    window.navigator.maxTouchPoints >= 1) {
    setInterval(BeginMovement, 5)
    document.getElementsByClassName('columnLateral')[0].style.display = 'block';
} else {
    document.getElementsByClassName('columnLateral')[0].style.display = 'none';
}

Slid1YstickData = null;

//Slider for up and down
var Slid1Y = document.getElementById("Slid1Y");
var Slid1 = new Slider1('Slid1Div', {}, function(SliderStatus) {
    Slid1YstickData = SliderStatus;
});


function BeginRising() {
    if (Slid1YstickData == null)
        return
    if (Slid1YstickData.y == 0)
        return
    controls.truck(0, -0.0002 * Slid1YstickData.y, true);

}

//make it active for mobile only
if (window.navigator.userAgent.match(/Android/i) ||
    window.navigator.userAgent.match(/iPhone/i) ||
    window.navigator.userAgent.match(/iPad/i) ||
    window.navigator.maxTouchPoints >= 1) {
    document.getElementsByClassName('columnLateral2')[0].style.display = 'block';
    setInterval(BeginRising, 5)
} else {
    document.getElementsByClassName('columnLateral2')[0].style.display = 'none';
}


//Slider for up and down
var Slid2Y = document.getElementById("Slid2Y");
var Slid2 = new Slider2('Slid2Div', {}, function(SliderStatus2) {
    Slid2Y.value = SliderStatus2.y;

    if (Slid2Y.value > 0) {
        controls.zoomTo(0.3 + (Slid2Y.value * 0.004), true)

    } else if (Slid2Y.value < 0) {
        controls.zoomTo(0.3 + (Slid2Y.value * 0.001), true)

    } else {}
});

//make it active for mobile only

if (window.navigator.userAgent.match(/Android/i) ||
    window.navigator.userAgent.match(/iPhone/i) ||
    window.navigator.userAgent.match(/iPad/i) ||
    window.navigator.maxTouchPoints >= 1) {
    document.getElementsByClassName('columnLateral3')[0].style.display = 'block';
} else {
    document.getElementsByClassName('columnLateral3')[0].style.display = 'none';
}



//Disable FOV for mobile
if (window.navigator.userAgent.match(/Android/i) ||
    window.navigator.userAgent.match(/iPhone/i) ||
    window.navigator.userAgent.match(/iPad/i)) {
    controls.touches.two = CameraControls.ACTION.NONE
    controls.dollySpeed = 0.000005
} else {
    controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
    controls.touches.two = CameraControls.ACTION.NONE
}