import * as THREE from "./node_modules/three/build/three.module.js"
import {OrbitControls} from "./node_modules/three/examples/jsm/controls/OrbitControls.js"
import {GLTFLoader} from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import {FBXLoader} from "./node_modules/three/examples/jsm/loaders/FBXLoader.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
);

camera.position.set(1.0009840837239776, 16.780185650706233, -30.192386071860483); 	 

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true 
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 1));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 10, -35);
light.castShadow = true;
scene.add(light);

// ---------------------- WORLD ----------------------

// ---------------------- WORLD ----------------------

// ----------------------------REWARD----------------------------
const textureLoader = new THREE.TextureLoader();

const box_texture = textureLoader.load("./texture/box_texture.jpg")
const coin_texutre = textureLoader.load("./texture/coin_texture.jpg")
const ball_texture = textureLoader.load("./texture/ball_texture.jpg")

function makeBox(width) {
    const geometry = new THREE.BoxGeometry(width, width);
    const material = new THREE.MeshStandardMaterial({
        map: box_texture
    });
    const box = new THREE.Mesh(geometry, material);
    box.castShadow = true;
    return box;
};

function makeBall(radius, widthSegments, heightSegments) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshStandardMaterial({
        map: ball_texture
    });
    const ball = new THREE.Mesh(geometry, material);
    ball.castShadow = true;
    return ball;
};

function makeCoin(radiusTop , radiusBottom, height, radialSegments) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
    const material = new THREE.MeshStandardMaterial({
        map: coin_texutre
    });
    const coin = new THREE.Mesh( geometry, material );
    coin.castShadow = true;
    return coin;
};

// ----------------------------REWARD----------------------------


// ----------------------------THIEF----------------------------
const loader = new GLTFLoader();
const assetLoader = new FBXLoader();

var thief;
var mixer;
var animationActions = [];

async function loadThiefModel() {
    try {
        const gltf = await assetLoader.loadAsync("./model/thief/BasicBandit/FBX/BasicBandit.fbx");
        thief = gltf;
        thief.scale.set(0.02, 0.02, 0.02);
        thief.rotateY(Math.PI);
        thief.position.set(0, 0.3, 20.5);


        const thief_texture = textureLoader.load("./texture/thief_texture.jpg")

        thief.traverse(function (child){
            if (child.isMesh) {
                // child.material.map = thief_texture;
                child.castShadow = true;
        
                var material = new THREE.MeshStandardMaterial({map: thief_texture});
                var uvs = child.geometry.attributes.uv.array;
                for (var i = 0; i < uvs.length; i += 2) {
                    uvs[i] = 1 - uvs[i];
                };
                child.material = material;
            };
        });
        scene.add(thief);

        mixer = new THREE.AnimationMixer(thief);

        assetLoader.load("./model/thief/animation/Walking.fbx", (walk_animation) => {
            const animationClip = walk_animation.animations[0];
            const animationAction = mixer.clipAction(animationClip);
            animationActions.push(animationAction);

            assetLoader.load("./model/thief/animation/Turn.fbx", (turn_animation) => {
                const animationClip = turn_animation.animations[0];
                const animationAction = mixer.clipAction(animationClip);
                animationActions.push(animationAction);
                
                assetLoader.load("./model/thief/animation/Right.fbx", (right_animation) => {
                    const animationClip = right_animation.animations[0];
                    const animationAction = mixer.clipAction(animationClip);
                    animationActions.push(animationAction);

                    assetLoader.load("./model/thief/animation/Left.fbx", (left_animation) => {
                        const animationClip = left_animation.animations[0];
                        const animationAction = mixer.clipAction(animationClip);
                        animationActions.push(animationAction);
                    });
                });
            });
        });
    } catch (error) {
        console.log("Thief Model Error:", error)
    };
};

loadThiefModel();

