// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Asset management.  
 * contains: {@link rlData} | {@link rlDataManager} | {@link rlDataObjectFactory} 
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
                    
  var rType = "";
  var bytesTotal = 0;
  var bytesLoaded = 0;
  var data = null;
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
    data = null;
    alreadyLoaded = false;
    httpStatusCode = code;
  };
            
  var startload = function(overrideResponseType)
  {   
    if(alreadyLoaded)
      return;
  
    var r = new window.XMLHttpRequest();
    r.open("GET", srcURL, true);
    r.responseType = (typeof overrideResponseType == "string") ? overrideResponseType : "arraybuffer";
    rType = r.responseType;   
    
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
        // store data ( "this" points to the XmlHttpRequest here )
        myself.setData(this.response);
                
        httpStatusCode = loadE.currentTarget.status;
        this.response = null;
             
        myself.onloadsuccess(key, srcURL, bytesLoaded, bytesTotal);
      }
    };
    
    r.send();
  };
  
  /**         
   * Start loading the data asynchronously. Make sure to set [onloadfailed]{@link rlData#onloadfailed}, [onloadprogress]{@link rlData#onloadprogress} and [onloadsuccess]{@link rlData#onloadsuccess} before calling this. 
   * @function
   * @param {string} [overrideResponseType=arraybuffer] explicitly set the response type for the asynchronous XMLHttpRequest 
   */
  this.startload = startload; 
  
  /**
   * Directly set the data to keep inside (will be cloned from the given data).
   * @function
   * @param {ArrayBuffer|string} toClone the source data to clone into the internal data 
   */
  this.setData = function(toClone)
  {
    data = toClone.slice(0);
    bytesTotal = (toClone instanceof ArrayBuffer) ? data.byteLength : (typeof toClone == "string") ? toClone.length*2 : 0;
    bytesLoaded = bytesTotal;
    alreadyLoaded = true;
  };
  
  var getData = function() {
    if(alreadyLoaded)
      return data;
    else
      return null;      
  };
  /**
   * @function
   * @returns {ArrayBuffer} the data if it successfully loaded already, otherwise null
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
 * Instantiate an object for loading multiple files(and .metadata files if available) sequentially into [dataEntry]{@link rlDataManager.dataEntry} objects. The loaded files can then be referenced by their key.  
 *  
 * If a file named "X" is loaded and a file name "X.metadata" exists and no metadata was set manually, an attempt will be made to JSON.parse the contents of that file and upon success the resulting object will be set as the metadata property of the [dataEntry]{@link rlDataManager.dataEntry}.
 *  
 * zip file contents can be integrated directly into a datamanager [as described here]{@link rlDataManager#unzipAndCollectItems}.  
 *  
 * example: {@tutorial 02-loading-assets}
 * @constructor   
 */
