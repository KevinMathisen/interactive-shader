// Declare custom value -----------------------------------------------------------------
let uCustomValue1 = 0.0;
let uCustomValue2 = 0.0;
let uCustomValue3 = 0.0;

let vscode = undefined;
if (typeof acquireVsCodeApi === 'function') {
	vscode = acquireVsCodeApi();
}
var compileTimePanel;

let revealError = function(line, file) {
	if (vscode) {
		vscode.postMessage({
			command: 'showGlslsError',
			line: line,
			file: file
		});
	}
};

let currentShader = {};
// Error Callback
console.error = function () {
	if('7' in arguments) {
		let errorRegex = /ERROR: \d+:(\d+):\W(.*)\n/g;
		let rawErrors = arguments[7];
		let match;
		
		let diagnostics = [];
		let message = '';
		while(match = errorRegex.exec(rawErrors)) {
			let lineNumber = Number(match[1]) - currentShader.LineOffset;
			let error = match[2];
			diagnostics.push({
				line: lineNumber,
				message: error
			});
			let lineHighlight = `<a class='error' unselectable onclick='revealError(${lineNumber}, "${currentShader.File}")'>Line ${lineNumber}</a>`;
			message += `<li>${lineHighlight}: ${error}</li>`;
		}
		console.log(message);
		let diagnosticBatch = {
			filename: currentShader.File,
			diagnostics: diagnostics
		};
		if (vscode !== undefined) {
			vscode.postMessage({
				command: 'showGlslDiagnostic',
				type: 'error',
				diagnosticBatch: diagnosticBatch
			});
		}

		$('#message').append(`<h3>Shader failed to compile - ${currentShader.Name} </h3>`);
		$('#message').append('<ul>');
		$('#message').append(message);
		$('#message').append('</ul>');
	}
};

// Development feature: Output warnings from third-party libraries
// console.warn = function (message) {
//     $("#message").append(message + '<br>');
// };

let clock = new THREE.Clock();
let pausedTime = 0.0;
let deltaTime = 0.0;
let startingTime = 3.1963000001907353;
let time = startingTime;

let date = new THREE.Vector4();

let updateDate = function() {
	let today = new Date();
	date.x = today.getFullYear();
	date.y = today.getMonth();
	date.z = today.getDate();
	date.w = today.getHours() * 60 * 60 
		+ today.getMinutes() * 60
		+ today.getSeconds()
		+ today.getMilliseconds() * 0.001;
};
updateDate();

let paused = false;
let forceRenderOneFrame = paused;
let pauseButton = document.getElementById('pause-button');




let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl2');
let isWebGL2 = gl != null;
if (gl == null) gl = canvas.getContext('webgl');
let supportsFloatFramebuffer = (gl.getExtension('EXT_color_buffer_float') != null) || (gl.getExtension('WEBGL_color_buffer_float') != null);
let supportsHalfFloatFramebuffer = (gl.getExtension('EXT_color_buffer_half_float') != null);
let framebufferType = THREE.UnsignedByteType;
if (supportsFloatFramebuffer) framebufferType = THREE.FloatType;
else if (supportsHalfFloatFramebuffer) framebufferType = THREE.HalfFloatType;

let renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, context: gl, preserveDrawingBuffer: true });
let resolution = forceAspectRatio(window.innerWidth, window.innerHeight);
let mouse = new THREE.Vector4(-1, -1, -1, -1);
let mouseButton = new THREE.Vector4(0, 0, 0, 0);
let normalizedMouse = new THREE.Vector2(0.033101045296167246, 0.810012836970475);
let frameCounter = 0;
let recorder = null;

// Audio Init
const audioContext = {
	sampleRate: 0
};
// Audio Resume

