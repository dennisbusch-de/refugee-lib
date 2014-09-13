// -----------------------------------------------------------------------------
// Refugee Lib - WIP
// keyboard input translation (for unified cross-platform key identifiers)
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

var rlKeys = function()
{
  var l = [ {}, {}, {}, {} ];
  var bitCode = {};
  
  var modKeys = ["Shift", "Control", "Alt", "OS"];
  var modKeyVariants = ["Left", "Right"];
 
  var i = 0, j = 0, k =0;
  var t = "", u = "";
                    
  // define lookup tables for cross-browser key constants
  l[0]["U+001B"] = "Esc";
  l[0]["Esc"] = "Esc";
  for(i=1; i<=12; i++) // F1 to F12
    l[0]["F"+i] = "F"+i;
  l[0]["PrintScreen"] = "PrintScreen";
  l[0]["Scroll"] = "ScrollLock";
  l[0]["ScrollLock"] = "ScrollLock";
  l[0]["Pause"] = "Pause";
  l[0]["U+00C0"] = "`";
  l[0]["`"] = "`";
  for(i=0; i<=9; i++) // digits 0 to 9                   
  { 
    t = i.toString(16).toUpperCase();
    l[0]["U+003"+t] = "D"+i.toString(10);
    l[0][i.toString(10)] = "D"+i.toString(10);
    if(i==0)
      l[3]["U+0060"] = "N0";
    else
      l[3]["U+004"+t] = "N"+i.toString(10);
  }
  l[0]["U+00BD"] = "-";
  l[0]["-"] = "-";
  l[0]["U+00BB"] = "=";
  l[0]["="] = "=";
  l[0]["U+0008"] = "Backspace";
  l[0]["Backspace"] = "Backspace";
  l[0]["Insert"] = "Insert";
  l[0]["Home"] = "Home";
  l[0]["PageUp"] = "PageUp";
  l[3]["U+0090"] = "NumLock";
  l[0]["NumLock"] = "NumLock";
  l[3]["U+004F"] = "N/";
  l[3]["/"] = "N/";
  l[3]["Divide"] = "N/";
  l[3]["U+004A"] = "N*";
  l[3]["*"] = "N*";
  l[3]["Multiply"] = "N*";
  l[3]["U+004D"] = "N-";
  l[3]["-"] = "N-";
  l[3]["Subtract"] = "N-";
  l[0]["U+0009"] = "Tab";
  l[0]["Tab"] = "Tab";
  for(i=0; i<=26; i++) // a to z in upper and lower case variants
  { 
    j = 65+i;
    t = j.toString(16).toUpperCase();
    t = t.length == 1 ? "0"+t : t;
    u = String.fromCharCode(j).toLowerCase();
    l[0]["U+00"+t] = u;
    l[0][u] = u;
    l[0][u.toUpperCase()] = u; 
  }
  l[0]["U+00DB"] = "[";
  l[0]["["] = "[";
  l[0]["U+00DD"] = "]";
  l[0]["]"] = "]";
  l[0]["U+00DC"] = "\\";
  l[0]["\\"] = "\\";
  l[0]["U+007F"] = "Del";
  l[0]["Del"] = "Del";
  l[0]["End"] = "End";
  l[0]["PageDown"] = "PageDown";
  l[3]["Home"] = "N7";
  l[3]["7"] = "N7";
  l[3]["Up"] = "N8";
  l[3]["8"] = "N8";
  l[3]["PageUp"] = "N9";
  l[3]["9"] = "N9";
  l[3]["U+004B"] = "N+";
  l[3]["+"] = "N+";
  l[3]["Add"] = "N+";
  l[0]["CapsLock"] = "CapsLock";
  l[0]["U+00BA"] = ";";
  l[0][";"] = ";";
  l[0]["U+00DE"] = "'";
  l[0]["'"] = "'";
  l[0]["Enter"] = "Enter";
  l[3]["Left"] = "N4";
  l[3]["4"] = "N4";
  l[3]["Clear"] = "N5";
  l[3]["5"] = "N5";
  l[3]["Right"] = "N6";
  l[3]["6"] = "N6";
  l[1]["Shift"] = "LeftShift";
  l[0]["U+00BC"] = ",";
  l[0][","] = ",";
  l[0]["U+00BE"] = ".";
  l[0]["."] = ".";
  l[0]["U+00BF"] = "/";
  l[0]["/"] = "/";
  l[2]["Shift"] = "RightShift";
  l[0]["Up"] = "Up";
  l[3]["End"] = "N1";
  l[3]["1"] = "N1";
  l[3]["Down"] = "N2";
  l[3]["2"] = "N2";
  l[3]["PageDown"] = "N3";
  l[3]["3"] = "N3";
  l[3]["Enter"] = "NEnter";
  l[1]["Control"] = "LeftControl";
  l[1]["Win"] = "LeftOS";
  l[1]["OS"] = "LeftOS";
  l[1]["Alt"] = "LeftAlt";
  l[0]["U+0020"] = "Space";
  l[0][""] = "Space";
  l[0]["Spacebar"] = "Space";
  l[2]["Alt"] = "RightAlt";
  l[2]["Win"] = "RightOS";
  l[2]["OS"] = "RightOS";
  l[2]["Control"] = "RightControl";
  l[0]["Left"] = "Left";
  l[0]["Down"] = "Down";
  l[0]["Right"] = "Right";
  l[3]["Insert"] = "N0";
  l[3]["0"] = "N0";
  l[3]["U+007F"] = "N.";
  l[3]["."] = "N.";
  l[3]["U+004E"] = "N.";
  l[3]["Del"] = "N.";
  l[3]["Decimal"] = "N.";
  l[0]["Shift"] = "ReleaseShift";
  l[0]["Control"] = "ReleaseControl";
  l[0]["Alt"] = "ReleaseAlt";
  l[0]["Win"] = "ReleaseOS";
  l[0]["OS"] = "ReleaseOS";
  l[0]["Unknown"] = "Unknown";  
         
  // collect unique ids and calculate bitCode for every defined key
  k = 0;
  var ext = false;
  var extChecked = false;
  for(i=0; i<4; i++)
  {
    for(j in l[i])
    {
      if(typeof bitCode[l[i][j]] == "undefined")
      {                        
        bitCode[l[i][j]] = { bit: 1<<k, ext: ext };    
        k++;
        
        if(!extChecked)
        {
          ext = k > 63;
          if(ext)
            k = 0;
          extChecked = ext;
        } 
      }
    }
  }
  
  var getKeyId = function(sourceId, sourceLocation)
  { 
    if(typeof l[sourceLocation][sourceId] != "undefined")
      return l[sourceLocation][sourceId];      
    else
      return "Unknown";
  };

  var setKeyStateBit = function(keyId, keyState)
  {                                      
    var i = bitCode[keyId].ext ? 1 : 0;
    keyState[i] = keyState[i] | bitCode[keyId].bit;
    //return keyState; 
  };
  
  var clearKeyStateBit = function(keyId, keyState)
  {                                      
    var i = bitCode[keyId].ext ? 1 : 0;
    keyState[i] = (keyState[i] | bitCode[keyId].bit) ^ bitCode[keyId].bit;
    //return keyState; 
  };
  
  var checkClearModKeyStateBits = function(keyId, keyState)
  { 
    if(keyId.indexOf("Re") != -1) // "Release"
    {     
      var s = keyId.substr(7);  
      for(i in modKeys)
      {
        if(s == modKeys[i])
        {
          for(j in modKeyVariants)
            clearKeyStateBit(modKeyVariants[j]+s, keyState);
          return;
        }
      }
    }
  };
  
  var getKeyStateBit = function(keyId, keyState)
  {                                      
    var i = bitCode[keyId].ext ? 1 : 0;
    return (keyState[i] & bitCode[keyId].bit) > 0;  
  };  
  
  return {
    getKeyId: getKeyId,
    setKeyState: setKeyStateBit,
    clearKeyState: clearKeyStateBit,
    checkClearModKeyState: checkClearModKeyStateBits,
    getKeyState: getKeyStateBit
  }; 
}();