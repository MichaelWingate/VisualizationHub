var React = require('react');
var d3 = require("d3");
var ReactDOM = require("react-dom");
var Random = require("./random");

/* Draws a curve over the histogram for the specified distribution. Props:
    type: type of curve. "normalPDF" or "log"
    mu: mean of distribution
    sigma: standard deviation of distribution
    min: smallest x-value
    max: largest x-value
    points: number of data points
    binWidth: width of each bin
    xScale: d3 scale used for x-axis
    yScale: d3 scale used for y-axis
    bins: data bins (if fitting curve to data)
*/
var DistributionCurve = React.createClass({
  getInitialState: function() {
    /* hover: true/false if the line is hovered over
       coords: array with x/y coordinates of the hover
    */
    return({
      hover: false,
      coords: [0,0],
    })
  },
  componentDidMount: function() {
    this.setEvents();
  },
  componentDidUpdate: function() {
    this.setEvents();
  },

  // Set mouse events
  setEvents: function() {
    var node = ReactDOM.findDOMNode(this.refs.line);
    d3.select(node).on("mouseover", this.onMouseOver);
    d3.select(node).on("mousemove", this.onMouseMove);
    d3.select(node).on("mouseout", this.onMouseOut);
  },

  // Set hover to true and record the coordinates
  onMouseOver: function() {
    var node = ReactDOM.findDOMNode(this.refs.line);
    var coords = d3.mouse(node);
    this.setState({ hover: true,
                    coords: coords});
  },

  // Set hover to false
  onMouseOut: function() {
    this.setState({hover: false});
  },

  // Move the coords
  onMouseMove: function() {
    var node = ReactDOM.findDOMNode(this.refs.line);
    var coords = d3.mouse(node);
    this.setState({coords: coords});
  },
  render: function() {
    var props = this.props;
    /*
    if(props.curve == "normalRand") {
      var random = new Random();
      var normalPoints = [];
      var sampleSize = 100000;
      var normalScale = props.data.length/sampleSize;
      for(var i = 0; i< sampleSize;i++) {
        normalPoints.push(Math.round(random.normal(mu,sigma)));
      }
      var normalBins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(xScale.ticks(props.ticks))
        (normalPoints);

      var line = d3.line()
        .x(function (d) { return xScale(d.x0 + ((d.x1-d.x0)/2)); })
        .y(function (d) { return yScale(d.length*normalScale); })
        .curve(d3.curveNatural)
        (normalBins);
    }*/

    // Create the line of a normal distribution using a PDF based off of the mu and sigma
    if(props.type == "normalPdf") {
      var normalPoints = [];
      var stepNumber = 50;
      for(var i=props.min; i<props.max; i=i+((props.max-props.min)/stepNumber)) {
        normalPoints.push({x:i});
      }
      normalPoints.map(function(point,i) {
        var prob = (1/Math.sqrt(2*props.sigma*props.sigma*Math.PI))*Math.pow
          (Math.E,-(Math.pow(point.x-props.mu,2)/(2*props.sigma*props.sigma)));
        normalPoints[i].y = prob*props.points*props.binWidth;
      })
      var line = d3.line()
        .x(function (d) { return props.xScale(d.x); })
        .y(function (d) { return props.yScale(d.y); })
        .curve(d3.curveNatural)
        (normalPoints);
      var mean = props.mu;
      var stdDev = props.sigma;
    }

    // Create the line of a log distribution using a PDF based off of the mu and sigma
    else if(props.type == "log") {
      var normalPoints = [];
      var stepNumber = 50;
      for(var i=props.min; i<props.max; i=i+((props.max-props.min)/stepNumber)) {
        normalPoints.push({x:i});
      }
      normalPoints.map(function(point,i) {
        var prob = (1/(point.x*props.sigma*Math.sqrt(2*Math.PI)))*Math.pow
          (Math.E,-(Math.pow(Math.log(point.x)-props.mu,2)/(2*props.sigma*props.sigma)));
        normalPoints[i].y = prob*props.points*props.binWidth;
      })
      var line = d3.line()
        .x(function (d) { return props.xScale(d.x); })
        .y(function (d) { return props.yScale(d.y); })
        .curve(d3.curveNatural)
        (normalPoints);
      var mean = Math.pow(Math.E,props.mu+((props.sigma*props.sigma)/2));
      var stdDev = Math.sqrt((Math.pow(Math.E,props.sigma*props.sigma)-1)*Math.pow(Math.E,2*props.mu+(props.sigma*props.sigma)));
    }
/*
    else if(props.type == "dataFit") {
      var line = d3.line()
        .x(function (d) { return props.xScale(d.x0 + ((d.x1-d.x0)/2)); })
        .y(function (d) { return props.yScale(d.length); })
        .curve(d3.curveNatural)
        (props.bins);
    }*/

    var lineStyle = {
      fill: 'none',
      stroke: '#7dc7f4',
      strokeWidth: '5px'
    };
    var labelTransform = `translate(${this.state.coords[0]}, ${this.state.coords[1]})`;

    normalPoints.sort(sort);

    // Positions the hover label based off of where the hover is
    if(this.state.coords[0] <= this.props.xScale(normalPoints[0].x)){var xTranslate = -110;}
    else {var xTranslate = 0;}
    return(
      <g>
        <path ref="line" style={lineStyle} d={line} />
        {this.state.hover ? <g transform={labelTransform}> <rect x={xTranslate} y={-50} width={110} height={50} fill="none" stroke="black" />
            <text y={-50}>
              <tspan x={xTranslate+2} dy={"1.2em"} >Mean: {mean.toFixed(2)} </tspan>
              <tspan x={xTranslate+2} dy={"1.2em"} >Std Dev: {stdDev.toFixed(2)} </tspan>
            </text> </g> : null}
      </g>
  )}
});
function sort(a,b) {
  if(a.y < b.y) {
    return 1;
  }
  if(a.y > b.y) {
    return -1;
  }
  return 0;
}
module.exports = DistributionCurve;
