import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import State from "./state.js";
import { sign } from "crypto";
import { Button } from "@headlessui/react";
import { PlayIcon } from "@heroicons/react/24/outline";

declare global {
    interface Window {
        Desmos: any;
    }
}

/** Small math helper to round a number N and ensure it fits
 * INclusively within the bounds of MIN and MAX.
 *
 * Assumes MIN and MAX are integers.
 */
function clampAndRound(n: number, min: number, max: number): number {
    return Math.round(Math.min(Math.max(n, min), max));
}

const SINE_MIN = 0;
const SINE_MAX = 10;
const SAWTOOTH_MIN = 0;
const SAWTOOTH_MAX = 50;
const TRIANGLE_MIN = 0;
const TRIANGLE_MAX = 50;
const SQUARE_MIN = 0;
const SQUARE_MAX = 50;

function makeSineWave(harmonicNumber: number): {
    real: Float32Array;
    imag: Float32Array;
} {
    // Zero phase => no cosine component
    const real = new Float32Array(harmonicNumber + 1);
    const imag = new Float32Array(harmonicNumber + 1);

    imag[harmonicNumber] = 1;

    return { real, imag };
}

function makeSawtoothWave(harmonics = 20): {
    real: Float32Array;
    imag: Float32Array;
} {
    const real = new Float32Array(harmonics + 1);
    const imag = new Float32Array(harmonics + 1);

    for (let n = 1; n <= harmonics; n++) {
        imag[n] = Math.pow(-1, n + 1) * (1 / n);
    }

    return { real, imag };
}

function makeSquareWave(harmonics = 20): {
    real: Float32Array;
    imag: Float32Array;
} {
    const real = new Float32Array(harmonics + 1);
    const imag = new Float32Array(harmonics + 1);

    for (let n = 1; n <= harmonics; n += 2) {
        imag[n] = 1 / n;
    }

    return { real, imag };
}

function makeTriangleWave(harmonics = 20): {
    real: Float32Array;
    imag: Float32Array;
} {
    const real = new Float32Array(harmonics * 2 + 1);
    const imag = new Float32Array(harmonics * 2 + 1);

    for (let n = 0; n < harmonics; n++) {
        // Odd harmonics
        const k = 2 * n + 1;
        imag[k] = Math.pow(-1, n) / (k * k);
    }

    return { real, imag };
}

function playSignal(
    k: number,
    type: "sine" | "sawtooth" | "triangle" | "square"
) {
    const { real, imag } = (() => {
        switch (type) {
            case "sine":
                return makeSineWave(k);
            case "sawtooth":
                return makeSawtoothWave(k);
            case "triangle":
                return makeTriangleWave(k);
            case "square":
                return makeSquareWave(k);
        }
    })()!;
    const ac = new AudioContext();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    const wave = ac.createPeriodicWave(real, imag, {
        disableNormalization: true,
    });
    gain.gain.value = 0.1;

    osc.setPeriodicWave(wave);
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.start();
    osc.stop(ac.currentTime + 2);
}

