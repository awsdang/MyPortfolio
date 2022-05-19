const controls = viewer.context.ifcCamera.cameraControls;


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
controls.setPosition(0, 0, 2, true);
controls.setTarget(0, 0, 1, true);



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
    viewer.context.ifcCamera.cameraControls.rotate(0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true)
});
rightKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.rotate(-0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true)
});
upKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.rotate(0, 0.03 * THREE.MathUtils.DEG2RAD * event.deltaTime, true)
});
downKey.addEventListener('holding', function(event) {
    viewer.context.ifcCamera.cameraControls.rotate(0, -0.03 * THREE.MathUtils.DEG2RAD * event.deltaTime, true)
});

this.renderer.render(scene, PerspectiveCamera);

function anim() {

    const delta1 = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    const updated = viewer.context.ifcCamera.cameraControls.update(delta1);

    // if ( elapsed > 30 ) { return; }

    requestAnimationFrame(anim);

    if (updated) {


        controls.setPosition(0, 0, 0, true);
        controls.setTarget(1, 1, 1, true);
        this.renderer.render(scene, PerspectiveCamera);
        console.log('rendered');

    }

};