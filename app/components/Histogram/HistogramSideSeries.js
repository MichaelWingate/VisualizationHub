var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");
var Chart = require("./Chart");
var Axis = require("./Axis");
var Bar = require("./Bar");

/* Handles calculations and rendering of a multiple series Histogram.
   Places the bins side-by-side
*/
var HistogramSideSeries = React.createClass({
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

    // Groups the data by the specified field
    var objData = _.groupBy(props.data, props.group);
    // Grabs the group names
    var groups = _.uniq(_.pluck(props.data,props.group));

    // Converts the data into an array of grouped arrays
    var data = [];
    groups.map(function(group,i){
      data[i] = objData[groups[i]];
    })

    // Calculate the minimum and maximum measurements for each group
    var min = [];
    var max = [];
    data.map(function(group, i) {
      min[i] = d3.min(group, function(value) {return value[props.measurement];});
      max[i] = d3.max(group, function(value) {return value[props.measurement];});
    })
    // Find the actual maximum and minimum by comparing across groups
    var actualMin = d3.min(min);
    var actualMax = d3.max(max);

    // Create a d3 scale to map the measurement data to the width
    var xScale = d3.scaleLinear()
      .domain([Math.floor(actualMin/10)*10, Math.ceil(actualMax/10) * 10])
      .range([props.padding, props.width - (1.5*props.padding)]);

    // Creates the lines and labels for any data that aws selected and passed through selectedLine
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

    // takes each bin in each group and creates an object with the bin data and
    // other important data
    var binnedData = [];
    var sortedBins = [];
    var ids = [];
    var selecting = this.state.selecting;
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

    // Creates a bar for each group in each bin
    var bars = [];
    var allBars = [];
    binnedData.map(function(bin, j) {
      bars[j] = bin.map(function(value, i) {
        // NOTE: value.height is the height that will be displayed, value.bin.length is the "true" height/count
        // Width of the bin (each group's bar and padding)
        var binWidth = xScale(value.bin.x1) - xScale(value.bin.x0);
        // Width of the single bar
        var barWidth = (binWidth -2)/binnedData.length;
        return(
            <Bar height={props.height - yScale(value.height) - props.padding} value={value.bin.length} label={value.bin.length}
              width={barWidth} xPos={binWidth*i +barWidth*j + 1} style={value.selected ? {opacity: '1.0',} : {opacity: '0.75',}}
              availableHeight={props.height} index={i} key={j+" - "+i} totalWidth={props.width} cut={value.cut} color={props.colors(j)} />
            )
      });
      allBars = allBars.concat(bars[j]);

    })

    // Sets up a legend label for each group item
    var legend = groups.map(function(group,i){
      var transform = `translate(0,${20*i})`;
      var legendLabel = group.charAt(0).toUpperCase() + group.slice(1);
      return (<g key={i} transform={transform}><circle transform={`translate(-10,-5)`} r={7} fill={props.colors(i)} />
      <text fill={props.colors(i)}>{legendLabel}</text></g>)
    });

    var yTransform = `translate(${props.padding}, 0)`;
    var xTransform = `translate(0, ${props.height - props.padding})`;
    var dataTransform = `translate(${props.padding}, ${-props.padding})`;
    var legendTransform = `translate(${props.width-props.padding*2}, ${props.padding})`;

    var axisLabel = props.measurement.charAt(0).toUpperCase() + props.measurement.slice(1);
    return(
      <Chart width={props.width} height={props.height} transform={yTransform} padding={props.padding} selectBins={this.selectBins} unSelect={this.unSelectBins} selectedIDs={ids} selectIDs={props.displaySelected}>
        <g transform={dataTransform}>{allBars}</g>
        <Axis scale={xScale} transform={xTransform} width={props.width} height={props.height} label={axisLabel} ticks={props.ticks}/>
        {lines.length != 0 ? <g>{lines}</g> : null}
        <g transform={legendTransform}>{legend}</g>
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

module.exports = HistogramSideSeries;
