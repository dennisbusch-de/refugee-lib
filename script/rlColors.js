// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Color/Palette functions.   
 * contains: {@link rlPalette} | {@link rlColors}  
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

// 
var rlColorConversion = function()
{
  /** (not an actual type, use object literals with these properties)
   * @typedef rgb
   * @memberof rlColors
   * @property {number} r red component (0.0 to 1.0)
   * @property {number} g green component (0.0 to 1.0)
   * @property {number} b blue component (0.0 to 1.0)
   */
   
  /** (not an actual type, use object literals with these properties)
   * @typedef ypbpr
   * @memberof rlColors
   * @property {number} y luma
   * @property {number} pb difference between blue and luma 
   * @property {number} pr difference between red and luma 
   */ 
  
  /** 
   * Convert an HTML color string to an [rgb]{@link rlColors.rgb} triplet.    
   * @memberof rlColors
   * @function
   * @param {string} htmlCode the html color string to convert, e.g. "#234266"    
   * @returns {rlColors.rgb}
   */
  var HTMLtoRGB = function(htmlCode) 
  {
    var r,g,b;
    if (htmlCode.charAt(0) == '#') 
    {
      htmlCode = htmlCode.substr(1);
    }

    r = parseInt(htmlCode.substr(0,2), 16) / 255;
    g = parseInt(htmlCode.substr(2,2), 16) / 255;
    b = parseInt(htmlCode.substr(4,2), 16) / 255;
    return { r: r, g: g, b: b };
  };
   
  /** 
   * Convert an [rgb]{@link rlColors.rgb} triplet to an HTML color string.    
   * @memberof rlColors
   * @function
   * @param {rlColors.rgb} rgb the triplet to convert, e.g. { r: 0.13, g: 0.37, b: 0.42 }   
   * @returns {string}
   */
  var RGBtoHTML = function(rgb)
  {
    var h = "#", t = "", n = 0, pa = ["r","g","b"];
    for(p in pa)
    {
      n = rgb[pa[p]];
      n = (n < 0.0) ? 0.0 : ( (n > 1.0) ? 1.0 : n );  
      t = Math.floor(n*255).toString(16).toUpperCase();
      t = (t.length == 1 ? "0" : "")+t;
      h += t;
    }
    return h;
  };
    
  /**
   * Convert an [rgb]{@link rlColors.rgb} triplet to a [ypbpr]{@link rlColors.ypbpr} triplet.
   * @memberof rlColors
   * @function
   * @param {rlColors.rgb} rgb the triplet to convert, e.g. { r: 0.10, g: 0.03, b: 0.81 }
   * @returns {rlColors.ypbpr}
   */
  var RGBtoYPBPR = function(rgb)
  {
    return {  y:     0.299 * rgb.r +     0.587 * rgb.g +     0.114 * rgb.b, 
             pb: -0.168736 * rgb.r + -0.331264 * rgb.g +       0.5 * rgb.b,
             pr:       0.5 * rgb.r + -0.418688 * rgb.g + -0.081312 * rgb.b };
  };
  
  /**
   * Convert a [ypbpr]{@link rlColors.ypbpr} triplet to an [rgb]{@link rlColors.rgb} triplet.
   * @memberof rlColors
   * @function
   * @param {rlColors.ypbpr} ypbpr the triplet to convert
   * @returns {rlColors.rgb}
   */
  var YPBPRtoRGB = function(ypbpr)
  {
    return { r: ypbpr.y +                            1.402 * ypbpr.pr, 
             g: ypbpr.y + -0.344136 * ypbpr.pb + -0.714136 * ypbpr.pr,
             b: ypbpr.y +     1.772 * ypbpr.pb };
  };
  
  /**
   * Convert a [ypbpr]{@link rlColors.ypbpr} triplet to an HTML color string.
   * @memberof rlColors
   * @function
   * @param {rlColors.ypbpr} ypbpr the triplet to convert
   * @returns {string}
   */
  var YPBPRtoHTML = function(ypbpr)
  {
    return RGBtoHTML(YPBPRtoRGB(ypbpr));
  };
  
  /**
   * Convert an HTML color string to a [ypbpr]{@link rlColors.ypbpr} triplet.
   * @memberof rlColors
   * @function
   * @param {string} htmlCode the html color string to convert, e.g. "#234266"
   * @returns {rlColors.ypbpr}
   */
  var HTMLtoYPBPR = function(htmlCode)
  {
    return RGBtoYPBPR(HTMLtoRGB(htmlCode));
  };

  return {
    HTMLtoRGB: HTMLtoRGB,
    RGBtoHTML: RGBtoHTML,
    RGBtoYPBPR: RGBtoYPBPR,
    YPBPRtoRGB: YPBPRtoRGB,
    YPBPRtoHTML: YPBPRtoHTML,
    HTMLtoYPBPR: HTMLtoYPBPR 
  };
}(); 


