var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");

/* Draws an axis on a graph. Props:
    orient: Orientation. "bottom" for x-axis, "left" for y-axis
    scale: d3 scale to use for ticks
    transform: transformation for where to place axis (usually just accounting for padding)
    width: width of graph
    height: height of graph
    label: string to label the axis
*/
var Axis = React.createClass({
  componentDidMount: function() {
    this.renderAxis();
  },
  componentDidUpdate: function() {
    this.renderAxis();
  },

  // Finds the proper node and calls the axis on that node
  renderAxis: function() {
    var axisNode = ReactDOM.findDOMNode(this.refs.axis);
    var labelNode = ReactDOM.findDOMNode(this.refs.label);
    if(this.props.orient == "left"){
      var axis = d3.axisLeft(this.props.scale)
    }
    else if(this.props.orient == "bottom") {
      var axis = d3.axisBottom(this.props.scale);
    }
    d3.select(axisNode).call(axis);
  },
  render() {
    // Label transform
    if(this.props.orient == "left"){
      var transform=`rotate(-90)translate(${-this.props.height/2},-30)`;
    }
    else {
      var transform=`translate(${this.props.width/2},35)`;
    }
    // Renders the nodes initially and then lets d3 call the axis on the node
    return(
      <g className="axisGroup" transform={this.props.transform} >
        <g className="axis" ref="axis" />
        <g className="axisLabel" ref="label">
          <text textAnchor="middle" transform={transform}>{this.props.label}</text>
        </g>
      </g>
    );
  }

});

module.exports = Axis;
