import { action, observable } from "mobx";
import { AddParticlesMessage } from "./messages";

export interface Particle {
    color: string;
    temperature: number;
}

export class State {
    @observable
    accessor particles: Particle[] = [];

    public init = () => {};

    @action
    public onMessage = (m: AddParticlesMessage) => {
        for (let i = 0; i < m.numParticles; i++) {
            this.particles.push({
                color: m.color,
                temperature: m.temperature,
            });
        }
    };
}

export default State;
