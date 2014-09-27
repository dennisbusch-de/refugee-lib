// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Graphics functions.   
 * contains: {@link rlG} | {@link rlPalette} | {@link rlColors} | {@link rlCursors}  
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
 * @namespace 
 */
var rlG = function() 
{
  /** 
   * Create and optionally insert a Canvas element into the given DOM container element.
   * @see [Element]{@link https://developer.mozilla.org/en/docs/Web/API/element} | [HTMLCanvasElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement}    
   * @memberof rlG 
   * @function
   * @param {Element|null} container the Element into which to insert the created Canvas or null to create a stand-alone canvas
   * @param {string} idCanvas the desired id to use for the &lt;canvas&gt; within the DOM
   * @param {number} width the width of the Canvas in pixels
   * @param {number} height the height of the Canvas in pixels
   * @param {number} zIndex the zIndex of the Canvas
   * @param {string} borderWidth width of the border, e.g. "2px"       
   * @param {string} borderStyle style of the border, e.g. "solid", "dotted"
   * @param {string} borderColor color of the border, e.g. "#100381"
   * @returns {HTMLCanvasElement} the created Canvas
   */
  var createCanvas = function(container, idCanvas, width, height, zIndex, borderWidth, borderStyle, borderColor)
  {
    var c = document.createElement("canvas");
    c.id = idCanvas;
    c.width = width;
    c.height = height;
    
    c.style.zIndex = zIndex;
    c.style.position = "absolute";
    c.style.left = "0px";
    c.style.top = "0px";
    c.style.borderWidth = borderWidth;
    c.style.borderStyle = borderStyle;
    c.style.borderColor = borderColor;
    
    if(container != null)
      container.appendChild(c);
      
    return c;  
  };
     
  
  /** 
   * Get the webgl rendering context for a given Canvas. 
   * @see [WebGLRenderingContext]{@link https://developer.mozilla.org/en/docs/Web/API/WebGLRenderingContext} | [HTMLCanvasElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement}   
   * @memberof rlG 
   * @function
   * @param {string|HTMLCanvasElement} canvas a DOM id of a &lt;canvas&gt; or a HTMLCanvasElement    
   * @returns {WebGLRenderingContext|null} a webgl rendering context or null if none is available 
   */
  var getContextGL = function(canvas)
  { 
    var cv = (typeof canvas == "string") ? document.getElementById(canvas) : ( canvas instanceof HTMLCanvasElement ? canvas : null);  
  
    if(cv != null)
      return WebGLUtils.setupWebGL(cv);
    else
      return null;    
  };
  
  /** 
   * Get the 2D rendering context for a given Canvas (with imageSmoothingEnabled = false). 
   * @see [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D} | [HTMLCanvasElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement}   
   * @memberof rlG 
   * @function
   * @param {string|HTMLCanvasElement} canvas a DOM id of a &lt;canvas&gt; or a HTMLCanvasElement    
   * @returns {CanvasRenderingContext2D|null} a 2D rendering context or null if none is available 
   */
  var getContext2D = function(canvas)
  {         
    var cv = (typeof canvas == "string") ? document.getElementById(canvas) : ( canvas instanceof HTMLCanvasElement ? canvas : null);
  
    if(cv != null)
    {  
      var c = cv.getContext("2d");
      c.imageSmoothingEnabled = false; 
      return c;
    }
    else
      return null;
  };   
   
  /** (not an actual type, use object literals with these properties)
   * @typedef rgb
   * @memberof rlG
   * @property {number} r red component (0.0 to 1.0)
   * @property {number} g green component (0.0 to 1.0)
   * @property {number} b blue component (0.0 to 1.0)
   */
   
  /** (not an actual type, use object literals with these properties)
   * @typedef ypbpr
   * @memberof rlG
   * @property {number} y luma
   * @property {number} pb difference between blue and luma 
   * @property {number} pr difference between red and luma 
   */ 
  
  /** 
   * Convert an HTML color string to an [rgb]{@link rlG.rgb} triplet.    
   * @memberof rlG
   * @function
   * @param {string} htmlCode the html color string to convert, e.g. "#234266"    
   * @returns {rlG.rgb}
   */
  var colorHTMLtoRGB = function(htmlCode) 
  {
    var r,g,b;
    if (htmlCode.charAt(0) == '#') 
    {
      htmlCode = htmlCode.substr(1);
    }

    r = parseInt(htmlCode.substr(0,2), 16) / 255;
    g = parseInt(htmlCode.substr(2,2), 16) / 255;
    b = parseInt(htmlCode.substr(4,2), 16) / 255;
    return { r: r, g: g, b: b };
  };
   
  /** 
   * Convert an [rgb]{@link rlG.rgb} triplet to an HTML color string.    
   * @memberof rlG
   * @function
   * @param {rlG.rgb} rgb the triplet to convert, e.g. { r: 0.13, g: 0.37, b: 0.42 }   
   * @returns {string}
   */
  var colorRGBtoHTML = function(rgb)
  {
    var h = "#", t = "", n = 0, pa = ["r","g","b"];
    for(p in pa)
    {
      n = rgb[pa[p]];
      n = (n < 0.0) ? 0.0 : ( (n > 1.0) ? 1.0 : n );  
      t = Math.floor(n*255).toString(16).toUpperCase();
      t = (t.length == 1 ? "0" : "")+t;
      h += t;
    }
    return h;
  };
    
  /**
   * Convert an [rgb]{@link rlG.rgb} triplet to a [ypbpr]{@link rlG.ypbpr} triplet.
   * @memberof rlG
   * @function
   * @param {rlG.rgb} rgb the triplet to convert, e.g. { r: 0.10, g: 0.03, b: 0.81 }
   * @returns {rlG.ypbpr}
   */
  var colorRGBtoYPBPR = function(rgb)
  {
    return {  y:     0.299 * rgb.r +     0.587 * rgb.g +     0.114 * rgb.b, 
             pb: -0.168736 * rgb.r + -0.331264 * rgb.g +       0.5 * rgb.b,
             pr:       0.5 * rgb.r + -0.418688 * rgb.g + -0.081312 * rgb.b };
  };
  
  /**
   * Convert a [ypbpr]{@link rlG.ypbpr} triplet to an [rgb]{@link rlG.rgb} triplet.
   * @memberof rlG
   * @function
   * @param {rlG.ypbpr} ypbpr the triplet to convert
   * @returns {rlG.rgb}
   */
  var colorYPBPRtoRGB = function(ypbpr)
  {
    return { r: ypbpr.y +                            1.402 * ypbpr.pr, 
             g: ypbpr.y + -0.344136 * ypbpr.pb + -0.714136 * ypbpr.pr,
             b: ypbpr.y +     1.772 * ypbpr.pb };
  };
  
  /**
   * Convert a [ypbpr]{@link rlG.ypbpr} triplet to an HTML color string.
   * @memberof rlG
   * @function
   * @param {rlG.ypbpr} ypbpr the triplet to convert
   * @returns {string}
   */
  var colorYPBPRtoHTML = function(ypbpr)
  {
    return colorRGBtoHTML(colorYPBPRtoRGB(ypbpr));
  };
  
  /**
   * Convert an HTML color string to a [ypbpr]{@link rlG.ypbpr} triplet.
   * @memberof rlG
   * @function
   * @param {string} htmlCode the html color string to convert, e.g. "#234266"
   * @returns {rlG.ypbpr}
   */
  var colorHTMLtoYPBPR = function(htmlCode)
  {
    return colorRGBtoYPBPR(colorHTMLtoRGB(htmlCode));
  };
   
  /**
   * Draw a polygon (defined as an array of 2-element arrays describing points in 2D cartesian space where each coordinate is normalized ranging from 0.0 to 1.0) in arbitrary width, height and colors. 
   * @memberof rlG 
   * @function
   * @param {CanvasRenderingContext2D} G2D the 2D canvas context to use for drawing
   * @param {_pointsarray_} points e.g [ [0.0,0.0],[0.5,0.0],[1.0,1.0] ] (would define a triangle)
   * @param {number} sx the left pixel column at which to start drawing
   * @param {number} sy the upper pixel row at which to start drawing
   * @param {number} width the width in pixels to draw
   * @param {number} height the height in pixels to draw
   * @param {string|null} colF html color code for the fill color (null to disable filling)
   * @param {string|null} colS html color code for the stroke color (null to disable stroke drawing)
   * @param {number} [lineWidth=1.0] the width of the stroke in pixels
   */
  var drawNormalizedPolygon = function(G2D, points, sx, sy, width, height, colF, colS, lineWidth)
  {
    G2D.fillStyle = colF != null ? colF : "#FFFFFF";
    G2D.strokeStyle = colS != null ? colS : "#000000";
    G2D.lineWidth = typeof lineWidth != "undefined" ? lineWidth : 1.0;
    
    G2D.beginPath();
    var p = 0;
    var off = 0.5; // offset to pixel center relative to a pixels upper left corner
    var w =  width - off;
    var h = height - off;
    for(p=0; p<points.length; p++)
    {
      if(p==0)
        G2D.moveTo(Math.floor(sx+points[p][0]*w)+off,Math.floor(sy+points[p][1]*h)+off);
      else
      {
        G2D.lineTo(Math.floor(sx+points[p][0]*w)+off,Math.floor(sy+points[p][1]*h)+off);
      }
    }
    
    G2D.closePath();
    
    if(colF != null)
      G2D.fill();
      
    if(colS != null)
      G2D.stroke(); 
  };
  
  /**
   * Draw the **Refugee Lib** logo.
   * @memberof rlG
   * @function
   * @param {CanvasRenderingContext2D} G2D the 2D canvas context to use for drawing
   * @param {number} sx the left pixel column at which to start drawing
   * @param {number} sy the upper pixel row at which to start drawing
   * @param {number} width the width in pixels to draw
   * @param {number} height the height in pixels to draw
   * @param {string} colA html color code for the base shape color
   * @param {string} colB html color code for the letters color    
   */
  var drawRefugeeLibLogo = function(G2D, sx, sy, width, height, colA, colB) 
  {
    var data = rlCore.getLogoData();
    var p = 0;
    for(p=0; p<data.length; p++)
      drawNormalizedPolygon(G2D, data[p], sx, sy, width, height, p % 2 == 0 ? colA : colB, p % 2 == 0 ? colA : colB, 1.0);
  };  
  
  return {
    createCanvas: createCanvas, 
    getContextGL: getContextGL,
    getContext2D: getContext2D,
    colorHTMLtoRGB: colorHTMLtoRGB,
    colorRGBtoHTML: colorRGBtoHTML,
    colorRGBtoYPBPR: colorRGBtoYPBPR,
    colorYPBPRtoRGB: colorYPBPRtoRGB,
    colorYPBPRtoHTML: colorYPBPRtoHTML,
    colorHTMLtoYPBPR: colorHTMLtoYPBPR,
    drawNormalizedPolygon: drawNormalizedPolygon,
    drawRefugeeLibLogo: drawRefugeeLibLogo
  };
}();

