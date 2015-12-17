
// WEB AUDIO API

var ctx; //audio context 
var buf; //audio buffer 
var fft; //fft audio node 
var samples = 256; // size 
var setup = false; //indicate if audio is set up yet 
var song;

var playlist = [];

window.addEventListener('load',initMusic,false); 

//init the sound system 
function initMusic() { 
    try { 
        ctx = new AudioContext(); 
        // setupCanvas(); 

        loadFile(); 
    } catch(e) { 
        alert('you need webaudio support' + e); 
    } 
} 
 
//load the mp3 file 
function loadFile() { 

    if (setup = true) {
        return;
    } 
    else {
        var req = new XMLHttpRequest(); 
        // req.open("GET","cantpretend.mp3",true); 
        // can't use jquery because we need the arraybuffer type 
        req.responseType = "arraybuffer"; 
        req.onload = function() { 
            //decode the loaded data 
            ctx.decodeAudioData(req.response, function(buffer) { 
                buf = buffer; 
                playAudio(); 
            }); 
        }; 
        req.send(); 
    }
}

function playAudio() { 

    if (song) {
        song.stop()
    }

    //create a source node from the buffer 
    song = ctx.createBufferSource();  
    song.buffer = buf; 
     
    //create fft --> Fast Fourier Transform
    fft = ctx.createAnalyser(); 
    fft.fftSize = samples; 
     
    //connect them up into a chain 
    song.connect(fft); 
    fft.connect(ctx.destination); 
     
    //play immediately
    song.start(0); 
    setup = true; 

} 

// DROP EVENT
function dropMusic() {
    function dropEvent(evt) {

        evt.stopPropagation();
        evt.preventDefault();
        
        var droppedFiles = evt.dataTransfer.files;
        
        for (var i = 0; i < droppedFiles.length; ++i) {
            var file = droppedFiles[i];
            playlist.push(file);
        }


        // playlist.push(droppedFiles[0]);
        playNext();
    }

    function dragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        return false;
    }

    var dropArea = document.getElementsByTagName('body')[0];
    dropArea.addEventListener('drop', dropEvent, false);
    dropArea.addEventListener('dragover', dragOver, false);
}

function startAudio(file) {
    var reader = new FileReader();
            
    reader.onload = function(fileEvent) {
        var data = fileEvent.target.result;

        ctx.decodeAudioData(data, function(buffer) { 
            buf = buffer; 
            playAudio();
            song.onended = function(){
                song = null;
                playNext();
            };

            animate();
        }); 

    }
    
    reader.readAsArrayBuffer(file);
}

function playNext() {
    
    if (song) {
        return;
    }
    if (playlist.length > 0) {
        var file = playlist.shift()
        startAudio(file)
    }
   

}

////////////////////////////////////////////////////////////////////
// THREE JS
var AMOUNT = 100;
var container;
var camera, scene, renderer;
var video, image, imageContext,
        imageReflection, imageReflectionContext, imageReflectionGradient,
        texture, textureReflection;
var mesh;
var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var geometry, group;
var texture;


var rgbEffect;
var dotEffect;
var mirrorEffect;
var glitchEffect;
var badTVPass;

