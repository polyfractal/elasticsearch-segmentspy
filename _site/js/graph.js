$(function(){
    google.load("visualization", "1", {packages:["corechart"]});
    //google.setOnLoadCallback(drawChartAjax);
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
			//google.load("visualization", "1", {packages:["corechart"]});
			//google.setOnLoadCallback(this.drawChart);
			this.chart = new google.visualization.ColumnChart(document.getElementById(divId));
			
		},
		
		setData : function(data) {
			this.segments = google.visualization.arrayToDataTable(data);	
		}		
		
	};
	
	
	return grapher;
		
};