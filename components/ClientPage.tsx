'use client';

import React, { useEffect, useState, useReducer} from "react";
// import { time } from "console";
// import next from "next";
// import { ReadStream } from "fs";
import Image from 'next/image'
import { useAudio } from "../app/hooks/useAudio";
// import { neon } from '@neondatabase/serverless';
// import { createComment } from './actions/createComment';
// import { getDisplayName } from "next/dist/shared/lib/utils";
import { useUser } from "@stackframe/stack";
import SignOutButton from '@/components/ui/SignOutButton';

const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH || '';

const CORRECT_AUDIO_PATH: string = `${BASE_PATH}/audios/correct/correct037.mp3`;
const SET_PROBLEM_AUDIO_PATH: string = `${BASE_PATH}/audios/set_problem/set_problem28.mp3`;
const OPERATION_AUDIO_PATH: string = `${BASE_PATH}/audios/operation/operation06.mp3`;
const NAVIGATION_AUDIO_PATH: string = `${BASE_PATH}/audios/navigation/navigation34.mp3`;
const UNDO_AUDIO_PATH: string = `${BASE_PATH}/audios/undo/undo05.mp3`;
const DISABLED_AUDIO_PATH: string = `${BASE_PATH}/audios/disabled/disabled04.mp3`;

const CORRECT_AUDIO_VOLUME: number = 0.25;
const SET_PROBLEM_AUDIO_VOLUME: number = 0.3;
const OPERATION_AUDIO_VOLUME: number = 1.0;
const NAVIGATION_AUDIO_VOLUME: number = 0.2;
const UNDO_AUDIO_VOLUME: number = 0.2;
const DISABLED_AUDIO_VOLUME: number = 0.15;

const UNDO_PENALTY: number = 10000;
const MOVE_PENALTY_RATE: number = 10000;

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

function BitOperationButton({ dispatchbitHistory, operation, isActive }: { dispatchbitHistory: React.Dispatch<bitHistoryOperation>, operation: BitOperation, isActive: boolean }) {
  const operationAudioPlay = useAudio(OPERATION_AUDIO_PATH);
  const disabledAudioPlay = useAudio(DISABLED_AUDIO_PATH);
  if (isActive) {
     return (
      <button className="bitOperationButtonEnabled" onClick={() => {
        operationAudioPlay(OPERATION_AUDIO_VOLUME);
        dispatchbitHistory({operation_type: "bitoperation", bit_operation: operation});
      }}>
        {getOperationDisplayName(operation)}
      </button>
    );
  }
  else {
    return (
      <button className="bitOperationButtonDisabled" onClick={() => {disabledAudioPlay(DISABLED_AUDIO_VOLUME);}}>
        {getOperationDisplayName(operation)}
      </button>
    );
  }
}

function BitOperationButtonContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bitOperationButtonContainer">
      {children}
    </div>
  );
}

function BitDisplayCurrent({ bits, correct, isMinimum }: { bits: Bit, correct: boolean, isMinimum: boolean }) {
  if (isMinimum && correct){
    return (
      <div className="bitDisplayMinimum"> {bits} </div>
    )
  } else if (correct){
    return (
      <div className="bitDisplayCorrect"> {bits} </div>
    )
  } else {
    return (
      <div className="bitDisplayCurrent"> {bits} </div>
    )    
  }
}

function BitDisplayTarget({ bits }: { bits: Bit }) {
  return (
    <div className="bitDisplayTarget"> {bits} </div>
  )
}

