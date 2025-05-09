import { action, observable } from "mobx";
import { FromRuntimeMessage, ToRuntimeMessage } from "./messages";

export class State {
    @observable
    accessor value: string = "";

    private sendMessage = (_message: ToRuntimeMessage) => {};

    public init = (sendMessage: (message: ToRuntimeMessage) => void) => {
        this.sendMessage = sendMessage;
    };

    @action
    public onMessage = (m: FromRuntimeMessage) => {
        this.value = m.setValue;
    };

    public send = (m: ToRuntimeMessage) => {
        this.sendMessage(m);
    };
}

export default State;