// ----------------------------THIEF----------------------------
// ----------------------------ROAD----------------------------
async function loadRoadModel() {
    try {
        const gltf = await loader.loadAsync("./model/road/scene.gltf");
        const road = gltf.scene;   
        road.scale.set(6, 3, 3);                            
        road.traverse(function (child){
            if (child.isMesh) {
                child.receiveShadow = true;
            };
        });
        scene.add(road);
    } catch (error) {
        console.log("Road Model Error:", error);
    };
};

loadRoadModel();
// ----------------------------ROAD----------------------------

// ----------------------------GROUND----------------------------
async function loadGroundModel() {
    try {
        const gltf = await loader.loadAsync("./model/ground/scene.gltf");
        const ground = gltf.scene;
        ground.traverse(function(child) {
          if (child.isMesh) {
            child.receiveShadow = true;
          };
        });
        scene.add(ground);
    } catch (error) {
        console.log("Ground Model Error:", error)
    };
};

loadGroundModel();
// ----------------------------GROUND----------------------------

// ----------------------------ATM----------------------------
async function loadAtmModel() {
    try {
        const gltf = await loader.loadAsync("./model/atm/scene.gltf");
        const atm = gltf.scene;
        atm.position.set(-0.1, 2, -20);
        atm.scale.set(1, 2, 1);
        atm.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        scene.add(atm);
    } catch (error) {
        console.log("ATM Model Error:", error)
    };
};

loadAtmModel();
// ----------------------------ATM----------------------------

// ----------------------------TREE----------------------------
async function loadTreeModel() {
    try {
        const gltf = await loader.loadAsync("./model/tree/scene.gltf");
        const model = gltf.scene;

        var Forest = [];
        for (var i = 0; i < 7; i++) {
            Forest.push(model.clone());
        };
        
        const deltaX = 15;
    
        for (var i = 0; i < 5 ; i++) {
            Forest[i].position.set(-25 + deltaX*i, 0, -0.5);
        };
    
        Forest[5].position.set(-9, 0, -12);
        Forest[6].position.set(9, 0, -12);
    
        Forest.forEach(function (tree) {
            tree.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                };
            });
        });
        
        Forest.forEach(function (tree) {
            scene.add(tree);
        });
    } catch (error) {   
        console.log("Tree Model Error:", error);
    };
};

loadTreeModel();
// ----------------------------TREE----------------------------

// ----------------------------CHEST----------------------------
async function loadChestModel() {
    try {
        const gltf = await loader.loadAsync("./model/chest/scene.gltf");
        const chest = gltf.scene;
        chest.scale.set(0.05, 0.05, 0.05);
        chest.position.set(0, 0, 24.75);                           
        chest.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        scene.add(chest);
    } catch (error) {
        console.log("Chest Model Error:", error);
    };
};

loadChestModel();
// ----------------------------CHEST----------------------------

// ----------------------------CAR----------------------------
var truckModels = [];
async function loadTruckModel() {
    try {
        const gltf = await loader.loadAsync("./model/car/truck/scene.gltf");
        const truck = gltf.scene;
        truck.position.set(33, 2.5, 5);
        // car.position.set(-42, 2.5, 5);
        truck.rotateY(Math.PI/2);
        truck.scale.set(10, 10, 10);
        truck.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        truckModels.push(truck);
        scene.add(truck);
    } catch (error) {
        console.log("Truck Model Error:", error);
    };
};

loadTruckModel();
// ----------------------------CAR----------------------------

// ----------------------------MOTO----------------------------
var motoModels = [];
async function loadMotoModel() {
    try {
        const gltf = await loader.loadAsync("./model/car/moto/scene.gltf");
        const moto = gltf.scene;
        moto.position.set(36, 0.29, -3);
        moto.rotateY(Math.PI/2);
        moto.scale.set(2, 2, 2);
        moto.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        motoModels.push(moto);
        scene.add(moto);
    } catch (error) {
        console.log("Moto Model Error:", error);
    };
};

loadMotoModel();
// ----------------------------MOTO----------------------------

