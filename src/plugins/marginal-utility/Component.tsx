import { observer } from "mobx-react-lite";
import React, { useState, useEffect, useMemo, useRef } from "react";
import State from "./state";

const InfoCard = ({
    title,
    emoji,
    data,
    isHighlighted,
    isPulsing,
    isCorrect,
}: {
    title: string;
    emoji: string;
    data: { label: string; value: string | number }[];
    isHighlighted: boolean;
    isPulsing: boolean;
    isCorrect: boolean | null;
}) => {
    const classNames = [
        "bg-white p-4 rounded-lg shadow-md sm:w-64 flex-shrink-0 transition-all duration-300",
    ];

    // Make it smaller during the pulsing period.
    if (isPulsing) {
        classNames.push("transform scale-95");
    }

    // Highlight it and border it solid green or dashed red if depending on correctness.
    if (isHighlighted) {
        if (isCorrect === true) {
            classNames.push("border-4 border-green-500 bg-green-50");
        } else if (isCorrect === false) {
            classNames.push("border-dashed border-4 border-red-500 bg-red-50");
        }
    }

    return (
        <div className={classNames.join(" ")}>
            <h3 className="text-lg font-semibold mb-1.5 flex items-center gap-1 text-gray-800">
                <span>{emoji}</span>
                <span>{title}</span>
            </h3>
            <table className="w-full text-left">
                <tbody>
                    {data.map(({ label, value }, index) => (
                        <tr
                            key={index}
                            className="border-b last:border-b-0 border-gray-100"
                        >
                            <td className="py-1 pr-2 text-gray-600">
                                {label}:
                            </td>
                            <td className="py-1 pl-2 font-medium text-gray-800">
                                {value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Component = observer(({ state }: { state: State | undefined }) => {
    // Store not just the choice, but also if it was correct.
    const [visibleChoices, setVisibleChoices] = useState<
        { choice: string; isCorrect: boolean }[]
    >([]);
    const [highlightedItem, setHighlightedItem] = useState<{
        choice: string;
        isCorrect: boolean;
    } | null>(null);
    const [pulsingChoice, setPulsingChoice] = useState<string | null>(null);

    const isAnimating = useRef(false);

    const incomingChoices = state?.choices || [];

    const {
        appleCount,
        bananaCount,
        appleMU,
        bananaMU,
        appleMUP,
        bananaMUP,
        totalCost,
    } = useMemo(() => {
        // Calculate counts based on the new structure of visibleChoices.
        const appleCount = visibleChoices.filter(
            (item) => item.choice === "apple"
        ).length;
        const bananaCount = visibleChoices.filter(
            (item) => item.choice === "banana"
        ).length;
        const applePrice = 2;
        const bananaPrice = 1;
        const appleMU = 30 - 10 * appleCount;
        const bananaMU = 20 - 5 * bananaCount;
        const appleMUP = appleMU / applePrice;
        const bananaMUP = bananaMU / bananaPrice;
        const totalCost = appleCount * applePrice + bananaCount * bananaPrice;
        return {
            appleCount,
            bananaCount,
            appleMU,
            bananaMU,
            appleMUP,
            bananaMUP,
            totalCost,
        };
    }, [visibleChoices]);

    useEffect(() => {
        const processNextChoice = async () => {
            // See if there are choices to add.
            if (incomingChoices.length <= visibleChoices.length) {
                isAnimating.current = false;
                return;
            }

            // Get choice and correctness.
            const nextChoice = incomingChoices[visibleChoices.length];
            const isCorrect =
                nextChoice === "apple"
                    ? appleMUP >= bananaMUP
                    : bananaMUP >= appleMUP;

            // Highlight the info card.
            setHighlightedItem({ choice: nextChoice, isCorrect });
            // Add the new item (with its correctness) to the basket.
            setVisibleChoices((prev) => [
                ...prev,
                { choice: nextChoice, isCorrect },
            ]);
            // Pulse the info card.
            setPulsingChoice(nextChoice);

            // Have a 2.5 second wait, with 0.5 seconds pulse.
            setTimeout(() => setPulsingChoice(null), 500);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Unhighlight and end the animation for the next one.
            setHighlightedItem(null);

            isAnimating.current = false;
        };

        // Reset.
        if (incomingChoices.length === 0 && visibleChoices.length > 0) {
            isAnimating.current = false;
            setVisibleChoices([]);
            setHighlightedItem(null);
            setPulsingChoice(null);
            return;
        }

        // Check whether it should process the next choice.
        if (
            !isAnimating.current &&
            incomingChoices.length > visibleChoices.length
        ) {
            isAnimating.current = true;
            processNextChoice();
        }
    }, [
        incomingChoices.length,
        visibleChoices.length,
        isAnimating.current,
        appleMUP,
        bananaMUP,
    ]);

    const appleData = [
        { label: "Price", value: `$2` },
        { label: "Marginal Utility", value: appleMU },
        { label: "MU/Price Ratio", value: appleMUP.toFixed(1) },
    ];

    const bananaData = [
        { label: "Price", value: `$1` },
        { label: "Marginal Utility", value: bananaMU },
        { label: "MU/Price Ratio", value: bananaMUP.toFixed(1) },
    ];

    return (
        <div className="w-full min-h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-green-50 p-2 sm:p-4">
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-2">
                <div className="flex flex-row gap-4 w-full justify-center">
                    <InfoCard
                        title={"Apple #" + (appleCount + 1)}
                        emoji="🍎"
                        data={appleData}
                        isHighlighted={highlightedItem?.choice === "apple"}
                        isPulsing={pulsingChoice === "apple"}
                        isCorrect={
                            highlightedItem?.choice === "apple"
                                ? highlightedItem.isCorrect
                                : null
                        }
                    />
                    <InfoCard
                        title={"Banana #" + (bananaCount + 1)}
                        emoji="🍌"
                        data={bananaData}
                        isHighlighted={highlightedItem?.choice === "banana"}
                        isPulsing={pulsingChoice === "banana"}
                        isCorrect={
                            highlightedItem?.choice === "banana"
                                ? highlightedItem.isCorrect
                                : null
                        }
                    />
                </div>

                <div className="w-full max-w-2xl bg-white p-3 rounded-lg shadow-md">
                    <p className="text-lg text-gray-700 font-semibold bg-white/70 px-2 pb-1 rounded-lg">
                        Basket Cost: ${totalCost}
                        <span className="text-gray-500 font-normal">
                            {" "}
                            / Budget: $7
                        </span>
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center items-center p-2 min-h-[4.5rem] rounded-lg bg-yellow-50 border-2 border-dashed border-yellow-300">
                        {visibleChoices.length > 0 ? (
                            visibleChoices.map((item, index) => (
                                <span
                                    key={index}
                                    className={`text-3xl rounded-lg p-0.5 transition-colors border-2 ${
                                        !item.isCorrect
                                            ? "bg-red-50 border-dashed border-red-400"
                                            : "bg-green-50 border-green-400"
                                    }`}
                                >
                                    {item.choice === "apple" ? "🍎" : "🍌"}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-500">
                                Your basket is empty.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Component;