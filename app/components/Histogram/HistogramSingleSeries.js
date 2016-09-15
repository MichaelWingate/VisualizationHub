var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");
var Chart = require("./Chart");
var Axis = require("./Axis");
var Bar = require("./Bar");
var DistributionCurve = require("./DistributionCurve");

/* Handles calculations and rendering of a single series Histogram
*/
var HistogramSingleSeries = React.createClass({
  getInitialState: function() {
    /*
      selection: svg coordinates of a user's click and drag selection
      areaSelecting: true/false if there is a current selection
    */
    return({
      selection: {
        left: 0,
        right: 0,
      },
      areaSelecting: false,
    })
  },
  getDefaultProps: function(){
    return {
      title: "",
      colors: d3.scaleOrdinal(d3.schemeCategory10),
      selectedLine: [],
    }
  },

  // Updates the results of a selection
  selectBins: function(left, right) {
    this.setState({
      selection: {
        left: left,
        right: right,
      },
      areaSelecting: true,
    });
  },

  // Removes a selection
  unSelectBins: function() {
    this.setState({
      selection: {
        left: 0,
        right: 0,
      },
      areaSelecting: false,
    });
  },

  render: function() {
    var props = this.props;

    // Many pieces of code such as this are left over from when it was combined
    // with the side series. They allow multiple data sets.
    var data = [];
    data[0] = props.data;

    // Calculate the minimum and maximum measurments
    var min = [];
    var max = [];
    data.map(function(group, i) {
      min[i] = d3.min(group, function(value) {return value[props.measurement];});
      max[i] = d3.max(group, function(value) {return value[props.measurement];});
    })
    // Round them for cleaner binning
    var actualMin = Math.floor(d3.min(min)/10)*10;
    var actualMax = Math.ceil(d3.max(max)/10) * 10;

    // Create a d3 scale to map the measurement data to the width
    var xScale = d3.scaleLinear()
      .domain([actualMin, actualMax])
      .range([props.padding, props.width - props.padding]);

    // Creates the lines and labels for any data that was selected and passed through selectedLine
    var lines = props.selectedLine.map(function(selection, i) {
      var p1 = {x: xScale(selection[props.measurement])+2,
                y: props.height-props.padding};
      var p2 = {x: xScale(selection[props.measurement])+2,
                y: props.padding};
      return(<g key={i}><line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="black" />
                <text textAnchor="middle" x={p1.x} y={p2.y}>{selection[props.measurement]}</text></g>)
    })

    // Scale the selections from the coordinates to the data's measurements
    var leftSelect = xScale.invert(this.state.selection.left);
    var rightSelect = xScale.invert(this.state.selection.right);

    // Use d3 to create the bins from the data
    var bins = [];
    data.map(function(group, i) {
      bins[i] = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(props.ticks))
        .value(function(d) {return d[props.measurement]})
        (group);
    })
    var binWidth = bins[0][0].x1 - bins[0][0].x0;

    // takes each bin and creates an object with the bin data and other important data
    var binnedData = [];
    var sortedBins = [];
    var selecting = this.state.areaSelecting;
    var ids = [];
    // NOTE: value.height is the height that will be displayed, value.bin.length is the "true" height/count
    bins.map(function(group,j) {
      binnedData.push([]);
      group.map(function(value,i) {
        /* bin: the data in the bin
           height: number of objects in the bin (becomes height of bar)
           index: unique index for bin
           cut: whether the height of the bar has been shortened
           selected: whether the bar was selected by the user
        */
        var object = {bin: value,
                      height: value.length,
                      index: j+"-"+i,
                      cut: false,
                      selected: false};
        // calculates whether the bin is at all within the user's selection
        if(selecting){
          if((value.x0 >= leftSelect && value.x0 <= rightSelect) || (value.x1 >= leftSelect && value.x1 <= rightSelect) || (value.x0 <= leftSelect && value.x1 >= rightSelect)){
            object.selected = true;
            value.map(function(object) {
              ids.push(object[props.id]);
            })
          }
        }
        binnedData[j].push(object);
      });
      sortedBins = sortedBins.concat(binnedData[j]);
    })
    // Sort the bins (by length) to determine which one is the largest
    sortedBins.sort(sort);

    // If the largest bin is 1.5 times bigger than the next biggest, shorten the
    // largest bar and mark that it was cut
    var maxIndex = sortedBins[0].index.split("-");
    var jIndex = maxIndex[0];
    var iIndex = maxIndex[1];
    if(sortedBins[1].bin.length * 1.5 < sortedBins[0].bin.length) {
      binnedData[jIndex][iIndex].height = sortedBins[1].height*1.3;
      binnedData[jIndex][iIndex].cut = true;
    }
    // We now have our true largest y-value
    var yMax = binnedData[jIndex][iIndex].height;

    // Create a d3 scale to map the y heights to the svg height
    var yScale = d3.scaleLinear()
      .domain([0,yMax])
      .range([props.height-props.padding, props.padding]);

    // Creates a bar for each bin
    var bars = [];
    var allBars = [];
    binnedData.map(function(bin, j) {
      bars[j] = bin.map(function(value, i) {
        // NOTE: value.height is the height that will be displayed, value.bin.length is the "true" height/count
        // Width of the bar and padding between bars
        var binWidth = xScale(value.bin.x1) - xScale(value.bin.x0);
        // Width of the bar
        var barWidth = (binWidth -2)/binnedData.length;
        return(
            <Bar height={props.height - yScale(value.height) - props.padding} value={value.bin.length} label={value.bin.length}
              width={barWidth} xPos={binWidth*i +barWidth*j + 1} style={value.selected ? {opacity: '1.0',} : {opacity: '0.75',}}
              availableHeight={props.height} index={i} key={j+" - "+i} cut={value.cut} color={props.colors(j)} />
            )
      });
      allBars = allBars.concat(bars[j]);
    })

    // Calculates the summary statistics for the curves
    if(props.curve == "normalPdf"){
      var mu = d3.mean(props.data, function(d) {return d[props.measurement]; });
      var sigma = d3.deviation(props.data, function(d) {return d[props.measurement]; });
    }
    else if(props.curve == "log") {
      var mu = d3.mean(props.data, function(d) {return Math.log(d[props.measurement]); });
      var sigma = d3.deviation(props.data, function(d) {return Math.log(d[props.measurement]); });
    }

    var yTransform = `translate(${props.padding}, 0)`;
    var xTransform = `translate(0, ${props.height - props.padding})`;
    var dataTransform = `translate(${props.padding}, ${-props.padding})`;

    var axisLabel = props.measurement.charAt(0).toUpperCase() + props.measurement.slice(1);
    return(
      <Chart width={props.width} height={props.height} selectBins={this.selectBins} unSelect={this.unSelectBins} selectedIDs={ids} selectIDs={props.displaySelected}>
        <g transform={dataTransform}>{allBars}</g>
        <Axis scale={xScale} transform={xTransform} width={props.width} height={props.height} label={axisLabel} ticks={props.ticks}/>
        {lines.length != 0 ? <g>{lines}</g> : null}
        {props.curve != "none" ? <DistributionCurve type={props.curve} mu={mu} sigma={sigma} min={actualMin}
          max={actualMax} points={props.data.length} binWidth={binWidth} xScale={xScale} yScale={yScale} bins={bins[0]} />: null}
      </Chart>
    )
  }
});

function sort(a,b) {
  if(a.bin.length < b.bin.length) {
    return 1;
  }
  if(a.bin.length > b.bin.length) {
    return -1;
  }
  return 0;
}

module.exports = HistogramSingleSeries;
