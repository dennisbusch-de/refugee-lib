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

var rlG = function() 
{
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
    
    container.appendChild(c);
    return c;  
  };

  var getContextGL = function(canvas)
  {
    if(typeof canvas == "string")
      return WebGLUtils.setupWebGL(document.getElementById(canvas));
    if(typeof canvas == "object")
      return WebGLUtils.setupWebGL(canvas);    
  };

  var getContext2D = function(canvas)
  {
    if(typeof canvas == "string")
      return document.getElementById(canvas).getContext("2d");
    if(typeof canvas == "object")
      return canvas.getContext("2d");
  };   
  
  var colorHtmlToRGB = function(htmlCode) 
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
  
  return {
    createCanvas: createCanvas, 
    getContextGL: getContextGL,
    getContext2D: getContext2D,
    colorHtmlToRGB: colorHtmlToRGB
  };
}();

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
    
    this[cname] = { name: cname, htmlCode: colors[i].htmlCode };
    var rgb = rlG.colorHtmlToRGB(colors[i].htmlCode);
    this[cname].r = rgb.r;
    this[cname].g = rgb.g;
    this[cname].b = rgb.b;
    this[i] = this[cname];
  }   
};

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
                                                           
  return {
    getPalette: function(name) { return paletteIndex[name]; }
  };  
}();

var rlCursors = function()
{
  var makeDefaultCursorImage = function(width, height)
  {         
    var ca = rlG.createCanvas(document.createElement("div"), "rlDefaultCursorCanvas", width, height, 1000, "1px", "solid", "#FF00FF");
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
  
  var defaultCursorImage = makeDefaultCursorImage(16,16);
     
  var remakeDefaultCursorImage = function(width, height)
  {
    defaultCursorImage = makeDefaultCursorImage(width || 16, height || 16);
    return defaultCursorImage;
  };
  
  var getDefaultCursorImage = function()
  {
    return defaultCursorImage; 
  };
  
  return {
    getDefaultCursorImage: getDefaultCursorImage,
    remakeDefaultCursorImage: remakeDefaultCursorImage
  };                                                                                                              
}();