/** (not an actual type, use object literals with these properties)
 * @typedef namedColor
 * @memberof rlPalette
 * @property {string} name the name to use for the color, e.g. "fullWhite"
 * @property {string} htmlCode the html code defining the color, e.g. "#FFFFFF"
 * @property {number} [r=converted from htmlCode] the red component of a palette entry
 * @property {number} [g=converted from htmlCode] the green component of a palette entry
 * @property {number} [b=converted from htmlCode] the blue component of a palette entry
 */

/**
 * Instantiates a named palette with a given array of named colors and adds each
 * of those colors as a property of the same name to itself, as well as linking the color
 * to an index number, so a color in the palette can be accessed by both its name and by its index.
 * Also initializes red, green and blue componenents from the given htmlCode of each named color.
 * So, a color in the palette is accessed as e.g. p["black"] or p[0] and each color in the palette
 * has the properties: name, index, htmlCode, r, g and b     
 * @constructor
 * @param {string} paletteName the name of the palette
 * @param {rlPalette.namedColor[]|null} namedColors the array of color definitions to put into the palette (set to null to use the following parameter instead)
 * @param {string} [colNameCodePairs] comma separated string with pairs of names and htmlcodes of colors eg. "black#000000,white#FFFFFF" (ignored if namedColors is used)
 */
