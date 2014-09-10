// -----------------------------------------------------------------------------
// Refugee Lib - WIP
// library initialization/loader code
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

var rlBoot = function()
{
  var minimalBootScriptURLs = [ 
                                "./script/rlCore.js"
                                //" ./script/",
                              ];

  var regularBootScriptURLs = [
                                "./script/3rdparty/webgl-utils.js",
                                "./script/rlG.js",
                                "./script/rlEngine.js",
                                "./script/rlDataManager.js"
                                //" ./script/",
                              ];
                    
  var bootRefugeeLibMinimal = function(divIdForMessages, additionalScriptURLs, bootContext, mainFunc, clearDivOnSuccess)
  { 
    var eURLs = [].concat(minimalBootScriptURLs, additionalScriptURLs);
    bootRefugeeLibEx(divIdForMessages, eURLs, bootContext, mainFunc, clearDivOnSuccess);
  };
  
  var bootRefugeeLib = function(divIdForMessages, additionalScriptURLs, bootContext, mainFunc, clearDivOnSuccess)
  { 
    var eURLs = [].concat(minimalBootScriptURLs, regularBootScriptURLs, additionalScriptURLs);
    bootRefugeeLibEx(divIdForMessages, eURLs, bootContext, mainFunc, clearDivOnSuccess);
  };
    
  var fallbackLog = typeof console != "undefined" ? (function(m) { console.log(m) }) : (function(m) { /* :( */ });
  
  var bootRefugeeLibEx = function(divIdForMessages, scriptURLs, bootContext, mainFunc, clearDivOnSuccess)
  {   
    var msgDiv = document.getElementById(divIdForMessages); 
    if(msgDiv == null)
      fallbackLog("Warning from rlBoot.bootRefugeeLib: div for boot messages '"+divIdForMessages+"' does not exist, using console.log instead.");
    
    var clrDiv = typeof clearDivOnSuccess == "undefined" ? false : clearDivOnSuccess;  
    var bootCode = 0;
    
    var bgCol = "#000000";
    var stdCol = "#00FF00";
    var sCol = "#FFFFFF";
    var errCol = "#FF0000";
    var nCol = "#FFFF00";    
         
    // prepare message area for boot/init messages
    if(msgDiv != null)
    {
      msgDiv.style.verticalAlign = "top";
      msgDiv.style.fontFamily = "Courier";
      msgDiv.style.fontWeight = "normal";
      msgDiv.style.fontSize = "16px";
      msgDiv.style.textAlign = "left";
      msgDiv.style.paddingLeft = "4px";
      msgDiv.style.position = "absolute";
      msgDiv.style.overflow = "scroll";
      msgDiv.style.backgroundColor = bgCol;
      msgDiv.style.color = stdCol;
      
      msgDiv.innerHTML = "";  
    }
      
    var gct = function(color, text)
    {       
      if(msgDiv != null)
        return "<span style=\"color: "+color+";\">"+text+"</span>";
      else
        return text;
    };
          
    var prevLength = 0;
    var say = function(message, replacePrev)
    {
      if(msgDiv != null)
      { 
        if(replacePrev)
        {
          msgDiv.innerHTML = msgDiv.innerHTML.substr(0, prevLength) + message+"<br>"; 
        }                                  
        else
        {   
          prevLength = msgDiv.innerHTML.length;
          msgDiv.innerHTML += message+"<br>";
          msgDiv.scrollTop = msgDiv.scrollHeight - msgDiv.clientHeight;
        }
      }
      else
        fallbackLog(message);
    };
    
    var sayError = function(message, replacePrev)
    {
      say(gct(errCol,"[X] ")+message, replacePrev);
    };
         
    // collect scripts to load
    var scriptsToLoad = [].concat(scriptURLs);
    var nextScriptURL = null;
          
    var onComponentLoad = function(progE)
    {  
      if(progE.currentTarget.status >= 400) // failed?
      {  
        sayError("failed with httpCode "+gct(nCol, progE.currentTarget.status));
        bootCode = 4;
      }
      else // all good 
      {    
        // evaluate/register script content
        try
        {       
          say("evaluating: "+gct(sCol, nextScriptURL)+gct(nCol," ["+progE.loaded+"/"+progE.total+"]"),true);
          if(typeof bootContext == "undefined" || bootContext == null)
            throw new Error("the given "+gct(sCol,"bootContext")+" is "+gct(sCol,"undefined")+" or "+gct(sCol,"null"));
          
          if(typeof bootContext.eval == "undefined")
            throw new Error("the given "+gct(sCol,"bootContext")+" does not implement "+gct(sCol,"eval"));
          
          bootContext.eval(progE.currentTarget.response);
          say("loaded: "+gct(sCol, nextScriptURL)+gct(nCol," ["+progE.loaded+"/"+progE.total+"]"),true);
        }
        catch(exc)
        {                                                
          bootCode = 5;
          sayError("evaluation exception: "+exc.message);
        }
      }
      bootNext();
    };
    
    var onComponentProgress = function(progE)
    {   
      if(progE.currentTarget.status >= 400) // failed?
      { 
        bootCode = 3; 
      }
      else // still good 
      {
        if(progE.lengthComputable)
        {
          say("loading: "+gct(sCol, nextScriptURL)+gct(nCol," ["+progE.loaded+"/"+progE.total+"]"),true);
        }
      }  
    };
    
    var onComponentError = function(errE)
    {
      bootCode = 2;
      sayError("failed loading: "+gct(sCol, nextScriptURL),true);
    };  
             
    var mainCalled = false;
    var safeCallMain = function()
    { 
      if(!mainCalled)
      {  
        say("calling user supplied main function...");
        if(typeof bootContext == "undefined" || bootContext == null)
        {
          sayError("the given "+gct(sCol,"bootContext")+" is "+gct(sCol,"undefined")+" or "+gct(sCol,"null"));
          return;
        }
        if(typeof mainFunc == "undefined" || mainFunc == null) 
        {
          sayError("the given "+gct(sCol,"mainFunc")+" is "+gct(sCol,"undefined")+" or "+gct(sCol,"null"));
          return;
        }
              
        // clean up/hide boot messages area
        if(msgDiv != null && clrDiv && bootCode == 0 && typeof mainFunc == "function")
        {                        
          msgDiv.style.overflow = "visible";
          msgDiv.style.backgroundColor = "transparent";
          msgDiv.innerHTML = "";
        }
                          
        try
        { 
          if(typeof mainFunc != "function")
            throw new Error("the given "+gct(sCol, "mainFunc")+" is not a function");  
           
          mainCalled = true;
          mainFunc.call(bootContext, bootCode);
        } 
        catch(exc)
        { 
          sayError("exception in rlBoot.safeCallMain: "+exc.message);
        }
      }
      else
        fallbackLog("Warning: rlBoot.js tried to call mainFunc more than once.");
    };
    
    var bootNext = function()
    { 
      nextScriptURL = (scriptsToLoad.length > 0 && bootCode == 0) ? scriptsToLoad.shift() : null;  
    
      if(nextScriptURL != null)
      { 
        say("loading: "+gct(sCol, nextScriptURL));
        try
        {
          //throw new Error("TestFail");    
          var r = new XMLHttpRequest();
          r.open("GET", nextScriptURL, true);
          r.responseType = "text";
          
          r.onerror = onComponentError;
          r.onprogress = onComponentProgress;
          r.onload = onComponentLoad; 
          
          r.send();
        }
        catch(exc)
        {
          bootCode = 255;
          sayError("exception in rlBoot.bootNext: "+exc.message);
          sayError("...boot failed.");
          
          // proceed with main function
          safeCallMain();                    
        }
      }
      else // done booting or error?
      { 
        if(bootCode == 0) // no error?
        {   
          if(typeof rlCore != "undefined")
            say("booted: "+gct(sCol,rlCore.getVersionString()));        
        }                      
        else 
        {
          say("...boot failed.");
        }
                         
        // proceed with main function
        safeCallMain(); 
      }
    };

    // START BOOTING                    
    bootCode = 0;
    
    say("booting "+gct(sCol,"Refugee Lib")+" ...");
    
    // before loading the first script, assure that all Objects, HTML"5" features
    // which are needed by Refugee Lib are supported(defined)
    try
    { 
      var endOfFeatures = 0;  
      var neededFeatures = [  
                             Blob,
                             JSON, 
                             window.Canvas,
                             window.WebGLRenderingContext,
                             Worker, 
                             XMLHttpRequest,
                             
                             endOfFeatures 
                           ];
    }
    catch(exc)
    {
      bootCode = 1;
      sayError("missing feature: "+gct(sCol, exc.message));
    }  
     
    // now load the first script or proceed directly with mainFunc on an error
    if(bootCode == 0)
      bootNext();
    else
      safeCallMain();
  };

  return {
    bootRefugeeLib: bootRefugeeLib,
    bootRefugeeLibMinimal : bootRefugeeLibMinimal
  };
}();