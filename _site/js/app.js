$(document).ready(function () {
	(function($) {

		
		
		var global = {};
		global.graphTemplate = Handlebars.compile($("#graph-template").html());
		
		//global.host = document.domain;
		global.host = window.location.host;
		global.graphs = [];
		console.log(global.host);
		
		var app = Sammy("body", function() {
			
			this.use('Handlebars', 'hb');
			//this.use('Session');

			////////////////////////////////////////
			this.helpers({
			
				//@param index 
				//Optional value to specify one or more indices to query.  Defaults to all indices
				poll: function(index) {
					
					var formattedIndex = index;
					
					if (typeof index === 'undefined') {
						formattedIndex = "/";
					} else {
						formattedIndex += "/";
					}
				
					var context = this;	
					
					global.pollID = setTimeout(function(){
						$.getJSON("http://" + global.host + "/" + formattedIndex + "_segments/", function(data) {
							var segments = {};
							$.each(data.indices[index].shards, function (shardKey, shardValue) {
								$.each(shardValue, function(shardKeyPR, shardValuePR) {
									
									
									$.each(shardValuePR.segments, function (k,v) {
										var temp = {};
											temp.id = k;
											temp.num_docs = v.num_docs;
											temp.deleted_docs = v.deleted_docs;
									
										
										
										
										//console.log(temp);
										
										if (typeof segments[shardValuePR.routing.node] === 'undefined')
											segments[shardValuePR.routing.node] = [];
										
										segments[shardValuePR.routing.node].push(temp);
									});
									//console.log(v);
								});
							});
							
							
							$.each(segments, function (node,segments) {
								$.each (segments, function (id, value) {
									global.graphs[node].addData(value);
								});
							});
							
							console.log(data);
							console.log(segments);
							//context.poll(index);
						});
					}, 2000);
					
				},				
			});
			///////////////////////////////////////////// End Helpers

			
			this.get('#/', function(context) {
				
				var loadOptions = 	{type: 'get', dataType: 'json'};
				var stateOptions = "?filter_metadata=true&filter_blocks";
				context.load("http://" + global.host + "/_cluster/state" + stateOptions, loadOptions)
					.then(function(state) {
						console.log(state);
						
						context.cluster_name = state.cluster_name;
						context.master_node = state.master_node;
						//context.nodes = state.nodes;
						context.nodes = [];
						$.each(state.nodes, function (k,v) {
							context.nodes.push({name: v.name, id: k});
						});
						//console.log(context.nodes);
						
						return context;	
					})
					.render(global.graphTemplate)
					.replace("#graphs")
					.then(function() {
						$.each(context.nodes, function (k,v) {
							global.graphs[v.id] = getGrapher();
							global.graphs[v.id].init(v.id);
							global.graphs[v.id].displayStackedChart();
						});
						
						//
						context.poll('test');
					});
					
					
			});
			
		});
	
	app.run('#/');
	
	})(jQuery);
});