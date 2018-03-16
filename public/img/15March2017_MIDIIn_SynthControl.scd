


//-------------------------------------------
// Let's work with MIDI Input

MIDIClient.init

MIDIIn.connectAll


(
SynthDef(\fm, {|gate = 1, freq = 400, amp = 0.5, dev = 100,
	lfo1Freq = 0.2, lfo1Depth = 3.0, resFreq = 200, mix = 0.5|

	var mod, carr, env, lfo1, res, rev;

	env = EnvGen.kr(Env.perc(0.02, 0.98), gate, doneAction:2);

	lfo1 = SinOsc.kr(lfo1Freq,0,lfo1Depth);
	mod = SinOsc.ar(freq, lfo1, dev);
	carr = SinOsc.ar((freq*1.18)+mod, 0, 0.5);

	res = Ringz.ar(carr, resFreq*[1,1.23,1.45,1.98,2.34,3.6,5.8], 5).mean;
	res = Limiter.ar(res, 0.98);

	rev = FreeVerb.ar(res, mix, 0.8, 0.7);
	rev = Pan2.ar(rev, SinOsc.ar(0.3));

	Out.ar(0, rev*env*amp);

}).add
)

~fm = Synth(\fm, [\freq, rrand(24,90).midicps])
~fm.set(\freq, 700)
~fm.set(\lfo1Depth, 300)
~fm.set(\lfo1Freq, 8)
~fm.set(\gate, 0)



(
~notes = Array.newClear(128);

(
~on = MIDIFunc.noteOn({|vel, num, chan, src|
	[vel, num, chan, src].postln;
	~notes[num] = Synth(\fm, [\freq, num.midicps, \amp, vel/127.0] );
})
);

(
~off = MIDIFunc.noteOff({|vel, num, chan, src|
	[vel, num, chan, src].postln;
	~notes[num].set(\gate, 0);
	~notes[num] = nil;
})
);

(
~cc = MIDIFunc.cc({|val, num, chan, src|
	[val, num, chan, src].postln;

	//--------------------
	switch(num.asInteger,
		//--------------------
		20, {
			~notes.do({|item, indx|
				if(item != nil, {
					//~notes[indx]
					item.set(\dev, val.linlin(0,127, 3, 20000));
				})
			})
		},
		//--------------------
		10, {
			~notes.do({|item, indx|
				if(item != nil, {
					//~notes[indx]
					item.set(\resFreq, val.linlin(0,127, 20, 2000));
				})
			})
		},
		//--------------------
		76, {
			~notes.do({|item, indx|
				if(item != nil, {
					//~notes[indx]
					item.set(\lfo1Depth, val.linlin(0,127, 1, 20000));
				})
			})
		},
		//--------------------
		77, {
			~notes.do({|item, indx|
				if(item != nil, {
					//~notes[indx]
					item.set(\lfo1Freq, val.linlin(0,127, 1, 20));
				})
			})
		}
	)



})
);
)





