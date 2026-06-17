// Lightweight Phaser ↔ React event bridge
const _handlers = {}

export function on(event, handler) {
  _handlers[event] = handler
}

export function off(event) {
  delete _handlers[event]
}

export function emit(event, data) {
  _handlers[event]?.(data)
}
