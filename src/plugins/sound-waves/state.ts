import { action, observable } from "mobx";
import { SignalMessage } from "./messages";

export class State {
    @observable
    accessor signals: Array<SignalMessage> = [];

    public init = () => {};

    @action
    public onMessage = (m: SignalMessage) => {
        this.signals.push(m);
    };

    @action
    public updateSignalColor = (color: string, idx: number) => {
        if (idx >= 0 && idx < this.signals.length) {
            this.signals[idx].color = color;
        }
    };

    @action
    public updateSignalHarmonicData = (harmonicData: number, idx: number) => {
        if (idx >= 0 && idx < this.signals.length) {
            this.signals[idx].harmonicData = harmonicData;
        }
    };
}

export default State;
