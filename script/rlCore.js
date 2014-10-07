// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Library information and timing.   
 * contains: {@link rlCore} | {@link rlLogicTimer} | {@link rlLogicTimerWorker}  
 */  
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

// functions for custom base object prototype
// (for only having a single copy of the functions in memory
//  instead of creating a new copy in memory in the constructor
//  of rlObject itself each time) 
rlObjectFunctions = function() {
  var rlInfo = function()
  {
    var rv = typeof(this) + " { rlType: " + this.rlType + " (*own ~inherited) properties:\n  ";
    var indicator = "";
    for(p in this)
      if(typeof this[p] != "function" && p != "rlType")
      {      
        indicator = this.hasOwnProperty(p) ? "*" : "~";
        rv = rv + "| "+ indicator + p + ": " + this[p] + "\n  ";
      }  
    return rv+"}";
  };
  
  var rlFunctions = function() 
  {   
    var rv = typeof(this) + " { rlType: " + this.rlType + " (*.own ~.inherited) methods:\n  ";
    var indicator = "";
    for(p in this)
      if(typeof this[p] == "function" && p != "rlType")
      {
        indicator = this.hasOwnProperty(p) ? "*." : "~.";
        rv = rv + indicator + p + "\n  ";
      }  
    return rv+"}"; 
  };
  
  return {
    rlInfo: rlInfo,
    rlFunctions: rlFunctions
  };
}();

// custom base object prototype
rlObject = function() { 
  this.__proto__.rlType = "rlObject";  
                                                   
  // wire up inheritable methods directly to the prototype
  this.__proto__.rlInfo = rlObjectFunctions.rlInfo;
  this.__proto__.rlFunctions = rlObjectFunctions.rlFunctions;

  // for debugging 
  if(this.__proto__.rlInfo.id == undefined)
  {   
    this.__proto__.rlInfo.id = Date.now();
    // should see this message only once per thread running rlCore.js
    console.log("rlObject.rlInfo.id set to: :"+this.__proto__.rlInfo.id);
  }   
  if(this.__proto__.rlFunctions.id == undefined)
  {   
    this.__proto__.rlFunctions.id = Date.now();
    // should see this message only once per thread running rlCore.js
    console.log("rlObject.rlFunctions.id set to: :"+this.__proto__.rlFunctions.id);
  }
};

/** 
 * @namespace 
 */
rlCore = function() {
  /** 
   * @memberof rlCore
   * @constant
   * @private 
   * @default
   */
  var version = "Refugee Lib v.0.01d";

  /**    
   * @memberof rlCore 
   * @function    
   * @returns {string} {@link rlCore.version}
   */                 
  var getVersionString = function() 
  {
    return version;
  };
  
  // normalized polygon definitions for rendering the Refugee Lib logo in arbitrary dimensions
  var logoBG = [ [0.11,0.0],[0.88,0.0],[1.0,0.11],[1.0,0.88],[0.88,1.0],[0.11,1.0],[0.0,0.88],[0.0,0.11] ];
  var logoRO = [ [0.12,0.12],[0.40,0.12],[0.47,0.19],[0.47,0.44],[0.42,0.49],[0.42,0.50],[0.47,0.55],[0.47,0.87],[0.36,0.87],[0.36,0.60],[0.31,0.55],[0.23,0.55],[0.23,0.87],[0.12,0.87] ];
  var logoRI = [ [0.24,0.24],[0.31,0.24],[0.35,0.28],[0.35,0.39],[0.31,0.43],[0.24,0.43] ];
  var logoL  = [ [0.63,0.12],[0.67,0.12],[0.67,0.76],[0.87,0.76],[0.87,0.80],[0.80,0.87],[0.56,0.87],[0.56,0.19] ];   
  
  /**
   * Get an object containing polygon data for rendering the **Refugee Lib** logo at an arbitrary size.  
   * Returns an array [ bg, rOuter, rInner, l ] where each of the elements is an array of points which are themselves arrays of two elements, containing x and y coordinates (each normalized (0.0 to 1.0)), defining a polygon.  
   * @see {@link rlG.drawNormalizedPolygon} | {@link rlG.drawRefugeeLibLogo}
   * @memberof rlCore
   * @function
   */
  var getLogoData = function()
  {
    return [ logoBG, logoRO, logoRI, logoL ];
  };
  
  /**
   * @see [DOMHighResTimeStamp]{@link https://developer.mozilla.org/en/docs/Web/API/DOMHighResTimeStamp} | [Date.now()]{@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date/now}     
   * @memberof rlCore 
   * @function    
   * @returns {number} a high resolution timestamp if available, Date.now() otherwise
   */  
  var getTimestamp = function()
  {
    if(self.performance)
      return self.performance.now();
    else
      return Date.now();
  };
  
  return {
    getVersionString: getVersionString,
    getTimestamp: getTimestamp,
    getLogoData: getLogoData
  };
}();

