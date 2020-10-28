var acc_x = new TimeSeries();
var acc_y = new TimeSeries();
var acc_z = new TimeSeries();

var ble_rss = new TimeSeries();

var gyro_x = new TimeSeries();
var gyro_y = new TimeSeries();
var gyro_z = new TimeSeries();

var ahrs_heading = 0;
var ahrs_pitch = 0;
var ahrs_roll = 0;

var microphone_data = new TimeSeries();

var isConnected = false;
var eSenseID = "";

var recordData = false;
var headingHist = [];
var pitchHist = [];
var rollHist = [];
var headingWindow = [];
var pitchWindow = [];
var rollWindow = [];
var windowSize = 10;
var arraySize = 200;
const average = arr => arr.reduce((sume, el) => sume + el, 0) / arr.length;
var headingAvg = average(headingHist);
var pitchAvg = average(pitchHist);
var rollAvg = average(rollHist);
// Thresholds for angle changes (set arbitrarily)
var rollThresh = 0.75; //twist
var headingThresh = 0.55; //nod
var pitchThresh = 0.45; //tilt

$(document).ready(function () {


  /*setup the socket */

  var socket = io('http://localhost:5000');

  socket.on('connect', function () {
    logger.log("WebSocket connection is established.");
  });

  socket.on('disconnect', function () {
    logger.log("WebSocket Connection is terminated.");
  });

  /* Receive data and updates from server */
  socket.on('acc', function (data) {
    var time = new Date().getTime()
    acc_x.append(time, data.x);
    acc_y.append(time, data.y);
    acc_z.append(time, data.z);

    logger.log(data.x + " " + data.y + " " + data.z);
  });

  socket.on('gyro', function (data) {
    var time = new Date().getTime()
    gyro_x.append(time, data.x);
    gyro_y.append(time, data.y);
    gyro_z.append(time, data.z);
  });
  var prevTime = new Date().getTime()
  socket.on('ahrs', function (data) {
    var time = new Date().getTime()
    // console.log(time-prevTime);
    
    
    ahrs_heading = data.heading;
    ahrs_pitch = data.pitch;
    ahrs_roll = data.roll;
    if (time-prevTime > 1200 || headingHist.length == 0) {
        setBaseline(ahrs_heading, ahrs_pitch, ahrs_roll);
    }
    prevTime = time;
    detectGesture();
  });
  function setBaseline(heading, pitch, roll) {
      console.log("SETTING BASELINE");
      headingHist = [];
      pitchHist = [];
      rollHist = [];
    //   avgWeight = 0.25;
    //   if (headingAvg != 0) {
    //       heading = heading*(1-avgWeight) + headingAvg*avgWeight;
    //       pitch = pitch*(1-avgWeight) + pitchAvg*avgWeight;
    //       roll = roll*(1-avgWeight) + rollAvg*avgWeight;
    //   }
      for (var i = 0; i < arraySize; i++) {
          headingHist.push(heading);
          pitchHist.push(pitch);
          rollHist.push(roll);
      }
  }
  function detectGesture() {
    //Sampling rate is 10Hz, so roughly 1 sample every 100ms (if earbud is moving)
    //Window size is 10, so roughly 1 second of data
    if (headingHist.length > arraySize) {
        headingHist.shift();
        pitchHist.shift();
        rollHist.shift(); 
     } 
     headingHist.push(ahrs_heading);
     pitchHist.push(ahrs_pitch);
     rollHist.push(ahrs_roll);
    //  headingWindow = headingHist.slice(headingHist.length-windowSize, headingHist.length);
    //  pitchWindow = pitchHist.slice(pitchHist.length-windowSize, pitchHist.length);
    //  rollWindow = rollHist.slice(rollHist.length-windowSize, rollHist.length);
     headingAvg = average(headingHist);
     pitchAvg = average(pitchHist);
     rollAvg = average(rollHist);
     // Find max and min of each list
    //  maxRoll = Math.max.apply(Math, rollWindow);
    //  minRoll = Math.min.apply(Math, rollWindow);
    //  maxPitch = Math.max.apply(Math, pitchWindow);
    //  minPitch = Math.min.apply(Math, pitchWindow);
    //  maxHeading = Math.max.apply(Math, headingWindow);
    //  minHeading = Math.min.apply(Math, headingWindow);
    if (ahrs_pitch - pitchAvg > pitchThresh) { // check for tilt
        handleEvent("LEFT TILT");
    } else if (pitchAvg - ahrs_pitch > pitchThresh) { // check for tilt
        handleEvent("RIGHT TILT");
    } else if (ahrs_heading - headingAvg > headingThresh) {
        handleEvent("DOWN NOD");
    } else if (headingAvg - ahrs_heading > headingThresh) {
        handleEvent("UP NOD");
    } else if (ahrs_roll - rollAvg > rollThresh) { //check for roll - else if bc tilts would often fire both a tilt and a nod event
        handleEvent("RIGHT ROLL");
    } else if (rollAvg - ahrs_roll > rollThresh) {
        handleEvent("LEFT ROLL");
    } 
    //  if (maxPitch - minPitch > pitchThresh) { // check for tilt
    //      if (Math.abs(maxPitch) > Math.abs(minPitch)) { // determine which direction tilt is
    //         handleEvent("LEFT TILT") 
    //      } else {
    //          handleEvent("RIGHT TILT")
    //      }
    //      // Resetting arrays to avoid detecting same event multiple times - there must be a better way than this
    //     //  pitchHist = [] 
    //     //  headingHist = []
    //     //  rollHist = []
    //  } else if (maxHeading - minHeading > headingThresh) { //check for nod - else if bc tilts would often fire both a tilt and a nod event
    //      if (Math.abs(maxHeading) > Math.abs(minHeading)) {
    //          handleEvent("DOWN NOD")
    //      } else {
    //          handleEvent("UP NOD")
    //      }
    //     //  headingHist = []
    //     //  pitchHist = []
    //     //  rollHist = []
    //  } else if (maxRoll - minRoll > rollThresh) { //check for roll - else if bc tilts would often fire both a tilt and a nod event
    //     if (Math.abs(maxRoll) > Math.abs(minRoll)) {
    //         handleEvent("RIGHT ROLL")
    //     } else {
    //         handleEvent("LEFT ROLL")
    //     }
    //     // headingHist = []
    //     // pitchHist = []
    //     // rollHist = []
    // } 
     
     
  }
  //keep large buffer and average it to get baseline angle?
  var lastEventTime = new Date().getTime();
  function handleEvent(eventType) {
    var currTime = new Date().getTime();
    if (currTime - lastEventTime < 1200) {
        return;
    }
    lastEventTime = currTime;
    console.log(eventType);
    if (eventType == "RIGHT TILT") {
        $("#next").click();
    } else if (eventType == "LEFT TILT") {
        $("#previous").click();
    } else if (eventType == "UP NOD") {
        $("#vol-up").click();
    } else if (eventType == "DOWN NOD") {
        $("#vol-down").click();
    } else if (eventType == "RIGHT ROLL") {
        $("#play-pause").click();
    } else if (eventType == "LEFT ROLL") {
        $("#play-pause").click();
    }
  }

  // Custom

  $('#save-button').click(function() {
    // $('#save-button').html(!recordData ? "Stop" : "Save");
    // recordData = !recordData;

    if (!recordData) {
      recordData = true;

      // should record data
      $('#save-button').html("Stop");
      socket.emit('save-data', {gestureName: $('#gesture-name-input').val()});
    } else {
      recordData = false;

      // should stop recording data
      $('#save-button').html("Save");
      socket.emit('stop-save-data');
    }
  });

  // End Custom

  socket.on('microphone', function (data) {
    var time = new Date().getTime()
    for (var i in data.x) {
      microphone_data.append(time, data.x[i]);
    }
  });

  socket.on('rssi', function (data) {
    ble_rss.append(new Date().getTime(), data);
  });

  socket.on('status', function (data) {
    logger.log(data.message);
  });

  socket.on('eSense-connect', function (data) {
    isConnected = data.isConnected;

    if (!isConnected) {
      $("#connet-btn").html('Connect');
      $("#connet-btn").attr("disabled", false);
      resetButtons();
      eSenseID = "";
    } else {
      $("#connet-btn").html('Disconnect');
      $("#connet-btn").attr("disabled", false);
    }
  });

  socket.on('calibration', function (data) {
    $("#imu-switch").attr("disabled", false);
    $("#calibrate-btn").attr("disabled", false);
    $("#imu-config-btn").attr("disabled", false);
  });

  socket.on('characteristic', function (data) {
    if (data.target == "ble")
      disableBLEButton(false);
    else if (data.target == "motion") {
      disableMotionButtons(false);
      $("#imu-switch").attr("disabled", false);
    }
  });


  /* setup the charts */
  setupAccelChart();
  setupBLEChart();
  setupGyroChart();
  setupMicrophoneChart();

  function disableMotionButtons(disabled) {
    $("#calibrate-btn").attr("disabled", disabled);
    $("#imu-config-btn").attr("disabled", disabled);
  }

  function disableMicButton(disabled) {
    $("#mic-config-btn").attr("disabled", disabled);
  }

  function disableBLEButton(disabled) {
    $("#ble-config-btn").attr("disabled", disabled);
  }

  /* event handlers */

  //connect button
  $("#connet-btn").click(function () {
    eSenseID = $("#eSense-id").val();

    if (eSenseID == "") {
      alert('eSense ID missing! Please enter the id and try again.');
    } else if ($("#connet-btn").html() == "Scanning...") {
      // If the user clicks during a scan we stop it
      $("#connet-btn").html('Connect');
      socket.emit("console", { target: "disconnect" });
    } else {
      if (!isConnected) {
        socket.emit("console", { target: "connect", name: eSenseID });
        $("#connet-btn").html('Scanning...');
      } else {
        socket.emit("console", { target: "disconnect" });
        $("#connet-btn").attr("disabled", true);
      }
    }
  });

  //calibrate button
  $("#calibrate-btn").click(function () {
    if (eSenseID == "" || !isConnected) {
      alert('Please conntect to the earable first and try again.');
    } else {
      $("#imu-switch").attr("disabled", true);
      $("#calibrate-btn").attr("disabled", true);
      $("#imu-config-btn").attr("disabled", true);
      socket.emit("console", { action: "on", target: "calibration" });
    }
  });

  /*manual switch event*/

  $('#imu-switch').change(function () {
    if ($(this).prop('checked')) {
      var samplingRate = Number($("select#imu-sampling-rate option").filter(":selected").val());
      socket.emit("console", { action: "on", target: "motion", sampling: samplingRate });
      disableMotionButtons(true);
      logger.log("Turning on motion sensor at " + samplingRate + "Hz.");
    } else {
      socket.emit("console", { action: "off", target: "motion" });
      disableMotionButtons(false);
      logger.log("Turning off motion sensor.");
    }
  });

  $('#mic-switch').change(function () {
    if ($(this).prop('checked')) {
      socket.emit("console", { action: "on", target: "mic" });
      disableMicButton(true);
    } else {
      socket.emit("console", { action: "off", target: "mic" });
      disableMicButton(false);
      logger.log("Turning off microphone sampling.");
    }
  });

  $('#ble-switch').change(function () {
    if ($(this).prop('checked')) {
      socket.emit("console", { action: "on", target: "ble" });
      disableBLEButton(true);
      logger.log("Turning on BLE Scan.");
    } else {
      socket.emit("console", { action: "off", target: "ble" });
      disableBLEButton(false);
      logger.log("Turning off BLE Scan.");
    }

  });


  /*imu configuration*/

  $("#imu-config-btn").click(function () {

    disableMotionButtons(true);
    $("#imu-switch").attr("disabled", true);

    var accelRange = Number($("select#imu-acc-range option").filter(":selected").val());
    var gyroRange = Number($("select#imu-gyro-range option").filter(":selected").val());
    var accelLPF = Number($("select#imu-acc-lpf option").filter(":selected").val());
    var gyroLPF = Number($("select#imu-gyro-lpf option").filter(":selected").val());

    socket.emit("console", { action: "update", target: "motion", values: [accelRange, gyroRange, accelLPF, gyroLPF] });
  });


  /*micconfiguration*/

  $("#mic-config-btn").click(function () {
    var micSampling = Number($("select#mic-sampling-rate option").filter(":selected").val());
    socket.emit("console", { action: "update", target: "mic", sampling: micSampling });
  });

  /*ble configuration*/
  $("#ble-config-btn").click(function () {

    disableBLEButton(true);

    var advIntMin = Number($("select#ble-adv-int-min option").filter(":selected").val());
    var advIntMax = Number($("select#ble-adv-int-max option").filter(":selected").val());
    var connIntMin = Number($("select#ble-conn-int-min option").filter(":selected").val());
    var connIntMax = Number($("select#ble-conn-int-max option").filter(":selected").val());

    if (advIntMin > advIntMax) {
      alert("Advertisement interval not correct: Min interval > Max interval");
      return;
    }

    if (connIntMin > connIntMax) {
      alert("Connection interval not correct: Min interval > Max interval");
      return;
    } else if ((connIntMax - connIntMin) < 20) {
      alert("Connection interval not correct: (Min interval - Max interval) < 20ms");
      return;
    }

    logger.log("Updating BLE configuration with Advertisement Interval Min: " + advIntMin +
      " ms, Max: " + advIntMax +
      " ms, Connection Interval Min: " + connIntMin +
      " ms, Max: " + connIntMax + " ms");

    socket.emit("console", { action: "update", target: "ble", values: [advIntMin, advIntMax, connIntMin, connIntMax] });
  });


  /* clearing cosole */

  $("#clear-btn").click(function () {
    logger.log("clear");
  });

});


