var React = require('react');
var ReactDOM = require('react-dom');
var Bar = require('../Histogram/Bar');
var Axis = require('../LinePlot/Axis');
var Chart = require('../Histogram/Chart');
var d3 = require("d3");
var ReactDOM = require("react-dom");


var PivotChart = React.createClass({
  render: function() {
    var props = this.props;
    var margin = 45;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var maxes = props.data.map(function(row,i) {
      var rowValues = [];
      for(var col in row) {
        if(row.hasOwnProperty(col)) {
          rowValues.push(row[col].value);
        }
      }
      return(d3.max(rowValues))
    });
    var yMax = d3.max(maxes);

    var yScale = d3.scaleLinear()
      .domain([0,yMax])
      .range([props.height,margin*2]);

    var xScale = d3.scaleBand()
      .domain(props.rowGroups)
      .rangeRound([margin, props.width-120], 0.05)
      .padding(0.05);

    var xWithinScale = d3.scaleBand()
      .domain(props.colGroups)
      .rangeRound([0,xScale.bandwidth()], 0.05)
      .padding(0.05);

    var allBars = [];
    props.data.map(function(row,i) {
      for(var col in row) {
        if(row.hasOwnProperty(col)) {
          var value = row[col].value;
          var height = props.height - yScale(value);
          if(height == 0) {height=5;}
          allBars.push(<Bar height={height} value={value} label={""} width={xWithinScale.bandwidth()}
            xPos={xScale(props.rowGroups[i]) + xWithinScale(col)} style={value.selected ? {opacity: '1.0',} : {opacity: '0.75',}} availableHeight={props.height}
            key={i + col} totalWidth={props.width} cut={false} color={color(props.colGroups.indexOf(col))} />);
        }
      }
    });
    if(typeof props.colGroups[0] !== 'undefined') {
      var legend = props.colGroups.map(function(col,i) {
        var transform = `translate(0,${20*i})`;
        var legendLabel = col.charAt(0).toUpperCase() + col.slice(1);
        return(<g key={i} transform={transform}><circle transform={`translate(-10,-5)`} r={7} fill={color(i)} />
                  <text fill={color(i)}>{legendLabel}</text></g>)
      });
    }
    else {var legend="";}

    if(props.measurementType == "Average") {
      var measurementTypeDesc = "Average ";
    }
    else if(props.measurementType == "Sum") {
      var measurementTypeDesc = "Sum Of ";
    }
    else if(props.measurementType == "Count") {
      var measurementTypeDesc = "Count Of ";
    }
    var xAxisLabel = props.rowField;
    var yAxisLabel = measurementTypeDesc +  props.measurement;
    var xTransform = `translate(0, ${props.height-margin})`;
    var yTransform = `translate(${margin},${-margin})`;
    var dataTransform = `translate(0, ${-margin})`;
    var legendTransform = `translate(${props.width-100}, ${margin})`;
    return(
      <Chart width={props.width} height={props.height} selectBins={function() {return null;}} unSelect={function() {return null;}} selectIDs={function() {return null;}}>
      <g transform={dataTransform}>{allBars}</g>
      <Axis scale={xScale} orient={"bottom"} transform={xTransform} width={props.width} height={props.height} label={xAxisLabel} />
      <Axis scale={yScale} orient={"left"} transform={yTransform} width={props.width} height={props.height} label={yAxisLabel} />
      <g transform={legendTransform}>{legend}</g>
      </Chart>
    )
  }
});

module.exports = PivotChart;
