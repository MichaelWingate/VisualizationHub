var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');
var $ = require('jquery');
var DataTable = require('./components/DataTable/DataTable');
var Histogram = require('./components/Histogram/Histogram');
var LinePlot = require('./components/LinePlot/LinePlot');
var PieChart = require('./components/PieChart/PieChart');
var PivotTable = require('./components/PivotTable/PivotTable');

var VisualizationHubApp = React.createClass({
  getInitialState: function() {
    /* data: data for the visualizations
       selected: array of ids selected by the table
       ids: array of ids selected by a graph
       group: data reference to group the Histogram
       hStyle: style of histogram's grouping
       curve: what type of curve to overlay on the Histogram
       icons: whether to display icons instead of points
       lStyle: Style of line plot
       y: y variable measured for line plot
       dStyle: styling of data cells inside table
    */
    return({
      data: [],
      selected: [],
      ids: [],
      group: "none",
      hStyle: "side",
      curve: "none",
      icons: false,
      lStyle: "normal",
      y: "Temp",
      dStyle: ["none"],
    })
  },

  // Gets the data (currently temps.csv from the public folder) and puts it
  // into an object.
  componentWillMount: function(){
    $.ajax({
        type: "GET",
        url: "temps.csv",
        dataType: "text",
        async: false,
        success: function(allText) {
          var allTextLines = allText.split(/\r\n|\n/);
          var headers = allTextLines[0].split(',');
          var lines = [];

          for (var i=1; i<allTextLines.length; i++) {
              var data = allTextLines[i].split(',');
              if (data.length == headers.length) {

                  var tarr = {};
                  for (var j=0; j<headers.length; j++) {
                      var cell = data[j];
                      if(headers[j] == "ID" || headers[j] == "Temp") {
                        cell = Number(data[j]);
                      }
                      tarr[headers[j]] = cell;
                  }
                  lines.push(tarr);
              }
          }
          this.setState({data: lines})
        }.bind(this)
     });
  },

  // This function is used in the visualizations to select and only display
  // a specific selection of data rows, determined by ID.
  displaySelected: function(ids) {
    this.setState({ids: ids});
  },

  // Handles table row clicks. Selects/deselects rows and updates the array
  // of selected rows (by ID). This is sent to the visualizations.
  selectPoint: function(data,clicked) {
    var currentIds = this.state.selected;
    if(clicked) {
      currentIds.push(data);
    }
    else {
      var index = currentIds.indexOf(data);
      currentIds.splice(index,1);
    }
    this.setState({selected: currentIds});
  },

  // Toggles the icon setting
  iconChange: function(e) {
    if(e.currentTarget.value == "false") {
      var value = false;
    }
    if(e.currentTarget.value == "true") {
      var value = true;
    }
    this.setState({icons: value});
  },

  // Updates the line plot style
  lStyleChange: function(e) {
    this.setState({lStyle: e.currentTarget.value});
  },

  // Updates the line plot y variable
  yChange: function(e) {
    this.setState({y: e.currentTarget.value});
  },

  // Updates the Histogram grouping
  groupChange: function(e) {
    this.setState({group: e.currentTarget.value});
  },

  // Updates the Histogram style
  hStyleChange: function(e) {
    this.setState({hStyle: e.currentTarget.value});
  },

  // Updates the Histogram curve
  curveChange: function(e) {
    this.setState({curve: e.currentTarget.value});
  },

  // Updates the data table style
  dStyleChange: function(e) {
    this.setState({dStyle: [e.currentTarget.value]});
  },

  render: function() {
    // Col names and col refs corresponding to the data object. Used in the
    // visualizations to access the proper data fields.
    var cols = ["ID","Date","Temp","Location","Weather"];
    var refs = ["ID","Date","Temp","Location","Weather"];

    // If a selection was made, this filters out everything else
    var newData = [];
    if(this.state.ids.length > 0) {
      this.state.data.map(function(value,i){
        if(this.state.ids.indexOf(value.ID) != -1) {
          newData.push(value);
        }
      },this)
    }
    else {newData = this.state.data}

    return(
      <div>
      <div>
        {this.state.data != [] ?<Histogram height={500} width={750} data={this.state.data} measurement={"Temp"} id={"ID"} ticks={10}
          displaySelected={this.displaySelected} pointSelected={this.state.selected} group={this.state.group} multiStyle={this.state.hStyle} curve={this.state.curve}/> : null}
        {this.state.data != [] ? <LinePlot height={500} width={750} data={this.state.data} xMeasurement={"Date"} yMeasurement={this.state.y} id={"ID"} group={"Location"}
          displaySelected={this.displaySelected} pointSelected={this.state.selected} icons={this.state.icons} style={this.state.lStyle}/> : null}
          <div style={{float: 'right', width: '300px', height: '1000px', border: '1px solid black'}}>
            <form>
            <h2>Histogram</h2>
            Group By: <br/><input type="radio" name="group" value="none" checked={this.state.group == "none"} onChange={this.groupChange}/>None <br/>
                      <input type="radio" name="group" value="Location" checked={this.state.group == "Location"} onChange={this.groupChange}/>Location <br/>
                      <input type="radio" name="group" value="Weather" checked={this.state.group == "Weather"} onChange={this.groupChange}/>Weather <br/>
            Style: <br/><input type="radio" name="hStyle" value="side" checked={this.state.hStyle == "side"} onChange={this.hStyleChange} />Side-by-Side <br />
                        <input type="radio" name="hStyle" value="stacked" checked={this.state.hStyle == "stacked"} onChange={this.hStyleChange} />Stacked <br />
                        <input type="radio" name="hStyle" value="100" checked={this.state.hStyle == "100"} onChange={this.hStyleChange} />100% Stacked <br />
            Curve: <br/><input type="radio" name="curve" value="none" checked={this.state.curve == "none"} onChange={this.curveChange} />None <br />
                        <input type="radio" name="curve" value="normalPdf" checked={this.state.curve == "normalPdf"} onChange={this.curveChange} />Normal PDF <br />
                        <input type="radio" name="curve" value="log" checked={this.state.curve == "log"} onChange={this.curveChange} />Log-Normal PDF <br />
            <h2>Line Plot</h2>
            Icons: <br/><input type="radio" name="icons" value="false" checked={!this.state.icons} onChange={this.iconChange}/>None <br/>
                      <input type="radio" name="icons" value="true" checked={this.state.icons} onChange={this.iconChange}/>Icons <br/>
            Style: <br/><input type="radio" name="lStyle" value="normal" checked={this.state.lStyle == "normal"} onChange={this.lStyleChange}/>Normal <br/>
                        <input type="radio" name="lStyle" value="cumulative" checked={this.state.lStyle == "cumulative"} onChange={this.lStyleChange}/>Cumulative <br/>
                        <input type="radio" name="lStyle" value="categorical" checked={this.state.lStyle == "categorical"} onChange={this.lStyleChange}/>Categorical <br/>
                        <input type="radio" name="lStyle" value="polar" checked={this.state.lStyle == "polar"} onChange={this.lStyleChange}/>Polar <br/>
            yMeasurement: <br/><input type="radio" name="y" value="Temp" checked={this.state.y == "Temp"} onChange={this.yChange}/>Temperature <br />
                          <input type="radio" name="y" value="Weather" checked={this.state.y == "Weather"} onChange={this.yChange}/>Weather <br/>
            <h2>Data Table</h2>
            Cell Styling: <br/><input type="radio" name="dStyle" value="none" checked={this.state.dStyle[0] == "none"} onChange={this.dStyleChange} /> None <br/>
                          <input type="radio" name="dStyle" value="bar" checked={this.state.dStyle[0] == "bar"} onChange={this.dStyleChange} /> Background Bar <br/>
                          <input type="radio" name="dStyle" value="shade" checked={this.state.dStyle[0] == "shade"} onChange={this.dStyleChange} /> Color Shade <br/>
            </form>
          </div>
      </div>
        <div>
          {newData != [] ? <DataTable selectPoint={this.selectPoint} height={600} width={950} data={newData} colNames={cols} colRefs={refs} cellStyle={this.state.dStyle}/> : null}
          {this.state.data != [] ?<PivotTable height={1600} width={1400} data={this.state.data} initialMeasurementRef={"Temp"} measurementOptions={["Temp","WeatherScore"]}
            initialMeasurementType={"Sum"} initialRowField={"Date"} initialColField={"Weather"} fieldOptions={["Date", "Location", "Weather"]}/> : null}
            {this.state.data != [] ?<PieChart height={600} width={600} data={this.state.data}
              category="Weather" innerScale={.5} padAngle={.015} cornerRadius={7} displaySelected={this.displaySelected} idRef={"ID"} /> : null}
        </div>
      </div>
    )
  }
});

ReactDOM.render(<VisualizationHubApp />, app);