function UndoButton({ bitHistory, dispatchbitHistory, isActive, time, setTime} : { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation>, isActive: boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>> }) {
  const undoAudioPlay = useAudio(UNDO_AUDIO_PATH);
  const disabledAudioPlay = useAudio(DISABLED_AUDIO_PATH);
  if (bitHistory.length === 1 || !isActive) {
    return (
      <button className="undoButtonDisabled" onClick={() => {disabledAudioPlay(DISABLED_AUDIO_VOLUME)}}> 
        1 手戻る
      </button>
    );
  } else {
    return (
      <button className="undoButtonEnabled" onClick={() => {
        if (isActive){
          undoAudioPlay(UNDO_AUDIO_VOLUME);
          dispatchbitHistory({operation_type: "pop"});
          setTime(time => time + UNDO_PENALTY);
        }
      }}>
        1 手戻る
      </button>
    );
  }
}

function RetryButton({ bitHistory, dispatchbitHistory, isActive, time, setTime } : { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation>, isActive: boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>> }) {
  const undoAudioPlay = useAudio(UNDO_AUDIO_PATH);
  const disabledAudioPlay = useAudio(DISABLED_AUDIO_PATH);

  if (bitHistory.length === 1 || !isActive) {
    return (
      <button className="retryButtonDisabled" onClick={() => {disabledAudioPlay(DISABLED_AUDIO_VOLUME)}}> 
        リトライ
      </button>
    );
  }
  else {
    return (
      <button className="retryButtonEnabled" onClick={() => {
        undoAudioPlay(UNDO_AUDIO_VOLUME);
        let initialBit = bitHistory[0];
        dispatchbitHistory({operation_type: "clear"});
        dispatchbitHistory({operation_type: "append", parameter: initialBit});
        setTime(time => time + UNDO_PENALTY);
      }}>
        リトライ
      </button>
    );
  }
}

function UndoRetryButtonContainer({ bitHistory, dispatchbitHistory, isActive, time, setTime } : { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation>, isActive: boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>>}){
  return (
    <div className="undoRetryButtonContainer">
      <UndoButton bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} isActive={isActive} time={time} setTime={setTime} />
      <RetryButton bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} isActive={isActive} time={time} setTime={setTime} />
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

