$(function(){
    google.load("visualization", "1", {packages:["corechart"]});;
});

function getGrapher() {

	var grapher =  {

		options : {
			title: 'Segments',
			hAxis: {title: 'Segments', titleTextStyle: {color: 'red'}},
			vAxis: {logScale: true},
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