// -----------------------------------------------------------------------------
// Refugee Lib
/** 
 * @file Engine (main loop(input,logic,presentation) control).  
 * contains: {@link rlEngine}  
 */
// ----------------------------------------------------------------------------- 
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

/**
 * Instantiate an object for easily handling an application/game main loop(gathering input and performing logic state and view updates at regular intervals).  
 *  
 * An engine will also provide two [Canvas]{@link https://developer.mozilla.org/en/docs/Web/HTML/Canvas} elements along with a webgl and a 2d context, ready-to-use in view updates.  
 *  
 * The canvas elements are layered in a way that the 2d canvas will be rendered on top of the webgl canvas.
 *  
 * The 2d canvas will also be used by the engine to display debug information (if enabled).
 *  
 * By default, the engine will instantiate and handle a timer running in a separate thread, so that logic updates can be performed even when the engine is not in the active browser-tab.
 *  
 * An engine starts in Paused state to allow setting the [onInputEvent]{@link rlEngine#onInputEvent}, [onUpdateLogic]{@link rlEngine#onUpdateLogic} and [onUpdateViews]{@link rlEngine#onUpdateViews} properties before calling [togglePause]{@link rlEngine#togglePause} to start it.
 * @constructor
 * @param {string} containerId the DOM id of an [Element]{@link https://developer.mozilla.org/en/docs/Web/API/element} into which to insert the engines views  
 * @param {string} name the name of the engine as it appears in debug messages, if debug is enabled
 * @param {boolean} debug set to true to enable debug messages and debug info to be displayed on view updates
 * @param {number} width the width of the engines views in pixels
 * @param {number} height the height of the engines views in pixels
 * @param {WebGLContextAttributes} [glContextAttributes] [WebGLContextAttributes]{@link https://www.khronos.org/registry/webgl/specs/1.0/#5.2}
 * @param {boolean} [useOwnTimer=true] set to false to prevent the engine from instantiating and managing its own logic update timer 
 * @returns {rlEngine}
 */
