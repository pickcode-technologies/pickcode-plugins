/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, computed, observable } from "mobx";

type ChatMessageContents =
    | {
          type: "text";
          contents: string;
      }
    | {
          type: "image";
          uri: string;
      };

export type ChatMessage =
    | {
          from: "user";
          contents: ChatMessageContents;
      }
    | {
          from: "bot";
          contents: ChatMessageContents;
          responseOptions?: string[];
      };

const typingTimeMs = 750;

export class ChatState {
    @observable
    accessor sentMessages: ChatMessage[] = [];

    @observable
    accessor expectedInputType: "text" | "number" | undefined = undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private sendMessage = (_message: any) => {};

    public init = (sendMessage: (message: any) => void) => {
        this.sendMessage = sendMessage;
    };

    @observable
    accessor botMessageQueue: ChatMessage[] = [];

    private advanceQueueTimeout: NodeJS.Timeout | undefined;

    private addBotMessage = (message: ChatMessage) => {
        this.botMessageQueue.push(message);
        if (this.botMessageQueue.length > 0 && !this.advanceQueueTimeout) {
            this.advanceQueueTimeout = setTimeout(
                this.advanceQueue,
                typingTimeMs
            );
        }
    };

    private advanceQueue = () => {
        this.advanceQueueTimeout = undefined;
        const message = this.botMessageQueue.shift();
        if (message) {
            this.sentMessages.push(message);
        }
        if (this.botMessageQueue.length > 0) {
            this.advanceQueueTimeout = setTimeout(
                this.advanceQueue,
                typingTimeMs
            );
        }
    };

    @computed
    public get isBotTyping() {
        return this.botMessageQueue.length > 0;
    }

    public sendInput = (input: string) => {
        this.sentMessages.push({
            from: "user",
            contents: {
                type: "text",
                contents: input,
            },
        });
        this.expectedInputType = undefined;
        this.sendMessage({
            contents: "text",
            text: input,
        });
    };

    @action
    public onMessage = (m: any) => {
        if (m.contents === "waitingForInput") {
            this.expectedInputType = m.expectedType;
        } else if (m.contents === "clear") {
            this.botMessageQueue = [];
            if (this.advanceQueueTimeout) {
                clearTimeout(this.advanceQueueTimeout);
                this.advanceQueueTimeout = undefined;
            }
            this.sentMessages = [];
        } else {
            if (m.contents === "text") {
                this.addBotMessage({
                    from: "bot",
                    contents: {
                        type: "text",
                        contents: m.messageText,
                    },
                    responseOptions: m.responseOptions,
                });
            } else if (m.contents === "image") {
                this.addBotMessage({
                    from: "bot",
                    contents: {
                        type: "image",
                        uri: m.messageImageFilename,
                    },
                });
            }
        }
    };
}

export default ChatState;
