export class JSRuntime {
    executeWorker: Worker | null = null;

    private resetWorker = () => {
        if (this.executeWorker) {
            this.executeWorker.terminate();
        }
        this.executeWorker = new Worker(
            new URL("./JSWorker.ts", import.meta.url),
            {
                type: "module",
            }
        );
        const onMessage = (e: { data: any }) => {
            const messageData = e.data;
            switch (messageData.type) {
                case "module": {
                    this.sendMessageToPlugin(messageData.contents);
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

    public constructor(private onMessage: (message: any) => void) {
        this.resetWorker();
    }

    public async startExecution(userCode: string, pluginCode: string) {
        this.onMessage({ type: "start" });
        this.sendMessageToExecution({
            type: "startJS",
            userCode,
            moduleCode: pluginCode,
        });
    }

    public sendMessageToExecution(message: any) {
        if (this.executeWorker) {
            this.executeWorker.postMessage(message);
        }
    }

    private sendMessageToPlugin(message: any) {
        this.onMessage({ type: "message", message });
    }
}
