let mic;
let amp;
let fft;
let count = 0;
let volHigh = false;
let start = false;
let calibrateStart = false;
let pressCount = 0;
let beepBand = [];
let startTime = 0;
let previousCount = [];
let highVol;
let average;
let volSumHighTemp = 0;
let extraCount = 0;
let countCorrect = 0;
let extraCountFactor = 36;

function setup(){
  frameRate(120);
  let cnv = createCanvas(500, 500);
  cnv.mousePressed(userStartAudio);
  
  background(0);
  fill(255);
  textSize(15);
  textFont('Georgia')
  text("Click anywhere to begin calibration.", 20, 40);
  text("After 5-10 beeps, press click anywhere again to begin counter.", 20 , 70);
  //text("If no headphone available, press any key.")
  if(keyIsPressed) {
    extraCountFactor = 25;
  }
  mic = new p5.AudioIn();
  mic.start();
  
  amp = new p5.Amplitude();
  amp.setInput(mic);
  
  fft = new p5.FFT();
  fft.setInput(mic);
}


function draw(){
  
  let vol = amp.getLevel();
  let spectrum = fft.analyze();
  
  if(calibrateStart == true) {
    stroke(0, 255, 0);
    background(0);
    text("Calibration begun", 20, 120);
    for(let i = 0; i < spectrum.length; i+=1){
      //print(spectrumCalibrate[i]*height/500);
      if (spectrum[i]*height/500 > 100  && i > 100 && i < 200) {     
         beepBand.push(i);
         print(beepBand);
         stroke(0,0, 255);
         text("Sound detected", 20, 150);
      }
      
    }
  }
  
  if(start == true) {
    
    let m = millis()-startTime;
    background(0);
    
    text("Time Elapsed: " + Math.round(m/1000) + " s", 360, 20)
    text("Count: " + count, 20, 20);
    
    let previousCount = count;
    let spectrumImportant = subset(spectrum,average-1, 2);
    let volSum = 0;
    for(let k = 0; k < spectrumImportant.length; k++) {
      volSum += spectrumImportant[k];
    }
    
    let beepBandTempFreq = [];
    for(let j = average-10; j < average + 10; j+=1){
      if (spectrum[j]*height/500 > 100) {
         beepBandTempFreq.push(j);
      }
    }
    
    //print(volSum);
    if(max(beepBandTempFreq) > average - 5 && max(beepBandTempFreq) <
         average + 5 && volSum > 80) {
      volHigh = true;
      //println(volHigh);
      volSumHighTemp = volSum;
      extraCount+=1;
    }
    
    
    if(volHigh == true && volSum < volSumHighTemp) {
      volHigh = false;
      background(0);
      print(extraCount);
      //print(volHigh);
      count = count + 1 + (Math.round(extraCount/extraCountFactor))
      // if(extraCount == 11) {
      //   count-=1;
      // }
      stroke(255);
      text("Count: " + count, 20, 20);
      volSumHighTemp = volSum;
      extraCount = 0;
      // if(max(beepBandTempFreq) > average - 5 && max(beepBandTempFreq) <
      //    average + 5 && volSum > 80) {
      //   volHigh = true;
      //   //println(volHigh);
      //   volSumHighTemp = volSum;
      //   extraCount+=1;
      // }
    } 
    
    if(m > 120000) {
      background(0);
      stroke(255);
      count -= Math.floor(countCorrect);
      text("Final count: " + count, 20, 50);
      text("Refresh page to start another counter.", 20, 80)
      start = false;
    }
  }
}
function mouseReleased(){
  pressCount += 1;
  if(pressCount == 1) {
    calibrateStart = true;
  } else if (pressCount == 2) {
    average = modeAverage(beepBand);
    startTime = millis();
    calibrateStart = false;
    start = true;
  } 
}

function modeAverage(arr) {
  
  let maxFrequency = 0;
  let modeFound = false;
  let modeSet = new Set();
  arr.sort();
  for (let i=0; i<arr.length; i++) {
      let number = arr[i];
      let count = 1;
      for (; (i+count)<arr.length && arr[i+count]==number; count++) {}
      i+=(count-1);
      if (maxFrequency!=0 && count!=maxFrequency) {
          modeFound = true;
      }
      if (count > maxFrequency) {
          modeSet.clear();
          modeSet.add (number);
          maxFrequency = count;
      }
      else if (count == maxFrequency) {
          modeSet.add(number);
      }
      //println(modeSet);
  }
  //if (!modeFound) {
  //    modeSet.clear();
  //}
  //println(modeSet);
  let total = 0;
  for (let element of modeSet) {
    total+=element;
  }
  
  if (total > 0) {
    stroke(255)
    text("Calibration successful. Counting begun.", 20, 180);
    return total/modeSet.size;
  } else {
    stroke(255, 0 , 0);
    text("Calibration unsuccessful. Counting using default value.", 20, 134);
  }
  return 135;
  //print (total/modeSet.size()/10);
}