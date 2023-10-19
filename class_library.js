function clone(obj)
{
  var newObj = (obj instanceof Array) ? [] : {};
  for (i in obj) {
    if (i == 'clone') continue;
    if (obj[i] && typeof obj[i] == "object") {
      newObj[i] = clone(obj[i]);//.clone();
    } else newObj[i] = obj[i];
  } return newObj;
}

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
     if (this[i]===obj) { return true; }
  }
  return false;
};

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        if ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Q.UI.Button.extend("TooltipButton", {
	init: function(p,callback)
	{

		this._super(Q._defaults(p||{}, {type: Q.SPRITE_UI | Q.SPRITE_FRIENDLY, dispTick: 0}),callback);
		if (this.p.layer == null)
			this.p.layer=0;
	},
	draw: function(ctx) {
		if (this.p.enableCondition != null)
			if (!this.p.enableCondition.call(this,this.p.param))
			{
				if (this.p.tooltip != null)
				{
					if (this.p.dispTick>=50)
					{
						Q.clearStage(3);
						this.p.tooltipObj.destroy();
					}
				}

				this.p.dispTick=0;
				return;
			}

		this._super(ctx);

		if (this.p.tooltip != null) // The tooltip is a Q.UI.Text, etc object
		{
			if (this.p.over)
			{
				this.p.dispTick++;
				if (this.p.dispTick==50)
				{
					if (!Q.stage(3))
						Q.stageScene(null,3);

					this.p.tooltipObj = new Q.OverlayElement({ex: mouseX, ey: mouseY,
						ew:320,
						style: { font: "400 "+globalTinyFont+" ditedregular",
							backgroundColor: "rgba(220,220,220,0.75)",
							border: 1, borderRadius: 5, boxShadow: "-5px 5px 5px #000"},
						html: this.p.tooltip});

					this.p.tooltipObj.p.ex=mouseX;
//					this.p.containerObj.p.x=mouseX+0.05*this.p.tooltipObj.p.w;

					if (this.p.tooltipObj.p.ex<10)
					{
						this.p.tooltipObj.p.ex=10;
	//					this.p.containerObj.p.x=this.p.tooltipObj.p.x+0.05*this.p.tooltipObj.p.w;
					}
					if (this.p.tooltipObj.p.ex+this.p.tooltipObj.p.ew>610)
					{
						this.p.tooltipObj.p.ex=610-this.p.tooltipObj.p.ew;
		//				this.p.containerObj.p.x=this.p.tooltipObj.p.x+0.05*this.p.tooltipObj.p.w;
					}
					this.p.tooltipObj.p.ey=mouseY-10;

					if (this.p.tooltipObj.p.ey>360) this.p.tooltipObj.p.ey=360;
					this.p.tooltipObj.refresh();
		//			this.p.containerObj.p.y=mouseY-10;

		//			Q.stage(3).insert(this.p.containerObj);
					Q.stage(3).insert(this.p.tooltipObj);
				}
			}
			else
			{
				if (this.p.dispTick>=50)
				{
					Q.clearStage(3);
					this.p.tooltipObj.destroy();
				}

				this.p.dispTick=0;
			}
		}
	},
	push: function() {

		if (this.p.enableCondition != null)
		{
			if (!this.p.enableCondition.call(this,this.p.param))
				return;
		}
		this._super();
	}
});

Q.TooltipButton.extend("GrowButton", {
	init: function(p,callback)
	{
		this._super(p,callback);
	},
	push: function() {
//		if (curLayer==this.p.layer)
			this._super();
	},
   draw: function(ctx) {
     this._super(ctx);
     if (this.p.over/* && (this.p.layer==curLayer)*/)
     {
     	if (this.p.bscale)
     		this.p.scale=1.2*this.p.bscale;
     	else
     		this.p.scale=1.2;

     	if (this.p.onHover!=null)
        {
//  		  if (!this.p.isHovering)
  		  {
  			  this.p.isHovering=true;
    		  this.p.onHover.call(this,this.p.param);
  		  }
    	}
     } else
     {
    	if (this.p.bscale)
    		this.p.scale=this.p.bscale;
    	else
    		this.p.scale=1.0;
		if (this.p.isHovering)
		{
			 this.p.isHovering=false;
			 if (this.p.deHover!=null)
				 this.p.deHover.call(this,this.p.param);
		}
	 }
   }
});

