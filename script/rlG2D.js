// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Graphics functions to use with a [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D}.  
 * contains: {@link rlG2D}  
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
 * Graphics functions to use with a [CanvasRenderingContext2D]{@link https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D}. 
 * @namespace 
 */
var rlG2D = function() 
{
  /**
   * Draw a polygon (defined as an array of 2-element arrays describing points in 2D cartesian space where each coordinate is normalized ranging from 0.0 to 1.0) in arbitrary width, height and colors. 
   * @memberof rlG2D
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
   * @memberof rlG2D
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
    
  /**
   * Draw the given palette as a table of colored rectangles.
   * @memberof rlG2D
   * @function
   * @param {CanvasRenderingContext2D} G2D the 2D canvas context to use for drawing
   * @param {rlPalette} pal the palette to draw
   * @param {number} sx the left pixel column at which to start drawing
   * @param {number} sy the upper pixel row at which to start drawing 
   * @param {number} cw the column width for the table
   * @param {number} rh the row height for the table
   * @param {number} cpr the colors to display per row  
   */ 
  var drawPalette = function(G2D, pal, sx, sy, cw, rh, cpr)
  {
    var p=0;
    for(p=0; p<pal.length; p++)
    {
      G2D.fillStyle = pal[p].htmlCode;
      G2D.fillRect(sx + (p%cpr)*cw, sy + Math.floor(p/cpr)*rh, cw, rh);
    }
  };  
  
  return {
    drawNormalizedPolygon: drawNormalizedPolygon,
    drawRefugeeLibLogo: drawRefugeeLibLogo,
    drawPalette: drawPalette
  };
}();