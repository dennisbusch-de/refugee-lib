// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Graphics functions.   
 * contains: {@link rlG}  
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
   * @param {WebGLContextAttributes} [glContextAttributes] [WebGLContextAttributes]{@link https://www.khronos.org/registry/webgl/specs/1.0/#5.2} 
   * @returns {WebGLRenderingContext|null} a webgl rendering context or null if none is available 
   */
  var getContextGL = function(canvas, glContextAttributes)
  { 
    var cv = (typeof canvas == "string") ? document.getElementById(canvas) : ( canvas instanceof HTMLCanvasElement ? canvas : null);  
  
    if(cv != null)
      return WebGLUtils.setupWebGL(cv, glContextAttributes);
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
  
  return {
    createCanvas: createCanvas, 
    getContextGL: getContextGL,
    getContext2D: getContext2D
  };
}();