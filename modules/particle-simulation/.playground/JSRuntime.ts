import { action, makeObservable, observable } from "mobx";

export class JSRuntime {
    // These are just here for consistency with other runtimes, to pass typechecking
    // but it's the very old style of doing things, only old modules use it
    // and they don't run in JS
    executionMessages: Array<any> = [];
    messagesReceivedCount = 0;
    finished = false;

    executeWorker: Worker | null = null;

    @action
    private resetWorker = () => {
        if (this.executeWorker) {
            this.executeWorker.terminate();
        }
        this.executeWorker = new Worker(
            new URL("./JSExecute.ts", import.meta.url),
            {
                type: "module",
            }
        );
        // TODO: add JS types shared by runtime and execute
        const onMessage = (e: { data: any }) => {
            const messageData = e.data;
            switch (messageData.type) {
                case "finished": {
                    this.setFinished();
                    break;
                }
                case "module": {
                    // TODO: don't just send contents, wrap in an obj
                    // that specifies this is a module message, not
                    // a console message
                    this.sendMessageToSubscribers(messageData.contents);
                    break;
                }
                case "console": {
                    // TODO: send
                    break;
                }
                case "clearConsole": {
                    // TODO: send
                    break;
                }
            }
        };
        this.executeWorker.onmessage = onMessage;
    };

    constructor(private userCode: string, private moduleCode: string) {
        makeObservable(this);
        this.resetWorker();
    }

    async execute() {
        this.executionState = "Running";
        this.sendMessageToExecution({
            type: "startJS",
            userCode: this.userCode,
            moduleCode: this.moduleCode,
        });
    }

    sendMessageToExecution(newMessage: any) {
        if (this.executeWorker) {
            this.executeWorker.postMessage(newMessage);
        }
    }

    @observable
    executionState: any = "Idle";

    @action
    stop() {
        if (this.executeWorker) {
            this.executeWorker.terminate();
            this.executeWorker = null;
        }
        this.setFinished();
    }

    @action
    setFinished() {
        this.executionState = "Idle";
    }

    private pendingMessages: any[] = [];
    private sendMessageToSubscribers = (message: any) => {
        const subscriberKeys = Object.getOwnPropertySymbols(
            this.messageSubscribers
        );
        if (subscriberKeys.length === 0) {
            this.pendingMessages.push(message);
        } else {
            for (const key of subscriberKeys) {
                this.messageSubscribers[key](message);
            }
        }
    };

    private messageSubscribers: { [key: symbol]: (message: any) => void } = {};
    public subscribeToMessages: any = (onMessage) => {
        const key = Symbol();
        this.messageSubscribers[key] = onMessage;
        this.pendingMessages.forEach(onMessage);
        this.pendingMessages = [];
        return () => {
            delete this.messageSubscribers[key];
        };
    };

    public sendMessage = (message: any) => {
        this.executeWorker?.postMessage({
            type: "module",
            contents: message,
        });
    };

    private resetSubscribers: { [key: symbol]: () => void } = {};

    public subscribeToReset = (onReset: () => void) => {
        const key = Symbol();
        this.resetSubscribers[key] = onReset;
        return () => {
            delete this.resetSubscribers[key];
        };
    };

    reset() {
        Object.getOwnPropertySymbols(this.resetSubscribers).forEach((key) => {
            this.resetSubscribers[key]();
        });
    }
}
