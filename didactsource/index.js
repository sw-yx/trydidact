/** @jsx createElement */
import { render, createElement, Component } from "./src/didact";
import "./index.css"


// // this is cyclejs https://jsbin.com/yojoho/embed?js,output
let state = 50
const appElement = () => (
  <div>
    {LabeledSlider()}
    <div>{state}</div>
  </div>
)
function LabeledSlider() {
  return <input type="range" min={20} max={80} value={state} 
  // onInput={e$ => {
  //   e$.subscribe(e => {
  //     state = e.target.value;
  //     render(appElement(), document.getElementById("app"));
  //   })
  // }}

  onInput={e => {
      state = e.target.value;
      console.log(state)
      render(appElement(), document.getElementById("app"));
  }}
  />
}


// //  this is didact

// const randomLikes = () => Math.ceil(Math.random() * 100);

// const stories = [
//   {
//     name: "Didact introduction",
//     likes: randomLikes()
//   },
//   {
//     name: "Rendering DOM elements ",
//     likes: randomLikes()
//   },
//   {
//     name: "Element creation and JSX",
//     likes: randomLikes()
//   },
//   {
//     name: "Instances and reconciliation",
//     likes: randomLikes()
//   },
//   {
//     name: "Components and state",
//     likes: randomLikes()
//   }
// ];

// const appElement = () => <div><ul>{stories.map(storyElement)}</ul></div>;

// function storyElement(story) {
//   return (
//     <li>
//       <button onClick={e => handleClick(story)}>{story.likes}<b>❤️</b></button>
//       {story.name}
//     </li>
//   );
// }

// function handleClick(story) {
//   story.likes += 1;
//   render(appElement(), document.getElementById("app"));
// }

render(appElement(), document.getElementById("app"));

// class App extends Component {
//   constructor() {
//     super();
//     this.state = { test: 123 };
//   }
//   click() {
//     this.setState({ test: this.state.test + 1 });
//   }
//   render() {
//     return (
//       <div>
//         {" "}
//         hello boop, this is didact.js {this.state.test} running in parcel{" "}
//         <button onClick={this.click.bind(this)}>test </button>
//       </div>
//     );
//   }
// }

// render(<App />, document.getElementById("app"));
