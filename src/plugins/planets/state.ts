import { action, observable } from "mobx";
import { Planet } from "./messages";

export class State {
    @observable
    accessor planets: Planet[] = [];

    public init = () => {};

    @action
    public onMessage = (p: Planet) => {
        this.planets.push(p);
    };
}

export default State;
