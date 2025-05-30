'use client';

import React, { useEffect, useState, useReducer } from "react";
import './globals.css';
import { time } from "console";
import next from "next";

type Bit = string;
type bitHistory = Bit[];

type BitOperation =
  | {operation_type: "set", parameter: Bit}
  | {operation_type: "and", parameter: Bit}
  | {operation_type: "or", parameter: Bit}
  | {operation_type: "xor", parameter: Bit }
  | {operation_type: "xnor", parameter: Bit}
  | {operation_type: "not"}
  | {operation_type: "cyclic-lshift"}
  | {operation_type: "cyclic-rshift"}

type Problem = {bit_length: number, start: Bit, target: Bit, operation_count: number, operations: BitOperation[], minimum_moves: number}

type bitHistoryOperation =
  | {operation_type: "append", parameter: Bit}
  | {operation_type: "bitoperation", bit_operation: BitOperation}
  | {operation_type: "pop"}
  | {operation_type: "clear"}

type Status =
  | {status_type: "TitleScreen"}
  | {status_type: "ProblemSelectionScreen"}
  | {status_type: "TimeAttackSelectionScreen"}
  | {status_type: "ProblemModeGameScreen", problem_file: string}
  | {status_type: "TimeAttackModeGameScreen", time_attack_file: string}

function OperateBit(state: Bit, action: BitOperation): Bit {
  switch (action.operation_type) {
    case "set": {
      return action.parameter;
    }
    case "and": {
      const newState = state.split("").map((bit, index) => {
        return (bit === "1" && action.parameter[index] === "1") ? "1" : "0";
      }).join("");
      return newState;
    }
    case "or": {
      const newState = state.split("").map((bit, index) => {
        return (bit === "1" || action.parameter[index] === "1") ? "1" : "0";
      }).join("");
      return newState;
    }
    case "xor": {
      const newState = state.split("").map((bit, index) => {
        return (bit === "1" && action.parameter[index] === "0") || (bit === "0" && action.parameter[index] === "1") ? "1" : "0";
      }
      ).join("");
      return newState;
    }
    case "not": {
      const newState = state.split("").map((bit) => {
        return (bit === "1") ? "0" : "1";
      }).join("");
      return newState;
    }
    case "cyclic-lshift": {
      const newState = state.slice(1) + state[0];
      return newState;
    }
    case "cyclic-rshift": {
      const newState = state[state.length - 1] + state.slice(0, -1);
      return newState;
    }
    default:
      throw new Error("Unknown operation");
  }
}

function getOperationDisplayName(operation: BitOperation): string {
  switch (operation.operation_type) {
    case "set":
      return `SET ${operation.parameter}`;
    case "and":
      return `AND ${operation.parameter}`;
    case "or":
      return `OR ${operation.parameter}`;
    case "xor":
      return `XOR ${operation.parameter}`;
    case "not":
      return "NOT";
    case "cyclic-lshift":
      return "L-SHIFT";
    case "cyclic-rshift":
      return "R-SHIFT";
    default:
      throw new Error("Unknown operation type");
  }
}

function bitHistoryReducer(state: bitHistory, action: bitHistoryOperation): bitHistory {
  switch (action.operation_type) {
    case "append": {
      let newState = structuredClone(state);
      newState.push(action.parameter);
      return newState;
    }
    case "bitoperation": {
      let newState = structuredClone(state);
      let nextBit = OperateBit(newState[newState.length - 1], action.bit_operation)
      newState.push(nextBit);
      return newState;
    }
    case "pop": {
      let newState = structuredClone(state);
      newState.pop();
      return newState;
    }
    case "clear": {
      let newState: Bit[] = [];
      return newState;
    }
  }
}

function BitOperationButton({ dispatchbitHistory, operation }: { dispatchbitHistory: React.Dispatch<bitHistoryOperation>, operation: BitOperation }) {
  return (
    <button className="bitOperationButton" onClick={() => {
      dispatchbitHistory({operation_type: "bitoperation", bit_operation: operation});
    }}>
      {getOperationDisplayName(operation)}
    </button>
  );
}

function BitOperationButtonContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bitOperationButtonContainer">
      {children}
    </div>
  );
}

function BitDisplay({ currentBits }: { currentBits: Bit }) {
  return (
    <div className="bitDisplay"> {currentBits} </div>
  )
}

function UndoButton({ bitHistory, dispatchbitHistory } : { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation> }){
  if (bitHistory.length === 1){
    return (
      <button className="undoButtonDisabled">
        1 手戻る
      </button>
    );
  } else {
    return (
      <button className="undoButtonEnabled" onClick={() => dispatchbitHistory({operation_type: "pop"})}>
        1 手戻る
      </button>
    );
  }
}

function RetryButton({ bitHistory, dispatchbitHistory } : { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation> }){
  return (
    <button className="retryButton" onClick={() => {
      let initialBit = bitHistory[0];
      dispatchbitHistory({operation_type: "clear"});
      dispatchbitHistory({operation_type: "append", parameter: initialBit});
    }}>
      リトライ
    </button>
  )
}

function UndoRetryButtonContainer({ bitHistory, dispatchbitHistory } : { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation> }){
  return (
    <div className="undoRetryButtonContainer">
      <UndoButton bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} />
      <RetryButton bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} />
    </div>
  )
}

function ProblemButtonContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="problemButtonContainer">
      {children}
    </div>
  );
}

function ProblemButton({ problemName, problemFile, setStatus }: { problemName: string, problemFile: string, setStatus: React.Dispatch<React.SetStateAction<Status>> }) {
  if (localStorage.getItem(problemFile) == "Solved"){
    return (
      <button className="problemButtonSolved" onClick={() => setStatus({status_type: "ProblemModeGameScreen", problem_file: problemFile})}>
        {problemName}
      </button>
    );
  } else if (localStorage.getItem(problemFile) == "SolvedMinimum"){
    return (
      <button className="problemButtonSolvedMinimum" onClick={() => setStatus({status_type: "ProblemModeGameScreen", problem_file: problemFile})}>
        {problemName}
      </button>
    );
  } else {
    return (
      <button className="problemButtonUnsolved" onClick={() => setStatus({status_type: "ProblemModeGameScreen", problem_file: problemFile})}>
        {problemName}
      </button>
    );
  }
}

function TimeAttackButtonContainer({children}: {children: React.ReactNode }) {
  return (
    <div className="timeAttackButtonContainer">
      {children}
    </div>
  )
}

function TimeAttackButton({ timeAttackName, timeAttackFile, setStatus }: { timeAttackName: string, timeAttackFile: string, setStatus: React.Dispatch<React.SetStateAction<Status>> }) {
  const bestTime = localStorage.getItem(timeAttackFile);
  if (bestTime === null){
    return (
      <div>
        <button className="timeAttackButtonUnplayed" onClick={() => setStatus({status_type: "TimeAttackModeGameScreen", time_attack_file: timeAttackFile})}>
          {timeAttackName}
        </button>
      </div>
    );
  } else {
    return (
      <button className="timeAttackButtonPlayed" onClick={() => setStatus({status_type: "TimeAttackModeGameScreen", time_attack_file: timeAttackFile})}>
        {timeAttackName} (ベストタイム: {Number(bestTime) / 1000} 秒)
      </button>
    );
  }
}

function ProblemModeButton({setStatus}: {setStatus: React.Dispatch<React.SetStateAction<Status>>;}){
    return (
        <button className="problemModeButton" onClick={() => setStatus({status_type: "ProblemSelectionScreen"})}>
          問題を解く
        </button>
    );
}
function TimeAttackModeButton({setStatus}: {setStatus: React.Dispatch<React.SetStateAction<Status>>;}){
    return (
        <button className="timeAttackModeButton" onClick={() => setStatus({status_type: "TimeAttackSelectionScreen"})}>
          タイムアタックをする
        </button>
    );
}
function ModeSelection({setStatus}: {setStatus: React.Dispatch<React.SetStateAction<Status>>; }){
    return (
        <div className="modeSelectionButton">
            <ProblemModeButton setStatus={setStatus}/>
            <TimeAttackModeButton setStatus={setStatus}/>
        </div>
    );
}

