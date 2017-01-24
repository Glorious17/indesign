function starten(){
	
	var zrwidth = 700;
	var backgroundWidth = 8322;
	var clicked = false;
	
	function getMousePosition(canvas, ev)
	{
		var rect = canvas.getBoundingClientRect();
		return {
			x: ev.clientX - rect.left,
			y: ev.clientY - rect.top
		};
	}
	
	Tangle.classes.MainView = {
		
		initialize: function(element, options, tangle, time, zeitZaehler, oldTime, sS, iS)
		{
			this.tangleObject = tangle;
			this.ctx = element.getContext("2d");
			
			this.bigWorldMap = new Image();
			this.speedy = new Image();
			this.speechbubble = new Array();
		
			this.bigWorldMap.src = "assets/landschaft.png";
			this.speedy.src = "assets/graphics/INDE_Speedy.png";
		
			for(i = 1; i < 15; i++)
			{
				var sb = new Image();
				sb.src = "assets/speechbubble/speechbubble_" + i + ".png";
				this.speechbubble.push(sb);
			}
			
			element.onclick = function(ev)
			{
				pos = getMousePosition(element, ev);
				if(!clicked)
				{
					var zZ = tangle.getValue(zeitZaehler);
					if(pos.x <= 200 && zZ > 0)
					{
						zZ--;
						keyframe(zZ);
					}
					else if(pos.x >= (element.width - 200) && zZ < 13)
					{
						zZ++;
						keyframe(zZ);
					}
				}
				
			}
			
			function keyframe(zZ){
				var divident;
				switch(zZ)
				{
					case 0:
						divident = 4.5;
						break;
					case 1:
						divident = 4;
						break;
					case 2:
						divident = 3.46;
						break;
					case 3:
						divident = 2.5;
						break;
					case 4:
						divident = 0.55;
						break;
					case 5:
						divident = 0.46;
						break;
					case 6:
						divident = 0.38;
						break;
					case 7:
						divident = 0.35;
						break;
					case 8:
						divident = 0.25;
						break;
					case 9:
						divident = 0.235;
						break;
					case 10:
						divident = 0.13;
						break;
					case 11:
						divident = 0.125;
						break;
					case 12:
						divident = 0.065;
						break;
					case 13:
						divident = 0.0025;
						break;
				}
				clicked = true;
				tangle.setValue(zeitZaehler, zZ);
				tangle.setValue(oldTime, tangle.getValue(time));
				tangle.setValue(time, (1 - (divident/4.6)) * zrwidth);
			}
		},
		
		update: function(element, t, zZ, ot, sS, iS)
		{
			var context = this.ctx;
			var isMinus = t - ot;
			var step = 0;
			var opacity = 0;
			var positionWorldmap;
			var tangleObject = this.tangleObject;
			
			bigWorldMap = this.bigWorldMap;
			speedy = this.speedy;
			speechbubble = this.speechbubble;
			
			if(!clicked){
				positionWorldmap = -(backgroundWidth-1680)*(t/zrwidth);
				draw(positionWorldmap, t);
			}else{
				if(isMinus > 0){
					sS = false;
					var animation = setInterval(function()
					{
						positionWorldmap = -(backgroundWidth-1680)*(ot/zrwidth);
						draw(positionWorldmap, ot);
						if(step < 3 && (t-ot) > 30){step+=0.1;} else if((t-ot) <= 30 && (t-ot) > 0.1){step-=0.1;};
						if(step < 0.1){step = 0.1;};
						ot+=step;
						if(ot >= t){
							sS = true;
							tangleObject.setValues({ intervallStarted:false , oldTime:t });
							draw(positionWorldmap, ot);
							clearInterval(animation);
						}
					}, 10);
					
				}else if(isMinus < 0){
					sS = false;
					var animation = setInterval(function()
					{
						positionWorldmap = -(backgroundWidth-1680)*(ot/zrwidth);
						draw(positionWorldmap, ot);
						if(step < 3 && (ot-t) > 30){step+=0.1;} else if((ot-t) <= 30 && (ot-t) > 0.1){step-=0.1;};
						if(step < 0.1){step = 0.1;};
						ot-=step;
						if(ot <= t){
							sS = true;
							tangleObject.setValues({ intervallStarted:false , oldTime:t });
							draw(positionWorldmap, ot);
							clearInterval(animation);
						}
					}, 10);
					
				}
			}
			
			function draw(value_wm, value_speedy)
			{
				context.globalAlpha = 1.0;
				context.drawImage(bigWorldMap,0+value_wm,0);
				context.drawImage(speedy, 0+((value_speedy/zrwidth)*(element.width - 550)), 500);
				if(sS)
				{
					if(!tangleObject.getValue("intervallStarted"))
					{
						opacity = 0;
						tangleObject.setValue("intervallStarted", true);
						var animation = setInterval(function()
						{
							opacity += 0.1;
							draw(positionWorldmap, t);
							if(opacity >= 1)
							{
								clicked = false;
								clearInterval(animation);
							}
						}, 50);
					}
					context.globalAlpha = opacity;
					context.drawImage(speechbubble[zZ], 150+((t/zrwidth)*(element.width - 550)), 200);
				}
			}
		}
	};
	
	Tangle.classes.Zeitregler = {
		
		initialize: function(element, options, tangle, time)
		{
			this.time = 0;
			this.md = false;
			
			this.worldmap = new Image();
			this.selector = new Image();
			
			this.worldmap.src = "assets/worldmap.jpg";
			this.selector.src = "assets/selector.png";
			
			element.onmousedown = function(){this.md = true; tangle.setValue("standStill", false);};
			element.onmouseup = function(){this.md = false; tangle.setValue("standStill", true); tangle.setValue("intervallStarted", false);};
			element.onmouseleave = function(){ if(this.md){ tangle.setValue("standStill", true); tangle.setValue("intervallStarted", false); this.md = false; }};
			element.onmousemove = function move(ev){
				if(this.md){
					pos = getMousePosition(element, ev);
					if(pos.x < 50){
						this.time = 0;
						tangle.setValue(time, this.time);
					}else if(pos.x >= 50 && pos.x < (zrwidth + 50)){
						this.time = pos.x - 50;
						tangle.setValue(time, this.time);
					}else if(pos.x >= (zrwidth+50)){
						this.time = zrwidth;
						tangle.setValue(time, this.time);
					}
					tangle.setValue("zeitZaehler", parseInt( (tangle.getValue(time) /70) ));
					if(this.time >= 0 && this.time < ((1 - (4/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 0);
						
					}else if(this.time >= ((1 - (4/4.6)) * zrwidth) && this.time < ((1 - (3.46/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 1);
						
					}else if(this.time >= ((1 - (3.46/4.6)) * zrwidth) && this.time < ((1 - (2.5/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 2);
						
					}else if(this.time >= ((1 - (2.5/4.6)) * zrwidth) && this.time < ((1 - (0.55/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 3);
						
					}else if(this.time >= ((1 - (0.55/4.6)) * zrwidth) && this.time < ((1 - (0.46/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 4);
						
					}else if(this.time >= ((1 - (0.46/4.6)) * zrwidth) && this.time < ((1 - (0.38/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 5);
						
					}else if(this.time >= ((1 - (0.38/4.6)) * zrwidth) && this.time < ((1 - (0.35/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 6);
						
					}else if(this.time >= ((1 - (0.35/4.6)) * zrwidth) && this.time < ((1 - (0.25/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 7);
						
					}else if(this.time >= ((1 - (0.25/4.6)) * zrwidth) && this.time < ((1 - (0.235/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 8);
						
					}else if(this.time >= ((1 - (0.235/4.6)) * zrwidth) && this.time < ((1 - (0.13/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 9);
						
					}else if(this.time >= ((1 - (0.13/4.6)) * zrwidth) && this.time < ((1 - (0.125/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 10);
						
					}else if(this.time >= ((1 - (0.125/4.6)) * zrwidth) && this.time < ((1 - (0.065/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 11);
						
					}else if(this.time >= ((1 - (0.065/4.6)) * zrwidth) && this.time < ((1 - (0.0025/4.6)) * zrwidth))
					{
						tangle.setValue("zeitZaehler", 12);
						
					}else if(this.time >= ((1 - (0.0025/4.6)) * zrwidth) && this.time <= zrwidth)
					{
						tangle.setValue("zeitZaehler", 13);
					}
				}
			}
			this.ctx = element.getContext("2d");
		},
		
		update: function (element, value)
		{
			this.draw(value);
		},
		
		draw: function (value)
		{
			var context = this.ctx;
			context.clearRect(0, 0, 800, 100);
			context.drawImage(this.worldmap,10,0);
			context.drawImage(this.selector,0+value,0);
			
		}
	};
	
	var tangle = new Tangle (document.getElementById("tangleObj"), {
		initialize: function ()
		{
			this.time = 0;
			this.zeitZaehler = 0;
			this.oldTime = 0;
			this.standStill = true;
			this.intervallStarted = false;
		},
		update:     function () {}
	});
}