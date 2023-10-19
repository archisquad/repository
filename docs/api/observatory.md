# Observatory API

## What is Observatory?

The `Observatory` class represents an object that observes changes in a subject
and notifies its subscribers.

### Observer Pattern

The `Observatory` class uses the Observer pattern to observe changes in a
subject and notify its subscribers. This pattern allows for loose coupling
between the subject and its observers, making adding or removing observers easy
without affecting the subject.

### Wording

The following terms are used in the `Observatory` class:

- **Observatory**: The object (the `Observatory` class instance, to be precise)
  that observes changes in the subject and notifies its subscribers.
- **Observer**: An object subscribing to the `Observatory` to receive
  notifications when the subject changes.
- **Observed**: The subject (e.g., class instance, function, object, method,
  etc.) that is being observed by the `Observatory`.
- **Subscription**: An object that represents a registered **Observer** into the
  `Observatory`.
- **Callback**: A function called when the subject changes.

## How it works

The `Observatory` class works by observing changes in a subject and notifying
its subscribers. Here are some of the ways it can be used:

- **Simple observer**: Observed object has only one action that allows it to be
  observed for
- **Multiple actions**: Observed object allows to observe (creating
  subscriptions) for more than one actions

Given callback can be run:

- synchronously (standard functions),
- asynchronously (Promises, async functions)
- while the browser is idle (using
  [idle callback API](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback))

The callback might receive data from the observed object depending on the
configuration given during the `Observatory` instance construction.

### Single Observer

This code example shows how to use the Observatory API to set up a simple observer that listens for a single event and responds when that event happens.

```ts
import { observerFactory } from '@archisquad/repository'

const { trigger, observe } = observerFactory()

// First create a subscription
observe(() => {
  console.log("Hello, world!")
})

// Then trigger the event inside of Observed object
trigger()
```

1. Create an instance of the Observatory by calling observerFactory().
1. Use the observe method to set up a subscription. In this case, we're observing an event and specifying that when the event occurs, we want to print "Hello, world!" to the console.
1. Trigger the event using the trigger method to see the observer in action. When you call trigger(), it will execute the observer, and you'll see "Hello, world!" in the console.

### Multiple Actions

This example demonstrates how to work with multiple actions and different observers for each action.

```ts
import { observerFactory } from '@archisquad/repository'

const { trigger, observe } = observerFactory({
  // To the config object you can pass multiple actions
  actions: ['add', 'remove']
})

// You can register each observer individually
observe({
  action: "add",
  observer: () => {
    console.log("Add happen!")
  },
})

// Or you can register multiple observers at once
observe(
  {
    action: "remove",
    observer: () => {
      console.log("Remove happen!")
    },
  },
  {
    action: "add",
    observer: () => {
      console.log("Add happen!")
    },
  }
)

// Now you can trigger actions
trigger("add")
trigger("remove")
```

1. Create an instance of the Observatory by calling observerFactory(). You can also pass a configuration object with multiple actions, in this case, "add" and "remove."
1. Use the observe method to register observers for specific actions. You can register each observer individually or register multiple observers at once.
  - For "add," when something is added, it prints "Add happen!" to the console.
  - For "remove," when something is removed, it prints "Remove happen!" to the console.
1. Trigger the actions using the trigger method. You can use trigger("add") or trigger("remove") to execute the associated observers for each action.

### Idle browser

In this code example, we set up an observer that runs when the browser is idle. This means it waits for the browser to have some free processing time before executing.

```ts
observe({
  action: "add",
  observer: () => {
    console.log("add happened")
  },
  // When observer need to be run when the browser is idle
  idle: true,
})
```

1. Use the observe method to register an observer for a specific action, which is "add" in this case.
1. The observer, when set up to run "idle," will wait for the browser to be in an idle state before executing. In this case, it prints "add happened" to the console.

::: warning Browser support
What happen if browser doesn't support the `registerIdleCallback` API? Then, it waits 2000ms using `setTimeout`.
:::

### Asynchronous callbacks

This code demonstrates how to use the Observatory API with asynchronous callbacks, such as making API calls.

```ts
import { observerFactory } from '@archisquad/repository'
import { someApiCall } from 'your-path'

const { trigger, observe } = observerFactory({
  actions: ["add", "remove"],

})

observe({
  action: "add",
  observer: async () => {
    await someApiCall()
    console.log("add happened & api call finished")
  },
})
```

1. Create an instance of the Observatory by calling `observerFactory()`. You can also pass a configuration object with actions, "add" and "remove."
1. Use the observe method to register an observer for the "add" action.
1. The observer is asynchronous, and it calls an async function that represents making an API call. In this case, it's simulating calling an API with `someApiCall()`.
1. After the API call is completed, it prints "add happened & api call finished" to the console.

