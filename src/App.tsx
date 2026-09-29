// App shell: one `screen` variable (no router), the family's details, and the drill reducer.
// Everything lives in memory; a refresh starts over (prd.md > States and Boundaries).

import { useEffect, useMemo, useReducer, useState } from "react";
import { PhoneFrame } from "./components/PhoneFrame";
import { isDemoMode } from "./drill/api";
import { drillReducer, initialDrill } from "./drill/reducer";
import { EMPTY_SETUP, type FamilySetup } from "./drill/setup";
import { DrillScreen } from "./screens/DrillScreen";
import { EndingScreen } from "./screens/EndingScreen";
import { HandoffScreen } from "./screens/HandoffScreen";
import { SetupScreen } from "./screens/SetupScreen";

type Screen = "setup" | "handoff" | "drill" | "ending";

/** A random 6-digit code for this drill only (never starts with 0, so it always has 6 digits). */
function newFakeOtp(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export default function App() {
  const demo = useMemo(isDemoMode, []);
  const [screen, setScreen] = useState<Screen>("setup");
  const [setup, setSetup] = useState<FamilySetup>(EMPTY_SETUP);
  const [drill, dispatch] = useReducer(drillReducer, undefined, () => initialDrill());

  useEffect(() => {
    if (screen === "drill" && drill.ending) setScreen("ending");
  }, [screen, drill.ending]);

  return (
    <PhoneFrame>
      {screen === "setup" && <SetupScreen setup={setup} onChange={setSetup} onHandOff={() => setScreen("handoff")} />}
      {screen === "handoff" && (
        <HandoffScreen
          setup={setup}
          onStart={() => {
            dispatch({ type: "START", now: Date.now(), fakeOtp: newFakeOtp() });
            setScreen("drill");
          }}
        />
      )}
      {screen === "drill" && <DrillScreen drill={drill} dispatch={dispatch} setup={setup} demo={demo} />}
      {screen === "ending" && drill.ending && <EndingScreen ending={drill.ending} onRestart={() => setScreen("setup")} />}
    </PhoneFrame>
  );
}
