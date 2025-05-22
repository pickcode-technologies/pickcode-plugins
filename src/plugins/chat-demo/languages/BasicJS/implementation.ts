/* eslint-disable @typescript-eslint/no-explicit-any */
const createChatExports = (
    sendMessage: (message: any) => void,
    onMessage: any
): Promise<{ chat: any }> => {
    const send = (newMessage: string, options?: string[]) => {
        const executionMessage = {
            contents: "text",
            messageText: newMessage.toString(),
            responseOptions: options,
        };
        sendMessage(executionMessage);
    };

    const waitForInput = (
        expectedType: "text" | "number" = "text"
    ): Promise<string> => {
        const executionMessage = {
            contents: "waitingForInput",
            expectedType,
        };
        const promise = new Promise<string>((res) => {
            const unsubscribe = onMessage((message: any) => {
                res(message.text);
                unsubscribe();
            });
        });
        sendMessage(executionMessage);
        return promise;
    };

    return Promise.resolve({
        chat: {
            async ask(prompt: string): Promise<string> {
                send(prompt);
                return await waitForInput();
            },

            async askForNumber(prompt: string): Promise<number> {
                send(prompt);
                const s = await waitForInput("number");
                return Number(s);
            },

            async multipleChoice(
                prompt: string,
                options: any
            ): Promise<string> {
                const promise = new Promise<string>((res) => {
                    const unsubscribe = onMessage((message: any) => {
                        res(message.text);
                        unsubscribe();
                    });
                });
                send(
                    prompt,
                    options.items.map((a: any) => a.toString())
                );
                return promise;
            },

            async send(newMessage: string) {
                send(newMessage);
            },

            async sendImage(image: {
                type: "imageFile";
                filename: string;
            }): Promise<void> {
                const executionMessage = {
                    contents: "image",
                    messageImageFilename: image.filename,
                };
                sendMessage(executionMessage);
            },

            async clear(): Promise<void> {
                const executionMessage = {
                    contents: "clear",
                };
                sendMessage(executionMessage);
            },
        },
    });
};

export default createChatExports;
