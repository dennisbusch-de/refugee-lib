// -----------------------------------------------------------------------------
// Refugee Lib
/** 
 * @file Factory for instantiating library functionality demos.  
 * contains: {@link rlDemos}  
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

/**
 * "rlDemos.js" ({@link rlBoot.bootRefugeeLib} does not load this script by default) 
 *  
 * @namespace
 */
var rlDemos = new function()
{
  /**
   * Instantiates and starts a simple Hello World {@link rlEngine} with moving, colorcycleing letters and an also colorcycleing background using the C64 palette and with the debug overlay turned on.
   * @see <a href="../rlTemplate_HelloWorld.html" target="blank">a live example using this function</a>
   * @memberof rlDemos
   * @function
   * @param {string} containerId as described in rlEngine constructor
   * @param {string} engineName as described in rlEngine constructor
   * @param {number} engineWidth as described in rlEngine constructor
   * @param {number} engineHeight as described in rlEngine constructor
   * @param {string} helloText the text to use for the moving letters
   * @param {number} speedx the initial horizontal speed for the moving letters
   * @param {number} speedy the initial vertical speed for the moving letters
   * @param {number} fgCycle the logic updates delay between cycleing colors for the letters 
   * @param {number} bgCycle the logic updates delay between cycleing colors for the background
   * @param {number} charJitter the maximum in pixels for a random letter displacement from its current position on each view update
   * @param {number} activationDelay the delay in logic updates before the next letter starts moving (they all start at the center of the view)
   * @returns {rlEngine}
   */
  var insertHelloWorldDemo = function(containerId, engineName, engineWidth, engineHeight, helloText, speedx, speedy, fgCycle, bgCycle, charJitter, activationDelay) 
  {
    var width = engineWidth;
    var height = engineHeight;
    var jitter = charJitter;        
    var myEngine = new rlEngine(containerId, engineName, true, width, height);
    myEngine.changeLUPS(32);
    
    var colC64 = rlColors.getPalette("C64");
                    
    var state = { x: width/2, y: height/2, sx: speedx, sy: speedy, c:0, b:15, p: [] };
    
    var textToDisplay = helloText;
    var i,j;
    for(i = 0; i < textToDisplay.length; i++)
    {
      state.p.push({ x: state.x, y: state.y, sx: state.sx, sy: state.sy, c: 0, active: false });
    }
    i=0;    
    myEngine.onUpdateLogic = function(tick) 
    {    
      for(j=0; j<textToDisplay.length; j++)
      { 
        if(state.p[j].active)
        {                     
          state.p[j].x += state.p[j].sx;
          state.p[j].y += state.p[j].sy;
          if(state.p[j].x < 0 || state.p[j].x >= width)
            state.p[j].sx = -state.p[j].sx;
          if(state.p[j].y < 0 || state.p[j].y >= height)
            state.p[j].sy = -state.p[j].sy;
            
          if(tick % fgCycle == 0)
          {  
            state.p[j].c++;
            if(state.p[j].c>15) state.p[j].c = 0;
          }
        }
      }
      
      if(tick % fgCycle == 0)
      {
        state.c++;
        if(state.c>15) state.c = 0; 
      }
        
      if(tick % bgCycle == 0)
      {
        state.b--;
        if(state.b<0) state.b = 15;
      }
       
      if(tick % activationDelay == 0 && i<textToDisplay.length)
      { 
        state.p[i].active = true;
        i++;  
      }                          
    };
          
    myEngine.onUpdateViews = function(GL, G2D, time)
    {  
      if(GL == null || G2D == null)
        return;                                
    
      GL.clearColor(colC64[state.b].r,/* test comment for rlScriptShrink */ colC64[state.b].g,colC64[state.b].b, 1.0);
      GL.clear(GL.COLOR_BUFFER_BIT);
    
      G2D.clearRect(0,0,width,height);
      G2D.font = "bold 32px Lucida Console"; // another test comment for rlScriptShrink
      G2D.textAlign = "center";
      G2D.textBaseline = "middle";
      G2D.shadowBlur = 0;
                   
      // var jx = 0; ok lets have one more test comment 
      /* and another one for thorough testing
      var jy = 0; */
      
      var jx = 0;
      var jy = 0;  
      for(j=0; j<textToDisplay.length; j++)
      {                               
        if(jitter > 0.0)
        {
          jx = -jitter + /* yet // another */ /* test comment for rlScriptShrink */ Math.random()*jitter*2;
          jy = -jitter + Math.random()*jitter*2; 
        }
        G2D.fillStyle = colC64[ state.p[j].c].htmlCode;
        G2D.fillText(textToDisplay.charAt(j), state.p[j].x+jx, state.p[j].y+jy);
      }
    };
    
    myEngine.togglePause();
    return myEngine;
  };  

  return {
    insertHelloWorldDemo: insertHelloWorldDemo
  };
}();