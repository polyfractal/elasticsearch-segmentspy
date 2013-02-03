$(function(){
    google.load("visualization", "1", {packages:["corechart"]});;
});

function getGrapher() {

	var grapher =  {
//vAxis: {logScale: false},
		options : {
			title: 'Segments',
			hAxis: {title: 'Segments', titleTextStyle: {color: 'red'}},
			
			isStacked: true,
			vAxes: {0: {logScale: true},
					1: {logScale: true, maxValue:1000000}},
			series:{
			   0:{targetAxisIndex:0},
			   1:{targetAxisIndex:0}},
			bar: {groupWidth: "90%"},
		},
		
		drawChart : function () {
			this.chart.draw(this.segments, this.options);
		},
		
		init :  function(divId) {
			this.chart = new google.visualization.ColumnChart(document.getElementById(divId));
			
		},
		
		setData : function(data) {
			this.segments = google.visualization.arrayToDataTable(data);	
		}		
		
	};
	
	
	return grapher;
		
};