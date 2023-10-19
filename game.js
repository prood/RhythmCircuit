var XR,YR;

XR=1800;
YR=1200;

var iXR=window.innerWidth, iYR=window.innerHeight;

var sf1=iXR/XR,sf2=iYR/YR;

if (sf1>sf2) scaleFactor=sf2; else scaleFactor=sf1;

scaleFactor=1;

var wrapper=document.getElementById("Wrapper");
var canvas=document.getElementById("gameCanvas");

var Q = Quintus().include("Sprites, Scenes, Anim, Input, UI, Touch, 2D, Audio")
                 .setup("gameCanvas")
		 .touch();

Q.wrapper.style.width=XR*scaleFactor+"px";
Q.wrapper.style.height=XR*scaleFactor+"px";

var globalSmallFont=Math.floor(18*scaleFactor)+"px";
var globalMediumFont=Math.floor(22*scaleFactor)+"px";

canvas.style.width=XR*scaleFactor+"px"; 
canvas.style.height=YR*scaleFactor+"px";

Q.cssWidth=XR*scaleFactor;
Q.cssHeight=YR*scaleFactor;

var currentObj = null;

var circuit_links = []
var circuit_nodes = []

var tiles = null;

linkLookup = [
    1, // 0 = Empty tile
    4, // 1 = Top wire on
    3, // 2 = Right wire on
    10, // 3 = Top + Right wire
    5, // 4 = Bottom wire
    7, // 5 = Bottom + Top wire
    11, // 6 = Bottom + Right wire
    13, // 7 = Bottom + Top + Right
    2, // 8 = Left Wire
    8, // 9 = Left + Top
    6, // 10 = Left + Right
    14, // 11 = Left + Right + Top
    9, // 12 = Left + Bottom
    15, // 13 = Left + Bottom + Top
    12, // 14 = Left + Bottom + Right
    16, // 15 = Left + Bottom + Top + Right
];

Q.TileLayer.extend("TiledTileLayer",
{
	init: function(props)
	{
		this._super(props);		
	},
	
	createTiles: function(level)
	{
		var data = [];
		
		this.p.rows = level.layers[0].height;
		this.p.cols = level.layers[0].width;
		
		for (var j=0;j<this.p.rows;j++)
		{
			data[j]=[];
			for (var i=0;i<this.p.cols;i++)
			{
				data[j][i]=level.layers[0].data[i+j*this.p.cols]-1;
				if (data[j][i]<0) data[j][i]=1;
			}
		}

		this.p.tiles = data;
		this.p.w = this.p.cols * this.p.tileW;
		this.p.h = this.p.rows * this.p.tileH;

	}
});

function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas; //this;

    var px=event.clientX,py=event.clientY;
    
    // if its a touch event, we need to do something else here to get the primary touch
    if ((event.type == "touchstart") || (event.type == "touchmove"))
    {
    	px=event.touches[0].clientX; 
    	py=event.touches[0].clientY;
    }
    
    do
    {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while (currentElement = currentElement.offsetParent);

    canvasX = px - totalOffsetX;
    canvasY = py - totalOffsetY;

    return {x:canvasX/scaleFactor, y:canvasY/scaleFactor};
}

HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

window.onmousemove = function(e) {
  var coords=canvas.relMouseCoords(e);
  mouseX=coords.x; mouseY=coords.y;
  
  var stage=Q.stage(0);
  
  var obj = stage.locate(mouseX, mouseY, Q.SPRITE_FRIENDLY);
  
  if (currentObj) { currentObj.p.over = false; }
  if (obj) {
    currentObj = obj;
    obj.p.over = true;
   }  
};

window.onmousedown = function(e) {
    mouseDown=true;
    
    if (doClick(e))
    {
    	return false;
    }
};

window.onmouseup = function(e) {
    mouseDown=false;
};


/* Loading assets */

window.onload = function() {
	Q.enableSound();

	var assetString = "tiles.png, wire.png, branch.png";
	
	Q.load(assetString, function() {
        Q.sheet("tiles","tiles.png", { tilew: 64, tileh: 64 });
		        
		Q.stageScene("Main",0);
	});
};

function stageStep(dt)
{
}

function doClick(e)
{
    if ((mouseX>32)&&(mouseY>32)&&(mouseX<32+16*64)&&(mouseY<32+16*64))
    {
        tilex = (mouseX-32)/64;
        tiley = (mouseY-32)/64;
        
        ofsx = (tilex - Math.floor(tilex))
        ofsy = (tiley - Math.floor(tiley))
        
        tilex = Math.floor(tilex)
        tiley = Math.floor(tiley)
        
        if ((ofsx>=0.45)&&(ofsx<=0.55))
        {
            if ((ofsy>=0.45)&&(ofsy<=0.55)) // Center, replace node
            {
            }
            else if (ofsy<0.45) // Top wire
            {
                circuit_links[tilex][tiley][0] = 1-circuit_links[tilex][tiley][0];
            }
            else if (ofsy>0.55) // Bottom wire
            {
                circuit_links[tilex][tiley][2] = 1-circuit_links[tilex][tiley][2];
            }
        }
        else if ((ofsy>=0.45)&&(ofsy<=0.55))
        {
            if (ofsx<0.45) // Left wire
            {
                circuit_links[tilex][tiley][3] = 1-circuit_links[tilex][tiley][3];
            }
            else if (ofsx>0.55) // Right wire
            {
                circuit_links[tilex][tiley][1] = 1-circuit_links[tilex][tiley][1];
            }
        }
        
        console.log(circuit_links[tilex][tiley])
        recalculateTiles();        
    }
}

function recalculateTiles()
{
    for (i=0;i<16;i++)
    {
        for (j=0;j<16;j++)
        {
            links = circuit_links[i][j];
            
            links = linkLookup[links[0]+2*links[1]+4*links[2]+8*links[3]];
            tiles.setTile(i,j, links)
        }
    }
}

Q.scene("Main",function (stage) {		
    for (i=0;i<16;i++)
    {
        circuit_links[i] = []
        circuit_nodes[i] = []
        
        for (j=0;j<16;j++)
        {
            circuit_nodes[i][j] = 0;
            circuit_links[i][j] = [];
            for (k=0;k<4;k++)
            {
                circuit_links[i][j][k] = 0;
            }
        }
    }

	tiles = stage.insert(new Q.TileLayer({
		type: Q.SPRITE_DEFAULT,
        tileW: 64,
        tileH: 64,
		sheet: "tiles"
	}));
    
    data = []
    for (i=0;i<16;i++)
    {
        data[i] = []
        for (j=0;j<16;j++)
        {
            data[i][j] = 1
        }
    }
    tiles.p.rows = 16
    tiles.p.cols = 16
    
    tiles.p.tiles = data
    tiles.p.w = tiles.p.cols * tiles.p.tileW;
    tiles.p.h = tiles.p.rows * tiles.p.tileH;
    
	stage.add("viewport");
	stage.viewport.scale=1;

	viewX=XR/2-32; viewY=YR/2-32;
	oViewX=viewX; oViewY=viewY;
	
	stage.viewport.centerOn(viewX, viewY);
    
    /*
    stage.insert(new Q.GrowButton({
            x: 8, y: 8,
            asset: "wire.png"
        }, function() 
        {
            console.log("Test"); 
        }));
	
    stage.insert(new Q.GrowButton({
            x: 8, y: 8+64,
            asset: "branch.png"
        }, function() 
        {
            console.log("Test 2"); 
        }));
	*/
    
	stage.on("step", stageStep);
	
	offStage=false;
});
