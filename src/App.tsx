import { useEffect, useState } from 'react';
import './App.css';
enum HighscoreType {
  BothStars = 'bothstars',
  Delta = 'delta',
  StarGain = 'stargain',
  FirstStar = 'firststar',
}
const hourInMs = 1000*60*60;
const hourInS = 60*60;
const minuteInMs = 1000*60;
const minuteInS = 60;
const secondInMs = 1000;
let days = new Array(25).fill(false);
let curDay = 1
const numEnabledDays = curDay > 25 ? 25 : curDay;
days = days.map((_, idx) => idx+1 > numEnabledDays ? false : true)
const playerList = undefined

function initialiseScores(scores: any) {
  const playerList = sortPlayersForDay(""+numEnabledDays, HighscoreType.BothStars, Object.entries(scores.members));
  for (let i = 0; i < numEnabledDays; i++) {
    insertStarGainsForDay(""+(i+1), playerList);
  }
  return playerList;
} 


function App() {
  const [players, setPlayers] = useState<any[]>(playerList ?? []);
  useEffect(() => {
    console.log(process);
    let a = import(process.env.REACT_APP_SCORES_PATH!).then((score) => {
      debugger;
      setPlayers(initialiseScores(score));
    });
  },[])
  const [selectedDay, setSelectedDay] = useState<string>(""+numEnabledDays);
  const [selectedScoreType, setSelectedScoreType] = useState<HighscoreType>(HighscoreType.StarGain);
  const [showScoreboardInput, setShowScoreboardInput] = useState<boolean>(false);
  const [customJSON, setCustomJSON] = useState<string>('')
  return (
    <div className="App">
      <header className="App-header">
        <div className="privboard-row">
          <span className="privboard-days">
            {days.map((day, idx) => {
              return day ? <a href="" className={""+(idx+1) === selectedDay ? 'bold':''} onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation();
                setSelectedDay(""+(idx+1));
                setPlayers(sortPlayersForDay(""+(idx+1), selectedScoreType, players));
              }}>{(idx+1).toString().split('').map((dayNumber, dayNumberIdx) => <>{dayNumberIdx > 0 ? <br/> : <></>}{dayNumber}</>)}</a> : <span>{(idx+1).toString().split('').map((dayNumber, dayNumberIdx) => <>{dayNumberIdx > 0 ? <br/> : <></>}{dayNumber}</>)}</span>
            })}
          </span>
        </div>
      </header>
      <section>
      <select value={selectedScoreType} onChange={(ev) => {
        const scoreType = ev.target.value as HighscoreType;
        setSelectedScoreType(scoreType)
        setPlayers(sortPlayersForDay(selectedDay, scoreType, players));
      }}>
              <option value={HighscoreType.BothStars}>Time to both stars</option>
              <option value={HighscoreType.FirstStar}>Time to first star</option>
              <option value={HighscoreType.Delta}>Time between star 1 and 2</option>
              <option value={HighscoreType.StarGain}>Points gained</option>
      </select>

        {players.map((player, idx) => {
          return renderPlayer(player[1], selectedDay, idx, selectedScoreType);
        })}
        
      </section>
      <aside className={`score-input-aside ${showScoreboardInput ? 'expanded' : ''}`}>
        <label htmlFor="scoresinput">Insert custom scoreboard JSON</label><button className="link-like-button" onClick={() => setShowScoreboardInput(!showScoreboardInput)}>{showScoreboardInput ? '-' : '+'}</button>
        {showScoreboardInput && <textarea id="scoresinput" value={customJSON} onChange={(ev) => {
          setCustomJSON(ev.target.value)
        }}></textarea>}
        {showScoreboardInput && <button onClick={() => {
          let parsedScore = JSON.parse(customJSON);
          let playerList = initialiseScores(parsedScore);
          setPlayers(playerList);
        }}>Set scoreboard</button>}
      </aside>
    </div>
  );
}
function getNthStarTs(player: any, n: number, day: string) {
  return player.completion_day_level[day]?.[""+n]?.get_star_ts;
}
function sortPlayersForDay(day: string, highscoreType: HighscoreType, playerList: any[]): any[] {
  switch(highscoreType) {
    case HighscoreType.BothStars:
      return bothStarsSort(day, playerList);
    case HighscoreType.Delta:
      return deltaDaySort(day, playerList);
    case HighscoreType.StarGain:
      return starGainSort(day, playerList);
    case HighscoreType.FirstStar:
      return firstStarSort(day, playerList);
  }
}
function bothStarsSort(day: string, playerList: any[]): any[] {
  return [...playerList].sort((playerA, playerB) => {
    const playerA2Ts = getNthStarTs(playerA[1], 2, day);
    const playerB2Ts = getNthStarTs(playerB[1], 2, day);
    const playerA1Ts = getNthStarTs(playerA[1], 1, day);
    const playerB1Ts = getNthStarTs(playerB[1], 1, day);
    if (playerA2Ts && playerB2Ts) {
      return playerA2Ts - playerB2Ts;
    } else if (playerA2Ts && !playerB2Ts) {
      return playerA2Ts - Number.MAX_SAFE_INTEGER;
    } else if (!playerA2Ts && playerB2Ts) {
      return Number.MAX_SAFE_INTEGER - playerB2Ts;
    }
    return (playerA1Ts ?? Number.MAX_SAFE_INTEGER) - (playerB1Ts ?? Number.MAX_SAFE_INTEGER);
  });
}
function deltaDaySort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => {
    const playerA2Ts = getNthStarTs(playerA[1], 2, day);
    const playerB2Ts = getNthStarTs(playerB[1], 2, day);
    const playerA1Ts = getNthStarTs(playerA[1], 1, day);
    const playerB1Ts = getNthStarTs(playerB[1], 1, day);
    if (playerA2Ts && playerB2Ts) {
      return (playerA2Ts - playerA1Ts) - (playerB2Ts - playerB1Ts);
    } else if (playerA2Ts && !playerB2Ts) {
      return (playerA2Ts - playerA1Ts) - Number.MAX_SAFE_INTEGER;
    } else if (!playerA2Ts && playerB2Ts) {
      return Number.MAX_SAFE_INTEGER - (playerB2Ts - playerB1Ts);
    }
    return 0;
  });
}

