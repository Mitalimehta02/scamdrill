// App shell: one `screen` variable (no router), the family's details, and the drill reducer.
// Everything lives in memory; a refresh starts over (prd.md > States and Boundaries).

import { useEffect, useMemo, useReducer, useState } from "react";
import { PhoneFrame } from "./components/PhoneFrame";
import { isDemoMode } from "./drill/api";
import { drillReducer, initialDrill } from "./drill/reducer";
import { buildReport } from "./drill/report";
import { EMPTY_SETUP, type FamilySetup } from "./drill/setup";
import { DrillScreen } from "./screens/DrillScreen";
import { EndingScreen } from "./screens/EndingScreen";
import { HandoffScreen } from "./screens/HandoffScreen";
import { ReportCard } from "./screens/ReportCard";
import { SetupScreen } from "./screens/SetupScreen";

type Screen = "setup" | "handoff" | "drill" | "ending" | "report";

/** A random 6-digit code for this drill only (never starts with 0, so it always has 6 digits). */
function newFakeOtp(): string {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export default function App() {
  const demo = useMemo(isDemoMode, []);
  const [screen, setScreen] = useState<Screen>("setup");
  const [setup, setSetup] = useState<FamilySetup>(EMPTY_SETUP);
  const [drill, dispatch] = useReducer(drillReducer, undefined, () => initialDrill());
  const report = useMemo(() => buildReport(drill), [drill]);

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
      {screen === "ending" && report && <EndingScreen report={report} setup={setup} onHandBack={() => setScreen("report")} />}
      {/* "Run another drill" keeps the family's details for this session only. */}
      {screen === "report" && report && <ReportCard report={report} setup={setup} onAgain={() => setScreen("setup")} />}
    </PhoneFrame>
  );
}
