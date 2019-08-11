var scene, camera, renderer, controls, hemilight, dirlight, models = {}

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

    for (const model of ["mountain", "tower", "tree", "house"]) {
        models[model] = (await loadObj(model))
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

const handler = {
    set(target, key, value) {
        target[key] = value;
        updateTile(target)
    },
};


function drawHex(sideLength) {
    var startQ = 0
    for (let r = -(sideLength - 1); r < sideLength; r++) {
        for (let q = startQ; q < startQ + (-Math.abs(r) + 2 * sideLength - 1); q++) {
            tileArray.push(new Proxy({
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
                        x: 1.1 * (3 / 2 * r),
                        y: 1.1 * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r)
                    }
                },
                contents: "",
                color: "#fff",
                army: false,
                village: 0,
                forest: 0,
                treeArray: [],
                houseArray: []
            }, handler))
            tileArray[tileArray.length - 1].mesh.position.set(tileArray[tileArray.length - 1].coordinates.cartesian.y,
                0, tileArray[tileArray.length - 1].coordinates.cartesian.x)
            scene.add(tileArray[tileArray.length - 1].mesh)
        }
        if (startQ > -sideLength + 1) {
            startQ = startQ - 1;
        }
    }
    return
}
window.axialSearch = function (q, r) {
    return tileArray.filter(function (e) {
        return e.coordinates.axial.q == q && e.coordinates.axial.r == r
    })[0] || null
}

function updateOBJ(tile) {
    var object = models[tile.contents]
    if (object === undefined)
        return
    scene.remove(tile.contentMesh);
    tile.contentMesh = object.clone()
    tile.contentMesh.position.set(tile.coordinates.cartesian.y, 0.251, tile.coordinates.cartesian.x)
    scene.add(tile.contentMesh)
}

function updateTile(tile) {
    tile.mesh.material.color = new THREE.Color(tile.color)
    tile.treeArray.forEach(function (e, i) {
        scene.remove(e)
        tile.treeArray.slice(i, i + 1)
    })
    for (let n = 0; n < tile.forest; n++) {
        tile.treeArray[n] = models.tree.clone()
        if (tile.forest == 1) {
            tile.treeArray[n].position.set(tile.coordinates.cartesian.y, 0.25, tile.coordinates.cartesian.x)
            scene.add(tile.treeArray[n])
            break
        }
        tile.treeArray[n].position.set(0.5 * Math.cos(2 * Math.PI * n / tile.forest) + tile.coordinates.cartesian.y, 0.25, 0.5 * Math.sin(2 * Math.PI * n / tile.forest) + tile.coordinates.cartesian.x)
        scene.add(tile.treeArray[n])
    }
    tile.houseArray.forEach(function (e, i) {
        scene.remove(e)
        tile.houseArray.slice(i, i + 1)
    })
    for (let n = 0; n < tile.village; n++) {
        tile.houseArray[n] = models.house.clone()
        if (tile.village == 1) {
            tile.houseArray[n].position.set(tile.coordinates.cartesian.y, 0.25, tile.coordinates.cartesian.x)
            scene.add(tile.houseArray[n])
            break
        }
        tile.houseArray[n].position.set(0.5 * Math.cos(2 * Math.PI * n / tile.village) + tile.coordinates.cartesian.y, 0.25, 0.5 * Math.sin(2 * Math.PI * n / tile.village) + tile.coordinates.cartesian.x)
        scene.add(tile.houseArray[n])
    }

    if (tile.contents === "") {
        scene.remove(tile.contentMesh);
        return
    }

    if (tile.contents != "" && tile.contentMesh == undefined) {
        updateOBJ(tile)
        return
    }

    if (tile.contentMesh.children[0].name != tile.contents) {
        updateOBJ(tile)
        return
    }

}

function doOnce() {
    console.log(models)
    drawHex(13)
    tileArray.forEach(function (e) {
        e.mesh.material.color = new THREE.Color(e.color)

        if (e.contents == "")
            return
        var object = models[e.contents]
        if (object === undefined)
            return
        scene.remove(e.contentMesh);
        e.contentMesh = object.clone()
        e.contentMesh.position.set(e.coordinates.cartesian.y, 0.251, e.coordinates.cartesian.x)
        scene.add(e.contentMesh)


    })
}

var animate = function () {
    requestAnimationFrame(animate);
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