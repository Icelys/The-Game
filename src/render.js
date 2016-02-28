var canvs;
var c;

var LENGTH = 800;
var HEIGHT = 400;

var BLACK = "#000000";
var RED = "#FF0000";
var GREEN = "#00FF00";
var BLUE = "#0000FF";


//////// INIT ////////

function init() { // Setup the canvas
	canvs = document.getElementById("myCanvas");
	c = canvs.getContext("2d");
	console.log("Main.js ready");
}

//////// MEC ////////

function rgb(r, g, b){ // Convert rbg to #123456

	var rc = r.toString(16).length > 1 ? r.toString(16) : "0" + r.toString(16);
	var gc = g.toString(16).length > 1 ? g.toString(16) : "0" + g.toString(16);
	var bc = b.toString(16).length > 1 ? b.toString(16) : "0" + b.toString(16);

	return "#" + rc + gc + bc;
}

//////// CORD ////////

function convert(x, y) { // Convert X and Y cords to be based off of the center of the canvas
	return [LENGTH/2 + x, HEIGHT/2 - y];
}

function convertM(m) { // Converts mouse cords
	return {
		x: convert(m.x, m.y)[0]-LENGTH, 
		y: convert(m.x, m.y)[1]
	}
}


//////// CANVAS ////////

function clear() { // Clear the canvas
	c.clearRect(0, 0, LENGTH, HEIGHT);
}

//////// RENDERING ////////

function Render(renderm, save, scene) { // A class to render things on a canvas

	var rd = []; // Init a few vars
	var rend = rm;
	var s = save;
	var sc = scene;
	var imgArray = [];
	var pending = [];
	console.log(pending);

	renderm.assign(this); // Assign the render manager to this object

	this.setScene = function(s){ // Sets the current scene
		sc = s;
		s = true; // (Must turn on saving!)
	}

	this.setSave = function(t){ s = t; } // Sets the saving method

	this.getSave = function() { return save; } // Returns the current saving method

	this.box = function(x, y, x2, y2, col) { // Draws box at x, y to x2, y2 in color given
		c.fillStyle = col;
		this.rd = [convert(x, y), convert(x2, y2)];
		c.fillRect(this.rd[0][0], this.rd[0][1], this.rd[1][0] - this.rd[0][0], this.rd[1][1] - this.rd[0][1]);

		if (s) {
			rm.save(this.box, {x: x, y: y, x2: x2, y2: y2, col: col}, sc);
		}

	}

	this.line = function(x, y, x2, y2, col) { // Draws line from x, y to x2, y2 in color given
		this.rd = [convert(x, y), convert(x2, y2)];
		c.strokeStyle = col;
		c.moveTo(this.rd[0][0], this.rd[0][1]);
		c.lineTo(this.rd[1][0], this.rd[1][1]);
		c.stroke();

		if (s) {
			rm.save(this.line, {x: x, y: y, x2: x2, y2: y2, col: col}, sc);
		}
	}

	this.text = function(x, y, text, s, col, center) { // Renders text at x, y (top left corner) in size s and color col, and bool center
		this.rd = convert(x, y);
		c.font = s + "px Arial";
		c.textAlign = center ? "center" : "start";
		c.fillStyle = col;
		c.fillText(text, this.rd[0], this.rd[1]);

		if (s) {
			rm.save(this.text, {x: x, y: y, text: text, s: s, col: col, center: center}, sc);
		}
	}

	this.circle = function(x, y, r, col, fill) { // Renders a circle at x, y with radius r, color col, and fill bool
		this.rd = convert(x, y); 
		c.strokeStyle = col;
		c.fillStyle = col;
		c.beginPath();
		c.lineWidth = 0;
		c.arc(this.rd[0],this.rd[1],r,0,2*Math.PI)
		if (fill) c.fill();
		c.stroke();

		if (s) {
			rm.save(this.circle, {x: x, y: y, r: r, col: col, fill: fill}, sc);
		}
	}

	this.img = function(img_name, x, y) { // Renders image filed by name at x, y (converted)
		if (typeof imgArray[img_name] !== "undefined") {
			c.drawImage(imgArray[img_name], convert(x, y)[0], convert(x, y)[1]);

			if (s) {
				rm.save(this.img, {name: img_name, x: x, y: y}, sc);
			}
		}
	}

	this.registerImg = function(img_name, img_src) { // Registers image under name img_name from src img_scr
		if (typeof imgArray[img_name] === "undefined") {
			var img = new Image();
			img.onload = function() {
				imgArray[img_name] = img;
				console.log("Img loaded");
				pending.splice(pending.indexOf(img_name), 1);
			}
			pending.push(img_name);
			img.src = img_src;
			console.log("Loading img");
		}
	}

	this.imgsLoaded = function() { // Returns if all images are loaded
		return pending.length === 0;
	}
}