### Access to the data inside of callbacks

This code example illustrates how to access and provide data to observer callbacks when specific actions are triggered using the Observatory API.

```ts
import { observerFactory } from '@archisquad/repository'

const { trigger, observe } = observerFactory({
  actions: ["add", "remove"],
  // Here, you can define function which is called each time
  // action is triggered. The result will be injected into each
  // callback function.
  dataAccessor: () => ({
    id: '1',
    name: 'sample'
  })

})

observe({
  action: "add",
  observer: (data) => {
    console.log("add happened, here's new data": data)
  },
})
```

1. Create an instance of the Observatory using `observerFactory()` and configure it to observe two actions: "add" and "remove."
1. In the configuration, there's a special function called `dataAccessor` that is defined. This function is called each time an action is triggered. The data returned by this function will be injected into each callback function associated with the observed actions.
1. Use the `observe` method to register an observer for the "add" action. The observer function takes an argument, data, which represents the data provided by the `dataAccessor` function.
1. When the "add" action is triggered using the `trigger("add")` method, the observer function is executed. In this case, it logs "add happened, here's new data," followed by the data object, to the console. The data object contains the properties id and name with the values provided by the dataAccessor function.

## FAQ

**Q: What can be observed?**

A: For any action you define, there is no direct bind to any method, object, or
instance. You define actions during the `Observatory` initialization.

**Q: What can be observed?**

A: Anything with access to the `observe()` method from the `Observatory`
instance you create.

**Q: Since when is observation possible?**

A: Callbacks will be triggered after they are added as subscriptions to a given
action

**Q: Can I add the same callback twice?**

A: No for the same action & configuration. But you can define different
configurations or select different actions then you will be able to use the same
function.

**Q: When is the callback run?**

A: It depends. If you declare a synchronous function as a callback during the
subscription, it runs right after the observed object runs `trigger()`. But if
your function is asynchronous, it will be run according to the EventLoop
handling mechanism. After all, synchronous actions will be finished in the
current queue, and Promise will be ready to be resolved. Another scenario is
when you marked callback as `idle` during the subscription. Then it will be run
when the browser is idle (via `window.requestIdleCallback`). If the browser
doesn't support this API (like Safari), it will run after 2000ms.

## Design Decisions

### Why Factory?

The decision to use a factory pattern for creating instances of the `Observatory` was made with several considerations in mind:

1. **Easier for Junior Developers**: The factory pattern simplifies the process of creating instances of the `Observatory` for junior developers. It provides a straightforward and intuitive way to initialize and configure the `Observatory` without requiring an in-depth understanding of its internal workings.

1. **Abstraction Hidden**: By using a factory, the underlying complexity and abstraction of creating an `Observatory` instance are hidden from the user. This makes it more user-friendly and shields developers from having to deal with intricate initialization details.

1. **Flexibility for Future Changes**: Using a factory pattern allows for flexibility in the creation process. It enables the development team to make changes to the creation logic or add new features to the `Observatory` without impacting the user's experience. This separation of concerns makes it easier to evolve the API over time.

The decision to employ the factory pattern for creating `Observatory` instances was guided by the aim to make the API approachable for developers of all skill levels, maintain a clean and straightforward user interface, and ensure adaptability for future enhancements and modifications.

### Why class?

The decision to use a class-based approach for the `Observatory` was driven by several considerations:

1. **Elegance and Structure**: Classes provide an elegant and structured way to define the behavior of the Observatory and its associated functionality. Object-oriented programming (OOP) principles lend themselves well to organizing and encapsulating the core logic of the API.

1. **Readability**: OOP patterns, like classes, tend to be more readable and understandable for developers. Using classes, developers can easily identify and comprehend the various components, methods, and properties of the `Observatory` API, which promotes maintainability and collaboration within a team.

1. **Team Preference**: The choice of using classes reflects the preferences of the development team. Some development teams and coding standards favor class-based implementations as they align with established software engineering practices and conventions.

The decision to utilize a class-based approach for the `Observatory` was guided by the desire to create a well-structured, readable, and maintainable API that aligns with OOP principles and meets the preferences of the development team.

### Why it's not using Proxy?

The built-in `Proxy` object looks like an ideal candidate to use in Observer
pattern implementation. But we analyze this possibility and reject it due to:

- **Elasticity**: Proxy forces you to create an Observed object first. We are
  still determining how external developers will use this feature, and we need
  to build this functionality early in the Repository project. So, we want to
  close our doors.

- **Access**: The original object was already created - so the developer might
  have direct access to it. There is a real danger to skip the Proxy by that.
  Looking at the importance of `Observatory` in the proper behavior of the
  Repository, we can not allow it.