/**
 * Meant to be used primarily from a Blob inside a Worker but can be instantiated and used directly as well.
 * Provides steady timing by calling a user defined callback at a fixed interval and passing a tick count each time.
 * @see {@link rlLogicTimerWorker} 
 * @constructor
 */
rlLogicTimer = function(timerName) 
{
  if(typeof rlObject !== "undefined")
  {
    this.__proto__ = new rlObject();
    this.__proto__.rlType = "rlLogicTimer";
  }

  var name = timerName;
  var interval = 20.0; // interval in ms
  var tick = 0;
  var timer = null;
  var callbackOnTick = null; // will be used when the object is used without Worker 
  var lastTickTime = 0.0;
  var useHighResTime = false;
  var running = false;       
     
  var highResTickler = function()
  {    
    // use only in Worker thread, will slow down/block script otherwise because of tight loop
    
    if((performance.now() - lastTickTime >= interval) && running)
    { 
      postMessage(tick);
      tick++;           
      lastTickTime = performance.now();
      self.setTimeout(highResTickler, 0); // yield
    }
  };
  
  var tickler = function()
  {                     
    if(callbackOnTick)
      callbackOnTick(tick);
    else
      postMessage(tick);  
      
    tick++;
    timer = self.setTimeout(tickler, interval);
  };

  var start = function()
  {
    console.log(name + ": tickleing starts(using "+(useHighResTime?"high-res":"classic")+" timing).");
     
    running = true; 
    if(useHighResTime)
    {
      lastTickTime = performance.now();
      highResTickler();
    }
    else
    { 
      timer = self.setTimeout(tickler, interval);
    }
  };

  var stop = function()
  {
    console.log(name + ": tickleing stops.");
    
    if(!useHighResTime)
    {
      if(timer)
        self.clearTimeout(timer);
     
      timer = null;
    }
    
    running = false;
  };
  
  var resettick = function()
  { 
    tick = 0;
  };
  
  var setInterval = function(v)
  {
    interval = v;
    console.log(name + ": tickleing interval set to "+interval+"ms.");
  };

  this.handleMessage = function(objEvent)
  {   
    var msgFromSameThread = objEvent.type.charAt(0) == "#";    
     
    if(typeof objEvent.data == "string")
    { 
      if(objEvent.data == "start")
      { 
        if(!running)
        {    
          // experimental highrestime disabled for now because it is heavy on the CPU
          // despite of yielding inside highResTickler()
          // also, at the time of writing "performance" is not available inside a Worker in IE
          //useHighResTime = !msgFromSameThread && (typeof self.performance != "undefined");
                  
          start();
        }
        else
          console.log(name + ": start received but is already started.");
        return;
      }
      
      if(objEvent.data == "stop")
      {   
        if(running)
          stop();
        else
          console.log(name + ": stop received but is already stopped."); 
        return;
      }
              
      if(objEvent.data == "resettick")
      {
        resettick();
        return;
      }
      
      name = objEvent.data; // for IE workaround (see factory below for details)
    }
      
    if(typeof objEvent.data == "number")
    {
      setInterval(objEvent.data);
    }
  };
        
  // for use when rlLogicTimer is instanced directly in a thread other than a Worker
  /** 
   * Send a message to the rlLogicTimer instance to configure its behaviour.    
   * @memberof rlLogicTimer 
   * @function postMessage
   * @param {(string|number)} messageData pass a number to change the timer interval (in ms) or one of the command strings "start", "stop", "resettick" | pass any other string to change the internal name of the timer (appears in console messages)     
   */
  this.postMessage = function(messageData)
  { 
    // "#" used by message handler to tell the message came from the same thread            
    this.handleMessage( { type: "#message", data: messageData }); 
  };
  
  /** 
   * Set the callback function to call on each timer tick when using the timer instance directly without a Worker.    
   * @memberof rlLogicTimer 
   * @function setCallback
   * @param {rlLogicTimer~callbackOnTick} func the callback function to call on each timer tick        
   */  
  this.setCallback = function(func) { callbackOnTick = func; };
  
  /** 
   * Function signature for callbacks to use with {@link rlLogicTimer.setCallback}.
   * @callback rlLogicTimer~callbackOnTick
   * @param {number} tick the current timer tick (increases by 1 with each call)
   */
  
  Object.defineProperty(this, "name", { enumerable: true, get: (function() { return name; }) });  
}; 
rlLogicTimer.prototype.constructor = rlLogicTimer;