let buffers = [];
// Buffers 
buffers.push({
	Name: 'app.glsl',
	File: 'app.glsl',
	LineOffset: 134,
	Target: null,
	ChannelResolution: Array(10).fill(new THREE.Vector3(0,0,0)),
	PingPongTarget: null,
	PingPongChannel: 0,
	Dependents: [],
	Shader: new THREE.ShaderMaterial({
		fragmentShader: document.getElementById('app.glsl').textContent,
		depthWrite: false,
		depthTest: false,
		uniforms: {
			iResolution: { type: 'v3', value: resolution },
			iTime: { type: 'f', value: 0.0 },
			iTimeDelta: { type: 'f', value: 0.0 },
			iFrame: { type: 'i', value: 0 },
			iMouse: { type: 'v4', value: mouse },
			iMouseButton: { type: 'v2', value: mouseButton },
			iViewMatrix: {type: 'm44', value: new THREE.Matrix4() },
			iChannelResolution: { type: 'v3v', value: Array(10).fill(new THREE.Vector3(0,0,0)) },

			iDate: { type: 'v4', value: date },
			iSampleRate: { type: 'f', value: audioContext.sampleRate },

			iChannel0: { type: 't' },
			iChannel1: { type: 't' },
			iChannel2: { type: 't' },
			iChannel3: { type: 't' },
			iChannel4: { type: 't' },
			iChannel5: { type: 't' },
			iChannel6: { type: 't' },
			iChannel7: { type: 't' },
			iChannel8: { type: 't' },
			iChannel9: { type: 't' },

			resolution: { type: 'v2', value: resolution },
			time: { type: 'f', value: 0.0 },
			mouse: { type: 'v2', value: normalizedMouse },

			// Insert custom value ----------------------------------------------------------------
			uCustomValue1: { type: 'f', value: 0 },
			uCustomValue2: { type: 'f', value: 0 },
			uCustomValue3: { type: 'f', value: 0 },
		}
	})
}); 
let commonIncludes = [];
// Includes


// WebGL2 inserts more lines into the shader
if (isWebGL2) {
	for (let buffer of buffers) {
		buffer.LineOffset += 16;
	}
}

// Keyboard Init

// Uniforms Init
// Uniforms Update

let texLoader = new THREE.TextureLoader();
// Texture Init


let scene = new THREE.Scene();
let quad = new THREE.Mesh(
	new THREE.PlaneGeometry(resolution.x, resolution.y),
	null
);
scene.add(quad);

let controlState = new THREE.Camera();
controlState.position.set(0,0,0);
controlState.quaternion.set(0,0,0,1);
scene.add(controlState);

let flyControls = undefined;
if (typeof FlyControls === 'function') {
	flyControls = new FlyControls(controlState, renderer.domElement, vscode);
	flyControls.movementSpeed = 1;
	flyControls.domElement = renderer.domElement;
	flyControls.rollSpeed = Math.PI / 24;
	flyControls.autoForward = false;
	flyControls.dragToLook = true;
}

let camera = new THREE.OrthographicCamera(-resolution.x / 2.0, resolution.x / 2.0, resolution.y / 2.0, -resolution.y / 2.0, 1, 1000);
camera.position.set(0, 0, 10);

// Run every shader once to check for compile errors
let compileTimeStart = performance.now();
let failed=0;
for (let include of commonIncludes) {
	currentShader = {
		Name: include.Name,
		File: include.File,
		// add two for version and precision lines
		LineOffset: 27 + 2
	};
	// Test Compile Included Files
	// bail if there is an error found in the include script
	if(compileFragShader(gl, document.getElementById(include.Name).textContent) == false) {
		throw Error(`Failed to compile ${include.Name}`);
	}
}

for (let buffer of buffers) {
	currentShader = {
		Name: buffer.Name,
		File: buffer.File,
		LineOffset: buffer.LineOffset
	};
	quad.material = buffer.Shader;
	renderer.setRenderTarget(buffer.Target);
	renderer.render(scene, camera);
}
currentShader = {};
let compileTimeEnd = performance.now();
let compileTime = compileTimeEnd - compileTimeStart;
if (compileTimePanel !== undefined) {
	for (let i = 0; i < 200; i++) {
		compileTimePanel.update(compileTime, 200);
	}
}

computeSize();
render();

function addLineNumbers( string ) {
	let lines = string.split( '\\n' );
	for ( let i = 0; i < lines.length; i ++ ) {
		lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];
	}
	return lines.join( '\\n' );
}

function compileFragShader(gl, fsSource) {
	const fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, fsSource);
	gl.compileShader(fs);
	if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
		const fragmentLog = gl.getShaderInfoLog(fs);
		console.error( 'THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.COMPILE_STATUS', null, null, null, null, fragmentLog );
		return false;
	}
	return true;
}