function ProblemButton({ problemName, problemFile, setStatus, problemStatus  }: { problemName: string, problemFile: string, setStatus: React.Dispatch<React.SetStateAction<Status>>, problemStatus?: string  }) {
  const navigationAudioPlay = useAudio(NAVIGATION_AUDIO_PATH);
  if (problemStatus === "SOLVED"){
    return (
      <button className="problemButtonSolved" onClick={() => {
        navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
        setStatus({status_type: "ProblemModeGameScreen", problem_file: problemFile})
      }}>
        {problemName}
      </button>
    );
  } else if (problemStatus === "SOLVED_MINIMUM"){
    return (
      <button className="problemButtonSolvedMinimum" onClick={() => {
        navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
        setStatus({status_type: "ProblemModeGameScreen", problem_file: problemFile})
      }}>
        {problemName}
      </button>
    );
  } else {
    return (
      <button className="problemButtonUnsolved" onClick={() => {
        navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
        setStatus({status_type: "ProblemModeGameScreen", problem_file: problemFile})
      }}>
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

function TimeAttackButton({ timeAttackName, timeAttackFile, setStatus, bestTime }: { timeAttackName: string, timeAttackFile: string, setStatus: React.Dispatch<React.SetStateAction<Status>>, bestTime: number | null }) {
  // const bestTime = localStorage.getItem(timeAttackFile);
  const navigationAudioPlay = useAudio(NAVIGATION_AUDIO_PATH);
  if (!bestTime){
    return (
      <div>
        <button className="timeAttackButtonUnplayed" onClick={() => {
          navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
          setStatus({status_type: "TimeAttackModeGameScreen", time_attack_file: timeAttackFile})
        }}>
          {timeAttackName} (ベストタイム: 999.99 秒)
        </button>
      </div>
    );
  } else {
    return (
      <button className="timeAttackButtonPlayed" onClick={() => {
        navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
        setStatus({status_type: "TimeAttackModeGameScreen", time_attack_file: timeAttackFile})
      }}>
        {timeAttackName} (ベストタイム: {(Number(bestTime) / 1000).toFixed(2)} 秒)
      </button>
    );
  }
}

function ProblemModeButton({setStatus}: {setStatus: React.Dispatch<React.SetStateAction<Status>>;}){
  const navigationAudioPlay = useAudio(NAVIGATION_AUDIO_PATH);
    return (
        <button className="problemModeButton" onClick={() => {
          navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
          setStatus({status_type: "ProblemSelectionScreen"})
        }}>
          熟考モード
        </button>
    );
}
function TimeAttackModeButton({setStatus}: {setStatus: React.Dispatch<React.SetStateAction<Status>>;}){
  const navigationAudioPlay = useAudio(NAVIGATION_AUDIO_PATH);
    return (
        <button className="timeAttackModeButton" onClick={() => {
          navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
          setStatus({status_type: "TimeAttackSelectionScreen"})
        }}>
          タイムアタックモード
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
  // クリア状況を保持するためのstateを追加
  const [problemStatuses, setProblemStatuses] = useState<{ [key: string]: string }>({});

  // ページ表示時に、APIを呼び出してクリア状況を取得する
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/problem-mode/user-statuses', {
          credentials: 'include', // 認証情報（クッキー）をリクエストに含める
        });
        if (response.ok) {
          const data = await response.json();
          setProblemStatuses(data);
        }
      } catch (error) {
        console.error("Failed to fetch problem statuses:", error);
      }
    };

    fetchStatuses();
  }, []);

  const problems = [
    { name: '1', file: 't1.json' },
    { name: '2', file: 't2.json' },
    { name: '3', file: 't3.json' },
    { name: '4', file: 't4.json' },
    { name: '5', file: 't5.json' },
    { name: '6', file: '4201.json' },
    { name: '7', file: '4202.json' },
    { name: '8', file: '4203.json' },
    { name: '9', file: '4204.json' },
    { name: '10', file: '4205.json' },
    { name: '11', file: '4206.json' },
    { name: '12', file: '4207.json' },
    { name: '13', file: '4208.json' },
    { name: '14', file: '4209.json' },
    { name: '15', file: '4210.json' },
    { name: '16', file: '4301.json' },
    { name: '17', file: '4302.json' },
    { name: '18', file: '4303.json' },
    { name: '19', file: '4304.json' },
    { name: '20', file: '4305.json' },
    { name: '21', file: '5201.json' },
    { name: '22', file: '5202.json' },
    { name: '23', file: '5203.json' },
    { name: '24', file: '5204.json' },
    { name: '25', file: '5205.json' },
    { name: '26', file: '5206.json' },
    { name: '27', file: '5207.json' },
    { name: '28', file: '5208.json' },
    { name: '29', file: '5209.json' },
    { name: '30', file: '5210.json' },
    { name: '31', file: '5301.json' },
    { name: '32', file: '5302.json' },
    { name: '33', file: '5303.json' },
    { name: '34', file: '5304.json' },
    { name: '35', file: '5305.json' },
    { name: '36', file: '5306.json' },
    { name: '37', file: '5307.json' },
    { name: '38', file: '5308.json' },
    { name: '39', file: '5309.json' },
    { name: '40', file: '5310.json' },
    { name: '41', file: '5311.json' },
    { name: '42', file: '5312.json' },
    { name: '43', file: '5313.json' },
    { name: '44', file: '5314.json' },
    { name: '45', file: '5315.json' },
    { name: '46', file: '5316.json' },
    { name: '47', file: '5317.json' },
    { name: '48', file: '5318.json' },
    { name: '49', file: '5319.json' },
    { name: '50', file: '5320.json' },
  ];

  return (
    <div>
      <ProblemButtonContainer>
        {problems.map((problem) => (
          <ProblemButton
            key={problem.name}
            problemName={problem.name}
            problemFile={problem.file}
            setStatus={setStatus}
            problemStatus={problemStatuses[problem.file]}
          />
        ))}
      </ProblemButtonContainer>
      <div className="returnContainer">
        <ReturnToTitleButton setStatus={setStatus} />
      </div>
    </div>
  );
}