init();
dropMusic();
//animate();
//update();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    info = document.createElement('div')
    info.className = "info";
    var content = document.createTextNode("Drop an mp3 file to start")
    container.appendChild(info)
    info.appendChild(content);

    credit = document.createElement('div')
    credit.className = "credit";
    var author = document.createTextNode("Created by Shennah")
    container.appendChild(credit)
    credit.appendChild(author);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    scene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry( 50, 50, 50 );
    // var material = new THREE.MeshNormalMaterial( { overdraw: 0.5 } );

    video = document.getElementById('video');

    video.addEventListener('ended', function () {
        this.currentTime = 0;
        this.load()
        this.play();
    }, false);

    video.play();

    image = document.createElement('canvas');
    image.width = 1920;
    image.height = 1080;
    imageContext = image.getContext('2d');
    imageContext.fillStyle = '#000000';
    imageContext.fillRect(0, 0, 1920, 1080);
    texture = new THREE.Texture(video);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.format = THREE.RGBFormat;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        overdraw: true
    });
    // var plane = new THREE.PlaneGeometry(1280, 768, 4, 4);
    // mesh = new THREE.Mesh(plane, material);
    // scene.add(mesh);

    var sphere = new THREE.SphereGeometry(640, 100, 100 ) //1280/2
    mesh = new THREE.Mesh(sphere, material);
    scene.add(mesh);

    //

    group = new THREE.Group();

    for ( var i = 0; i < 200; i ++ ) {

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = Math.random() * 2000 - 1000;
        mesh.position.y = Math.random() * 2000 - 1000;
        mesh.position.z = Math.random() * 2000 - 1000;
        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        group.add( mesh );

    }

    scene.add( group );
    //

    renderer = new THREE.WebGLRenderer();
    
    renderer.setClearColor( 0x0000000 );
    renderer.setPixelRatio( window.devicePixelRatio );

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    document.addEventListener('mousemove', onDocumentMouseMove, false);


    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    dotEffect = new THREE.ShaderPass( THREE.DotScreenShader );
    dotEffect.uniforms[ 'scale' ].value = 4;
    composer.addPass( dotEffect );

    mirrorEffect = new THREE.ShaderPass( THREE.MirrorShader );
    mirrorEffect.uniforms[ 'side' ].value = 2;
    composer.addPass ( mirrorEffect );


    glitchEffect = new THREE.GlitchPass( THREE.DigitalGlitch );
    glitchEffect.uniforms['amount'].value = 0.05;
    composer.addPass ( glitchEffect );


	badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
	badTVPass.uniforms[ 'distortion2' ].value = 1.0;
	badTVPass.uniforms[ 'distortion' ].value = 1.0;
	badTVPass.uniforms[ 'rollSpeed' ].value = 0.01;
	// badTVPass.uniforms[ 'randomSeed' ].value = Math.random() * 150.0
	composer.addPass( badTVPass );


    rgbEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
    rgbEffect.uniforms[ 'amount' ].value = 0.0015;
    rgbEffect.renderToScreen = true;
    composer.addPass( rgbEffect );

    //

    window.addEventListener('resize', onWindowResize, true);

    // window.addEventListener('mousewheel', whenScroll, true);
    window.addEventListener('click', function() {
        composer.addPass( glitchEffect );
    });

};//init

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function onDocumentMouseMove(event) {
    mouseX = ( event.clientX - windowHalfX ) * 10;
    mouseY = ( event.clientY - windowHalfY ) * 10;
}


function animate() {
    
    $( ".info" ).remove();
    $( ".credit" ).remove();

    update()

    requestAnimationFrame(animate);
    
    render();
    composer.render();
}

function render() {
    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( -mouseY - camera.position.y ) * 0.05;
    camera.lookAt(scene.position);

    var currentSeconds = Date.now();
    group.rotation.x = Math.sin( currentSeconds * 0.0007 ) * 0.5;
    group.rotation.y = Math.sin( currentSeconds * 0.0003 ) * 0.5;
    group.rotation.z = Math.sin( currentSeconds * 0.0002 ) * 0.5;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
       imageContext.drawImage(video, 0, 0);
        if (texture) texture.needsUpdate = true;
    }
    renderer.render(scene, camera);
}


function update() { 
    requestAnimationFrame(update); 

    if(!setup) return; 

    var freqDomain = new Uint8Array(samples); 
    fft.getByteFrequencyData(freqDomain);

    // SUM
    var sum = 0;
    for(var i=0; i<freqDomain.length; i++) {
        sum += (freqDomain[i])
    }

    rgbEffect.uniforms[ 'amount' ].value = sum / 400000;

 
    var timeDomain = new Uint8Array(samples);
	fft.getByteTimeDomainData(freqDomain);

	for (var i = 0; i < freqDomain.length; i++) {

		badTVPass.uniforms[ 'distortion' ].value = freqDomain[i] / 40
	}

}

function randomInteger(lowest, highest) {
	return Math.floor(Math.random() * (highest - lowest) + lowest)
}


window.setInterval(function (){mirrorEffect.uniforms[ 'side' ].value = randomInteger(1, 4)}, 10000);
