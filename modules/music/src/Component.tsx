import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

import { NoteView } from "./NoteView.tsx";
import State from "./state";

const Component = observer(({ state }: { state: State }) => {
    const musicContainerRef = useRef<HTMLDivElement>(null);
    const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);

    useEffect(() => {
        const container = musicContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [currentNoteIndex]);

    useEffect(() => {
        if (!state) return;
        let isCancelled = false;
        // Create a Tone.js synthesizer and connect it to the destination (your speakers)
        const synth = new Tone.Synth().toDestination();

        const playNote = async (note: string, duration: number) => {
            // Ensure Tone.js has been started (required by some browsers)
            await Tone.start();
            // If your note string doesn't include an octave, you can default to one (e.g., "4")
            const noteWithOctave = /\d/.test(note) ? note : note + "4";
            const durationInSeconds = duration / 1000;
            synth.triggerAttackRelease(noteWithOctave, durationInSeconds);
        };

        const playNextNote = async (index: number) => {
            if (isCancelled || !state.notes || index >= state.notes.length)
                return;

            setCurrentNoteIndex(index);
            const noteData = state.notes[index];

            // Play the note using Tone.js
            await playNote(noteData.note, noteData.duration);

            // Schedule the next note after the current note's duration
            setTimeout(() => {
                void playNextNote(index + 1);
            }, noteData.duration);
        };

        if (state.notes && state.notes.length > 0) {
            void playNextNote(0);
        }

        return () => {
            isCancelled = true;
            // Dispose of the synth to free up resources
            synth.dispose();
        };
    }, [state?.notes.length, state]);
    return (
        <div className="bg-white flex flex-col h-full w-full items-center p-2 overflow-y-hidden">
            <div className="p-2 rounded-lg border-2 border-slate-200 w-[calc(100%-100px)] max-w-[320px] flex flex-col flex-grow flex-shrink overflow-y-hidden">
                <div
                    className="h-full flex flex-col gap-2 overflow-y-scroll"
                    ref={musicContainerRef}
                >
                    {state?.notes
                        ?.slice(0, currentNoteIndex + 1)
                        .map((m, i) => (
                            <NoteView
                                key={i}
                                note={m.note}
                                duration={m.duration}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
});

export default Component;
