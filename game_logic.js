var circX = 16, circY = 16

var circuit_links = []
var circuit_nodes = []
var potential = []
var nodes = []
var pulses = []

var GameMoving = false

function getLinkedCell(x,y,k)
{
    switch(k)
    {
        case 0:
            xx = x
            yy = (y-1+circY)%circY
            break;
        case 1:
            yy = y
            xx = (x+1)%circX
            break;
        case 2:
            xx = x
            yy = (y+1)%circY
            break;
        case 3:
            yy = y
            xx = (x-1+circX)%circX
            break;                                
    }
    
    return [xx,yy]
}

function distributePotential()
{
    for (x=0;x<circX;x++)
    {
        for (y=0;y<circY;y++)
        {
            // Find all source nodes and add potential deltas across them
            if (nodes[x][y] == 1) // Left-right source node
            {
                if (circuit_links[x][y][3])
                {
                    xx = (x-1+circX)%circX
                    potential[xx][y] -= 1
                    potential[x][y] += 1
                }
            }
            
            for (k=0;k<4;k++) // Propagate potential along links
            {
                if (circuit_links[x][y][k])
                {
                    [xx,yy] = getLinkedCell(x,y,k)
                    
                    avg = (potential[x][y] + potential[xx,yy])/2.0
                    
                    potential[x][y] = 0.75*potential[x][y] + 0.25*avg
                    potential[xx][yy] = 0.75*potential[xx][yy] + 0.25*avg
                }
            }
        }
    }
}

function doNode(node_id, pulse)
{
    // Node logic here...
    
    switch (node_id)
    {
    }
}

Q.Sprite.extend("Pulse",
{
	init: function(props,defaultProps) {
		this.p = Q._extend({ 
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
        from: 0,
        to: 2,
        u: 0,
        type: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE
      }, defaultProps);
    },
    
    set_position: function() {
        this.p.x = 64*this.p.tx + 32
        this.p.y = 64*this.p.ty + 32
        
        if (this.p.u<0.5)
        {
            du = 0.5 - this.p.u
            switch (this.p.from)
            {
                case 0: // From top
                    this.p.y -= 64*du;
                    break;
                case 1: // From right
                    this.p.x += 64*du;
                    break;                    
                case 2: // From bottom
                    this.p.y += 64*du;
                    break;
                case 3: // From left
                    this.p.x -= 64*du;
                    break;
            }
        }
        else
        {
            du = this.p.u - 0.5;
            switch (this.p.to)
            {
                case 0: // To top
                    this.p.y -= 64*du;
                    break;
                case 1: // To right
                    this.p.x += 64*du;
                    break;                    
                case 2: // To bottom
                    this.p.y += 64*du;
                    break;
                case 3: // To left
                    this.p.x -= 64*du;
                    break;
            }
        }
    },
    
    step: function(dt) {
        if (GameMoving)
        {
            if ((this.p.u<0.5)&&(this.p.u+dt>=0.5)) // Trigger node/beat
            {
                if (nodes[this.p.tx][this.p.ty] >= 0)
                {
                    doNode(nodes[this.p.tx][this.y.ty], this)
                }
            }
            
            this.p.u += dt            
            
            if (this.p.u>1.0)
            {
                this.p.u -= 1.0
                
                switch(this.p.to)
                {
                    case 0: 
                        this.p.ty = (this.p.ty - 1 + circY)%circY
                        this.p.from = 2
                        break;
                    case 1: 
                        this.p.tx = (this.p.tx + 1)%circX
                        this.p.from = 3
                        break;
                    case 2: 
                        this.p.ty = (this.p.ty + 1)%circY
                        this.p.from = 0
                        break;
                    case 3: 
                        this.p.tx = (this.p.tx - 1 + circX)%circX
                        this.p.from = 1
                        break;
                }
                
                // Now figure out where we're going to in the new cell
                links = circuit_links[this.p.tx][this.p.ty]                               
                best = -1
                best_delta = -1
                
                tx = this.p.tx
                ty = this.p.ty
                
                for (k=0;k<4;k++)
                {
                    if (links[k] && (k != this.p.from))
                    {
                        /*
                        switch(k)
                        {
                            case 0:
                                xx = tx
                                yy = (ty-1+circY)%circY
                                break;
                            case 1:
                                yy = ty
                                xx = (tx+1)%circX
                                break;
                            case 2:
                                xx = tx
                                yy = (ty+1)%circY
                                break;
                            case 3:
                                yy = ty
                                xx = (tx-1+circX)%circX
                                break;                                
                        }
                        */
                        [xx,yy] = getLinkedCell(tx,ty,k)
                        
                        delta = potential[tx][ty]-potential[xx][yy]
                        
                        if (delta>best_delta)
                        {
                            best_delta = delta
                            best = k
                        }
                    }
                }
                
                this.p.to = best                
            }
        }        
    },
});
