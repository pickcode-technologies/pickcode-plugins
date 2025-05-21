/* eslint-disable @typescript-eslint/no-explicit-any */
const createChatExports = (sendMessage, onMessage) => {
    const send = (newMessage, options) => {
        const executionMessage = {
            contents: "text",
            messageText: newMessage.toString(),
            responseOptions: options,
        };
        sendMessage(executionMessage);
    };
    const waitForInput = (expectedType = "text") => {
        const executionMessage = {
            contents: "waitingForInput",
            expectedType,
        };
        const promise = new Promise((res) => {
            const unsubscribe = onMessage((message) => {
                res(message.text);
                unsubscribe();
            });
        });
        sendMessage(executionMessage);
        return promise;
    };
    return Promise.resolve({
        chat: {
            async ask(prompt) {
                send(prompt);
                return await waitForInput();
            },
            async askForNumber(prompt) {
                send(prompt);
                const s = await waitForInput("number");
                return Number(s);
            },
            async multipleChoice(prompt, options) {
                const promise = new Promise((res) => {
                    const unsubscribe = onMessage((message) => {
                        res(message.text);
                        unsubscribe();
                    });
                });
                send(prompt, options.items.map((a) => a.toString()));
                return promise;
            },
            async send(newMessage) {
                send(newMessage);
            },
            async sendImage(image) {
                const executionMessage = {
                    contents: "image",
                    messageImageFilename: image.filename,
                };
                sendMessage(executionMessage);
            },
            async clear() {
                const executionMessage = {
                    contents: "clear",
                };
                sendMessage(executionMessage);
            },
        },
    });
};
export default createChatExports;
