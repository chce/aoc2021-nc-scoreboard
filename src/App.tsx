import React, { useState } from 'react';
import scores from './scores.json';
import './App.css';

let days = new Array(25).fill(false);
const numEnabledDays = 1;
days = days.map((_, idx) => idx+1 > numEnabledDays ? false : true)
const playerList = Object.entries(scores.members);
sortForDay("1");
function App() {
 
  const [selectedDay, setSelectedDay] = useState<string>("1");
  return (
    <div className="App">
      <header className="App-header">
        <div className="privboard-row">
          <span className="privboard-days">
            {days.map((day, idx) => {
              return day ? <a href="" onClick={() => {
                setSelectedDay(""+idx+1);
                sortForDay(""+idx+1);
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

function sortForDay(day: string) {
  playerList.sort((playerA, playerB) => ((playerA[1].completion_day_level as any)[day]?.["2"]?.get_star_ts ?? Number.MAX_SAFE_INTEGER) - ((playerB[1].completion_day_level as any)[day]?.["2"]?.get_star_ts ?? Number.MAX_SAFE_INTEGER))  
}
function renderUnixTimestamp(ts: number): string {
  if (ts === undefined) {
    return '';
  }
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(ts * 1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return formattedTime
}

function renderPlayer(player: any, selectedDay: string, idx: number) {
  console.log(player);
  return (
    <div className="privboard-row">
      <span className="privboard-position">{idx+1})</span> {renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["1"]?.get_star_ts as number)} / {renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["2"]?.get_star_ts as number)} <span className="privboard-name">{player.name}</span></div>
  )
}

export default App;
