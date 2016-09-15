var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");

/* Creates a line that is hidden unless hovered. Can be clicked to lock as visible. Props:
    path: path to use to draw line
    color: color of line
*/
var Line = React.createClass({
  getInitialState: function() {
    /*
    display: true/false of visibility
    locked: true/false of whether it's locked from hover
    */
    return{
      display: false,
      locked: false,
    }
  },
  componentDidMount: function() {
    this.setEvents(true);
  },
  componentDidUpdate: function() {
    this.setEvents(false);
  },

  // Set mouse events
  setEvents: function(mount) {
    var node = ReactDOM.findDOMNode(this);
    d3.select(node).on("mouseover", this.onHover);
    d3.select(node).on("mouseout", this.onMouseOut);
    d3.select(node).on("mousedown", this.click);
  },

  // Hover displays line
  onHover: function() {
    this.setState({display: true});
  },

  // Unhover hides line, unless it's locked
  onMouseOut: function() {
    if(!this.state.locked) {
      this.setState({display: false});
    }
  },

  // Click locks line as visible
  click: function() {
    this.setState({locked: !this.state.locked});
  },
  render: function() {
    var props = this.props;

    // Visible
    if(this.state.display) {
        var lineStyle = {
        fill: 'none',
        strokeWidth: '3px',
        opacity: '1'
      };
    }
    // Invisible
    else {
      var lineStyle = {
        fill: 'none',
        strokeWidth: '3px',
        opacity: '0'
      };
    }

    return(
      <path style={lineStyle} d={props.path} stroke={props.color}/>
    )
  },
});

module.exports = Line;