rlEngine = function(containerId, name, debug, width, height, glContextAttributes, useOwnTimer) 
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
  var cix = 0, ciy = 0; // specifies which pixel of the CursorImage should be rendered at the mouse coordinates
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
   
  var getGL = function() { return GL; };
  var getG2D = function() { return G2D; };
  
  /** 
   * Get the webgl rendering context which was instantiated at construction time.
   * @see [WebGLRenderingContext]{@link https://developer.mozilla.org/en/docs/Web/API/WebGLRenderingContext}
   * @function
   * @returns {WebGLRenderingContext|null} the webgl rendering context or null if none is available 
   */
  this.getGL = getGL;
  
  /**
   * Get the 2D rendering context which was instantiated at construction time.
   * @see [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D}
   * @function
   * @returns {CanvasRenderingContext2D|null} the 2D rendering context or null if none is available 
   */
  this.getG2D = getG2D; 
         
  // for debugging/development/browser behavior exploration
  var lastRawKeyInfo = "";
  var lastKeyInfo = "";
  
  // mouse input states
  var mx = -1, cmx = 0; // uncapped, capped (0..Width-1)
  var my = -1, cmy = 0; // uncapped, capped (0..Height-1)
  var mb = rlInputEvent.createEmptyMouseButtonState(); 
  var mInside = false;
                                                             
  // keyboard input states
  var keys = rlKeys.createEmptyKeyState();    
  
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
    
    canvasOverlay.style.borderColor = mInside ? "#FFFFFF" : "#000000";
  };
  
  /**         
   * Toggle the debug state.
   * @function
   */
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
  
  /**         
   * Toggle the Paused state. As long as an engine is paused, it will not call logic updates.  
   * It will still gather input events and call view updates.
   * @function
   */                             
  this.togglePause = togglePause;
  
  /**
   * Get the Paused state.
   * @function
   * @returns {boolean}
   */ 
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
  
  /**
   * Function signature for callbacks to use with [onUpdateLogic]{@link rlEngine#onUpdateLogic}.
   * @callback rlEngine~callbackOnUpdateLogic
   * @param {number} LUTick the logic update tick (increases by 1 with each logic update)
   */
  /** @member {rlEngine~callbackOnUpdateLogic} */ 
  this.onUpdateLogic = function(LUTick) 
  {
    if(Debug && updateWarning) 
    {
      console.warn("Warning from rlEngine("+name+"): default onUpdateLogic callback called.");
      updateWarning = false;
    }
  };
   
  /**         
   * Force a single logic update (even if the engine is in Paused state).
   * @function
   */
  this.forceUpdateLogic = function() 
  { 
    LUTick++;
    
    // call user supplied update logic callback
    myself.onUpdateLogic(LUTick);
  };

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
          
  var setCursorImage = function(newImage, cax, cay)
  { 
    cix = cax;
    ciy = cay;
    CursorImage = newImage;
    
    if(typeof CursorImage == "string")
    {
      canvasMain.style.cursor = CursorImage;
      canvasOverlay.style.cursor = CursorImage;
      canvasMain.style.cursor.x = cax;
      canvasMain.style.cursor.y = cay;
      canvasOverlay.style.cursor.x = cax;
      canvasOverlay.style.cursor.y = cay;
    }
    else
    {
      canvasMain.style.cursor = "none";
      canvasOverlay.style.cursor = "none"; 
    }
  };
  
  /** 
   * Set the image to use for rendering the mouse cursor while it is within the engines view area.  
   * e.g.: `myEngine.setCursorImage(rlCursors.getDefaultCursorImage(), 0, 0);` to set it back to the built-in default cursor. 
   * @see [HTMLImageElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLImageElement} | [rlCursors]{@link rlCursors}
   * @function
   * @param {HTMLImageElement|string} newImage the image to display as the mouse cursor (or a string to set the [cursor]{@link https://developer.mozilla.org/en/docs/Web/CSS/cursor} CSS property of the engines views) 
   * @param {number} cax cursor active x: horizontal-axis position of the cursor images active pixel
   * @param {number} cay cursor active y: vertical-axis position of the cursor images active pixel     
   */
  this.setCursorImage = setCursorImage;
  
  // perform or skip a single view frame update
  var updateViews = function(time)
  {
    VUTick++;
       
    // call user supplied update views callback 
    myself.onUpdateViews(GL, G2D, time);
          
    // render cursor
    if(CursorImage != null && typeof CursorImage != "string")
    {
      G2D.drawImage(CursorImage, cmx-cix, cmy-ciy);
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
      for(i=0; i<keys.length; i++)
      {
        var t = rlUtilsConvert.i32ToBinaryString(keys[i]);
        keyBits[(keys.length*2-1)-i*2] = t.substr(16, 16);
        keyBits[(keys.length*2-2)-i*2] = t.substr(0, 16);
      }     
      
      /*G2D.clearRect(0,0,Width, Height);
      G2D.fillStyle = "#000000";
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
      G2D.fillText(lastRawKeyInfo, 128, 16);
      G2D.fillText(lastKeyInfo, 128, 32);
      for(i=0; i<keyBits.length; i++)
        G2D.fillText(keyBits[i], 128, 48+i*16);      
      
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
  
  /**
   * Function signature for callbacks to use with [onUpdateViews]{@link rlEngine#onUpdateVies}.  
   * @callback rlEngine~callbackOnUpdateViews
   * @param {WebGLRenderingContext} GL a [WebGLRenderingContext]{@link https://developer.mozilla.org/en/docs/Web/API/WebGLRenderingContext} for the lower layer of the engines view
   * @param {CanvasRenderingContext2D} G2D a [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D} for the upper layer of the engines view
   * @param {DOMTimeStamp|DOMHighResTimeStamp} time a timestamp as provided by [requestAnimationFrame]{@link https://developer.mozilla.org/en/docs/Web/API/window.requestAnimationFrame}
   */
  /** @member {rlEngine~callbackOnUpdateViews} */
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
  
  /**         
   * Force a single views update.
   * @function
   */
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
  
  /**
   * Change the desired number of logic updates per second to perform. (Does not apply if the engine was prevented from managing its own timer at instantiation time.)
   * @function
   * @param {number} newLUPSTarget the desired number of logic updates per second
   */
  this.changeLUPS = changeLUPS; 
       
  var prevMouseKeyboardEvent = rlInputEvent.createEmptyMouseKeyboardEvent();
  var lastKeyDownId = ""; // needed for "keypress" events, to know which key in the preceding "keydown" actually produced the printable character
  var lastKeyDownCode = 0;// needed for "keypress" events, to know which key in the preceding "keydown" actually produced the printable character 
  var handleInputEvent = function(event) 
  {   
    if(myself.onRawInputEvent != null)
    {
      myself.onRawInputEvent(event);
    }
  
    var unifiedType = event.type;
    var unifiedKeyId = "";
    var unifiedKeyLoc = 0;
    var printableChar = "";
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
      
    if(event.type.substr(0,3) == "key")
    {      
      // Chrome: keyIdentifier / FF, IE: key
      unifiedKeyId = event.keyIdentifier || event.key;
      unifiedKeyLoc = event.location;
      
      // determine printable char (if any)
      // (this is a patchy solution, since at time of writing the new DOM level 3 properties .key and .code
      //  were not widely supported/implemented yet, so the deprecated properties (which are NOT unicode values)
      //  are used here, well aware that they won't always produce the correct character for all keys
      //  on all the different keyboard layouts of the world)
      printableChar = (typeof event.key != "undefined") ? event.key : // this should be correct in the future :) 
                      (event.which == null) ? String.fromCharCode(event.keyCode) :
                      (event.which != 0 && event.charCode != 0) ? String.fromCharCode(event.which) :
                      "";
      printableChar = printableChar.length == 1 ? printableChar : "";
      // at time of writing, the above pseudo-solution will give:
      // FireFox: correct printable char on all locales or an empty string if the key does not produce a printable char
      // IE: correct printable char in most cases but not for all keys and switching locale at runtime in IE causes 
      // keypresses to eventually become "Unidentified" 
      // Chrome: correct printable char on all locales or an empty string if the key does not produce a printable char
      // or if the event does not know that yet (chrome only gives correct printable char on "keypress"
      // but not on "keydown" where the code is never referring to an actual character)
      
      rlKeyId = (event.type != "keypress") ? rlKeys.getKeyId(unifiedKeyId, unifiedKeyLoc)
                : lastKeyDownId;
      
      if(event.type == "keydown")
      {
        lastKeyDownId = rlKeyId;
        lastKeyDownCode = event.keyCode;
      }         
      
      if(Debug)
      {
        lastRawKeyInfo = "rawKeyId: " + unifiedKeyId + " keyLoc: " + unifiedKeyLoc;
        lastKeyInfo = "rlKeyId: "+rlKeyId+" ["+printableChar+"]";
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
      var t = unifiedType.charAt(5);
       
      if(Debug)
      {  
        if(!prevMouseKeyboardEvent.inside && mInside)
          canvasOverlay.style.borderColor = "#FFFFFF";
          
        if(!mInside && prevMouseKeyboardEvent.inside)
          canvasOverlay.style.borderColor = "#000000";
      }
      
      if(t == "d") // mousedown
      {
        mb[rlInputEvent.translateMouseButtonId(event.button)] = true;
      }
      if(t == "u") // mouseup
      { 
        buttonUp = true;
        mb[rlInputEvent.translateMouseButtonId(event.button)] = false;
        
        if(event.button == 2 && mInside) // prevent contextmenu if mouse is on canvas
        {
          event.preventDefault();
          event.stopPropagation();
        }
      }
      if(t == "w") // mousewheel
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
 
      var mouseEvent = rlInputEvent.createMouseKeyboardEvent("m"+t, LUTick, mx, my, cmx, cmy, mInside, mb, keys, "None", "");
      
      // call user defined event handler
      myself.onInputEvent(prevMouseKeyboardEvent, mouseEvent);
      
      prevMouseKeyboardEvent = mouseEvent;
    } 
    // MOUSE EVENT HANDLING end } 
    
    // KEYBOARD EVENT HANDLING start {
    if(unifiedType.indexOf("key") != -1)
    { 
      var t = unifiedType.charAt(3);
      var stateId = (printableChar != "" && rlKeyId == rlKeys.getUnknownKeyId()) ? printableChar : rlKeyId;
      var stateCode = t == "p" ? lastKeyDownCode : event.keyCode;
       
      if(t=="d" || t=="p") // keydown && keypress
      {
        keys = rlKeys.setKeyStateBit(stateId, keys, stateCode);
      }
      if(t=="u") // keyup
      {
        keys = rlKeys.clearKeyStateBit(stateId, keys, stateCode);
        
        // handle engine commands
        if(mInside)
        {
          if(stateId == "ScrollLock")
            myself.toggleDebug();
          if(stateId == "Pause")
          { 
            // alternate Debug toggle for keyboards which lack ScrollLock key
            if(rlInputEvent.getKeyState("LeftAlt", keys) || 
               rlInputEvent.getKeyState("RightAlt", keys) ||
               rlInputEvent.getKeyState("ReleaseAlt", keys))
              myself.toggleDebug();
            else            
              myself.togglePause();
          } 
        }
      }
        
      var keyboardEvent = rlInputEvent.createMouseKeyboardEvent("k"+t, LUTick, mx, my, cmx, cmy, mInside, mb, keys, rlKeyId, printableChar);
      
      if((printableChar == "" && unifiedKeyId.indexOf("U+") == -1)||printableChar != "") // patchy solution to allow follow up "keypress" events to fire in Chrome (which are needed to get correct printable characters there)
      {
        event.preventDefault();
        event.stopPropagation();
      }
                              
      // call user defined event handler
      myself.onInputEvent(prevMouseKeyboardEvent, keyboardEvent);
      
      prevMouseKeyboardEvent = keyboardEvent;
    }
    
    // KEYBOARD EVENT HANDLING end }     
  };
  var inputWarning = true;
  
  /**
   * Function signature for callbacks to use with [onInputEvent]{@link rlEngine#onInputEvent}.
   * @callback rlEngine~callbackOnInputEvent
   * @param {rlInputEvent.mouseKeyboardEvent} previousEvent
   * @param {rlInputEvent.mouseKeyboardEvent} currentEvent
   */
  /** @member {rlEngine~callbackOnInputEvent} */
  this.onInputEvent = function(previousEvent, currentEvent) 
  {
    if(Debug && inputWarning)
    {
      console.warn("Warning from rlEngine("+name+"): default onInputEvent callback called.");
      inputWarning = false;
    }
  };
  
  this.onRawInputEvent = null; // allows handling DOM events directly
  
  /**
   * Get the current mouse and keyboard input state (as known by the last processed input event).
   * @function
   * @returns {rlInputEvent.mouseKeyboardEvent}
   */
  this.getInputState = function()
  {
    return prevMouseKeyboardEvent;
  }; 
   
  var clearInputState = function()
  {                                     
    mb = rlInputEvent.createEmptyMouseButtonState();
    keys = rlKeys.clearWholeKeyState(keys);
    prevMouseKeyboardEvent = rlInputEvent.createEmptyMouseKeyboardEvent(); 
  };
  
  var handleRootEvent = function(event)
  {  
    if(event.type == "blur")
    {
      clearInputState();
    }
    if(event.type == "focus")
    {
      clearInputState();
    }
  };
  
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
    setCursorImage(rlCursors.getDefaultCursorImage(), 0, 0);

    // graphic context initialization
    GL = rlG.getContextGL(canvasMain, glContextAttributes);
    if(GL != null)
    {
      GL.viewport(0, 0, Width, Height);
    }
    
    G2D = rlG.getContext2D(canvasOverlay);
  }
    
  // timer initialization (if engines handles her own timer)
  if(useOwnTimer)
  {
    LogicTimer = rlLogicTimerWorker.createWorker(name + ".LogicTimer", false);
    LogicTimer.onmessage = updateLogic;
  }
  
  /**
   * Provided to be called by any external timer on tick (does nothing if engine is in Paused state).
   * (Meant to be use by multiple engine instances sharing the same external timer.)
   * @function
   */
  this.manualTick = updateLogic;
  
  // initialize input handlers 
  var eventRoot = window;
  var inputEventsToHandle = [ "mousedown", "mouseup", "mousemove",
                              "DOMMouseScroll", "mousewheel",
                              "keydown", "keypress", "keyup" 
                            ];
  for(e in inputEventsToHandle)                       
    eventRoot.addEventListener(inputEventsToHandle[e], handleInputEvent, true);
    
  // initialize window event handlers
  var rootEventsToHandle = [ "blur", "focus" ];
  for(e in rootEventsToHandle)                       
    eventRoot.addEventListener(rootEventsToHandle[e], handleRootEvent, true);  
    
  // start view updates
  CurrentUpdateRequestId = window.requestAnimationFrame(updateViews);
};
