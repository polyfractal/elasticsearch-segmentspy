$(document).ready(function () {
	(function($) {

	

	var sort_by = function(field, reverse, primer){
	   var key = function (x) {return primer ? primer(x[field]) : x[field]};
	   return function (a,b) {
		   var A = key(a), B = key(b);
		   return (A < B ? -1 : (A > B ? 1 : 0)) * [1,-1][+!!reverse];                  
	   }
	}


		var global = {};
		global.homeTemplate = Handlebars.compile($("#home-template").html());
		global.indicesTemplate = Handlebars.compile($("#indices-template").html());
		global.graphTemplate = Handlebars.compile($("#graph-template").html());
		global.host = window.location.host;
		global.graphs = [];
		global.previousSegments = {};
		global.loaded = false;
		global.refreshInterval = 500;

		
		var app = Sammy("body", function() {
			
			this.use('Handlebars', 'hb');

			////////////////////////////////////////
			this.helpers({
				
				initPage: function() {
					var context = this;
					
					clearTimeout(global.pollID);
					
					if (global.loaded == false) {
						context.loadIndices();
						context.jq_pauseButton();
						context.jq_refreshInterval();
						global.loaded = true;
					}
				},
				
				jq_pauseButton: function() {
					$("#pause").click(function(e) {
						if($(this).hasClass('btn-danger') == true) {
							global.pause = true;
							$(this).text("Unpause");
						} else {
							global.pause = false;
							$(this).text("Pause");
						}
						$(this).toggleClass('btn-danger btn-success');
					});
				},
				
				jq_refreshInterval: function() {
					$("#changeRefresh").click(function(e) {
						global.refreshInterval = $("#refreshInterval").val();
					});
				},
				
				loadIndices: function() {
					
					var context = this;
					
					var loadOptions = 	{type: 'get', dataType: 'json'};
					var stateOptions = "?filter_metadata=true&filter_blocks=true";
					context.load("http://" + global.host + "/_cluster/state" + stateOptions, loadOptions)
						.then(function(state) {
							context.cluster_name = state.cluster_name;
							context.master_node = state.master_node;
							context.indices = [];
							$.each(state.routing_table.indices, function (index, v) {
								context.indices.push(index.toString());
							});
							
							return context;	
						})
						.render(global.indicesTemplate)
						.replace("#indices");
				},
			
			
				poll: function(index) {
					
					var formattedIndex = index;
					
					if (typeof index === 'undefined') {
						formattedIndex = "/";
					} else {
						formattedIndex += "/";
					}
				
					var context = this;	
					
					global.pollID = setTimeout(function(){
						
						if (global.pause == true) {
							context.poll(index);
							return;
						}
							
						//console.log("Poll: " + index);
						$.getJSON("http://" + global.host + "/" + formattedIndex + "_segments/", function(data) {
							var segments = {};

							$.each(data.indices[index].shards, function (shardKey, shardValue) {
								$.each(shardValue, function(shardKeyPR, shardValuePR) {
									
									var divId = "node_" + shardValuePR.routing.node + "_" + shardKey;
									
									if (typeof segments[divId] === 'undefined')
										segments[divId] = [];
										
									segments[divId].push(['Segment ID', 'Docs', 'Deleted Docs']);
									
									$.each(shardValuePR.segments, function (k,v) {
									//console.log(shardKey + "_" +shardKeyPR);
										//var temp = [];
											//temp.id = k;
											//temp.num_docs = v.num_docs;
											//temp.deleted_docs = v.deleted_docs,
											//temp.size_in_bytes = v.size_in_bytes / 1024 / 1024;

									
										var deleted = 1+(Math.log(v.num_docs, + v.deleted_docs) / Math.LN10) - (Math.log(v.deleted_docs) / Math.LN10);
										//var deleted = v.deleted_docs;
										
										
										//segments[divId].push([k, Math.ceil(v.size_in_bytes / 1024 / 1024), v.deleted_docs]);
										segments[divId].push([k, v.num_docs, deleted]);
									});
								});
							});
							
							
							$.each(segments, function (divId, segmentList) {
								segmentList = segmentList.sort(function(a,b) {
									return parseInt(b[1]) - parseInt(a[1]);
								});
								
								global.graphs[divId].setData(segmentList);
								global.graphs[divId].drawChart();
								
							
							});

							context.poll(index);
						});
					},global.refreshInterval);
					
				},				
			});
			///////////////////////////////////////////// End Helpers

			
			this.get('#/', function(context) {
				context.initPage();
				
				
				context.render(global.homeTemplate)
				.replace("#content")
			});
			
			this.get('#/:index/', function(context) {
			
				context.initPage();
				
				var targetIndex = context.params.index;
				
				var loadOptions = 	{type: 'get', dataType: 'json'};
				var stateOptions = "?filter_metadata=true&filter_blocks=true";
				context.load("http://" + global.host + "/_cluster/state" + stateOptions, loadOptions)
					.then(function(state) {
						
						context.cluster_name = state.cluster_name;
						context.master_node = state.master_node;

						context.nodes = {};
						$.each(state.routing_table.indices[targetIndex].shards, function (shardId, shard) {
							$.each(shard, function(prId, pr) {
								if (typeof context.nodes[pr.node] === 'undefined') {
									context.nodes[pr.node] = new Array();
								}
								
								//css ids can't start with numbers, prepend with "node"
								context.nodes[pr.node].push( {id: "node_" + pr.node + "_" + shardId,
															node: pr.node,
															index: pr.index,
															primary: pr.primary} );

							});
							
						
						
							
						});

						
						return context;	
					})
					.render(global.graphTemplate)
					.replace("#content")
					.then(function() {
						$.each(context.nodes, function (nodeId,node) {
							$.each(node, function (k, div) {
								global.graphs[div.id] = getGrapher();
								global.graphs[div.id].init(div.id);
							});
						});
						
						context.poll(targetIndex);
					});
			});
			
		});
	
	app.run('#/');
	
	})(jQuery);
});