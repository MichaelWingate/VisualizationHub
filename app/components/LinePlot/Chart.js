var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");

/* Component for monitoring the overall chart and chart events. Props:
    width: pixel width of chart
    height: pixel height of chart
    selectBins: function called when the user makes a selection
    unSelect: function called when the user cancels a selection
    displaySelected: function called at the end of a selection to share what IDs were selected
    selectedIDs: IDs that are being selected
    selectIDs: function called at the end of a selection to share what IDs were selected
    zoomGraph: function called when the zoom is changed
*/
var Chart = React.createClass({
  getInitialState: function() {
    /* moveActive: true/false whether a selection is in process
       firstPoint: x/y coordinates of the drag's start
       secondPoint: x/y coordinates of the drag's end
       zoomTransforms: array of past zoom transforms kept for zooming back out
    */
    return{
      moveActive: false,
      firstPoint: {
        x: 0,
        y: 0,
      },
      secondPoint: {
        x: 0,
        y: 0,
      },
      zoomTransforms: []
    }
  },
  componentDidMount: function() {
    this.setEvents(true);
  },
  componentDidUpdate: function() {
    this.setEvents(false);
  },

  // Sets mouse events
  setEvents: function(mount) {
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    d3.select(svgNode).on("mousedown", this.onMouseDown);
    d3.select(svgNode).on("mousemove", this.onMouseMove);
    d3.select(svgNode).on("mouseup", this.onMouseUp);
    d3.select(svgNode).on("contextmenu", this.onRightClick);
    // Configures zoom
    var zoom = d3.zoom()
      .scaleExtent([1,10])
      .on("zoom", this.onZoom);
    d3.select(svgNode).call(zoom);
    // Sets initial zoom to the zoom history array
    if(mount) {
      var allTransforms = this.state.zoomTransforms;
      allTransforms.push(d3.zoomTransform(svgNode));
      this.state.zoomTransforms = allTransforms;
    }
  },

  // Disables right click
  onRightClick: function(e) {
    d3.event.preventDefault();
  },

  // Handles zooming when the graph is scrolled
  onZoom: function(e) {
    // Grabs the new zoom transform
    var svgNode = ReactDOM.findDOMNode(this.refs.svg);
    var newZoom = d3.zoomTransform(svgNode);

    var allTransforms = this.state.zoomTransforms;
    // If zooming out, remove the most recent zoom from the array and transform to the previous
    if(this.state.zoomTransforms[this.state.zoomTransforms.length -1].k > newZoom.k) {
      allTransforms.pop();
      var oldZoom = this.state.zoomTransforms[this.state.zoomTransforms.length-1];
      newZoom.x = oldZoom.x;
      newZoom.y = oldZoom.y;
    }
    else {
      allTransforms.push(newZoom);
    }
    // Call the function that does the zooming
    this.props.zoomGraph(newZoom);
    this.setState({zoomTransforms: allTransforms});
  },

  // When the mouse is pressed down, signals a selection event and records the start coordinates
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
      if(this.state.firstPoint.y > this.state.secondPoint.y) {
        var top = this.state.firstPoint.y;
        var bottom = this.state.secondPoint.y;
      }
      else {
        var top = this.state.secondPoint.y;
        var bottom = this.state.firstPoint.y;
      }
      this.props.selectBins(left,right,top,bottom, this.props.xScale, this.props.yScale, this.props.dateParse );
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
    // a box
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
      <g>
        {this.props.children}
      </g>
        {this.state.moveActive ? <rect x={left} y={top} fillOpacity="0.5" width={width} height={height} fill="#7063FF"/> : null}
      </svg>
    );
  }
});

module.exports = Chart;
