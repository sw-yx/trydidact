// import Observable from 'zen-observable'

// // create
// const app = document.getElementById('app')
// const div = document.createElement('div')
// const btn = document.createElement('btn')
// btn.innerText = 'click me'
// div.appendChild(btn)
// const div2 = document.createElement('div')
// div2.innerText = '0'
// div2.id = 'div2'
// div.appendChild(div2)

// if (app.firstChild) app.replaceChild(div, app.firstChild)
// else app.appendChild(div)


// // listen
// scan(
//   fromEvent(btn, 'click'),
//   (prev, cur) => {
//     document.getElementById('div2').innerText = prev + 1
//     return prev + 1
//   },
//   0
// ).subscribe(x => console.log('Clicked! ' + x));

// function fromEvent(el, eventType) {
//   return new Observable(observer => {
//     el.addEventListener(eventType, e => observer.next(e))
//     // on unsub, remove event listener
//     return () => console.log('not implemented yet')
//   })
// }

// function scan(obs, cb, initial) {
//   const INIT = Symbol('NO_INITIAL_VALUE')
//   let sub, acc = INIT
//   if (typeof initial !== 'undefined') acc = initial
//   return new Observable(observer => {
//     if (!sub) sub = obs.subscribe(val => {
//       if (acc !== INIT) acc = cb(acc, val)
//       observer.next(acc)
//     })
//   })
// }