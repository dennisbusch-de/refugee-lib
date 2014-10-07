// -----------------------------------------------------------------------------
// Refugee Lib
/** 
 * @file Mathematical functions.  
 * contains: {@link rlMath}  
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
var rlMath = function()
{
  /** 
   * Get a capped value from a source value.    
   * @memberof rlMath 
   * @function
   * @param {number} min the minimum     
   * @param {number} value the value to cap
   * @param {number} max the maximum
   * @returns {number} a number in the inclusive range [min, max]
   */
  var capValue = function(min, value, max)
  {
    return (value < min) ? min : ((value > max) ? max : value); 
  };
  
  /** 
   * Get a custom capper function which caps values from a source value or returns a capped default value.   
   * @memberof rlMath 
   * @function
   * @param {number} min the minimum
   * @param {number} max the maximum
   * @returns {function} the custom capper function which takes parameters(value, defaultValue) and caps to [min,max]
   */
  var getCapperFunction = function(min, max)
  {
    return new Function('value', 'defaultValue', 
      'var min = '+min+', max = '+max+'; '+
      'var v = value != null ? value : defaultValue; '+
      'return (v < min) ? min : ((v > max) ? max : v);');
  }; 
   
  /** (not an actual type, use object literals with these properties)  
   * Defines a point in 2D cartesian space where +x is to the right of and +y is below the origin.
   * @typedef point2D 
   * @memberof rlMath
   * @property {number} x value describing the position on the horizontal axis
   * @property {number} y value describing the position on the vertical axis
   */
  
  /** (not an actual type, use object literals with these properties)  
   * Defines a rectangle in 2D cartesian space (bottom >= top).
   * @typedef rectangle2D
   * @memberof rlMath
   * @property {number} left value describing the position of the left vertical side on the horizontal axis
   * @property {number} top value describing the position of the top horizontal side on the vertical axis
   * @property {number} right value describing the position of the right vertical side on the horizontal axis 
   * @property {number} bottom value describing the position of the bottom horizontal side on the vertical axis
   */ 
  
  /** 
   * Determine whether a given point in 2D cartesian space is in the area of a given rectangle in 2D cartesian space.    
   * @memberof rlMath 
   * @function
   * @param {rlMath.point2D} p2D the point to check  
   * @param {rlMath.rectangle2D} rect the rectangle to check
   * @returns {boolean} true if the point is within the rectangle area, false otherwise
   */
  var p2DinRect = function(p2D, rect)
  {
    return p2D.x >= rect.left && p2D.x <= rect.right && p2D.y >= rect.top && p2D.y <= rect.bottom;
  };
    
  /**
   * Same as {@link rlMath.p2DinRect} except the parameters are given as arrays whose indices implicitly define the point and rectangle properties.
   * @memberof rlMath
   * @function
   * @param {number[]} p2D the point to check as an array [x,y]
   * @param {number[]} rect the rectangle to check as an array [left,top,right,bottom]
   * @returns {boolean} 
   */
  var p2DinRectA = function(p2D, rect)
  {
    return p2D[0] >= rect[0] && p2D[0] <= rect[2] && p2D[1] >= rect[1] && p2D[1] <= rect[3];
  };
    
  return {
    capValue: capValue,
    getCapperFunction: getCapperFunction,
    p2DinRect: p2DinRect,
    p2DinRectA : p2DinRectA
  };
}();