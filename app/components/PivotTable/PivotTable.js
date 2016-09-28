var React = require('react');
var ReactDOM = require('react-dom');
var PivotSeries = require('./PivotSeries');

var PivotTable = React.createClass({
  render: function() {
    var props = this.props;

    var fieldOptions = props.fieldOptions;
    fieldOptions.push("none");
    return (
      <PivotSeries width={props.width} height={props.height} data={props.data} initialMeasurementRef={props.initialMeasurementRef} measurementOptions={props.measurementOptions}
        initialMeasurementType={props.initialMeasurementType} initialRowField={props.initialRowField} initialColField={props.initialColField} fieldOptions={fieldOptions}   />
    )
  }
});

module.exports = PivotTable;
