import { action, observable } from "mobx";
import { SongFromRuntimeMessage } from "./messages";

export class State {
    @observable
    notes: Array<{ note: string; duration: number }> = [];

    public init = () => {};

    @action
    public onMessage = (m: SongFromRuntimeMessage) => {
        this.notes.push(m);
    };
}

export default State;
