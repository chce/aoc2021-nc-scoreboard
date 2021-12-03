import React, { useState } from 'react';
import scores from './scores.json';
import './App.css';

let days = new Array(25).fill(false);
const numEnabledDays = 3;
days = days.map((_, idx) => idx+1 > numEnabledDays ? false : true)
const playerList = Object.entries(scores.members);
sortForDay(""+numEnabledDays);
function App() {
 
  const [selectedDay, setSelectedDay] = useState<string>(""+numEnabledDays);
  return (
    <div className="App">
      <header className="App-header">
        <div className="privboard-row">
          <span className="privboard-days">
            {days.map((day, idx) => {
              return day ? <a href="" onClick={(ev) => {
                ev.preventDefault()
                ev.stopPropagation();
                setSelectedDay(""+(idx+1));
                sortForDay(""+(idx+1));
              }}>{idx+1}</a> : <span>{(idx+1).toString().split('').map((dayNumber, dayNumberIdx) => <>{dayNumberIdx > 0 ? <br/> : <></>}{dayNumber}</>)}</span>
            })}
            

          </span>
        </div>
      </header>
      <section>
        {playerList.map((player, idx) => {
          return renderPlayer(player[1], selectedDay, idx);
        })}
        
      </section>
    </div>
  );
}
function getNthStarTs(player: any, n: number, day: string) {
  return player.completion_day_level[day]?.[""+n]?.get_star_ts;
}
function sortForDay(day: string) {
  playerList.sort((playerA, playerB) => {
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
  }) 
}
function renderUnixTimestamp(ts: number, day: string): string {
  if (ts === undefined) {
    return '';
  }
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date0Ms = new Date(2021, 11, parseInt(day), 6, 0, 0, 0).getTime();
  const finishTime = new Date(ts * 1000).getTime();
  const diff = finishTime - date0Ms;
  const hourInMs = 1000*60*60;
  const minuteInMs = 1000*60;
  const secondInMs = 1000;
  const playerHours = Math.floor(diff/hourInMs);
  const playerMinutes = Math.floor((diff%hourInMs)/minuteInMs);
  const playerSeconds = Math.floor((diff%minuteInMs)/secondInMs);
  // Will display time in 10:30:23 format
  var formattedTime = playerHours + ':' + playerMinutes.toString().padStart(2, "0")+ ':' + playerSeconds.toString().padStart(2, "0");
  return formattedTime
}

function renderPlayer(player: any, selectedDay: string, idx: number) {
  console.log(player);
  console.log(selectedDay);
  return (
    <div className="privboard-row">
      <span className="privboard-position">{idx+1})</span> {renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["1"]?.get_star_ts as number, selectedDay)} / {renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["2"]?.get_star_ts as number, selectedDay)} <span className="privboard-name">{player.name}</span></div>
  )
}

export default App;
