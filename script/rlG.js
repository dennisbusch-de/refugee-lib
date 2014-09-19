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
    if(typeof canvas == "string")
      return WebGLUtils.setupWebGL(document.getElementById(canvas));
    if(typeof canvas == "object")
      return WebGLUtils.setupWebGL(canvas);    
  };
  
  /** 
   * Get the 2D rendering context for a given Canvas. 
   * @see [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D} | [HTMLCanvasElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement}   
   * @memberof rlG 
   * @function
   * @param {string|HTMLCanvasElement} canvas a DOM id of a &lt;canvas&gt; or a HTMLCanvasElement    
   * @returns {CanvasRenderingContext2D|null} a 2D rendering context or null if none is available 
   */
  var getContext2D = function(canvas)
  {
    if(typeof canvas == "string")
      return document.getElementById(canvas).getContext("2d");
    if(typeof canvas == "object")
      return canvas.getContext("2d");
  };   
   
  /** (not an actual type, use object literals with these properties)
   * @typedef rgb
   * @memberof rlG
   * @property {number} r red component (0.0 to 1.0)
   * @property {number} g green component (0.0 to 1.0)
   * @property {number} b blue component (0.0 to 1.0)
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
  
  return {
    createCanvas: createCanvas, 
    getContextGL: getContextGL,
    getContext2D: getContext2D,
    colorHTMLtoRGB: colorHTMLtoRGB,
    colorRGBtoHTML: colorRGBtoHTML
  };
}();

/** (not an actual type, use object literals with these properties)
 * @typedef namedColor
 * @memberof rlPalette
 * @property {string} name the name to use for the color, e.g. "fullWhite"
 * @property {string} htmlCode the html code defining the color, e.g. "#FFFFFF"
 */

/**
 * Instantiates a named palette with a given array of named colors and adds each
 * of those colors as a property of the same name to itself, as well as linking the color
 * to an index number, so a color in the palette can be accessed by both its name and by its index.
 * Also initializes red, green and blue componenents from the given htmlCode of each named color.
 * So, a color in the palette is accessed as e.g. p["black"] or p[0] and each color in the palette
 * has the properties: name, index, htmlCode, r, g and b     
 * @constructor
 * @param {string} name the name of the palette
 * @param {rlPalette.namedColor[]} colors the array of color definitions to put into the palette
 */
var rlPalette = function(name, colors ) // colors as array of { name, htmlCode } pairs
{
  // inherit all of rlObject
  rlObject.call(this);
  this.__proto__.rlType = "rlPalette";

  this.name = name;    

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
  }   
};

/**
 * Builtin, ready-to-use color definitions.
 * @namespace
 */
var rlColors = function()
{
  // colors hexcodes borrowed from http://www.pepto.de/projects/colorvic/
  var paletteC64 = new rlPalette("C64",
                                 [ { name: "black",       htmlCode: "#000000" }, 
                                   { name: "white",       htmlCode: "#FFFFFF" }, 
                                   { name: "red",         htmlCode: "#68372B" }, 
                                   { name: "cyan",        htmlCode: "#70A4B2" },
                                   { name: "purple",      htmlCode: "#6F3D86" }, 
                                   { name: "green",       htmlCode: "#588D43" }, 
                                   { name: "blue",        htmlCode: "#352879" }, 
                                   { name: "yellow",      htmlCode: "#B8C76F" },
                                   { name: "orange",      htmlCode: "#6F4F25" }, 
                                   { name: "brown",       htmlCode: "#433900" }, 
                                   { name: "light red",   htmlCode: "#9A6759" }, 
                                   { name: "dark grey",   htmlCode: "#444444" },
                                   { name: "grey",        htmlCode: "#6C6C6C" }, 
                                   { name: "light green", htmlCode: "#9AD284" }, 
                                   { name: "light blue",  htmlCode: "#6C5EB5" }, 
                                   { name: "light grey",  htmlCode: "#959595" } ]);
  
  var paletteIndex = {};
  paletteIndex[paletteC64.name] = paletteC64;
    
  /** 
   * Get one of the built-in palettes of **Refugee Lib**.
   * valid palette names are: "C64" (yep, just that one at this early dev stage)
   * @see [C64 palette at pepto.de]{@link http://www.pepto.de/projects/colorvic/}   
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
    c.fillStyle = "#FFFFFF";
    c.strokeStyle = "#000000";
    c.lineWidth = 1.0;
    c.beginPath();
    c.moveTo(0,0);
    c.lineTo(0,height*1.0);
    c.lineTo(width*0.375, height*0.59375);
    c.lineTo(width*0.75, height*1.0);
    c.lineTo(width*1.0, height*0.75);
    c.lineTo(width*0.625, height*0.40625);
    c.lineTo(width*1.0, 0);
    c.closePath();
    c.fill();
    c.stroke();
 
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
  var defCursorSideLength = 16;
  
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