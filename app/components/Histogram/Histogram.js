var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");
var HistogramSingleSeries = require("./HistogramSingleSeries");
var HistogramSideSeries = require("./HistogramSideSeries");
var HistogramStackedSeries = require("./HistogramStackedSeries");
var Histogram100StackedSeries = require("./Histogram100Stacked");

/* Top level component for Histogram. Props:
    height: overall pixel height of histogram
    width: overall pixel width of histogram
    data: javascript object data to be graphed
    measurement: string reference for the data field measured on the x-axis
    id: string reference for the data's unique identifier
    ticks: number of bins to divide the data into
    displaySelected: function to call when a data selection is made on the graph
    pointSelected: array of ids corresponding to data that has been selected elsewhere
    group: string reference for a data field to group the histogram, "none" for no grouping
    multiStyle: style in which to group the histogram. Options: "side", "stacked", or "100"
    curve: what type of curve to overlay a normal histogram. Options: "normalPdf", "log", "none"
*/
var Histogram = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    data: React.PropTypes.array.isRequired,
    measurement: React.PropTypes.string.isRequired,
    id: React.PropTypes.string.isRequired,
  },
  getDefaultProps: function() {
    return({
    ticks: 10,
    pointSelected: [],
    group: null,
    multiStyle: "side",
  })
  },
  render: function() {
    var props = this.props;
    var data = [];
    props.data.map(function(value){
      data.push(value);
    })
/*
    for(var i=0;i<100;i++) {
      if(i%3 == 0) {var sex = "male";}
      else{var sex = "female";}
      data.push({id: i+200,
                 age: 15,
                 sex: sex,
                 divorces: "0"});
    }*/
    if(props.group == "none") {var group = null;}
    else{var group = props.group;}

    // Calls the appropriate series component depending on the specified style.
    // Passes along proper props
    if(group == null) {
      var histogram = <HistogramSingleSeries data={data} width={props.width} height={props.height} padding={50} measurement={props.measurement} ticks={props.ticks}
        displaySelected={props.displaySelected} selectedLine={props.pointSelected} group={group} id={props.id} curve={props.curve} />;
    }
    else {
      if(props.multiStyle == "side") {
        var histogram = <HistogramSideSeries data={data} width={props.width} height={props.height} padding={50} measurement={props.measurement} ticks={props.ticks}
          displaySelected={props.displaySelected} selectedLine={props.pointSelected} group={group}  id={props.id} curve={props.curve} />;
      }
      else if(props.multiStyle == "stacked") {
        var histogram = <HistogramStackedSeries data={data} width={props.width} height={props.height} padding={50} measurement={props.measurement} ticks={props.ticks}
          displaySelected={props.displaySelected} selectedLine={props.pointSelected} group={group} id={props.id} curve={props.curve} />;
      }
      else if(props.multiStyle == "100") {
        var histogram = <Histogram100StackedSeries data={data} width={props.width} height={props.height} padding={50} measurement={props.measurement} ticks={props.ticks}
          displaySelected={props.displaySelected} selectedLine={props.pointSelected} group={group} id={props.id} curve={props.curve} />;
      }
    }
    return(<g>
      {histogram}
      </g>
    );
  }
});

module.exports = Histogram;
