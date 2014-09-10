// -----------------------------------------------------------------------------
// Refugee Lib - WIP
// engine (main loop(input,logic,presentation) control)
// 
// The MIT License (MIT)
// 
// Copyright(c) 2014, Dennis Busch 
// http://www.dennisbusch.de
//  
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// -----------------------------------------------------------------------------

rlEngine = function(containerId, name, debug, width, height, useOwnTimer) 
{
  // inherit all of rlObject
  rlObject.call(this);
  this.__proto__.rlType = "rlEngine";
  
  var name = name || ("unnamedEngine_"+getTimestamp().toString());
  
  // main update loop control
  var useOwnTimer = typeof useOwnTimer == "undefined" || useOwnTimer; // using own timer as default if not defined
  var LogicTimer = null;
  var myself = this; // needed for calling callback functions 
  var LUPSTarget = 64.0; // desired number of game/application logic updates per second
  var farOff = 0.33; // (*100) = %  
  var offTolerance = 3; // in frames
  var d = 0;
  var MSPerLU = 1000.0 / LUPSTarget;
  var LUPS = 0.0; // last measured number of logic updates per second
  var LUPSCounting = 0.0; // lups while still counting
  var LastLUPSMeasureTime = 0.0;
  var FPS = 0.0; // last measured number of rendered frames per second
  var FPSCounting = 0.0; // fps while still counting
  var LastFPSMeasureTime = 0.0;
  var Paused = true;
  var Debug = debug || false;
  var CurrentUpdateRequestId = 0; // last requested id for the next browser animation frame
  var VUTick = 0;
  var LUTick = 0;
  var renderSingleFrame = false;
  
  // parameters for the main canvas and overlay canvas
  var Width  = width || 400;
  var Height = height || 225;
  var MainCanvasId = name + "CanvasMain";
  var OverlayCanvasId = name + "CanvasOverlay";
  var CanvasContainer = null;
          
  var canvasMain = null; // will hold main canvas
  var canvasOverlay = null; // will hold overlay canvas
  var GL = null; // will hold webgl drawing context for main canvas
  var G2D = null; // will hold 2D drawing context for overlay canvas
  
  var debugMsg = function(toLog)
  {
    if(Debug)
      console.log(name+": "+toLog);
  };
     
  var toggleDebug = function()
  {
    Debug = !Debug;
  };
  this.toggleDebug = toggleDebug;
           
  var forceAdjustMSPerLU = function(newMSPerLU)
  {            
    MSPerLU = newMSPerLU;
    if(LogicTimer)
      LogicTimer.postMessage(MSPerLU);
  };
  
  var togglePause = function()
  {
    Paused = !Paused;
    
    if(Paused) // pausing now
    {
      if(CurrentUpdateRequestId)
        window.cancelAnimationFrame(CurrentUpdateRequestId);
        
      CurrentUpdateRequestId = 0;
 
      if(LogicTimer && useOwnTimer)
        LogicTimer.postMessage("stop");
      
      // draw one last time to reflect last known state
      forceUpdateViews();
    }
    else // resuming now
    {
      LastLUPSMeasureTime = rlCore.getTimestamp();
      LastFPSMeasureTime = rlCore.getTimestamp();
      
      LUPSCounting = 0;
      FPSCounting = 0;
      
      if(LogicTimer && useOwnTimer)
      {
        LogicTimer.postMessage(MSPerLU);
        LogicTimer.postMessage("start");
      }   
      CurrentUpdateRequestId = window.requestAnimationFrame(updateViews);
    }
    
    return Paused;
  };
  this.togglePause = togglePause; 
  
  // keep track of performed number of logic updates
  var updateLogicStats = function(){
    if(rlCore.getTimestamp() - LastLUPSMeasureTime >= 1000)
    {
      LUPS = LUPSCounting;
      LUPSCounting = 0;
      LastLUPSMeasureTime = rlCore.getTimestamp();
      
      if(useOwnTimer)
      {
        d = Math.abs(1.0 - LUPS / LUPSTarget);
        // try to adapt to different browser timer resolution inaccuracies to reach desired target LUPS
        if(d > offTolerance/LUPSTarget)
        {
          console.log(name + ": LUPS are off by "+((d*100.0).toFixed(2))+"%, trying to adapt.");
            
          if(d >= farOff)
          {
            forceAdjustMSPerLU(1000.0/LUPSTarget);
          }
          else
          {
            forceAdjustMSPerLU(MSPerLU * (LUPS < LUPSTarget ? 1.0-d : 1.0+d ));
          }
        }     
      }
    }
  };

  // perform a single logic frame update
  var updateLogic = function (tick)
  {
    if(Paused)
      return;  
  
    LUTick++; // not tick.data anymore (can lead to wrong internal tick count if timer calls update one last time after Paused was set)
    
    // call user supplied update logic callback
    myself.onUpdateLogic(LUTick);
    
    LUPSCounting++;
    updateLogicStats();
  };
  this.onUpdateLogic = null; // user must supply a function for it
  this.forceUpdateLogic = function() { updateLogic(LUTick+1); };

  // keep track of performed number of render updates
  var updateRenderStats = function()
  {
    if(rlCore.getTimestamp() - LastFPSMeasureTime >= 1000)
    {
      FPS = FPSCounting;
      FPSCounting = 0;
      LastFPSMeasureTime = rlCore.getTimestamp();
    }
  };

  // perform or skip a single view frame update
  var updateViews = function(time)
  {
    VUTick++;
       
    // call user supplied update views callback 
    myself.onUpdateViews(GL, G2D, time);
    
    // render debug overlay here if enabled 
    if(Debug)
    {    
      G2D.save(); 
      var lupsInfo = "LUPS: "+LUPS;
      var luTickInfo = "LUTick: "+LUTick;
      var fpsInfo = "FPS: "+FPS;
      var vuTickInfo = "VUTick: "+VUTick;
      
      //G2D.clearRect(0,0,Width, Height);
      //G2D.fillStyle = "#000000";
      //G2D.fillRect(0,0,Width,Height);
      
      G2D.font = "12px Lucida Console";
      G2D.textBaseline = "middle";
      G2D.textAlign = "left";
      G2D.fillStyle = "#FFFFFF";
      G2D.shadowColor = "#000000";
      G2D.shadowBlur = 8;
      G2D.fillText(lupsInfo, 8, 16);
      G2D.fillText(luTickInfo, 8, 32);
      G2D.fillText(fpsInfo, 8, 64);
      G2D.fillText(vuTickInfo, 8, 80);
      
      if(Paused)
      {
        G2D.textAlign = "right";
        G2D.fillText(rlCore.getVersionString(), Width-8, Height-8);
        
        G2D.fillRect(Width-20, 8, 4, 16);
        G2D.fillRect(Width-12, 8, 4, 16);
      }
      G2D.restore();   
    }
    
    FPSCounting++;
    
    updateRenderStats();
    if(!renderSingleFrame)
      CurrentUpdateRequestId = window.requestAnimationFrame(updateViews);
  };
  this.onUpdateViews = null; // user must supply a function for it
  var forceUpdateViews = function() 
  { 
    renderSingleFrame = true;
    updateViews(rlCore.getTimestamp()); 
    renderSingleFrame = false;
  };
  this.forceUpdateViews = forceUpdateViews;
  
  var changeLUPS = function(newLUPSTarget)
  {   
    if(!useOwnTimer)
      return;
           
    var resume = false;
    if(!Paused)
    {
      togglePause();
      resume = true;
    }

    LUPSTarget = newLUPSTarget;
    MSPerLU = 1000.0 / LUPSTarget;
    
    if(resume)
      togglePause();
  };
  this.changeLUPS = changeLUPS; 
  
  // canvas initialization     
  CanvasContainer = document.getElementById(containerId);
  if(CanvasContainer != null)
  {
    canvasMain = rlG.createCanvas(CanvasContainer, MainCanvasId, Width, Height, 100, "2px", "solid", "#A0A0A0");
    canvasOverlay = rlG.createCanvas(CanvasContainer, OverlayCanvasId, Width, Height, 110, "2px", "dotted", "#00FF00"); 

    // context initialization
    GL = rlG.getContextGL(canvasMain);
    G2D = rlG.getContext2D(canvasOverlay);
  }
    
  // timer initialization (if engines handles her own timer)
  if(useOwnTimer)
  {
    LogicTimer = rlLogicTimerWorker.createWorker(name + ".LogicTimer", false);
    LogicTimer.onmessage = updateLogic;
  }
  
  // provide function to call by any external timer on tick
  this.manualTick = updateLogic;
  
  // add internal input updater ("GLOBAL" HOTKEYS for toggleing Pause / Debug)            
  // input updater (will receive input events from the engine)
};
