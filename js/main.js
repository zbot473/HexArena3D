var scene, camera, renderer, controls, hemilight, dirlight, models = [], OBJArray = []

async function init() {
    //Init three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = 80 * Math.PI / 180;
    camera.position.set(1, 20, -1.21);
    controls.update();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.soft = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    document.getElementById("game-canvas").appendChild(renderer.domElement);
    //Lighting
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);
    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-1, 0.75, 1);
    dirLight.position.multiplyScalar(50);
    dirLight.name = "dirlight";
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.Height = 1024 * 2;
    dirLight.shadow.camera.left = -300;
    dirLight.shadow.camera.right = 300;
    dirLight.shadow.camera.top = 300;
    dirLight.shadow.camera.bottom = -300;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);
    //Load Models
    models = ["mountain", "tower"]

    for (const model of models) {
        OBJArray.push(await loadObj(model))
    }
}

function loadObj(name) {
    return new Promise(function (resolve, reject) {
        var mtlLoader = new THREE.MTLLoader();

        mtlLoader.setPath("/textures/");
        mtlLoader.load(name + ".mtl", function (materials) {

            materials.preload();

            var objLoader = new THREE.OBJLoader();

            objLoader.setMaterials(materials);
            objLoader.setPath("/models/");
            objLoader.load(name + ".obj", resolve, undefined, reject);

        }, undefined, reject);

    });
}

window.tileArray = []

function drawHex(sideLength) {
    var startQ = 0
    for (let r = -(sideLength - 1); r < sideLength; r++) {
        for (let q = startQ; q < startQ + (-Math.abs(r) + 2 * sideLength - 1); q++) {
            tileArray.push({
                mesh: new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 6), new THREE.MeshStandardMaterial({
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
                        x: 1.1 * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
                        y: 1.1 * (3 / 2 * r)
                    }
                },
                contents: "tower",
                color: "#fff" //(green), 0xFF9FF3 (pink), 0x1DD1A1 (turquoise), 0xFBC531 (yellow), 
            })
            tileArray[tileArray.length - 1].mesh.position.set(tileArray[tileArray.length - 1].coordinates.cartesian.y,
                0, tileArray[tileArray.length - 1].coordinates.cartesian.x)
            tileArray[tileArray.length - 1].mesh.rotation.y = 0.5
            scene.add(tileArray[tileArray.length - 1].mesh)
        }
        if (startQ > -sideLength + 1) {
            startQ = startQ - 1;
        }
    }
    return
}

function updateTiles() {
    tileArray.forEach(function (e) {
        e.mesh.material.color = new THREE.Color(e.color)


        if (e.contentMesh.children[0].name != e.contents) {
            var object = OBJArray.filter(function (r) {
                return r.children[0].name == e.contents
            })[0]
            if (object == -1)
                return
            scene.remove(e.contentMesh);
            e.contentMesh = object.clone()
            e.contentMesh.position.set(e.coordinates.cartesian.y, 0.251, e.coordinates.cartesian.x)
            scene.add(e.contentMesh)
        }

    })
}

function doOnce() {
    console.log(OBJArray)
    drawHex(13)
    tileArray.forEach(function (e) {
        e.mesh.material.color = new THREE.Color(e.color)


        var object = OBJArray.filter(function (r) {
            return r.children[0].name == e.contents
        })[0]
        if (object == -1)
            return
        scene.remove(e.contentMesh);
        e.contentMesh = object.clone()
        e.contentMesh.position.set(e.coordinates.cartesian.y, 0.251, e.coordinates.cartesian.x)
        scene.add(e.contentMesh)


    })
}

var animate = function () {
    requestAnimationFrame(animate);
    updateTiles()
    renderer.render(scene, camera);

}

////////////////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
window.addEventListener("load", async function () {
    await init()
    doOnce()
    animate()
})
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}