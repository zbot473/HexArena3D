var renderer, scene, camera, composer, circle, skelet, particle, tile;

window.onload = function () {
    init();
    animate();
}

function init() {
    var mtlLoad = new THREE.MTLLoader()
    mtlLoad.setPath("/textures/")
    var models = ["tile"] /*,"fog","tower","capital","camp","castle","village"*/
    models.forEach(function (e) {
        mtlLoad.load(e + '.mtl', function (materials) {

            materials.preload();
            var objLoad = new THREE.OBJLoader()
            objLoad.setPath("/models/")
            objLoad.setMaterials(materials)
            objLoad.load(e + '.obj', function (object) {

                mesh = object;
                mesh.position.y = -50;
                scene.add(mesh);
            })


        });
    })
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    document.getElementById("game-canvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    scene.add(camera);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    window.addEventListener("resize", onWindowResize, false);

};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.clear();

    renderer.render(scene, camera)
};