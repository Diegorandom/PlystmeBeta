
var express = require('express');
var router = new express.Router();
//var sc = require('supercolliderjs');

/**

        ESTA PARTE DEL SOFTWARE NO ESTÁ EN USO

router.get('/environment', function(request, response) {
    var objetosGlobales = request.app.get('objetosGlobales');
    var position = request.app.get('position');
    
  'use strict';
sc.server.boot().then((server) => {
 
   * This will return a Promise that will resolve with an instance of the
   * javascript SynthDef class.
   *
   * It will start an sclang interpreter, compile the supercollider SynthDef,
   * send it to the scsynth server, and then resolve the Promise with an instance
   * of the javascript SynthDef class.
   *
   * If there is an error in your SynthDef then it will fail and post the error:
   * Failed to compile SynthDef  Interpret error: ERROR: Message 'quacks' not understood.
  
    
  let freqBase = Math.round(objetosGlobales[position].fundamental) + Math.floor(Math.random() * 30) + 30;    
  let freqBase2 = Math.round(objetosGlobales[position].fundamental2) + Math.floor(Math.random() * 100);
  let baileBase = (objetosGlobales[position].danceability/100)*5;
  let baileBase2 = (objetosGlobales[position].danceability2/100)*5;
  let energiaBase = (objetosGlobales[position].energia/100)*baileBase;
  let energiaBase2 = (objetosGlobales[position].energia2/100)*baileBase2;
  let acusticaBase = (objetosGlobales[position].acustica/100)*baileBase;
  let acusticaBase2 = (objetosGlobales[position].acustica2/100)*baileBase2; 
  
  console.log('freqBase', freqBase);    
  console.log('freqBase2', freqBase2);    
  console.log('energiaBase2', energiaBase2);    
  console.log('energiaBase', energiaBase);    
  console.log('baileBase', baileBase);    
  console.log('baileBase2', baileBase2); 
  console.log('modo', Math.round(objetosGlobales[position].modo));
    
  let melodia = server.synthDef('Fun2',
    `
  SynthDef ("Fun2", { arg outbus=0, freqOne=${freqBase}, freqTwo=${freqBase2}, apMaxdelay=${energiaBase}, apDelay=${energiaBase2}, apDecay=${acusticaBase}, amp=1, gate=1; 
        var sig, in;
        in = LocalIn.ar(1);
      sig = SinOsc.ar((MouseX.kr(freqOne.midicps-12,freqTwo.midicps+12,0, 0.4)), in * LFDNoise3.ar(freqOne, mul: (MouseY.kr(0,1))),LFDNoise3.ar(freqTwo, 1)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{MouseX.kr(0.2.rand + apDelay)} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
      Out.ar(outbus,Pan2.ar(sig, LFNoise1.ar(0.33))*amp);
    }).add;

    `);
    
     server.synth(melodia); 
        
    if(Math.round(objetosGlobales[position].modo) == 1){
        
           let armonia = server.synthDef('armonia',
    `
  SynthDef ("armonia", { arg outbus=0, fundamental=${freqBase},
        freqTwo=${freqBase}, apMaxdelay=${energiaBase}, apDelay=${energiaBase2}, apDecay=${acusticaBase}, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
      amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
      Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia);
        
   
        
           let armoniaT = server.synthDef('armoniaT',
    `
  SynthDef ("armoniaT", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
      amp = MouseX.kr(1,0.5,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*5/4, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
      Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armoniaT);
        
        
     let armonia7 = server.synthDef('armonia7',
    `
  SynthDef ("armonia7", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
      amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*9/5, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
      Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia7);    
        
    }else{
                  
        
        let armonia2 = server.synthDef('armonia2',
    `
  SynthDef ("armonia2", { arg outbus=0, fundamental=${freqBase}, freqTwo=${freqBase}, apMaxdelay=${energiaBase}, apDelay=${energiaBase2}, apDecay=${acusticaBase}, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
      amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)
        };
        LocalOut.ar(sig.tanh);
      Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia2);
        
         let armonia2T = server.synthDef('armonia2T',
    `
  SynthDef ("armonia2T", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
      amp = MouseX.kr(0.5,1,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*6/5, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
      Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia2T);
        
        let armonia27 = server.synthDef('armonia27',
    `
  SynthDef ("armonia27", { arg outbus=0, fundamental=${freqBase},
        freqOne=0.1, freqTwo= 3.0, apMaxdelay=0.3, apDelay=0.1, apDecay=5, gate=1;
        var in, amp, sig;
        in = LocalIn.ar(2);
      amp = MouseX.kr(1,0.5,0,0.5);
        sig = SinOsc.ar(fundamental.midicps*10/5, in * LFDNoise3.ar(freqOne, 4),LFDNoise3.ar(freqTwo, 2)).tanh;
        5.do{sig = AllpassC.ar(sig, apMaxdelay,{0.2.rand + apDelay} ! 2, apDecay)};
        LocalOut.ar(sig.tanh);
      Out.ar(outbus, sig.tanh * amp);
    }).add;

    `);
        
        server.synth(armonia27);    
        
        
    }
        

}, console.error );

  response.render('pages/environment');
});

//Finaliza proceso */

module.exports = router; 