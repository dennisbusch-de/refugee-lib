// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Cursor functions.   
 * contains: {@link rlCursors}  
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
    rlG2D.drawNormalizedPolygon(c, points, 0.0, 0.0, w, h, "#FFFFFF", "#000000", 1.0);
 
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