/* ==========================================================================
   SIMPLE MODERN STOPWATCH CONTROLLER
   ========================================================================== */

// 1. Get DOM Elements
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');

const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');
const btnLap = document.getElementById('btn-lap');

const lapsSection = document.getElementById('laps-section');
const lapsTbody = document.getElementById('laps-tbody');

// 2. Stopwatch State Variables
let timerInterval = null;  // Stores our setInterval ID
let startTime = 0;         // Timestamp when timer started
let elapsedTime = 0;       // Total running time in milliseconds
let laps = [];             // Array to store lap records
let isRunning = false;     // Track if timer is active

// 3. Helper: Pad numbers with leading zeros (e.g. 5 -> '05')
function padZero(value) {
  return value < 10 ? '0' + value : value;
}

// 4. Helper: Format milliseconds into a readable stopwatch string
function formatTime(totalMs) {
  let ms = Math.floor((totalMs % 1000) / 10); // Calculate centiseconds (0-99)
  let s = Math.floor((totalMs % 60000) / 1000);
  let m = Math.floor((totalMs % 3600000) / 60000);
  let h = Math.floor(totalMs / 3600000);

  let hoursStr = padZero(h);
  let minutesStr = padZero(m);
  let secondsStr = padZero(s);
  let msStr = padZero(ms);

  // If there are hours, return HH:MM:SS.CS, otherwise return MM:SS.CS
  if (h > 0) {
    return `${hoursStr}:${minutesStr}:${secondsStr}.${msStr}`;
  }
  return `${minutesStr}:${secondsStr}.${msStr}`;
}

// 5. Timer Update Loop
function updateTime() {
  // Calculate precise elapsed time by comparing active clock to start time
  elapsedTime = Date.now() - startTime;

  // Extract separate parts for display
  let ms = Math.floor((elapsedTime % 1000) / 10);
  let s = Math.floor((elapsedTime % 60000) / 1000);
  let m = Math.floor((elapsedTime % 3600000) / 60000);
  let h = Math.floor(elapsedTime / 3600000);

  // Update DOM digits on the screen
  hoursEl.textContent = padZero(h);
  minutesEl.textContent = padZero(m);
  secondsEl.textContent = padZero(s);
  millisecondsEl.textContent = padZero(ms);
}

// 6. Action: Toggle Start / Pause
function toggleTimer() {
  if (!isRunning) {
    // START ACTIONS
    isRunning = true;
    
    // Set start reference (compensates for elapsed if previously paused)
    startTime = Date.now() - elapsedTime;
    
    // Fire timing loop every 10 milliseconds
    timerInterval = setInterval(updateTime, 10);

    // Adjust button styles & text
    btnStart.textContent = 'Pause';
    btnStart.className = 'btn btn-pause'; // Swap blue class for warning red class
    
    // Enable Lap and Reset buttons
    btnLap.disabled = false;
    btnReset.disabled = false;
  } else {
    // PAUSE ACTIONS
    isRunning = false;
    
    // Stop the active timing interval loop
    clearInterval(timerInterval);
    timerInterval = null;

    // Adjust button styles & text
    btnStart.textContent = 'Resume';
    btnStart.className = 'btn btn-start'; // Swap red class back to royal blue class
  }
}

// 7. Action: Record Split Lap Time
function recordLap() {
  if (elapsedTime === 0) return;

  const currentSplit = elapsedTime;
  let lapDuration = currentSplit;

  // Calculate current lap duration relative to previous split time
  if (laps.length > 0) {
    const previousSplit = laps[laps.length - 1].splitTime;
    lapDuration = currentSplit - previousSplit;
  }

  const lapNumber = laps.length + 1;
  const newLap = {
    number: lapNumber,
    duration: lapDuration,
    splitTime: currentSplit
  };

  laps.push(newLap);

  // Render the recorded lap onto the laps table
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>Lap ${newLap.number}</td>
    <td>${formatTime(newLap.duration)}</td>
    <td>${formatTime(newLap.splitTime)}</td>
  `;

  // Prepend lap row to display the newest laps at the top
  lapsTbody.insertBefore(tr, lapsTbody.firstChild);

  // Show laps table block
  lapsSection.classList.remove('hidden');
}

// 8. Action: Reset Stopwatch state
function resetTimer() {
  // Stop interval loops
  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;

  // Reset core metrics
  elapsedTime = 0;
  laps = [];

  // Reset text display digits
  hoursEl.textContent = '00';
  minutesEl.textContent = '00';
  secondsEl.textContent = '00';
  millisecondsEl.textContent = '00';

  // Restore toggle start button state
  btnStart.textContent = 'Start';
  btnStart.className = 'btn btn-start';

  // Disable control buttons initially
  btnLap.disabled = true;
  btnReset.disabled = true;

  // Clear and hide recorded laps table
  lapsTbody.innerHTML = '';
  lapsSection.classList.add('hidden');
}

// 9. Attach Button Event Listeners
btnStart.addEventListener('click', toggleTimer);
btnReset.addEventListener('click', resetTimer);
btnLap.addEventListener('click', recordLap);
