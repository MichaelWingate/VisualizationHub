var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");
var Chart = require("./Chart");
var Axis = require("./Axis");
var Point = require("./Point");
var IconPoint = require("./IconPoint");
var Line = require("./Line");

/* Handles calculating and rendering necessary components for a categorical line plot
*/
var CategoricalSeries = React.createClass({
  getInitialState: function() {
    /*
      selection: svg coordinates of a user's click and drag selection
      areaSelecting: true/false if there is a current selection
      zoomTransform: transform for current zoom
    */
    return({
      selection: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      areaSelecting: false,
      zoomTransform: null
    })
  },
  getDefaultProps: function(){
    return {
      title: "",
      colors: d3.scaleOrdinal(d3.schemeCategory10),
      selectedLine: [],
    }
  },

  // Updates the result of a selection
  selectPoints: function(left,right,top,bottom) {
    this.setState({
      selection: {
        left: left,
        right: right,
        top: top,
        bottom: bottom,
      },
      areaSelecting: true,
    });
  },

  // Removes a selection
  unSelectPoints: function() {
    this.setState({
      selection: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      areaSelecting: false,
    });
  },

  // Updates the zoom transform
  zoomGraph: function(transform) {
    this.setState({zoomTransform: transform});
  },

  render: function() {
    var props = this.props;
    
    // Groups the data by the specified field
    var objData = _.groupBy(props.data, props.yMeasurement);
    // Grabs the group names
    var groups = _.uniq(_.pluck(props.data,props.yMeasurement));

    // Converts the data into an array of grouped arrays
    var data = [];
    groups.map(function(group,i){
      data[i] = objData[groups[i]];
    })

    // Sets up the date parse function
    var dateParse = d3.timeParse("%m-%d-%y");

    // Calculate the maximum and minimum values
    var xMin = [];
    var xMax = [];
    data.map(function(group,i) {
      xMin[i] = d3.min(group, function(value) {return dateParse(value[props.xMeasurement]);});
      xMax[i] = d3.max(group, function(value) {return dateParse(value[props.xMeasurement]);});
    })

    // Find mins and maxes across all the groups
    var actualXMax = d3.max(xMax);
    var actualXMin = d3.min(xMin);

    // Determines the proper range for x and y. The range is scaled and shifted based
    // off of the zoom transform, if there is one.
    var xRange = [props.padding+80, props.width - props.padding];
    var yRange = groups.map(function(group,i) {
      var totalRange = props.height-props.padding -props.padding;
      return ((totalRange*i)/groups.length)+props.padding;
    });
    if(this.state.zoomTransform != null) {
      var kT = this.state.zoomTransform.k;
      var xT = this.state.zoomTransform.x;
      var yT = this.state.zoomTransform.y;
      var xRange = xRange.map(function(point,i){
        return(point*kT+xT)
      });
      var yRange = yRange.map(function(point,i){
        return(point*kT+yT)
      });
    }

    // Create the d3 scales
    var xScale = d3.scaleTime()
      .domain([actualXMin,actualXMax])
      .range(xRange);

    var yScale = d3.scaleOrdinal()
      .domain([groups])
      .range(yRange);

    var leftSelect = this.state.selection.left;
    var rightSelect = this.state.selection.right;
    var topSelect = this.state.selection.top;
    var bottomSelect = this.state.selection.bottom;

    // Creates points for each data value in each group
    var points = [];
    var circles = [];
    var allCircles = [];
    var ids = [];
    var selecting = this.state.areaSelecting;
    data.map(function(group,j) {
      points[j] = [];
      var accumulator = 0;
      circles[j] = group.map(function(value,i) {
        // Scale the measurements to the svg coordinates
        var x = xScale(dateParse(value[props.xMeasurement]));
        var y = yScale(value[props.yMeasurement]);
        var color = props.colors(j);
        var strokeColor = "black";
        var size = 20;
        points[j].push({x:x,y:y});

        // Check to see if the point is within the selection
        if(selecting) {
          if(x >= leftSelect && x <= rightSelect && y <= topSelect && y >= bottomSelect){
            strokeColor = "red";
            ids.push(value[props.id]);
          }
        }

        // Check to see if the point was selected from outside the plot
        if(props.selectedPoints != []) {
          props.selectedPoints.map(function(id,i){
            if(id[props.id] == value[props.id]) {
              size = 30;
            }
          })
        }

        // Sets specific icons determined by the weather type
        if(props.icons) {
          if(value["Weather"] == "Sunny") {var image = "/sunny.png";}
          else if(value["Weather"] == "Mostly Sunny") {var image = "/Mostly sunny.png";}
          else if(value["Weather"] == "Partly Cloudy") {var image = "/partly cloudy.png";}
          else if(value["Weather"] == "Mostly Cloudy") {var image = "/cloudy.png";}
          else if(value["Weather"] == "Rain") {var image = "/rainy.png";}
          else if(value["Weather"] == "Thunderstorms") {var image = "/thunderstorms.png";}
          var renderPoint = <IconPoint x={x} y={y} key={j+" - "+i} size={size} image={image} strokeColor={strokeColor} data={value}/>;
        }
        else {
          var radius = size/4;
          var renderPoint = <Point x={x} y={y} key={j + " - " + i} color={color} strokeColor={strokeColor} size={radius} border={radius/3} data={value}/>;
        }
        return(
          <g key={j+" - "+i}>{renderPoint}</g>
        )
      });
      allCircles = allCircles.concat(circles[j]);
    })

    // Creates the labels for each category
    var groupLabels = groups.map(function(group,i){
      var xValue = 25;
      var yValue = yScale(group);
      return(
        <text x={xValue} y={yValue} key={i}>{group}</text>
      )
    })

    var xLabel = props.xMeasurement.charAt(0).toUpperCase() + props.xMeasurement.slice(1);
    var yTransform = `translate(${props.padding}, 0)`;
    var xTransform = `translate(0, ${props.height - props.padding})`;
    var yLabel = `rotate(-90,15,${props.height/2})`;
    return(
      <Chart width={props.width} height={props.height} selectBins={this.selectPoints} unSelect={this.unSelectPoints} displaySelected={props.displaySelected}
      selectedIDs={ids} selectIDs={props.displaySelected} zoomGraph={this.zoomGraph}>
        <Axis orient={"bottom"} scale={xScale} transform={xTransform} width={props.width} height={props.height} label={xLabel} />
          {allCircles}
          {groupLabels}
      <text x={15} y={props.height/2} transform={yLabel}> {props.yMeasurement}</text>
      </Chart>
    )
  }
});

module.exports = CategoricalSeries;
