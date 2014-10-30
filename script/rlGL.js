// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Graphics functions to use with a [WebGLRenderingContext]{@link https://developer.mozilla.org/en/docs/Web/API/WebGLRenderingContext}.  
 * contains: {@link rlGL}  
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
 * Graphics functions to use with a [WebGLRenderingContext]{@link https://developer.mozilla.org/en/docs/Web/API/WebGLRenderingContext}. 
 * @namespace 
 */
var rlGL = function() 
{
  /**
   * Creates, compiles and returns a [WebGLShader]{@link https://www.khronos.org/registry/webgl/specs/1.0/#5.8} object using the given context.    
   * (writes compilation errors to the console)
   * @memberof rlGL
   * @function
   * @param {WebGLRenderingContext} GL the rendering context to use
   * @param {GLenum} shaderType pass GL.VERTEX_SHADER or GL.FRAGMENT_SHADER
   * @param {String} shaderSource the sourcecode for the shader in "OpenGL ES Shading Language" (the String must be in UTF-16 format)
   * @returns {WebGLShader|null} a shader object or null on a compilation error 
   */
  var buildShader = function(GL, shaderType, shaderSource)
  {
    var rs = GL.createShader(shaderType);
    GL.shaderSource(rs, shaderSource);
    GL.compileShader(rs);
    
    if(!GL.getShaderParameter(rs, GL.COMPILE_STATUS))
    { 
      var tS = (shaderType == GL.VERTEX_SHADER) ? "VERTEX_SHADER" : ((shaderType == GL.FRAGMENT_SHADER) ? "FRAGMENT_SHADER" : "unknown");                           
      console.error("in rlGL.buildShader(shaderType: "+tS+") from shaderSource: ");
      console.error(GL.getShaderInfoLog(rs));
      console.log(shaderSource);
      GL.deleteShader(rs); 
      rs = null;
    }
    
    return rs;
  };  
  
  /**
   * Creates, attaches given shaders, links, validates and returns a [WebGLProgram]{@link https://www.khronos.org/registry/webgl/specs/1.0/#5.6} object using the given context.  
   * (writes link/validation errors to the console)
   * @memberof rlGL
   * @function
   * @param {WebGLRenderingContext} GL the rendering context to use
   * @param {WebGLShader[]} shaders the array of previously build [WebGLShader]{@link https://www.khronos.org/registry/webgl/specs/1.0/#5.8} objects to attach to the created program
   * @returns {WebGLProgram|null} a program object or null on a link/validation error
   */
  var buildProgram = function(GL, shaders)
  {
    var rglp = GL.createProgram();
    var i;
    
    for(i=0; i<shaders.length; i++)
    {
      GL.attachShader(rglp, shaders[i]);
    }
    
    GL.linkProgram(rglp);
    GL.validateProgram(rglp);
    
    if(!GL.getProgramParameter(rglp, GL.LINK_STATUS) || 
       !GL.getProgramParameter(rglp, GL.VALIDATE_STATUS))
    {
      console.error("in rlGL.buildProgram:");
      console.error(GL.getProgramInfoLog(rglp));
      GL.deleteProgram(rglp); 
      rglp = null;
    }
    
    return rglp;
  };
  
  /** 
   * Function signature for parameter [onLoadProgramFinished]{@link rlGL.loadProgram}.
   * @callback rlGL~onLoadProgramFinished
   * @param {WebGLProgram|null} glp a [WebGLProgram]{@link https://www.khronos.org/registry/webgl/specs/1.0/#5.6} object on success, null if any error occured
   */   
  
  /**
   * Asynchronously loads shader source files and afterwards compiles/links them as a new [WebGLProgram]{@link https://www.khronos.org/registry/webgl/specs/1.0/#5.6} object using the given context.      
   * After success/failure it calls the function passed as the onLoadProgramFinished parameter.  
   * (it is not safe to call this again before the callback started)  
   * (writes any errors(loading/compiling/linking/validating) to the console) 
   * @memberof rlGL
   * @param {WebGLRenderingContext} GL the rendering context to use
   * @param {String[]} shaderDescriptions each string expected as "type:sourceURL" where type is V for FRAGMENT_SHADER or F for VERTEX_SHADER and sourceURL is the URL for the file containing the shader source code in "OpenGL ES Shading Language"
   * @param {rlGL~onLoadProgramFinished} onLoadProgramFinished a function to call after success or failure 
   * @function
   */
  var loadProgram = function(GL, shaderDescriptions, onLoadProgramFinished)
  {
    if(typeof onLoadProgramFinished == "undefined")
      return;
    
    var dm = new rlDataManager();
    try
    {
      var sources = [];
      var i;
      for(i=0; i<shaderDescriptions.length; i++)
      {
        var s = shaderDescriptions[i].split(":");  
        sources.push({ key: rlUtilsConvert.nToMinLengthString(i,10,3), srcURL: s[1], overrideResponseType: "text", 
                       metadata: s[0] == "F" ? GL.FRAGMENT_SHADER : (s[0] == "V" ? GL.VERTEX_SHADER : s[0]) });              
      } 
      dm.onloadprogress = function(loaded, failed, total) { };       
      dm.onloadfinished = function(loaded, failed, total)
      {   
        var rglp = null;
        var compilationErrors = 0; 
              
        if(failed == 0)
        {                  
          var keys = dm.getKeys();
          var shaders = [];
          
          // compile shaders
          
          for(i=0; i<keys.length; i++)
          {
            var dataEntry = dm.getEntry(keys[i]);
            var sh = rlGL.buildShader(GL, dataEntry.metadata, dataEntry.item.getData());
            if(sh != null) 
              shaders.push(sh);
            else
            { 
              console.error("in shader source file: "+dataEntry.item.getLoadState().srcURL);
              compilationErrors++;
            }
          }
          
          // build program
          if(compilationErrors == 0)
            rglp = rlGL.buildProgram(GL, shaders);
        }
        else
        {
          console.error("in rlGL.loadProgram: ");
          var keys = dm.getKeys();
          for(i=0; i<keys.length; i++)
          {
            var dataEntry = dm.getEntry(keys[i]);
            if(dataEntry.failInfo != null)
            {
              var loadState = dataEntry.item.getLoadState();
              console.error("loading shader from \""+loadState.srcURL+"\" failed with httpCode: "+dataEntry.failInfo.httpStatusCode);
            }
          }
        }
        
        if(compilationErrors > 0)
          console.error(compilationErrors+" compilationError(s) occured in rlGL.loadProgram");
        if(rglp == null)
          console.error("rlGL.loadProgram failed at rlG.buildProgram");  
        
        onLoadProgramFinished(rglp); 
      };  
      
      dm.startload(sources);
    }
    catch(exc)
    {
      console.error(exc.message);
      onLoadProgramFinished(null);
    }
  }; 

  return {
    buildShader: buildShader,
    buildProgram: buildProgram,
    loadProgram: loadProgram
  };
}();