function RenderMang() { // A class to save scenes for easy re-rendering

	 // Init a few vars
	var data = [[]];

	this.assign = function(r){ this.r = r; } // Assigns Render Object

	this.getData = function(){ return data; } // Gets data

	this.save = function(method, d, scene){ // This method saves one command to a scene.

		var scN = data.length;	// Number of scenes

		if (scene-scN > 1) return; // Only let us create one scene at a time
		if (scene-scN === 1) data.push([]); // Addes new scene if needed

		if (method == r.box) { // Checks what method we are saving
			data[scene-1].push({m: "box", data: d});
		} else if (method == r.line) {
			data[scene-1].push({m: "line", data: d});
		} else if (method == r.text) {
			data[scene-1].push({m: "text", data: d});
		} else if (method == r.circle) {
			data[scene-1].push({m: "circle", data: d});
		} else if (method == r.img) {
			data[scene-1].push({m: "img", data: d});
		}

	}

	this.renderScene = function(num) {
		if (num > data.length) return;

		var sceneData = data[num-1]


		var store = this.r.getSave(); // Prevents from being recursive
		this.r.setSave(false);

		for(var index = 0; index < sceneData.length; index++) {
			var d = sceneData[index].data;
			
			if(sceneData[index].m == "box") {
				this.r.box(d.x, d.y, d.x2, d.y2, d.col);
			} else if (sceneData[index].m == "line") {
				this.r.line(d.x, d.y, d.x2, d.y2, d.col);
			} else if (sceneData[index].m == "text") {
				this.r.text(d.x, d.y, d.text, d.s, d.col, d.center);
			} else if (sceneData[index].m == "circle") {
				this.r.circle(d.x, d.y, d.r, d.col, d.fill);
			} else if (sceneData[index].m == "img") {
				this.r.img(d.name, d.x, d.y);
			}
			
		}

		this.r.setSave(store); // Restores save state
	}

	this.renderSceneOffset = function(num, xa, ya) {
		if (num > data.length) return;

		var sceneData = data[num-1]


		var store = this.r.getSave(); // Prevents from being recursive
		this.r.setSave(false);

		for(var index = 0; index < sceneData.length; index++) {
			var d = sceneData[index].data;
			
			if(sceneData[index].m == "box") {
				this.r.box(d.x+xa, d.y+ya, d.x2+xa, d.y2+ya, d.col);
			} else if (sceneData[index].m == "line") {
				this.r.line(d.x+xa, d.y+ya, d.x2+xa, d.y2+ya, d.col);
			} else if (sceneData[index].m == "text") {
				this.r.text(d.x+xa, d.y+ya, d.text, d.s, d.col, d.center);
			} else if (sceneData[index].m == "circle") {
				this.r.circle(d.x+xa, d.y+ya, d.r, d.col, d.fill);
			} else if (sceneData[index].m == "img") {
				this.r.img(d.name, d.x+xa, d.y+ya);
			}
			
		}

	}
}

//////// INPUT ////////

function Input(can){

	m = {
		x: 0,
		y: 0
	}

	this.c = can

	canvs.addEventListener('mousemove', function(e){
		var rect = canvs.getBoundingClientRect();

		e.preventDefault();

		m.x = e.clientX - rect.left;
		m.y = e.clientY - rect.top;

	});

	this.mousePosDirty = function(){
		return m;
	}

	this.mousePos = function(){
		return convertM(m);
	}

	this.onClick = function(cb){
		this.c.onclick = cb;
	}

}

init();


