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
							console.log(data);
							$.each(data.indices[index].shards, function (shardKey, shardValue) {
								$.each(shardValue, function(shardKeyPR, shardValuePR) {
									
									
									$.each(shardValuePR.segments, function (k,v) {
									console.log(shardKey + "_" +shardKeyPR);
										var temp = {};
											temp.id = k;
											temp.num_docs = v.num_docs;
											temp.deleted_docs = v.deleted_docs;
									
										
										
										
										//console.log(temp);
										var divId = "node_" + shardValuePR.routing.node + "_" + shardKey + "_" +shardKeyPR;
										
										if (typeof segments[divId] === 'undefined')
											segments[divId] = [];
										
										segments[divId].push(temp);
									});
									//console.log(v);
								});
							});
							
							
							$.each(segments, function (divId,segments) {
								$.each (segments, function (id, value) {
									global.graphs[divId].addData(value);
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
						context.nodes = {};
						$.each(state.routing_table.indices.test.shards, function (shardId, shard) {
							$.each(shard, function(prId, pr) {
								if (typeof context.nodes[pr.node] === 'undefined') {
									context.nodes[pr.node] = new Array();
								}
								
								//css ids can't start with numbers, prepend with "node"
								context.nodes[pr.node].push( {id: "node_" + pr.node + "_" + shardId + "_" + prId,
															node: pr.node,
															index: pr.index,
															primary: pr.primary} );
								
								
							});
							
						
						
							//context.nodes[nodeId] = {name: node.name, id: nodeId, shards: [] };
						});
						console.log(context.nodes);
						
						return context;	
					})
					
					.render(global.graphTemplate)
					.replace("#graphs")
					.then(function() {
						$.each(context.nodes, function (nodeId,node) {
							$.each(node, function (k, div) {
								global.graphs[div.id] = getGrapher();
								global.graphs[div.id].init(div.id);
								global.graphs[div.id].displayStackedChart();
							});
						});
						
						//
						context.poll('test');
					});
					
					
			});
			
		});
	
	app.run('#/');
	
	})(jQuery);
});