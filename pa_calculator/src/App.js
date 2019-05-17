import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      values: {
        id0: 12,
      },
      number: 1
    };
    this.addActivity = this.addActivity.bind(this);
    this.addValue = this.addValue.bind(this);
    this.removeActivity = this.removeActivity.bind(this);
  }

  addActivity() {
    this.setState({number: this.state.number + 1});
    let values=this.state.values;
    values[`id${this.state.number}`] = 12;
  }

  addValue(val, id) {
    const prevValues=this.state.values;
    prevValues[id]=val;
    this.setState({values: prevValues});
  }

  removeActivity() {
    let values = this.state.values;
    delete values[`id${this.state.number-1}`];
    this.setState({number: this.state.number - 1});
  }

  render() {
    const children = [];

    for (let i = 0; i < this.state.number; i+=1) {
      children.push(<Calculator key={i} number={i} onValueChange={this.addValue}/>);
      
    };

    const valueObject = this.state.values;

    return (
      <div>
      {children}
      <div id="container">
      <button id="add" onClick={this.addActivity}>Add Activity</button>
      <button id="remove" onClick={this.removeActivity}>Remove Activity</button>
      </div>
      <p id="totalResult">Total energy expended: {objectSum(valueObject)} kcal</p>
      </div>
  );
    }
}

export default App;

//components

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.handleMassChange = this.handleMassChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleActivityChange = this.handleActivityChange.bind(this);
    this.handleSpecificActivityChange = this.handleSpecificActivityChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.state = {
      mass: 50,
      time: 1,
      activity: "bicycling"
    };
  }

  handleMassChange(mass) {
    this.setState({mass: mass});
  }

  handleTimeChange(time) {
    this.setState({time: time});
  }

  handleActivityChange(activity) {
    this.setState({activity: activity});
  }

  handleSpecificActivityChange(met) {
    this.setState({met: met});
  }

  handleValueChange(val) {
    this.props.onValueChange(val, `id${this.props.number}`);
  }

  render() {
    return (
      <div className = "App">
      
      <Mass value={this.state.mass} onMassChange={this.handleMassChange} />

      <Time value={this.state.time} onTimeChange={this.handleTimeChange}/>

      <Activity onActivityChange={this.handleActivityChange} />
      
      <SpecificActivity activity={this.state.activity} onSpecificActivityChange={this.handleSpecificActivityChange} />

      <Result mass={this.state.mass} time={this.state.time} met={this.state.met} onValueChange={this.handleValueChange}/>

      </div>
      )
  }
}

class Mass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onMassChange(e.target.value);
  }

  render () {
    return (
      <div id="mass">
        <label>Body mass (kg):</label>
        <input type="number" min={1} max={700} step={0.1} defaultValue = {this.props.value} onChange={this.handleChange} required></input>
      </div>
    )
  }
}

class Time extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onTimeChange(e.target.value);
  }

  render() {
    return( 
      <div id="time">
        <label>Time spent (min):</label>
        <input type="number" min={1} defaultValue = {this.props.value} onChange={this.handleChange} required></input>
      </div>
    )
  }
}

class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onActivityChange(e.target.value);
  }

  render() { 
    return(
    <div id="activity">
      <label>Activity:</label>
      <select id="act_inp" onChange={this.handleChange} required>
        {createSelectOptions(activities)}
      </select>
    </div>

    )
  }
};

class SpecificActivity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      activity: props.activity,
      specific: "",
      value: 14,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    fetch(`http://localhost:5000/${this.state.activity}`)
      .then(res => res.json())
      .then (
        (result) => {
          this.setState({
            isLoaded: true,
            items: renderResponse(result),
            specific: result[0]["activity"],
            value: result[0]["MET"],
            result: result,
          });
          this.props.onSpecificActivityChange(result[0]["MET"]);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.activity !== prevState.activity) {
      return {
        isLoaded: false,
        items: [],
        activity: nextProps.activity,
      }
    } else {
      return null
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.activity !== prevProps.activity) {
      fetch(`http://localhost:5000/${this.state.activity}`)
      .then(res => res.json())
      .then (
        (result) => {
          this.setState({
            isLoaded:true,
            items: renderResponse(result),
            specific: result[0]["activity"],
            value: result[0]["MET"],
            result: result,
          });
          this.props.onSpecificActivityChange(result[0]["MET"]);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
    }
  }

  handleChange(e) {
    const result = this.state.result;
    const value = e.target.value;
    this.setState({specific: value});
    for (let i = 0; i < result.length; i++ ) {
      if (result[i]["activity"] === value) {
        this.setState({value: result[i]["MET"]});
        this.props.onSpecificActivityChange(result[i]["MET"]);
      }
    }
  }

  render() {
    const { error, isLoaded, items } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div id="specific_activity">
        <label>Specific activity:</label>
        <select id="spec_act_inp" onChange={this.handleChange} required>
          {createSelectOptions(items)}
        </select>
    </div>
      )
    }
  }

};

class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: Math.round(this.props.mass * (this.props.time/60) * this.props.met)
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextValue = Math.round(nextProps.mass * (nextProps.time/60) * nextProps.met);
    if (nextValue !== prevState.value) {
      return {
        value: nextValue
      }
    } else {
      return null
    };
  }

  componentDidUpdate(prevProps) {
    if ((this.props.mass !== prevProps.mass) || (this.props.time !== prevProps.time) || (this.props.met !== prevProps.met)){
      this.props.onValueChange(this.state.value);
    }
  }
  
  render() {
    return (<div id="result">
    <p>Energy expended: {this.state.value} kcal</p>
    </div>)
  }

}

//helper functions

//select setup
const activities = [ "bicycling", "conditioning exercise", "dancing", "fishing and hunting", "home activities", "home repair", "inactivity, light activity", "lawn and garden", "miscellaneous", "music playing", "occupation", "religious activities", "running", "self care", "sexual activity", "sports", "transportation", "volunteer activities", "walking", "water activities", "winter activities"];

function createSelectOptions (array) {
  let items = [];
    for (let i = 0; i <= (array.length-1); i++) {
        items.push(<option key={i} value = {array[i]}>{capitalize(array[i])}</option>);
    };
    return items;
}

//capitalization

function capitalize(string) 
{
  return string.charAt(0).toUpperCase() + string.slice(1);
};

//array sum
function getSum(total, num) {
  return total + num; 
}

function arraySum(array) {
  return array.reduce(getSum);
}

function objectSum(object) {
  return arraySum(Object.values(object));
}

//render response from API

function renderResponse(res) {
  //handles if res is falsey
  if (!res) {
    console.log(res.status);
  };

  let activityList = [];

  for (let i = 0; i < res.length; i++) {
    activityList.push(res[i]["activity"]);
  };

  return activityList;

};