function ReturnToProblemSelectionButton({ setStatus } : { setStatus : React.Dispatch<React.SetStateAction<Status>>}){
  const navigationAudioPlay = useAudio(NAVIGATION_AUDIO_PATH);
  return (
    <button className="returnToProblemSelectionButton" onClick={() => {
      navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
      setStatus({status_type: "ProblemSelectionScreen"})
    }}>
      戻る
    </button>
  )
}

function ReturnToTimeAttackSelectionButton({ setStatus } : { setStatus : React.Dispatch<React.SetStateAction<Status>>}){
  const navigationAudioPlay = useAudio(NAVIGATION_AUDIO_PATH);
    return (
      <button className="returnToTimeAttackSelectionButton" onClick={() => {
        navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
        setStatus({status_type: "TimeAttackSelectionScreen"})
      }}>
        戻る
      </button>
    )
  }
  

function ReturnToTitleButton({ setStatus } : { setStatus : React.Dispatch<React.SetStateAction<Status>>}){
  const navigationAudioPlay = useAudio(NAVIGATION_AUDIO_PATH);
    return (
      <button className="returnToTitleButton" onClick={() => {
        navigationAudioPlay(NAVIGATION_AUDIO_VOLUME), 
        setStatus({status_type: "TitleScreen"})
      }}>
        戻る
      </button>     
    )
}