// ----------------------------BIKE----------------------------
var bikeModels = [];
async function loadBikeModel() {
    try {
        const gltf = await loader.loadAsync("./model/car/bike/scene.gltf");
        const bike = gltf.scene;
        bike.position.set(-36, 0.5, -9.5);
        bike.scale.set(0.02, 0.02, 0.02);
        bike.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        bikeModels.push(bike);
        scene.add(bike);
    } catch (error) {  
        console.log("Bike Model Error:", error);
    };
};

loadBikeModel();
// ----------------------------BIKE----------------------------

// ----------------------------CAR----------------------------
var carModels = [];
async function loadCarModel() {
    try {
        const gltf = await loader.loadAsync("./model/car/car/scene.gltf");
        const car = gltf.scene;
        car.position.set(-35, 1.4, 18);
        car.rotateY(-Math.PI/2);
        car.scale.set(0.7, 0.7, 0.7);
        car.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        carModels.push(car);
        scene.add(car);
    } catch (error) {   
        console.log("Car Model Error:", error);
    };
};

loadCarModel();
// ----------------------------CAR----------------------------

// ----------------------------REWARD----------------------------

var rewardObjects = [];

async function arrowReward(X, Z) {
    try {
        const gltf = await loader.loadAsync("./model/reward/direction_arrow/scene.gltf");
        const arrow = gltf.scene;
        arrow.name = "arrow";
        arrow.rotateY(-Math.PI/2);
        arrow.position.set(X, 0.5, Z);
        arrow.scale.set(0.9, 0.8, 0.9);
        arrow.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        scene.add(arrow);
        rewardObjects.push(arrow);
    } catch (error) {   
        console.log("Arrow Model Error:", error);
    };
};

async function moneybagReward(X, Z) {
    try {
        const gltf = await loader.loadAsync("./model/reward/money_bag/scene.gltf");
        const moneybag = gltf.scene;
        moneybag.name = "moneybag";
        moneybag.rotateY(-Math.PI/2);
        moneybag.position.set(X, 0.7, Z);
        moneybag.scale.set(0.0075, 0.01, 0.006);
        moneybag.traverse(function (child){
            if (child.isMesh) {
                child.castShadow = true;
            };
        });
        scene.add(moneybag);
        rewardObjects.push(moneybag);
    } catch (error) {   
        console.log("Moneybag Model Error:", error);
    };
};

function rewardGenerative() {
    var randomNumber = Math.random();
    if (randomNumber <= 0.4) {

    } else 
    {
        var randomX = Math.floor(Math.random() * 21) - 10;
        var randomZ = Math.floor(Math.random() * 31) - 12;
        if (randomNumber <= 0.7) {
            arrowReward(randomX, randomZ);
        } else {
            moneybagReward(randomX, randomZ);
        };
    };
};

rewardGenerative();

// ----------------------------REWARD----------------------------

// ----------------------------Animation----------------------------

// ----------------------------Animation----------------------------
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    s: {
        pressed: false
    },
    w: {
        pressed: false
    },
    space: {
        pressed: false
    }
};

const leftBounder = -42;
const rightBounder = 39;

const maxspeedThief = 0.4;
var speedThief = maxspeedThief;

const truckSpeed = 0.1;
var gradientTruckSpeed = 0;

const motoSpeed = 0.085;
var gradientMotoSpeed = 0;

const bikeSpeed = 0.075;
var gradientBikeSpeed = 0;

const carSpeed = 0.14;
var gradientCarSpeed = 0;

var turn = -1;

var heightOfObjects = 4.6;
var objectCollect = [];
var objectGenerative = [];

var totalScore= 0;
var itemScore = 0;

function generative() {
    for (var i = 0; i < 4; i++) {
        var randomNumber = Math.floor(Math.random() * 3) + 1;
        var randomX = Math.floor(Math.random() * 25) - 12;
        var randomZ = Math.floor(Math.random() * 9) - 21;
        if (randomNumber == 1) {
            var coin = makeCoin(0.5, 0.5, 0.1, 128);
            coin.position.set(randomX, 0.5, randomZ);
            scene.add(coin);
            objectGenerative.push(coin);
        } else if (randomNumber == 2) {
            var ball = makeBall(0.5, 64, 32);
            ball.position.set(randomX, 0.75, randomZ);
            scene.add(ball);
            objectGenerative.push(ball);
        } else if (randomNumber == 3) {
            var box = makeBox(1);
            box.position.set(randomX, 1, randomZ);
            scene.add(box);
            objectGenerative.push(box);
        };
    };
};