Q.MovingSprite.extend("OverlayElement",
{
   init: function(p)
   {
      this._super(p, { x:0,y:0,w:0,h:0,opacity: 1, type: Q.SPRITE_UI  });

//      Q.wrapper.style.overflow = "hidden";

      this.el = document.createElement("div");
      this.el.innerHTML = this.p.html;

      for (var attrname in this.p.style)
      {
         this.el.style[attrname]=this.p.style[attrname];
      }

      this.el.style.width=scaleFactor*this.p.ew+'px';
      this.el.style.height=scaleFactor*this.p.eh+'px';

      this.el.style.position="absolute";
      this.el.style.top=this.p.ey*scaleFactor+'px';
      this.el.style.left=this.p.ex*scaleFactor+'px';
      this.el.zIndex="1";
      this.el.id=this.p.id;
      this.el.className=this.p.className;

      Q.wrapper.appendChild(this.el);
      this.on("inserted",function(parent) {
         this.position();
         parent.on("destroyed",this,"remove");
         parent.on("clear",this,"remove");
      });
   },

   scroll: function(ammt) {
	   this.el.scrollTop+=ammt;
	   if (this.el.scrollTop<0) this.el.scrollTop=0;
	   if (this.el.scrollTop>this.el.scrollHeight) this.el.scrollTop=this.el.scrollHeight;
   },

   position: function() {
	  if (this.el)
	  {
		  this.el.style.top=this.p.ey*scaleFactor+'px';
		  this.el.style.left=this.p.ex*scaleFactor+'px';
	  }
   },

   refresh: function() {
	   this.el.innerHTML=this.p.html;
   },

   step: function(dt) {
     this._super(dt);
     this.position();
   },

   remove: function() {
     if(this.el) {
        Q.wrapper.removeChild(this.el);
        this.el= null;
     }},

   destroy: function() {
      this.remove();
      this._super();
    }

});

Q.Sprite.extend("DrawBuffer",
{
	init: function(props,defaultProps) {
		this.p = Q._extend({ 
        x: 0,
        y: 0,
        z: 0,
        angle: 0,
        buffer: null,
        type: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE
      },defaultProps);

      this.matrix = new Q.Matrix2D();
      this.children = [];
      Q._extend(this.p,props); 

      this.p.w=this.p.buffer.width;
      this.p.h=this.p.buffer.height;
      this.p.id = this.p.id || Q._uniqueId();

      this.refreshMatrix();
    },

     size: function(force) {
      if(force || (!this.p.w || !this.p.h)) { 
        if(this.asset()) {
          this.p.w = this.asset().width;
          this.p.h = this.asset().height;
        } 
      } 

      this.p.cx = (force || this.p.cx === void 0) ? (this.p.w / 2) : this.p.cx;
      this.p.cy = (force || this.p.cy === void 0) ? (this.p.h / 2) : this.p.cy;
    },

    // Get or set the asset associate with this sprite
    asset: function(name,resize) {
    	return this.p.buffer;
    },

    render: function(ctx) {
      var p = this.p;

      if(p.hidden) { return; }
      if(!ctx) { ctx = Q.ctx; }

      this.trigger('predraw',ctx);

      ctx.save();

        if(this.p.opacity !== void 0 && this.p.opacity !== 1) {
          ctx.globalAlpha = this.p.opacity;
        }

        this.matrix.setContextTransform(ctx);

        this.trigger('beforedraw',ctx);
        this.draw(ctx);
        this.trigger('draw',ctx);

      ctx.restore();
      
      this.trigger('postdraw',ctx);

      if(Q.debug) { this.debugRender(ctx); }

    },

    draw: function(ctx) {
      var p = this.p;
      if(p.buffer) {
        ctx.drawImage(p.buffer,0,0);
      }
    },
});

Q.UI.Text.extend("UpdateLabel", {
   init: function(p,defaultProps) {
      this._super(Q._defaults(p||{},defaultProps),{	textFunc: null, param: null, align: 'left'});
    },

    draw: function(ctx) {
      if (this.p.textFunc != null)
         this.p.label=this.p.textFunc.call(this,this.p.param);

      if (this.p.onHover!=null)
      {
		  if ( (mouseX>=this.p.x-this.p.w/2)&&(mouseX<=this.p.x+this.p.w/2) &&
				  (mouseY>=this.p.y-this.p.h/2)&&(mouseY<=this.p.y+this.p.h/2))
		  {
//			  if (!this.p.isHovering)
			  {
				  this.p.isHovering=true;
    			  this.p.onHover.call(this,this.p.param);
			  }
    	  }
		  else
		  {
			 if (this.p.isHovering)
			 {
				 this.p.isHovering=false;
				 if (this.p.deHover!=null)
					 this.p.deHover.call(this,this.p.param);
			 }
		  }
      }

      if(this.p.opacity === 0) { return; }

      if(this.p.oldLabel !== this.p.label) { this.calcSize(); }

      this.setFont(ctx);
      ctx.textAlign=this.p.align;
      if(this.p.opacity !== void 0) { ctx.globalAlpha = this.p.opacity; }
      for(var i =0;i<this.splitLabel.length;i++) {
        if(this.p.align === 'center') {
          ctx.fillText(this.splitLabel[i],0,-this.p.cy + i * this.p.size * 1.2);
        } else if(this.p.align === 'right') {
          ctx.fillText(this.splitLabel[i],0*this.p.cx*2,-this.p.cy + i * this.p.size * 1.2);
        } else {
          ctx.fillText(this.splitLabel[i],-0*this.p.cx,-this.p.cy +i * this.p.size * 1.2);
        }
      }

//      this._super(ctx);
    }
});
