/** @jsx createElement */
import { render, createElement, Component } from "./src/didact";

class App extends Component {
  constructor() {
    super();
    this.state = { test: 123 };
  }
  click() {
    this.setState({ test: this.state.test + 1 });
  }
  render() {
    return (
      <div>
        {" "}
        hello boop, this is didact.js {this.state.test} running in parcel{" "}
        <button onClick={this.click.bind(this)}>test </button>
      </div>
    );
  }
}

render(<App />, document.getElementById("app"));
