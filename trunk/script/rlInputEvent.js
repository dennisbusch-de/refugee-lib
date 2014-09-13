// -----------------------------------------------------------------------------
// Refugee Lib - WIP
// input event info for rlEngine
// 
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

var rlInputEvent = function()
{
  var createMouseKeyboardEvent = function(type, tick, rx, ry, cx, cy, inside, buttons, keys, rlKeyId, up)
  {
    return { type: type, tick: tick, rx: rx, ry: ry, cx: cx, cy: cy, inside: inside, 
             buttons: cloneMouseButtonState(buttons), 
             keys: cloneKeyState(keys), rlKeyId: rlKeyId, up : up };
  };
  
  var createEmptyMouseKeyboardEvent = function()
  {
    return createMouseKeyboardEvent("mke", 0, 0, 0, 0, 0, false, 
                                    createEmptyMouseButtonState(),  
                                    createEmptyKeyState(), "Unknown", false);
  };
  
  var createEmptyMouseButtonState = function()
  {
    return { left: false, middle: false, right: false, wheelDown: false, wheelUp: false  };
  };
  
  var translateMouseButtonId = function(id)
  {
    if(id == 0)
      return "left";
    if(id == 1)
      return "middle";
    if(id == 2)
      return "right";
  };
  
  var cloneMouseButtonState = function(buttons)
  {
    return { left: buttons.left, middle: buttons.middle, right: buttons.right,
             wheelDown: buttons.wheelDown, wheelUp: buttons.wheelUp  };
  };
  
  var createEmptyKeyState = function()
  {
    return [ 0, 0 ];
  };
  
  var cloneKeyState = function(state)
  {
    return [ state[0], state[1] ];
  };
  
  return {
    createMouseKeyboardEvent: createMouseKeyboardEvent,
    createEmptyMouseKeyboardEvent: createEmptyMouseKeyboardEvent,
    createEmptyMouseButtonState: createEmptyMouseButtonState,
    translateMouseButtonId: translateMouseButtonId,
    createEmptyKeyState: createEmptyKeyState,
    cloneKeyState: cloneKeyState,
    setKeyState: rlKeys.setKeyState,
    clearKeyState: rlKeys.clearKeyState,
    checkClearModKeyState : rlKeys.checkClearModKeyState,
    getKeyState: rlKeys.getKeyState
  };
}();