function ProblemSelection({ setStatus }: { setStatus: React.Dispatch<React.SetStateAction<Status>>}) {
  const solvedproblem1 = localStorage.getItem('problem1.json');
  console.log(solvedproblem1);
  return (
    <div>
      <ProblemButtonContainer>
        <ProblemButton problemName="1" problemFile="t1.json" setStatus={setStatus} />
        <ProblemButton problemName="2" problemFile="t2.json" setStatus={setStatus} />
        <ProblemButton problemName="3" problemFile="t3.json" setStatus={setStatus} />
        <ProblemButton problemName="4" problemFile="t4.json" setStatus={setStatus} />
        <ProblemButton problemName="5" problemFile="t5.json" setStatus={setStatus} />
        <ProblemButton problemName="6" problemFile="4201.json" setStatus={setStatus} />
        <ProblemButton problemName="7" problemFile="4202.json" setStatus={setStatus} />
        <ProblemButton problemName="8" problemFile="4203.json" setStatus={setStatus} />
        <ProblemButton problemName="9" problemFile="4204.json" setStatus={setStatus} />
        <ProblemButton problemName="10" problemFile="4205.json" setStatus={setStatus} />
        <ProblemButton problemName="11" problemFile="4206.json" setStatus={setStatus} />
        <ProblemButton problemName="12" problemFile="4207.json" setStatus={setStatus} />
        <ProblemButton problemName="13" problemFile="4208.json" setStatus={setStatus} />
        <ProblemButton problemName="14" problemFile="4209.json" setStatus={setStatus} />
        <ProblemButton problemName="15" problemFile="4210.json" setStatus={setStatus} />
        <ProblemButton problemName="16" problemFile="4301.json" setStatus={setStatus} />
        <ProblemButton problemName="17" problemFile="4302.json" setStatus={setStatus} />
        <ProblemButton problemName="18" problemFile="4303.json" setStatus={setStatus} />
        <ProblemButton problemName="19" problemFile="4304.json" setStatus={setStatus} />
        <ProblemButton problemName="20" problemFile="4305.json" setStatus={setStatus} />
        <ProblemButton problemName="21" problemFile="5201.json" setStatus={setStatus} />
        <ProblemButton problemName="22" problemFile="5202.json" setStatus={setStatus} />
        <ProblemButton problemName="23" problemFile="5203.json" setStatus={setStatus} />
        <ProblemButton problemName="24" problemFile="5204.json" setStatus={setStatus} />
        <ProblemButton problemName="25" problemFile="5205.json" setStatus={setStatus} />
        <ProblemButton problemName="26" problemFile="5206.json" setStatus={setStatus} />
        <ProblemButton problemName="27" problemFile="5207.json" setStatus={setStatus} />
        <ProblemButton problemName="28" problemFile="5208.json" setStatus={setStatus} />
        <ProblemButton problemName="29" problemFile="5209.json" setStatus={setStatus} />
        <ProblemButton problemName="30" problemFile="5210.json" setStatus={setStatus} />
        <ProblemButton problemName="31" problemFile="5301.json" setStatus={setStatus} />
        <ProblemButton problemName="32" problemFile="5302.json" setStatus={setStatus} />
        <ProblemButton problemName="33" problemFile="5303.json" setStatus={setStatus} />
        <ProblemButton problemName="34" problemFile="5304.json" setStatus={setStatus} />
        <ProblemButton problemName="35" problemFile="5305.json" setStatus={setStatus} />
        <ProblemButton problemName="36" problemFile="5306.json" setStatus={setStatus} />
        <ProblemButton problemName="37" problemFile="5307.json" setStatus={setStatus} />
        <ProblemButton problemName="38" problemFile="5308.json" setStatus={setStatus} />
        <ProblemButton problemName="39" problemFile="5309.json" setStatus={setStatus} />
        <ProblemButton problemName="40" problemFile="5310.json" setStatus={setStatus} />
        <ProblemButton problemName="41" problemFile="5311.json" setStatus={setStatus} />
        <ProblemButton problemName="42" problemFile="5312.json" setStatus={setStatus} />
        <ProblemButton problemName="43" problemFile="5313.json" setStatus={setStatus} />
        <ProblemButton problemName="44" problemFile="5314.json" setStatus={setStatus} />
        <ProblemButton problemName="45" problemFile="5315.json" setStatus={setStatus} />
        <ProblemButton problemName="46" problemFile="5316.json" setStatus={setStatus} />
        <ProblemButton problemName="47" problemFile="5317.json" setStatus={setStatus} />
        <ProblemButton problemName="48" problemFile="5318.json" setStatus={setStatus} />
        <ProblemButton problemName="49" problemFile="5319.json" setStatus={setStatus} />
        <ProblemButton problemName="50" problemFile="5320.json" setStatus={setStatus} />
      </ProblemButtonContainer>
      <div className="returnContainer">
        <ReturnToTitleButton setStatus={setStatus} />
      </div>
    </div>
  );
}

