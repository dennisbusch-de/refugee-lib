// -----------------------------------------------------------------------------
// Refugee Lib
/** 
 * @file DOM manipulation functions.  
 * contains: {@link rlUtilsDOM}  
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
var rlUtilsDOM = function()
{
  /** 
   * Determine the client rectangle of an element inside a document. 
   * @see [Element]{@link https://developer.mozilla.org/en/docs/Web/API/Element}   
   * @memberof rlUtilsDOM 
   * @function 
   * @param {Element} element the document element for which to determine the client rectangle    
   * @returns {rlMath.rectangle2D}
   */
  var getClientRect = function(element)
  { 
    var x = 0;
    var y = 0;
    var next = element;
    do                        
    {
      x += next.clientLeft + next.offsetLeft;
      y += next.clientTop + next.offsetTop; 
      
      next = (typeof next.offsetParent != "undefined") ? next.offsetParent: null;
    } 
    while(next != null);
    
    var rx = x + element.clientWidth - 1;
    var by = y + element.clientHeight - 1;
    
    return { left: x, top: y, right: rx, bottom: by };
  };
    
  return {
    getClientRect: getClientRect
  };
}();