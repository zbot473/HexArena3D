var scene, camera, renderer, controls, hemilight, dirlight

function init() {

    //Init three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapType = THREE.PCFShadowMap;
    document.getElementById("game-canvas").appendChild(renderer.domElement);
    //Lighting
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);
    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-1, 0.75, 1);
    dirLight.position.multiplyScalar(50);
    dirLight.name = "dirlight";
    dirLight.shadowCameraVisible = true;
    dirLight.castShadow = true;
    dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024 * 2;

    dirLight.shadowCameraLeft = -300;
    dirLight.shadowCameraRight = 300;
    dirLight.shadowCameraTop = 300;
    dirLight.shadowCameraBottom = -300;

    dirLight.shadowCameraFar = 3500;
    dirLight.shadowBias = -0.0001;
    dirLight.shadowDarkness = 0.35;
    scene.add(dirLight);

}
window.tileArray = []

function drawHex(sideLength) {
    var startQ = 0
    var mult = 1.1
    for (let r = -(sideLength - 1); r < sideLength; r++) {
        for (let q = startQ; q < startQ + (-Math.abs(r) + 2* sideLength -1 ); q++) {
            tileArray.push({
                mesh: new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 6), new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 1,
                    flatShading: 1
                })),
                coordinates: {
                    axial: {
                        q: q,
                        r: r
                    },
                    cubic: {
                        x: q,
                        y: -q - r,
                        z: r
                    },
                    cartesian: {
                        x: mult*(Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
                        y: mult*(3 / 2 * r)
                    }
                },
                contents: "none",
                color: 0xA3CB38 //(green), 0xFF9FF3 (pink), 0x1DD1A1 (turquoise), 0xFBC531 (yellow), 
            })
            tileArray[tileArray.length - 1].mesh.position.z = tileArray[tileArray.length - 1].coordinates.cartesian.x
            tileArray[tileArray.length - 1].mesh.position.x = tileArray[tileArray.length - 1].coordinates.cartesian.y
            tileArray[tileArray.length - 1].mesh.rotation.y = 0.5
            scene.add(tileArray[tileArray.length - 1].mesh)
        }
        if (startQ > -sideLength + 1) {
            startQ = startQ - 1;

        }
    }
    return
}

function doOnce() {

    drawHex(13)
}
var animate = () => {
requestAnimationFrame(animate);
    tileArray.forEach(function(e) {
    });

    renderer.render(scene, camera);
};

window.addEventListener("load", function () {
    init()
    doOnce()
    animate()
})