rlDataManager = function()
{
  // inherit all of rlObject
  rlObject.call(this);
  this.__proto__.rlType = "rlDataManager";
  
  var myself = this;
  var items = {};
   
  var itemsTotal = 0;
  var itemsLoaded = 0; 
  var itemsFailed = 0;
  
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
    if(typeof items[key].isMeta != "undefined")
      items[key].item.startload("text");
    else
      items[key].item.startload(items[key].responseType);
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
    if(items[key].failInfo == null)
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
  
  var onmetaerror = function(key, srcURL, httpStatusCode) 
  {
    if(typeof items[key] != "undefined")      
    {
      var md = items[key];
      var targetItemKey = md.metadata;
      items[targetItemKey].metadata = null;
      
      delete items[key];
      allfinishedCheck();
    } 
  };
                                
  var onmetaprogress = function(key, srcURL, bytesLoaded, bytesTotal) {  
  };
  
  var onmetasuccess = function(key, srcURL, bytesLoaded, bytesTotal) 
  {  
    var md = items[key];
    var targetItemKey = md.metadata;
    try
    { 
      items[targetItemKey].metadata = JSON.parse(md.item.getData());
    }
    catch(exc)
    { 
      items[targetItemKey].metadata = null;
      console.log("(srcURL: "+srcURL+") Exception in rlDataManager.onmetasuccess: "+exc.message);
    } 
    
    delete items[key];
    allfinishedCheck();
  };
  
  var startload = function(sources /* array of { key, srcURL, metadata } items */)
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
       * @property {object|null} metadata only set if defined in {@link rlDataManager.sourceDesc} or if loaded from a .metadata file
       * @property {object|null} failInfo only set if loading of the file within the {@link rlData} instance failed
       */        
      var o = { item: new rlData(sources[i].key, sources[i].srcURL),
                responseType: ((typeof sources[i].overrideResponseType != "undefined") ? sources[i].overrideResponseType : "arraybuffer"),
                metadata: ((typeof sources[i].metadata != "undefined") ? sources[i].metadata : null),
                failInfo: null };
      o.item.onloadfailed = onitemerror;
      o.item.onloadprogress = onitemprogress;
      o.item.onloadsuccess= onitemsuccess;
      
      if(o.metadata == null) // attempt to load metadata from file?
      {
        var metaSuffix = ".metadata";
        var md = { item: new rlData(sources[i].key+metaSuffix, sources[i].srcURL+metaSuffix),
                   metadata: sources[i].key, failInfo: null, isMeta: true };
        md.item.onloadfailed = onmetaerror;
        md.item.onloadprogress = onmetaprogress;
        md.item.onloadsuccess= onmetasuccess;
        
        items[sources[i].key+metaSuffix] = md;
        keysToLoad.push(sources[i].key+metaSuffix);
      }
      
      items[sources[i].key] = o;
      keysToLoad.push(sources[i].key); 
    }
    
    // load items sequentially (works more reliably than parallel loading especially on very low bandwidths)
    myself.loadnext();
  }; 
  
  /**
   * (not an actual type, use object literals with these properties)  
   * used by [startload]{@link rlDataManager#startload} to define sources
   * @typedef sourceDesc
   * @memberof rlDataManager
   * @property {string} key unique id to associate with the file within the {@link rlDataManager}
   * @property {string} srcURL relative or absolute URL to the file
   * @property {string} [overrideResponseType=arraybuffer] optional responseType to pass on to {@link rlData#startload} 
   * @property {object} [metadata=null] anything you want (e.g. for extensions or additional metadata)  
   * if omitted, [startload]{@link rlDataManager#startload} will attempt to get it from a file named "srcURL.metadata" by running JSON.parse on that files contents (if such file exists)
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
   * Get the data entry with the given key (if the key does not exist the result is undefined).
   * @function
   * @param {string} key the key which uniquely identifies the entry to get  
   * @returns {rlDataManager.dataEntry|undefined}
   */
  this.getEntry = function(key) { return items[key]; };
      
  /**
   * Get all known keys (sorted alphanumerically).
   * @function   
   * @returns {string[]}
   */
  this.getKeys = function() { 
    var key;
    var rKeys = [];
    for(key in items)
      rKeys.push(key);
      
    return rKeys.sort();      
  };
  
  /**
   * Unzip the contents of a loaded zip file entry and add the contained files directly as [dataEntry]{@link rlDataManager.dataEntry} objects to the data manager, key'ed as their (prefixed) full name as it appears inside the zip.  
   *  
   * For every filename "X" within the zip, if there is also a file named "X.metadata" (e.g. "myimage.png" and "myimage.png.metadata") in it, an attempt will be made to create an object from that files content via JSON.parse and on success, that object will be set as the metadata property in the [dataEntry]{@link rlDataManager.dataEntry}.   
   *  
   * The entry for the zip file itself is removed from the data manager afterwards.  
   * Utilizes JSZip, so the zip file must conform to the [JSZip limitations]{@link http://stuk.github.io/jszip/documentation/limitations.html}.
   * @function
   * @param {string} zipKey the key under which the zip file was loaded
   * @param {string} keyPrefix followed by a slash will be put as the beginning of each full name from the file in the zip to form a new key (or an empty string to just use the file name inside the zip as key) 
   * @param {boolean} [keepMetadataEntries=false] set to true, if the metadata files themselves should be kept as entries as well
   */
  this.unzipAndCollectItems = function(zipKey, keyPrefix, keepMetadataEntries)
  { 
    if(typeof items[zipKey] == "undefined")
      return;
      
    var keepMeta = (typeof keepMetadataEntries == "boolean") ? keepMetadataEntries : false; 
    var finalPrefix = (keyPrefix != "" ? keyPrefix+"/" : "");
    
    try
    {
      var zip = new JSZip(items[zipKey].item.getData());
      for(fname in zip.files)
      {
        if(!zip.files[fname].dir)
        {
          var li = fname.lastIndexOf(".metadata"); 
          if(!keepMeta && (li != -1 && li == (fname.length - 9)))
            continue;
        
          var file = zip.file(fname);
          var mdfile = zip.file(fname+".metadata");
          var mdo = null;
          
          if(mdfile != null)
          {
            try
            {
              mdo = JSON.parse(mdfile.asText());
            }
            catch(exc)
            { 
              mdo = null;
              console.log("(zipKey: "+zipKey+") Exception in rlDataManager.unzipAndCollectKeys while trying to create metadata object from("+mdfile.name+")"+": "+exc.message);
            };
          }
        
          var o = { item: new rlData(finalPrefix+fname, zipKey), 
                    metadata: mdo,
                    failInfo: null };
          o.item.setData(file.asArrayBuffer());
          
          items[finalPrefix+fname] = o;
        }
      }
      delete zip;
      delete items[zipKey];
    }
    catch(exc)
    {
      console.log("(zipKey: "+zipKey+") Exception in rlDataManager.unzipAndCollectKeys: "+exc.message);
    }
  };
};

