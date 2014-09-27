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
    
    var pal = rlColors.getPalette("C64");
                    
    var state = { x: width/2, y: height/2, sx: speedx, sy: speedy, c:0, b:pal.length-1, p: [] };
    
    var textToDisplay = helloText;
    var i,j;
    for(i = 0; i < textToDisplay.length; i++)
    {
      state.p.push({ x: state.x, y: state.y, sx: state.sx, sy: state.sy, c: 0, active: false });
    }
    
    // for the logos
    var slmin = 15, slmax = 63, sgg = 1.1;
    state.p.push({ x: state.x, y: state.y, sx: -state.sx, sy: -state.sy, c: 0, active: false, s: 15, sg: 1.0/sgg });
    state.p.push({ x: state.x, y: state.y, sx: -state.sx, sy: state.sy, c: 0, active: false, s: 31, sg: sgg });
    state.p.push({ x: state.x, y: state.y, sx: state.sx, sy: -state.sy, c: 0, active: false, s: 63, sg: 1.0/sgg });
    
    i=0;    
    myEngine.onUpdateLogic = function(tick) 
    {    
      for(j=0; j<state.p.length; j++)
      { 
        if(state.p[j].active)
        {                     
          state.p[j].x += state.p[j].sx;
          state.p[j].y += state.p[j].sy;
          if(state.p[j].x < 0 || state.p[j].x >= width)
            state.p[j].sx = -state.p[j].sx;
          if(state.p[j].y < 0 || state.p[j].y >= height)
            state.p[j].sy = -state.p[j].sy;
          
          if(j<textToDisplay.length) // letter ?
          {  
            if(tick % fgCycle == 0)
            {  
              state.p[j].c++;
              if(state.p[j].c>pal.length-1) state.p[j].c = 0;
            }
          }
          else // logo?
          {
            state.p[j].s *= state.p[j].sg;
            if(state.p[j].s <= slmin || state.p[j].s >= slmax)
              state.p[j].sg = 1.0/state.p[j].sg;
              
            if(tick % fgCycle == 0)
            {
              state.p[j].c++;
              if(state.p[j].c>pal.length-1) state.p[j].c = 0;
            }
          }
          
        }
      }
      
      if(tick % fgCycle == 0)
      {
        state.c++;
        if(state.c>pal.length-1) state.c = 0; 
      }
        
      if(tick % bgCycle == 0)
      {
        state.b--;
        if(state.b<0) state.b = pal.length-1;
      }
       
      if(tick % activationDelay == 0 && i<state.p.length)
      { 
        state.p[i].active = true;
        i++;  
      }                          
    };
          
    myEngine.onUpdateViews = function(GL, G2D, time)
    {  
      if(GL == null || G2D == null)
        return;                                
    
      GL.clearColor(pal[state.b].r, pal[state.b].g,pal[state.b].b, 1.0);
      GL.clear(GL.COLOR_BUFFER_BIT);
    
      G2D.clearRect(0,0,width,height);
      G2D.font = "bold 32px Lucida Console";
      G2D.textAlign = "center";
      G2D.textBaseline = "middle";
      G2D.shadowBlur = 0;
        
      var jx = 0;
      var jy = 0;  
      for(j=0; j<state.p.length; j++)
      {                               
        if(jitter > 0.0)
        {
          jx = -jitter + Math.random()*jitter*2;
          jy = -jitter + Math.random()*jitter*2; 
        }
        
        if(j<textToDisplay.length) // letter?
        {
          G2D.fillStyle = pal[ state.p[j].c].htmlCode;
          G2D.fillText(textToDisplay.charAt(j), state.p[j].x+jx, state.p[j].y+jy);
        }
        else // logo?
        { 
          rlG.drawRefugeeLibLogo(G2D, Math.round(state.p[j].x+jx-state.p[j].s/2), Math.round(state.p[j].y+jy-state.p[j].s/2), 
                                 state.p[j].s, state.p[j].s, pal[(state.b+pal.length/2)%pal.length].htmlCode, pal[state.p[j].c].htmlCode);  
        }
      }
    };
    
    myEngine.togglePause();
    return myEngine;
  };  

  return {
    insertHelloWorldDemo: insertHelloWorldDemo
  };
}();