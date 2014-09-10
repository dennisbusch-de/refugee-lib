// -----------------------------------------------------------------------------
// Refugee Lib - WIP
// base object prototype and core types
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

rlCore = function() {
  var version = "Refugee Lib v.-1.0 (very early wip)";
                 
  var getVersionString = function() 
  {
    return version;
  };
  
  var getTimestamp = function()
  {
    if(self.performance)
      return self.performance.now();
    else
      return Date.now();
  };
  
  return {
    getVersionString: getVersionString,
    getTimestamp: getTimestamp
  };
}();

// the following is meant to be used primarily as a Blob inside a Worker
// (the factory to build that Worker is below it)
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
  this.postMessage = function(messageData)
  { 
    // "#" used by message handler to tell the message came from the same thread            
    this.handleMessage( { type: "#message", data: messageData }); 
  };
  
  this.setCallback = function(func) { callbackOnTick = func; };
  
  Object.defineProperty(this, "name", { enumerable: true, get: (function() { return name; }) });  
}; 
rlLogicTimer.prototype.constructor = rlLogicTimer;

 // factory for building the Blob and the Worker from the rlLogicTimer code
rlLogicTimerWorker = function() 
{
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