generative();

function updateTruckSpeed() {
    gradientTruckSpeed += 0.009;
};

function updateBikeSpeed() {
    gradientBikeSpeed += 0.008;
};

function updateMotoSpeed() {
    gradientMotoSpeed += 0.0085;
};

function updateCarSpeed() {
    gradientCarSpeed += 0.01;
};

// ---------------------- ĐIỂM SỐ --------------------
function updateScores(value) {
    var scoresElement = document.getElementById("scores");
    scoresElement.textContent = 'Scores: ' + value;
};
// ---------------------- ĐIỂM SỐ --------------------

// ---------------------- HẾT GIỜ --------------------
var timeoutMessage = document.getElementById('timeout-message');
// ---------------------- HẾT GIỜ --------------------

// ---------------------- SỐ ĐỒ VẬT ĐANG GIỮ --------------------
function updateNumItems(numItem) {
    var numItermElement = document.getElementById("items");
    numItermElement.textContent = "Keeping: " + numItem;
};
// ---------------------- SỐ ĐỒ VẬT ĐANG GIỮ --------------------

// ---------------------- SỐ ĐỒ VẬT ĐANG GIỮ --------------------
function updateVelocity(veloc) {
    var velocityElement = document.getElementById("velocity");
    if (veloc) {
        velocityElement.textContent = "Velocity: " + veloc.toFixed(2);
    } else {
        velocityElement.textContent = "Velocity: " + veloc;
    };
};
// ---------------------- SỐ ĐỒ VẬT ĐANG GIỮ --------------------

var generativeInterval, loadTruckModelInterval, loadMotoModelInterval, loadBikeModelInterval, 
loadCarModelInterval, updateTruckSpeedInterval, updateBikeSpeedInterval, updateMotoSpeedInterval, updateCarSpeedInterval, rewardGenerativeInterval;

function updateInterval() {
    generativeInterval = setInterval(generative, 20000);
    loadTruckModelInterval = setInterval(loadTruckModel, 13000);
    loadMotoModelInterval = setInterval(loadMotoModel, 11000);
    loadBikeModelInterval = setInterval(loadBikeModel, 11000);
    loadCarModelInterval = setInterval(loadCarModel, 14000);
    updateTruckSpeedInterval = setInterval(updateTruckSpeed, 6000);
    updateBikeSpeedInterval = setInterval(updateBikeSpeed, 6000);
    updateMotoSpeedInterval = setInterval(updateMotoSpeed, 6000);
    updateCarSpeedInterval = setInterval(updateCarSpeed, 6000);
    rewardGenerativeInterval = setInterval(rewardGenerative, 12000);
};

function cancelInterval() {
    clearInterval(generativeInterval);
    clearInterval(loadTruckModelInterval);
    clearInterval(loadMotoModelInterval);
    clearInterval(loadBikeModelInterval);
    clearInterval(loadCarModelInterval);
    clearInterval(updateTruckSpeedInterval);
    clearInterval(updateBikeSpeedInterval);
    clearInterval(updateMotoSpeedInterval);
    clearInterval(updateCarSpeedInterval);
    clearInterval(rewardGenerativeInterval);
};


var isStart = false;
var isEnd = false;
var collision = false;
var remainingTime;

var scoreParameter = 1;
var deltaVelocity = 0;

const clock = new THREE.Clock();

