/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
    JSXElementConstructor,
    Key,
    ReactElement,
    ReactNode,
    ReactPortal,
    useCallback,
    useState,
} from "react";

const ChatPill = ({ text, onClick }: { text: string; onClick: () => void }) => {
    return (
        <div
            className="rounded-lg min-w-12 max-w-[220px] overflow-hidden overflow-ellipsis hover:bg-slate-100 bg-white border-indigo-400 border-2 py-1 px-2"
            onClick={onClick}
        >
            <span className="text-slate-600">{text}</span>
        </div>
    );
};
const ChatComponent = observer(({ runtimeState, state, getFile }: any) => {
    const [newMessage, setNewMessage] = useState("");

    // const chatContainerRef = useRef<ScrollView>(null);
    // const [messageBoxFocus, setMessageBoxFocus] = useState<
    //     "right" | undefined
    // >(undefined);

    const messages = state?.sentMessages.map(
        (m: {
            contents: {
                type: string;
                contents:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                      >
                    | null
                    | undefined;
                uri: any;
            };
            from: string;
            responseOptions: any;
        }) => {
            let contents: ReactNode;
            if (m.contents.type === "text") {
                contents = (
                    <span className="break-words">{m.contents.contents}</span>
                );
            } else if (m.contents.type === "image") {
                const file = getFile(m.contents.uri);
                if (!file || file.type !== "Asset") {
                    contents = (
                        <span className="break-words">
                            Could not load image
                        </span>
                    );
                } else {
                    contents = (
                        <img
                            src={file.url}
                            style={{ height: 100, width: 100 }}
                        />
                    );
                }
            } else {
                // assertUnreachable(m.contents);
            }
            return {
                from: m.from,
                contents,
                responseOptions:
                    m.from === "bot" ? m.responseOptions : undefined,
            };
        }
    );

    // useEffect(() => {
    //     chatContainerRef.current?.scrollToEnd({ animated: true });
    // }, [messages?.length]);

    // useEffect(() => {
    //     if (state?.expectedInputType) {
    //         setMessageBoxFocus("right");
    //     }
    // }, [state?.expectedInputType]);

    const sendResponse = useCallback(
        (text: string) => {
            state?.sendInput(text);
            setNewMessage("");
            // setMessageBoxFocus(undefined);
        },
        [state]
    );

    const mostRecentMessage = messages?.[messages.length - 1];

    if (runtimeState === "initial") {
        return (
            <div className="w-full h-full flex-row items-center justify-center">
                <span className="text-lg">Press play to run your code</span>
            </div>
        );
    }

    return (
        <div
            className={`bg-white flex-col h-full w-full items-center p-2 overflow-y-hidden`}
        >
            <div className="p-2 rounded-lg border-2 border-slate-200 w-[calc(100%-100px)] max-w-[320px] flex-col flex-grow flex-shrink overflow-y-hidden">
                <div
                    className="h-full flex-col"
                    // ref={chatContainerRef}
                >
                    {messages?.map(
                        (
                            m: {
                                from: string;
                                contents:
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | ReactElement<
                                          unknown,
                                          string | JSXElementConstructor<any>
                                      >
                                    | Iterable<ReactNode>
                                    | ReactPortal
                                    | Promise<
                                          | string
                                          | number
                                          | bigint
                                          | boolean
                                          | ReactPortal
                                          | ReactElement<
                                                unknown,
                                                | string
                                                | JSXElementConstructor<any>
                                            >
                                          | Iterable<ReactNode>
                                          | null
                                          | undefined
                                      >
                                    | null
                                    | undefined;
                            },
                            i: Key | null | undefined
                        ) => (
                            <div
                                className={classNames(
                                    "flex-row w-[230px] p-2 rounded-lg mb-2 shadow border-2",
                                    {
                                        "bg-blue-400 place-self-end border-blue-200":
                                            m.from === "user",
                                        "bg-white place-self-start border-slate-200":
                                            m.from !== "user",
                                    }
                                )}
                                key={i}
                                // style={{
                                //     backgroundColor: "indigo",
                                // }}
                            >
                                <span
                                    className={classNames("w-full", {
                                        "text-white": m.from === "user",
                                        "text-slate-800": m.from !== "user",
                                    })}
                                >
                                    {m.contents}
                                </span>
                            </div>
                        )
                    )}
                    {state.isBotTyping && <>...</>}
                    {!state.isBotTyping &&
                        mostRecentMessage?.from === "bot" &&
                        mostRecentMessage?.responseOptions && (
                            <div
                                className={`p-1 flex-row flex-wrap gap-2 mb-2 color`}
                                key={"options"}
                            >
                                {mostRecentMessage.responseOptions.map(
                                    (
                                        opt: string,
                                        i: Key | null | undefined
                                    ) => (
                                        <ChatPill
                                            text={opt}
                                            onClick={() => {
                                                sendResponse(opt);
                                            }}
                                            key={i}
                                        />
                                    )
                                )}
                            </div>
                        )}
                </div>
                <div className="flex-row w-full mt-auto gap-2 justify-between">
                    <input
                        onChange={(e) => setNewMessage(e.target.value)}
                        value={newMessage}
                        // theme={ColorTheme.Light}
                        placeholder={
                            state.expectedInputType === "number"
                                ? "Enter a number..."
                                : state.expectedInputType === "text"
                                ? "Type a message..."
                                : ""
                        }
                        // onEnterKeyPressed={() => sendResponse(newMessage)}
                        className="p-2 border-2 border-slate-200 rounded-lg"
                        // autocorrect="off"
                        width="100%"
                        // focusedFrom={messageBoxFocus}
                        disabled={!state.expectedInputType}
                        // numeric={state.expectedInputType === "number"}
                    />
                    <button
                        // text="Send"
                        // size={Size.Big}
                        // intent={
                        //     state.expectedInputType
                        //         ? Intent.Primary
                        //         : Intent.Disabled
                        // }
                        className="border-2 bg-blue-500 rounded-md text-white p-2"
                        onClick={() => sendResponse(newMessage)}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
});
ChatComponent.displayName = "Chat";

export default ChatComponent;