function TimeAttackSelection({ setStatus }: { setStatus: React.Dispatch<React.SetStateAction<Status>>}){
  const [bestTimes, setBestTimes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // ★APIから全種類のベストタイムを取得する
    const fetchBestTimes = async () => {
      try {
        const response = await fetch('/api/time-attack/best-times');
        const data = await response.json();
        setBestTimes(data);
      } catch (error) {
        console.error("Failed to fetch best times:", error);
      }
    };
    fetchBestTimes();
  }, []);

  return(
    <div>
      <div>
      <TimeAttackButtonContainer>
        <TimeAttackButton timeAttackName="5桁 1手 10問" timeAttackFile="time_attack1.json" setStatus={setStatus} bestTime={bestTimes['time_attack1.json']} />
        <TimeAttackButton timeAttackName="5桁 2手 10問" timeAttackFile="time_attack2.json" setStatus={setStatus} bestTime={bestTimes['time_attack2.json']} />
        <TimeAttackButton timeAttackName="5桁 3手 10問" timeAttackFile="time_attack3.json" setStatus={setStatus} bestTime={bestTimes['time_attack3.json']} />
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
function Timer({ isActive, time, setTime }: { isActive : boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>> }){
  const [time2, setTime2] = useState<number>(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTime2(time2 => time2 + 10);
      if (isActive){
        setTime(time => time + 10);
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [time2]);
  return (
    <div>
      タイム: {(time * 1.111 / 1000).toFixed(2)}秒
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

function GameInfoRight({ bitHistory, dispatchbitHistory, problem, isActive, time, setTime }: { bitHistory: bitHistory, dispatchbitHistory: React.Dispatch<bitHistoryOperation>, problem: Problem, isActive: boolean, time: number, setTime: React.Dispatch<React.SetStateAction<number>> }){
  console.log(bitHistory.length, problem.minimum_moves);
  return (
    <div className="gameInfoRight">
      <BitDisplayTarget bits={problem.target} />
      <BitDisplayCurrent bits={bitHistory[bitHistory.length - 1]} correct={bitHistory[bitHistory.length - 1] === problem.target} isMinimum={problem.minimum_moves === bitHistory.length - 1}/>
      <BitOperationButtonContainer>
        {problem.operations.map((operation, index) => (
          <BitOperationButton key={index} dispatchbitHistory={dispatchbitHistory} operation={operation} isActive={isActive} />
        ))}
      </BitOperationButtonContainer>
      <UndoRetryButtonContainer bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} isActive={isActive} time={time} setTime={setTime} />
    </div>
  )
}

function ProblemModeGame({ setStatus, problemFileName }: { setStatus: React.Dispatch<React.SetStateAction<Status>>, problemFileName: string}) {
  const [bitHistory, dispatchbitHistory] = useReducer(bitHistoryReducer, []);
  const [problem, setProblem] = useState<Problem>({bit_length: 0, start: "", target: "", operation_count: 0, operations: [], minimum_moves: 0});
  const [time, setTime] = useState<number>(0);
  const correctAudioPlay = useAudio(CORRECT_AUDIO_PATH);

  let isActive = (problem.bit_length > 0 && bitHistory.length > 0 && bitHistory[bitHistory.length - 1] !== problem.target);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const response = await fetch(`${BASE_PATH}/problems/${problemFileName}`);
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
    }
    fetchProblem();
  }, []);


  useEffect(() => {
    if (bitHistory[bitHistory.length - 1] === problem.target){

    const moveCount = Math.max(bitHistory.length - 1, 0);
    const penalty = Math.max(moveCount - problem.minimum_moves, 0) * MOVE_PENALTY_RATE;
    setTime(time => time + penalty);
    
      if (typeof window !== "undefined"){
        correctAudioPlay(CORRECT_AUDIO_VOLUME);
      }
      // if (bitHistory.length - 1 === problem.minimum_moves){
      //   localStorage.setItem(problemFileName, "SolvedMinimum");
      // } else if (localStorage.getItem(problemFileName) !== "SolvedMinimum"){
      //   localStorage.setItem(problemFileName, "Solved");
      // }

      // ★新しいステータスを決定
      const newStatus = (bitHistory.length - 1 === problem.minimum_moves) ? "SOLVED_MINIMUM" : "SOLVED";

      // ★localStorage.setItem の代わりに、新しいスコア送信APIを呼び出す
      const submitResult = async () => {
        try {
          await fetch('/api/problem-mode/submit-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              problemId: problemFileName, // ★TODO: problemオブジェクトから実際の番号を取得する
              status: newStatus,
            }),
            credentials: 'include',
          });
        } catch (error) {
          console.error("Failed to submit result:", error);
        }
      };
      submitResult();
    }
  }, [bitHistory]);

  return (
    <div className="gameInfo">
      <ProblemModeGameInfoLeft minimumMoves={problem.minimum_moves} moveCount={Math.max(bitHistory.length - 1, 0)} isActive={isActive} time={time} setTime={setTime} setStatus={setStatus}/>
      <GameInfoRight bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} problem={problem} isActive={isActive} time={time} setTime={setTime} />
    </div>
  );
}

type TimeAttack = {problems: string[], problem_count: number}

