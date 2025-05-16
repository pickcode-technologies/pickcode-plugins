interface NoteViewProps {
    note: string;
    duration: number;
}

export const NoteView: React.FC<NoteViewProps> = ({ note, duration }) => {
    // Get the note letter (assume note starts with the letter, e.g., "C4", "D#4")
    const noteLetter = note.charAt(0).toUpperCase();

    // Map note letters to Tailwind blue shades
    const noteColors: { [key: string]: string } = {
        C: "bg-indigo-100",
        D: "bg-indigo-200",
        E: "bg-indigo-300",
        F: "bg-indigo-400",
        G: "bg-indigo-500",
        A: "bg-indigo-600",
        B: "bg-indigo-700",
    };

    const noteTextColors: { [key: string]: string } = {
        C: "text-indigo-900",
        D: "text-indigo-900",
        E: "text-indigo-900",
        F: "text-indigo-900",
        G: "text-indigo-100",
        A: "text-indigo-100",
        B: "text-indigo-100",
    };

    const colorClass = noteColors[noteLetter] || "bg-indigo-100";
    const colorTextClass = noteTextColors[noteLetter] || "text-indigo-100";

    const size = duration / 10;

    return (
        <div
            className={`${colorClass} w-full rounded-xl flex justify-center items-center border border-indigo-500`}
            style={{ minHeight: size }}
        >
            <span className={`text-xs ${colorTextClass}`}>{note}</span>
        </div>
    );
};
