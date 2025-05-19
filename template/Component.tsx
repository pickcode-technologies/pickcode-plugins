import { observer } from "mobx-react-lite";
import State from "./state";

const Component = observer(({ state }: { state: State | undefined }) => {
    return <div>Value: {state?.value}</div>;
});

export default Component;
