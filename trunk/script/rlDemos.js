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
   * Instantiates and starts a simple Hello World {@link rlEngine} with moving, colorcycleing letters and an also colorcycleing background using the given palette and with the debug overlay turned off.
   * @see <a href="../rlTemplate_HelloWorld.html" target="blank">a live example using this function</a>
   * @memberof rlDemos
   * @function
   * @param {string} containerId as described in rlEngine constructor
   * @param {string} engineName as described in rlEngine constructor
   * @param {number} engineWidth as described in rlEngine constructor
   * @param {number} engineHeight as described in rlEngine constructor
   * @param {string} helloText the text to use for the moving letters
   * @param {string} paletteName the name of the well-known palette to use ( {@link rlColors} )
   * @param {number} speedx the initial horizontal speed for the moving letters
   * @param {number} speedy the initial vertical speed for the moving letters
   * @param {number} fgCycle the logic updates delay between cycleing colors for the letters 
   * @param {number} bgCycle the logic updates delay between cycleing colors for the background
   * @param {number} charJitter the maximum in pixels for a random letter displacement from its current position on each view update
   * @param {number} activationDelay the delay in logic updates before the next letter starts moving (they all start at the center of the view)
   * @returns {rlEngine}
   */
  var insertHelloWorldDemo = function(containerId, engineName, engineWidth, engineHeight, helloText, paletteName, speedx, speedy, fgCycle, bgCycle, charJitter, activationDelay) 
  {
    var width = engineWidth;
    var height = engineHeight;
    var jitter = charJitter;
    var showPalette = true;        
    var myEngine = new rlEngine(containerId, engineName, false, width, height, 
                                { alpha: true, depth: true, antialias: false }
                               );
    myEngine.changeLUPS(32);
    
    var palNames = rlColors.getPaletteNames();
    var palI = 0;
    var pal = rlColors.hasPalette(paletteName) ? rlColors.getPalette(paletteName) : rlColors.getPalette("CGA");
    for(palI=0; palI<palNames.length; palI++)
      if(palNames[palI] == pal.name)
        break;    
                        
    var state = { x: width/2, y: height/2, sx: speedx, sy: speedy, c:0, b:pal.length-1, p: [] };
    
    var textToDisplay = " "+helloText;
    var i,j;
    for(i = 0; i < textToDisplay.length; i++)
    {
      state.p.push({ x: state.x, y: state.y, sx: state.sx, sy: state.sy, c: 0, active: false });
    }
               
    // sound effects
    var effects = [];
    var et;
    for(et=0; et<4; et++)
      effects.push(rlSfxr.generateEffectAudio(et < 2 ? rlSfxr.noiseWave : rlSfxr.sineWave, 
        /*envAttack, envSustain, envPunch, envDecay*/ null, 0.3155, 0.414, 0.1991,
        /*freqBase, freqMinCutoff, freqSlide, freqDeltaSlide*/ et < 2 ? 1.0/(4-et) : 2.0/(6-et), null, -0.1705, null,
        /*vibDepth, vibSpeed*/ 0.3213, 0.1103,
        /*arpModFreq, arpModSpeed*/ null, null,
        /*dutyCycle, dutySweep*/ null, null,
        /*repeatSpeed*/  null,
        /*flangeOffset, flangeSweep*/ null, null,
        /*lpfCutoff, lpfCutoffSweep, lpfResonance*/ null, null, null,
        /*hpfCutoff, hpfCutoffSweep*/ null, null,
        /*sampleVolume, sampleRate, sampleBits*/ 0.2, 22050, 16,
        /*audioVolume*/ et < 2 ? 0.1 : 0.3
      ));
     
    // for the logos
    var slmin = 15, slmax = 63, sgg = 1.1;
    state.p.push({ x: state.x, y: state.y, sx: -state.sx, sy: -state.sy, c: 0, active: false, s: 15, sg: 1.0/sgg });
    state.p.push({ x: state.x, y: state.y, sx: -state.sx, sy: state.sy, c: 0, active: false, s: 31, sg: sgg });
    state.p.push({ x: state.x, y: state.y, sx: state.sx, sy: -state.sy, c: 0, active: false, s: 63, sg: 1.0/sgg });

    // for jitter
    var jx = 0;
    var jy = 0;
    
    // for speed vectors of follow up letters
    var dx = 0;
    var dy = 0;
    var dl = 0;    
    
    i=0; // for delayed object activation    
            
    var towardsMouse = false;
    var mx = 0, my = 0;
    
    // quick and dirty minimalistic tracker!
    // (with a short and shitty ToBeOnTop(C64) tribute loop :D ) 
    var effectTracks = [];
    var code = 0;
    //                 ,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....,,,,....
    effectTracks.push("/1234567890987654321/...1......................8*7654321.......................8*7654321................*...*...*......8*428*421...............................4*1.4*1.4*1.4*1.4*1.4*1.4*1.4*1.4*1.....8*......8*......8*....4*1.4*1.4*1.4*1.4*1.....4*1.4*1.4*1...........8*...........");
    effectTracks.push("0987654321/1234567890...1.......*.......*...*...*.......*...*...*.......*...*...*.......*...*...*.......*...*...*......4*...*1.................................4*1.4*1.4*1.4*1.4*1.4*1.4*1.4*1.4*1.....8*......8*......8*....4*1.4*1.4*1.4*1.4*1.....4*1.4*1.4*1...........8*...........");
    effectTracks.push("0987654321/1234567890...3...................*...............................*...............................................*...................5*4321.................................................................3*..................................................8*7654321....");
    effectTracks.push("/1234567890987654321/...3......................5*4321..........................5*4321...................................................................................................................................................................................................");
       
    var subTick = -1;
    var cTick = -1;
    var tSpeed = navigator.userAgent.toLowerCase().indexOf('firefox') != -1 ? 1 : 1;
    var tDelay = navigator.userAgent.toLowerCase().indexOf('firefox') != -1 ? 31.815 : 31.25;
    var infoCol = "#FFFFFF";
    var lastTS = rlCore.getTimestamp();
    var nowTS = rlCore.getTimestamp();
    
    var trackerUpdate = function(tick)
    {
      subTick++;
      cTick = subTick/tSpeed;
      if(subTick%tSpeed == 0)
      { 
        for(et=0; et<effectTracks.length; et++)
        {    
          if(effectTracks[et].charAt(cTick%effectTracks[et].length) == "*")
          {
            effects[et].currentTime = 0;
            effects[et].play();
          }
          
          code = effectTracks[et].charCodeAt(cTick%effectTracks[et].length);
          if(code > 46 && code < 58) // /,0..9
          {
            effects[et].volume = (code-47)*0.0125;
          }
        }
      }
    }
    
    var trackerTimer = rlLogicTimerWorker.createWorker("trackerTimer", false);
    trackerTimer.addEventListener("message", trackerUpdate, false);
    trackerTimer.postMessage(tDelay);
    trackerTimer.postMessage("start");
    
    myEngine.onUpdateLogic = function(tick) 
    {  
      for(j=0; j<state.p.length; j++)
      { 
        if(state.p[j].active)
        { 
          if(j==0 || j>=textToDisplay.length) // first letter or logo?
          {                         
            state.p[j].x += state.p[j].sx;
            state.p[j].y += state.p[j].sy;
            if(state.p[j].x < 0 || state.p[j].x >= width)
            {
              state.p[j].sx = -state.p[j].sx;
              if(typeof state.p[j].effect != "undefined" && j != 0)
              { 
                state.p[j].effect.currentTime = 0;
                state.p[j].effect.play();
              } 
            }
            if(state.p[j].y < 0 || state.p[j].y >= height)
            {
              state.p[j].sy = -state.p[j].sy;
              if(typeof state.p[j].effect != "undefined" && j != 0)
              {                          
                state.p[j].effect.currentTime = 0;
                state.p[j].effect.play();
              }
            }
          }
          
          if(j<textToDisplay.length) // follow-up letter ?
          {
            if(j>0)
            { 
              dx = state.p[j-1].x - state.p[j].x;
              dy = state.p[j-1].y - state.p[j].y;
              da = Math.sqrt(dx*dx + dy*dy); 
              state.p[j].x += da/activationDelay * dx / da;
              state.p[j].y += da/activationDelay * dy / da;
              
            }
            else if(j==0 && state.p[j].active && towardsMouse)
            {
              dx = mx - state.p[j].x;
              dy = my - state.p[j].y;
              da = Math.sqrt(dx*dx + dy*dy); 
              state.p[j].sx = dx / da*activationDelay;
              state.p[j].sy = dy / da*activationDelay;
            }
            
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
        if(i>0)
          state.p[i].c = (state.p[i-1].c+1) % pal.length; 
        i++;  
      }                          
    };
    
    var u,v;      
    myEngine.onUpdateViews = function(GL, G2D, time)
    {  
      if(GL == null || G2D == null)
        return;                                
    
      GL.clearColor(pal[state.b].r, pal[state.b].g, pal[state.b].b, 1.0);
      GL.clear(GL.COLOR_BUFFER_BIT);
      
      
      
    
      G2D.clearRect(0,0,width,height);
      G2D.shadowBlur = 0;
      
      G2D.font = "bold 32px Courier";
      G2D.textAlign = "center";
      G2D.textBaseline = "middle";
          
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
          rlG2D.drawRefugeeLibLogo(G2D, Math.round(state.p[j].x+jx-state.p[j].s/2), Math.round(state.p[j].y+jy-state.p[j].s/2), 
                                 state.p[j].s, state.p[j].s, pal[(Math.floor(state.b+pal.length/2))%pal.length].htmlCode, pal[state.p[j].c].htmlCode);  
        }
      }
      
      G2D.font = "normal 12px Courier";
      G2D.textAlign = "center";
      G2D.textBaseline = "middle";      
      G2D.fillStyle = rlColors.HTMLtoYPBPR(pal[state.b].htmlCode).y < 0.5 ? "#FFFFFF" : "#000000";
      G2D.fillText("palette(arrow left/right to change): "+palNames[palI], width/2, height-12);
      G2D.fillText("(P to toggle palette display)", width/2, height-24);
      
      // draw tracker info
      infoCol = G2D.fillStyle;
      G2D.fillStyle = "#FFFFA0";
      G2D.fillRect(width/2-effectTracks.length/2*12-6,60-6,effectTracks.length*12,12); 
      G2D.fillStyle = infoCol;
      for(u=0; u<effectTracks.length; u++)
      {
        for(v=-4; v<=4; v++)
        {
          if(v==0)
            G2D.fillStyle = "#4040FF";
          if(v==1)
            G2D.fillStyle = infoCol;
          G2D.fillText(effectTracks[u].charAt((cTick+v)%effectTracks[u].length), width/2 - 12*effectTracks.length/2+12*u, 60+v*12);
          
          if(u<2)
            G2D.fillRect(width/2-effectTracks.length/2*12-6-effects[u].volume*240,60-4*u,effects[u].volume*240,4);
          else
            G2D.fillRect(width/2+effectTracks.length/2*12-6,60-4*(u-2),effects[u].volume*240,4);
        } 
      }
      
      if(showPalette)
      {
        rlG2D.drawPalette(G2D, pal, width/2-(pal.length>15 ? 8 : pal.length/2)*8, height-44-(pal.length>16 ? Math.round(pal.length/16) : 1)*8, 8, 8, 16);
      }
    };
    
    myEngine.onInputEvent = function(pE, cE)
    { 
      var updatePal = false;
      if(rlInputEvent.isKeyDownEvent(pE,cE, "Right"))
      {
        palI = (palI + 1) % palNames.length;
        updatePal = true;
      }
      if(rlInputEvent.isKeyDownEvent(pE,cE, "Left"))
      {
        palI = ((palI - 1 < 0) ? palNames.length-1 : palI - 1);
        updatePal = true;
      }
      if(cE.buttons.left)
      {
        towardsMouse = true;
        mx = cE.cx;
        my = cE.cy;
      }
      else towardsMouse = false;
      
      if(cE.buttons.wheelDown)
      {
        tDelay -= 0.005;
        
        trackerTimer.postMessage(tDelay);
      }
      if(cE.buttons.wheelUp)
      {
        tDelay += 0.005;
        trackerTimer.postMessage(tDelay);
      }
      
      if(rlInputEvent.isKeyDownEvent(pE,cE, "LP"))
       showPalette = !showPalette;
      
      if(updatePal)
      {
        pal = rlColors.getPalette(palNames[palI]);
        state.b = state.b % pal.length;
        for(j=0; j<state.p.length; j++)
        {
          state.p[j].c = j % pal.length;
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