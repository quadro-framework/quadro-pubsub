## Wildcard Handlers

quadro-pubsub automatically falls back to using `_all.js` as a handler for unregistered messages, therefore if your service has unregistered messages (example: `subscribes: '*'`), you must add `_all.js` as a handler to the service 