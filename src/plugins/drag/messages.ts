export type Position = { x: number; y: number; };

export type SimulationMessage = {
    type: "simulationUpdate";
    predictedPath: Position[];
    actualPath: Position[];
    ballPosition: Position;
    isComplete: boolean;
};

export type Message = SimulationMessage;