function removeModel(model) {
    model.traverse(function(object) {
       if (object.isMesh) {
        object.geometry.dispose();
        object.material.dispose();
       };
    });
    scene.remove(model);
    model = null;
};


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    if (isStart) {
        if (remainingTime == 0) {
            timeoutMessage.textContent = "Time Over";
            cancelAnimationFrame(requestAnimationFrame(animate));
            cancelInterval();
            isEnd = true;
            return;
        };
        if (collision) {
            timeoutMessage.textContent = "You're death";
            cancelAnimationFrame(requestAnimationFrame(animate));
            cancelInterval();
            isEnd = true;
            return;
        };

        if (mixer) {
            mixer.update(clock.getDelta());
        };


        var thiefBoundingBox;
        if (thief) {
            thiefBoundingBox = new THREE.Box3().setFromObject(thief);
        };

        truckModels.forEach(function (truck, index) {
            truck.position.x -= (truckSpeed + gradientTruckSpeed);
            var truckBoundingBox = new THREE.Box3().setFromObject(truck);
            if (thiefBoundingBox.intersectsBox(truckBoundingBox)) {
                collision = true;
            };

            if (truck.position.x < leftBounder) {
                removeModel(truck);
            };

            if (index > 0) {
                var behind_truck = truckModels[index-1];
                var behind_truckBoundingBox = new THREE.Box3().setFromObject(behind_truck);
                if (behind_truckBoundingBox.intersectsBox(truckBoundingBox)) {
                    removeModel(truck);
                    removeModel(behind_truck);
                };
            };
        });

        motoModels.forEach(function (moto, index) {
            moto.position.x -= (motoSpeed + gradientMotoSpeed);
            var motoBoundingBox = new THREE.Box3().setFromObject(moto);
            if (thiefBoundingBox.intersectsBox(motoBoundingBox)) {
                collision = true;
            };

            if (moto.position.x < leftBounder) {
                removeModel(moto);
            };

            if (index > 0) {
                var behind_moto = motoModels[index-1];
                var behind_motoBoundingBox = new THREE.Box3().setFromObject(behind_moto);
                if (behind_motoBoundingBox.intersectsBox(motoBoundingBox)) {
                    removeModel(moto);
                    removeModel(behind_moto);
                };
            };
        });

        bikeModels.forEach(function (bike, index) {
            bike.position.x += bikeSpeed + gradientBikeSpeed;
            var bikeBoundingBox = new THREE.Box3().setFromObject(bike);
            if (thiefBoundingBox.intersectsBox(bikeBoundingBox)) {
                collision = true;
            };

            if (bike.position.x > rightBounder) {
                removeModel(bike);
            };

            if (index > 0) {
                var behind_bike = bikeModels[index-1];
                var behind_bikeBoundingBox = new THREE.Box3().setFromObject(behind_bike);
                if (behind_bikeBoundingBox.intersectsBox(bikeBoundingBox)) {
                    removeModel(bike);
                    removeModel(behind_bike);
                };
            };
        });

        carModels.forEach(function (car, index) {
            car.position.x += carSpeed + gradientCarSpeed;
            var carBoundingBox = new THREE.Box3().setFromObject(car);
            if (thiefBoundingBox.intersectsBox(carBoundingBox)) {
                collision = true;
            };

            if (car.position.x > rightBounder) {
                removeModel(car);
            };

            if (index > 0) {
                var behind_car = carModels[index-1];
                var behind_carBoundingBox = new THREE.Box3().setFromObject(behind_car);
                if (behind_carBoundingBox.intersectsBox(carBoundingBox)) {
                    removeModel(car);
                    removeModel(behind_car);
                };
            };
        });

        // 0 = Walk, 1 = Turn, Right = 2, Left = 3

        if (keys.a.pressed || keys.d.pressed || keys.w.pressed) {
            updateVelocity(speedThief);
        } else {
            updateVelocity(0);
        };

        updateNumItems(objectCollect.length);
        updateScores(totalScore);

        if (keys.w.pressed) {
            animationActions[1].stop();
            animationActions[2].stop();
            animationActions[3].stop();
            animationActions[0].play();
            
            thief.position.z += turn*speedThief;
        };

        if (keys.d.pressed) {
            animationActions[0].stop();
            animationActions[1].stop();
            animationActions[3].stop();
            animationActions[2].play();
            thief.position.x -= speedThief;
        };

        if (keys.a.pressed) {
            animationActions[0].stop();
            animationActions[1].stop();
            animationActions[2].stop();
            animationActions[3].play();
            thief.position.x += speedThief;
        };

        if (keys.s.pressed) {
            var quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
            thief.applyQuaternion(quaternion);
            turn *= -1;
            keys.s.pressed = false;
        };
        
        if (keys.space.pressed) {
            if (objectCollect.length < 3) {
                objectGenerative.forEach(function (object) {
                    var objectBoundingBox = new THREE.Box3().setFromObject(object);
                    if (thiefBoundingBox.intersectsBox(objectBoundingBox)) {
                        objectCollect.push(object);
                        if (object.geometry instanceof THREE.BoxGeometry) {
                            itemScore += 1;
                        } else if (object.geometry instanceof THREE.SphereGeometry) {
                            itemScore += 2;
                        } else if (object.geometry instanceof THREE.CylinderGeometry) {
                            itemScore += 4;
                        };

                        var objectRemove = objectGenerative.indexOf(object);
                        if (objectRemove !== -1) {
                            objectGenerative.splice(objectRemove, 1);
                        };
                    };
                });
            };
        };

        objectCollect.forEach(function (object, index) {
            if (object) {
                object.position.set(thief.position.x, heightOfObjects + index, thief.position.z);
                object.rotation.y += 0.05;
            };
        });

        rewardObjects.forEach(function (object) {
            var objectBoundingBox = new THREE.Box3().setFromObject(object);
            if (thiefBoundingBox.intersectsBox(objectBoundingBox)) {
                if (object.name == "arrow") {
                    deltaVelocity = turn/16;
                    setTimeout(() => {
                        deltaVelocity = 0
                    }, 5000);
                } else if (object.name == "moneybag") {
                    scoreParameter = 2;
                };
                removeModel(object);
            };
        });

        if (thief && thief.position) {
            if (Math.abs(thief.position.x) <= 4.32 && thief.position.z >= 20 && thief.position.z <= 30) {
                objectCollect.forEach(function (object) {
                    object.geometry.dispose();
                    object.material.dispose();
                    scene.remove(object);
                });
                objectCollect = [] ;
                totalScore += itemScore*scoreParameter;
                itemScore = 0;
                scoreParameter = 1;
            };
            speedThief =  maxspeedThief - 0.06 * objectCollect.length + deltaVelocity;
        };
    };
};

