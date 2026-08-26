# Integrate persistent Whiteboard gateway

Participant meetings now call the Whiteboard provider's `createCanvas` method with the meeting title and invited participant handles exactly as exposed by the updated gateway. Participant-free meetings continue to use the resource-keyed `createDisposableCanvas` method.