var setupAccelChart = function () {

  var accel_chart = new SmoothieChart({
    grid: {
      strokeStyle: 'rgba(255,255,255,0.1)', fillStyle: 'rgb(13,21,27)',
      lineWidth: 1, millisPerLine: 1000, verticalSections: 6,
    },
    labels: { fillStyle: 'rgb(255,255,255)' }
  });

  accel_chart.streamTo(document.getElementById("acc-data"), 1000);

  accel_chart.addTimeSeries(acc_x,
    { strokeStyle: 'rgb(76,33,132)', lineWidth: 1 });
  accel_chart.addTimeSeries(acc_y,
    { strokeStyle: 'rgb(194,74,92)', lineWidth: 1 });
  accel_chart.addTimeSeries(acc_z,
    { strokeStyle: 'rgb(113,200,68)', lineWidth: 1 });

}

var setupBLEChart = function () {

  var ble_chart = new SmoothieChart({
    grid: {
      strokeStyle: 'rgba(255,255,255,0.1)', fillStyle: 'rgb(13,21,27)',
      lineWidth: 1, millisPerLine: 1000, verticalSections: 6,
    },
    labels: { fillStyle: 'rgb(255,255,255)' }
  });


  ble_chart.streamTo(document.getElementById("ble-data"), 1000);

  ble_chart.addTimeSeries(ble_rss,
    { strokeStyle: 'rgb(194,74,92)', fillStyle: 'rgba(194,74,92, 0.3)', lineWidth: 1 });
}

