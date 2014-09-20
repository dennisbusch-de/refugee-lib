// -----------------------------------------------------------------------------
// Refugee Lib
/** 
 * @file Input event object management for {@link rlEngine}.  
 * contains: {@link rlInputEvent}  
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
 * Input event object management for {@link rlEngine} input events.
 * @namespace
 */
var rlInputEvent = function()
{
  /** (not an actual type, use object literals with these properties)  
   * each property is true if the corresponding mouse button or wheel state is set, false otherwise  
   * @typedef mouseButtonState
   * @memberof rlInputEvent
   * @property {boolean} left
   * @property {boolean} middle
   * @property {boolean} right
   * @property {boolean} wheelUp
   * @property {boolean} wheelDown
   */

  /** (not an actual type, use object literals with these properties)
   * @typedef mouseKeyboardEvent
   * @memberof rlInputEvent
   * @property {string} type the abbreviated type of the event ("md", "mu", "mw", "kd", "kp", "ku") (mousedown, mouseup, mousewheel, keydown, keypress, keyup)
   * @property {number} tick the logic tick the engine was at when the event occured
   * @property {number} rx position of the mouse on the horizontal axis relative to the leftmost pixel column of the engines view area  
   * @property {number} ry position of the mouse on the vertical axis relative to the topmost pixel row of the engines view area  
   * @property {number} cx same as rx but capped to the range [0, engines view width -1] 
   * @property {number} cy same as ry but capped to the range [0, engines view height -1]
   * @property {boolean} inside true if the mouse is inside the engines view area
   * @property {rlInputEvent.mouseButtonState} buttons the state of the mouse buttons & wheel
   * @property {rlKeys.keyState} keys the keyboard state
   * @property {string} rlKeyId "None" for mouse events or one of the IDs described in {@link rlKeys} for keyboard events
   * @property {string} printableChar an empty string if a keyboard event should not produce a character, otherwise it contains the character to produce
   */

  /**                      
   * Creates a {@link rlInputEvent.mouseKeyboardEvent} (parameters as described there / parameters are **cloned** into the created event).
   * @memberof rlInputEvent
   * @function
   * @param {string} type
   * @param {number} tick
   * @param {number} rx
   * @param {number} ry
   * @param {number} cx
   * @param {number} cy
   * @param {boolean} inside
   * @param {rlInputEvent.mouseButtonState} buttons
   * @param {rlKeys.keyState} keys
   * @param {string} rlKeyId
   * @param {string} printableChar
   * @returns {rlInputEvent.mouseKeyboardEvent} 
   */
  var createMouseKeyboardEvent = function(type, tick, rx, ry, cx, cy, inside, buttons, keys, rlKeyId, printableChar)
  {
    return { type: type, tick: tick, rx: rx, ry: ry, cx: cx, cy: cy, inside: inside, 
             buttons: cloneMouseButtonState(buttons), 
             keys: rlKeys.cloneKeyState(keys), rlKeyId: rlKeyId, printableChar: printableChar };
  };
  
  /**                      
   * Creates a {@link rlInputEvent.mouseKeyboardEvent} where every property is empty, 0 or false.
   * @memberof rlInputEvent
   * @function
   * @returns {rlInputEvent.mouseKeyboardEvent} 
   */
  var createEmptyMouseKeyboardEvent = function()
  {
    return createMouseKeyboardEvent("", 0, 0, 0, 0, 0, false, 
                                    createEmptyMouseButtonState(),  
                                    rlKeys.createEmptyKeyState(), "", "");
  };
  
  /**                      
   * Creates a {@link rlInputEvent.mouseButtonState} where every property is false.
   * @memberof rlInputEvent
   * @function
   * @returns {rlInputEvent.mouseButtonState} 
   */
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
    if(id == 3)
      return "wheelDown";
    if(id == 4)
      return "wheelUp";
  };
  
  var cloneMouseButtonState = function(buttons)
  {
    return { left: buttons.left, middle: buttons.middle, right: buttons.right,
             wheelDown: buttons.wheelDown, wheelUp: buttons.wheelUp  };
  };

  /**                      
   * Compares the states in two {@link rlInputEvent.mouseKeyboardEvent}s and determines whether a given button changed from *pressed* to *not pressed*.   
   * @memberof rlInputEvent
   * @function
   * @param {rlInputEvent.mouseKeyboardEvent} previousEvent
   * @param {rlInputEvent.mouseKeyboardEvent} currentEvent
   * @param {string} button "left" | "middle" | "right" | "wheelUp" | "wheelDown"
   * @returns {boolean} 
   */  
  var isButtonUpEvent = function(previousEvent, currentEvent, button)
  {      
    return previousEvent.buttons[button] && !currentEvent.buttons[button];
  };
   
  /**                      
   * Compares the states in two {@link rlInputEvent.mouseKeyboardEvent}s and determines whether a given button changed from *not pressed* to *pressed*.   
   * @memberof rlInputEvent
   * @function
   * @param {rlInputEvent.mouseKeyboardEvent} previousEvent
   * @param {rlInputEvent.mouseKeyboardEvent} currentEvent
   * @param {string} button "left" | "middle" | "right" | "wheelUp" | "wheelDown"
   * @returns {boolean} 
   */
  var isButtonDownEvent = function(previousEvent, currentEvent, button)
  {
    return !previousEvent.buttons[button] && currentEvent.buttons[button];
  };
   
  /**                      
   * Compares the states in two {@link rlInputEvent.mouseKeyboardEvent}s and determines whether a given key changed from *pressed* to *not pressed*.    
   * @memberof rlInputEvent
   * @function
   * @param {rlInputEvent.mouseKeyboardEvent} previousEvent
   * @param {rlInputEvent.mouseKeyboardEvent} currentEvent
   * @param {string} keyIdOrChar one of the IDs described in {@link rlKeys} or a printable character
   * @returns {boolean} 
   */
  var isKeyUpEvent = function(previousEvent, currentEvent, keyIdOrChar)
  {      
    return getKeyState(keyIdOrChar, previousEvent.keys) && !getKeyState(keyIdOrChar, currentEvent.keys);
  };
   
  /**                      
   * Compares the states in two {@link rlInputEvent.mouseKeyboardEvent}s and determines whether a given key changed from *not pressed* to *pressed*.    
   * @memberof rlInputEvent
   * @function
   * @param {rlInputEvent.mouseKeyboardEvent} previousEvent
   * @param {rlInputEvent.mouseKeyboardEvent} currentEvent
   * @param {string} keyIdOrChar one of the IDs described in {@link rlKeys} or a printable character
   * @returns {boolean} 
   */
  var isKeyDownEvent = function(previousEvent, currentEvent, keyIdOrChar)
  {      
    return !getKeyState(keyIdOrChar, previousEvent.keys) && getKeyState(keyIdOrChar, currentEvent.keys);
  };
  
  return {
    createMouseKeyboardEvent: createMouseKeyboardEvent,
    createEmptyMouseKeyboardEvent: createEmptyMouseKeyboardEvent,
    createEmptyMouseButtonState: createEmptyMouseButtonState,
    translateMouseButtonId: translateMouseButtonId,
    isButtonUpEvent: isButtonUpEvent,
    isButtonDownEvent: isButtonDownEvent,
    isKeyUpEvent: isKeyUpEvent,
    isKeyDownEvent: isKeyDownEvent,
    getKeyState: rlKeys.getKeyStateBit
  };
}();