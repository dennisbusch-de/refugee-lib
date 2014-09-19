// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Asset management.  
 * contains: {@link rlData} | {@link rlDataManager}  
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
 * Instantiate an object for loading any file from the provided URL into a binary data buffer.
 * (primarily for use by {@link rlDataManager} but can be used directly well)  
 * @constructor
 * @param {string} key a key meant for internally referencing the loaded data
 * @param {string} srcURL a relative or full URL to the file to load   
 */
rlData = function(key, srcURL)
{
  // inherit all of rlObject
  rlObject.call(this);
  this.__proto__.rlType = "rlData";
  
  var myself = this;  // for callbacks
  
  var bytesTotal = 0;
  var bytesLoaded = 0;
  var binarydata = null;
  var alreadyLoaded = false;
  var httpStatusCode = 0;
  
  var key = key;
  var srcURL = srcURL;
                         
  // callbacks for use by rlDataManager or anything else if using rlData directly
  /** @member {rlData~callbackOnLoadFailed} */
  this.onloadfailed = null;
  /** @member {rlData~callbackOnLoading} */
  this.onloadprogress = null; 
  /** @member {rlData~callbackOnLoading} */
  this.onloadsuccess = null;
  
  /** 
   * Function signature for callbacks to use with [onloadfailed]{@link rlData#onloadfailed}.
   * @callback rlData~callbackOnLoadFailed
   * @param {string} key as defined in constructor
   * @param {string} srcURL as defined in constructor
   * @param {number} httpStatusCode the http code describing the problem 
   */
  
  /** 
   * Function signature for callbacks to use with [onloadprogress]{@link rlData#onloadprogress} and [onloadsuccess]{@link rlData#onloadsuccess} 
   * @callback rlData~callbackOnLoading
   * @param {string} key as defined in constructor
   * @param {string} srcURL as defined in constructor
   * @param {number} bytesLoaded bytes loaded so far 
   * @param {number} bytesTotal total bytes to load (if known)
   */    
                   
  var setFailState = function(code)
  {
    bytesTotal = 0;
    bytesLoaded = 0;
    binarydata = null;
    alreadyLoaded = false;
    httpStatusCode = code;
  };
            
  var startload = function()
  {   
    if(alreadyLoaded)
      return;
  
    var r = new window.XMLHttpRequest();
    r.open("GET", srcURL, true);
    r.responseType = "arraybuffer";
    
    r.onerror = function(errE) {
      setFailState(errE.currentTarget.status);
      myself.onloadfailed(key, srcURL, httpStatusCode); 
    };  
    
    r.onprogress = function (progE) {                         
      if(progE.currentTarget.status >= 400) // failed?
      {  
        setFailState(progE.currentTarget.status);
        myself.onloadfailed(key, srcURL, httpStatusCode);
      }
      else // still good 
      {
        if(progE.lengthComputable)
        {
          bytesTotal = progE.total;
          bytesLoaded = progE.loaded;
          httpStatusCode = progE.currentTarget.status;
        }
        myself.onloadprogress(key, srcURL, bytesLoaded, bytesTotal);
      }  
    };
    
    r.onload = function (loadE) {
      if(loadE.currentTarget.status >= 400) // failed?
      {  
        setFailState(loadE.currentTarget.status);
        myself.onloadfailed(key, srcURL, httpStatusCode);
      }
      else // all good 
      {
        // store arraybuffer
        binarydata = this.response.slice(0);  // this points to the XmlHttpRequest here
        this.response = null;
        bytesTotal = binarydata.byteLength;
        bytesLoaded = bytesTotal;
        httpStatusCode = loadE.currentTarget.status;
        alreadyLoaded = true;      
        myself.onloadsuccess(key, srcURL, bytesLoaded, bytesTotal);
      }
    };
    
    r.send();
  };
  /**         
   * Start loading the data asynchronously. Make sure to set [onloadfailed]{@link rlData#onloadfailed}, [onloadprogress]{@link rlData#onloadprogress} and [onloadsuccess]{@link rlData#onloadsuccess} before calling this. 
   * @function
   */
  this.startload = startload; 
  
  var getData = function() {
    if(alreadyLoaded)
      return binarydata;
    else
      return null;      
  };
  /**
   * @function
   * @returns {ArrayBuffer} the binarydata if it successfully loaded already, otherwise null
   */
  this.getData = getData;
  
  var getLoadState = function() {
    return { key: key, srcURL: srcURL, bytesLoaded: bytesLoaded, bytesTotal: bytesTotal };
  }; 
  
  /**  
   * (not an actual type, use object literals with these properties)
   * @typedef loadState
   * @memberof rlData
   * @property {string} key as defined in constructor
   * @property {string} srcURL as defined in constructor
   * @property {number} bytesLoaded bytes loaded so far 
   * @property {number} bytesTotal total bytes to load (if known)
   */
  
  /**
   * @function
   * @returns {rlData.loadState} an object containing load state info
   */                                                            
  this.getLoadState = getLoadState;
  
  var getLoadStateCompactString = function() {
    return ""+key+" : "+srcURL.substr(srcURL.lastIndexOf("/")+1)+" : "+bytesLoaded+" / "+(bytesTotal == 0 ? "?" : bytesTotal);
  };
  /**
   * @function
   * @returns {string} a compact string representation of the loading state, e.g. "myKey : myImage.png : 42 / 666"   
   */
  this.getLoadStateCompactString = getLoadStateCompactString;
  
  /**
   * @function
   * @returns {string} the key as defined in constructor
   */
  this.getKey = function() { return key; };
};  