function TimeAttackModeGame({ setStatus, timeAttackFileName }: { setStatus: React.Dispatch<React.SetStateAction<Status>>, timeAttackFileName: string}) {
  const [timeAttack, setTimeAttack] = useState<TimeAttack>({problems: [], problem_count: 0});
  const [solvedProblemCount, setSolvedProblemCount] = useState<number>(0);
  const [currentProblem, setCurrentProblem] = useState<number>(0);
  const [problem, setProblem] = useState<Problem>({bit_length: 0, start: "", target: "", operation_count: 0, operations: [], minimum_moves: 0});
  const [bitHistory, dispatchbitHistory] = useReducer(bitHistoryReducer, []);
  const [time, setTime] = useState<number>(0);
  const [timeActive, setTimeActive] = useState<boolean>(false);
  const correctAudioPlay = useAudio(CORRECT_AUDIO_PATH);
  const setProblemAudioPlay = useAudio(SET_PROBLEM_AUDIO_PATH);
  // const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimeAttack() {
      try {
        const response = await fetch(`${BASE_PATH}/time_attack_data/${timeAttackFileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setTimeAttack(data);
        setCurrentProblem(1);
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
        const response = await fetch(`${BASE_PATH}/problems/${timeAttack.problems[problemIndex]}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
        }
        setProblemAudioPlay(SET_PROBLEM_AUDIO_VOLUME);
        const data = await response.json();
        setProblem(data.problem);
        dispatchbitHistory({ operation_type: "clear" });
        dispatchbitHistory({ operation_type: "append", parameter: data.problem.start });
        setTimeActive(true);
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
      const moveCount = Math.max(bitHistory.length - 1, 0);
      const penalty = Math.max(moveCount - problem.minimum_moves, 0) * MOVE_PENALTY_RATE;
      setTime(time => time + penalty);

      setTimeActive(false);
      correctAudioPlay(CORRECT_AUDIO_VOLUME);
      const nextSolvedProblemCount = solvedProblemCount + 1;
      if (nextSolvedProblemCount < timeAttack.problem_count){
        setTimeout(() => {
          setCurrentProblem(nextSolvedProblemCount + 1);
        }, 1000);
      } else {
        const solveTime = Math.round(time * 1.111 + 10);
        // if (localStorage.getItem(timeAttackFileName) == null){
        //   localStorage.setItem(timeAttackFileName, solveTime.toString());
        // } else {
        //   localStorage.setItem(timeAttackFileName, Math.min(Number(localStorage.getItem(timeAttackFileName)), solveTime).toString())
        // }
        // ★localStorage.setItem の代わりにAPIを呼び出す
        const submitScore = async () => {
          try {
            await fetch('/api/time-attack/submit-score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionType: timeAttackFileName,
                time: solveTime,
              }),
              credentials: 'include', // ★★★ これが重要 (cookies 情報) ★★★
            });
          } catch (error) {
            console.error("Failed to submit score:", error);
          }
        };
      submitScore();
      }
      setSolvedProblemCount(nextSolvedProblemCount);
    }
  }, [bitHistory]);

  return (
    <div className="gameInfo">
      <TimeAttackModeGameInfoLeft minimumMoves={problem.minimum_moves} moveCount={Math.max(bitHistory.length - 1, 0)} isActive={timeActive} time={time} setTime={setTime} setStatus={setStatus} solvedProblemCount={solvedProblemCount} problemCount={timeAttack.problem_count}/>
      <GameInfoRight bitHistory={bitHistory} dispatchbitHistory={dispatchbitHistory} problem={problem} isActive={timeActive} time={time} setTime={setTime} />
    </div>
  );
}
function Title(){
  return (
    <div>
      {/* <h1 className="title">Bit Breaker</h1> */}
      <Image src="/true_transparent.png" alt="image description" width={400} height={130}  className="css-image"/>
    </div>
  );
}
function TitleProblem(){
    return (
      <div>
        {/* <h1 className="title">Bit Breaker</h1> */}
        <Image src="/true_transparent.png" alt="image description" width={400} height={130}  className="css-image-problem"/>
      </div>
    );
  }

export function ClientPage({ user }: { user: {displayName: string } | null }) {

  // // DB の接続を確認
  // return (
  //   <form action={createComment}>
  //     <input type="text" placeholder="write a comment" name="comment" />
  //     <button type="submit">Submit</button>
  //   </form>
  // );


  const [status, setStatus] = useState<Status>({status_type: "TitleScreen"});
  switch (status.status_type){
    case "TitleScreen":
        return(
          <div>
            {/* <SignOutButton /> */}
            {/* {user && <p className</div>="welcome">ようこそ、{user.displayName}さん！</p>} */}
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
          <TitleProblem />
          <ProblemModeGame setStatus={setStatus} problemFileName={status.problem_file}/>
        </div>
      );
    case "TimeAttackModeGameScreen":
      return (
        <div>
          <TitleProblem />
          <TimeAttackModeGame setStatus={setStatus} timeAttackFileName={status.time_attack_file}/>
        </div>
      );
  }
}