var rlPalette = function(paletteName, namedColors, colNameCodePairs)
{
  // inherit all of rlObject
  rlObject.call(this);
  this.__proto__.rlType = "rlPalette";
    
  /**
   * @property {string} name the name of the palette
   */
  this.name = paletteName;
  /** 
   * @property {number} length the number of colors stored inside the palette
   */
  this.length = 0;
  
  /**
   * Get a color by its name or index (same as using **this[nameOrIndex]** ). 
   * @function 
   * @property {string|number} nameOrIndex e.g. "white" or 15
   * @returns {rlPalette.namedColor} the requested palette entry
   */
  this.getColor = function(nameOrIndex)
  {
    return this[nameOrIndex];
  }; 
  
  var colors = [];
  if(namedColors != null)
  {
    colors = namedColors;
  }
  else
  {
    var c = 0;
    var namesAndCodes = colNameCodePairs.split(",");
         
    for(c=0; c<namesAndCodes.length; c++)
    {
      var pair = namesAndCodes[c].split("#");
      colors.push( { name: pair[0].trim(), htmlCode: "#"+pair[1].trim() } );
    }   
  }    

  var i = 0;
  for(i=0; i<colors.length; i++)
  { 
    var cname = ""+i;
    if(typeof colors[i].name != "undefined")
      cname = colors[i].name; 
    
    this[cname] = { name: cname, index: i, htmlCode: colors[i].htmlCode };
    var rgb = rlG.colorHTMLtoRGB(colors[i].htmlCode);
    this[cname].r = rgb.r;
    this[cname].g = rgb.g;
    this[cname].b = rgb.b;
    this[i] = this[cname];
    
    this.length++;
  }   
};

