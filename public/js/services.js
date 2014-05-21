(function() {
   'use strict';

   /* Services */

   angular.module('myApp.services', ['myApp.service.login', 'myApp.service.firebase'])

    // Define new directive for making graphs
     .directive('graph',['$rootScope', function($rootScope){

        // Restrict direct to element tags
        return {
          restrict: 'E',
          link: link
        };

        // Create new graph when injected as element tag
        function link(scope, element, attrs){
          var graph = new Rickshaw.Graph({
            element: element[0],
            width: 1000,
            height: 500,
            min: 0,
            max: 11,
            series: [{
               color: 'steelblue',
               data: []
            }]
          });

          // Define units of time
          var time = new Rickshaw.Fixtures.Time();
          var minutes = time.unit('minute');
          minutes.seconds *= 1000;

          // Add time to x-axis
          var xAxis = new Rickshaw.Graph.Axis.Time({
              graph: graph,
              timeUnit: minutes
          });
          xAxis.render();

          // Add ratings to y-axis
          var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph,
          });
          yAxis.render();

          // Adds data points to graph
          var addToGraph = function(snapshot){
            var x = snapshot.snapshot.value.time;
            var y = snapshot.snapshot.value.rating;
            var data = {x: x, y: y};
            graph.series[0].data.push(data);
            graph.render();
          };

           // addToGraph each new data point added to aggregate data
          scope.aggregate.$on('child_added', function(snapshot){addToGraph(snapshot)});
          return graph;
        };

     }])

})();

