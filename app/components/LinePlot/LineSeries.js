var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");
var Chart = require("./Chart");
var Axis = require("./Axis");
var Point = require("./Point");
var IconPoint = require("./IconPoint");

/* Handles calculating and rendering necessary components for a single or multi-series line plot.
*/
var LineSeries = React.createClass({
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
    var objData = _.groupBy(props.data, props.group);
    // Grabs the group names
    var groups = _.uniq(_.pluck(props.data,props.group));

    // Converts the data into an array of grouped arrays
    var data = [];
    groups.map(function(group,i){
      data[i] = objData[groups[i]];
    })

    // Sets up the date parse function
    var dateParse = d3.timeParse("%m-%d-%y");

    // Calculate the maximum and minimum values
    var yMax = [];
    var yMin = [];
    var xMin = [];
    var xMax = [];
    data.map(function(group,i) {
      yMin[i] = d3.min(props.data, function(value) {return value[props.yMeasurement];});
      yMax[i] = d3.max(props.data, function(value) {return value[props.yMeasurement];});
      xMin[i] = d3.min(props.data, function(value) {return dateParse(value[props.xMeasurement]);});
      xMax[i] = d3.max(props.data, function(value) {return dateParse(value[props.xMeasurement]);});
    })

    // Sort a copy of the data by the x-axis measurement (so the lines are drawn properly)
    var sortedData = data.map(function(group,i) {
      return(group.concat().sort(sortDate(props.xMeasurement,dateParse)));
    });

    // Find mins and maxes across all the groups
    var actualYMax = d3.max(yMax);
    var actualYMin = d3.min(yMin);
    var actualXMax = d3.max(xMax);
    var actualXMin = d3.min(xMin);

    // Determines the proper range for x and y. The range is scaled and shifted based
    // off of the zoom transform, if there is one.
    if(this.state.zoomTransform != null) {
      var kT = this.state.zoomTransform.k;
      var xT = this.state.zoomTransform.x;
      var yT = this.state.zoomTransform.y;
      var xRange = [(props.padding*kT)+xT,((props.width-props.padding)*kT)+xT];
      var yRange = [((props.height-props.padding)*kT)+yT,(props.padding*kT)+yT];
    }
    else {
      var xRange = [props.padding, props.width - props.padding];
      var yRange = [props.height - props.padding, props.padding];
    }

    // Create the d3 x-scale
    var xScale = d3.scaleTime()
      .domain([actualXMin,actualXMax])
      .range(xRange);

    // Create the d3 y-scale
    var yScale = d3.scaleLinear()
      .domain([actualYMin, actualYMax])
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
    sortedData.map(function(group,j) {
      points[j] = [];
      circles[j] = group.map(function(value,i) {
        // Scale the measurements to the svg coordinates
        var x = xScale(dateParse(value[props.xMeasurement]));
        var y = yScale(value[props.yMeasurement]);
        var color = props.colors(j);
        var strokeColor = "black";
        var size = 20;
        points[j].push({x:x,y:y});

        // Check to see if the point is within the selection.
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

        // Sets specific icons determined by the weather type. Not generic
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

    var lineStyle = {
      fill: 'none',
      strokeWidth: '3px'
    };

    // Draws a line for each group through that group's points
    var lines = sortedData.map(function(group,j) {
      var path = d3.line()
      .x(function(d) {return d.x;})
      .y(function(d) {return d.y;})
      .curve(d3.curveLinear)
      (points[j]);

      return(
        <path ref={"line" + j} style={lineStyle} d={path} stroke={props.colors(j)} key={j}/>
      )
    })

    // Create a legend label for each group
    var legend = groups.map(function(group,i){
      var transform = `translate(-50,${20*i})`;
      var legendLabel = group.charAt(0).toUpperCase() + group.slice(1);
      return (<g key={i} transform={transform}><circle transform={`translate(-10,-5)`} r={7} fill={props.colors(i)} />
      <text fill={props.colors(i)}>{legendLabel}</text></g>)
    });


    var xLabel = props.xMeasurement.charAt(0).toUpperCase() + props.xMeasurement.slice(1);
    var yLabel = props.yMeasurement.charAt(0).toUpperCase() + props.yMeasurement.slice(1);
    var yTransform = `translate(${props.padding}, 0)`;
    var xTransform = `translate(0, ${props.height - props.padding})`;
    var legendTransform = `translate(${props.width-props.padding}, ${props.padding})`;
    return(
      <Chart width={props.width} height={props.height} selectBins={this.selectPoints} unSelect={this.unSelectPoints}
      selectedIDs={ids} selectIDs={props.displaySelected} zoomGraph={this.zoomGraph}>
        <Axis orient={"bottom"} scale={xScale} transform={xTransform} width={props.width} height={props.height} label={xLabel} />
        <Axis orient={"left"} scale={yScale} transform={yTransform} width={props.width} height={props.height} label={yLabel} />
          {lines}
          {allCircles}
          <g transform={legendTransform}>{legend}</g>
      </Chart>
    )
  }
});

function sortDate(xMeas, dateParse) {
  var props = {xMeas: xMeas, dateParse: dateParse};
  return(function(a,b) {
    var aComp = dateParse(a[props.xMeas]);
    var bComp = dateParse(b[props.xMeas]);
    if(aComp > bComp) {return 1}
    else if(aComp < bComp) {return -1}
    else{return 0}
  })
}

module.exports = LineSeries;