function ReturnToProblemSelectionButton({ setStatus } : { setStatus : React.Dispatch<React.SetStateAction<Status>>}){
  return (
    <button className="returnToProblemSelectionButton" onClick={() => setStatus({status_type: "ProblemSelectionScreen"})}>
      戻る
    </button>
  )
}

function ReturnToTimeAttackSelectionButton({ setStatus } : { setStatus : React.Dispatch<React.SetStateAction<Status>>}){
    return (
      <button className="returnToTimeAttackSelectionButton" onClick={() => setStatus({status_type: "TimeAttackSelectionScreen"})}>
        戻る
      </button>
    )
  }
  

function ReturnToTitleButton({ setStatus } : { setStatus : React.Dispatch<React.SetStateAction<Status>>}){
    return (
      <button className="returnToTitleButton" onClick={() => setStatus({status_type: "TitleScreen"})}>
        戻る
      </button>     
    )
}

function TimeAttackSelection({ setStatus }: { setStatus: React.Dispatch<React.SetStateAction<Status>>}){
  return(
    <div>
      <div>
      <TimeAttackButtonContainer>
        <TimeAttackButton timeAttackName="5桁 1手 10問" timeAttackFile="time_attack1.json" setStatus={setStatus} />
        <TimeAttackButton timeAttackName="5桁 2手 10問" timeAttackFile="time_attack2.json" setStatus={setStatus} />
        <TimeAttackButton timeAttackName="5桁 3手 10問" timeAttackFile="time_attack3.json" setStatus={setStatus} />
      </TimeAttackButtonContainer>
      </div>
      <div>
        <ReturnToTitleButton setStatus={setStatus} />
      </div>
    </div>
  );
}

function MoveCounter({ moveCount } : { moveCount : number }){
  return (
    <div>
      手数: {moveCount}
    </div>
  );
}

function MinimumMovesDisplay({ minimumMoves } : { minimumMoves : number }){
  return (
    <div>
      最小手数: {minimumMoves}
    </div>
  );
}

