// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Script shrinking/expanding.   
 * contains: {@link rlScriptShrink}  
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
 * "rlScriptShrink.js" ({@link rlBoot.bootRefugeeLib} does not load this script by default) 
 * 
 * Experimental tokenization based script shrinking/expanding.  
 * **Limitation**: string constants containing a "@:" prefixed by one or
 * more of the modified base64 symbols may lead to those being recursively replaced when a shrunk
 * script is being expanded again.  
 *  
 * @TODO add method to load, shrink and save in one step / loadFromURL(s), loadFromFile(s)
 * @namespace
 */  
var rlScriptShrink = function()
{
  /**
   * modified base64 symbols using chars \`\# instead of +/ (which are valid js operators) which are used in placeholder/token ids
   * @memberof rlScriptShrink
   * @constant
   * @private 
   * @default
   */
  var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`#";
  
  var itb64=function(i)
  {
    var r="",v=i,t=1,d=0;         
    while(t*64<=i)t*=64;
    while(t>=1)
    {
      d=Math.floor(v/t);     
      r+=b.charAt(d);
      v-=d*t;
      t/=64;
    }
    return r;
  };      
  
  var b64ti=function(s)
  {
    var i=0,c=0,t=1;
    for(c=s.length-1;c>=0;c--)
    {
      i+=b.indexOf(s.charAt(c))*t;
      t*=64;
    }
    return i;
  };
  
  var getShrinkData = function(s)
  { 
    var r=s,c=[],t=[]; 
    
    // STRING CONSTANTS tokenization start {                         
    // find all string constants (note: sometimes matches code enclosed in +s between strings, but that code gets expanded correctly)
    var sc = s.match(/(["][^"\n\r]*["]+|['][^'\n\r]*[']+)/g);
    var scd = {};
        
    // collect unique string constants
    for(i in sc) 
    {
      if(typeof(scd[sc[i]]) == "undefined")
      {
        scd[sc[i]] = 1;
      }
      else
        scd[sc[i]]++;
    }
          
    // sort constants by length longest first     
    for(e in scd)
      c.push(e);
    c.sort(function(a,b) { return b.length-a.length; });
      
    var replaceWholeWords = function(source, toFind, replacement)
    {                      
      var mod = source;
      var sub = source;    
      var zi, pzi, azi, test, endOfSource, skimmedLength=0;
                                                
      do
      {
        zi = sub.indexOf(toFind);
        if(zi == -1) // no instance of toFind found?
          return mod;
        
        pzi = zi-1;
        azi = zi+toFind.length;
        test = [false, false];
        endOfSource = azi >= sub.length;
        
        test[0] = (pzi < 0 && skimmedLength == 0 ) || (pzi!=0 && /[^\w\d]/.test(sub.charAt(pzi)));                     
        test[1] = (endOfSource) || (/[^\w\d]/.test(sub.charAt(azi)));
            
        if(test[0] && test[1]) // found a whole word instance of toFind ?
        {
          sub = sub.replace(toFind,replacement);
          mod = mod.substr(0,skimmedLength).concat(sub);
          skimmedLength += zi+replacement.length;
        }  
        else // found a non whole word instance of toFind?
          skimmedLength += zi+toFind.length;

        // look ahead in substring (indexOf only returns the first instance but there could be another instance later)        
        sub = mod.substr(skimmedLength);
      }
      while(!endOfSource); 
      
      return mod;
    };
    
    // replace string constants
    for(i in c)
    {     
      r = replaceWholeWords(r,c[i],itb64(i)+'@:'); // extra char needed to separate code/string tokens 
    }
            
    // strip /* */ style comments
    r = r.replace(/[/][\*](.|[\r\n])*?[\*][/]/g, "");
    
    // strip // style comments
    r = r.replace(/[/]{2}.*(\r\n|\n|\r)/g, "");
    
    // eliminate sequential whitespace
    r = r.replace(/[\s]+/g, " ");
  
    // un-use string constants which only appeared in comments
    var fi = []; 
    for(i in c)
    {       
      var m = itb64(i)+'@';
      if(r.indexOf(m) == -1)
      {
        c[i] = null;
        fi.push(i);
      }
    }   
    
    // prepare previous-index data if re-use is applicable
    if(fi.length > 0)
      for(i=0;i<c.length;i++)
        c[i] = { el: c[i], pi: i };
                        
    // pull items from the end to the unused places and discard all unused items
    while(fi.length > 0)
    {             
      var cf = fi.shift();
      if(c.length>cf)
        while(c.length > 0 && c[c.length-1].el == null) // eliminate any unused items from end of string constants
          c.pop();
          
      if(c.length>cf && cf != c.length-1)
        c[cf] = c.pop();
      else
        break;
    }                 
       
    // re-order string constants if necessary after removal of un-used ones and discard index data
    for(i=0;i<c.length;i++)
    {
      var pI = c[i].pi; 
      if(pI != i)
      {
        var m = itb64(i)+'@:';
        var p = itb64(pI)+'@:';
        
        while(r.indexOf(p) != -1)
          r = r.replace(p, m);
      }
      
      c[i] = c[i].el;
    }
          
    // STRING CONSTANTS tokenization end. }
    
    // CODE TOKENIZATION start {
    // match whole words containing only letters,digits and underscores(charcode 5F)
    var ct = r.match(/\b[\w\d\x5F]*\b/g);
    var ctd = {};
    
    // collect unique code tokens
    for(i in ct) 
    {
      if(typeof(ctd[ct[i]]) == "undefined")
      {
        ctd[ct[i]] = 1;
      }
      else
        ctd[ct[i]]++;
    }
          
    // sort tokens by length, shortest first (and discard single use tokens)
    var tt = [];
    for(e in ctd)
      if(ctd[e] > 1)
        tt.push(e);
    tt.sort(function(a,b) { return a.length-b.length; });
    
    // collect tokens and discard tokens not worth storing because of being too                            
    // to long for the number of base64 places and @ symbol needed to store them
    var cm=64;
    var mtl=3; // @_ is the minimum placeholder length, so first tokens must be at least 3 chars long
    for(i=0; i<tt.length; i++)
    {
      if(i >= cm*64)
      {
        cm*=64;
        mtl++;
      }
      
      if(tt[i].length >= mtl)
        t.push(tt[i]);
    }
    
    // replace code tokens (from longest to shortest)
    for(i=t.length-1;i>=0;i--)
    {   
      r = replaceWholeWords(r,t[i],'@'+itb64(i));
    }           
         
    // CODE TOKENIZAION end }    
    
    //remove/replace any excess whitespace left between symbols and words
    var fr = "";
    var pc = 0;
    var cc = 0;
    for(i=0; i<r.length; i++)
    {
      var x = r.charAt(i);
      if(x.match(/\S/) != null)
      {
        fr+=x;
      }
      else if(i+1<r.length)
      { 
        var b = [ false, false ];
        var code = [ pc, r.charCodeAt(i+1) ];
        var j;      
        for(j=0; j<code.length; j++)
          b[j] = (    code[j] > 47 && code[j] < 58  // 0..9
                   || code[j] > 63 && code[j] < 91  // @A..Z 
                   || code[j] > 96 && code[j] < 123 // a..z
                 );
                 
        if(b[0] && b[1]) // if whitespace is between any two of the above characters
          fr+=" "; // replace any whitespace char with a single space
      }
      pc=x.charCodeAt(0);  
    }
    r = fr;
    
    return { stringTokens: c, codeTokens: t, tokenizedInput: r, inputCharCount: s.length, tokenizedCharCount: r.length }; 
  };
           
  var getPreparedData = function(shrinkData)
  {         
    // prepare string constants array (could cut down on character count here if there was a separator character guaranteed not to be in any of the constants)
    var s0 = JSON.stringify(shrinkData.stringTokens);
    
    // prepare code tokens as string (separated by @ to cut down on character count)
    var s1 = "\"";
    for(i=0; i<shrinkData.codeTokens.length; i++)
    {
      s1+=shrinkData.codeTokens[i];
      if(i+1 < shrinkData.codeTokens.length)
        s1+='@';
      else
        s1+="\"";
    }
             
    // prepare tokenized code string
    var s2 = JSON.stringify(shrinkData.tokenizedInput);
    
    return [s0,s1,s2];
  };
  
  // s=source containining placeholders
  // p=array with prepared tokens for placeholders
  // c= <0 prefixed placeholders, else suffixed placeholders for strings (tokens are expected to include original delimiter hint)
  // code tightly packed here (will be used by generator for selfexpanding scripts)
  var getExpansion=function(s,p,c){var y="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`#",j,x,z=s,l=function(i){var r="",v=i,t=1,d=0;while(t*64<=i)t*=64;while(t>=1){d=Math.floor(v/t);r+=y.charAt(d);v-=d*t;t/=64;}return r;};for(j=p.length-1;j>=0;j--){x=c<0?'@'+l(j):l(j)+'@:';while(z.indexOf(x)!=-1)z=z.replace(x,p[j]);}return z;};
  // s,p,c,y,j,x,z,l,i,r,v,t,d (symbols in above function)                
  // h,a,f,q,g (symbols in below function)            
  var getSXscript = function(preparedData)
  {                                        
    var sx="var a=[";
    sx+=preparedData[0]+",";
    sx+=preparedData[1]+",";
    sx+=preparedData[2];
    sx+="],q,f=function(){var g="+getExpansion.toString()+";";
    sx+="q=g(a[2],a[1].split('@'),-1);q=g(q,a[0],1);";    
    sx+="}();eval(q);";    
    return sx;  
  };
  
  /** (not an actual type, use object literals with these properties)
   * @typedef shrinkData
   * @memberof rlScriptShrink
   * @property {string[]} stringTokens contains all found string tokens from a script
   * @property {string[]} codeTokens contains all found code tokens from a script which were worth replacing to save on character count
   * @property {string} tokenizedInput a shrunk version of a script where unnecessary whitespace and all comments haven been stripped and string and code tokens have been replaced with placeholders (the placeholder ids are encoded numbers in modified base64 symbols, the ids refer to indices within the stringTokens and codeTokens arrays)   
   * @property {number} inputCharCount the number of characters in the source script
   * @property {number} tokenizedCharCount the number of character in the tokenized shrunk version of the script 
   */
  
  /** 
   * Get shrink data for the given script content.    
   * @memberof rlScriptShrink 
   * @function getShrinkData
   * @param {string} s a string containing the script content to shrink    
   * @returns {rlScriptShrink.shrinkData} shrinkData ready to be passed to {@link rlScriptShrink.getPreparedData}
   */
   
  /** 
   * Get prepared data from the given shrink data.    
   * @memberof rlScriptShrink 
   * @function getPreparedData
   * @param {rlScriptShrink.shrinkData} shrinkData previously generated shrink data    
   * @returns {string[]} an array of strings ready to be passed to {@link rlScriptShrink.getSelfExpandingScript}
   */ 
   
  /**
   * Replace token identifiers in a source string with token contents.
   * @memberof rlScriptShrink 
   * @function getExpansion
   * @param {string} s a string containing prefixed(@id) and/or suffixed(id@:) token identifiers (id is a number encoded in modified base64 symbols)
   * @param {string[]} p an array containing the token contents for the token identifiers (index is the token id)
   * @param {number} c set negative to replace prefixed, zero or positive to replace suffixed token identifiers in s with the token contents
   * @returns {string} the modified source string where the token identifiers have been replaced with the token contents 
   */  
   
  /**
   * Get a string whose content can be saved to a .js file which expands itself when it is included in a &lt;script&gt; tag.
   * @memberof rlScriptShrink
   * @function getSelfExpandingScript
   * @param {string[]} preparedData must be the data returned from {@link rlScriptShrink.getPreparedData}
   * @returns {string} 
   */ 
  
  return {
    itb64: itb64,
    b64ti: b64ti,
    getShrinkData: getShrinkData,
    getPreparedData : getPreparedData,
    getExpansion: getExpansion,
    getSelfExpandingScript: getSXscript
  };
}();