/**
 * Provides methods to create various objects from binary data in ArrayBuffer objects.  
 * @namespace
 */
var rlDataObjectFactory = function()
{ 
  /**
   * Create an image object from the given binary data.
   * @see [HTMLImageElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLImageElement}
   * @memberof rlDataObjectFactory 
   * @function
   * @param {ArrayBuffer} sourceArrayBuffer the source binary data (must contain image file data)
   * @param {string} [mimeType="image/png"] the MIME type of the binary data 
   * @returns {HTMLImageElement|null} null is returned if an error/exception occured
   */
  var createImage = function(sourceArrayBuffer, mimeType) 
  { 
    try
    {
      var img = document.createElement("img");  
      var blob = new Blob( [ sourceArrayBuffer ], { type: (typeof mimeType != "undefined" ? mimeType : "image/png") } ); 
      img.src = URL.createObjectURL(blob);
      URL.revokeObjectURL(blob);
      
      return img;
    }
    catch(exc)
    {             
      console.log("Exception in rlDataObjectFactory.createImage: "+exc.message);
      return null;
    }
  };
  
  /**
   * Create an audio object from the given binary data.
   * @see [HTMLAudioElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement}
   * @memberof rlDataObjectFactory 
   * @function
   * @param {ArrayBuffer} sourceArrayBuffer the source binary data (must contain audio file data)
   * @param {string} [mimeType="audio/wav"] the MIME type of the binary data 
   * @returns {HTMLAudioElement|null} null is returned if an error/exception occured
   */
  var createAudio = function(sourceArrayBuffer, mimeType) 
  { 
    try
    {
      var sound = document.createElement("audio");  
      var blob = new Blob( [ sourceArrayBuffer ], { type: (typeof mimeType != "undefined" ? mimeType : "audio/wav") } ); 
      sound.src = URL.createObjectURL(blob);
      URL.revokeObjectURL(blob);
      
      return sound;
    }
    catch(exc)
    {             
      console.log("Exception in rlDataObjectFactory.createAudio: "+exc.message);
      return null;
    }
  };
  
  return {
    createImage: createImage,
    createAudio: createAudio
  };
}();