/**
 * Builtin, ready-to-use color definitions (all trademarks are the property of their respective owners).
 * @namespace
 */
var rlColors = function()
{
  // C64 colors hexcodes borrowed from http://www.pepto.de/projects/colorvic/
  var palettes = [ new rlPalette("AMSTRADCPC", null,
                     "black#000000,blue#000091,bright blue#0000FF,"+
                     "red#910000,magenta#910091,violet#9100FF,"+
                     "bright red#FF0000,purple#FF0091,bright magenta#FF00FF,"+
                     "green#009100,cyan#009191,sky blue#0091FF,"+
                     "yellow#919100,grey#919191,pale blue#9191FF,"+
                     "orange#FF9100,pink#FF9191,pale magenta#FF91FF,"+
                     "bright green#00FF00,sea green#00FF91,bright cyan#00FFFF,"+
                     "lime green#91FF00,pale green#91FF91,pale cyan#91FFFF,"+
                     "bright yellow#FFFF00,pale yellow#FFFF91,white#FFFFFF"),
                   new rlPalette("APPLEII", null, 
                     "black#040204,magenta#7C3A54,dark blue#54468C,purple#DC4EF4,"+
                     "dark green#1C6A54,grey 1#949294,medium blue#34A6F4,light blue#CCC2FC,"+
                     "brown#545E0C,orange#DC7A1C,grey 2#949294,pink#ECB6CC,"+
                     "green#34CE1C,yellow#CCD29C,aqua#A4DECC,white#FCFEFC"),
                   new rlPalette("C64", null, 
                     "black#000000,white#FFFFFF,red#68372B,cyan#70A4B2,purple#6F3D86,"+
                     "green#588D43,blue#352879,yellow#B8C76F,orange#6F4F25,"+
                     "brown#433900,light red#9A6759,dark grey#444444,grey#6C6C6C,"+
                     "light green#9AD284,light blue#6C5EB5,light grey#959595"),
                   new rlPalette("CGA", null,
                     "black#000000,low blue#0000B7,low green#00B700,low cyan#00B7B7,"+
                     "low red#B70000,low magenta#B700B7,brown#B76800,light grey#B7B7B7,"+
                     "dark grey#686868,high blue#6868FF,high green#68FF68,high cyan#68FFFF,"+
                     "high red#FF6868,high magenta#FF68FF,yellow#FFFF68,white#FFFFFF"),  
                   new rlPalette("GB", null, 
                     "black#000000,dark grey#505050,light grey#A0A0A0,white#FFFFFF"),
                   new rlPalette("MSX", null,
                     "transparent#000000,black#000000,medium green#3EB849,light green#74D07D,"+
                     "dark blue#5955E0,light blue#8076F1,dark red#B95E51,cyan#65DBEF,"+
                     "medium red#DB6559,light red#FF897D,dark yellow#CCC35E,light yellow#DED087,"+
                     "dark green#3AA241,magenta#B766B5,grey#CCCCCC,white#FFFFFF"),
                   new rlPalette("TELETEXT", null, 
                     "black#000000,blue#0000FF,green#00FF00,cyan#00FFFF,"+
                     "red#FF0000,purple#FF00FF,yellow#FFFF00,white#FFFFFF"),
                   new rlPalette("TO70/7", null,
                     "black#000000,red#FF0000,green#00FF00,yellow#FFFF00,blue#0000FF,"+
                     "purple#FF00FF,cyan#00FFFF,white#FFFFFF,grey#BBBBBB,"+
                     "pale red#DD7777,pale green#77DD77,pale yellow#DDDD77,pale blue#7777DD,"+
                     "pale purple#DD77EE,pale cyan#BBFFFF,orange#EEBB00"),
                   new rlPalette("VIC20", null, 
                     "black#000000,white#FFFFFF,red#782922,cyan#87D6DD,"+
                     "purple#AA5FB6,green#55A049,blue#40318D,yellow#BFCE72,"+
                     "orange#AA7449,light orange#EAB489,light red#B86962,light cyan#C7FFFF,"+
                     "light purple#EA9FF6,light green#94E089,light blue#8071CC,light yellow#FFFFB2"),
                   new rlPalette("ZXSPECTRUM", null,
                     "black#000000,basic blue#000080,basic red#800000,basic magenta#800080,"+
                     "basic green#008000,basic cyan#008080,basic yellow#808000,basic white#808080,"+
                     "black#000000,bright blue#0000FF,bright red#FF0000,bright magenta#FF00FF,"+
                     "bright green#00FF00,bright cyan#00FFFF,bright yellow#FFFF00,bright white#FFFFFF")
                 ];
                 
  var paletteIndex = {};
  
  var p = 0;
  for(p=0; p<palettes.length; p++)
    paletteIndex[palettes[p].name] = palettes[p];
    
  /** 
   * Get one of the built-in well-known palettes of **Refugee Lib**.
   * valid palette names are: AMSTRADCPC, APPLEII, C64, CGA, GB, MSX, TELETEXT, TO7/70, VIC20, ZXSPECTRUM  
   * @see [C64 palette at pepto.de]{@link http://www.pepto.de/projects/colorvic/} | [8bit computer palettes at wikipedia.org]{@link http://en.wikipedia.org/wiki/List_of_8-bit_computer_hardware_palettes}   
   * @memberof rlColors 
   * @function
   * @param {string} name the name of the palette to get    
   * @returns {rlPalette}
   */    
  var getPalette = function(name)
  {
    return paletteIndex[name];
  };
                                                     
  return {
    getPalette: getPalette
  };  
}();

