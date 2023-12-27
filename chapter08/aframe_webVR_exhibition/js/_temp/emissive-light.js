AFRAME.registerComponent("emissive-light", {
	schema: {},
	init: function(){
		this.createBacklight = this.createBacklight.bind(this);
		this.getAverageColor = this.getAverageColor.bind(this);
		this.getPixelData    = this.getPixelData.bind(this);
		this.updateBacklight = this.updateBacklight.bind(this);
		this.pixelData;

		const canvas   = document.createElement("canvas");
		this.context   = canvas.getContext("2d");
		this.detail    = 1;
		this.backlight = this.createBacklight();
	},
	tick: function(){
		this.updateBacklight();
	},//tick
	createBacklight: function(){
		const light = document.createElement("a-light");
		light.setAttribute("position", "0 0 -0.1");
		light.setAttribute("intensity", "1")
		light.setAttribute("angle", "-180");
		light.setAttribute("distance", "20");
		light.setAttribute("type", "spot");
		this.el.appendChild(light);
		return light;
	},//createBacklight
	updateBacklight: function(){
		if(!this.frame || !this.height || !this.width){
			const material = this.el.getOrCreateObject3D('mesh').material;
			if(material){
				const map = material.map;
				if(map){
					const image = map.image;
					if(image){
						this.frame  = image;
						this.height = image.naturalHeight || image.videoHeight;
						this.width  = image.naturalWidth || image.videoWidth;
					}
				}
			}
		} else {
			const frame          = this.el.getOrCreateObject3D("mesh").material.map.image; //SEE HOW MUCH OF THIS YOU CAN STORE
			const pixelData      = this.getPixelData(frame);
			//const saturatedFrame = this.saturate(pixelData, 0.05);
			const color          = this.getAverageColor(pixelData)
			this.backlight.object3D.children[0].color = color;
		}
	},//updateBacklight
	getAverageColor: function(pixels){
		const data      = pixels.data;
		const length    = data.length;
		const blockSize = 1;
		const rgb       = { r: 0, g: 0, b: 0 };

		let count = 0; let i = -4;
		while ( (i += blockSize * 4) < length ) {
	        ++count;
	        rgb.r += data[i];
	        rgb.g += data[i+1];
	        rgb.b += data[i+2];
	    }
	    
	    // ~~ used to floor values
	    rgb.r = ~~(rgb.r/count);
	    rgb.g = ~~(rgb.g/count);
	    rgb.b = ~~(rgb.b/count);
	    return rgb;
	},//getAverageColor
	getPixelData: function(frame){
		this.context.drawImage(
			frame,
			0, 0,
			this.width, this.height
		);
		return(this.context.getImageData(
			0, 0,
			this.width, this.height
		));
	},//getPixelData
});