function SolvedProblemCountDisplay({ solvedProblemCount, problemCount } : { solvedProblemCount : number, problemCount: number }){
  return (
    <div>
      解いた問題数: {solvedProblemCount}/{problemCount}
    </div>
  );
}
function Timer({ isActive, time, setTime }: { isActive : boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>>}){
  useEffect(() => {
    if (isActive){
      const timer = setTimeout(() => {
        setTime(time + 100);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [time]);
  return (
    <div>
      タイム: {time / 1000}秒
    </div>
  )
}
function ProblemModeGameInfoLeft({ minimumMoves, moveCount, isActive, time, setTime, setStatus }: { minimumMoves: number, moveCount: number, isActive: boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>>, setStatus: React.Dispatch<React.SetStateAction<Status>> }){
  return (
    <div className="gameInfoLeft">
      <MinimumMovesDisplay minimumMoves={minimumMoves} />
      <MoveCounter moveCount={moveCount} />
      <Timer isActive={isActive} time={time} setTime={setTime} />
      <ReturnToProblemSelectionButton setStatus={setStatus} />
    </div>
  )
}
function TimeAttackModeGameInfoLeft({ minimumMoves, moveCount, isActive, time, setTime, setStatus, solvedProblemCount, problemCount }: { minimumMoves: number, moveCount: number, isActive: boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>>, setStatus: React.Dispatch<React.SetStateAction<Status>> , solvedProblemCount: number, problemCount: number }){
  return (
    <div className="gameInfoLeft">
      <SolvedProblemCountDisplay solvedProblemCount={solvedProblemCount} problemCount={problemCount} />
      <MinimumMovesDisplay minimumMoves={minimumMoves} />
      <MoveCounter moveCount={moveCount} />
      <Timer isActive={isActive} time={time} setTime={setTime} />
      <ReturnToTimeAttackSelectionButton setStatus={setStatus} />
    </div>
  )
}

function GameInfoRight({ bitHistory, dispatchbitHistory, problem }: { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation>, problem: Problem}){
  return (
    <div className="gameInfoRight">
      <BitDisplay currentBits={problem.target} />
      <BitDisplay currentBits={bitHistory[bitHistory.length - 1]} />
      <BitOperationButtonContainer>
        {problem.operations.map((operation, index) => (
          <BitOperationButton key={index} dispatchbitHistory={dispatchbitHistory} operation={operation} />
        ))}
      </BitOperationButtonContainer>
      <UndoRetryButtonContainer bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} />
    </div>
  )
}

function ProblemModeGame({ setStatus, problemFileName }: { setStatus: React.Dispatch<React.SetStateAction<Status>>, problemFileName: string}) {
  const [bitHistory, dispatchbitHistory] = useReducer(bitHistoryReducer, []);
  const [problem, setProblem] = useState<Problem>({bit_length: 0, start: "", target: "", operation_count: 0, operations: [], minimum_moves: 0});
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        console.log(`basepath: ${basePath}`); 
        const response = await fetch(`${basePath}/problems/${problemFileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProblem(data.problem);
        console.log(data.problem);
        dispatchbitHistory({ operation_type: "clear" });
        dispatchbitHistory({ operation_type: "append", parameter: data.problem.start });
      } catch (error) {
        console.error("Error fetching problem file:", error);
        if (error instanceof Error) {
          alert(`問題ファイルの読み込みに失敗しました: ${error.message}`);
        } else {
          alert("問題ファイルの読み込みに失敗しました: 不明なエラーが発生しました。");
        }
      }
    }
    fetchProblem();
  }, []);

  if (bitHistory[bitHistory.length - 1] === problem.target){
    if (bitHistory.length - 1 === problem.minimum_moves){
      localStorage.setItem(problemFileName, "SolvedMinimum");
    } else if (localStorage.getItem(problemFileName) !== "SolvedMinimum"){
      localStorage.setItem(problemFileName, "Solved");
    }
  }

  return (
    <div className="gameInfo">
      <ProblemModeGameInfoLeft minimumMoves={problem.minimum_moves} moveCount={bitHistory.length - 1} isActive={bitHistory[bitHistory.length - 1] !== problem.target} time={time} setTime={setTime} setStatus={setStatus}/>
      <GameInfoRight bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} problem={problem} />
    </div>
  );
}

type TimeAttack = {problems: string[], problem_count: number}

function TimeAttackModeGame({ setStatus, timeAttackFileName }: { setStatus: React.Dispatch<React.SetStateAction<Status>>, timeAttackFileName: string}) {
  const [timeAttack, setTimeAttack] = useState<TimeAttack>({problems: [], problem_count: 0});
  const [solvedProblemCount, setSolvedProblemCount] = useState<number>(0);
  const [currentProblem, setcurrentProblem] = useState<number>(0);
  const [problem, setProblem] = useState<Problem>({bit_length: 0, start: "", target: "", operation_count: 0, operations: [], minimum_moves: 0});
  const [bitHistory, dispatchbitHistory] = useReducer(bitHistoryReducer, []);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    async function fetchTimeAttack() {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        console.log(`basepath: ${basePath}`); 
        const response = await fetch(`${basePath}/time_attack_data/${timeAttackFileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setTimeAttack(data);
        setcurrentProblem(1);
      } catch (error) {
        console.error("Error fetching problem file:", error);
        if (error instanceof Error) {
          alert(`問題ファイルの読み込みに失敗しました: ${error.message}`);
        } else {
          alert("問題ファイルの読み込みに失敗しました: 不明なエラーが発生しました。");
        }
      }
    }
    fetchTimeAttack();
  }, []);
  
  useEffect(() => {
    if (currentProblem === 0){
      return;
    }
    async function fetchProblem() {
      const problemIndex = Math.floor(Math.random() * timeAttack.problems.length);
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        const response = await fetch(`${basePath}/problems/${timeAttack.problems[problemIndex]}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProblem(data.problem);
        dispatchbitHistory({ operation_type: "clear" });
        dispatchbitHistory({ operation_type: "append", parameter: data.problem.start });
      } catch (error) {
        console.error("Error fetching problem file:", error);
        if (error instanceof Error) {
          alert(`問題ファイルの読み込みに失敗しました: ${error.message}`);
        } else {
          alert("問題ファイルの読み込みに失敗しました: 不明なエラーが発生しました。");
        }
      }
    };
    fetchProblem();
  }, [currentProblem]);

  useEffect(() => {
    if (bitHistory.length > 0 && bitHistory[bitHistory.length - 1] === problem.target){
      const nextSolvedProblemCount = solvedProblemCount + 1;
      setSolvedProblemCount(nextSolvedProblemCount);
      if (nextSolvedProblemCount < timeAttack.problem_count){
        setTimeout(() => {
          setcurrentProblem(nextSolvedProblemCount + 1);
        }, 1000);
      } else {
        const solveTime = time + 100;
        if (localStorage.getItem(timeAttackFileName) == null){
          localStorage.setItem(timeAttackFileName, solveTime.toString());
        } else {
          localStorage.setItem(timeAttackFileName, Math.min(Number(localStorage.getItem(timeAttackFileName)), solveTime).toString())
        }
      }
    }
  }, [bitHistory]);

  return (
    <div className="gameInfo">
      <TimeAttackModeGameInfoLeft minimumMoves={problem.minimum_moves} moveCount={bitHistory.length - 1} isActive={timeAttack.problem_count == 0 || solvedProblemCount < timeAttack.problem_count} time={time} setTime={setTime} setStatus={setStatus} solvedProblemCount={solvedProblemCount} problemCount={timeAttack.problem_count}/>
      <GameInfoRight bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} problem={problem} />
    </div>
  );
}
function Title(){
  return (
    <div>
      <h1 className="title">Bit Breaker</h1>
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = useState<Status>({status_type: "TitleScreen"});
  switch (status.status_type){
    case "TitleScreen":
        return(
          <div>
            <Title />
            <ModeSelection setStatus={setStatus} />
          </div>
        );
    case "ProblemSelectionScreen":
      return (
        <div>
          <Title />
          <ProblemSelection setStatus={setStatus} />
        </div>
      );
    case "TimeAttackSelectionScreen":
      return (
        <div>
          <Title />
          <TimeAttackSelection setStatus={setStatus} />
        </div>
      );
    case "ProblemModeGameScreen":
      return (
        <div>
          <Title />
          <ProblemModeGame setStatus={setStatus} problemFileName={status.problem_file}/>
        </div>
      );
    case "TimeAttackModeGameScreen":
      return (
        <div>
          <Title />
          <TimeAttackModeGame setStatus={setStatus} timeAttackFileName={status.time_attack_file}/>
        </div>
      );
  }
}