/**
 * Builtin ready-to-use cursor definitions.
 * @namespace
 */
var rlCursors = function()
{
  var makeDefaultCursorImage = function(width, height)
  {         
    var ca = rlG.createCanvas(null, "rlDefaultCursorCanvas", width, height, 1000, "1px", "solid", "#FF00FF");
    ca.style.background = "transparent";
    
    var c = rlG.getContext2D(ca); 
    var points = [ [0.0,0.0],[0,0.75],[0.25,0.50],[0.75,1.00],[1.0,0.75],[0.50,0.25],[0.75,0.0] ];
    
    var p = 0;
    var w =  width - ( width & 1 == 1 ? 0.0 : 1.0);
    var h = height - (height & 1 == 1 ? 0.0 : 1.0);
    rlG.drawNormalizedPolygon(c, points, 0.0, 0.0, w, h, "#FFFFFF", "#000000", 1.0);
 
    var img = document.createElement("img");
    img.src = ca.toDataURL("image/png");   
        
    return img;    
  };
  
  /** 
   * @memberof rlCursors
   * @constant
   * @private 
   * @default
   */
  var defCursorSideLength = 18;
  
  var defaultCursorImage = makeDefaultCursorImage(defCursorSideLength, defCursorSideLength);
          
  /**
   * Remake the built-in default cursor image. Use this if you need a bigger default cursor.
   * @see [HTMLImageElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLImageElement}
   * @memberof rlCursors
   * @function
   * @param {number} width the width of the new cursor image in pixels
   * @param {number} height the height of the new cursor image in pixels   
   * @returns {HTMLImageElement}
   */
  var remakeDefaultCursorImage = function(width, height)
  {
    defaultCursorImage = makeDefaultCursorImage(width || defCursorSideLength, height || defCursorSideLength);
    return defaultCursorImage;
  };
  
  /**
   * Get the current built-in default cursor image.
   * @see [HTMLImageElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLImageElement}
   * @see [remakeDefaultCursorImage]{@link rlCursors.remakeDefaultCursorImage}
   * @memberof rlCursors
   * @function
   * @returns {HTMLImageElement}
   */
  var getDefaultCursorImage = function()
  {
    return defaultCursorImage; 
  };
  
  return {
    getDefaultCursorImage: getDefaultCursorImage,
    remakeDefaultCursorImage: remakeDefaultCursorImage
  };                                                                                                              
}();