function countdownTimer() {
{
    var countdownElement = document.getElementById("countdown-timer");
    var countdown = 181 // 3 phút
    
    var countdownInterval = setInterval(function() {
    var minutes = Math.floor((countdown-1) / 60);
    var seconds = (countdown-1) % 60;

    countdownElement.textContent = "Time: " + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
    
    
    if (countdown == 0) {
        clearInterval(countdownInterval);
        countdownElement.textContent = "Time: 00:00"; // Hiển thị khi kết thúc
    } else if (!isEnd) {
        countdown--;
        remainingTime = countdown;
    };
       }, 1000);
    };
};


animate();

var buttonElement = document.getElementById("startgame");
buttonElement.addEventListener("click", function() {
    countdownTimer();
    buttonElement.style.display = "none";
    isStart = true;
    updateInterval();
});

window.addEventListener("keydown", (event) => {
    switch(event.code) {
        case "KeyA":
			keys.a.pressed = true;
			break;
		case "KeyD":
			keys.d.pressed = true;
			break;
		case "KeyS":
			keys.s.pressed = true;
			break;
		case "KeyW":
			keys.w.pressed = true;
			break;
        case "Space":
            keys.space.pressed = true;
            break;
    };
});

window.addEventListener("keyup", (event) => {
    switch(event.code) {
        case "KeyA":
			keys.a.pressed = false;
			break;
		case "KeyD":
			keys.d.pressed = false;
			break;
		case "KeyS":
			keys.s.pressed = false;
			break;
		case "KeyW":
			keys.w.pressed = false;
			break;
        case "Space":
            keys.space.pressed = false;
            break;
    };
});