/** (not an actual type, use object literals with these properties)
 * @typedef namedColor
 * @memberof rlPalette
 * @property {string} name the name to use for the color, e.g. "fullWhite"
 * @property {string} htmlCode the html code defining the color, e.g. "#FFFFFF"
 * @property {number} [r=converted from htmlCode] the red component of a palette entry
 * @property {number} [g=converted from htmlCode] the green component of a palette entry
 * @property {number} [b=converted from htmlCode] the blue component of a palette entry
 */

/**
 * Instantiates a named palette with a given array of named colors and adds each
 * of those colors as a property of the same name to itself, as well as linking the color
 * to an index number, so a color in the palette can be accessed by both its name and by its index.
 * Also initializes red, green and blue componenents from the given htmlCode of each named color.
 * So, a color in the palette is accessed as e.g. p["black"] or p[0] and each color in the palette
 * has the properties: name, index, htmlCode, r, g and b     
 * @constructor
 * @param {string} paletteName the name of the palette
 * @param {rlPalette.namedColor[]|null} namedColors the array of color definitions to put into the palette (set to null to use the following parameter instead)
 * @param {string} [colNameCodePairs] comma separated string with pairs of names and htmlcodes of colors eg. "black#000000,white#FFFFFF" (ignored if namedColors is used)
 */
var rlPalette = function(paletteName, namedColors, colNameCodePairs)
{
  // inherit all of rlObject
  rlObject.call(this);
  this.__proto__.rlType = "rlPalette";
    
  /**
   * @property {string} name the name of the palette
   */
  this.name = paletteName;
  /** 
   * @property {number} length the number of colors stored inside the palette
   */
  this.length = 0;
  
  /**
   * Get a color by its name or index (same as using **this[nameOrIndex]** ). 
   * @function 
   * @property {string|number} nameOrIndex e.g. "white" or 15
   * @returns {rlPalette.namedColor} the requested palette entry
   */
  this.getColor = function(nameOrIndex)
  {
    return this[nameOrIndex];
  }; 
  
  var colors = [];
  if(namedColors != null)
  {
    colors = namedColors;
  }
  else
  {
    var c = 0;
    var namesAndCodes = colNameCodePairs.split(",");
         
    for(c=0; c<namesAndCodes.length; c++)
    {
      var pair = namesAndCodes[c].split("#");
      colors.push( { name: pair[0].trim(), htmlCode: "#"+pair[1].trim() } );
    }   
  }    
    
  
  
  var i = 0;
  for(i=0; i<colors.length; i++)
  { 
    var cname = ""+i;
    if(typeof colors[i].name != "undefined")
      cname = colors[i].name; 
    
    this[cname] = { name: cname, index: i, htmlCode: colors[i].htmlCode };
    var rgb = rlColorConversion.HTMLtoRGB(colors[i].htmlCode);
    this[cname].r = rgb.r;
    this[cname].g = rgb.g;
    this[cname].b = rgb.b;
    this[i] = this[cname];
    
    this.length++;
  }   
};

