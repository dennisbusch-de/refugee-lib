// -----------------------------------------------------------------------------
// Refugee Lib - WIP
// data manager
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
                         
  // callbacks for use by datamanager
  this.onloadfailed = null; // (key, srcURL, httpStatusCode)
  this.onloadprogress = null; // (key, srcURL, bytesLoaded, bytesTotal)
  this.onloadsuccess = null; // (key, srcURL, bytesLoaded, bytesTotal)
                   
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
  this.startload = startload; 
  
  var getData = function() {
    if(alreadyLoaded)
      return binarydata;
    else
      return null;      
  };
  this.getData = getData;
  
  var getLoadState = function() {
    return { key: key, srcURL: srcURL, bytesLoaded: bytesLoaded, bytesTotal: bytesTotal };
  };                                                            
  this.getLoadState = getLoadState;
  
  var getLoadStateCompactString = function() {
    return ""+key+" : "+srcURL.substr(srcURL.lastIndexOf("/")+1)+" : "+bytesLoaded+" / "+(bytesTotal == 0 ? "?" : bytesTotal);
  };
  this.getLoadStateCompactString = getLoadStateCompactString;
  
  this.getKey = function() { return key; };
};  


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
  this.onloadprogress = null; // (itemsLoaded, itemsFailed, itemsTotal) 
  this.onloadfinished = null; // (itemsLoaded, itemsFailed, itemsTotal)
        
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
  this.startload = startload;
  
  this.hasFinished = function() { return itemsLoaded + itemsFailed == itemsTotal; };
  
  this.getEntry = function(key) { return items[key]; };
  this.getItem = function(key) { return items[key].item; };
  this.getItemFailInfo = function(key) { return items[key].failInfo; };
  this.getItemProgressInfo = function(key) { return items[key].item.getLoadState(); };
  this.getItemProgressInfoString = function(key) { return items[key].item.getLoadStateCompactString(); };
  
  this.getKeys = function() { 
    var key;
    var rKeys = [];
    for(key in items)
      rKeys.push(key);
    return rKeys;      
  };
};