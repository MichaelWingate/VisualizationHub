var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");
/* Draws an axis with ticks and a label. Props:
    scale: d3 scale used to create the axis
    transform: transformation to position the axis
    width: width of graph
    height: height of graph
    label: string to label the axis
    ticks: number of ticks being used for binning
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
    var axis = d3.axisBottom(this.props.scale)
                .ticks(this.props.ticks);
    d3.select(axisNode).call(axis);
  },
  render() {
    // Label transform
    var transform=`translate(${this.props.width/2},35)`;
    var text = this.props.label;

    // Renders the nodes initially and then lets d3 call the axis on the node
    return(
      <g className="axisGroup" transform={this.props.transform} >
        <g className="axis" ref="axis" />
        <g className="axisLabel" ref="label">
          <text textAnchor="middle" transform={transform}>{text}</text>
        </g>
      </g>
    );
  }
});

module.exports = Axis;
