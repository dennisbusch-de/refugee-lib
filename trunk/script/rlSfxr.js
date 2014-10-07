// -----------------------------------------------------------------------------
// Refugee Lib
/**
 * @file Simple sound effect generator functions, using wrapped, cleaned up and modified code from [jsfxr]{@link https://github.com/grumdrig/jsfxr/} and [RIFFWAVE.js]{@link http://www.codebase.es/riffwave/riffwave.js} (jsfxr is a javascript port of [sfxr]{@link http://www.drpetter.se/project_sfxr.html}).  
 * contains: {@link rlSfxr}  
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
 * Simple sound effect generator functions, using wrapped, cleaned up and modified code from [jsfxr]{@link https://github.com/grumdrig/jsfxr/} and [RIFFWAVE.js]{@link http://www.codebase.es/riffwave/riffwave.js} (jsfxr is a javascript port of [sfxr]{@link http://www.drpetter.se/project_sfxr.html}).
 * @namespace
 */
var rlSfxr = function()
{
  var Debug = false;
  var toggleDebug = function(newState)
  { 
    Debug = (typeof newState != "undefined") ? newState : !Debug;
  };

  // -----------------------------------------------------------------------------
  // START OF RIFFWAVE.js as it was found in http://www.codebase.es/riffwave/riffwave.js (modified it here)
  /* 
   * RIFFWAVE.js v0.03 - Audio encoder for HTML5 <audio> elements.
   * Copyleft 2011 by Pedro Ladaria <pedro.ladaria at Gmail dot com>
   *
   * Public Domain
   *
   * Changelog:
   *
   * 0.01 - First release
   * 0.02 - New faster base64 encoding
   * 0.03 - Support for 16bit samples
   *   0.03fRL - fork with small modifications by Dennis for inclusion in Refugee Lib
   *
   * Notes:
   *
   * 8 bit data is unsigned: 0..255
   * 16 bit data is signed: âˆ’32,768..32,767
   */
  var FastBase64 = function()
  {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var encLookup = [];
      
    var init = function() 
    {
      for (var i=0; i<4096; i++) 
        encLookup[i] = chars[i >> 6] + chars[i & 0x3F];
    };
     
    init();
    
    var encode = function(src) 
    {
        var len = src.length;
        var dst = '';
        var i = 0;
        while (len > 2) 
        {
          n = (src[i] << 16) | (src[i+1]<<8) | src[i+2];
          dst+= encLookup[n >> 12] + encLookup[n & 0xFFF];
          len-= 3;
          i+= 3;
        }
        if (len > 0) 
        {
            var n1= (src[i] & 0xFC) >> 2;
            var n2= (src[i] & 0x03) << 4;
            if (len > 1) 
              n2 |= (src[++i] & 0xF0) >> 4;
              
            dst+= chars[n1];
            dst+= chars[n2];
            
            if (len == 2) 
            {
              var n3= (src[i++] & 0x0F) << 2;
              n3 |= (src[i] & 0xC0) >> 6;
              dst+= chars[n3];
            }
            
            if (len == 1) 
              dst+= '=';
              
            dst+= '=';
        }
        return dst;
    };
    
    return {
      encode: encode
    };
  }();

  var RIFFwave = function(data) 
  {
    this.data = [];        // Array containing audio samples
    this.wav = [];         // Array containing the generated wave file
    this.dataURI = '';     // http://en.wikipedia.org/wiki/Data_URI_scheme
    this.header = 
    {                                         // OFFS SIZE NOTES
        chunkId      : [0x52,0x49,0x46,0x46], // 0    4    "RIFF" = 0x52494646
        chunkSize    : 0,                     // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
        format       : [0x57,0x41,0x56,0x45], // 8    4    "WAVE" = 0x57415645
        subChunk1Id  : [0x66,0x6d,0x74,0x20], // 12   4    "fmt " = 0x666d7420
        subChunk1Size: 16,                    // 16   4    16 for PCM
        audioFormat  : 1,                     // 20   2    PCM = 1
        numChannels  : 1,                     // 22   2    Mono = 1, Stereo = 2...
        sampleRate   : 8000,                  // 24   4    8000, 44100...
        byteRate     : 0,                     // 28   4    SampleRate*NumChannels*BitsPerSample/8
        blockAlign   : 0,                     // 32   2    NumChannels*BitsPerSample/8
        bitsPerSample: 8,                     // 34   2    8 bits = 8, 16 bits = 16
        subChunk2Id  : [0x64,0x61,0x74,0x61], // 36   4    "data" = 0x64617461
        subChunk2Size: 0                      // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
    };
    
    var u32ToArray = function(i) 
    {
      return [i&0xFF, (i>>8)&0xFF, (i>>16)&0xFF, (i>>24)&0xFF];
    };
    
    var u16ToArray = function(i) 
    {
      return [i&0xFF, (i>>8)&0xFF];
    };
    
    var split16bitArray = function(data) 
    { 
      var r = [];
      var j = 0;
      var len = data.length;
      for (var i=0; i<len; i++) 
      {
        r[j++] = data[i] & 0xFF;
        r[j++] = (data[i]>>8) & 0xFF;
      }        
      return r;
    };
    
    this.make = function(data) 
    {
      if (data instanceof Array) 
        this.data = data;
      this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
      this.header.byteRate = this.header.blockAlign * this.sampleRate;
      this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
      this.header.chunkSize = 36 + this.header.subChunk2Size;
      this.wav = this.header.chunkId.concat(
          u32ToArray(this.header.chunkSize),
          this.header.format,
          this.header.subChunk1Id,
          u32ToArray(this.header.subChunk1Size),
          u16ToArray(this.header.audioFormat),
          u16ToArray(this.header.numChannels),
          u32ToArray(this.header.sampleRate),
          u32ToArray(this.header.byteRate),
          u16ToArray(this.header.blockAlign),
          u16ToArray(this.header.bitsPerSample),    
          this.header.subChunk2Id,
          u32ToArray(this.header.subChunk2Size),
          (this.header.bitsPerSample == 16) ? split16bitArray(this.data) : this.data
      );
      
      this.dataURI = 'data:audio/wav;base64,'+FastBase64.encode(this.wav);
    };
    
    if (data instanceof Array) this.make(data);
  };
  //END OF RIFFWAVE.js
  //-----------------------------------------------------------------------------

  // -----------------------------------------------------------------------------
  // START OF sfxr.js as found in https://github.com/grumdrig/jsfxr/ (modified it here)   
  
  // waveforms
  var SQUARE = 0;
  var SAWTOOTH = 1;
  var SINE = 2;
  var NOISE = 3;

  var masterVolume = 1;

  var OVERSAMPLING = 8;

  var defaultKnobs = {
    shape: SQUARE, // SQUARE/SAWTOOTH/SINE/NOISE

    attack:  0,   // sec
    sustain: 0.2, // sec
    punch:   0,   // proportion
    decay:   0.2, // sec

    frequency:        1000, // Hz
    frequencyMin:        0, // Hz
    frequencySlide:      0, // 8va/sec
    frequencySlideSlide: 0, // 8va/sec/sec

    vibratoDepth:  0, // proportion
    vibratoRate:  10, // Hz

    arpeggioFactor: 1,   // multiple of frequency
    arpeggioDelay:  0.1, // sec  
    
    dutyCycle:      0.5, // proportion of wavelength
    dutyCycleSweep: 0,   // proportion/second

    retriggerRate: 0, // Hz

    flangerOffset: 0, // sec
    flangerSweep:  0, // offset/sec

    lowPassFrequency: 44100, // Hz
    lowPassSweep:     1,     // ^sec
    lowPassResonance: 0.5,   // proportion

    highPassFrequency: 0, // Hz
    highPassSweep:     0, // ^sec
    
    gain: -10, // dB

    sampleRate: 44100, // Hz
    sampleSize: 8,     // bits per channel
  };

  var knobs = function(settings) {
    settings = settings||{};
    for (var i in defaultKnobs) 
    {
      if (settings.hasOwnProperty(i))
        this[i] = settings[i];
      else
        this[i] = defaultKnobs[i];
    }
  };
  
  var sqr = function(x) { return x * x; };
  var cube = function(x) { return x * x * x; };
  var sign = function(x) { return x < 0 ? -1 : 1; };
  var log = function(x, b) { return Math.log(x) / Math.log(b); };
  var pow = Math.pow;

  // Translate from UI-friendly settings to human-friendly ones
  knobs.prototype.translate = function (ps) 
  { 
    this.shape = ps.wave_type;

    this.attack = sqr(ps.p_env_attack) * 100000 / 44100;
    this.sustain = sqr(ps.p_env_sustain) * 100000 / 44100;
    this.punch = ps.p_env_punch;
    this.decay = sqr(ps.p_env_decay) * 100000 / 44100;

    this.frequency = OVERSAMPLING * 441 * (sqr(ps.p_base_freq) + 0.001);
    if (ps.p_freq_limit > 0)
      this.frequencyMin = OVERSAMPLING * 441 * (sqr(ps.p_freq_limit) + 0.001);
    else
      this.frequencyMin = 0;
    this.enableFrequencyCutoff = (ps.p_freq_limit > 0);
    this.frequencySlide = 44100 * log(1 - cube(ps.p_freq_ramp) / 100, 0.5);
    this.frequencySlideSlide = -cube(ps.p_freq_dramp) / 1000000 * 
      44100 * pow(2, 44101/44100);

    this.vibratoRate = 44100 * 10 / 64 * sqr(ps.p_vib_speed) / 100;
    this.vibratoDepth = ps.p_vib_strength / 2;

    this.arpeggioFactor = 1 / ((ps.p_arp_mod >= 0) ? 
                               1 - sqr(ps.p_arp_mod) * 0.9 : 
                               1 + sqr(ps.p_arp_mod) * 10);
    this.arpeggioDelay = ((ps.p_arp_speed === 1) ? 0 :
                  Math.floor(sqr(1 - ps.p_arp_speed) * 20000 + 32) / 44100);

    this.dutyCycle = (1 - ps.p_duty) / 2;
    this.dutyCycleSweep = OVERSAMPLING * 44100 * -ps.p_duty_ramp / 20000;

    this.retriggerRate = 44100 / ((ps.p_repeat_speed === 0) ? 0 :
                         Math.floor(sqr(1 - ps.p_repeat_speed) * 20000) + 32);

    this.flangerOffset = sign(ps.p_pha_offset) * 
      sqr(ps.p_pha_offset) * 1020 / 44100;
    this.flangerSweep = sign(ps.p_pha_ramp) * sqr(ps.p_pha_ramp);

    this.enableLowPassFilter = (ps.p_lpf_freq != 1);
    function flurp(x) { return x / (1-x) }
    this.lowPassFrequency = ps.p_lpf_freq === 1 ? 44100 :
      Math.round(OVERSAMPLING * 44100 * flurp(cube(ps.p_lpf_freq) / 10));
    this.lowPassSweep = pow(1 + ps.p_lpf_ramp / 10000, 44100);
    this.lowPassResonance = 1 - (5 / (1 + sqr(ps.p_lpf_resonance) * 20)) / 9;

    this.highPassFrequency = Math.round(OVERSAMPLING * 44100 * 
                                        flurp(sqr(ps.p_hpf_freq) / 10));
    this.highPassSweep = pow(1 + ps.p_hpf_ramp * 0.0003, 44100);

    this.gain = 10 * log(sqr(Math.exp(ps.sound_vol) - 1), 10);

    this.sampleRate = ps.sample_rate;
    this.sampleSize = ps.sample_size;

    return this;
  };

  // Sound generation parameters are on [0,1] unless noted SIGNED & thus
  // on [-1,1]
  var params = function () 
  {
    this.oldParams = true;  // Note what structure this is

    // Wave shape
    this.wave_type = SQUARE;

    // Envelope
    this.p_env_attack = 0;   // Attack time
    this.p_env_sustain = 0.3;  // Sustain time
    this.p_env_punch = 0;    // Sustain punch
    this.p_env_decay = 0.4;    // Decay time

    // Tone
    this.p_base_freq = 0.3;    // Start frequency
    this.p_freq_limit = 0;   // Min frequency cutoff
    this.p_freq_ramp = 0;    // Slide (SIGNED)
    this.p_freq_dramp = 0;   // Delta slide (SIGNED)
    // Vibrato
    this.p_vib_strength = 0; // Vibrato depth
    this.p_vib_speed = 0;    // Vibrato speed

    // Tonal change
    this.p_arp_mod = 0;      // Change amount (SIGNED)
    this.p_arp_speed = 0;    // Change speed

    // Square wave duty (proportion of time signal is high vs. low)
    this.p_duty = 0;         // Square duty
    this.p_duty_ramp = 0;    // Duty sweep (SIGNED)

    // Repeat
    this.p_repeat_speed = 0; // Repeat speed

    // Flanger
    this.p_pha_offset = 0;   // Flanger offset (SIGNED)
    this.p_pha_ramp = 0;     // Flanger sweep (SIGNED)

    // Low-pass filter
    this.p_lpf_freq = 1;     // Low-pass filter cutoff
    this.p_lpf_ramp = 0;     // Low-pass filter cutoff sweep (SIGNED)
    this.p_lpf_resonance = 0;// Low-pass filter resonance
    // High-pass filter
    this.p_hpf_freq = 0;     // High-pass filter cutoff
    this.p_hpf_ramp = 0;     // High-pass filter cutoff sweep (SIGNED)

    // Sample parameters
    this.sound_vol = 0.5;
    this.sample_rate = 44100;
    this.sample_size = 8;
  };

  var frnd = function (range) 
  {
    return Math.random() * range;
  };

  var rndr = function(from, to) 
  {
    return Math.random() * (to - from) + from;
  };

  var rnd = function(max) 
  {
    return Math.floor(Math.random() * (max + 1));
  };

  // These functions roll up random sounds appropriate to various
  // typical game events:
  params.prototype.pickupCoin = function () {
    this.p_base_freq = 0.4 + frnd(0.5);
    this.p_env_attack = 0;
    this.p_env_sustain = frnd(0.1);
    this.p_env_decay = 0.1 + frnd(0.4);
    this.p_env_punch = 0.3 + frnd(0.3);
    if (rnd(1)) {
      this.p_arp_speed = 0.5 + frnd(0.2);
      this.p_arp_mod = 0.2 + frnd(0.4);
    }
    return this;
  };

  knobs.prototype.pickupCoin = function () {
    this.frequency = rndr(568, 2861);
    this.attack = 0;
    this.sustain = frnd(0.227);
    this.decay = rndr(0.227, 0.567);
    this.punch = rndr(0.3, 0.6);
    if (rnd(1)) {
      this.arpeggioFactor = rndr(1.037, 1.479);
      this.arpeggioDelay = rndr(0.042, 0.114);
    }
    return this;
  };

  params.prototype.laserShoot = function () {
    this.wave_type = rnd(2);
    if(this.wave_type === SINE && rnd(1))
      this.wave_type = rnd(1);
    if (rnd(2) === 0) {
      this.p_base_freq = 0.3 + frnd(0.6);
      this.p_freq_limit = frnd(0.1);
      this.p_freq_ramp = -0.35 - frnd(0.3);
    } else {
      this.p_base_freq = 0.5 + frnd(0.5);
      this.p_freq_limit = this.p_base_freq - 0.2 - frnd(0.6);
      if (this.p_freq_limit < 0.2) this.p_freq_limit = 0.2;
      this.p_freq_ramp = -0.15 - frnd(0.2);
    }
    if (this.wave_type === SAWTOOTH)
      this.p_duty = 1;
    if (rnd(1)) {
      this.p_duty = frnd(0.5);
      this.p_duty_ramp = frnd(0.2);
    } else {
      this.p_duty = 0.4 + frnd(0.5);
      this.p_duty_ramp = -frnd(0.7);
    }
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + frnd(0.2);
    this.p_env_decay = frnd(0.4);
    if (rnd(1))
      this.p_env_punch = frnd(0.3);
    if (rnd(2) === 0) {
      this.p_pha_offset = frnd(0.2);
      this.p_pha_ramp = -frnd(0.2);
    }
    //if (rnd(1))
      this.p_hpf_freq = frnd(0.3);

    return this;
  };

  knobs.prototype.laserShoot = function () {
    this.shape = rnd(2);
    if(this.shape === SINE && rnd(1))
      this.shape = rnd(1);
    if (rnd(2) === 0) {
      this.frequency = rndr(321, 2861);
      this.frequencyMin = frnd(38.8);
      this.frequencySlide = rndr(-27.3, -174.5);
    } else {
      this.frequency = rndr(321, 3532);
      this.frequencyMin = rndr(144, 2/3 * this.frequency);
      this.frequencySlide = rndr(-2.15, -27.27);
    }
    if (this.shape === SAWTOOTH)
      this.dutyCycle = 0;
    if (rnd(1)) {
      this.dutyCycle = rndr(1/4, 1/2);
      this.dutyCycleSweep = rndr(0, -3.528);
    } else {
      this.dutyCycle = rndr(0.05, 0.3);
      this.dutyCycleSweep = frnd(12.35);
    }
    this.attack = 0;
    this.sustain = rndr(0.02, 0.2);
    this.decay = frnd(0.36);
    if (rnd(1))
      this.punch = frnd(0.3);
    if (rnd(2) === 0) {
      this.flangerOffset = frnd(0.001);
      this.flangerSweep = -frnd(0.04);
    }
    if (rnd(1))
      this.highPassFrequency = frnd(3204);

    return this;
  };

  params.prototype.explosion = function () {
    this.wave_type = NOISE;
    if (rnd(1)) {
      this.p_base_freq = sqr(0.1 + frnd(0.4));
      this.p_freq_ramp = -0.1 + frnd(0.4);
    } else {
      this.p_base_freq = sqr(0.2 + frnd(0.7));
      this.p_freq_ramp = -0.2 - frnd(0.2);
    }
    if (rnd(4) === 0)
      this.p_freq_ramp = 0;
    if (rnd(2) === 0)
      this.p_repeat_speed = 0.3 + frnd(0.5);
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + frnd(0.3);
    this.p_env_decay = frnd(0.5);
    if (rnd(1)) {
      this.p_pha_offset = -0.3 + frnd(0.9);
      this.p_pha_ramp = -frnd(0.3);
    }
    this.p_env_punch = 0.2 + frnd(0.6);
    if (rnd(1)) {
      this.p_vib_strength = frnd(0.7);
      this.p_vib_speed = frnd(0.6);
    }
    if (rnd(2) === 0) {
      this.p_arp_speed = 0.6 + frnd(0.3);
      this.p_arp_mod = 0.8 - frnd(1.6);
    }

    return this;
  };

  knobs.prototype.explosion = function () {
    this.shape = NOISE;
    if (rnd(1)) {
      this.frequency = rndr(4, 224);
      this.frequencySlide = rndr(-0.623, 17.2);
    } else {
      this.frequency = rndr(9, 2318);
      this.frequencySlide = rndr(-5.1, -40.7);
    }
    if (rnd(4) === 0)
      this.frequencySlide = 0;
    if (rnd(2) === 0)
      this.retriggerRate = rndr(4.5, 53);
    this.attack = 0;
    this.sustain = rndr(0.0227, 0.363);
    this.decay = frnd(0.567);
    if (rnd(1)) {
      this.flangerOffset = rndr(-0.0021, 0.0083);
      this.flangerSweep = -frnd(0.09);
    }
    this.punch = 0.2 + frnd(0.6);
    if (rnd(1)) {
      this.vibratoDepth = frnd(0.35);
      this.vibratoRate = frnd(24.8);
    }
    if (rnd(2) === 0) {
      this.arpeggioFactor = rndr(0.135, 2.358);
      this.arpeggioDelay = rndr(0.00526, 0.0733);
    }
    return this;
  };

  params.prototype.powerUp = function () {
    if (rnd(1)) {
      this.wave_type = SAWTOOTH;
      this.p_duty = 1;
    } else {
      this.p_duty = frnd(0.6);
    }
    this.p_base_freq = 0.2 + frnd(0.3);
    if (rnd(1)) {
      this.p_freq_ramp = 0.1 + frnd(0.4);
      this.p_repeat_speed = 0.4 + frnd(0.4);
    } else {
      this.p_freq_ramp = 0.05 + frnd(0.2);
      if (rnd(1)) {
        this.p_vib_strength = frnd(0.7);
        this.p_vib_speed = frnd(0.6);
      }
    }
    this.p_env_attack = 0;
    this.p_env_sustain = frnd(0.4);
    this.p_env_decay = 0.1 + frnd(0.4);

    return this;
  };
  
  knobs.prototype.powerUp = function () {
    if (rnd(1)) {
      this.shape = SAWTOOTH;
      this.dutyCycle = 0;
    } else {
      this.dutyCycle = rndr(0.2, 0.5);
    }
    this.frequency = rndr(145, 886);
    if (rnd(1)) {
      this.frequencySlide = rndr(0.636, 79.6);
      this.retriggerRate = rndr(6, 53);
    } else {
      this.frequencySlide = rndr(0.0795, 9.94);
      if (rnd(1)) {
        this.vibratoDepth = frnd(0.35);
        this.vibratoRate = frnd(24.8);
      }
    }
    this.attack = 0;
    this.sustain = frnd(0.363);
    this.decay = rndr(0.023, 0.57);

    return this;
  };

  params.prototype.hitHurt = function () {
    this.wave_type = rnd(2);
    if (this.wave_type === SINE)
      this.wave_type = NOISE;
    if (this.wave_type === SQUARE)
      this.p_duty = frnd(0.6);
    if (this.wave_type === SAWTOOTH)
      this.p_duty = 1;
    this.p_base_freq = 0.2 + frnd(0.6);
    this.p_freq_ramp = -0.3 - frnd(0.4);
    this.p_env_attack = 0;
    this.p_env_sustain = frnd(0.1);
    this.p_env_decay = 0.1 + frnd(0.2);
    if (rnd(1))
      this.p_hpf_freq = frnd(0.3);
    return this;
  };

  knobs.prototype.hitHurt = function () {
    this.shape = rnd(2);
    if (this.shape === SINE)
      this.shape = NOISE;
    if (this.shape === SQUARE)
      this.dutyCycle = rndr(0.2, 0.5);
    if (this.shape === SAWTOOTH)
      this.dutyCycle = 0;
    this.frequency = rndr(145, 2261);
    this.frequencySlide = rndr(-17.2, -217.9);
    this.attack = 0;
    this.sustain = frnd(0.023);
    this.decay = rndr(0.023, 0.2);
    if (rnd(1))
      this.highPassFrequency = frnd(3204);
    return this;
  };

  params.prototype.jump = function () {
    this.wave_type = SQUARE;
    this.p_duty = frnd(0.6);
    this.p_base_freq = 0.3 + frnd(0.3);
    this.p_freq_ramp = 0.1 + frnd(0.2);
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + frnd(0.3);
    this.p_env_decay = 0.1 + frnd(0.2);
    if (rnd(1))
      this.p_hpf_freq = frnd(0.3);
    if (rnd(1))
      this.p_lpf_freq = 1 - frnd(0.6);
    return this;
  };

  knobs.prototype.jump = function () {
    this.shape = SQUARE;
    this.dutyCycle = rndr(0.2, 0.5);
    this.frequency = rndr(321, 1274);
    this.frequencySlide = rndr(0.64, 17.2);
    this.attack = 0;
    this.sustain = rndr(0.023, 0.36);
    this.decay = rndr(0.023, 0.2);
    if (rnd(1))
      this.highPassFrequency = frnd(3204);
    if (rnd(1))
      this.lowPassFrequency = rndr(2272, 44100);
    return this;
  };

  params.prototype.blipSelect = function () {
    this.wave_type = rnd(1);
    if (this.wave_type === SQUARE)
      this.p_duty = frnd(0.6);
    else
      this.p_duty = 1;
    this.p_base_freq = 0.2 + frnd(0.4);
    this.p_env_attack = 0;
    this.p_env_sustain = 0.1 + frnd(0.1);
    this.p_env_decay = frnd(0.2);
    this.p_hpf_freq = 0.1;
    return this;
  };

  knobs.prototype.blipSelect = function () {
    this.shape = rnd(1);
    if (this.shape === SQUARE)
      this.dutyCycle = rndr(0.2, 0.5);
    else
      this.dutyCycle = 0;
    this.frequency = rndr(145, 1274);
    this.attack = 0;
    this.sustain = rndr(0.023, 0.09);
    this.decay = frnd(0.09);
    this.highPassFrequency = 353;
    return this;
  };

  params.prototype.mutate = function () {
    if (rnd(1)) this.p_base_freq += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_freq_ramp += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_freq_dramp += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_duty += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_duty_ramp += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_vib_strength += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_vib_speed += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_vib_delay += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_env_attack += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_env_sustain += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_env_decay += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_env_punch += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_lpf_resonance += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_lpf_freq += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_lpf_ramp += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_hpf_freq += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_hpf_ramp += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_pha_offset += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_pha_ramp += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_repeat_speed += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_arp_speed += frnd(0.1) - 0.05;
    if (rnd(1)) this.p_arp_mod += frnd(0.1) - 0.05;
  };

  params.prototype.random = function () {
    if (rnd(1))
      this.p_base_freq = cube(frnd(2) - 1) + 0.5;
    else
      this.p_base_freq = sqr(frnd(1));
    this.p_freq_limit = 0;
    this.p_freq_ramp = Math.pow(frnd(2) - 1, 5);
    if (this.p_base_freq > 0.7 && this.p_freq_ramp > 0.2)
      this.p_freq_ramp = -this.p_freq_ramp;
    if (this.p_base_freq < 0.2 && this.p_freq_ramp < -0.05)
      this.p_freq_ramp = -this.p_freq_ramp;
    this.p_freq_dramp = Math.pow(frnd(2) - 1, 3);
    this.p_duty = frnd(2) - 1;
    this.p_duty_ramp = Math.pow(frnd(2) - 1, 3);
    this.p_vib_strength = Math.pow(frnd(2) - 1, 3);
    this.p_vib_speed = rndr(-1, 1);
    this.p_env_attack = cube(rndr(-1, 1));
    this.p_env_sustain = sqr(rndr(-1, 1));
    this.p_env_decay = rndr(-1, 1);
    this.p_env_punch = Math.pow(frnd(0.8), 2);
    if (this.p_env_attack + this.p_env_sustain + this.p_env_decay < 0.2) {
      this.p_env_sustain += 0.2 + frnd(0.3);
      this.p_env_decay += 0.2 + frnd(0.3);
    }
    this.p_lpf_resonance = rndr(-1, 1);
    this.p_lpf_freq = 1 - Math.pow(frnd(1), 3);
    this.p_lpf_ramp = Math.pow(frnd(2) - 1, 3);
    if (this.p_lpf_freq < 0.1 && this.p_lpf_ramp < -0.05)
      this.p_lpf_ramp = -this.p_lpf_ramp;
    this.p_hpf_freq = Math.pow(frnd(1), 5);
    this.p_hpf_ramp = Math.pow(frnd(2) - 1, 5);
    this.p_pha_offset = Math.pow(frnd(2) - 1, 3);
    this.p_pha_ramp = Math.pow(frnd(2) - 1, 3);
    this.p_repeat_speed = frnd(2) - 1;
    this.p_arp_speed = frnd(2) - 1;
    this.p_arp_mod = frnd(2) - 1;
    return this;
  };

  knobs.prototype.random = function () {
    if (rnd(1))
      this.frequency = rndr(885.5, 7941.5);
    else
      this.frequency = rndr(3.5, 3532);
    this.frequencySlide = rndr(-633, 639);
    if (this.frequency > 1732 && this.frequencySlide > 5)
      this.frequencySlide = -this.frequencySlide;
    if (this.frequency < 145 && this.frequencySlide < -0.088)
      this.frequencySlide = -this.frequencySlide;
    this.frequencySlideSlide = rndr(-0.88, 0.88);
    this.dutyCycle = frnd(1);
    this.dudyCycleSweep = rndr(-17.64, 17.64);
    this.vibratoDepth = rndr(-0.5, 0.5);
    this.vibratoRate = rndr(0, 69);
    this.attack = cube(frnd(1)) * 2.26;
    this.sustain = sqr(frnd(1)) * 2.26 + 0.09;
    this.decay = frnd(1) * 2.26;
    this.punch = sqr(frnd(1)) * 0.64;
    if (this.attack + this.sustain + this.decay < 0.45) {
      this.sustain += rndr(0.5, 1.25);
      this.decay += rndr(0.5, 1.25);
    }
    this.lowPassResonance = rndr(0.444, 0.97);
    this.lowPassFrequency = frnd(39200);
    this.lowPassSweep = rndr(0.012, 82);
    if (this.lowPassFrequency < 35 && this.lowPassSweep < 0.802)
      this.lowPassSweep = 1 - this.lowPassSweep;
    this.highPassFrequency = 39200 * pow(frnd(1), 5);
    this.highPassSweep = 555718 * pow(rndr(-1, 1), 5);
    this.flangerOffset = 0.023 * cube(frnd(2) - 1);
    this.flangerSweep = cube(frnd(2) - 1);
    this.retriggerRate = frnd(1378);
    this.arpeggioDelay = frnd(1.81);
    this.arpeggioFactor = rndr(0.09, 10);
    return this;
  };

  params.prototype.tone = function () {
    this.wave_type = SINE;
    this.p_base_freq = 0.35173364; // 440 Hz
    this.p_env_attack = 0;
    this.p_env_sustain = 0.6641; // 1 sec
    this.p_env_decay = 0;
    this.p_env_punch = 0;
    return this;
  };

  function soundeffect(ps) {
    if (ps.oldParams)
      this.initFromUI(ps);
    else
      this.init(ps);
  };

  soundeffect.prototype.initFromUI = function (ps) {
    //
    // Convert user-facing parameter values to units usable by the sound
    // generator
    //

    this.initForRepeat = function() {
      this.elapsedSinceRepeat = 0;

      this.period = 100 / (ps.p_base_freq * ps.p_base_freq + 0.001);
      this.periodMax = 100 / (ps.p_freq_limit * ps.p_freq_limit + 0.001);
      this.enableFrequencyCutoff = (ps.p_freq_limit > 0);
      this.periodMult = 1 - Math.pow(ps.p_freq_ramp, 3) * 0.01;
      this.periodMultSlide = -Math.pow(ps.p_freq_dramp, 3) * 0.000001;

      this.dutyCycle = 0.5 - ps.p_duty * 0.5;
      this.dutyCycleSlide = -ps.p_duty_ramp * 0.00005;

      if (ps.p_arp_mod >= 0)
        this.arpeggioMultiplier = 1 - Math.pow(ps.p_arp_mod, 2) * .9;
      else
        this.arpeggioMultiplier = 1 + Math.pow(ps.p_arp_mod, 2) * 10;
      this.arpeggioTime = Math.floor(Math.pow(1 - ps.p_arp_speed, 2) * 20000 + 32);
      if (ps.p_arp_speed === 1)
        this.arpeggioTime = 0;
    };

    this.initForRepeat();  // First time through, this is a bit of a misnomer

    // Waveform shape
    this.waveShape = parseInt(ps.wave_type);

    // Filter
    this.fltw = Math.pow(ps.p_lpf_freq, 3) * 0.1;
    this.enableLowPassFilter = (ps.p_lpf_freq != 1);
    this.fltw_d = 1 + ps.p_lpf_ramp * 0.0001;
    this.fltdmp = 5 / (1 + Math.pow(ps.p_lpf_resonance, 2) * 20) *
      (0.01 + this.fltw);
    if (this.fltdmp > 0.8) this.fltdmp=0.8;
    this.flthp = Math.pow(ps.p_hpf_freq, 2) * 0.1;
    this.flthp_d = 1 + ps.p_hpf_ramp * 0.0003;

    // Vibrato
    this.vibratoSpeed = Math.pow(ps.p_vib_speed, 2) * 0.01;
    this.vibratoAmplitude = ps.p_vib_strength * 0.5;

    // Envelope
    this.envelopeLength = [
      Math.floor(ps.p_env_attack * ps.p_env_attack * 100000),
      Math.floor(ps.p_env_sustain * ps.p_env_sustain * 100000),
      Math.floor(ps.p_env_decay * ps.p_env_decay * 100000)
    ];
    this.envelopePunch = ps.p_env_punch;

    // Flanger
    this.flangerOffset = Math.pow(ps.p_pha_offset, 2) * 1020;
    if (ps.p_pha_offset < 0) this.flangerOffset = -this.flangerOffset;
    this.flangerOffsetSlide = Math.pow(ps.p_pha_ramp, 2) * 1;
    if (ps.p_pha_ramp < 0) this.flangerOffsetSlide = -this.flangerOffsetSlide;

    // Repeat
    this.repeatTime = Math.floor(Math.pow(1 - ps.p_repeat_speed, 2) * 20000
                                 + 32);
    if (ps.p_repeat_speed === 0)
      this.repeatTime = 0;

    this.gain = Math.exp(ps.sound_vol) - 1;

    this.sampleRate = ps.sample_rate;
    this.bitsPerChannel = ps.sample_size;

    if(Debug)
    {
      for (var i in this) if (typeof this[i] !== 'function') console.log(i, this[i]);
    }
  };
  
  soundeffect.prototype.init = function (ps) 
  {
    //
    // Convert user-facing parameter values to units usable by the sound
    // generator
    //

    this.initForRepeat = function() 
    {
      this.elapsedSinceRepeat = 0;

      this.period = OVERSAMPLING * 44100 / ps.frequency;
      this.periodMax = OVERSAMPLING * 44100 / ps.frequencyMin;
      this.enableFrequencyCutoff = (ps.frequencyMin > 0);
      this.periodMult = Math.pow(.5, ps.frequencySlide / 44100);
      this.periodMultSlide = ps.frequencySlideSlide * Math.pow(2, -44101/44100)
        / 44100;

      this.dutyCycle = ps.dutyCycle;
      this.dutyCycleSlide = ps.dutyCycleSweep / (OVERSAMPLING * 44100);

      this.arpeggioMultiplier = 1 / ps.arpeggioFactor;
      this.arpeggioTime = ps.arpeggioDelay * 44100;
    };
    
    this.initForRepeat();  // First time through, this is a bit of a misnomer

    // Waveform shape
    this.waveShape = ps.shape;

    // Low pass filter
    this.fltw = ps.lowPassFrequency / (OVERSAMPLING * 44100 + ps.lowPassFrequency);
    this.enableLowPassFilter = ps.lowPassFrequency < 44100;
    this.fltw_d = Math.pow(ps.lowPassSweep, 1/44100);
    this.fltdmp = (1 - ps.lowPassResonance) * 9 * (.01 + this.fltw);

    // High pass filter
    this.flthp = ps.highPassFrequency / (OVERSAMPLING * 44100 + ps.highPassFrequency);
    this.flthp_d = Math.pow(ps.highPassSweep, 1/44100);

    // Vibrato
    this.vibratoSpeed = ps.vibratoRate * 64 / 44100 / 10;
    this.vibratoAmplitude = ps.vibratoDepth;

    // Envelope
    this.envelopeLength = [
      Math.floor(ps.attack * 44100),
      Math.floor(ps.sustain * 44100),
      Math.floor(ps.decay * 44100)
    ];
    this.envelopePunch = ps.punch;

    // Flanger
    this.flangerOffset = ps.flangerOffset * 44100;
    this.flangerOffsetSlide = ps.flangerSweep;

    // Repeat
    this.repeatTime = ps.retriggerRate ? 1 / (44100 * ps.retriggerRate) : 0;

    // Gain
    this.gain = Math.sqrt(Math.pow(10, ps.gain/10));

    this.sampleRate = ps.sampleRate;
    this.bitsPerChannel = ps.sampleSize;
  };

  soundeffect.prototype.generateRIFFwave = function () {
    var fltp = 0;
    var fltdp = 0;
    var fltphp = 0;

    var noise_buffer = Array(32);
    for (var i = 0; i < 32; ++i)
      noise_buffer[i] = Math.random() * 2 - 1;

    var envelopeStage = 0;
    var envelopeElapsed = 0;

    var vibratoPhase = 0;

    var phase = 0;
    var ipp = 0;
    var flanger_buffer = Array(1024);
    for (var i = 0; i < 1024; ++i)
      flanger_buffer[i] = 0;

    var num_clipped = 0;

    var buffer = [];

    var sample_sum = 0;
    var num_summed = 0;
    var summands = Math.floor(44100 / this.sampleRate);

    for(var t = 0; ; ++t) 
    {

      // Repeats
      if (this.repeatTime != 0 && ++this.elapsedSinceRepeat >= this.repeatTime)
        this.initForRepeat();

      // Arpeggio (single)
      if(this.arpeggioTime != 0 && t >= this.arpeggioTime) {
        this.arpeggioTime = 0;
        this.period *= this.arpeggioMultiplier;
      }

      // Frequency slide, and frequency slide slide!
      this.periodMult += this.periodMultSlide;
      this.period *= this.periodMult;
      if(this.period > this.periodMax) {
        this.period = this.periodMax;
        if (this.enableFrequencyCutoff)
          break;
      }

      // Vibrato
      var rfperiod = this.period;
      if (this.vibratoAmplitude > 0) {
        vibratoPhase += this.vibratoSpeed;
        rfperiod = this.period * (1 + Math.sin(vibratoPhase) * this.vibratoAmplitude);
      }
      var iperiod = Math.floor(rfperiod);
      if (iperiod < OVERSAMPLING) iperiod = OVERSAMPLING;

      // Square wave duty cycle
      this.dutyCycle += this.dutyCycleSlide;
      if (this.dutyCycle < 0) this.dutyCycle = 0;
      if (this.dutyCycle > 0.5) this.dutyCycle = 0.5;

      // Volume envelope
      if (++envelopeElapsed > this.envelopeLength[envelopeStage]) {
        envelopeElapsed = 0;
        if (++envelopeStage > 2)
          break;
      }
      var env_vol;
      var envf = envelopeElapsed / this.envelopeLength[envelopeStage];
      if (envelopeStage === 0) {         // Attack
        env_vol = envf;
      } else if (envelopeStage === 1) {  // Sustain
        env_vol = 1 + (1 - envf) * 2 * this.envelopePunch;
      } else {                           // Decay
        env_vol = 1 - envf;
      }

      // Flanger step
      this.flangerOffset += this.flangerOffsetSlide;
      var iphase = Math.abs(Math.floor(this.flangerOffset));
      if (iphase > 1023) iphase = 1023;

      if (this.flthp_d != 0) {
        this.flthp *= this.flthp_d;
        if (this.flthp < 0.00001)
          this.flthp = 0.00001;
        if (this.flthp > 0.1)
          this.flthp = 0.1;
      }

      // 8x oversampling
      var sample = 0;
      for (var si = 0; si < OVERSAMPLING; ++si) {
        var sub_sample = 0;
        phase++;
        if (phase >= iperiod) {
          phase %= iperiod;
          if (this.waveShape === NOISE)
            for(var i = 0; i < 32; ++i)
              noise_buffer[i] = Math.random() * 2 - 1;
        }

        // Base waveform
        var fp = phase / iperiod;
        if (this.waveShape === SQUARE) {
          if (fp < this.dutyCycle)
            sub_sample=0.5;
          else
            sub_sample=-0.5;
        } else if (this.waveShape === SAWTOOTH) {
          if (fp < this.dutyCycle)
            sub_sample = -1 + 2 * fp/this.dutyCycle;
          else
            sub_sample = 1 - 2 * (fp-this.dutyCycle)/(1-this.dutyCycle);
        } else if (this.waveShape === SINE) {
          sub_sample = Math.sin(fp * 2 * Math.PI);
        } else if (this.waveShape === NOISE) {
          sub_sample = noise_buffer[Math.floor(phase * 32 / iperiod)];
        } else {
          throw "ERROR: Bad wave type: " + this.waveShape;
        }

        // Low-pass filter
        var pp = fltp;
        this.fltw *= this.fltw_d;
        if (this.fltw < 0) this.fltw = 0;
        if (this.fltw > 0.1) this.fltw = 0.1;
        if (this.enableLowPassFilter) {
          fltdp += (sub_sample - fltp) * this.fltw;
          fltdp -= fltdp * this.fltdmp;
        } else {
          fltp = sub_sample;
          fltdp = 0;
        }
        fltp += fltdp;

        // High-pass filter
        fltphp += fltp - pp;
        fltphp -= fltphp * this.flthp;
        sub_sample = fltphp;

        // Flanger
        flanger_buffer[ipp & 1023] = sub_sample;
        sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];
        ipp = (ipp + 1) & 1023;

        // final accumulation and envelope application
        sample += sub_sample * env_vol;
      }

      // Accumulate samples appropriately for sample rate
      sample_sum += sample;
      if (++num_summed >= summands) {
        num_summed = 0;
        sample = sample_sum / summands;
        sample_sum = 0;
      } else {
        continue;
      }

      sample = sample / OVERSAMPLING * masterVolume;
      sample *= this.gain;

      if (this.bitsPerChannel === 8) {
        // Rescale [-1, 1) to [0, 256)
        sample = Math.floor((sample + 1) * 128);
        if (sample > 255) {
          sample = 255;
          ++num_clipped;
        } else if (sample < 0) {
          sample = 0;
          ++num_clipped;
        }
        buffer.push(sample);
      } else {
        // Rescale [-1, 1) to [-32768, 32768)
        sample = Math.floor(sample * (1<<15));
        if (sample >= (1<<15)) {
          sample = (1 << 15)-1;
          ++num_clipped;
        } else if (sample < -(1<<15)) {
          sample = -(1 << 15);
          ++num_clipped;
        }
        
        buffer.push(sample);
      }
    }

    var wave = new RIFFwave();
    wave.header.sampleRate = this.sampleRate;
    wave.header.bitsPerSample = this.bitsPerChannel;
    wave.make(buffer);
    wave.clipping = num_clipped;
    return wave;
  };

  knobs.prototype.tone = function () 
  {
    this.shape = SINE;
    this.frequency = 440;
    this.attack = 0;
    this.sustain = 1;
    this.decay = 0;
    return this;
  };

  var genners = 'pickupCoin,laserShoot,explosion,powerUp,hitHurt,jump,blipSelect,random,tone'.split(',');
  for (var i = 0; i < genners.length; ++i) {
    (function (g) {
      if (!knobs.prototype[g])
        knobs.prototype[g] = function () {
          return this.translate(new params()[g]());
        }
    })(genners[i]);
  } 
  // END of sfxr.js
  // -----------------------------------------------------------------------------
          
  /**         
   * Instantiate a random sfxr sound effect as html audio element.
   * @memberof rlSfxr
   * @function
   * @see [HTMLAudioElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement}
   * @returns {HTMLAudioElement}
   */
  var getRandomEffectAudio = function()
  {
    var audio = new Audio();
    var p = new params().random();
    var s = new soundeffect(p); 
    var riff = s.generateRIFFwave();
    audio.src = riff.dataURI;
    return audio;
  };
   
  var capS1 = rlMath.getCapperFunction(-1.0, 1.0);
  var capU1 = rlMath.getCapperFunction(0.0, 1.0);  
  
  /**         
   * Instantiate an sfxr sound effect with the given parameters as html audio element.  
   * Values will be capped to the inclusive intervals described as [0,+1] or [-1,+1].  
   * Set any of the parameters to **null** to use the (default) value.
   * @memberof rlSfxr
   * @function
   * @see [HTMLAudioElement]{@link https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement} 
   * @param {number|null} waveShape rlSfxr.squareWave/sawtoothWave/sineWave/noiseWave (squareWave)
   * @param {number|null} envAttack [0,+1] envelope attack time (0.0)
   * @param {number|null} envSustain [0,+1] envelope sustain time (0.3)
   * @param {number|null} envPunch [0,+1] envelope sustain punch (0.0)
   * @param {number|null} envDecay [0,+1] envelope decay time (0.4)
   * @param {number|null} freqBase [0,+1] base frequency (0.3)
   * @param {number|null} freqMinCutoff [0,+1] min frequency cutoff (0.0)
   * @param {number|null} freqSlide [-1,+1] frequency slide (0.0)
   * @param {number|null} freqDeltaSlide [-1,+1] frequency delta slide (0.0)
   * @param {number|null} vibDepth [0,+1] vibrato depth (0.0)
   * @param {number|null} vibSpeed [0,+1] vibrato speed (0.0)
   * @param {number|null} arpModFreq [-1,+1] arpeggio frequency change amount (0.0) 
   * @param {number|null} arpModSpeed [0,+1] arpeggio frequence change speed (0.0)
   * @param {number|null} dutyCycle [0,+1] square and sawtooth wave duty cycle (0.0)
   * @param {number|null} dutySweep [-1,+1] square and sawtooth wave duty sweep (0.0)
   * @param {number|null} repeatSpeed [0,+1] repeat speed (0.0)
   * @param {number|null} flangeOffset [-1,+1] flanger offset (0.0)
   * @param {number|null} flangeSweep [-1,+1] flanger sweep (0.0)
   * @param {number|null} lpfCutoff [0,+1] low pass filter cutoff (1.0)
   * @param {number|null} lpfCutoffSweep [-1,+1] low pass filter cutoff sweep (0.0)
   * @param {number|null} lpfResonance [0,+1] low pass filter resonance (0.0)
   * @param {number|null} hpfCutoff [0,+1] high pass filter cutoff (0.0)
   * @param {number|null} hpfCutoffSweep [-1,+1] high pass filter cutoff sweep (0.0)
   * @param {number|null} sampleVolume [0,+1] volume for the generated sample itself (0.5)
   * @param {number|null} sampleRate [8000,44100] sample rate in Hz (22050)
   * @param {number|null} sampleBits 8 or 16 sample size in bits (8)
   * @param {number|null} audioVolume [0,+1] initial volume for the html audio element (0.5)
   * @returns {HTMLAudioElement}
   */
  var generateEffectAudio = function(waveShape, envAttack, envSustain, envPunch, envDecay,
                                     freqBase, freqMinCutoff, freqSlide, freqDeltaSlide,
                                     vibDepth, vibSpeed,
                                     arpModFreq, arpModSpeed,
                                     dutyCycle, dutySweep,
                                     repeatSpeed,
                                     flangeOffset, flangeSweep,
                                     lpfCutoff, lpfCutoffSweep, lpfResonance,
                                     hpfCutoff, hpfCutoffSweep,
                                     sampleVolume, sampleRate, sampleBits,
                                     audioVolume)
  {
    // prepare and generate SFXR soundeffect and RIFF wave 
    var p = new params();
    
    // Wave shape
    p.wave_type = waveShape != null ? waveShape : SQUARE;

    // Envelope
    p.p_env_attack    = capU1(envAttack, 0.0); // Attack time
    p.p_env_sustain   = capU1(envSustain, 0.3); // Sustain time
    p.p_env_punch     = capU1(envPunch, 0.0); // Sustain punch
    p.p_env_decay     = capU1(envDecay, 0.4); // Decay time
                      
    // Tone           
    p.p_base_freq     = capU1(freqBase, 0.3); // Start frequency
    p.p_freq_limit    = capU1(freqMinCutoff, 0.0); // Min frequency cutoff
    p.p_freq_ramp     = capS1(freqSlide, 0.0); // Slide (SIGNED)
    p.p_freq_dramp    = capS1(freqDeltaSlide, 0.0); // Delta slide (SIGNED)
    
    // Vibrato
    p.p_vib_strength  = capU1(vibDepth, 0.0); // Vibrato depth
    p.p_vib_speed     = capU1(vibSpeed, 0.0); // Vibrato speed

    // Tonal change
    p.p_arp_mod       = capS1(arpModFreq, 0.0); // Change amount (SIGNED)
    p.p_arp_speed     = capU1(arpModSpeed, 0.0); // Change speed

    // Square wave duty (proportion of time signal is high vs. low)
    p.p_duty          = capU1(dutyCycle, 0.0); // Square duty
    p.p_duty_ramp     = capS1(dutySweep, 0.0); // Duty sweep (SIGNED)

    // Repeat
    p.p_repeat_speed  = capU1(repeatSpeed, 0.0); // Repeat speed

    // Flanger
    p.p_pha_offset    = capS1(flangeOffset, 0.0); // Flanger offset (SIGNED)
    p.p_pha_ramp      = capS1(flangeSweep, 0.0); // Flanger sweep (SIGNED)

    // Low-pass filter
    p.p_lpf_freq      = capU1(lpfCutoff, 1.0); // Low-pass filter cutoff
    p.p_lpf_ramp      = capS1(lpfCutoffSweep, 0.0); // Low-pass filter cutoff sweep (SIGNED)
    p.p_lpf_resonance = capU1(lpfResonance, 0.0); // Low-pass filter resonance
    
    // High-pass filter
    p.p_hpf_freq      = capU1(hpfCutoff, 0.0); // High-pass filter cutoff
    p.p_hpf_ramp      = capS1(hpfCutoffSweep, 0.0); // High-pass filter cutoff sweep (SIGNED)

    // Sample parameters
    p.sound_vol   = capU1(sampleVolume, 0.5);
    p.sample_rate = rlMath.capValue(8000, sampleRate != null ? sampleRate : 22050, 44100);
    p.sample_size = sampleBits != null ? sampleBits : 8;
    
    var s = new soundeffect(p); 
    var riff = s.generateRIFFwave();
    
    // prepare HTML audio element
    var audio = new Audio();
    audio.src = riff.dataURI;
    audio.volume = capU1(audioVolume, 0.5);
    return audio;
  };
  
  return {
    toggleDebug: toggleDebug,
    RIFFwave: RIFFwave,
    params: params,
    defaultKnobs: defaultKnobs,
    knobs: knobs,
    soundeffect: soundeffect,
    squareWave: SQUARE,
    sawtoothWave: SAWTOOTH,
    sineWave: SINE,
    noiseWave: NOISE,
    getRandomEffectAudio: getRandomEffectAudio,
    generateEffectAudio: generateEffectAudio
  };
}();