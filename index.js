const canvas = document.getElementById("render-canvas");
const engine = new BABYLON.Engine(canvas, true);

const planet = {
    name: "Casiopia",
    diameter: 2,
    moons: [
        {name:"Yela", diameter: 0.5, orbit_distance: 1.5, rps:1/4, offset:{x:1, y:1, z:1}},
        {name:"Virgo", diameter: 0.5, orbit_distance: 2.0, rps:-1/10, offset:{x:-1, y:0, z:1}},
        {name:"Tela", diameter: 0.5, orbit_distance: 2.5, rps:1/6, offset:{x:-1, y:1, z:-1}}
    ]
};

var debug_mesh = [];
var show_debug = true;

var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);

    // Add a camera to the scene and attach it to the canvas
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0,0,0), scene);
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

    return scene;
};

function loadPlanet(scene, planet) {
    var renderQueue = [];

    mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: planet.diameter}, scene);
    mesh.actionManager = new BABYLON.ActionManager(scene);
    
    mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {console.log("HIT!")},
        )
    );

    renderQueue.push((delta) => {
        //Planet code
    })

    addDebugLines(scene);

    planet.moons.forEach(moon => {
        addMoon(scene, moon, renderQueue);
    });

    return renderQueue;
}

function addMoon(scene, moon, renderQueue) {
    console.log(moon)

    const unit_dir = new BABYLON.Vector3(moon.offset.x, moon.offset.y, moon.offset.z).normalize();
    const axis = unit_dir.scale(moon.orbit_distance);

    var mesh = BABYLON.MeshBuilder.CreateSphere(moon.name, {diameter:moon.diameter}, scene);
    mesh.setPivotMatrix(BABYLON.Matrix.Translation(axis.x, axis.y, axis.z), false);
    var rot = unit_dir.cross(new BABYLON.Vector3(0, 1, 0));

    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {console.log("HIT!")},
        )
    );

    var angle = Math.asin(unit_dir.y);
    var path = BABYLON.MeshBuilder.CreateTorus(`${moon.name}_path`, {thickness: 0.02, diameter: moon.orbit_distance*2, tessellation: 64}, scene)
    path.rotate(rot, angle)

    debug_mesh.push(path);

    renderQueue.push((delta) => {
        mesh.rotate(unit_dir.cross(rot), ((2 * Math.PI) * moon.rps) * delta, BABYLON.Space.LOCAL)
    })
}

function addDebugLines(scene) {
    var yaxis = BABYLON.MeshBuilder.CreateLines("lines", {
        points: [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 3, 0)
        ],
        colors: [
            new BABYLON.Color4(0.1, 0.1, 0.1),
            new BABYLON.Color4(0, 1, 0),
        ]
    }, scene);

    var xaxis = BABYLON.MeshBuilder.CreateLines("lines", {
        points: [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(3, 0, 0)
        ],
        colors: [
            new BABYLON.Color4(0.1, 0.1, 0.1),
            new BABYLON.Color4(1, 0, 0),
        ]
    }, scene);

    var zaxis = BABYLON.MeshBuilder.CreateLines("lines", {
        points: [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, 0, 3)
        ],
        colors: [
            new BABYLON.Color4(0.1, 0.1, 0.1),
            new BABYLON.Color4(0, 0, 1),
        ]
    }, scene);

    debug_mesh.push(yaxis);
    debug_mesh.push(xaxis);
    debug_mesh.push(zaxis);
}

function toggleDebug() {
    show_debug = !show_debug;
    debug_mesh.forEach((mesh) =>{
        mesh.setEnabled(show_debug);
    })
}

var scene = createScene();
var renderQueue = loadPlanet(scene, planet);

var step = 0;
engine.runRenderLoop(() => {
    scene.render();

    renderQueue.forEach((cb) => {
        cb(engine.getDeltaTime() / 1000);

    })

    step += 1;
});

window.addEventListener("resize", () => {
    engine.resize();
})


