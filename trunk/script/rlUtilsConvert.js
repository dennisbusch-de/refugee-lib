// -----------------------------------------------------------------------------
// Refugee Lib
/** 
 * @file Type conversion functions.  
 * contains: {@link rlUtilsConvert}  
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
var rlUtilsConvert = function()
{
  /** 
   * Convert a 32bit number to a string containing 32 characters: a 1 for each set bit and a 0 for each unset bit.  
   * e.g. 666 --> "00000000000000000000001010011010"  
   * -1337 --> "11111111111111111111101011000111"  
   * (the javascript number type is actually a 64bit floating point number, so if you pass in anything which is not integral and outside the 32bit range for signed integers, the result may contain unexpected bits)    
   * @memberof rlUtilsConvert 
   * @function i32ToBinaryString
   * @param {number} n the 32bit number to convert    
   * @returns {string} a string containing 32 chars, each char being either a 1 or a 0 or "NaN" if n was not a number
   */
  var i32tbs = function(n)
  { 
    var s = "";
    var i,j;
    if(typeof n == "number")
    { 
      for(i=0; i<32; i++)
        s = ((n>>i & 1 == 1)?"1":"0")+s;
    }
    else
      s = "NaN";  
          
    return s;
  };
  
  /**
   * Like n.toString(radix) but fills up zeroes on the left until resulting string is at least as long as the given minLength.
   * @memberof rlUtilsConvert
   * @function nToMinLengthString
   * @param {Number} n the number to convert
   * @param {Number} radix to be passed to n.toString
   * @param {Number} minLength the minimum length of the resulting string
   * @returns {string}
   */
   var nToMLS = function(n, radix, minLength)
   {
     var r = n.toString(radix);
     while(r.length < minLength)
       r = "0"+r;
     return r;
   };
    
  return {
    i32ToBinaryString: i32tbs,
    nToMinLengthString: nToMLS
  };
}();