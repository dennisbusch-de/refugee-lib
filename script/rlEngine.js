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
  var CursorImage = null;
  var CurrentUpdateRequestId = 0; // last requested id for the next browser animation frame
  var VUTick = 0;
  var LUTick = 0;
  var renderSingleFrame = false;
  
  // parameters for the main canvas and overlay canvas creation
  var Width  = width || 400;
  var Height = height || 225;
  var MainCanvasId = name + "CanvasMain";
  var OverlayCanvasId = name + "CanvasOverlay";
  var CanvasContainer = null;
          
  var canvasMain = null; // will hold main canvas
  var canvasOverlay = null; // will hold overlay canvas
  var canvasRect = null; // will hold canvas rectangle coordinates
  var GL = null; // will hold webgl drawing context for main canvas
  var G2D = null; // will hold 2D drawing context for overlay canvas 
         
  // for debugging/development/browser behavior exploration
  var lastRawKeyInfo = "";
  var lastKeyInfo = "";
  
  // mouse input states
  var mx = -1, cmx = 0; // uncapped, capped (0..Width-1)
  var my = -1, cmy = 0; // uncapped, capped (0..Height-1)
  var mb = rlInputEvent.createEmptyMouseButtonState(); 
  var mInside = false;
  
  // keyboard input states
  var keys = rlInputEvent.createEmptyKeyState();    
  
  var debugMsg = function(toLog)
  {
    if(Debug)
      console.log(name+": "+toLog);
  };
     
  var toggleDebug = function()
  {
    Debug = !Debug;
    
    canvasMain.style.borderWidth = Debug ? "2px" : "0px";
    canvasOverlay.style.borderWidth = Debug ? "2px" : "0px";
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
      //if(CurrentUpdateRequestId)
      //  window.cancelAnimationFrame(CurrentUpdateRequestId);
        
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
         
      // CurrentUpdateRequestId = window.requestAnimationFrame(updateViews);
    }
    
    return Paused;
  };
  this.togglePause = togglePause; 
  this.isPaused = function() { return Paused; };
  
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
  var updateWarning = true;
  this.onUpdateLogic = function(LUTick) 
  {
    if(Debug && updateWarning) 
    {
      console.warn("Warning from rlEngine("+name+"): default onUpdateLogic callback called.");
      updateWarning = false;
    }
  };
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
      
  var setCursorImage = function(newImage)
  { 
    CursorImage = newImage;
  };
  this.setCursorImage = setCursorImage;
  
  // perform or skip a single view frame update
  var updateViews = function(time)
  {
    VUTick++;
       
    // call user supplied update views callback 
    myself.onUpdateViews(GL, G2D, time);
          
    // render cursor
    if(CursorImage != null)
    {
      G2D.drawImage(CursorImage, cmx, cmy);
    }
    
    // render debug overlay here if enabled 
    if(Debug)
    {    
      G2D.save(); 
      var lupsInfo =   "  LUPS: "+LUPS;
      var luTickInfo = "LUTick: "+LUTick;
      var fpsInfo =    "   FPS: "+FPS;
      var vuTickInfo = "VUTick: "+VUTick;
      var mxInfo =     "    mx: "+mx;
      var myInfo =     "    my: "+my;
      var cmxInfo =    "   cmx: "+cmx;
      var cmyInfo =    "   cmy: "+cmy;
      var mbInfo =     "    mb: ";
      var i;
      for(i in mb)
        mbInfo += mb[i] ? "1" : "0";
      var keyBits = [];
      for(i=0; i<2; i++)
      {
        var t = rlUtilsConvert.numberToBinaryString(keys[i]);
        keyBits[0+i*4] = t.substr(0, 16);
        keyBits[1+i*4] = t.substr(16, 16);
        keyBits[2+i*4] = t.substr(32, 16);
        keyBits[3+i*4] = t.substr(48, 16);
      }     
      
      /*G2D.clearRect(0,0,Width, Height);
      //G2D.fillStyle = "#000000";
      G2D.fillRect(0,0,Width,Height);*/
      
      G2D.font = "12px Courier";
      G2D.textBaseline = "middle";
      G2D.textAlign = "left";
      G2D.fillStyle = "#FFFFFF";
      G2D.shadowColor = "#000000";
      G2D.shadowBlur = 8;
      G2D.fillText(lupsInfo, 8, 16);
      G2D.fillText(luTickInfo, 8, 32);
      G2D.fillText(fpsInfo, 8, 64);
      G2D.fillText(vuTickInfo, 8, 80);
      G2D.fillText(mxInfo, 8, 112);
      G2D.fillText(myInfo, 8, 128);
      G2D.fillText(cmxInfo, 8, 144);
      G2D.fillText(cmyInfo, 8, 160);
      G2D.fillText(mbInfo, 8, 176);
      G2D.fillText(lastRawKeyInfo, 128, 112);
      G2D.fillText(lastKeyInfo, 128, 128);
      for(i=0; i<8; i++)
        G2D.fillText(keyBits[i], 128, 144+i*16);      
      
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
  var viewWarning = true;
  this.onUpdateViews = function(GL, G2D, time) 
  {
    if(Debug && viewWarning)
    {
      console.warn("Warning from rlEngine("+name+"): default onUpdateViews callback called.");
      viewWarning = false;
    }
  };  
  
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
       
  var prevMouseKeyboardEvent = rlInputEvent.createEmptyMouseKeyboardEvent(); 
  var handleInputEvent = function(event) 
  {   
    if(myself.onRawInputEvent != null)
    {
      myself.onRawInputEvent(event);
    }
  
    var unifiedType = event.type;
    var unifiedKeyId = "";
    var unifiedKeyLoc = 0;
    var unifiedWheelInfo = 0;
    var rlKeyId = "";
                  
    // reset stateless input sources
    mb.wheelDown = false;
    mb.wheelUp = false;
    
    // EVENT PATCHING start {
    // patch event before further processing (to have the same data in every browser type)
    if(event.type == "DOMMouseScroll")
    {
      unifiedType = "mousewheel";
      unifiedWheelInfo = rlMath.capValue(-1,event.detail,1);
    }       
    
    if(event.type == "mousewheel")
      unifiedWheelInfo = rlMath.capValue(-1,-event.wheelDelta,1);
      
    if(event.type == "keydown" || event.type == "keyup")
    {      
      // Chrome: keyIdentifier / FF, IE: key
      unifiedKeyId = event.keyIdentifier || event.key;
      unifiedKeyLoc = event.location;
      
      rlKeyId = rlKeys.getKeyId(unifiedKeyId, unifiedKeyLoc);
      
      if(Debug)
      {
        lastRawKeyInfo = "rawKeyId: " + unifiedKeyId + " keyLoc: " + unifiedKeyLoc;
        lastKeyInfo = "rlKeyId: "+rlKeyId+(rlKeyId=="Unknown"?"("+unifiedKeyId+")":"");
      }
    }
    // EVENT PATCHING end }
    
    // MOUSE EVENT HANDLING start {
    if(unifiedType.indexOf("mouse") != -1)
    { 
      mx = event.clientX - canvasRect.left;
      my = event.clientY - canvasRect.top;
      cmx = rlMath.capValue(0, mx, Width-1);
      cmy = rlMath.capValue(0, my, Height-1);
      mInside = rlMath.p2DinRect({ x: event.clientX, y: event.clientY }, canvasRect);
       
      if(Debug)
      {  
        if(!prevMouseKeyboardEvent.inside && mInside)
          canvasOverlay.style.borderColor = "#FFFFFF";
          
        if(!mInside && prevMouseKeyboardEvent.inside)
          canvasOverlay.style.borderColor = "#000000";
      }
      
      if(unifiedType.charAt(5) == "d") // mousedown
      {
        mb[rlInputEvent.translateMouseButtonId(event.button)] = true;
      }
      if(unifiedType.charAt(5) == "u") // mouseup
      {
        mb[rlInputEvent.translateMouseButtonId(event.button)] = false;
        
        if(event.button == 2 && mInside) // prevent contextmenu if mouse is on canvas
        {
          event.preventDefault();
          event.stopPropagation();
        }
      }
      if(unifiedType.charAt(5) == "w") // mousewheel
      {                     
        if(unifiedWheelInfo > 0)
          mb.wheelDown = true;
        else if(unifiedWheelInfo < 0)     
          mb.wheelUp = true;
          
        if(mInside) // prevent page scrolling if mouse is on canvas
        {
          event.preventDefault();
          event.stopPropagation();
        }
      } 
 
      var mouseEvent = rlInputEvent.createMouseKeyboardEvent("mke", LUTick, mx, my, cmx, cmy, mInside, mb, keys, "None", false, "");
      
      // call user defined event handler
      myself.onInputEvent(mouseEvent, prevMouseKeyboardEvent);
      
      prevMouseKeyboardEvent = mouseEvent;
    } 
    // MOUSE EVENT HANDLING end } 
    
    // KEYBOARD EVENT HANDLING start {
    if(unifiedType.indexOf("key") != -1)
    { 
      var up = unifiedType.charAt(3) == "u";
       
      if(!up) // keydown
        rlInputEvent.setKeyState(rlKeyId, keys);
      if(up) // keyup
      {
        rlInputEvent.clearKeyState(rlKeyId, keys);
        rlInputEvent.checkClearModKeyState(rlKeyId, keys);
      }
        
      var keyboardEvent = rlInputEvent.createMouseKeyboardEvent("mke", LUTick, mx, my, cmx, cmy, mInside, mb, keys, rlKeyId, up, (rlKeyId == "Unknown" ? unifiedKeyId : ""));

      event.preventDefault();
      event.stopPropagation();
                              
      // call user defined event handler
      myself.onInputEvent(keyboardEvent, prevMouseKeyboardEvent);
      
      prevMouseKeyboardEvent = keyboardEvent;
    }
    
    // KEYBOARD EVENT HANDLING end }     
  };
  var inputWarning = true;
  this.onInputEvent = function(currentEvent, previousEvent) 
  {
    if(Debug && inputWarning)
    {
      console.warn("Warning from rlEngine("+name+"): default onInputEvent callback called.");
      inputWarning = false;
    }
  };
  this.onRawInputEvent = null; // allows handling DOM events directly
  
  // canvas initialization     
  CanvasContainer = document.getElementById(containerId);
  if(CanvasContainer != null)
  {
    canvasMain = rlG.createCanvas(CanvasContainer, MainCanvasId, Width, Height, 100, Debug ? "2px" : "0px", "solid", "#000000");
    canvasOverlay = rlG.createCanvas(CanvasContainer, OverlayCanvasId, Width, Height, 110, Debug ? "2px" : "0px", "dotted", "#000000");
    canvasMain.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); };
    canvasOverlay.oncontextmenu = canvasMain.oncontextmenu;
    
    canvasRect = rlUtilsDOM.getClientRect(canvasMain);
    
    canvasMain.style.cursor = "none";
    canvasOverlay.style.cursor = "none";
    setCursorImage(rlCursors.getDefaultCursorImage());

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
  
  // initialize input handlers 
  var eventRoot = window;
  var eventsToHandle = [ "mousedown", "mouseup", "mousemove",
                         "DOMMouseScroll", "mousewheel",
                         "keydown", "keyup"
                       ];
  for(e in eventsToHandle)                       
    eventRoot.addEventListener(eventsToHandle[e], handleInputEvent, true);
    
  // start view updates
  CurrentUpdateRequestId = window.requestAnimationFrame(updateViews);
};
