const controls = viewer.context.ifcCamera.cameraControls;

//creates FPS Effect
const EPS = 1e-5;
controls.setPosition(0, 0, EPS);
controls.minDistance = controls.maxDistance = 1;
controls.saveState();


//camera starting position
controls.zoomTo(0.3, true)
controls.moveTo(xAxis, yAxis, zAxis, true)
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
    viewer.context.ifcCamera.cameraControls.truck(-0.007 * event.deltaTime, 0, true)
});
dKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.truck(0.007 * event.deltaTime, 0, true)
});
wKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.forward(0.007 * event.deltaTime, true)
});
sKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.forward(-0.007 * event.deltaTime, true)
});
qKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.truck(0, -0.007 * event.deltaTime, true)
});
eKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.truck(0, 0.007 * event.deltaTime, true)
});

const leftKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_LEFT, 100);
const rightKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 100);
const upKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_UP, 100);
const downKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_DOWN, 100);

leftKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.rotate(0.08 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true)
});
rightKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.rotate(-0.08 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true)
});
upKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.rotate(0, 0.03 * THREE.MathUtils.DEG2RAD * event.deltaTime, true)
});
downKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.rotate(0, -0.03 * THREE.MathUtils.DEG2RAD * event.deltaTime, true)
});


//Disable FOV for mobile

if (window.navigator.userAgent.match(/Android/i) ||
    window.navigator.userAgent.match(/iPhone/i) ||
    window.navigator.userAgent.match(/iPad/i)) {
    controls.dollySpeed = 0.000005
} else {
    controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
    controls.touches.two = CameraControls.ACTION.TOUCH_ZOOM_TRUCK;
}