/**
 * Instantiate an object for loading multiple files sequentially into {@link rlData} objects. The loaded files can then be referenced by their key.
 * @TODO integrate jszip to load zip contents as individual data objects  
 * @constructor   
 */
rlDataManager = function()
{
  // inherit all of rlObject
  rlObject.call(this);
  this.__proto__.rlType = "rlDataManager";
  
  var myself = this;
  var items = {};
  //var itemsFromArchives = {}; 
  var itemsTotal = 0;
  var itemsLoaded = 0; 
  var itemsFailed = 0;
  var failInfo = {};
  var keysToLoad = [];
             
  // callbacks for use by external object which uses the data manager
  /** @member {rlDataManager~callbackOnLoading} */ 
  this.onloadprogress = null; // (itemsLoaded, itemsFailed, itemsTotal)
  /** @member {rlDataManager~callbackOnLoading} */ 
  this.onloadfinished = null; // (itemsLoaded, itemsFailed, itemsTotal)
  
  /** 
   * Function signature for callbacks to use with [onloadprogress]{@link rlDataManager#onloadprogress} and [onloadsuccess]{@link rlDataManager#onloadfinished} 
   * @callback rlDataManager~callbackOnLoading
   * @param {number} itemsLoaded number of files which were successfully loaded
   * @param {number} itemsFailed number of files which failed to load 
   * @param {number} itemsTotal total number of files to load
   */
       
  this.loadnext = function()
  {
    var key = keysToLoad.shift(); // treating keys like a FIFO queue
    items[key].item.startload();
  };
  
  var allfinishedCheck = function()
  {
    if(itemsLoaded + itemsFailed == itemsTotal) // all finished(successfully or failed)?
    {    
      myself.onloadfinished(itemsLoaded, itemsFailed, itemsTotal);
    }
    else
      myself.loadnext();
  };
          
  var onitemerror = function(key, srcURL, httpStatusCode) {
    if(typeof items[key].failInfo == "undefined")
    {
      itemsFailed++;           
      items[key].failInfo = { httpStatusCode: httpStatusCode };        
      allfinishedCheck();
    }   
  };
                              
  var onitemprogress = function(key, srcURL, bytesLoaded, bytesTotal) {
    myself.onloadprogress(itemsLoaded, itemsFailed, itemsTotal);  
  };
  
  var onitemsuccess = function(key, srcURL, bytesLoaded, bytesTotal) {
    itemsLoaded++;        
    allfinishedCheck();
  };
  
  var startload = function(sources /* array of { key, srcURL, info } items */)
  {
    if((itemsLoaded + itemsFailed == itemsTotal)  && sources.length == 0)
      return; // nothing new to load
                      
    itemsTotal += sources.length;
  
    var i;
    for(i=0; i<sources.length; i++)
    { 
      /** (not an actual type, use object literals with these properties)
       * @typedef dataEntry
       * @memberof rlDataManager
       * @property {rlData} item the {@link rlData} instance assigned to this entry
       * @property {object} info as defined in {@link rlDataManager.sourceDesc}
       * @property {object} [failInfo] only present if loading of the file within the {@link rlData} instance failed
       */       
      var o = { item: new rlData(sources[i].key, sources[i].srcURL), 
                info: sources[i].info };
      o.item.onloadfailed = onitemerror;
      o.item.onloadprogress = onitemprogress;
      o.item.onloadsuccess= onitemsuccess;         
      
      items[sources[i].key] = o;
      keysToLoad.push(sources[i].key); 
    }
    
    // load items sequentially (works more reliably than parallel loading especially on very low bandwidths)
    myself.loadnext();
  }; 
  
  /**
   * (not an actual type, use object literals with these properties)
   * @typedef sourceDesc
   * @memberof rlDataManager
   * @property {string} key unique id to associate with the file within the {@link rlDataManager}
   * @property {string} srcURL relative or absolute URL to the file
   * @property {object} info anything you want (e.g. for extensions or additional metadata)
   */  
      
  /** 
   * Start asynchronous, sequential loading of a batch of files. Make sure to set [onloadprogress]{@link rlDataManager#onloadprogress} and [onloadfinished]{@link rlDataManager#onloadfinished} before calling this. Can be called again to load another batch of files after the previous batch finished loading (do not call it again before the batch finished loading).  
   * @function
   * @param {rlDataManager.sourceDesc[]} sources an array of objects describing the files to load    
   */
  this.startload = startload;

  /**             
   * @function
   * @returns {boolean} true if the current batch of files finished loading
   */  
  this.hasFinished = function() { return itemsLoaded + itemsFailed == itemsTotal; };
  
  /**
   * Get the data entry with the given key.
   * @function
   * @param {string} key the key which uniquely identifies the entry to get  
   * @returns {rlDataManager.dataEntry}
   */
  this.getEntry = function(key) { return items[key]; };
      
  /**
   * Get all known keys.
   * @function   
   * @returns {string[]}
   */
  this.getKeys = function() { 
    var key;
    var rKeys = [];
    for(key in items)
      rKeys.push(key);
    return rKeys;      
  };
};