function starGainSort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => {
    const playerA1Star = parseInt(playerA[1].completion_day_level[day]?.["1"]?.star_gain);
    const playerA2Star = parseInt(playerA[1].completion_day_level[day]?.["2"]?.star_gain);
    const playerAStarGain = playerA1Star + playerA2Star;
    const playerB1Star = parseInt(playerB[1].completion_day_level[day]?.["1"]?.star_gain);
    const playerB2Star = parseInt(playerB[1].completion_day_level[day]?.["2"]?.star_gain);
    const playerBStarGain = playerB1Star + playerB2Star;
    return playerBStarGain - playerAStarGain;
  });
}

function firstStarSort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => {
    const playerA1Ts = getNthStarTs(playerA[1], 1, day);
    const playerB1Ts = getNthStarTs(playerB[1], 1, day);
    if (playerA1Ts && playerB1Ts) {
      return (playerA1Ts) - (playerB1Ts);
    } else if (playerA1Ts && !playerB1Ts) {
      return (playerA1Ts) - Number.MAX_SAFE_INTEGER;
    } else if (!playerA1Ts && playerB1Ts) {
      return Number.MAX_SAFE_INTEGER - (playerB1Ts - playerB1Ts);
    }
    return 0;
  });
}

function insertStarGainsForDay(day: string, playerList: any[]) {
  let firstStarSortedList = firstStarSort(day, playerList);
  let secondStarSortedList = bothStarsSort(day, playerList);
  firstStarSortedList.forEach((player, idx, players) => {
    let dayCompletion = player[1].completion_day_level[day]?.["1"];
    if (dayCompletion) {
      dayCompletion.star_gain = players.length-idx;
    } else {
      player[1].completion_day_level[day] = {
        '1': {
          star_gain: 0,
        },
      }
    }
  });
  secondStarSortedList.forEach((player, idx, players) => {
    let dayCompletion = player[1].completion_day_level[day]?.["2"];
    if (dayCompletion) {
      dayCompletion.star_gain = players.length-idx;
    } else {
      player[1].completion_day_level[day] = {
        ...player[1].completion_day_level[day],
        '2': {
          star_gain: 0,
        },
      }
    }
  });
}