/** 
 * @namespace 
 */
rlLogicTimerWorker = function() 
{
  /** 
   * Factory function to create a Blob with a script from {@link rlLogicTimer} and a Worker to run the generated script in a separate thread.    
   * @see [Blob]{@link https://developer.mozilla.org/en/docs/Web/API/Blob} | [Worker]{@link https://developer.mozilla.org/en/docs/Web/API/Worker} 
   * @memberof rlLogicTimerWorker 
   * @function createWorker
   * @param {string} name the name to use for the rlLogicTimer inside the Worker
   * @param {boolean} verbose set to true to output status messages to the console     
   * @returns a Worker object, ready to be used with [postMessage]{@link rlLogicTimer.postMessage} commands for controlling the contained {@link rlLogicTimer} | set the onmessage property to define the [callback]{@link rlLogicTimer~callbackOnTick} 
   */
  var create = function(name, verbose)
  {
    var inlinedScript = rlLogicTimer.toString();
    inlinedScript = "rlLogicTimer = "+inlinedScript+";";
    inlinedScript += "\nvar lt = new rlLogicTimer(\""+name+"\", true);";
    inlinedScript += "\nself.addEventListener(\"message\", lt.handleMessage, false);";
    var inlinedBlob = new Blob([inlinedScript], { type: "text/javascript" });
    var inlinedBlobURL = URL.createObjectURL(inlinedBlob);  
    var inlinedWorker = null;
    // var inlinedWorker = new Worker(inlinedBlobURL); 
    // the above line currently throws a SecurityError in IE  
    // (hence the workaround here with the __rlLogicTimerForIE at the end of the file)
    if(window.ActiveXObject || "ActiveXObject" in window) // is IE?
    {
      if(verbose) 
        console.log("using workaround in rlLogicTimerWorker.create for Worker in IE");
      
      inlinedWorker = new Worker("./script/rlCore.js");
      inlinedWorker.postMessage("__rlLogicTimerForIE."+name);  
    }
    else // not IE
    {
      inlinedWorker = new Worker(inlinedBlobURL);               
      if(verbose)
      {
        console.log(inlinedScript);
        console.log(inlinedBlob);
        console.log(inlinedBlobURL);
        console.log(inlinedWorker);
      }
    }
    
    return inlinedWorker;
  };
  
  return {
    createWorker: create
  };
}();

// workaround for IE (which at the time of writing throws SecurityError for Workers
// created from a Blob URL so it has to run as its own script)
if(typeof(window) == "undefined" &&(self.ActiveXObject || "ActiveXObject" in self))
{
  console.log("using workaround for rlLogicTimer running in a Worker in IE");
  __rlLogicTimerForIE = new rlLogicTimer("unnamed");
  onmessage = __rlLogicTimerForIE.handleMessage;
}