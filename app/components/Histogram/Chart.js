var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");

/*
  Component for monitoring the overall chart and chart events. Props:
    width: pixel width of chart
    height: pixel height of chart
    selectBins: function called when the user makes a selection
    unSelect: function called when the user cancels a selection
    selectedIDs: IDs that are being selected
    selectIDs: function called at the end of a selection to share what IDs were selected
*/
var Chart = React.createClass({
  getInitialState: function() {
    return{
      /* moveActive: true/false whether a selection is in process
         firstPoint: x/y coordinates of the drag's start
         secondPoint: x/y coordinates of the drag's end
      */
      moveActive: false,
      firstPoint: {
        x: 0,
        y: 0,
      },
      secondPoint: {
        x: 0,
        y: 0,
      },
    }
  },
  componentDidMount: function() {
    this.setEvents();
  },
  componentDidUpdate: function() {
    this.setEvents();
  },

  // Sets mouse events
  setEvents: function() {
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    d3.select(svgNode).on("mousedown", this.onMouseDown);
    d3.select(svgNode).on("mousemove", this.onMouseMove);
    d3.select(svgNode).on("mouseup", this.onMouseUp);
  },

  // When the mouse is pressed down, signals a selection event and records the start coords
  onMouseDown: function(e) {
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    var coords = d3.mouse(svgNode);
    this.setState({ moveActive: true,
                    firstPoint: {x:coords[0], y:coords[1]},
                    secondPoint: {x:coords[0], y:coords[1]}});
  },

  // When the mouse moves, checks to see if a selection event is happening.
  // If so, gets the current end coordinates to calculate the selected area,
  // and pass that to the selection function.
  onMouseMove: function(e) {
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    var coords = d3.mouse(svgNode);
    if(this.state.moveActive) {
      this.setState({secondPoint: {x:coords[0], y:coords[1]}});
      if(this.state.firstPoint.x > this.state.secondPoint.x) {
        var left = this.state.secondPoint.x;
        var right = this.state.firstPoint.x;
      }
      else{
        var left = this.state.firstPoint.x;
        var right = this.state.secondPoint.x;
      }
      this.props.selectBins(left,right);
    }
  },

  // When the mouse is lifted up, the event stops and the IDs that have been selected
  // are sent to the function that handles them. If the mouse is released without any
  // movement happening, it deselects everything.
  onMouseUp: function(e) {
    this.setState({moveActive: false});
    if(this.state.firstPoint.x == this.state.secondPoint.x && this.state.firstPoint.y == this.state.secondPoint.y) {
      this.props.unSelect();
    }
    this.props.selectIDs(this.props.selectedIDs);
  },

  render: function() {
    // Calculates the bounds of the current selection and uses those to draw
    // a box.
    if( this.state.firstPoint.x > this.state.secondPoint.x) {
      var left = this.state.secondPoint.x;
    }
    else {
      var left = this.state.firstPoint.x;
    }
    if(this.state.firstPoint.y > this.state.secondPoint.y) {
      var top = this.state.secondPoint.y;
    }
    else {
      var top = this.state.firstPoint.y;
    }
    var width = Math.abs(this.state.firstPoint.x - this.state.secondPoint.x);
    var height = Math.abs(this.state.firstPoint.y - this.state.secondPoint.y);
    return(
      <svg ref="svg" width={this.props.width} height={this.props.height} style={{display: 'inline'}} >
      {this.props.children}
      {this.state.moveActive ? <rect x={left} y={top} fillOpacity="0.5" width={width} height={height} fill="#7063FF"/> : null}
      </svg>
    );
  }
});

module.exports = Chart;