function renderUnixTimestamp(ts: number, day: string): string {
  if (ts === undefined) {
    return '';
  }
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date0Ms = new Date(2022, 11, parseInt(day), 6, 0, 0, 0).getTime();
  const finishTime = new Date(ts * 1000).getTime();
  const diff = finishTime - date0Ms;

  const playerHours = Math.floor(diff/hourInMs);
  const playerMinutes = Math.floor((diff%hourInMs)/minuteInMs);
  const playerSeconds = Math.floor((diff%minuteInMs)/secondInMs);
  // Will display time in 10:30:23 format
  var formattedTime = playerHours + ':' + playerMinutes.toString().padStart(2, "0")+ ':' + playerSeconds.toString().padStart(2, "0");
  return formattedTime
}

function renderPlayerTime(player: any, selectedDay: string, highscoreType: HighscoreType) {
  if (highscoreType === HighscoreType.BothStars || highscoreType === HighscoreType.FirstStar) {
    return `${renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["1"]?.get_star_ts as number, selectedDay)} / ${renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["2"]?.get_star_ts as number, selectedDay)}`
  } else if (highscoreType === HighscoreType.Delta) {
    return renderPlayerDeltaTimestamp(player, selectedDay);
  } else if (highscoreType === HighscoreType.StarGain) {
    let star1Gain = player.completion_day_level?.[selectedDay]?.["1"]?.star_gain;
    let star2Gain = player.completion_day_level?.[selectedDay]?.["2"]?.star_gain;
    return <><span className="privboard-star-firstonly">{star1Gain}</span>{' / '}<span className="privboard-star-both">{star2Gain}</span>{' -> '}<span className="privboard-star-both">{(star1Gain??0)+(star2Gain??0)}</span></>;
  }
}

function renderPlayerDeltaTimestamp(player: any, selectedDay: string) {
  const firstStarTime = player.completion_day_level?.[selectedDay]?.["1"]?.get_star_ts;
  const secondStarTime = player.completion_day_level?.[selectedDay]?.["2"]?.get_star_ts;
  if (secondStarTime === undefined) {
    return '';
  }
  const deltaStarTime = secondStarTime - firstStarTime;
  const playerHours = Math.floor(deltaStarTime/hourInS);
  const playerMinutes = Math.floor((deltaStarTime%hourInS)/minuteInS);
  const playerSeconds = Math.floor((deltaStarTime%minuteInS));
  var formattedDelta = playerHours + ':' + playerMinutes.toString().padStart(2, "0")+ ':' + playerSeconds.toString().padStart(2, "0");
  return formattedDelta;
}

function getPlacementClass(idx: number) {
  switch(idx) {
    case 0:
      return 'privboard-star-both';
    case 1:
      return 'privboard-star-firstonly';
    case 2:
      return 'privboard-third';
    default:
      return '';
  }
}

function renderPlayer(player: any, selectedDay: string, idx: number, highscoreType: HighscoreType) {
  return (
    <div className="privboard-row">
      <span className="privboard-position">{idx+1})</span> {renderPlayerTime(player, selectedDay, highscoreType)} <span className={`privboard-name ${getPlacementClass(idx)} ${player.name === null ? 'leaderboard-anon' : ''}`}>{player.name ?? `(anonymous user #${player.id})`}</span></div>
  )
}

export default App;
