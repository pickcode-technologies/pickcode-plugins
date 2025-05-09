import { action, observable } from "mobx";
import { Planet } from "./messages";

export class State {
    @observable
    accessor planets: Planet[] = [
        { color: "red", name: "mars", radius: 100, speed: 10, size: 100 },
    ];

    public init = () => {};

    @action
    public onMessage = (p: Planet) => {
        this.planets.push(p);
    };
}

export default State;