/**
 * Builtin, ready-to-use color definitions (all trademarks are the property of their respective owners).
 * @namespace
 */
var rlColors = function()
{
  // C64 colors hexcodes borrowed from http://www.pepto.de/projects/colorvic/
  // AA16 palette from http://androidarts.com/palette/16pal.htm
  // DB16 palette from http://www.pixeljoint.com/forum/forum_posts.asp?TID=12795
  // DB32 palette from http://www.pixeljoint.com/forum/forum_posts.asp?TID=16247
  var palettes = [ new rlPalette("AA16", null,
                     "void#000000,ash#9D9D9D,blind#FFFFFF,bloodred#BE2633,"+
                     "pigmeat#E06F8B,oldpoop#493C2B,newpoop#A46422,blaze#EB8931,"+
                     "zornskin#F7E26B,shadegreen#2F484E,leafgreen#44891A,slimegreen#A3CE27,"+
                     "nightblue#1B2632,seablue#005784,skyblue#31A2F2,cloudblue#B2DCEF"),
                   new rlPalette("AMSTRADCPC", null,
                     "black#000000,blue#000091,bright blue#0000FF,"+
                     "red#910000,magenta#910091,violet#9100FF,"+
                     "bright red#FF0000,purple#FF0091,bright magenta#FF00FF,"+
                     "green#009100,cyan#009191,sky blue#0091FF,"+
                     "yellow#919100,grey#919191,pale blue#9191FF,"+
                     "orange#FF9100,pink#FF9191,pale magenta#FF91FF,"+
                     "bright green#00FF00,sea green#00FF91,bright cyan#00FFFF,"+
                     "lime green#91FF00,pale green#91FF91,pale cyan#91FFFF,"+
                     "bright yellow#FFFF00,pale yellow#FFFF91,white#FFFFFF"),
                   new rlPalette("APPLEII", null, 
                     "black#040204,magenta#7C3A54,dark blue#54468C,purple#DC4EF4,"+
                     "dark green#1C6A54,grey 1#949294,medium blue#34A6F4,light blue#CCC2FC,"+
                     "brown#545E0C,orange#DC7A1C,grey 2#949294,pink#ECB6CC,"+
                     "green#34CE1C,yellow#CCD29C,aqua#A4DECC,white#FCFEFC"),
                   new rlPalette("C64", null, 
                     "black#000000,white#FFFFFF,red#68372B,cyan#70A4B2,purple#6F3D86,"+
                     "green#588D43,blue#352879,yellow#B8C76F,orange#6F4F25,"+
                     "brown#433900,light red#9A6759,dark grey#444444,grey#6C6C6C,"+
                     "light green#9AD284,light blue#6C5EB5,light grey#959595"),
                   new rlPalette("CGA", null,
                     "black#000000,low blue#0000B7,low green#00B700,low cyan#00B7B7,"+
                     "low red#B70000,low magenta#B700B7,brown#B76800,light grey#B7B7B7,"+
                     "dark grey#686868,high blue#6868FF,high green#68FF68,high cyan#68FFFF,"+
                     "high red#FF6868,high magenta#FF68FF,yellow#FFFF68,white#FFFFFF"), 
                   new rlPalette("DB16", null,
                     "black#140C1C,dark brown#442434,deep blue#30346D,dark grey#4E4A4E,"+
                     "brown#854C30,dark green#346524,blood red#D04648,grey#757161,"+
                     "sky blue#597DCE,orange#D27D2C,light grey#8595A1,light green#6DAA2C,"+
                     "light skin#D2AA99,turquoise#6DC2CA,yellow#DAD45E,white#DEEED6"),
                   new rlPalette("DB32", null,
                     "black#000000,valhalla#222034,loulou#45283C,oiled cedar#663931,"+
                     "rope#8F563B,tahiti gold#DF7126,twine#D9A066,pancho#EEC39A,"+
                     "golden fizz#FBF236,atlantis#99E550,christi#6ABE30,elf green#37946E,"+
                     "dell#4B692F,verdigris#524B24,opal#323C39,deep koamaru#3F3F74,"+
                     "venice blue#306082,royal blue#5B6EE1,cornflower#639BFF,viking#5FCDE4,"+
                     "light steel blue#CBDBFC,white#FFFFFF,heather#9BADB7,topaz#847E87,"+
                     "dim gray#696A6A,smokey ash#595652,clairvoyant#76428A,brown#AC3232,"+
                     "mandy#D95763,plum#D77BBA,rain forest#8F974A,stinger#8A6F30"),
                   new rlPalette("GB", null, 
                     "black#000000,dark grey#505050,light grey#A0A0A0,white#FFFFFF"),
                   new rlPalette("MSX", null,
                     "transparent#000000,black#000000,medium green#3EB849,light green#74D07D,"+
                     "dark blue#5955E0,light blue#8076F1,dark red#B95E51,cyan#65DBEF,"+
                     "medium red#DB6559,light red#FF897D,dark yellow#CCC35E,light yellow#DED087,"+
                     "dark green#3AA241,magenta#B766B5,grey#CCCCCC,white#FFFFFF"),
                   new rlPalette("TELETEXT", null, 
                     "black#000000,blue#0000FF,green#00FF00,cyan#00FFFF,"+
                     "red#FF0000,purple#FF00FF,yellow#FFFF00,white#FFFFFF"),
                   new rlPalette("TO70/7", null,
                     "black#000000,red#FF0000,green#00FF00,yellow#FFFF00,blue#0000FF,"+
                     "purple#FF00FF,cyan#00FFFF,white#FFFFFF,grey#BBBBBB,"+
                     "pale red#DD7777,pale green#77DD77,pale yellow#DDDD77,pale blue#7777DD,"+
                     "pale purple#DD77EE,pale cyan#BBFFFF,orange#EEBB00"),
                   new rlPalette("VIC20", null, 
                     "black#000000,white#FFFFFF,red#782922,cyan#87D6DD,"+
                     "purple#AA5FB6,green#55A049,blue#40318D,yellow#BFCE72,"+
                     "orange#AA7449,light orange#EAB489,light red#B86962,light cyan#C7FFFF,"+
                     "light purple#EA9FF6,light green#94E089,light blue#8071CC,light yellow#FFFFB2"),
                   new rlPalette("ZXSPECTRUM", null,
                     "black#000000,basic blue#000080,basic red#800000,basic magenta#800080,"+
                     "basic green#008000,basic cyan#008080,basic yellow#808000,basic white#808080,"+
                     "black#000000,bright blue#0000FF,bright red#FF0000,bright magenta#FF00FF,"+
                     "bright green#00FF00,bright cyan#00FFFF,bright yellow#FFFF00,bright white#FFFFFF")
                 ];
                 
  var paletteIndex = {};
  var names = [];
    
  
  // START of NESlike palette generation
  // generate full NESlike palette range from 4 linear luma levels and 12 NTSC chroma combinations
  // (based on bit descriptions from: http://problemkaputt.de/everynes.htm#ppupalettes and http://nesdev.com/2C02%20technical%20reference.TXT 
  //  and on colorwheel description from here http://www.ntsc-tv.com/ntsc-index-06.htm) 
  var nesPal = "";
  var luma = [ 0.25, 0.50, 0.98, 1.0 ];
  var wheelDegrees = [ 347, 17, 47, 77, 107, 137, 167, 197, 217, 247, 277, 307 ];  
  var toRAD = Math.PI/180;
  var l = 0, chroma = 0;
  for(l=0; l<luma.length; l++)
  {
    for(chroma=0; chroma<16; chroma++)
    {
      var col = (l*16+chroma).toString(16).toUpperCase();
      col = "0x"+(col.length == 1 ? "0"+col : col);
      var code = "#000000";
      var ypbpr = { y: luma[l], pb: 0, pr: 0 };
      if(chroma >= 14)
        ypbpr.y = 0;
      else if(chroma == 13)
      {
        if(l<2) // "reserved(blacker than black)" & "black"
          ypbpr.y = 0;
        if(l==2)
          ypbpr.y = 0.2; // "dark grey"
        if(l==3)
          ypbpr.y = 0.55; // "slightly brighter light gray"  
      }  
      else if(chroma != 0 && chroma != 13)
      {
        ypbpr.y = l != 2 ? luma[l] : 0.75;
          
        ypbpr.pb = Math.cos(wheelDegrees[chroma-1]*toRAD)*0.25;         
        ypbpr.pr = Math.sin(wheelDegrees[chroma-1]*toRAD)*0.25;  
      } 
      
      code = rlColorConversion.YPBPRtoHTML(ypbpr);
      
      nesPal += col+code+",";  
    }
  }
  nesPal = nesPal.substr(0,nesPal.length-1);
  palettes.push(new rlPalette("NES*", null, nesPal));
  // END of NESlike palette generation

  // register all palettes
  var p = 0;
  for(p=0; p<palettes.length; p++)
  {
    paletteIndex[palettes[p].name] = palettes[p];
    names.push(palettes[p].name);
  }
  names = names.sort();
    
    
  /** 
   * Get one of the built-in well-known (from oldschool hardware or from the pixelart community) palettes of **Refugee Lib**.
   * valid palette names are: AA16, AMSTRADCPC, APPLEII, C64, CGA, DB16, DB32, GB, MSX, NES*, TELETEXT, TO7/70, VIC20, ZXSPECTRUM  
   * @see [C64 palette at pepto.de]{@link http://www.pepto.de/projects/colorvic/} | [8bit computer palettes at wikipedia.org]{@link http://en.wikipedia.org/wiki/List_of_8-bit_computer_hardware_palettes} | [(AA16) AndroidArts aka Arne's 16 color palette]{@link http://androidarts.com/palette/16pal.htm} | [(DB16) DawnBringer's 16 color palette]{@link http://www.pixeljoint.com/forum/forum_posts.asp?TID=12795} | [(DB32) DawnBringer's 32 color palette]{@link http://www.pixeljoint.com/forum/forum_posts.asp?TID=16247}   
   * @memberof rlColors 
   * @function
   * @param {string} name the name of the palette to get    
   * @returns {rlPalette}
   */    
  var getPalette = function(name)
  {
    return paletteIndex[name];
  };
   
  /**
   * Test if there is a built-in palette with the given name.
   * @memberof rlColors
   * @function
   * @param {string} name the name of the palette to test
   * @returns {boolean}
   */
  var hasPalette = function(name)
  { 
    return (typeof paletteIndex[name] != "undefined");
  };
  
  /**
   * Get an array of all built-in palette names.
   * @memberof rlColors
   * @function
   * @returns {string[]}
   */  
  var getPaletteNames = function()
  {
    return [].concat(names);
  };
  console.log(getPaletteNames());
  
                                                       
  return {
    HTMLtoRGB: rlColorConversion.HTMLtoRGB,
    RGBtoHTML: rlColorConversion.RGBtoHTML,
    RGBtoYPBPR: rlColorConversion.RGBtoYPBPR,
    YPBPRtoRGB: rlColorConversion.YPBPRtoRGB,
    YPBPRtoHTML: rlColorConversion.YPBPRtoHTML,
    HTMLtoYPBPR: rlColorConversion.HTMLtoYPBPR,
    getPalette: getPalette,
    hasPalette: hasPalette,
    getPaletteNames: getPaletteNames
  };  
}();