var setupGyroChart = function () {
  var gyro_chart = new SmoothieChart({
    grid: {
      strokeStyle: 'rgba(255,255,255,0.1)', fillStyle: 'rgb(13,21,27)',
      lineWidth: 1, millisPerLine: 1000, verticalSections: 6,
    },
    labels: { fillStyle: 'rgb(255,255,255)' }
  });

  gyro_chart.streamTo(document.getElementById("gyro-data"), 1000);

  gyro_chart.addTimeSeries(gyro_x,
    { strokeStyle: 'rgb(76,33,132)', lineWidth: 1 });
  gyro_chart.addTimeSeries(gyro_y,
    { strokeStyle: 'rgb(194,74,92)', lineWidth: 1 });
  gyro_chart.addTimeSeries(gyro_z,
    { strokeStyle: 'rgb(113,200,68)', lineWidth: 1 });
}

var setupMicrophoneChart = function () {

  var mic_chart = new SmoothieChart({
    grid: {
      strokeStyle: 'rgba(255,255,255,0.1)', fillStyle: 'rgb(13,21,27)',
      lineWidth: 1, millisPerLine: 1000, verticalSections: 6,
    },
    labels: { fillStyle: 'rgb(255,255,255)' }
  });


  mic_chart.streamTo(document.getElementById("microphone-data"), 1000);


  mic_chart.addTimeSeries(microphone_data,
    { strokeStyle: 'rgb(76,33,132)', fillStyle: 'rgba(76,33,132, 0.3)', lineWidth: 1 });

}

var resetButtons = function () {
  $('#imu-switch').bootstrapToggle('off');
  $('#ble-switch').bootstrapToggle('off');
  $('#mic-switch').bootstrapToggle('off');
}

var logger = new function () {

  this.log = function (msg) {
    var pane = $("#console-pane")[0];

    var isScrolledToBottom = pane.scrollHeight - pane.clientHeight <= pane.scrollTop + 1;
    if (msg == "clear") {
      $("#console-pane").empty()

    } else {
      var newElement = document.createElement("div");
      newElement.innerHTML = "<font color=#76B41C>[" + getDateTime() + "] : </font>" + msg;
      pane.insertBefore(newElement, pane.firstChild);
    }
    if (isScrolledToBottom)
      pane.scrollTop = pane.scrollHeight - pane.clientHeight;

  };
}

var getDateTime = function () {
  var currentdate = new Date();
  var date = currentdate.getDate() + "-"
    + (currentdate.getMonth() + 1) + "-"
    + currentdate.getFullYear() + "  ";

  var hours = + currentdate.getHours();
  var minutes = + currentdate.getMinutes();
  var seconds = + currentdate.getSeconds();

  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }

  return date + hours + ':' + minutes + ':' + seconds;;
}
