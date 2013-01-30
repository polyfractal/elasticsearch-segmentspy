function getGrapher() {
	var grapher =  {
	
		/* the property names on the data objects that we'll get data from */
		propertyNames : ["num_docs", "deleted_docs"],
	 
		init : function (chartId) {
			this.chartId = chartId;
			this.chartHeight = parseInt(document.getElementById(this.chartId).style.height);
			this.chartWidth = parseInt(document.getElementById(this.chartId).style.width);
			this.ceiling = 200;
			this.y = d3.scale.linear().domain([0, this.ceiling]).range([0, this.chartHeight]);
		},

		/**
		* Create an empty shell of a chart that bars can be added to
		*/
		displayStackedChart : function () {
			// create an SVG element inside the div that fills 100% of the div
			var vis = d3.select("#" + this.chartId).append("svg:svg").attr("width", "100%").attr("height", "100%")
			// transform down to simulate making the origin bottom-left instead of top-left
			// we will then need to always make Y values negative
			.append("g").attr("class","barChart").attr("transform", "translate(0, " + this.chartHeight + ")"); 
		},
		
		/**
		* Add or update a bar of data in the given chart
		*
		* The data object expects to have an 'id' property to identify itself (id == a single bar)
		* and have object properties with numerical values for each property in the 'propertyNames' array.
		*/
		addData : function (data) {

			// if data already exists for this data ID, update it instead of adding it
			var existingBarNode = document.querySelectorAll("#" + this.chartId + "_" + data.id);
			//console.log(existingBarNode.length);
			if(existingBarNode.length > 0) {
				var existingBar = d3.select("#" + this.chartId + "_" + data.id);
				// reset the decay since we received an update
				existingBar.transition().duration(100)
					.attr("style", "opacity:1.0");
				// update the data on each data point defined by 'propertyNames'
				for(index in this.propertyNames) {
					existingBar.select("rect." + this.propertyNames[index])
						.transition().ease("linear").duration(300)
						.attr("y", this.barY(data, this.propertyNames[index])) 
						.attr("height", this.barHeight(data, this.propertyNames[index])); 
				}
			} else {
				// it's new data so add a bar
				var barDimensions = this.updateBarWidthsAndPlacement();

				// select the chart and add the new bar
				var barGroup = d3.select("#" + this.chartId).selectAll("g.barChart")
					.append("g")
						.attr("class", "bar")
						.attr("id", this.chartId + "_" + data.id)
						.attr("style", "opacity:1.0");

				// now add each data point to the stack of this bar
				for(index in this.propertyNames) {
					barGroup.append("rect")
						.attr("class", this.propertyNames[index])
						.attr("width", (barDimensions.barWidth-1)) 
						.attr("x", function () { return (barDimensions.numBars-1) * barDimensions.barWidth;})
						.attr("y", this.barY(data, this.propertyNames[index])) 
						.attr("height", this.barHeight(data, this.propertyNames[index])); 
				}

				// setup an interval timer for this bar that will decay the coloring
				/*
				barGroup.styleInterval = setInterval(function() {
						var theBar = document.getElementById(chartId + "_" + data.id);
						if(theBar == undefined) {
							clearInterval(barGroup.styleInterval);
						} else {
							if(theBar.style.opacity > 0.2) {
								theBar.style.opacity = theBar.style.opacity - 0.05;	
							}
						}
					}, 1000);
				*/
							//console.log("set interval: " + barGroup.styleInterval);
			}
		},
		
		/**
		* Remove a bar of data in the given chart
		*
		* The data object expects to have an 'id' property to identify itself (id == a single bar)
		* and have object properties with numerical values for each property in the 'propertyNames' array.
		*/
		removeData : function (barId) {
			var existingBarNode = document.querySelectorAll("#" + this.chartId + "_" + barId);
			if(existingBarNode.length > 0) {
				// bar exists so we'll remove it
				var barGroup = d3.select("#" + this.chartId + "_" + barId);
				barGroup
					.transition().duration(200)
					.remove();
			}
		},

	
		/**
		* Update the bar widths and x positions based on the number of bars.
		* @returns {barWidth: X, numBars:Y}
		*/
		updateBarWidthsAndPlacement : function () {
			/**
			* Since we dynamically add/remove bars we can't use data indexes but must determine how
			* many bars we have already in the graph to calculate x-axis placement
			*/
			var numBars = document.querySelectorAll("#" + this.chartId + " g.bar").length + 1;

			// determine what the width of all bars should be
			var barWidth = this.chartWidth/numBars;
			if(barWidth > 50) {
				barWidth=50;
			}

			// reset the width and x position of each bar to fit
			var barNodes = document.querySelectorAll(("#" + this.chartId + " g.barChart g.bar"));
			for(var i=0; i < barNodes.length; i++) {
				d3.select(barNodes.item(i)).selectAll("rect")
					//.transition().duration(10) // animation makes the display choppy, so leaving it out
					.attr("x", i * barWidth)
					.attr("width", (barWidth-1));
			}

			return {"barWidth":barWidth, "numBars":numBars};
		},

		/*
		* Function to calculate the Y position of a bar
		*/
		barY : function (data, propertyOfDataToDisplay) {
			/*
			* Determine the baseline by summing the previous values in the data array.
			* There may be a cleaner way of doing this with d3.layout.stack() but it
			* wasn't obvious how to do so while playing with it.
			*/
			var baseline = 0;
			for(var j=0; j < index; j++) {
				baseline = baseline + data[this.propertyNames[j]];
			}
			// make the y value negative 'height' instead of 0 due to origin moved to bottom-left
			return -this.y(baseline + data[propertyOfDataToDisplay]);
		},

		/*
		* Function to calculate height of a bar
		*/
		barHeight : function (data, propertyOfDataToDisplay) {
			return data[propertyOfDataToDisplay];
		},

		// used to populate random data for testing
		randomInt : function (magnitude) {
			return Math.floor(Math.random()*magnitude);
		},
		

	};
	return grapher;
}

	

	

	

	
	

	

	/* initialize the chart without any data */
	//displayStackedChart("graph");

	/* kick off a continual interval timer to simulate the ongoing addition and update of data */
	//setInterval(function() {
	//		addData("graph", {"id":"v"+randomInt(150), "a":(randomInt(50)+100), "b":randomInt(50), "c":randomInt(40)});
	//	}, 20);

	/* kick off a continual interval timer to simulate the occasional removal of data */
	//setInterval(function() {
		// we want removals to be somewhat bursty, so we'll randomize how many we remove
	//	var numToRemove = randomInt(20);
	//	for(var r=0; r<numToRemove; r++) {
	//		removeData("graph", "v"+randomInt(150));
	//	}
	//	}, 5000);

