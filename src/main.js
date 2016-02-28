var rm;
var r;
var can = document.getElementById("myCanvas");

function init(){
	rm = new RenderMang();
	r = new Render(rm, true, 1);
	rm.assign(r);
}

init();


//Register Images

r.registerImg("grass", "assets/grass.png");
r.registerImg("player", "assets/person.png");

function waitUntilLoaded(){
	if(!r.imgsLoaded()){
		setTimeout(waitUntilLoaded, 100);
		console.log("Loop");
	} else {
		main();
	}
}

waitUntilLoaded();

function main(){
	for(y = 0; y<20; y++){
		for(x = 0; x<20; x++){
			r.img("grass", -400+40*x, 200-20*y);
		}
	}

	r.setScene(2);

	r.img("player", 0, 0);
}

var Person = {
	x: 0,
	y: 0
}

var Keycodes = {
	38: "up",
	40: "down",
	37: "left",
	39: "right"
}

function movePlayer(p, e, s) {
	if (Keycodes[e] == "up") {
		p.y += s;
	} else if (Keycodes[e] == "down") {
		p.y -= s;
	} else if (Keycodes[e] == "left") {
		p.x -= s;
	} else if (Keycodes[e] == "right") {
		p.x += s;
	}
}

function keyd(e){
	movePlayer(Person, e.keyCode, 10);
	clear();
	rm.renderScene(1);
	rm.renderSceneOffset(2, Person.x, Person.y);
}

window.addEventListener("keydown", keyd, true);