function render() {
	requestAnimationFrame(render);
	if (!forceRenderOneFrame) {
		// Pause Whole Render
		if (paused) return;
	}
	forceRenderOneFrame = false;

	// Advance Time
	deltaTime = clock.getDelta();
	time = startingTime + clock.getElapsedTime() - pausedTime;
	if (vscode !== undefined) {
		vscode.postMessage({
			command: 'updateTime',
			time: time
		});
	}
	updateDate();
	
	if(flyControls)
	{
		flyControls.update(0.1);
	}

	// Audio Update

	for (let buffer of buffers) {
		buffer.Shader.uniforms['iResolution'].value = resolution;
		buffer.Shader.uniforms['iTimeDelta'].value = deltaTime;
		buffer.Shader.uniforms['iTime'].value = time;
		buffer.Shader.uniforms['iFrame'].value = frameCounter;
		buffer.Shader.uniforms['iMouse'].value = mouse;
		buffer.Shader.uniforms['iMouseButton'].value = mouseButton;

		buffer.Shader.uniforms['iViewMatrix'].value = controlState.matrixWorld;

		buffer.Shader.uniforms['resolution'].value = resolution;
		buffer.Shader.uniforms['time'].value = time;
		buffer.Shader.uniforms['mouse'].value = normalizedMouse;

		// Insert custom value --------------------------------------------------------------
		buffer.Shader.uniforms['uCustomValue1'].value = uCustomValue1;
		buffer.Shader.uniforms['uCustomValue2'].value = uCustomValue2;
		buffer.Shader.uniforms['uCustomValue3'].value = uCustomValue3;

		quad.material = buffer.Shader;
		renderer.setRenderTarget(buffer.Target);
		renderer.render(scene, camera);
	}
	
	// Uniforms Update

	// Keyboard Update

	if (mouse.w > 0.0) {
		mouse.w = -mouse.w;
		updateMouse();
	}

	for (let buffer of buffers) {
		if (buffer.PingPongTarget) {
			[buffer.PingPongTarget, buffer.Target] = [buffer.Target, buffer.PingPongTarget];
			buffer.Shader.uniforms[`iChannel${buffer.PingPongChannel}`].value = buffer.PingPongTarget.texture;
			for (let dependent of buffer.Dependents) {
				const dependentBuffer = buffers[dependent.Index];
				dependentBuffer.Shader.uniforms[`iChannel${dependent.Channel}`].value = buffer.Target.texture;
			}
		}
	}

	frameCounter++;
}
function forceAspectRatio(width, height) {
	// Forced aspect ratio
	let forcedAspects = [0,0];
	let forcedAspectRatio = forcedAspects[0] / forcedAspects[1];
	let aspectRatio = width / height;

	if (forcedAspectRatio <= 0 || !isFinite(forcedAspectRatio)) {
		let resolution = new THREE.Vector3(width, height, 1.0);
		return resolution;
	}
	else if (aspectRatio < forcedAspectRatio) {
		let resolution = new THREE.Vector3(width, Math.floor(width / forcedAspectRatio), 1);
		return resolution;
	}
	else {
		let resolution = new THREE.Vector3(Math.floor(height * forcedAspectRatio), height, 1);
		return resolution;
	}
}
function computeSize() {
	
	// Compute forced aspect ratio and align canvas
	resolution = forceAspectRatio(window.innerWidth, window.innerHeight);
	canvas.style.left = `${(window.innerWidth - resolution.x) / 2}px`;
	canvas.style.top = `${(window.innerHeight - resolution.y) / 2}px`;

	for (let buffer of buffers) {
		if (buffer.Target) {
			buffer.Target.setSize(resolution.x, resolution.y);
		}
		if (buffer.PingPongTarget) {
			buffer.PingPongTarget.setSize(resolution.x, resolution.y);
		}
	}
	renderer.setSize(resolution.x, resolution.y, false);
	
	// Update Camera and Mesh
	quad.geometry = new THREE.PlaneGeometry(resolution.x, resolution.y);
	camera.left = -resolution.x / 2.0;
	camera.right = resolution.x / 2.0;
	camera.top = resolution.y / 2.0;
	camera.bottom = -resolution.y / 2.0;
	camera.updateProjectionMatrix();

	// Reset iFrame on resize for shaders that rely on first-frame setups
	frameCounter = 0;
}

let dragging = false;


window.addEventListener('resize', function() {
	computeSize();
});


// ----------------------------------------------------------------------
// Websocket 
const minInput = 0;
const maxInput = 1023;
const minOutputs = [0., 0., 0.];
const maxOutputs = [0.7, 1, 100.];

function convertSerialToShader(input, i) {
	return (input - minInput) / (maxInput - minInput) * (maxOutputs[i] - minOutputs[i]) + minOutputs[i]
}

const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
	let temp = JSON.parse(event.data).v1;
	uCustomValue1 = convertSerialToShader(temp, 0);
	temp = JSON.parse(event.data).v2;
	uCustomValue2 = convertSerialToShader(temp, 1);
	temp = JSON.parse(event.data).v3;
	uCustomValue3 = convertSerialToShader(temp, 2);
	console.log(uCustomValue1);
}


