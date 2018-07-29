import Observable from 'zen-observable'

export function fromEvent(el, eventType) {
  return new Observable(observer => {
    el.addEventListener(eventType, e => observer.next(e))
    // on unsub, remove event listener
    return () => console.log('not implemented yet')
  })
}

export function scan(obs, cb, initial) {
  const INIT = Symbol('NO_INITIAL_VALUE')
  let sub, acc = INIT
  if (typeof initial !== 'undefined') acc = initial
  return new Observable(observer => {
    if (!sub) sub = obs.subscribe(val => {
      if (acc !== INIT) acc = cb(acc, val)
      observer.next(acc)
    })
  })
}


export function merge(...obsArgs) {
  return new Observable(observer => {
    const subs = obsArgs.map(obs => obs.subscribe(x => observer.next(x)))
    // todo: handle unsubscribe haha
    return () => subs.forEach(sub => sub()) // untested, hope it works
  })
}