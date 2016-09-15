var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var _ = require("underscore");

/* Draws a single bar on the graph. Props:
    height: height of the bar
    width: width of the bar
    value: data value of the bar (count or percentage)
    label: label for the bar
    xPos: starting x-position for the bar
    style: opacity of bar (used with selection)
    availableHeight: overall height of graph (needed for y position)
    cut: true/false whether the bar was cut or not
    color: background color of the bar
*/
var Bar = React.createClass({
  getDefaultProps: function() {
    return({
      yOffset: 0,
    })
  },
  render: function() {
    // Set up the positioning variables
    var yPos = this.props.availableHeight - this.props.height - this.props.yOffset;
    var xPos = this.props.xPos;
    var textX = xPos + (this.props.width/2);
    var textY = yPos + 15;

    // Style and position of the text depends on whether it will fit inside the bar or not
    var textStyle = {fill: 'white',};
    if (this.props.height < 17) {
      textY = yPos -3;
      textStyle = {fill: `black`,};
    }

    // If the bar was cut, overlay a "squiggle" to visually indicate so
    if(this.props.cut){
    var outlinePath = `M  ${xPos-(this.props.width/5)} ${yPos+25} q ${(this.props.width+(2*this.props.width/5))/4} -${this.props.width/5} ${(this.props.width+(2*this.props.width/5))/2} 0 t ${(this.props.width+(2*this.props.width/5))/2} 0 l 0 ${this.props.height/30}
                q ${-(this.props.width+(2*this.props.width/5))/4} ${this.props.width/5} ${-(this.props.width+(2*this.props.width/5))/2} 0 t ${-(this.props.width+(2*this.props.width/5))/2} 0  Z`;
    var borderPath = `M  ${xPos-(this.props.width/5)} ${yPos+25} q ${(this.props.width+(2*this.props.width/5))/4} -${this.props.width/5} ${(this.props.width+(2*this.props.width/5))/2} 0 t ${(this.props.width+(2*this.props.width/5))/2} 0 m 0 ${this.props.height/30}
                q ${-(this.props.width+(2*this.props.width/5))/4} ${this.props.width/5} ${-(this.props.width+(2*this.props.width/5))/2} 0 t ${-(this.props.width+(2*this.props.width/5))/2} 0  `;
  }
    return (
      <g>
        <rect style={this.props.style} onClick={this.onClick} fill={this.props.color} width={this.props.width} height={this.props.height}
        x={xPos} y={yPos}/>
        {this.props.value > 0 ? <text textAnchor="middle" width={this.props.width} style={textStyle} x={textX} y={textY} >{this.props.label}</text>
          : null}
        {this.props.cut ? <path fill="white"  d={outlinePath}/>: null}
        {this.props.cut ? <path fill="none" stroke="black" strokeWidth={2} d={borderPath} /> : null}
      </g>
    );
  }
});

module.exports = Bar;