const Component = observer(({ state }: { state: State }) => {
    /* Desmos boilerplate start */
    const calculatorRef = useRef<HTMLDivElement>(null);
    const calculatorInstance = useRef<any>(null);
    const [isDesmosReady, setDesmosReady] = useState(false);

    useEffect(() => {
        // Check if Desmos is already loaded
        if (window.Desmos) {
            setDesmosReady(true);
            return;
        }

        // Otherwise, load the script
        const script = document.createElement("script");
        script.src =
            "https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
        script.async = true;
        script.onload = () => {
            setDesmosReady(true);
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup
            document.body.removeChild(script);
        };
    }, []);

    const isolateSignal = useCallback(
        (idx: number) => {
            const expressions = calculatorInstance.current?.getExpressions();
            expressions.forEach((expression: any, expressionIndex: number) => {
                calculatorInstance.current.setExpression({
                    ...expression,
                    hidden: expressionIndex / 2 !== idx,
                });
            });
        },
        [calculatorInstance.current]
    );

    const updateColors = useCallback(
        (calculator: any) => {
            const allExpressions = calculator.getExpressions();
            for (let i = 0; i < state?.signals.length; i++) {
                // Set colors in state. Get the EVEN additions,
                // because that's the one we SEE we just added.
                const currExpression = allExpressions[i * 2];
                state?.updateSignalColor(currExpression.color, i);
            }
        },
        [state?.signals]
    );

    const updateHarmonicData = useCallback(
        (calculator: any) => {
            const allExpressions = calculator.getExpressions();
            for (let i = 0; i < state?.signals.length; i++) {
                const currExpression = allExpressions[2 * i + 1];
                const match = currExpression.latex.match(/\d+/); // Matches one or more digits
                const sliderValue = match ? parseInt(match[0], 10) : null;
                if (sliderValue !== null) {
                    state?.updateSignalHarmonicData(sliderValue, i);
                }
            }
        },
        [state?.signals]
    );

    useEffect(() => {
        if (isDesmosReady && calculatorRef.current && window.Desmos) {
            const calculator = window.Desmos.GraphingCalculator(
                calculatorRef.current,
                {
                    projectorMode: true,
                }
            );
            calculatorInstance.current = calculator;

            // Re-draw signals in Desmos
            state?.signals.forEach((signal, idx) => {
                switch (signal.waveType) {
                    case "sine": {
                        calculator.setExpression({
                            id: `sine${idx}`,
                            latex: `\\sin (${String.fromCharCode(65 + idx)}x)`,
                            readonly: true,
                        });
                        calculator.setExpression({
                            id: `sineslider${idx}`,
                            latex: `${String.fromCharCode(
                                65 + idx
                            )}=${clampAndRound(
                                signal.harmonicData,
                                SINE_MIN,
                                SINE_MAX
                            )}`,
                            sliderBounds: {
                                min: String(SINE_MIN),
                                max: String(SINE_MAX),
                                step: 1,
                            },
                            readonly: true,
                        });
                        break;
                    }
                    case "sawtooth": {
                        calculator.setExpression({
                            id: `sawtooth${idx}`,
                            latex: `\\sum_{n=1}^{${String.fromCharCode(
                                65 + idx
                            )}} (-1)^{n+1} \\cdot \\frac{1}{n} \\cdot \\sin(n x)`,
                            readonly: true,
                        });
                        calculator.setExpression({
                            id: `sawtoothslider${idx}`,
                            latex: `${String.fromCharCode(
                                65 + idx
                            )} =${clampAndRound(
                                signal.harmonicData,
                                SAWTOOTH_MIN,
                                SAWTOOTH_MAX
                            )}`,
                            sliderBounds: {
                                min: String(SAWTOOTH_MIN),
                                max: String(SAWTOOTH_MAX),
                                step: 1,
                            },
                            readonly: true,
                        });
                        break;
                    }
                    case "square": {
                        calculator.setExpression({
                            id: `square${idx}`,
                            latex: `\\sum_{n=1}^{${String.fromCharCode(
                                65 + idx
                            )}} \\frac{1}{2n - 1} \\cdot \\sin\\left((2n - 1)x\\right)`,
                            readonly: true,
                        });
                        calculator.setExpression({
                            id: `squareslider${idx}`,
                            latex: `${String.fromCharCode(
                                65 + idx
                            )}=${clampAndRound(
                                signal.harmonicData,
                                SQUARE_MIN,
                                SQUARE_MAX
                            )}`,
                            sliderBounds: {
                                min: String(SQUARE_MIN),
                                max: String(SQUARE_MAX),
                                step: 1,
                            },
                            readonly: true,
                        });
                        break;
                    }
                    case "triangle": {
                        calculator.setExpression({
                            id: `triangle${idx}`,
                            latex: `\\sum_{n=0}^{${String.fromCharCode(
                                65 + idx
                            )}} \\frac{(-1)^n}{(2n+1)^2} \\cdot \\sin\\left((2n+1)x\\right)`,
                            readonly: true,
                        });
                        calculator.setExpression({
                            id: `triangleslider${idx}`,
                            latex: `${String.fromCharCode(
                                65 + idx
                            )} =${clampAndRound(
                                signal.harmonicData,
                                TRIANGLE_MIN,
                                TRIANGLE_MAX
                            )}`,
                            sliderBounds: {
                                min: String(TRIANGLE_MIN),
                                max: String(TRIANGLE_MAX),
                                step: 1,
                            },
                            readonly: true,
                        });
                        break;
                    }
                }
            });
            updateColors(calculator);

            calculator.observeEvent("change", () => {
                // Listen for changes in expressions to re-render
                updateHarmonicData(calculator);
            });

            return () => {
                calculatorInstance.current?.destroy?.();
            };
        }
    }, [isDesmosReady, state?.signals.length]);

    return (
        <div className="bg-white flex flex-col h-full w-full items-start p-4 overflow-y-hidden">
            <div
                id="calculator"
                ref={calculatorRef}
                className="h-2/3 w-full rounded-lg border border-gray-200 shadow-sm"
            />
            <div className="flex flex-col mt-6 gap-4 w-5/6 overflow-auto">
                {state?.signals?.map((signal, idx) => (
                    <div
                        key={idx}
                        className="flex justify-between items-center w-full border border-gray-300 rounded-lg p-3 shadow-sm"
                        style={{ color: signal.color }}
                    >
                        <div className="text-sm font-medium">
                            This is a {signal.waveType} wave with{" "}
                            {signal.waveType === "sine"
                                ? `a harmonic number of ${signal.harmonicData}`
                                : `${signal.harmonicData} harmonics`}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() =>
                                    playSignal(
                                        signal.harmonicData,
                                        signal.waveType
                                    )
                                }
                                className="flex flex-row gap-1 items-center border border-gray-300 rounded px-3 py-1 text-xs cursor-pointer hover:bg-gray-100 transition"
                            >
                                Play sound
                                <PlayIcon className="w-3" />
                            </Button>
                            <Button
                                onClick={() => isolateSignal(idx)}
                                className="border border-gray-300 rounded px-3 py-1 text-xs cursor-pointer hover:bg-gray-100 transition"
                            >
                                Isolate signal
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Component;
