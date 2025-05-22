## Setup

[Follow this guide](https://github.com/Stanford-PinCS/pincs-lessons-site/blob/main/README.md) to get your environment set up. You need to have `node` installed on your machine.

## Local development

When you first get the code locally, you'll need to run `npm i` from the root of the repo, to install any necessary dependencies.

To run the app locally, run the command `npm start` from the root of this repo. The command will give you the url of the running app, usually `http://localhost:5173/`.

To test out a plugin (for example, music), you can go to the sandbox by navigating to `http://localhost:5173/sandbox/music` (or replace `music` with the name of the plugin you want to test). You can write test code on the left, and press the play button to see its output on the right.

Any time you make changes to the plugin code and save the file, this page will reload to show your updated changes, as long as you keep the `npm start` command running in the background.

## How plugins work

A running program has two pieces: the _code_ (also called the _runtime_), and the _output_. When looking at the sandbox, you can see this division, with the code on the left, and the output on the right. To define a plugin, we need to write code that will run in each of these two places. And we need to let them affect one another.

Each plugin has its own folder within `src/plugins`. Each plugin consists of the following basic files:

-   `Component.tsx`: has the react component that displays the visual output of the code.
-   `state.ts`: has a class that defines the state for the plugin. The state tells the react component what to render. It has two important functions. In `onMessage`, you define what happens when the state gets a message from the user's code. `sendMessage` is used to send a message in the other direction, _to_ the runtime.
-   `Plugin.tsx`: just hooks up the plugin, you shouldn't have to edit this file.
-   `messages.ts`: defines what kinds of messages the plugin can send between the runtime and the output.
-   `languages/BasicJS/implementation.ts`: defines what will be available to the user in their code. The function takes two parameters, `sendMessage` and `onMessage`, and whatever it returns will be the functions and variables available to the user. `sendMessage` and `onMessage` work just like in `state.ts`, but in reverse. `sendMessage` lets you send a message to the output, and `onMessage` lets you listen for messages _from_ the output component.
-   `languages/BasicJS/starter-code`: this folder is set aside for you to write example code to show how users might use the plugin.

Take a look around one of our example plugins, like music, to see how each of these files fits in. As an example, what happens when users run code that says `playNote("A", 100)`:

-   `src/plugins/music/languages/BasicJS/implementation.ts` defines what the `playNote` function does: it just sends a message to the output containing the note and duration.
-   `src/plugins/music/messages.ts` defines that message type, so the implementation knows it can send a message with that info, and the state knows it should listen for a message with that info.
-   `src/plugins/music/state.ts` defines the `onMessage` function, which gets called when a message is sent. In this case, the note gets added to the state's `notes` array.
-   `src/plugins/music/Component.tsx` will then rerender because its state has changed. It has an effect that reruns when a new note is added, which defines how to play the sounds using a library.

## Making a new plugin

You can get started making a new plugin by running the command `npm run init-plugin`. The command will ask for a name for the new plugin, and will create a directory for it under `src/plugins` with a basic version of the files the plugin will need.

## Publishing

To get your plugin up and running for real, or to change an existing plugin, you need to make your changes in another branch and submit a pull request. Soon after the pull request is merged, the plugin will be available in Pickcode's development environment. Before a pull request can be merged, it requires approval from whoever administers the plugin.

To be available in Pickcode's production environment, the code changes need to go out in a production release. Only the pickcode team can put out a production release.
