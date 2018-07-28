/** @jsx createElement */
import { render, createElement, Component } from "./src/didact";

class LabeledSlider extends Component {
  render() {
    const {value, onInput} = this.props
    return <input type="range" onInput={onInput} min={20} max={80} value={value}/>
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = { value: 40 };
  }
  onInput(e) {
    this.setState({ value: e.target.value });
  }
  render() {
    const {value} = this.state
    return (
      <div>
        <LabeledSlider onInput={this.onInput.bind(this)} value={value}/>
        {value}
      </div>
    );
  }
}

render(<App />, document.getElementById("app"));
