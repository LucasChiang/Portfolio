/* LC-2030 Die Cards — an original collectible card set for lucaschiang.com.
   All names, frames, art and stats are original. Cards are drawn procedurally. */
(function(){
'use strict';

/* ---------------- data ---------------- */
const RAR={
  C:{name:'Common',      col:'#9aa0b8',w:57},
  U:{name:'Uncommon',    col:'#5b8cff',w:29},
  H:{name:'Holo',        col:'#d77bff',w:9.5},
  W:{name:'Wafer-Scale', col:'#ffcf4d',w:3},
  F:{name:'Full Art',    col:'#6ee7ff',w:1.5},
  S:{name:'Secret',      col:'#ff9de2',w:.35}
};
const _C=(id,n,r,t,a,s,x)=>({id,n,r,t,a,s,x});
const CARDS=[
 /* ---- passives ---- */
 _C('res','Resistor','C','Component · Passive','res',[['Value','220 Ω'],['Tolerance','±1%'],['Power','¼ W']],'Says no to current. Politely, and in four colored bands.'),
 _C('shunt','Shunt Resistor','C','Component · Passive','sym:shunt',[['Value','10 mΩ'],['Terminals','4 (Kelvin)'],['Use','Current sense']],'So small you need four wires to measure it properly.'),
 _C('pot','Potentiometer','C','Component · Passive','sym:pot',[['Value','10 kΩ'],['Taper','Linear'],['Rotation','270°']],'A resistor with a knob and opinions about volume.'),
 _C('therm','Thermistor','C','Component · Passive','sym:therm',[['R25','10 kΩ'],['Beta','3950 K'],['Type','NTC']],'Gets less resistant the warmer things get.'),
 _C('ldr','Photoresistor','C','Component · Passive','sym:ldr',[['Dark','1 MΩ'],['Light','10 kΩ'],['Peak','540 nm']],'Lowers its guard in the sunlight.'),
 _C('cap','Capacitor','C','Component · Passive','cap',[['Value','100 µF'],['Rating','16 V'],['ESR','0.08 Ω']],'Stores charge for later, like a battery with commitment issues.'),
 _C('mlcc','Ceramic Capacitor','C','Component · Passive','sym:mlcc',[['Value','100 nF'],['Size','0402'],['Dielectric','X7R']],'Hundreds of tiny layers, one per power pin.'),
 _C('supercap','Supercapacitor','U','Component · Passive','sym:supercap',[['Capacitance','1 F'],['Rating','5.5 V'],['Cycles','500K']],'Charges in seconds and doesn’t mind doing it again.'),
 _C('ind','Inductor','C','Component · Passive','ind',[['Value','10 µH'],['Current','2 A'],['DCR','25 mΩ']],'Hates change. Especially change in current.'),
 _C('bead','Ferrite Bead','C','Component · Passive','sym:bead',[['Impedance','600 Ω @ 100 MHz'],['Current','1 A'],['DCR','0.15 Ω']],'Lets DC through and turns RF noise into a little heat.'),
 _C('xfmr','Transformer','U','Component · Passive','sym:xfmr',[['Ratio','10:1'],['Power','5 VA'],['Core','Ferrite']],'Trades voltage for current, never energy.'),
 _C('fuse','Fuse','C','Component · Protection','sym:fuse',[['Rating','2 A'],['Speed','Fast-blow'],['Voltage','250 V']],'Takes the hit so the rest of the board doesn’t have to.'),
 /* ---- semiconductors ---- */
 _C('diode','Diode','C','Component · Semiconductor','diode',[['Forward','0.7 V'],['Reverse','100 V'],['Current','1 A']],'One-way street. No U-turns.'),
 _C('zener','Zener Diode','C','Component · Semiconductor','sym:zener',[['V_Z','5.1 V'],['Power','500 mW'],['Tolerance','±5%']],'Breaks down on purpose, at exactly 5.1 V.'),
 _C('schottky','Schottky Diode','C','Component · Semiconductor','sym:schottky',[['Forward','0.3 V'],['Reverse','40 V'],['Recovery','Near zero']],'A diode in a hurry with a low forward drop.'),
 _C('led','LED','C','Component · Optoelectronic','led',[['Forward','2.1 V'],['Current','20 mA'],['Wavelength','620 nm']],'Turns electrons into photons and attention.'),
 _C('photodiode','Photodiode','U','Component · Optoelectronic','sym:photodiode',[['Responsivity','0.6 A/W'],['Dark current','1 nA'],['Peak','900 nm']],'Turns light into a current small enough to need an op-amp.'),
 _C('opto','Optocoupler','U','Component · Optoelectronic','sym:opto',[['Isolation','5 kV'],['CTR','100%'],['Speed','10 µs']],'Sends a signal across a gap using only light.'),
 _C('solar','Solar Cell','U','Component · Optoelectronic','sym:solar',[['V_OC','0.6 V'],['Efficiency','22%'],['Size','156 mm']],'A diode that pays you back in sunlight.'),
 _C('npn','NPN Transistor','C','Component · Semiconductor','npn',[['Gain β','100'],['V_CE max','40 V'],['I_C max','200 mA']],'A small current at the base, a big decision at the collector.'),
 _C('pnp','PNP Transistor','C','Component · Semiconductor','sym:pnp',[['Gain β','100'],['V_CE max','−40 V'],['I_C max','−200 mA']],'The NPN’s mirror image. Arrow points in.'),
 _C('darl','Darlington Pair','C','Component · Semiconductor','sym:darl',[['Gain β','10,000'],['V_BE','1.4 V'],['Use','Relay drivers']],'Two transistors stacked so their gains multiply.'),
 _C('mos','MOSFET','U','Component · Power','mos',[['R_DS(on)','12 mΩ'],['V_DS','30 V'],['Gate','Logic-level']],'A switch with no moving parts and a very thin oxide.'),
 _C('jfet','JFET','U','Component · Semiconductor','sym:jfet',[['I_DSS','10 mA'],['V_P','−2 V'],['Noise','Low']],'Normally on. Quiet enough for audio front ends.'),
 _C('igbt','IGBT','H','Component · Power','sym:igbt',[['V_CE','1200 V'],['I_C','50 A'],['Use','Motor drives']],'Gate of a MOSFET, muscle of a BJT.'),
 _C('triac','Triac','U','Component · Power','sym:triac',[['V_DRM','600 V'],['I_T','8 A'],['Use','AC dimmers']],'Conducts both ways once you give it a nudge.'),
 _C('scr','Thyristor','U','Component · Power','sym:scr',[['V_DRM','800 V'],['I_T','25 A'],['Latch','Until zero current']],'Once it turns on, it stays on.'),
 /* ---- electromechanical, sensors, displays ---- */
 _C('xtal','Crystal','U','Component · Timing','xtal',[['Frequency','32.768 kHz'],['Stability','±20 ppm'],['Load','12.5 pF']],'Quartz that keeps perfect time, 2¹⁵ ticks per second.'),
 _C('ant','Antenna','C','Component · RF','ant',[['Band','2.4 GHz'],['Gain','2 dBi'],['Type','PCB meander']],'A trace that learned to talk to the air.'),
 _C('piezo','Piezo Buzzer','C','Component · Electromechanical','sym:piezo',[['Resonance','4 kHz'],['Level','85 dB'],['Drive','3–24 V']],'Flexes a ceramic disc thousands of times a second to say beep.'),
 _C('button','Push Button','C','Component · Electromechanical','sym:button',[['Travel','0.25 mm'],['Life','100K presses'],['Bounce','~5 ms']],'Needs debouncing. Every single time.'),
 _C('reed','Reed Switch','C','Component · Electromechanical','sym:reed',[['Actuation','Magnet'],['Contacts','In glass'],['Rating','0.5 A']],'Two metal reeds in a glass tube that close when a magnet walks by.'),
 _C('encoder','Rotary Encoder','C','Component · Electromechanical','sym:encoder',[['Pulses','24 / rev'],['Output','Quadrature'],['Detents','Yes']],'Two square waves, 90° apart, tell you which way it turned.'),
 _C('relay','Relay','U','Component · Electromechanical','sym:relay',[['Coil','5 V'],['Contacts','10 A'],['Type','SPDT']],'Click. A coil moves a switch you could hear across the room.'),
 _C('cell','Li-ion Cell','U','Component · Power Source','sym:cell',[['Nominal','3.7 V'],['Capacity','3000 mAh'],['Chemistry','NMC']],'Stored chemistry, released one electron at a time.'),
 _C('coin','Coin Cell','C','Component · Power Source','sym:coin',[['Voltage','3 V'],['Capacity','225 mAh'],['Job','Keeps the clock alive']],'Small, flat and quietly powering a real-time clock for years.'),
 _C('motor','DC Motor','C','Component · Electromechanical','sym:motor',[['Voltage','12 V'],['Speed','6000 rpm'],['Stall','2 A']],'Spin it with power and it’s a motor. Spin it by hand and it’s a generator.'),
 _C('stepper','Stepper Motor','U','Component · Electromechanical','sym:stepper',[['Step','1.8°'],['Holding','0.4 N·m'],['Phases','2']],'Moves in 200 exact steps per turn. Printers love it.'),
 _C('servo','Servo','C','Component · Electromechanical','sym:servo',[['Range','180°'],['Torque','2 kg·cm'],['Signal','50 Hz PWM']],'Point to an angle and it holds there. Intake arms love it.'),
 _C('hall','Hall Sensor','C','Component · Sensor','sym:hall',[['Sensitivity','5 mV/G'],['Supply','3.3 V'],['Output','Analog']],'Feels a magnetic field without touching anything.'),
 _C('tc','Thermocouple','C','Component · Sensor','sym:tc',[['Type','K'],['Range','−200 to 1250 °C'],['Seebeck','41 µV/°C']],'Two metals, one junction, a tiny voltage that tracks temperature.'),
 _C('strain','Strain Gauge','C','Component · Sensor','sym:strain',[['Resistance','350 Ω'],['Gauge factor','2.0'],['Bridge','Wheatstone']],'Stretch the foil a little and its resistance changes a little.'),
 _C('pressure','Pressure Sensor','U','Component · Sensor','sym:pressure',[['Range','300–1100 hPa'],['Resolution','0.01 hPa'],['Type','MEMS']],'Feels altitude change by the height of a stair.'),
 _C('mic','MEMS Microphone','U','Component · Sensor','sym:mic',[['SNR','65 dB'],['Output','PDM'],['Size','3 × 4 mm']],'A diaphragm thinner than a hair, listening.'),
 _C('ultra','Ultrasonic Sensor','C','Component · Sensor','sym:ultra',[['Frequency','40 kHz'],['Range','2–400 cm'],['Method','Echo timing']],'Shouts too high for you to hear and times the echo.'),
 _C('peltier','Peltier Module','U','Component · Thermoelectric','sym:peltier',[['Couples','127'],['ΔT max','68 °C'],['Mode','Cool or generate']],'Run current through it to cool, or give it a temperature difference to make power.'),
 _C('seg7','7-Segment Display','C','Component · Display','sym:seg7',[['Digits','4'],['Color','Red'],['Drive','Multiplexed']],'Eight LEDs per digit, one of them a dot.'),
 _C('oled','OLED Display','U','Component · Display','sym:oled',[['Resolution','128 × 64'],['Interface','I²C'],['Contrast','Each pixel emits']],'Every pixel is its own tiny light.'),
 /* ---- analog & power ICs ---- */
 _C('opamp','Op-Amp','U','Component · Analog IC','opamp',[['Open-loop gain','100 dB'],['GBW','1 MHz'],['Supply','±15 V']],'Does whatever the feedback network tells it to. Very coachable.'),
 _C('comp','Comparator','C','Component · Analog IC','sym:comp',[['Response','40 ns'],['Output','Open-drain'],['Hysteresis','5 mV']],'Answers one question: which input is higher?'),
 _C('inamp','Instrumentation Amp','U','Component · Analog IC','sym:inamp',[['Gain','1–1000'],['CMRR','110 dB'],['Use','ECG front end']],'Pulls millivolt biosignals out of a noisy body.'),
 _C('vreg','Voltage Regulator','U','Component · Power IC','vreg',[['In','5.0 V'],['Out','3.3 V'],['Dropout','250 mV']],'Takes whatever the rail throws at it and hands back a calm 3.3 V.'),
 _C('buck','Buck Converter','U','Component · Power IC','ic:BUCK',[['In','12 V'],['Out','3.3 V'],['Efficiency','94%']],'Steps voltage down by switching, not by burning.'),
 _C('boost','Boost Converter','U','Component · Power IC','ic:BOOST',[['In','0.5 V'],['Out','3.3 V'],['Start-up','20 mV']],'Lifts a tiny voltage up to something a chip can use. A TEG’s best friend.'),
 _C('cpump','Charge Pump','C','Component · Power IC','ic:PUMP',[['Out','−5 V'],['Caps','2 flying'],['Current','20 mA']],'Moves charge with capacitors, no inductor required.'),
 _C('hbridge','H-Bridge Driver','U','Component · Power IC','ic:H-BRIDGE',[['Voltage','36 V'],['Current','3 A'],['Channels','2']],'Four switches that let a motor run both directions.'),
 _C('bandgap','Bandgap Reference','H','Component · Analog IC','ic:VREF',[['Output','1.23 V'],['Drift','10 ppm/°C'],['Basis','Silicon bandgap']],'Every chip’s quiet source of truth for voltage.'),
 _C('adc','ADC','U','Component · Mixed-Signal','ic:ADC',[['Resolution','12-bit'],['Rate','1 MSPS'],['Inputs','8']],'Turns the analog world into numbers the MCU can count.'),
 _C('dac','DAC','C','Component · Mixed-Signal','ic:DAC',[['Resolution','12-bit'],['Settling','5 µs'],['Output','Voltage']],'Turns numbers back into voltages.'),
 _C('timer','Timer IC','U','Component · Mixed-Signal','timer',[['Pins','8'],['Modes','Astable · Mono'],['Supply','4.5–16 V']],'Blinks, beeps and debounces. The utility player of the parts bin.'),
 _C('pll','PLL','H','Component · Clocking','ic:PLL',[['Out','48 MHz'],['Jitter','30 ps'],['Ref','32.768 kHz']],'Multiplies a slow reference into a fast, locked clock.'),
 /* ---- digital & memory ---- */
 _C('nand','NAND Gate','C','Component · Digital Logic','gate:NAND',[['Inputs','2'],['Delay','8 ns'],['Family','CMOS']],'Universal. Build any logic from enough of these.'),
 _C('xor','XOR Gate','C','Component · Digital Logic','gate:XOR',[['Inputs','2'],['Delay','10 ns'],['Use','Parity · adders']],'True when the inputs disagree.'),
 _C('schmitt','Schmitt Trigger','C','Component · Digital Logic','sym:schmitt',[['Hysteresis','0.8 V'],['Inputs','Noisy OK'],['Output','Clean edges']],'Two thresholds, so a noisy input can’t make it flicker.'),
 _C('dff','D Flip-Flop','U','Component · Digital Logic','gate:DFF',[['Trigger','Rising edge'],['Setup','2 ns'],['Bits','1']],'One bit of memory, updated on every clock edge.'),
 _C('mux','Multiplexer','C','Component · Digital Logic','gate:MUX',[['Inputs','4:1'],['Select','2 bits'],['Delay','6 ns']],'Picks one input and forwards it. A railroad switch for signals.'),
 _C('shiftreg','Shift Register','C','Component · Digital Logic','ic:SHIFT',[['Bits','8'],['Mode','Serial in · parallel out'],['Clock','25 MHz']],'Turns three pins into eight outputs.'),
 _C('lvl','Level Shifter','C','Component · Interface IC','ic:LEVEL',[['Low side','1.8 V'],['High side','5 V'],['Channels','8']],'Lets 1.8 V and 5 V logic shake hands safely.'),
 _C('can','CAN Transceiver','C','Component · Interface IC','ic:CAN',[['Rate','1 Mbps'],['Nodes','110'],['Bus','Differential']],'How car modules talk without talking over each other.'),
 _C('eeprom','EEPROM','U','Component · Memory','eeprom',[['Size','256 Kbit'],['Endurance','1M writes'],['Retention','200 yrs']],'Remembers everything, even with the power off.'),
 _C('sram','SRAM','U','Component · Memory','ic:SRAM',[['Size','256 KB'],['Access','10 ns'],['Cell','6T']],'Fast memory that forgets when the power goes.'),
 _C('flash','Flash Memory','U','Component · Memory','ic:FLASH',[['Size','16 MB'],['Interface','Quad SPI'],['Erase','4 KB sectors']],'Where firmware lives between power cycles.'),
 _C('imu','IMU','U','Component · Sensor IC','ic:IMU',[['Axes','6'],['Accel','±16 g'],['Gyro','±2000 °/s']],'Knows which way is down and how fast it’s spinning.'),
 _C('rtc','Real-Time Clock','C','Component · Clocking','ic:RTC',[['Drift','±2 ppm'],['Backup','Coin cell'],['Alarms','2']],'Keeps the date even when everything else is asleep.'),
 _C('mcu','Microcontroller','H','Component · Processor','mcu',[['Core','32-bit'],['Clock','48 MHz'],['Flash','256 KB']],'The home chip. Every trace on this board leads back here.'),
 _C('fpga','FPGA','H','Component · Programmable Logic','fpga',[['Logic cells','25K'],['Block RAM','1.8 Mbit'],['Package','BGA-256']],'Hardware you can rewrite. Every skill, reconfigurable.'),
 /* ---- architecture & interfaces ---- */
 _C('alu','ALU','U','Architecture','arch:alu',[['Width','32-bit'],['Ops','Add · Sub · And · Or · Shift'],['Flags','Z N C V']],'The part of the CPU that actually does the math.'),
 _C('regfile','Register File','U','Architecture','arch:reg',[['Registers','32'],['Ports','2 read · 1 write'],['Width','32-bit']],'The CPU’s scratchpad, a cycle away.'),
 _C('pc','Program Counter','C','Architecture','arch:pc',[['Width','32-bit'],['Next','PC + 4'],['Or','Branch target']],'Always pointing at what happens next.'),
 _C('cache','Cache','U','Architecture','arch:cache',[['Size','16 KB'],['Ways','4'],['Hit time','1 cycle']],'Keeps a copy of what you used last, in case you need it again.'),
 _C('irq','Interrupt','C','Architecture','arch:irq',[['Latency','12 cycles'],['Priority','Nested'],['Source','Pin · timer · bus']],'Drop everything, handle this, then pick up where you left off.'),
 _C('boot','Bootloader','C','Architecture','ic:BOOT',[['Size','8 KB'],['Updates','Over UART'],['Runs','First']],'The first code that runs and the one that loads the rest.'),
 _C('uart','UART','C','Interface','wave:uart',[['Baud','115200'],['Frame','8N1'],['Wires','TX · RX']],'Start bit, eight data bits, stop bit. The classic.'),
 _C('i2c','I²C Bus','C','Interface','wave:i2c',[['Wires','SDA · SCL'],['Speed','400 kHz'],['Addresses','7-bit']],'Two wires, many chips, everyone takes turns.'),
 _C('spi','SPI Bus','C','Interface','wave:spi',[['Wires','4'],['Speed','50 MHz'],['Duplex','Full']],'Fast and simple: clock, data out, data in, chip select.'),
 _C('pwm','PWM','C','Interface','wave:pwm',[['Frequency','20 kHz'],['Duty','0–100%'],['Controls','LEDs · motors']],'Fake an analog level by switching fast enough.'),
 /* ---- circuit concepts & laws ---- */
 _C('divider','Voltage Divider','C','Circuit Concept','sym:divider',[['Out','V·R2 / (R1+R2)'],['Parts','2 resistors'],['Use','Scaling · bias']],'Two resistors, one useful fraction.'),
 _C('rc','RC Filter','C','Circuit Concept','sym:rc',[['Cutoff','1 / 2πRC'],['Slope','−20 dB/dec'],['Parts','R + C']],'Lets the slow stuff through and rounds off the rest.'),
 _C('lc','LC Tank','U','Circuit Concept','sym:lc',[['Resonance','1 / 2π√LC'],['Energy','Sloshes L ↔ C'],['Use','Oscillators']],'Energy swings back and forth between a coil and a capacitor.'),
 _C('ohm','Ohm’s Law','C','Law · Principle','eq:ohm',[['Equation','V = I · R'],['Since','1827'],['Units','V · A · Ω']],'The first equation on every EE whiteboard.'),
 _C('kcl','Kirchhoff’s Current Law','C','Law · Principle','eq:kcl',[['Statement','ΣI = 0'],['Conserves','Charge'],['Since','1845']],'What flows into a node must flow out.'),
 _C('kvl','Kirchhoff’s Voltage Law','C','Law · Principle','eq:kvl',[['Statement','ΣV = 0'],['Conserves','Energy'],['Since','1845']],'Go all the way around a loop and you end where you started.'),
 _C('nyquist','Nyquist Rate','U','Law · Principle','eq:nyquist',[['Rule','fₛ ≥ 2·f_max'],['Breaks as','Aliasing'],['Used in','Every ADC']],'Sample at least twice as fast as the signal or it lies to you.'),
 _C('demorgan','De Morgan’s Laws','U','Law · Principle','eq:demorgan',[['Law','¬(A∧B) = ¬A∨¬B'],['Pairs','AND ↔ OR'],['Use','Simplifying gates']],'Flip the gate, flip the inputs, same answer.'),
 _C('fourier','Fourier Series','H','Law · Principle','eq:fourier',[['Idea','Any wave = Σ sines'],['Used in','Spectra · filters'],['Since','1807']],'A square wave is just enough sine waves stacked up.'),
 _C('seebeck','Seebeck Effect','W','Law · Principle','eq:seebeck',[['Equation','V = S · ΔT'],['Powers','Every TEG'],['Since','1821']],'A temperature difference across a junction makes a voltage. The physics under the wearable research.'),
 _C('moore','Moore’s Law','W','Law · Principle','eq:moore',[['Observation','×2 every ~2 yrs'],['Counts','Transistors'],['Since','1965']],'The trend that let a whole board shrink onto one die.'),
 /* ---- fabrication ---- */
 _C('wafer','LC-2030 Wafer','W','Fabrication · Full Wafer','wafer',[['Diameter','300 mm'],['Dies','Every chip on this board'],['Rev','A']],'The whole board, before it was diced. Only collectors see this one.'),
 _C('mask','Photomask','U','Fabrication','fab:mask',[['Substrate','Quartz'],['Pattern','Chrome'],['Scale','4× reduction']],'The stencil a chip is printed from, one layer at a time.'),
 _C('resist','Photoresist','C','Fabrication','fab:resist',[['Thickness','~1 µm'],['Tone','Positive'],['Exposed by','UV']],'A light-sensitive coat that remembers where the light hit.'),
 _C('euv','EUV Lithography','H','Fabrication','fab:euv',[['Wavelength','13.5 nm'],['Optics','Mirrors only'],['Source','Tin plasma']],'Light so short it has to bounce off mirrors in a vacuum.'),
 _C('etch','Plasma Etch','U','Fabrication','fab:etch',[['Method','Reactive ion'],['Profile','Anisotropic'],['Removes','Unmasked layers']],'A glowing gas that carves straight down.'),
 _C('implant','Ion Implantation','U','Fabrication','fab:implant',[['Dopants','B · P · As'],['Energy','keV range'],['Sets','n and p regions']],'Fires atoms into silicon to decide where it conducts.'),
 _C('cmp','Chemical-Mechanical Polish','C','Fabrication','fab:cmp',[['Flatness','Nanometers'],['Pad','Rotating'],['Slurry','Abrasive']],'Sands every layer flat so the next one prints sharp.'),
 _C('via','Via','C','Fabrication · Interconnect','fab:via',[['Connects','Metal layers'],['Fill','Tungsten · copper'],['Count','Billions']],'A vertical wire, one of billions.'),
 _C('stdcell','Standard Cell','U','Fabrication · Layout','fab:stdcell',[['Height','9 tracks'],['Rails','VDD · GND'],['Library','Hundreds of cells']],'Logic gates drawn to one height so they tile in rows.'),
 _C('clktree','Clock Tree','H','Fabrication · Layout','fab:clktree',[['Shape','H-tree'],['Skew','< 20 ps'],['Buffers','Thousands']],'Branches so every flip-flop hears the clock at the same moment.'),
 _C('bondwire','Bond Wire','C','Fabrication · Packaging','fab:bondwire',[['Material','Gold'],['Diameter','25 µm'],['Joins','Die pad ↔ lead']],'Thinner than a hair, it carries every signal off the die.'),
 /* ---- lab ---- */
 _C('bboard','Breadboard','C','Lab Equipment','tool:breadboard',[['Tie points','830'],['Rails','4'],['Pitch','2.54 mm']],'Where every PCB starts. Including the TEG platform.'),
 _C('iron','Soldering Iron','C','Lab Equipment','tool:iron',[['Tip','350 °C'],['Power','60 W'],['Alloy','SAC305']],'Joins metal to metal at 217 °C.'),
 _C('dmm','Multimeter','C','Lab Equipment','tool:dmm',[['Display','6000 count'],['Modes','V · A · Ω'],['Continuity','Beep']],'The first tool out of every bag.'),
 _C('psu','Bench Supply','C','Lab Equipment','tool:psu',[['Output','0–30 V'],['Current','0–3 A'],['Channels','2']],'The adjustable heart of every bench.'),
 _C('fgen','Function Generator','C','Lab Equipment','tool:fgen',[['Range','1 µHz–25 MHz'],['Waves','Sine · square · ramp'],['Out','10 Vpp']],'Makes any waveform you ask for.'),
 _C('scope','Oscilloscope','H','Lab Equipment','tool:scope',[['Bandwidth','200 MHz'],['Channels','4'],['Sample','2 GS/s']],'Lets you watch voltage happen.'),
 _C('logic','Logic Analyzer','U','Lab Equipment','tool:la',[['Channels','16'],['Rate','100 MS/s'],['Decodes','I²C · SPI · UART']],'Reads the conversation on a digital bus.'),
 _C('spec','Spectrum Analyzer','H','Lab Equipment','tool:spec',[['Range','9 kHz–3 GHz'],['RBW','10 Hz'],['Floor','−160 dBm/Hz']],'Shows a signal as frequencies instead of time.'),
 _C('reflow','Reflow Oven','U','Lab Equipment','tool:reflow',[['Peak','245 °C'],['Zones','5'],['Profile','Lead-free']],'Solder paste goes in, finished boards come out.'),
 _C('printer','3D Printer','U','Lab Equipment','tool:printer',[['Layer','0.2 mm'],['Material','PLA · PETG'],['Printed','Half a robot']],'Printed over half of the Team 18996 robot’s parts.'),
 _C('cnc','CNC Mill','U','Lab Equipment','tool:cnc',[['Axes','3'],['Spindle','10K rpm'],['Made','Robot prototypes']],'Turns a CAD file into a real part.'),
 _C('spin','Spin Coater','U','Lab Equipment','tool:spin',[['Speed','Up to 6000 rpm'],['Used for','Fluorinating films'],['Where','ISO 7 clean room']],'Spreads a few drops into a layer only nanometers thick.'),
 _C('xrd','X-Ray Diffractometer','H','Lab Equipment','tool:xrd',[['Source','Cu Kα'],['Scan','2θ'],['Reveals','Crystal structure']],'Bounces X-rays off atoms to see how they’re stacked.'),
 _C('cleanroom','Clean Room','H','Lab Equipment','tool:cleanroom',[['Class','ISO 7'],['Airflow','Filtered, downward'],['Dress','Full gown']],'Filtered air, sticky mats and a full gown before you touch a film.'),
 _C('telescope','Telescope','U','Lab Equipment','tool:telescope',[['Site','George Mason'],['Target','TOI 5868.01'],['Frames','100+']],'Collected the photons behind a planet candidate.'),
 _C('probe','Four-Point Probe','C','Lab Technique','probe',[['Probes','4'],['Measures','Sheet resistance'],['Used on','10 CMO films']],'Two needles push current, two listen. Contact resistance never gets a vote.'),
 _C('pld','Pulsed Laser Deposition','U','Lab Technique','pld',[['Target','CaMnO₃'],['Samples','10 films'],['Site','Towson Univ.']],'Hit a target with a laser and catch the plume on a substrate.'),
 /* ---- Lucas: projects ---- */
 _C('teg','TEG Wearable Platform','H','Project · UMBC Research','teg',[['Trials','10'],['TEG configs','4'],['Published','Oxford JSS, 2026']],'Body heat in, electrocardiograph pulse out. Heat sinks made the difference.'),
 _C('film','CaMnO₃ Thin Film','H','Project · Towson Research','film',[['Method','Pulsed laser dep.'],['Clean room','ISO 7'],['Fluorinated','5+ films']],'A perovskite only a few hundred atoms thick, mapped with XRD.'),
 _C('exo','TOI 5868.01','W','Project · GMU Exoplanet Validation','exo',[['Images','100+'],['Tools','AstroImageJ · Python'],['Published','GMU MARS, 2024']],'A dip in starlight, followed up from the ground. Likely a real planet.'),
 _C('robot','Team 18996 Robot','H','Project · FIRST Tech Challenge','robot',[['Subsystems','30+'],['Prototypes','20+'],['Raised','$10,000+']],'Six seasons of design meetings, wiring and intake iterations.'),
 _C('stars','STARS Chip Design','U','Project · Purdue SoCET','stars',[['HDL','SystemVerilog'],['Focus','Digital logic'],['Since','Aug 2026']],'Where the gates in these cards actually get designed.'),
 _C('orbital','Propulsion DAQ','U','Project · Purdue Orbital','rocket',[['Team','Propulsion'],['Focus','Data acquisition'],['Since','Sep 2026']],'Every burn is a dataset waiting to be logged.'),
 /* ---- Lucas: life ---- */
 _C('purdue','Purdue ECE ’30','W','Lucas · Education','life:purdue',[['Degree','B.E. Electrical Eng.'],['Minors','CompE · Management'],['Class','2030']],'Where the next revision of this board gets designed.'),
 _C('phys','AP Physics C','U','Lucas · Coursework','life:phys',[['Topics','Mechanics · E&M'],['Also','Calc BC · Diff. Eq.'],['School','River Hill']],'The E&M half is where circuits stopped being magic.'),
 _C('outreach','STEM Outreach','W','Lucas · Leadership','life:outreach',[['Raised','$10,000+ in a year'],['Sponsors','10+'],['Where','Baltimore']],'Three years teaching STEM to kids who don’t always get the chance.'),
 _C('engclub','Engineering Club','H','Lucas · Leadership','life:club',[['Role','Co-President'],['Status','Founder'],['School','River Hill']],'Started it, ran it, built things with it.'),
 _C('econ','Economics Club','U','Lucas · Leadership','life:econ',[['Role','Co-President'],['Status','Founder'],['School','River Hill']],'The Management minor started somewhere.'),
 _C('mths','Technology Honor Society','U','Lucas · Leadership','life:honor',[['Role','Vice President'],['Chapter','River Hill'],['State','Maryland']],'Recognized for doing the work, then organized more of it.'),
 _C('xc','Cross Country Captain','U','Lucas · Athletics','life:run',[['Role','Captain'],['Team','River Hill XC'],['Also','Track & Field']],'Long runs, team pace, early mornings.'),
 _C('band','Section Leader','U','Lucas · Music','life:band',[['Role','Section Leader'],['Groups','Marching Band · Wind Ens.'],['School','River Hill']],'Keeping a whole section in step, literally.'),
 _C('swimcard','Swim Instructor','C','Lucas · Work','life:swim',[['Ages','6–12'],['Strokes','4'],['Sessions','6 weeks']],'Taught big classes their first real strokes.'),
 _C('ft','Free Throw','C','Lucas · Off the Clock','life:hoop',[['Distance','15 ft'],['Arc','~45°'],['Sound','Swish']],'Bend the knees, follow through.'),
 _C('aim','Crosshair Placement','C','Lucas · Off the Clock','life:aim',[['Sensitivity','Low'],['Crosshair','Static'],['Focus','First shot']],'Put the crosshair where they’ll be, then stop moving.'),
 _C('binder','Collector’s Binder','H','Lucas · Off the Clock','life:binder',[['Slots','150'],['Set','LC-2030 Die Cards'],['Goal','Fill it']],'You’re holding a card about holding cards.'),
 _C('electron','The Electron','W','Lucas · The Board','life:electron',[['Charge','−1.602×10⁻¹⁹ C'],['Mass','9.109×10⁻³¹ kg'],['Role','You, on the board']],'Every trip across this board was made by one of these.'),
 /* ---- full art landscapes ---- */
 _C('fa_sunset','Silicon Sunset','F','Full Art · Landscape','full:sunset',[['Layer','Metal 6'],['Hour','Golden']],'Ridges routed in copper, under a sun made of dies.'),
 _C('fa_canyon','Copper Canyon','F','Full Art · Landscape','full:canyon',[['Strata','12 layers'],['River','64-bit bus']],'Millions of years of layers, and a data bus running through the bottom.'),
 _C('fa_aurora','Aurora Over the Fab','F','Full Art · Landscape','full:aurora',[['Sky','Waveforms'],['Ground','Fresh snow']],'Northern lights drawn as signals over a fab asleep in the snow.'),
 _C('fa_city','Midnight Grid City','F','Full Art · Landscape','full:city',[['Skyline','Packages'],['Streets','Traces']],'Every tower a chip, every street a trace, every light a bit.'),
 _C('fa_coast','Quartz Coast','F','Full Art · Landscape','full:coast',[['Cliffs','Crystal'],['Sea','Sine waves']],'Waves keep time against cliffs of quartz.'),
 _C('fa_thermal','Hot Side, Cold Side','F','Full Art · Landscape','full:thermal',[['ΔT','Desert ↔ glacier'],['Output','Current']],'Put the desert next to the glacier and current flows between them.')
];
const SET_SIZE=CARDS.length;
CARDS.push(
 _C('sr_escape','The Great Escape','S','Secret · Full Art','full:escape',[['Trail','Routed by hand'],['Elevation','Worth it']],'Somewhere past the last via, the trail keeps going.'),
 _C('sr_ramen','Midnight Ramen','S','Secret · Full Art','full:ramen',[['Broth','12 hours'],['Steam','Self-routing']],'Fuel for the late-night tape-out.'));
CARDS.forEach((c,i)=>{c.no=i+1});
const BY=Object.fromEntries(CARDS.map(c=>[c.id,c]));
const THEME={
  home:['mcu','eeprom','stars','timer','alu','regfile','pc','cache','irq','boot','sram','flash','electron','fa_city'],
  research:['vreg','teg','film','pld','probe','exo','seebeck','peltier','tc','boost','spin','xrd','cleanroom','telescope','fa_thermal','fa_canyon'],
  experience:['eeprom','orbital','robot','stars','outreach','engclub','econ','mths','xc','band','swimcard','purdue','printer','cnc'],
  skills:['fpga','opamp','mos','npn','nand','xor','dff','mux','shiftreg','schmitt','comp','inamp','stdcell','clktree','mask','euv','fa_sunset'],
  timeline:['xtal','timer','ind','pll','rtc','lc','fourier','nyquist','moore','purdue','fa_aurora'],
  play:['led','res','diode','robot','ft','aim','binder','seg7','oled','piezo','button','encoder','servo','fa_coast'],
  contact:['ant','cap','ind','uart','i2c','spi','can','opto','xfmr','bead','mic','ultra'],
  resume:['wafer','cap','res','mcu','dmm','scope','psu','fgen','iron','bboard','purdue']
};

/* ---------------- storage ---------------- */
let mem={};
function load(){try{const v=JSON.parse(localStorage.getItem('lc-cards')||'{}');if(v&&typeof v==='object')mem=v}catch(e){}}
function save(){try{localStorage.setItem('lc-cards',JSON.stringify(mem))}catch(e){}}
load();
let packs=[];try{const v=JSON.parse(localStorage.getItem('lc-packs')||'[]');if(Array.isArray(v))packs=v.filter(t=>t&&t.id)}catch(e){}
function savePacks(){try{localStorage.setItem('lc-packs',JSON.stringify(packs))}catch(e){}}
function grant(chip,label,color){const t={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),chip,label,color};packs.push(t);savePacks();changed();return t}
const owned=()=>CARDS.filter(c=>mem[c.id]>0).length;
const listeners=[];function changed(){listeners.forEach(f=>{try{f(owned(),CARDS.length)}catch(e){}})}

/* ---------------- parametric art (480×300) ---------------- */
const DRAW=(function(){
  const gold='#e0a84a',ink='#ecebf5',cyan='#6ee7ff',red='#ff6b6f',green='#3fdc9c',violet='#d77bff',amber='#ffcf4d',blue='#5b8cff',steel='#c9ced8';
  const W=480,H=300,cx=240,cy=150;
  let g;
  const L=(pts,col,w,dash)=>{g.strokeStyle=col||ink;g.lineWidth=w||5;g.setLineDash(dash||[]);g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.setLineDash([])};
  const T=(s,x,y,sz,col,al,wt,font)=>{g.font=`${wt||700} ${sz||20}px ${font||'"JetBrains Mono",monospace'}`;g.fillStyle=col||ink;g.textAlign=al||'center';g.fillText(s,x,y);g.textAlign='left'};
  const glow=(c,b)=>{g.shadowColor=c;g.shadowBlur=b||20};const ng=()=>{g.shadowBlur=0};
  const lead=(a,b,y)=>{L([[40,y||cy],[a||150,y||cy]],gold,7);L([[b||330,y||cy],[440,y||cy]],gold,7)};
  const zig=(x0,x1,y,col,amp)=>{const n=12,dx=(x1-x0)/n,a=amp||22;const p=[[x0,y]];for(let i=0;i<n;i++)p.push([x0+dx*(i+.5),y+(i%2?a:-a)]);p.push([x1,y]);L(p,col||ink,6)};
  const coil=(x0,x1,y,n,col)=>{g.strokeStyle=col||ink;g.lineWidth=7;const r=(x1-x0)/(n*2);for(let i=0;i<n;i++){g.beginPath();g.arc(x0+r+i*2*r,y,r,Math.PI,0);g.stroke()}};
  const coilV=(x,y0,y1,n,dir,col)=>{g.strokeStyle=col||ink;g.lineWidth=7;const r=(y1-y0)/(n*2);for(let i=0;i<n;i++){g.beginPath();g.arc(x,y0+r+i*2*r,r,dir>0?-Math.PI/2:Math.PI/2,dir>0?Math.PI/2:Math.PI*1.5);g.stroke()}};
  const plate=(x,y,h,col)=>{g.fillStyle=col||ink;g.fillRect(x-6,y-h/2,12,h)};
  const tri=(x,y,s,col,dirR)=>{g.fillStyle=col||ink;g.beginPath();if(dirR!==false){g.moveTo(x-s,y-s);g.lineTo(x-s,y+s);g.lineTo(x+s,y)}else{g.moveTo(x+s,y-s);g.lineTo(x+s,y+s);g.lineTo(x-s,y)}g.closePath();g.fill()};
  const circ=(x,y,r,col,fill,w)=>{g.beginPath();g.arc(x,y,r,0,6.283);if(fill){g.fillStyle=fill;g.fill()}g.strokeStyle=col||ink;g.lineWidth=w||6;g.stroke()};
  const arrow=(x0,y0,x1,y1,col,w)=>{L([[x0,y0],[x1,y1]],col,w||5);const a=Math.atan2(y1-y0,x1-x0),s=14;g.fillStyle=col;g.beginPath();g.moveTo(x1,y1);g.lineTo(x1-Math.cos(a-.45)*s,y1-Math.sin(a-.45)*s);g.lineTo(x1-Math.cos(a+.45)*s,y1-Math.sin(a+.45)*s);g.closePath();g.fill()};
  const raysIn=(x,y,col)=>{arrow(x-70,y-90,x-28,y-42,col||amber,4);arrow(x-30,y-100,x+6,y-50,col||amber,4)};
  const raysOut=(x,y,col)=>{arrow(x+10,y-40,x+50,y-88,col||amber,4);arrow(x+44,y-30,x+88,y-74,col||amber,4)};
  const box=(x,y,w,h,col,fill,lw)=>{if(fill){g.fillStyle=fill;g.fillRect(x,y,w,h)}g.strokeStyle=col||ink;g.lineWidth=lw||5;g.strokeRect(x,y,w,h)};
  const chipPkg=(x,y,w,h,pins,label,sub)=>{g.fillStyle='#1d1f2b';g.fillRect(x,y,w,h);g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=2;g.strokeRect(x,y,w,h);
    for(let i=0;i<pins;i++){const t=y+14+i*((h-28)/(pins-1||1));g.fillStyle=steel;g.fillRect(x-20,t-4,20,8);g.fillRect(x+w,t-4,20,8)}
    g.fillStyle='rgba(236,235,245,.5)';g.beginPath();g.arc(x+14,y+14,5,0,6.283);g.fill();
    let fs=Math.min(34,w/(label.length*.66));T(label,x+w/2,y+h/2+fs*.35,fs,ink,'center',800);if(sub)T(sub,x+w/2,y+h/2+fs*.35+22,13,'rgba(236,235,245,.55)','center',500)};
  const sine=(x0,x1,y,amp,cyc,col,w,ph)=>{g.strokeStyle=col;g.lineWidth=w||4;g.beginPath();for(let x=x0;x<=x1;x+=2){const yy=y-Math.sin((x-x0)/(x1-x0)*cyc*6.283+(ph||0))*amp;x===x0?g.moveTo(x,yy):g.lineTo(x,yy)}g.stroke()};
  const sq=(x0,x1,y,amp,cyc,col,w,duty)=>{const p=[];const per=(x1-x0)/cyc,d=duty||.5;for(let i=0;i<cyc;i++){const a=x0+i*per;p.push([a,y+amp],[a,y-amp],[a+per*d,y-amp],[a+per*d,y+amp])}p.push([x1,y+amp]);L(p,col,w||4)};
  const bits=(x0,y,bitsArr,bw,amp,col,lab)=>{const p=[];bitsArr.forEach((b,i)=>{const yy=b?y-amp:y+amp;p.push([x0+i*bw,yy],[x0+(i+1)*bw,yy])});L(p,col,4);if(lab)T(lab,x0-12,y+6,14,'rgba(236,235,245,.6)','right',600)};

  const SYM={
    shunt:()=>{lead(150,330);box(150,cy-28,180,56,ink,'#2a2e44');L([[190,cy-28],[190,cy-90]],amber,5);L([[290,cy-28],[290,cy-90]],amber,5);T('K',190,cy-100,16,amber);T('K',290,cy-100,16,amber);T('10 mΩ',cx,cy+8,22,ink)},
    pot:()=>{lead(150,330);zig(150,330,cy);arrow(cx,50,cx,cy-30,amber,6)},
    therm:()=>{lead(150,330);zig(150,330,cy);L([[160,cy+60],[300,cy-60],[330,cy-60]],red,5);T('T°',360,cy-54,22,red,'left')},
    ldr:()=>{lead(150,330);zig(160,320,cy);circ(cx,cy,100,ink,null,5);raysIn(cx-10,cy-20)},
    mlcc:()=>{lead(190,290);g.fillStyle='#b48a52';g.fillRect(190,cy-50,100,100);for(let i=0;i<9;i++){g.fillStyle=i%2?'#d8dce4':'#8a6a3c';g.fillRect(196,cy-44+i*10.5,88,5)}g.fillStyle=steel;g.fillRect(180,cy-50,16,100);g.fillRect(284,cy-50,16,100)},
    supercap:()=>{lead(205,275);plate(212,cy,140);g.strokeStyle=ink;g.lineWidth=12;g.beginPath();g.arc(330,cy,72,Math.PI*.78,Math.PI*1.22);g.stroke();T('1 F',cx,cy+110,26,amber)},
    bead:()=>{lead(180,300);g.fillStyle='#3b3f4f';rrect(180,cy-40,120,80,30);g.fill();L([[150,cy],[330,cy]],gold,5);T('FB',cx,cy-56,18,'rgba(236,235,245,.6)')},
    xfmr:()=>{coilV(200,60,240,4,1);coilV(280,60,240,4,-1);L([[232,55],[232,245]],ink,4);L([[248,55],[248,245]],ink,4);L([[40,60],[200,60]],gold,6);L([[40,240],[200,240]],gold,6);L([[280,60],[440,60]],gold,6);L([[280,240],[440,240]],gold,6)},
    fuse:()=>{lead(160,320);box(160,cy-30,160,60,ink,'#1d1f2b');L([[160,cy],[320,cy]],amber,4)},
    zener:()=>{lead(170,300);tri(225,cy,55,ink);L([[282,cy-56],[282,cy+56]],ink,10);L([[282,cy-56],[262,cy-72]],ink,8);L([[282,cy+56],[302,cy+72]],ink,8);L([[150,cy],[170,cy]],gold,7)},
    schottky:()=>{lead(170,300);tri(225,cy,55,ink);L([[300,cy-46],[300,cy-56],[282,cy-56],[282,cy+56],[264,cy+56],[264,cy+46]],ink,8)},
    photodiode:()=>{lead(170,300);tri(225,cy,55,ink);plate(285,cy,112);raysIn(230,cy-30)},
    opto:()=>{box(70,40,340,220,'rgba(255,255,255,.25)',null,3);tri(150,cy,40,red,false);L([[110,cy-40],[110,cy+40]],red,8);arrow(185,cy-10,250,cy-10,amber,4);arrow(185,cy+18,250,cy+18,amber,4);circ(330,cy,50,ink,null,5);L([[310,cy-30],[310,cy+30]],ink,8);L([[310,cy-12],[350,cy-50]],ink,5);L([[310,cy+12],[350,cy+50]],ink,5)},
    solar:()=>{g.fillStyle=amber;glow(amber,30);g.beginPath();g.arc(90,70,34,0,6.283);g.fill();ng();for(let i=0;i<3;i++)for(let j=0;j<5;j++){g.fillStyle='#1b2f6b';g.fillRect(180+j*50,100+i*50,46,46);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.strokeRect(180+j*50,100+i*50,46,46)}arrow(120,90,190,120,amber,4);arrow(110,120,180,170,amber,4);T('+',440,120,26,red);T('−',440,200,26,blue)},
    pnp:()=>{circ(cx,cy,92,ink);plate(cx-24,cy,104);L([[60,cy],[cx-30,cy]],gold,7);L([[cx-18,cy-24],[cx+50,cy-80],[cx+50,cy-130]],gold,7);L([[cx-18,cy+24],[cx+50,cy+80],[cx+50,cy+130]],gold,7);arrow(cx+40,cy+70,cx-6,cy+32,gold,5)},
    darl:()=>{[[180,cy-20],[300,cy+30]].forEach(([x,y])=>{circ(x,y,58,ink,null,5);plate(x-14,y,64);L([[x-8,y-14],[x+30,y-46]],gold,6);L([[x-8,y+14],[x+30,y+46]],gold,6)});L([[40,cy-20],[166,cy-20]],gold,6);L([[210,cy+26],[286,cy+30]],gold,6);L([[210,cy-66],[330,cy-66],[330,cy-16]],gold,6)},
    jfet:()=>{plate(cx,cy,140);L([[cx,cy-60],[cx+110,cy-60],[cx+110,30]],gold,7);L([[cx,cy+60],[cx+110,cy+60],[cx+110,270]],gold,7);arrow(60,cy+40,cx-8,cy+40,gold,6)},
    igbt:()=>{plate(200,cy,140);plate(226,cy,150);L([[60,cy],[194,cy]],gold,7);L([[232,cy-50],[330,cy-90],[330,40]],gold,7);L([[232,cy+50],[330,cy+90],[330,260]],gold,7);arrow(280,cy+70,330,cy+90,gold,5)},
    triac:()=>{tri(220,cy-40,40,ink);tri(260,cy+40,40,ink,false);L([[180,cy-80],[180,cy+80]],ink,6);L([[300,cy-80],[300,cy+80]],ink,6);lead(180,300);L([[300,cy+80],[360,cy+130]],gold,6)},
    scr:()=>{lead(170,300);tri(225,cy,55,ink);plate(285,cy,112);L([[285,cy+50],[330,cy+110],[400,cy+110]],gold,6);T('G',410,cy+116,18,amber,'left')},
    piezo:()=>{lead(190,290);plate(198,cy,130);plate(282,cy,130);box(214,cy-40,52,80,amber,'rgba(255,207,77,.2)',3);for(let r=1;r<4;r++){g.strokeStyle='rgba(110,231,255,.6)';g.lineWidth=3;g.beginPath();g.arc(340,cy-80,r*20,Math.PI*1.1,Math.PI*1.6);g.stroke()}},
    button:()=>{lead(160,320);circ(160,cy,8,ink,ink);circ(320,cy,8,ink,ink);L([[150,cy-46],[330,cy-46]],ink,8);L([[cx,cy-46],[cx,cy-110]],ink,6);L([[cx-30,cy-110],[cx+30,cy-110]],ink,8)},
    reed:()=>{g.strokeStyle='rgba(180,220,255,.5)';g.lineWidth=4;rrect(120,cy-50,240,100,50);g.stroke();L([[40,cy],[250,cy-6]],gold,7);L([[230,cy+6],[440,cy]],gold,7);g.fillStyle=red;g.fillRect(170,40,70,26);g.fillStyle=blue;g.fillRect(240,40,70,26);T('N',205,60,18,ink);T('S',275,60,18,ink)},
    encoder:()=>{circ(130,cy,80,ink,'#1d1f2b');for(let i=0;i<24;i++){const a=i/24*6.283;L([[130+Math.cos(a)*62,cy+Math.sin(a)*62],[130+Math.cos(a)*76,cy+Math.sin(a)*76]],steel,3)}L([[130,cy],[130,cy-55]],amber,6);sq(250,450,110,22,4,cyan,4);sq(275,475,200,22,4,violet,4);T('A',236,116,16,cyan,'right');T('B',236,206,16,violet,'right')},
    relay:()=>{box(70,90,120,120,ink,'#1d1f2b',4);coilV(130,100,200,4,1,amber);L([[190,cy],[230,cy]],'rgba(255,255,255,.4)',3,[6,6]);L([[250,200],[400,120]],ink,7);circ(250,200,8,ink,ink);circ(410,110,8,ink,ink);circ(410,210,8,ink,ink);L([[410,210],[460,210]],gold,6);L([[410,110],[460,110]],gold,6)},
    cell:()=>{lead(205,275);plate(212,cy,150);g.fillStyle=ink;g.fillRect(262,cy-36,12,72);T('+',190,cy-80,32,red);T('3.7 V',cx,cy+120,22,amber)},
    coin:()=>{const gr=g.createLinearGradient(140,40,340,260);gr.addColorStop(0,'#e6e9f0');gr.addColorStop(1,'#8b90a0');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,110,0,6.283);g.fill();g.strokeStyle='#6c7180';g.lineWidth=6;g.beginPath();g.arc(cx,cy,96,0,6.283);g.stroke();T('+',cx,cy+12,46,'#3a3f50');T('3V',cx,cy+60,22,'#3a3f50')},
    motor:()=>{lead(170,310);circ(cx,cy,72,ink,'#1d1f2b');T('M',cx,cy+16,48,amber,'center',800)},
    stepper:()=>{circ(cx,cy,80,ink,'#1d1f2b');T('M',cx,cy+16,48,amber,'center',800);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b],i)=>L([[cx+a*60,cy+b*55],[cx+a*190,cy+b*90]],[red,blue,green,'#111'][i]==='#111'?ink:[red,blue,green][i],5));for(let i=0;i<12;i++){const a=i/12*6.283;L([[cx+Math.cos(a)*86,cy+Math.sin(a)*86],[cx+Math.cos(a)*98,cy+Math.sin(a)*98]],steel,3)}},
    servo:()=>{box(140,80,200,140,ink,'#1d1f2b',4);circ(290,120,18,steel,steel);L([[290,120],[400,60]],ink,14);g.strokeStyle='rgba(255,207,77,.6)';g.lineWidth=3;g.setLineDash([6,6]);g.beginPath();g.arc(290,120,120,-Math.PI*.9,-Math.PI*.05);g.stroke();g.setLineDash([]);['#8a5a2b',red,amber].forEach((c,i)=>L([[140,180+i*10],[60,180+i*10]],c,6))},
    hall:()=>{box(180,90,120,120,ink,'#1d1f2b',4);T('H',cx,cy+18,54,cyan,'center',800);for(let i=0;i<4;i++){g.strokeStyle='rgba(215,123,255,.6)';g.lineWidth=3;g.beginPath();g.ellipse(cx,cy,140+i*14,50+i*18,0,0,6.283);g.stroke()}g.fillStyle=red;g.fillRect(30,cy-20,50,40);g.fillStyle=blue;g.fillRect(400,cy-20,50,40)},
    tc:()=>{L([[40,90],[300,cy]],'#d9a441',8);L([[40,210],[300,cy]],'#9aa0b8',8);glow(red,30);circ(300,cy,14,red,red);ng();for(let i=0;i<3;i++)L([[330+i*30,cy-40],[340+i*30,cy-60],[330+i*30,cy-80],[340+i*30,cy-100]],red,4);T('ΔT',380,cy+60,26,amber)},
    strain:()=>{box(110,70,260,160,'rgba(255,255,255,.25)','#2a1f12',2);g.strokeStyle=gold;g.lineWidth=4;g.beginPath();g.moveTo(140,100);for(let i=0;i<10;i++){const x=150+i*20;g.lineTo(x,100);g.lineTo(x,200);g.lineTo(x+10,200);g.lineTo(x+10,100)}g.stroke();arrow(90,cy,30,cy,cyan,5);arrow(390,cy,450,cy,cyan,5)},
    pressure:()=>{box(130,170,220,70,ink,'#1d1f2b',4);g.strokeStyle=cyan;g.lineWidth=6;g.beginPath();g.moveTo(130,170);g.quadraticCurveTo(cx,120,350,170);g.stroke();for(let i=0;i<5;i++)arrow(160+i*40,40,160+i*40,110,'rgba(110,231,255,.7)',3)},
    mic:()=>{circ(170,cy,60,ink,'#1d1f2b');for(let i=-3;i<=3;i++)L([[130,cy+i*14],[210,cy+i*14]],'rgba(255,255,255,.25)',3);for(let r=1;r<4;r++){g.strokeStyle='rgba(110,231,255,.7)';g.lineWidth=4;g.beginPath();g.arc(170,cy,60+r*34,-.6,.6);g.stroke()}},
    ultra:()=>{[150,330].forEach(x=>{circ(x,120,48,steel,'#1d1f2b',6);for(let i=0;i<5;i++)L([[x-30,100+i*10],[x+30,100+i*10]],'rgba(255,255,255,.2)',2)});for(let r=1;r<5;r++){g.strokeStyle=`rgba(110,231,255,${.9-r*.15})`;g.lineWidth=3;g.beginPath();g.arc(150,120,50+r*26,.9,1.5);g.stroke()}box(120,230,240,30,steel,'#1d1f2b',3)},
    peltier:()=>{g.fillStyle='#e9e4da';g.fillRect(100,70,280,22);g.fillRect(100,208,280,22);for(let i=0;i<9;i++){g.fillStyle=i%2?blue:red;g.fillRect(112+i*30,92,18,116)}T('HOT',440,90,16,red,'right');T('COLD',440,226,16,blue,'right')},
    seg7:()=>{const D=[[1,1,1,1,1,1,0],[0,1,1,0,0,0,0],[1,1,0,1,1,0,1],[1,1,1,1,0,0,1]];[3,3,0,0].forEach((dg,k)=>{const x=70+k*90,y=70;const on=[[1,1,1,1,0,0,1],[1,1,1,1,0,0,1],[1,1,1,1,1,1,0],[1,1,1,1,1,1,0]][k];
      const seg=[[x+8,y,56,10],[x+62,y+6,10,64],[x+62,y+80,10,64],[x+8,y+144,56,10],[x,y+80,10,64],[x,y+6,10,64],[x+8,y+72,56,10]];seg.forEach((s,i)=>{g.fillStyle=on[i]?red:'rgba(255,107,111,.1)';if(on[i])glow(red,14);g.fillRect(...s);ng()});if(k===1){g.fillStyle=red;g.fillRect(x+80,y+144,10,10)}})},
    oled:()=>{box(70,50,340,200,steel,'#000',6);for(let i=0;i<40;i++){const x=90+(i%10)*30,y=70+(i/10|0)*40;g.fillStyle=(i*7)%3?'rgba(110,231,255,.85)':'rgba(110,231,255,.15)';g.fillRect(x,y,22,30)}},
    comp:()=>{g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(130,50);g.lineTo(130,250);g.lineTo(290,cy);g.closePath();g.stroke();L([[40,100],[130,100]],gold,6);L([[40,200],[130,200]],gold,6);L([[290,cy],[330,cy]],gold,6);sq(340,450,cy,26,1,green,4,.5);T('−',150,112,34,ink,'left');T('+',150,212,34,ink,'left')},
    inamp:()=>{g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(200,50);g.lineTo(200,250);g.lineTo(360,cy);g.closePath();g.stroke();L([[360,cy],[440,cy]],gold,6);T('IA',255,cy+12,30,ink,'center',800);
      g.strokeStyle=green;g.lineWidth=3;g.beginPath();for(let x=20;x<190;x+=2){const k=(x-20)%60;const y=95-(k>26&&k<30?(k-26)*10:k>=30&&k<34?40-(k-30)*14:0);x===20?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();L([[20,200],[200,200]],gold,6)},
    schmitt:()=>{g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(120,60);g.lineTo(120,240);g.lineTo(290,cy);g.closePath();g.stroke();L([[40,cy],[120,cy]],gold,6);L([[290,cy],[440,cy]],gold,6);
      L([[150,cy+30],[205,cy+30],[205,cy-30],[240,cy-30]],amber,4);L([[175,cy+30],[175,cy-30],[240,cy-30]],amber,4)},
    divider:()=>{L([[cx,20],[cx,60]],gold,7);zigV(cx,60,140);L([[cx,140],[cx,160]],gold,7);zigV(cx,160,240);L([[cx,240],[cx,280]],gold,7);L([[cx,150],[400,150]],amber,6);circ(400,150,8,amber,amber);T('V·R2/(R1+R2)',400,190,16,amber,'center',600);T('R1',cx-50,106,18,ink);T('R2',cx-50,206,18,ink)},
    rc:()=>{L([[40,90],[100,90]],gold,6);zig(100,220,90,ink,16);L([[220,90],[260,90],[260,120]],gold,6);plate(260,126,80);g.save();g.translate(260,0);g.rotate(0);g.restore();L([[220,138],[300,138]],ink,8);L([[220,152],[300,152]],ink,8);L([[260,152],[260,200]],gold,6);
      g.strokeStyle=cyan;g.lineWidth=4;g.beginPath();g.moveTo(320,80);g.lineTo(380,80);g.quadraticCurveTo(410,80,460,200);g.stroke();T('f_c',380,70,16,cyan)},
    lc:()=>{coilV(150,60,240,4,1);L([[300,60],[300,130]],gold,6);L([[260,130],[340,130]],ink,9);L([[260,150],[340,150]],ink,9);L([[300,150],[300,240]],gold,6);L([[150,60],[300,60]],gold,6);L([[150,240],[300,240]],gold,6);sine(360,460,cy,40,2,amber,4)}
  };
  function zigV(x,y0,y1){const n=5,dy=(y1-y0)/(n*2);const p=[[x,y0]];for(let i=0;i<n*2;i++)p.push([x+(i%2?18:-18),y0+dy*(i+.5)]);p.push([x,y1]);L(p,ink,6)}
  function rrect(x,y,w,h,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)}

  const ICG={
    BUCK:()=>{coil(330,440,90,3,amber);arrow(385,140,385,230,green,5);T('12V→3V3',385,270,15,ink)},
    BOOST:()=>{coil(330,440,90,3,amber);arrow(385,230,385,140,green,5);T('0.5V→3V3',385,270,15,ink)},
    PUMP:()=>{[350,410].forEach(x=>{plate(x-8,140,60);plate(x+8,140,60)});arrow(330,220,440,220,cyan,4);T('−5 V',385,265,16,ink)},
    'H-BRIDGE':()=>{L([[330,60],[330,240]],ink,4);L([[440,60],[440,240]],ink,4);[[330,90],[440,90],[330,210],[440,210]].forEach(([x,y])=>{box(x-12,y-14,24,28,amber,'#1d1f2b',3)});circ(385,150,26,ink,'#1d1f2b',4);T('M',385,158,20,amber);L([[342,150],[359,150]],ink,4);L([[411,150],[428,150]],ink,4)},
    VREF:()=>{T('1.23 V',385,140,28,amber,'center',800);L([[330,180],[440,180]],green,4);T('±10 ppm',385,214,14,ink)},
    ADC:()=>{sine(320,380,150,40,1,cyan,3);const p=[];for(let i=0;i<8;i++){const v=Math.round(Math.sin(i/7*6.283)*3)*12;p.push([390+i*8,150-v],[398+i*8,150-v])}L(p,green,3);arrow(372,220,400,220,ink,3)},
    DAC:()=>{const p=[];for(let i=0;i<8;i++){const v=Math.round(Math.sin(i/7*6.283)*3)*12;p.push([320+i*8,150-v],[328+i*8,150-v])}L(p,green,3);sine(400,460,150,40,1,cyan,3)},
    PLL:()=>{sine(320,460,110,22,2,red,3);sine(320,460,190,22,8,cyan,3);T('×1464',390,265,15,ink)},
    SHIFT:()=>{for(let i=0;i<8;i++){g.fillStyle=i%3?'rgba(63,220,156,.25)':green;g.fillRect(320+i*16,130,13,40)}arrow(320,200,450,200,amber,4)},
    LEVEL:()=>{sq(320,450,110,14,3,cyan,3);sq(320,450,200,26,3,amber,3);T('1V8',310,116,13,cyan,'right');T('5V',310,206,13,amber,'right')},
    CAN:()=>{sq(320,450,130,16,3,cyan,3);const p=[];for(let i=0;i<3;i++){const a=320+i*43;p.push([a,186],[a,214],[a+21,214],[a+21,186])}L(p,violet,3)},
    SRAM:()=>{for(let i=0;i<6;i++)for(let j=0;j<5;j++){g.fillStyle=(i+j)%3?'rgba(91,140,255,.25)':blue;g.fillRect(325+i*21,85+j*26,16,20)}},
    FLASH:()=>{for(let i=0;i<6;i++)for(let j=0;j<5;j++){g.fillStyle=(i*j)%4?'rgba(255,207,77,.2)':amber;g.fillRect(325+i*21,85+j*26,16,20)}},
    IMU:()=>{arrow(385,190,385,80,red,5);arrow(385,190,465,190,green,5);arrow(385,190,330,240,cyan,5);T('x',470,180,14,green,'left');T('z',395,80,14,red,'left');T('y',318,258,14,cyan)},
    RTC:()=>{circ(385,150,62,ink,'#1d1f2b',5);for(let i=0;i<12;i++){const a=i/12*6.283;L([[385+Math.cos(a)*50,150+Math.sin(a)*50],[385+Math.cos(a)*58,150+Math.sin(a)*58]],steel,3)}L([[385,150],[385,108]],amber,5);L([[385,150],[418,160]],amber,4)},
    BOOT:()=>{const ls=['> boot','> load fw','> jump 0x8000'];ls.forEach((l,i)=>T(l,325,110+i*36,15,i===2?green:ink,'left',600))}
  };
  const GATE={
    NAND:()=>{g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(150,70);g.lineTo(230,70);g.arc(230,cy,80,-Math.PI/2,Math.PI/2);g.lineTo(150,230);g.closePath();g.stroke();circ(326,cy,14,ink,null,6);L([[40,110],[150,110]],gold,7);L([[40,190],[150,190]],gold,7);L([[340,cy],[440,cy]],gold,7)},
    XOR:()=>{g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(150,70);g.quadraticCurveTo(290,70,340,cy);g.quadraticCurveTo(290,230,150,230);g.quadraticCurveTo(200,cy,150,70);g.stroke();g.beginPath();g.moveTo(128,70);g.quadraticCurveTo(178,cy,128,230);g.stroke();L([[40,110],[160,110]],gold,7);L([[40,190],[160,190]],gold,7);L([[340,cy],[440,cy]],gold,7)},
    DFF:()=>{box(160,50,160,200,ink,'#1d1f2b',6);T('D',184,116,24,ink,'left');T('Q',296,116,24,ink,'right');L([[160,214],[182,226],[160,238]],ink,4);T('CLK',192,234,14,amber,'left');L([[40,108],[160,108]],gold,7);L([[40,226],[160,226]],amber,7);L([[320,108],[440,108]],gold,7);sq(40,140,270,10,3,amber,3)},
    MUX:()=>{g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(180,40);g.lineTo(300,90);g.lineTo(300,210);g.lineTo(180,260);g.closePath();g.stroke();for(let i=0;i<4;i++){L([[40,80+i*46],[180,80+i*46]],i===2?green:gold,6);T(String(i),196,88+i*46,16,ink,'left')}L([[300,cy],[440,cy]],green,7);L([[240,236],[240,290]],violet,5);L([[260,228],[260,290]],violet,5)}
  };
  const ARCH={
    alu:()=>{g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(120,50);g.lineTo(220,50);g.lineTo(240,90);g.lineTo(260,50);g.lineTo(360,50);g.lineTo(300,250);g.lineTo(180,250);g.closePath();g.stroke();T('ALU',cx,180,40,amber,'center',800);L([[170,10],[170,50]],gold,6);L([[310,10],[310,50]],gold,6);L([[cx,250],[cx,292]],gold,6)},
    reg:()=>{for(let i=0;i<6;i++){box(140,30+i*40,200,32,ink,i===2?'rgba(91,140,255,.35)':'#1d1f2b',3);T('x'+(i*5),128,52+i*40,14,'rgba(236,235,245,.6)','right',600);T('0x'+((i*2654435761)>>>0).toString(16).slice(0,8),cx,52+i*40,15,i===2?cyan:ink,'center',600)}},
    pc:()=>{box(170,90,140,80,ink,'#1d1f2b',6);T('PC',cx,142,34,amber,'center',800);circ(380,130,30,ink,null,5);T('+4',380,140,20,ink);L([[310,130],[350,130]],gold,5);L([[410,130],[440,130],[440,230],[60,230],[60,130],[170,130]],gold,5);T('next →',cx,270,16,'rgba(236,235,245,.6)')},
    cache:()=>{for(let i=0;i<4;i++)for(let j=0;j<6;j++){const hit=i===1&&j===3;g.fillStyle=hit?green:'rgba(110,231,255,.18)';if(hit)glow(green,20);g.fillRect(110+j*44,50+i*50,38,42);ng()}T('HIT',cx+10,280,20,green)},
    irq:()=>{L([[40,200],[200,200],[200,110],[440,110]],cyan,5);g.fillStyle=amber;glow(amber,26);g.beginPath();g.moveTo(240,40);g.lineTo(205,120);g.lineTo(235,120);g.lineTo(210,190);g.lineTo(275,100);g.lineTo(245,100);g.lineTo(270,40);g.closePath();g.fill();ng();box(320,170,120,60,red,'rgba(255,107,111,.15)',4);T('IRQ',380,210,24,red)}
  };
  const WAVE={
    uart:()=>{bits(70,cy,[1,0,1,1,0,1,0,0,1,1,1],34,36,cyan,'TX');T('start',104,cy+70,13,amber);T('stop',360,cy+70,13,amber)},
    i2c:()=>{bits(70,105,[1,1,0,0,1,0,1,1,0,1,1],34,26,amber,'SDA');sq(70,444,205,26,10,cyan,4);T('SCL',58,211,14,'rgba(236,235,245,.6)','right',600)},
    spi:()=>{sq(70,440,60,16,8,cyan,3);bits(70,125,[0,1,1,0,1,0,0,1,1,0,1],34,16,amber);bits(70,190,[1,0,0,1,1,1,0,1,0,0,1],34,16,green);bits(70,255,[1,0,0,0,0,0,0,0,0,1,1],34,16,red);['SCK','MOSI','MISO','CS'].forEach((l,i)=>T(l,58,66+i*65,13,'rgba(236,235,245,.6)','right',600))},
    pwm:()=>{sq(60,440,95,30,5,cyan,4,.2);sq(60,440,215,30,5,amber,4,.75);T('20%',450,100,16,cyan,'left');T('75%',450,220,16,amber,'left')}
  };
  const EQ={
    ohm:()=>{T('V = I·R',cx,180,66,ink,'center',800,'"Unbounded","Arial Black",sans-serif');zig(160,320,240,amber,10)},
    kcl:()=>{circ(cx,cy,14,amber,amber);arrow(60,60,cx-24,cy-14,cyan,5);arrow(60,240,cx-24,cy+14,cyan,5);arrow(cx+24,cy,440,cy,green,5);T('ΣI = 0',360,90,34,ink,'center',800)},
    kvl:()=>{g.strokeStyle=amber;g.lineWidth=5;g.beginPath();g.arc(cx,cy,100,-.3,Math.PI*1.7);g.stroke();arrow(cx+95,cy-30,cx+80,cy-62,amber,5);T('ΣV = 0',cx,cy+14,44,ink,'center',800)},
    nyquist:()=>{sine(40,440,cy,80,3,'rgba(110,231,255,.5)',3);for(let i=0;i<=12;i++){const x=40+i*(400/12),y=cy-Math.sin(i/12*3*6.283)*80;L([[x,cy],[x,y]],amber,3);circ(x,y,6,amber,amber,2)}T('fₛ ≥ 2·f_max',cx,284,22,ink)},
    demorgan:()=>{T('¬(A∧B)',cx,120,40,ink,'center',800);T('=',cx,170,32,amber);T('¬A ∨ ¬B',cx,228,40,ink,'center',800)},
    fourier:()=>{[1,3,5].forEach((k,i)=>sine(40,440,70+i*30,10,k*2,['rgba(91,140,255,.6)','rgba(215,123,255,.6)','rgba(110,231,255,.6)'][i],2));g.strokeStyle=amber;g.lineWidth=4;g.beginPath();for(let x=40;x<=440;x+=2){const t=(x-40)/400*2*6.283;let v=0;for(const k of[1,3,5,7,9])v+=Math.sin(k*t)/k;const y=230-v*50;x===40?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()},
    seebeck:()=>{g.fillStyle='rgba(255,107,111,.85)';g.fillRect(40,60,160,180);g.fillStyle='rgba(91,140,255,.85)';g.fillRect(280,60,160,180);g.fillStyle=amber;glow(amber,30);g.fillRect(200,60,80,180);ng();T('V = S·ΔT',cx,160,30,'#05060b','center',800);T('HOT',120,270,18,red);T('COLD',360,270,18,blue)},
    moore:()=>{g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=2;L([[60,40],[60,260],[450,260]],'rgba(255,255,255,.35)',2);for(let i=0;i<14;i++){const x=80+i*27,y=250-i*15+Math.sin(i*3)*4;glow(amber,10);circ(x,y,6,amber,amber,2);ng()}T('×2 / 2 yrs',340,90,22,ink);T('log',40,40,12,'rgba(236,235,245,.5)','left')}
  };
  const FAB={
    mask:()=>{const gr=g.createLinearGradient(80,40,400,260);gr.addColorStop(0,'rgba(200,230,255,.35)');gr.addColorStop(1,'rgba(120,160,220,.15)');g.fillStyle=gr;g.fillRect(80,40,320,220);g.fillStyle='#c9ced8';for(let i=0;i<10;i++)for(let j=0;j<6;j++)if((i*3+j*5)%7<4)g.fillRect(100+i*29,60+j*31,22+((i+j)%3)*4,10+(i%2)*10);box(80,40,320,220,steel,null,3)},
    resist:()=>{[['#3a3f58',200,60],['#5b8cff',170,30],['#d77bff',145,25]].forEach(([c,y,h])=>{g.fillStyle=c;g.fillRect(60,y,360,h)});for(let i=0;i<6;i++)arrow(90+i*60,30,90+i*60,135,'#a98bff',4);g.fillStyle='rgba(215,123,255,.35)';g.fillRect(60,140,360,10)},
    euv:()=>{const m=[[90,70],[380,90],[150,220],[400,230]];m.forEach(([x,y],i)=>{g.save();g.translate(x,y);g.rotate(i%2?-.5:.5);g.fillStyle='#c9ced8';g.fillRect(-36,-6,72,12);g.restore()});glow(violet,20);L([[30,30],...m,[cx,290]],violet,4);ng();g.fillStyle=amber;glow(amber,30);g.beginPath();g.arc(30,30,14,0,6.283);g.fill();ng();T('13.5 nm',cx,150,24,ink)},
    etch:()=>{g.fillStyle='#3a3f58';g.fillRect(40,180,400,90);for(let i=0;i<7;i++){g.fillStyle='#07080f';g.fillRect(70+i*55,180,24,60)}g.fillStyle='#d77bff';for(let i=0;i<8;i++)g.fillRect(40+i*55,170,30,10);const pg=g.createLinearGradient(0,20,0,170);pg.addColorStop(0,'rgba(215,123,255,0)');pg.addColorStop(1,'rgba(215,123,255,.55)');g.fillStyle=pg;g.fillRect(40,20,400,150);for(let i=0;i<30;i++){g.fillStyle='rgba(255,255,255,.7)';g.fillRect(50+((i*97)%380),30+((i*53)%130),3,8)}},
    implant:()=>{g.fillStyle='#3a3f58';g.fillRect(40,190,400,80);g.fillStyle='rgba(63,220,156,.5)';g.fillRect(140,190,200,30);for(let i=0;i<12;i++){const x=150+((i*37)%180);arrow(x,30+(i%3)*20,x,180,green,3)}g.fillStyle='#07080f';g.fillRect(40,175,100,15);g.fillRect(340,175,100,15)},
    cmp:()=>{g.fillStyle='#2b3050';g.beginPath();g.ellipse(cx,190,200,60,0,0,6.283);g.fill();g.strokeStyle='rgba(255,255,255,.15)';for(let r=40;r<200;r+=30){g.beginPath();g.ellipse(cx,190,r,r*.3,0,0,6.283);g.stroke()}g.fillStyle='#8a7ad8';g.beginPath();g.ellipse(cx+40,170,90,26,0,0,6.283);g.fill();g.strokeStyle=amber;g.lineWidth=4;g.beginPath();g.arc(cx,190,150,Math.PI*1.1,Math.PI*1.4);g.stroke();T('↻',90,110,40,amber)},
    via:()=>{[['#5b8cff',60],['#d77bff',140],['#ffcf4d',220]].forEach(([c,y])=>{g.fillStyle=c;g.fillRect(60,y,360,22)});g.fillStyle='rgba(255,255,255,.06)';g.fillRect(60,82,360,58);g.fillRect(60,162,360,58);[[150,82,58],[300,162,58],[220,82,138]].forEach(([x,y,h])=>{g.fillStyle='#c9ced8';g.fillRect(x-10,y,20,h)})},
    stdcell:()=>{g.fillStyle=blue;g.fillRect(40,40,400,16);g.fillRect(40,244,400,16);g.fillStyle='rgba(63,220,156,.35)';g.fillRect(70,70,340,50);g.fillStyle='rgba(215,123,255,.3)';g.fillRect(70,180,340,50);for(let i=0;i<7;i++){g.fillStyle=red;g.fillRect(100+i*46,62,8,176)}T('VDD',30,54,13,ink,'left');T('GND',30,258,13,ink,'left')},
    clktree:()=>{const h=(x,y,len,d)=>{if(d>4)return;L([[x-len,y],[x+len,y]],d%2?amber:cyan,6-d);L([[x-len,y-len*.7],[x-len,y+len*.7]],d%2?cyan:amber,6-d);L([[x+len,y-len*.7],[x+len,y+len*.7]],d%2?cyan:amber,6-d);[[x-len,y-len*.7],[x-len,y+len*.7],[x+len,y-len*.7],[x+len,y+len*.7]].forEach(([a,b])=>h(a,b,len/2.1,d+1))};h(cx,cy,100,0)},
    bondwire:()=>{g.fillStyle='#1d1f2b';g.fillRect(200,110,160,120);for(let i=0;i<5;i++){g.fillStyle=gold;g.fillRect(210,122+i*22,12,12);g.fillStyle=steel;g.fillRect(40,118+i*22,60,14);g.strokeStyle=gold;g.lineWidth=2;g.beginPath();g.moveTo(216,128+i*22);g.bezierCurveTo(180,40+i*10,120,60+i*10,100,125+i*22);g.stroke()}}
  };
  const TOOL={
    breadboard:()=>{g.fillStyle='#ecebf5';g.fillRect(40,60,400,180);g.fillStyle='#c9ced8';g.fillRect(40,145,400,10);g.fillStyle=red;g.fillRect(40,66,400,3);g.fillStyle=blue;g.fillRect(40,231,400,3);for(let i=0;i<30;i++)for(let j=0;j<10;j++){g.fillStyle='#4b4f60';g.fillRect(52+i*13,82+j*15+(j>4?14:0),5,5)}L([[90,90],[90,60],[200,40],[300,60],[300,105]],red,6);L([[150,205],[150,250],[260,270],[360,240],[360,190]],green,6);g.fillStyle='#1d1f2b';g.fillRect(200,110,70,70)},
    iron:()=>{g.strokeStyle='#2b3050';g.lineWidth=26;L([[380,40],[190,190]],'#2b3050',26);L([[190,190],[130,236]],steel,10);L([[130,236],[112,250]],amber,6);glow(red,20);circ(110,252,5,red,red,2);ng();for(let i=0;i<3;i++){g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=3;g.beginPath();g.moveTo(100+i*12,230);g.bezierCurveTo(80+i*12,190,120+i*12,170,100+i*12,130);g.stroke()}},
    dmm:()=>{g.fillStyle='#f0b429';rrect(150,20,180,260,20);g.fill();g.fillStyle='#1d1f2b';g.fillRect(170,40,140,60);T('3.30',240,86,36,green,'center',800);circ(240,175,44,'#1d1f2b','#2b3050',6);L([[240,175],[268,145]],ink,5);[[200,250,'#111'],[280,250,red]].forEach(([x,y,c])=>{circ(x,y,10,c==='#111'?'#1d1f2b':c,c==='#111'?'#1d1f2b':c,3)});L([[200,260],[120,300]],'#2b3050',6);L([[280,260],[380,300]],red,6)},
    psu:()=>{box(60,60,360,180,steel,'#1d1f2b',4);[[90,'05.00','V'],[250,'0.250','A']].forEach(([x,v,u])=>{g.fillStyle='#07080f';g.fillRect(x,90,140,56);T(v,x+70,130,30,u==='V'?green:red,'center',800)});[[150,200],[310,200]].forEach(([x,y])=>circ(x,y,20,steel,'#2b3050',4));[[380,190,red],[380,220,'#ecebf5']].forEach(([x,y,c])=>circ(x,y,8,c,c,2))},
    fgen:()=>{box(50,60,380,180,steel,'#1d1f2b',4);g.fillStyle='#07080f';g.fillRect(70,80,220,120);sine(80,280,110,16,2,cyan,3);sq(80,280,160,14,2,amber,3);for(let i=0;i<6;i++)circ(330+(i%2)*50,100+(i/2|0)*44,14,steel,'#2b3050',3)},
    scope:()=>{box(40,40,400,220,steel,'#1d1f2b',4);g.fillStyle='#07080f';g.fillRect(60,60,260,180);g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;for(let i=0;i<=10;i++){L([[60+i*26,60],[60+i*26,240]],'rgba(255,255,255,.08)',1)}for(let j=0;j<=8;j++)L([[60,60+j*22.5],[320,60+j*22.5]],'rgba(255,255,255,.08)',1);glow(amber,12);sine(60,320,120,40,2.5,amber,3);ng();glow(cyan,12);sq(60,320,190,20,4,cyan,3);ng();for(let i=0;i<6;i++)circ(360+(i%2)*44,90+(i/2|0)*50,14,steel,'#2b3050',3)},
    la:()=>{for(let k=0;k<6;k++){const b=Array.from({length:12},(_,i)=>((i*(k+3)+k)%5)<2?1:0);bits(80,50+k*40,b,30,10,[cyan,amber,green,violet,red,blue][k],'D'+k)}},
    spec:()=>{L([[50,250],[450,250]],'rgba(255,255,255,.35)',2);L([[50,40],[50,250]],'rgba(255,255,255,.35)',2);g.strokeStyle=cyan;g.lineWidth=3;g.beginPath();for(let x=50;x<450;x+=2){let y=230+Math.sin(x*1.7)*5+Math.cos(x*.9)*4;[[150,120],[260,60],[330,170]].forEach(([px,h])=>{y-=h*Math.exp(-Math.pow((x-px)/6,2))});x===50?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();T('2.4 GHz',260,48,16,amber)},
    reflow:()=>{box(40,40,180,220,steel,'#1d1f2b',4);g.fillStyle='rgba(255,107,111,.4)';g.fillRect(56,60,148,120);for(let i=0;i<4;i++)L([[60,80+i*28],[200,80+i*28]],red,3);L([[260,250],[300,180],[360,170],[390,80],[420,90],[450,240]],amber,4);T('245°',395,70,15,amber)},
    printer:()=>{L([[80,30],[80,270]],steel,8);L([[400,30],[400,270]],steel,8);L([[80,30],[400,30]],steel,8);L([[80,120],[400,120]],'#2b3050',10);box(220,104,50,40,steel,'#1d1f2b',3);L([[245,144],[245,166]],amber,5);for(let i=0;i<8;i++){g.fillStyle=i%2?'#ff6b6f':'#e55a5e';g.fillRect(180,250-i*10,130,9)}g.fillStyle='#2b3050';g.fillRect(100,260,280,14)},
    cnc:()=>{L([[60,40],[420,40]],steel,10);L([[60,40],[60,270]],steel,10);L([[420,40],[420,270]],steel,10);box(210,50,60,110,steel,'#2b3050',4);L([[240,160],[240,200]],ink,8);g.fillStyle='#c9ced8';g.fillRect(150,210,180,50);g.fillStyle='#07080f';g.fillRect(200,210,70,20);for(let i=0;i<8;i++){g.fillStyle=amber;g.fillRect(260+i*9,196-(i%3)*6,4,4)}},
    spin:()=>{g.fillStyle='#2b3050';g.beginPath();g.ellipse(cx,200,170,46,0,0,6.283);g.fill();const gr=g.createRadialGradient(cx,196,4,cx,196,150);gr.addColorStop(0,'rgba(215,123,255,.8)');gr.addColorStop(1,'rgba(91,140,255,.4)');g.fillStyle=gr;g.beginPath();g.ellipse(cx,196,150,38,0,0,6.283);g.fill();g.fillStyle=cyan;g.beginPath();g.moveTo(cx,60);g.quadraticCurveTo(cx+14,100,cx,110);g.quadraticCurveTo(cx-14,100,cx,60);g.fill();for(let k=0;k<3;k++){g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=3;g.beginPath();g.ellipse(cx,200,180+k*16,52+k*6,0,.2+k*.1,1.2+k*.1);g.stroke()}},
    xrd:()=>{g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=4;g.beginPath();g.arc(cx,220,170,Math.PI,0);g.stroke();box(cx-40,212,80,14,violet,violet,2);glow(cyan,16);L([[90,110],[cx,216],[390,110]],cyan,4);ng();box(60,90,40,40,steel,'#2b3050',3);box(380,90,40,40,steel,'#2b3050',3);L([[150,290],[180,290],[190,250],[200,290],[260,290],[270,240],[280,290],[330,290]],amber,3)},
    cleanroom:()=>{for(let i=0;i<8;i++){g.fillStyle='rgba(255,255,255,.12)';g.fillRect(40+i*52,30,46,30)}for(let i=0;i<10;i++)for(let j=0;j<3;j++)arrow(60+i*42,80+j*60,60+i*42,120+j*60,'rgba(110,231,255,.55)',3);g.fillStyle='#2b3050';g.fillRect(40,268,400,10);T('ISO 7',cx,170,44,ink,'center',800)},
    telescope:()=>{for(let i=0;i<40;i++){g.fillStyle=`rgba(255,255,255,${.3+((i*13)%7)/10})`;g.fillRect((i*97)%480,(i*53)%140,2,2)}g.save();g.translate(220,170);g.rotate(-.6);g.fillStyle='#c9ced8';g.fillRect(-20,-24,180,48);g.fillStyle='#2b3050';g.fillRect(-40,-18,26,36);g.restore();L([[220,180],[160,280]],steel,6);L([[220,180],[280,280]],steel,6);L([[220,180],[220,280]],steel,6);glow(amber,16);circ(400,60,8,amber,amber,2);ng()}
  };
  const LIFE={
    purdue:()=>{for(let i=0;i<12;i++)for(let j=0;j<7;j++){g.strokeStyle='rgba(255,207,77,.2)';g.lineWidth=1;g.strokeRect(20+i*38,20+j*38,34,34)}T('ECE',cx,150,72,ink,'center',800,'"Unbounded","Arial Black",sans-serif');T('CLASS OF 2030',cx,200,22,amber,'center',700)},
    phys:()=>{circ(140,cy,26,red,red,3);circ(340,cy,26,blue,blue,3);T('+',140,cy+10,30,'#05060b');T('−',340,cy+10,30,'#05060b');for(let k=-2;k<=2;k++){g.strokeStyle='rgba(236,235,245,.5)';g.lineWidth=2;g.beginPath();g.moveTo(166,cy);g.quadraticCurveTo(cx,cy+k*60,314,cy);g.stroke()}},
    outreach:()=>{g.fillStyle=amber;glow(amber,40);g.beginPath();g.arc(cx,120,64,0,6.283);g.fill();ng();g.fillStyle='#c9ced8';g.fillRect(cx-30,180,60,40);g.strokeStyle='#05060b';g.lineWidth=5;g.beginPath();g.arc(cx,120,26,0,6.283);g.stroke();for(let i=0;i<8;i++){const a=i/8*6.283;L([[cx+Math.cos(a)*26,120+Math.sin(a)*26],[cx+Math.cos(a)*36,120+Math.sin(a)*36]],'#05060b',6)}T('$10K+',cx,270,26,green,'center',800)},
    club:()=>{g.fillStyle='#2b3050';g.beginPath();for(let i=0;i<16;i++){const a=i/16*6.283,r=i%2?90:70;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}g.closePath();g.fill();circ(cx,cy,34,amber,'#07080f',6);T('ENG',cx,cy+8,22,amber,'center',800)},
    econ:()=>{[60,100,90,150,190,240].forEach((h,i)=>{g.fillStyle=i===5?green:'rgba(63,220,156,.4)';g.fillRect(80+i*55,260-h,40,h)});arrow(80,230,420,40,amber,5)},
    honor:()=>{L([[200,20],[230,120]],blue,16);L([[280,20],[250,120]],red,16);circ(cx,180,70,amber,'#4a3608',8);g.fillStyle=amber;g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*6.283,r=i%2?18:42;g.lineTo(cx+Math.cos(a)*r,180+Math.sin(a)*r)}g.closePath();g.fill()},
    run:()=>{for(let k=0;k<4;k++){g.strokeStyle=k%2?'rgba(255,107,111,.6)':'rgba(255,255,255,.3)';g.lineWidth=3;g.beginPath();g.ellipse(cx,cy,200-k*24,110-k*20,0,0,6.283);g.stroke()}circ(380,70,30,ink,'#1d1f2b',4);L([[380,70],[380,52]],amber,4);L([[380,70],[394,76]],amber,4)},
    band:()=>{for(let i=0;i<5;i++)L([[40,70+i*18],[440,70+i*18]],'rgba(255,255,255,.35)',2);[[100,124],[160,106],[220,88],[280,106],[340,70]].forEach(([x,y])=>{g.fillStyle=ink;g.beginPath();g.ellipse(x,y,12,9,-.4,0,6.283);g.fill();L([[x+11,y],[x+11,y-50]],ink,3)});circ(cx,240,40,red,'#2b3050',5);L([[cx-40,240],[cx+40,240]],red,3)},
    swim:()=>{for(let k=0;k<5;k++)sine(30,450,70+k*45,10,4,`rgba(110,231,255,${.3+k*.12})`,4,k);for(let i=0;i<14;i++){g.fillStyle=i%2?red:'#ecebf5';g.fillRect(30+i*30,cy-5,22,10)}},
    hoop:()=>{box(330,60,110,80,ink,null,4);L([[340,150],[420,150]],red,6);for(let i=0;i<5;i++)L([[344+i*18,150],[352+i*14,200]],'rgba(236,235,245,.6)',2);for(let i=0;i<9;i++){const t=i/8,x=70+t*300,y=230-Math.sin(t*Math.PI)*170+t*-60;g.fillStyle=`rgba(240,138,60,${.25+t*.75})`;g.beginPath();g.arc(x,y,6+t*8,0,6.283);g.fill()}},
    aim:()=>{for(let i=0;i<5;i++){const x=80+i*85,y=90+((i*61)%120);circ(x,y,16,amber,'rgba(255,207,77,.3)',3)}glow(green,10);L([[cx-50,cy],[cx-14,cy]],green,5);L([[cx+14,cy],[cx+50,cy]],green,5);L([[cx,cy-50],[cx,cy-14]],green,5);L([[cx,cy+14],[cx,cy+50]],green,5);ng()},
    binder:()=>{[-.25,0,.25].forEach((r,i)=>{g.save();g.translate(cx+(i-1)*60,170);g.rotate(r);g.fillStyle='#0b0d18';g.fillRect(-60,-85,120,170);g.strokeStyle=gold;g.lineWidth=3;g.strokeRect(-60,-85,120,170);g.fillStyle='#1c2140';g.fillRect(-30,-35,60,60);T('LC',0,10,26,ink,'center',800);g.restore()})},
    electron:()=>{glow(cyan,50);const gr=g.createRadialGradient(cx,cy,2,cx,cy,60);gr.addColorStop(0,'#fff');gr.addColorStop(.4,cyan);gr.addColorStop(1,'rgba(110,231,255,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,60,0,6.283);g.fill();ng();[[0,'rgba(110,231,255,.8)'],[1.1,'rgba(215,123,255,.7)'],[2.2,'rgba(255,207,77,.7)']].forEach(([r,c])=>{g.save();g.translate(cx,cy);g.rotate(r);g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.ellipse(0,0,150,40,0,0,6.283);g.stroke();g.restore()});T('e⁻',cx+80,cy-70,30,ink)}
  };
  const KIND={sym:SYM,ic:null,gate:GATE,arch:ARCH,wave:WAVE,eq:EQ,fab:FAB,tool:TOOL,life:LIFE};
  return function(ctx,kind,arg,c){g=ctx;g.lineCap='round';g.lineJoin='round';
    if(kind==='ic'){chipPkg(70,60,200,180,6,arg,'LC-'+String(c.no).padStart(3,'0'));const f=ICG[arg];if(f)f();return true}
    const tbl=KIND[kind];if(!tbl||!tbl[arg])return false;tbl[arg]();return true};
})();

/* ---------------- full-art landscapes (portrait) ---------------- */
const FULL=(function(){
  const W=448,H=628,S=1.5;
  function rng(seed){let a=0;for(const ch of seed)a=(a*31+ch.charCodeAt(0))|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function ridge(R,y,amp,rough,n){n=n||7;let pts=[[0,y+(R()-.5)*amp],[W,y+(R()-.5)*amp]];let a=amp;
    for(let k=0;k<n;k++){const np=[];for(let i=0;i<pts.length-1;i++){const p=pts[i],q=pts[i+1];np.push(p,[(p[0]+q[0])/2,(p[1]+q[1])/2+(R()-.5)*a])}np.push(pts[pts.length-1]);pts=np;a*=rough||.55}return pts}
  function fillRidge(g,pts,fill){g.fillStyle=fill;g.beginPath();g.moveTo(0,H);pts.forEach(p=>g.lineTo(p[0],p[1]));g.lineTo(W,H);g.closePath();g.fill()}
  function sky(g,stops){const gr=g.createLinearGradient(0,0,0,H);stops.forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,W,H)}
  function stars(g,R,n,maxY){for(let i=0;i<n;i++){const x=R()*W,y=R()*maxY,r=R()*1.4+.2;g.fillStyle=`rgba(255,255,255,${.3+R()*.7})`;g.beginPath();g.arc(x,y,r,0,6.283);g.fill()}}
  function trace(g,pts,col,w,glowC){g.save();g.lineCap='round';g.lineJoin='round';if(glowC){g.shadowColor=glowC;g.shadowBlur=10}g.strokeStyle=col;g.lineWidth=w||2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.restore()}
  function pad(g,x,y,r,col){g.save();g.shadowColor=col;g.shadowBlur=8;g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.arc(x,y,r,0,6.283);g.stroke();g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(x,y,r*.45,0,6.283);g.fill();g.restore()}
  function circuits(g,R,o){o=o||{};const n=o.n||26,col=o.col||'rgba(255,205,120,.8)',gc=o.glow||'rgba(255,190,90,.9)',inside=o.inside||(()=>true);
    for(let k=0;k<n;k++){let x=R()*W,y=o.y0!=null?o.y0+R()*(o.y1-o.y0):R()*H;if(!inside(x,y))continue;const pts=[[x,y]];let d=R()*4|0;
      const segs=3+(R()*5|0);for(let s=0;s<segs;s++){const len=14+R()*60;const dirs=[[1,0],[0,1],[-1,0],[0,-1],[.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]];
        if(R()<.45)d=(d+(R()<.5?1:7))%8;const v=dirs[d%8];x+=v[0]*len;y+=v[1]*len;if(!inside(x,y))break;pts.push([x,y])}
      if(pts.length<2)continue;trace(g,pts,col,o.w||1.8,gc);pad(g,pts[0][0],pts[0][1],3.2,col);pad(g,pts[pts.length-1][0],pts[pts.length-1][1],3.2,col);
      if(R()<.5){const q=pts[1+(R()*(pts.length-1)|0)]||pts[0];g.save();g.fillStyle='#fff';g.shadowColor=o.pulse||'#6ee7ff';g.shadowBlur=12;g.beginPath();g.arc(q[0],q[1],2.2,0,6.283);g.fill();g.restore()}}}
  function ridgeTrace(g,pts,off,col,gc,every){const p=pts.filter((_,i)=>i%(every||8)===0).map(q=>[q[0],q[1]+off]);trace(g,p,col,2.2,gc);p.forEach((q,i)=>{if(i%3===0)pad(g,q[0],q[1],3,col)})}
  function vignette(g,a){const v=g.createRadialGradient(W/2,H*.45,H*.25,W/2,H/2,H*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${a||.55})`);g.fillStyle=v;g.fillRect(0,0,W,H)}
  function grain(g,R,a){for(let i=0;i<2600;i++){g.fillStyle=`rgba(255,255,255,${R()*(a||.035)})`;g.fillRect(R()*W,R()*H,1,1)}}

  const SCENE={
    sunset(g,R){sky(g,[[0,'#140a33'],[.35,'#4b1d6e'],[.58,'#c2456b'],[.72,'#ff8a5c'],[.82,'#ffc27a'],[1,'#ffd9a0']]);stars(g,R,60,200);
      const sx=W*.5,sy=H*.5,sr=92;const sg=g.createRadialGradient(sx,sy,10,sx,sy,sr*2.6);sg.addColorStop(0,'rgba(255,230,170,.9)');sg.addColorStop(.35,'rgba(255,170,110,.35)');sg.addColorStop(1,'rgba(255,140,90,0)');g.fillStyle=sg;g.fillRect(0,0,W,H);
      g.save();g.beginPath();g.arc(sx,sy,sr,0,6.283);g.clip();const sun=g.createLinearGradient(0,sy-sr,0,sy+sr);sun.addColorStop(0,'#fff3c4');sun.addColorStop(1,'#ff9a5c');g.fillStyle=sun;g.fillRect(sx-sr,sy-sr,sr*2,sr*2);
        g.strokeStyle='rgba(200,90,60,.35)';g.lineWidth=1.2;for(let x=sx-sr;x<sx+sr;x+=14){g.beginPath();g.moveTo(x,sy-sr);g.lineTo(x,sy+sr);g.stroke()}for(let y=sy-sr;y<sy+sr;y+=14){g.beginPath();g.moveTo(sx-sr,y);g.lineTo(sx+sr,y);g.stroke()}g.restore();
      const cols=['#7a3570','#5a2660','#3d1a52','#24103a','#120822'];let ys=[330,370,410,460,520];
      cols.forEach((c,i)=>{const p=ridge(R,ys[i],140-i*16,.55);fillRidge(g,p,c);if(i>=1)ridgeTrace(g,p,6,`rgba(255,${200-i*14},${120+i*10},${.55+i*.08})`,'rgba(255,170,90,.8)',6+i)});
      circuits(g,R,{n:30,y0:470,y1:620,col:'rgba(255,190,110,.75)'});vignette(g,.5)},
    canyon(g,R){sky(g,[[0,'#8fd3e8'],[.3,'#f7c59f'],[.45,'#f08a5d'],[1,'#7a2e1f']]);
      const sg=g.createRadialGradient(W*.7,H*.16,4,W*.7,H*.16,160);sg.addColorStop(0,'rgba(255,255,230,.95)');sg.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=sg;g.fillRect(0,0,W,H);
      const strata=['#b5532c','#c8683a','#9c4224','#d9864f','#8a3a1e','#c25a2f','#a8492a','#e09a5f','#7c331c','#b65a33','#93401f','#d07a45'];
      const wall=(side)=>{for(let i=0;i<12;i++){const y0=200+i*36;g.fillStyle=strata[i];g.beginPath();const xEdge=t=>side<0?120+Math.sin(t*.02+i)*16+i*6+(R()-.5)*4:W-120-Math.sin(t*.02+i)*16-i*6;
          if(side<0){g.moveTo(0,y0);for(let y=y0;y<=y0+40;y+=4)g.lineTo(xEdge(y)+ (y-y0)*.4,y);g.lineTo(0,y0+40)}else{g.moveTo(W,y0);for(let y=y0;y<=y0+40;y+=4)g.lineTo(xEdge(y)-(y-y0)*.4,y);g.lineTo(W,y0+40)}g.closePath();g.fill();
          g.strokeStyle='rgba(255,215,140,.35)';g.lineWidth=1.4;g.beginPath();if(side<0){g.moveTo(0,y0+20);g.lineTo(80+i*4,y0+20);g.lineTo(96+i*4,y0+30)}else{g.moveTo(W,y0+20);g.lineTo(W-80-i*4,y0+20);g.lineTo(W-96-i*4,y0+30)}g.stroke()}};
      g.fillStyle='#6d2a18';g.fillRect(0,200,W,H-200);const mid=ridge(R,360,40,.6);fillRidge(g,mid.map(p=>[p[0],p[1]]),'#9c4224');wall(-1);wall(1);
      g.fillStyle='#4a1d12';g.fillRect(0,630-110,W,110);
      for(let lane=0;lane<6;lane++){const pts=[];for(let y=H;y>380;y-=6){const x=W/2+Math.sin(y*.018)*70*(1-(H-y)/400)+(lane-2.5)*8*(1-(H-y)/320);pts.push([x,y])}trace(g,pts,`rgba(110,231,255,${.9-lane*.08})`,2.2,'rgba(110,231,255,.95)')}
      for(let i=0;i<14;i++){const y=400+R()*220,x=W/2+Math.sin(y*.018)*70*(1-(H-y)/400);g.save();g.fillStyle='#fff';g.shadowColor='#6ee7ff';g.shadowBlur=14;g.beginPath();g.arc(x+(R()-.5)*30,y,2.4,0,6.283);g.fill();g.restore()}
      circuits(g,R,{n:22,inside:(x,y)=>y>220&&(x<130||x>W-130),col:'rgba(255,220,150,.7)'});vignette(g,.45)},
    aurora(g,R){sky(g,[[0,'#020617'],[.5,'#0b1a3a'],[.75,'#13284f'],[1,'#1b3a63']]);stars(g,R,220,380);
      const ribbons=[['rgba(63,220,156,',90,0],['rgba(110,231,255,',140,1.4],['rgba(215,123,255,',190,2.6]];
      ribbons.forEach(([c,y0,ph])=>{for(let k=0;k<26;k++){g.strokeStyle=c+(0.05+k*.004)+')';g.lineWidth=3;g.beginPath();for(let x=-10;x<=W+10;x+=4){const y=y0+Math.sin(x*.016+ph)*40+Math.sin(x*.05+ph*2)*10+k*3.2;x<0?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}
        g.save();g.shadowColor=c+'1)';g.shadowBlur=14;g.strokeStyle=c+'.9)';g.lineWidth=1.6;g.beginPath();for(let x=0;x<=W;x+=4){const y=y0+Math.sin(x*.016+ph)*40+Math.sin(x*.05+ph*2)*10;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.restore()});
      const h1=ridge(R,420,80,.5),h2=ridge(R,470,60,.5);fillRidge(g,h1,'#c9d6ea');fillRidge(g,h2,'#e8eef8');
      g.fillStyle='#1d2a44';g.fillRect(250,438,120,46);g.fillRect(290,412,14,26);g.fillRect(320,420,10,18);for(let i=0;i<8;i++){g.fillStyle=i%3?'#ffcf4d':'#6ee7ff';g.fillRect(258+i*14,452,8,8)}
      g.fillStyle='rgba(220,235,255,.6)';for(let i=0;i<12;i++){const x=40+i*32;g.beginPath();g.moveTo(x,520);g.lineTo(x+10,490);g.lineTo(x+20,520);g.fill()}
      circuits(g,R,{n:30,y0:490,y1:620,col:'rgba(70,170,230,.85)',glow:'rgba(110,231,255,.9)'});ridgeTrace(g,h2,8,'rgba(70,170,230,.9)','rgba(110,231,255,.9)',6);vignette(g,.45)},
    city(g,R){sky(g,[[0,'#05060f'],[.55,'#141a3a'],[.8,'#2a1f4f'],[1,'#3a1f45']]);stars(g,R,120,300);
      g.save();g.shadowColor='#e8ecff';g.shadowBlur=40;g.fillStyle='#e8ecff';g.beginPath();g.arc(340,120,40,0,6.283);g.fill();g.restore();g.fillStyle='#14172a';g.beginPath();g.arc(356,110,36,0,6.283);g.fill();
      const layer=(base,cnt,hmin,hmax,col,win)=>{let x=-10;while(x<W){const w=34+R()*60,h=hmin+R()*(hmax-hmin);g.fillStyle=col;g.fillRect(x,base-h,w,h);
          for(let y=base-h+8;y<base-6;y+=12){g.fillStyle='#c9ced8';g.fillRect(x-4,y,4,4);g.fillRect(x+w,y,4,4)}
          if(win)for(let y=base-h+12;y<base-10;y+=14)for(let xx=x+8;xx<x+w-8;xx+=12)if(R()<.55){g.fillStyle=R()<.7?'rgba(255,207,77,.85)':'rgba(110,231,255,.85)';g.fillRect(xx,y,6,7)}
          g.fillStyle='rgba(255,255,255,.3)';g.font='600 8px "JetBrains Mono",monospace';g.fillText('U'+(R()*99|0),x+4,base-h+10);x+=w+6+R()*10}};
      layer(470,0,120,260,'#1a1f3a',false);layer(520,0,90,300,'#0f1226',true);
      g.fillStyle='#07080f';g.fillRect(0,520,W,108);
      for(let l=0;l<5;l++){const y=540+l*18;trace(g,[[0,y],[W,y]],l%2?'rgba(255,205,120,.8)':'rgba(110,231,255,.8)',2,l%2?'rgba(255,190,90,.9)':'rgba(110,231,255,.9)');for(let i=0;i<4;i++){g.save();g.fillStyle='#fff';g.shadowColor='#6ee7ff';g.shadowBlur=12;g.beginPath();g.arc(R()*W,y,2.4,0,6.283);g.fill();g.restore()}}
      for(let k=0;k<10;k++){const x0=R()*W,x1=x0+(R()-.5)*200,y0=240+R()*160;trace(g,[[x0,y0],[x0,y0-30],[x1,y0-30-(R()*40)],[x1,y0]],'rgba(215,123,255,.6)',1.5,'rgba(215,123,255,.8)')}
      vignette(g,.5)},
    coast(g,R){sky(g,[[0,'#1c2350'],[.35,'#5a3a78'],[.5,'#c46a8a'],[.56,'#f2a07b'],[.6,'#2a3a6e'],[1,'#0b1330']]);
      const hy=H*.56;const sg=g.createRadialGradient(150,hy-20,4,150,hy-20,140);sg.addColorStop(0,'rgba(255,240,200,1)');sg.addColorStop(.25,'rgba(255,180,140,.5)');sg.addColorStop(1,'rgba(255,150,120,0)');g.fillStyle=sg;g.fillRect(0,0,W,H);
      g.fillStyle='#fff1d6';g.beginPath();g.arc(150,hy-18,26,Math.PI,0);g.fill();
      for(let i=0;i<70;i++){const y=hy+4+i*4.2;g.strokeStyle=`rgba(${150+i},${170+i/2},255,${.15+i*.006})`;g.lineWidth=1.4;g.beginPath();for(let x=0;x<=W;x+=4){const yy=y+Math.sin(x*.04+i*.9)*(1+i*.06);x?g.lineTo(x,yy):g.moveTo(x,yy)}g.stroke()}
      for(let i=0;i<40;i++){const y=hy+8+i*6,w=6+R()*30;g.fillStyle=`rgba(255,220,180,${.6-i*.012})`;g.fillRect(150-w/2+(R()-.5)*20,y,w,1.6)}
      const cr=[[300,hy+40],[318,250],[352,190],[380,230],[400,160],[430,210],[W,180],[W,hy+60]];
      g.fillStyle='rgba(190,170,255,.35)';g.beginPath();cr.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
      [[[318,250],[352,190],[360,hy+40]],[[352,190],[380,230],[372,hy+40]],[[380,230],[400,160],[410,hy+40]],[[400,160],[430,210],[440,hy+40]]].forEach((t,i)=>{g.fillStyle=`rgba(${200+i*10},${190-i*8},255,${.25+i*.08})`;g.beginPath();t.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1;g.stroke()});
      circuits(g,R,{n:16,inside:(x,y)=>x>310&&y>170&&y<hy+40,col:'rgba(255,220,255,.8)',glow:'rgba(215,123,255,.9)'});
      circuits(g,R,{n:18,y0:hy+60,y1:H-20,col:'rgba(140,220,255,.7)',glow:'rgba(110,231,255,.9)'});vignette(g,.5)},
    thermal(g,R){const lg=g.createLinearGradient(0,0,W,0);lg.addColorStop(0,'#ff8a3c');lg.addColorStop(.45,'#ffb36b');lg.addColorStop(.55,'#9fd4ff');lg.addColorStop(1,'#3b7fd6');g.fillStyle=lg;g.fillRect(0,0,W,H);
      const vg=g.createLinearGradient(0,0,0,H);vg.addColorStop(0,'rgba(20,10,40,.55)');vg.addColorStop(.5,'rgba(0,0,0,0)');g.fillStyle=vg;g.fillRect(0,0,W,H);
      g.save();g.shadowColor='#fff3c4';g.shadowBlur=50;g.fillStyle='#fff3c4';g.beginPath();g.arc(90,120,40,0,6.283);g.fill();g.restore();
      for(let i=0;i<4;i++){g.fillStyle=['#e08a46','#c9733a','#b8622e','#a0522a'][i];g.beginPath();g.moveTo(0,H);for(let x=0;x<=W/2+20;x+=6)g.lineTo(x,380+i*55+Math.sin(x*.02+i)*26);g.lineTo(W/2+20,H);g.closePath();g.fill()}
      const ice=[[W/2-20,H],[W/2,330],[W/2+50,260],[W/2+90,300],[W/2+130,200],[W/2+170,280],[W,230],[W,H]];g.fillStyle='#dbefff';g.beginPath();ice.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
      g.fillStyle='#a8d4ff';g.beginPath();g.moveTo(W/2+50,260);g.lineTo(W/2+70,H);g.lineTo(W/2+20,H);g.closePath();g.fill();g.beginPath();g.moveTo(W/2+130,200);g.lineTo(W/2+150,H);g.lineTo(W/2+100,H);g.closePath();g.fill();
      for(let i=0;i<9;i++){g.fillStyle=i%2?'#5b8cff':'#ff6b6f';g.fillRect(W/2-46+i*10,470,8,90)}g.fillStyle='#e9e4da';g.fillRect(W/2-50,462,94,8);g.fillRect(W/2-50,560,94,8);
      for(let l=0;l<7;l++){const y=300+l*40;const pts=[[20,y]];let x=20;while(x<W-20){x+=30+R()*40;pts.push([x,y+(R()-.5)*18])}trace(g,pts,`rgba(255,255,255,${.5+l*.05})`,1.8,'rgba(255,255,200,.9)');pad(g,pts[0][0],pts[0][1],3,'#ffcf4d');pad(g,pts[pts.length-1][0],pts[pts.length-1][1],3,'#6ee7ff')}
      g.save();g.shadowColor='#fff';g.shadowBlur=20;g.strokeStyle='#fff';g.lineWidth=2.4;g.beginPath();let x=W/2-4,y=150;g.moveTo(x,y);for(let i=0;i<10;i++){x+=(R()-.5)*30;y+=30;g.lineTo(x,y)}g.stroke();g.restore();
      g.font='800 44px "Unbounded","Arial Black",sans-serif';g.fillStyle='rgba(255,255,255,.85)';g.textAlign='center';g.fillText('ΔT',W/2,110);g.textAlign='left';vignette(g,.4)},
    escape(g,R){sky(g,[[0,'#0d1b3e'],[.18,'#2c3e78'],[.36,'#e87a6f'],[.46,'#ffc48a'],[.54,'#ffe2b0'],[1,'#ffe9c4']]);
      const sx=W*.62,sy=H*.4;const sg=g.createRadialGradient(sx,sy,6,sx,sy,330);sg.addColorStop(0,'rgba(255,250,225,1)');sg.addColorStop(.12,'rgba(255,220,160,.8)');sg.addColorStop(.45,'rgba(255,170,120,.25)');sg.addColorStop(1,'rgba(255,150,110,0)');g.fillStyle=sg;g.fillRect(0,0,W,H);
      g.save();g.globalCompositeOperation='lighter';for(let i=0;i<18;i++){const a=-Math.PI*.95+i/17*Math.PI*.9;g.fillStyle=`rgba(255,230,180,${.035+(i%3)*.012})`;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a)*700,sy+Math.sin(a)*700);g.lineTo(sx+Math.cos(a+.05)*700,sy+Math.sin(a+.05)*700);g.closePath();g.fill()}g.restore();
      g.fillStyle='#fffbe8';g.beginPath();g.arc(sx,sy,18,0,6.283);g.fill();
      for(let i=0;i<4;i++){const cy=110+i*34+R()*10,cx=R()*W;g.fillStyle=`rgba(255,${200+i*10},${190+i*10},${.25+i*.06})`;for(let k=0;k<5;k++){g.beginPath();g.ellipse(cx+k*26,cy+(k%2)*4,40,9,0,0,6.283);g.fill()}}
      [[220,'#9a7fb2',140],[250,'#7c6aa6',130],[290,'#5d5596',120],[330,'#43447f',110]].forEach(([y,c,a],i)=>{const p=ridge(R,y+40,a,.56);fillRidge(g,p,c);
        if(i===0){g.fillStyle='rgba(255,255,255,.75)';p.forEach((q,k)=>{if(k%9===0&&q[1]<y+10){g.beginPath();g.moveTo(q[0]-12,q[1]+14);g.lineTo(q[0],q[1]);g.lineTo(q[0]+12,q[1]+14);g.fill()}})}
        if(i>=1)ridgeTrace(g,p,5,`rgba(255,${220-i*20},${170-i*10},.55)`,'rgba(255,200,140,.8)',10)});
      g.fillStyle='rgba(255,236,200,.35)';g.beginPath();g.ellipse(120,430,90,10,0,0,6.283);g.fill();
      const hill=ridge(R,430,80,.5);hill.forEach(p=>{if(p[0]>W*.45)p[1]-= (p[0]-W*.45)*.45});fillRidge(g,hill,'#2b2d5c');
      const fg=ridge(R,520,60,.5);fillRidge(g,fg,'#16173a');
      const tree=(x,y,h,c)=>{g.fillStyle=c;for(let k=0;k<4;k++){const w=h*(.42-k*.08),yy=y-k*h*.22;g.beginPath();g.moveTo(x-w,yy);g.lineTo(x,yy-h*.4);g.lineTo(x+w,yy);g.closePath();g.fill()}g.fillRect(x-2,y,4,h*.12)};
      for(let i=0;i<22;i++){const x=R()*W*.55,y=hill.find(p=>p[0]>=x)[1]+8;tree(x,y,26+R()*20,'#1e1f48')}for(let i=0;i<14;i++){const x=R()*W,y=fg.find(p=>p[0]>=x)[1]+12;tree(x,y,40+R()*40,'#0c0d24')}
      const trail=[[60,H-20],[230,575],[120,540],[260,505],[170,478],[300,452],[250,430],[350,404],[318,382]];
      g.save();g.lineCap='round';g.lineJoin='round';g.shadowColor='rgba(255,207,77,1)';g.shadowBlur=16;g.strokeStyle='rgba(255,215,120,.95)';g.lineWidth=3.2;g.beginPath();trail.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
      g.shadowColor='rgba(110,231,255,1)';g.strokeStyle='rgba(180,240,255,.75)';g.lineWidth=1.4;g.setLineDash([2,8]);g.beginPath();trail.forEach((p,i)=>i?g.lineTo(p[0]+6,p[1]+4):g.moveTo(p[0]+6,p[1]+4));g.stroke();g.restore();
      trail.forEach((p,i)=>{if(i%2===0)pad(g,p[0],p[1],5,'rgba(255,215,120,1)')});
      const hx=322,hy=376;g.fillStyle='#0b0b1e';g.beginPath();g.arc(hx,hy-24,4.6,0,6.283);g.fill();g.fillRect(hx-3.5,hy-20,7,13);g.fillRect(hx-7.5,hy-19,5,10);g.strokeStyle='#0b0b1e';g.lineWidth=2.6;g.beginPath();g.moveTo(hx-1,hy-7);g.lineTo(hx-4,hy+2);g.moveTo(hx+2,hy-7);g.lineTo(hx+5,hy+2);g.moveTo(hx+3,hy-16);g.lineTo(hx+11,hy+2);g.stroke();
      for(let i=0;i<5;i++){const bx=150+i*24+R()*10,by=200+R()*40;g.strokeStyle='rgba(30,30,60,.7)';g.lineWidth=1.6;g.beginPath();g.moveTo(bx-6,by);g.quadraticCurveTo(bx-3,by-4,bx,by);g.quadraticCurveTo(bx+3,by-4,bx+6,by);g.stroke()}
      circuits(g,R,{n:16,y0:540,y1:620,col:'rgba(255,215,140,.6)'});
      for(let i=0;i<26;i++){g.fillStyle=`rgba(255,240,200,${R()*.6})`;g.beginPath();g.arc(R()*W,380+R()*240,R()*1.6,0,6.283);g.fill()}
      vignette(g,.4);grain(g,R,.03)},
    ramen(g,R){const bg=g.createRadialGradient(W/2,H*.62,40,W/2,H*.62,520);bg.addColorStop(0,'#3a2418');bg.addColorStop(.6,'#1c120c');bg.addColorStop(1,'#0a0605');g.fillStyle=bg;g.fillRect(0,0,W,H);
      for(let i=0;i<14;i++){g.strokeStyle=`rgba(120,80,50,${.12+R()*.1})`;g.lineWidth=1;g.beginPath();g.moveTo(0,300+i*24+R()*8);g.bezierCurveTo(W*.3,300+i*24+R()*20,W*.7,300+i*24-R()*20,W,300+i*24+R()*8);g.stroke()}
      const ng=g.createRadialGradient(80,70,4,80,70,180);ng.addColorStop(0,'rgba(255,90,140,.55)');ng.addColorStop(1,'rgba(255,90,140,0)');g.fillStyle=ng;g.fillRect(0,0,W,H);const ng2=g.createRadialGradient(390,90,4,390,90,160);ng2.addColorStop(0,'rgba(110,231,255,.45)');ng2.addColorStop(1,'rgba(110,231,255,0)');g.fillStyle=ng2;g.fillRect(0,0,W,H);
      const cx=W/2,cy=420,rx=190,ry=120;
      g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.ellipse(cx,cy+130,rx*.95,30,0,0,6.283);g.fill();
      const bowl=g.createLinearGradient(0,cy,0,cy+170);bowl.addColorStop(0,'#1d1f2b');bowl.addColorStop(1,'#07080f');g.fillStyle=bowl;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI);g.lineTo(cx-rx*.62,cy+150);g.quadraticCurveTo(cx,cy+178,cx+rx*.62,cy+150);g.closePath();g.fill();
      g.save();g.strokeStyle='rgba(224,168,74,.8)';g.lineWidth=1.6;g.shadowColor='rgba(255,190,90,.8)';g.shadowBlur=6;for(let k=0;k<9;k++){const t=k/8,x=cx-rx*.85+t*rx*1.7,y=cy+30+Math.sin(t*Math.PI)*60;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+30);g.lineTo(x+12,y+42);g.stroke();g.beginPath();g.arc(x+12,y+42,3,0,6.283);g.stroke()}g.restore();
      g.fillStyle='#e9e4da';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,6.283);g.fill();
      const broth=g.createRadialGradient(cx-30,cy-20,10,cx,cy,rx);broth.addColorStop(0,'#f6c77a');broth.addColorStop(.7,'#d9913f');broth.addColorStop(1,'#a8622a');g.fillStyle=broth;g.beginPath();g.ellipse(cx,cy+4,rx-14,ry-12,0,0,6.283);g.fill();
      g.save();g.beginPath();g.ellipse(cx,cy+4,rx-14,ry-12,0,0,6.283);g.clip();
      for(let k=0;k<46;k++){g.strokeStyle=k%3?'#ffe6a6':'#f5d58a';g.lineWidth=3;g.beginPath();const y0=cy-60+R()*130,x0=cx-180;g.moveTo(x0,y0);for(let x=x0;x<cx+180;x+=6)g.lineTo(x,y0+Math.sin(x*.07+k)*7+Math.sin(x*.02+k*2)*10);g.stroke()}
      for(let i=0;i<22;i++){g.fillStyle='rgba(255,240,190,.55)';g.beginPath();g.arc(cx-150+R()*300,cy-70+R()*140,2+R()*4,0,6.283);g.fill()}
      [[cx+70,cy-30,0],[cx+120,cy+10,.5]].forEach(([x,y,r])=>{g.save();g.translate(x,y);g.rotate(r);g.fillStyle='#b0643a';g.beginPath();g.ellipse(0,0,46,32,0,0,6.283);g.fill();g.strokeStyle='#e8c29a';g.lineWidth=3;g.beginPath();g.ellipse(0,0,40,26,0,0,6.283);g.stroke();g.strokeStyle='rgba(255,230,200,.6)';g.lineWidth=2;g.beginPath();g.moveTo(-20,-6);g.quadraticCurveTo(0,8,22,-4);g.stroke();g.restore()});
      [[cx-90,cy-28],[cx-40,cy-48]].forEach(([x,y])=>{g.fillStyle='#fffaf0';g.beginPath();g.ellipse(x,y,34,24,-.2,0,6.283);g.fill();const yk=g.createRadialGradient(x-2,y-2,2,x,y,16);yk.addColorStop(0,'#ffb02e');yk.addColorStop(1,'#e07a10');g.fillStyle=yk;g.beginPath();g.ellipse(x,y,16,12,-.2,0,6.283);g.fill()});
      g.fillStyle='#1d3a26';g.save();g.translate(cx+10,cy-70);g.rotate(-.25);g.fillRect(-26,-46,52,70);g.strokeStyle='rgba(120,200,140,.25)';g.lineWidth=1;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-26,-40+i*14);g.lineTo(26,-40+i*14);g.stroke()}g.restore();
      g.fillStyle='#fff';g.beginPath();g.arc(cx-120,cy+30,22,0,6.283);g.fill();g.strokeStyle='#ff7aa8';g.lineWidth=3;g.beginPath();for(let a=0;a<12;a+=.2){const r=2+a*1.5;g.lineTo(cx-120+Math.cos(a)*r,cy+30+Math.sin(a)*r)}g.stroke();
      for(let i=0;i<30;i++){const x=cx-150+R()*300,y=cy-60+R()*130;g.strokeStyle='#4caf50';g.lineWidth=3;g.beginPath();g.arc(x,y,4,0,6.283);g.stroke()}
      g.restore();
      [[cx+44,cy-150,W+40,cy-420],[cx+74,cy-142,W+60,cy-392]].forEach(([x0,y0,x1,y1])=>{g.save();g.lineCap='round';g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=12;g.beginPath();g.moveTo(x0+4,y0+6);g.lineTo(x1+4,y1+6);g.stroke();
        const sg=g.createLinearGradient(x0,y0,x1,y1);sg.addColorStop(0,'#6b4426');sg.addColorStop(.75,'#3a2416');sg.addColorStop(.76,'#e0a84a');sg.addColorStop(1,'#c88a32');g.strokeStyle=sg;g.lineWidth=9;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.restore()});
      for(let k=0;k<8;k++){g.strokeStyle=k%2?'#ffe6a6':'#f5d58a';g.lineWidth=3.2;g.beginPath();const x0=cx+48+k*4,y0=cy-148+k*1.2;g.moveTo(x0,y0);g.bezierCurveTo(x0+16,y0+40,x0-16,y0+80,x0+4+k*3,cy-20);g.stroke()}
      for(let s=0;s<6;s++){const x0=cx-110+s*44;g.save();g.lineCap='round';g.strokeStyle=`rgba(255,255,255,${.22+s*.03})`;g.lineWidth=6;g.filter='blur(2px)';g.beginPath();g.moveTo(x0,cy-90);g.bezierCurveTo(x0-24,cy-150,x0+24,cy-190,x0,cy-240);g.stroke();g.restore();
        const pts=[[x0,cy-240]];let x=x0,y=cy-240;for(let k=0;k<4;k++){const d=R()<.5?-1:1;x+=d*(18+R()*24);y-=18;pts.push([x,y]);y-=20+R()*30;pts.push([x,y])}trace(g,pts,'rgba(110,231,255,.85)',1.8,'rgba(110,231,255,1)');pad(g,x,y,3.4,'rgba(110,231,255,1)')}
      g.font='800 22px "Unbounded","Arial Black",sans-serif';g.save();g.shadowColor='#ff5a8c';g.shadowBlur=18;g.fillStyle='#ffb3cc';g.fillText('OPEN LATE',28,64);g.restore();
      vignette(g,.5);grain(g,R,.04)}
  };
  const cache={};
  return function(c){if(cache[c.id])return cache[c.id];const cv=document.createElement('canvas');cv.width=W*S;cv.height=H*S;const g=cv.getContext('2d');g.scale(S,S);
    const R=rng(c.id);(SCENE[c.a.split(':')[1]]||SCENE.sunset)(g,R);cache[c.id]=cv.toDataURL('image/jpeg',.9);return cache[c.id]};
})();

/* ---------------- art ---------------- */
const artCache={};
function art(c){
  if(artCache[c.id])return artCache[c.id];
  const W=480,H=300,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  const hue={C:'#2b3150',U:'#1b2f6b',H:'#3c1d5c',W:'#4a3608',F:'#0f3a48',S:'#4a1840'}[c.r];
  const bg=g.createRadialGradient(W*.5,H*.45,10,W*.5,H*.5,W*.7);bg.addColorStop(0,hue);bg.addColorStop(1,'#07080f');g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;for(let x=0;x<W;x+=16){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=0;y<H;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
  const gold='#e0a84a',ink='#ecebf5',cy=H/2,cx=W/2;
  g.lineCap='round';g.lineJoin='round';
  const L=(pts,col,w)=>{g.strokeStyle=col||ink;g.lineWidth=w||5;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};
  const lead=()=>{L([[40,cy],[150,cy]],gold,7);L([[330,cy],[440,cy]],gold,7)};
  const glow=(col)=>{g.shadowColor=col;g.shadowBlur=24};const noglow=()=>{g.shadowBlur=0};
  if(c.a.includes(':')){const [k,v]=c.a.split(':');DRAW(g,k,v,c)}else switch(c.a){
   case 'res':lead();g.fillStyle='#d9c08a';g.beginPath();g.roundRect(150,cy-34,180,68,30);g.fill();
     ['#d33','#d33','#7a4a1e','#c9a227'].forEach((col,i)=>{g.fillStyle=col;g.fillRect(185+i*(i===3?36:30),cy-34,16,68)});break;
   case 'cap':L([[40,cy],[205,cy]],gold,7);L([[275,cy],[440,cy]],gold,7);g.fillStyle=ink;g.fillRect(205,cy-70,14,140);g.strokeStyle=ink;g.lineWidth=14;g.beginPath();g.arc(330,cy,70,Math.PI*.78,Math.PI*1.22);g.stroke();
     g.font='700 34px monospace';g.fillStyle=gold;g.fillText('+',165,cy-50);break;
   case 'ind':L([[40,cy],[130,cy]],gold,7);L([[350,cy],[440,cy]],gold,7);g.strokeStyle=ink;g.lineWidth=7;for(let i=0;i<4;i++){g.beginPath();g.arc(157+i*55,cy,27,Math.PI,0);g.stroke()}break;
   case 'diode':lead();g.fillStyle=ink;g.beginPath();g.moveTo(170,cy-60);g.lineTo(170,cy+60);g.lineTo(290,cy);g.closePath();g.fill();g.fillRect(292,cy-60,14,120);L([[150,cy],[170,cy]],gold,7);L([[306,cy],[330,cy]],gold,7);break;
   case 'led':lead();glow('#ff6b6f');g.fillStyle='#ff6b6f';g.beginPath();g.moveTo(170,cy-55);g.lineTo(170,cy+55);g.lineTo(280,cy);g.closePath();g.fill();g.fillRect(282,cy-55,13,110);noglow();
     L([[150,cy],[170,cy]],gold,7);L([[295,cy],[330,cy]],gold,7);[[0,0],[34,22]].forEach(([dx,dy])=>{L([[255+dx,cy-70+dy],[300+dx,cy-110+dy]],'#ffcf4d',5);L([[300+dx,cy-110+dy],[284+dx,cy-106+dy]],'#ffcf4d',5);L([[300+dx,cy-110+dy],[296+dx,cy-94+dy]],'#ffcf4d',5)});break;
   case 'ant':g.strokeStyle=gold;g.lineWidth=9;g.beginPath();g.moveTo(60,H-50);g.lineTo(60,90);for(let i=0;i<7;i++){const x=60+i*50;g.lineTo(x+50,90);g.lineTo(x+50,i%2?90:200);g.lineTo(x+50,90)}g.stroke();
     g.beginPath();g.moveTo(60,H-50);for(let i=0;i<7;i++){g.lineTo(85+i*50,i%2?120:210);}g.stroke();
     g.strokeStyle='rgba(110,231,255,.7)';g.lineWidth=4;for(let r=1;r<4;r++){g.beginPath();g.arc(420,60,r*28,Math.PI*.6,Math.PI*1.1);g.stroke()}break;
   case 'probe':g.fillStyle='#2d3a5a';g.fillRect(40,cy+50,W-80,40);g.fillStyle='#4a6ab0';g.fillRect(40,cy+50,W-80,10);
     for(let i=0;i<4;i++){const x=120+i*80;g.fillStyle='#c9ced8';g.fillRect(x-6,40,12,cy+10-40);g.beginPath();g.moveTo(x-6,cy+10);g.lineTo(x+6,cy+10);g.lineTo(x,cy+50);g.fill();g.fillStyle=i===0||i===3?'#ff6b6f':'#3fdc9c';g.fillRect(x-14,40,28,24)}
     g.font='600 20px monospace';g.fillStyle=ink;g.fillText('I',100,30);g.fillText('V',196,30);g.fillText('V',276,30);g.fillText('I',356,30);break;
   case 'npn':g.strokeStyle=ink;g.lineWidth=6;g.beginPath();g.arc(cx,cy,92,0,6.283);g.stroke();g.fillStyle=ink;g.fillRect(cx-30,cy-52,12,104);L([[60,cy],[cx-30,cy]],gold,7);
     L([[cx-18,cy-24],[cx+50,cy-80],[cx+50,cy-130]],gold,7);L([[cx-18,cy+24],[cx+50,cy+80],[cx+50,cy+130]],gold,7);g.fillStyle=gold;g.beginPath();g.moveTo(cx+52,cy+82);g.lineTo(cx+22,cy+76);g.lineTo(cx+40,cy+54);g.fill();break;
   case 'opamp':g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(150,40);g.lineTo(150,H-40);g.lineTo(340,cy);g.closePath();g.stroke();L([[40,95],[150,95]],gold,7);L([[40,H-95],[150,H-95]],gold,7);L([[340,cy],[440,cy]],gold,7);
     g.font='800 44px monospace';g.fillStyle=ink;g.fillText('−',168,110);g.fillText('+',168,H-78);break;
   case 'mos':g.fillStyle=ink;g.fillRect(190,70,12,160);[[90,120],[140,170],[190,220]].forEach(([a])=>{});for(let i=0;i<3;i++)g.fillRect(222,72+i*58,12,40);
     L([[60,200],[190,200]],gold,7);L([[234,92],[330,92],[330,40]],gold,7);L([[234,208],[330,208],[330,260]],gold,7);L([[234,150],[330,150],[330,208]],gold,7);
     g.fillStyle=gold;g.beginPath();g.moveTo(236,150);g.lineTo(266,136);g.lineTo(266,164);g.fill();break;
   case 'xtal':lead();g.fillStyle=ink;g.fillRect(170,cy-70,12,140);g.fillRect(298,cy-70,12,140);g.strokeStyle='#c9ced8';g.lineWidth=6;g.strokeRect(202,cy-48,76,96);L([[150,cy],[170,cy]],gold,7);L([[310,cy],[330,cy]],gold,7);
     g.strokeStyle='rgba(255,107,111,.8)';g.lineWidth=3;g.beginPath();for(let x=60;x<420;x+=2){const y=50+Math.sin(x/12)*14;x===60?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();break;
   case 'vreg':g.fillStyle='#1d1f2b';g.fillRect(150,70,180,120);g.fillStyle='#c9ced8';g.fillRect(170,30,140,40);g.beginPath();g.arc(240,48,12,0,6.283);g.fillStyle='#07080f';g.fill();
     ['IN','GND','OUT'].forEach((t,i)=>{L([[190+i*50,190],[190+i*50,260]],gold,10);g.font='600 18px monospace';g.fillStyle=ink;g.textAlign='center';g.fillText(t,190+i*50,285)});
     g.font='800 30px monospace';g.fillStyle=ink;g.fillText('3V3',240,140);g.textAlign='left';break;
   case 'eeprom':for(let i=0;i<8;i++)for(let j=0;j<5;j++){const on=(i*7+j*3)%5<2;g.fillStyle=on?'#d77bff':'rgba(215,123,255,.18)';g.fillRect(80+i*42,50+j*42,32,32)}
     g.font='600 18px monospace';g.fillStyle=ink;g.fillText('0x00',30,74);g.fillText('0x20',30,242);break;
   case 'timer':g.fillStyle='#1d1f2b';g.fillRect(150,60,180,180);g.fillStyle='#07080f';g.beginPath();g.arc(240,60,18,0,Math.PI);g.fill();
     for(let i=0;i<4;i++){g.fillStyle='#c9ced8';g.fillRect(120,80+i*42,30,14);g.fillRect(330,80+i*42,30,14)}
     g.strokeStyle='#ffcf4d';g.lineWidth=4;g.beginPath();g.moveTo(170,200);[[200,200],[200,150],[240,150],[240,200],[280,200],[280,150],[310,150]].forEach(p=>g.lineTo(p[0],p[1]));g.stroke();break;
   case 'pld':g.fillStyle='#3a3f58';g.fillRect(70,190,120,60);g.fillStyle='#c9ced8';g.fillRect(300,60,140,24);
     glow('#3fdc9c');L([[0,40],[130,190]],'#3fdc9c',6);noglow();
     const pg=g.createRadialGradient(140,190,10,230,120,170);pg.addColorStop(0,'rgba(255,207,77,.95)');pg.addColorStop(1,'rgba(255,107,111,0)');g.fillStyle=pg;g.beginPath();g.ellipse(230,140,170,70,-.45,0,6.283);g.fill();break;
   case 'rocket':g.fillStyle=ink;g.beginPath();g.moveTo(130,50);g.quadraticCurveTo(160,90,160,180);g.lineTo(100,180);g.quadraticCurveTo(100,90,130,50);g.fill();
     g.fillStyle='#ff6b6f';g.beginPath();g.moveTo(100,150);g.lineTo(78,200);g.lineTo(100,190);g.fill();g.beginPath();g.moveTo(160,150);g.lineTo(182,200);g.lineTo(160,190);g.fill();
     glow('#ffcf4d');g.fillStyle='#ffcf4d';g.beginPath();g.moveTo(110,185);g.lineTo(130,250);g.lineTo(150,185);g.fill();noglow();
     g.strokeStyle='#3fdc9c';g.lineWidth=4;g.beginPath();for(let x=230;x<440;x+=4){const y=230-Math.min(170,Math.pow((x-230)/14,1.7));x===230?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=2;g.strokeRect(220,50,226,190);break;
   case 'stars':g.fillStyle='#14172a';g.fillRect(60,40,360,220);g.font='500 19px monospace';
     [['module','#d77bff'],['  always_ff @(posedge clk)','#5b8cff'],['    q <= d;','#ecebf5'],['  assign y = a ^ b;','#3fdc9c'],['endmodule','#d77bff']].forEach((l,i)=>{g.fillStyle=l[1];g.fillText(l[0],80,82+i*38)});break;
   case 'fpga':for(let i=0;i<6;i++)for(let j=0;j<4;j++){g.fillStyle='rgba(63,220,156,.2)';g.strokeStyle='#3fdc9c';g.lineWidth=2;g.fillRect(70+i*58,45+j*55,40,38);g.strokeRect(70+i*58,45+j*55,40,38)}
     g.strokeStyle='rgba(255,207,77,.7)';g.lineWidth=3;for(let i=0;i<7;i++){g.beginPath();g.moveTo(60+i*58+5,35);g.lineTo(60+i*58+5,H-30);g.stroke()}for(let j=0;j<5;j++){g.beginPath();g.moveTo(60,40+j*55);g.lineTo(W-60,40+j*55);g.stroke()}break;
   case 'mcu':g.fillStyle='#1d1f2b';g.fillRect(150,60,180,180);for(let i=0;i<9;i++){g.fillStyle='#c9ced8';g.fillRect(162+i*19,40,8,20);g.fillRect(162+i*19,240,8,20);g.fillRect(130,72+i*19,20,8);g.fillRect(330,72+i*19,20,8)}
     g.font='800 34px sans-serif';g.textAlign='center';g.fillStyle=ink;g.fillText('LC',240,160);g.font='500 14px monospace';g.fillStyle='rgba(236,235,245,.6)';g.fillText('2030 · MCU',240,184);g.textAlign='left';break;
   case 'teg':g.fillStyle='#e9e4da';g.fillRect(110,80,260,20);g.fillRect(110,200,260,20);for(let i=0;i<8;i++){g.fillStyle=i%2?'#5b8cff':'#ff6b6f';g.fillRect(122+i*31,100,18,100)}
     L([[110,60],[90,40]],'#ff6b6f',5);L([[150,60],[130,40]],'#ff6b6f',5);g.font='600 18px monospace';g.fillStyle='#ff6b6f';g.fillText('HOT · skin',390,96);g.fillStyle='#5b8cff';g.fillText('COLD · air',390,214);
     g.strokeStyle='#3fdc9c';g.lineWidth=4;g.beginPath();for(let x=110;x<370;x+=3){const k=(x-110)%86;const y=262-(k>40&&k<46?(k-40)*8:k>=46&&k<50?40-(k-46)*14:0);x===110?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();break;
   case 'film':['#3a3f58','#6b56a8','#d77bff'].forEach((col,i)=>{g.fillStyle=col;g.fillRect(70,200-i*40,340,i?40:70)});
     for(let i=0;i<10;i++)for(let j=0;j<2;j++){g.fillStyle='#ffcf4d';g.beginPath();g.arc(88+i*34,132+j*20,5,0,6.283);g.fill()}
     g.strokeStyle='rgba(110,231,255,.8)';g.lineWidth=3;L([[40,40],[200,120]],'rgba(110,231,255,.8)',3);L([[280,120],[440,40]],'rgba(110,231,255,.8)',3);g.font='600 16px monospace';g.fillStyle=ink;g.fillText('XRD',210,40);break;
   case 'robot':g.fillStyle='#2d3350';g.fillRect(140,60,200,180);g.strokeStyle='#ff6b6f';g.lineWidth=4;g.strokeRect(140,60,200,180);
     [[118,70],[342,70],[118,180],[342,180]].forEach(([x,y])=>{g.fillStyle='#14152a';g.fillRect(x,y,22,52);g.fillStyle='#9aa0b8';for(let k=0;k<5;k++)g.fillRect(x+3,y+4+k*10,16,4)});
     g.fillStyle='#ffcf4d';g.fillRect(180,40,120,26);g.fillStyle='#5b8cff';g.fillRect(200,110,80,60);g.font='700 22px monospace';g.fillStyle=ink;g.textAlign='center';g.fillText('18996',240,215);g.textAlign='left';break;
   case 'exo':glow('#ffcf4d');g.fillStyle='#ffe9a8';g.beginPath();g.arc(110,90,46,0,6.283);g.fill();noglow();g.fillStyle='#07080f';g.beginPath();g.arc(128,98,13,0,6.283);g.fill();
     g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=1;g.beginPath();g.moveTo(190,60);g.lineTo(190,250);g.lineTo(450,250);g.stroke();
     for(let x=200;x<440;x+=7){const d=x>290&&x<350?(x<300?(x-290)/10:x>340?(350-x)/10:1)*36:0;g.fillStyle='#6ee7ff';g.beginPath();g.arc(x,110+d+(Math.sin(x*7.1)*5),3.4,0,6.283);g.fill()}
     g.font='600 15px monospace';g.fillStyle='rgba(236,235,245,.6)';g.fillText('flux',200,80);g.fillText('time →',380,272);break;
   case 'wafer':{const r=130;const wg=g.createRadialGradient(cx-40,cy-40,10,cx,cy,r);wg.addColorStop(0,'#c8d0ff');wg.addColorStop(.5,'#8a7ad8');wg.addColorStop(1,'#3b2f6e');
     g.fillStyle=wg;g.beginPath();g.arc(cx,cy,r,0,6.283);g.fill();g.save();g.beginPath();g.arc(cx,cy,r-6,0,6.283);g.clip();
     for(let x=cx-r;x<cx+r;x+=22)for(let y=cy-r;y<cy+r;y+=22){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.strokeRect(x,y,20,20);if(Math.abs(x-cx+11)<12&&Math.abs(y-cy+11)<12){g.fillStyle='#ffcf4d';g.fillRect(x,y,20,20)}}g.restore();
     g.fillStyle='#07080f';g.fillRect(cx-16,cy+r-6,32,10);break;}
  }
  noglow();
  const url=cv.toDataURL('image/png');artCache[c.id]=url;return url;
}

/* ---------------- card back (SVG) ---------------- */
function backSVG(){
  const pins=[];for(let i=0;i<7;i++){const t=66+i*18;pins.push(`<rect x="${t-3}" y="96" width="6" height="14" rx="1"/><rect x="${t-3}" y="230" width="6" height="14" rx="1"/><rect x="40" y="${t+56}" width="14" height="6" rx="1"/><rect x="170" y="${t+56}" width="14" height="6" rx="1"/>`)}
  const traces=[];
  const dirs=[[0,-1],[0,1],[-1,0],[1,0]];
  for(let i=0;i<7;i++){const t=66+i*18;
    traces.push(`M${t} 96 V${70-((i*13)%30)} H${t+(i%2?14:-14)} V10`,`M${t} 244 V${270+((i*11)%30)} H${t+(i%2?-14:14)} V330`,
      `M40 ${t+59} H${22-((i*7)%10)} V${t+59+(i%2?12:-12)} H6`,`M184 ${t+59} H${202+((i*9)%10)} V${t+59+(i%2?-12:12)} H218`)}
  return `<svg viewBox="0 0 224 314" preserveAspectRatio="none" aria-hidden="true">
  <defs><pattern id="lcHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#0b0d18"/><rect width="1.4" height="6" fill="rgba(224,168,74,.12)"/></pattern>
  <linearGradient id="lcDie" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2140"/><stop offset=".55" stop-color="#121528"/><stop offset="1" stop-color="#2a1d45"/></linearGradient>
  <linearGradient id="lcSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6ee7ff" stop-opacity=".0"/><stop offset=".5" stop-color="#6ee7ff" stop-opacity=".22"/><stop offset="1" stop-color="#d77bff" stop-opacity="0"/></linearGradient></defs>
  <rect width="224" height="314" fill="#07080f"/><rect x="6" y="6" width="212" height="302" rx="6" fill="url(#lcHatch)" stroke="#e0a84a" stroke-width="1.5"/>
  <g fill="none" stroke="#e0a84a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${traces.map(d=>`<path d="${d}"/>`).join('')}</g>
  <g fill="#c9ced8">${pins.join('')}</g>
  <rect x="52" y="108" width="120" height="124" rx="4" fill="url(#lcDie)" stroke="#5b8cff" stroke-width="1.2"/>
  <g stroke="rgba(110,231,255,.25)" stroke-width=".8">${Array.from({length:9},(_,i)=>`<line x1="58" y1="${116+i*13}" x2="166" y2="${116+i*13}"/>`).join('')}</g>
  <rect x="62" y="118" width="100" height="104" rx="2" fill="none" stroke="#d77bff" stroke-opacity=".5" stroke-dasharray="3 3"/>
  <circle cx="64" cy="120" r="3" fill="#ecebf5" opacity=".8"/>
  <text x="112" y="182" text-anchor="middle" font-family="Unbounded, 'Arial Black', sans-serif" font-weight="800" font-size="46" fill="#ecebf5" letter-spacing="-2">LC</text>
  <text x="112" y="204" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" fill="#9aa0b8" letter-spacing="2">LC-2030 · DIE CARDS</text>
  <g fill="none" stroke="#ffcf4d" stroke-width="1.2" opacity=".8"><path d="M20 24 h12 M26 18 v12"/><path d="M192 290 h12 M198 284 v12"/></g>
  <rect x="6" y="6" width="212" height="302" rx="6" fill="url(#lcSheen)"/>
  </svg>`;
}
const BACK=backSVG();

/* ---------------- styles ---------------- */
const css=`
.dcard{--rc:#9aa0b8;position:relative;width:224px;aspect-ratio:224/314;perspective:1000px;flex:none;user-select:none;-webkit-user-select:none;container-type:inline-size}
.dcard .flip{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.3,.9,.3,1)}
.dcard.facedown .flip{transform:rotateY(180deg)}
.dcard .face,.dcard .back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;overflow:hidden}
.dcard .back{transform:rotateY(180deg);box-shadow:0 10px 30px rgba(0,0,0,.5)}
.dcard .back svg{width:100%;height:100%;display:block}
.dcard .face{background:#0c0e1a;border:2px solid var(--rc);box-shadow:0 10px 30px rgba(0,0,0,.5),inset 0 0 0 4px #0c0e1a,inset 0 0 0 5px color-mix(in srgb,var(--rc) 40%,transparent);display:flex;flex-direction:column;padding:4.5cqw 4.5cqw 3.6cqw;font-family:"Figtree",system-ui,sans-serif;color:#ecebf5}
.dc-top{display:flex;justify-content:space-between;align-items:baseline;gap:6px}
.dc-name{font:800 5.85cqw/1.15 "Unbounded","Arial Black",sans-serif;letter-spacing:-.01em}
.dc-no{font:500 4.2cqw "JetBrains Mono",monospace;color:#8e8fab;white-space:nowrap}
.dc-art{flex:none;margin-top:3cqw;aspect-ratio:480/300;border:1px solid color-mix(in srgb,var(--rc) 70%,transparent);border-radius:3px;overflow:hidden;position:relative;background:#07080f}
.dc-art img{width:100%;height:100%;display:block}
.dc-art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.35));pointer-events:none}
.dc-type{display:flex;justify-content:space-between;align-items:center;gap:2.6cqw;margin-top:2.6cqw;font:500 3.9cqw/1.2 "JetBrains Mono",monospace;letter-spacing:.05em;text-transform:uppercase;color:#9aa0b8}
.dc-rar{display:inline-flex;align-items:center;gap:4px;color:var(--rc);white-space:nowrap}
.dc-rar i{width:3.1cqw;height:3.1cqw;background:var(--rc);transform:rotate(45deg);box-shadow:0 0 6px var(--rc)}
.dc-specs{margin:3cqw 0 0;display:grid;gap:.9cqw}
.dc-specs div{display:flex;justify-content:space-between;gap:3.6cqw;font:500 4.3cqw/1.4 "JetBrains Mono",monospace;border-bottom:1px dashed rgba(255,255,255,.08)}
.dc-specs dt{color:#8e8fab}.dc-specs dd{margin:0;text-align:right;color:#ecebf5}
.dc-text{margin:2.6cqw 0 0;font-size:4.6cqw;line-height:1.35;overflow:hidden;color:#c9c8da;font-style:italic;flex:1}
.dc-foot{display:flex;justify-content:space-between;font:500 3.6cqw "JetBrains Mono",monospace;letter-spacing:.06em;color:#6c6e8a;margin-top:1.8cqw}
.dcard .shine{position:absolute;inset:0;border-radius:10px;pointer-events:none;opacity:0;mix-blend-mode:color-dodge;transition:opacity .3s}
.dcard.r-H .shine,.dcard.r-W .shine{opacity:.55;background:
  radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,255,255,.55),transparent 38%),
  repeating-linear-gradient(115deg,rgba(255,0,128,.35) 0%,rgba(255,200,0,.35) 6%,rgba(0,255,170,.35) 12%,rgba(0,160,255,.35) 18%,rgba(190,0,255,.35) 24%);
  background-size:100% 100%,240% 240%;background-position:center,var(--bx,50%) var(--by,50%)}
.dcard.r-W .shine{opacity:.7;background:
  radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,240,200,.7),transparent 40%),
  repeating-radial-gradient(circle at 50% 120%,rgba(255,207,77,.35) 0 6px,rgba(215,123,255,.3) 6px 12px,rgba(110,231,255,.3) 12px 18px);background-size:100% 100%,200% 200%;background-position:center,var(--bx,50%) var(--by,50%)}
.dcard.r-W .face{background:linear-gradient(160deg,#1c1606,#0c0e1a 40%,#1a1030)}
.dcard .newb{position:absolute;top:-8px;right:-8px;z-index:3;font:800 .6rem "Unbounded",sans-serif;background:#3fdc9c;color:#04130c;padding:4px 7px;border-radius:3px;transform:rotate(8deg);box-shadow:0 4px 12px rgba(0,0,0,.4)}
.dcard.dup .newb{background:#9aa0b8}
.dcard{transition:transform .15s ease-out}
.dslot{width:224px;aspect-ratio:224/314;border:1.5px dashed #2c3050;border-radius:10px;display:grid;place-items:center;text-align:center;color:#4b4f70;font:500 .7rem "JetBrains Mono",monospace;flex:none}
.dslot b{display:block;font:800 1.4rem "Unbounded",sans-serif;color:#2c3050}
.dslot.secret{border-color:#5a2a55;background:repeating-linear-gradient(45deg,rgba(255,157,226,.05) 0 6px,transparent 6px 12px);color:#ff9de2;animation:secretPulse 3s ease-in-out infinite}
.dslot.secret b{color:#ff9de2;letter-spacing:.1em}
@keyframes secretPulse{50%{box-shadow:0 0 22px rgba(255,157,226,.25)}}
.dcard.full .face.fa{padding:0;background-size:cover;background-position:center;border-color:var(--rc)}
.fa-top{display:flex;justify-content:space-between;align-items:baseline;gap:2.6cqw;padding:4cqw 4.5cqw 10cqw;background:linear-gradient(180deg,rgba(5,6,11,.7),rgba(5,6,11,0))}
.fa-top .dc-name{text-shadow:0 2px 8px rgba(0,0,0,.6)}
.fa-bot{margin-top:auto;padding:11cqw 4.5cqw 3.6cqw;background:linear-gradient(0deg,rgba(5,6,11,.88) 40%,rgba(5,6,11,0))}
.fa-bot .dc-type{color:#c9ced8;margin:0}
.fa-specs{display:none;gap:3.6cqw;flex-wrap:wrap;margin-top:2.2cqw;font:500 4cqw "JetBrains Mono",monospace;color:#ecebf5}
.fa-specs b{color:var(--rc);font-weight:700}
.fa-bot .dc-text{flex:none;margin-top:2.2cqw;color:#ecebf5}
.dcard.r-F .shine,.dcard.r-S .shine{opacity:.6;background:
  radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,255,255,.5),transparent 35%),
  linear-gradient(115deg,transparent 20%,rgba(110,231,255,.35) 35%,rgba(255,157,226,.35) 50%,rgba(255,207,77,.35) 65%,transparent 80%);
  background-size:100% 100%,300% 300%;background-position:center,var(--bx,50%) var(--by,50%)}
.dcard.r-S .face.fa{box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 2px #ff9de2,0 0 24px rgba(255,157,226,.45)}
.lcc-zoom .dcard.full .fa-specs{display:flex}

#lcCards{position:fixed;inset:0;z-index:60;background:rgba(5,6,11,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;flex-direction:column;color:#ecebf5;font-family:"Figtree",system-ui,sans-serif}
#lcCards[hidden]{display:none!important}
#lcCards [hidden]{display:none!important}
.lcc-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:calc(14px + env(safe-area-inset-top,0px)) 18px 12px;border-bottom:1px solid #262a45}
.lcc-top h2{margin:0;font:800 1.15rem "Unbounded",sans-serif;letter-spacing:-.01em}
.lcc-top .sub{font:500 .72rem "JetBrains Mono",monospace;color:#8e8fab;letter-spacing:.06em}
.lcc-top .sp{flex:1}
.lcc-btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border:1px solid #262a45;border-radius:4px;font:500 .78rem "JetBrains Mono",monospace;white-space:nowrap}
.lcc-btn:hover{border-color:#ffcf4d;color:#ffcf4d}.lcc-btn:focus-visible{outline:2px solid #ffcf4d}
.lcc-btn.pri{background:#ecebf5;color:#05060b;border-color:#ecebf5;font:700 .78rem "Unbounded",sans-serif}
.lcc-btn.pri:hover{background:#ffcf4d;border-color:#ffcf4d;color:#14152a}
.lcc-body{flex:1;overflow:auto;padding:22px 18px 40px;min-height:0}
.lcc-grid{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:1240px;margin:0 auto}
.lcc-grid .dcard,.lcc-grid .dslot{width:clamp(140px,22vw,190px)}
.lcc-grid .dcard{cursor:pointer;transition:transform .2s}
.lcc-grid .dcard:hover{transform:translateY(-4px)}
.lcc-prog{height:6px;background:#1a1d33;border-radius:3px;overflow:hidden;width:160px}
.lcc-prog i{display:block;height:100%;background:linear-gradient(90deg,#5b8cff,#d77bff,#ffcf4d)}
.lcc-filter{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:0 auto 18px}
.lcc-filter button{all:unset;cursor:pointer;font:500 .72rem "JetBrains Mono",monospace;padding:5px 10px;border:1px solid #262a45;border-radius:20px;color:#8e8fab}
.lcc-filter button.on{color:#ecebf5;border-color:#ecebf5}
.lcc-filter button:focus-visible{outline:2px solid #ffcf4d}
.lcc-zoom{position:fixed;inset:0;z-index:2;display:grid;place-items:center;background:rgba(5,6,11,.8);padding:20px}
.lcc-zoom[hidden]{display:none!important}
.lcc-zoom .dcard{width:min(360px,80vw,calc((100vh - 120px) * .713))}
.lcc-zoom .hint{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom,0px));left:0;right:0;text-align:center;font:500 .74rem "JetBrains Mono",monospace;color:#8e8fab}
/* pack */
.pack-stage{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center}
.pack{position:relative;width:min(230px,60vw);aspect-ratio:224/330;cursor:pointer;border-radius:8px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(110,231,255,.15);
  background:linear-gradient(135deg,#2a2f55,#14172a 40%,#3a1d5c 70%,#1b2f6b);animation:packIdle 3s ease-in-out infinite}
@keyframes packIdle{50%{transform:translateY(-6px) rotate(-1deg)}}
.pack::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.0) 0 10px,rgba(255,255,255,.08) 10px 12px)}
.pack::after{content:"";position:absolute;left:0;right:0;top:0;height:14%;background:repeating-linear-gradient(90deg,#c9ced8 0 6px,#8f95a6 6px 12px);clip-path:polygon(0 0,100% 0,100% 70%,96% 100%,92% 70%,88% 100%,84% 70%,80% 100%,76% 70%,72% 100%,68% 70%,64% 100%,60% 70%,56% 100%,52% 70%,48% 100%,44% 70%,40% 100%,36% 70%,32% 100%,28% 70%,24% 100%,20% 70%,16% 100%,12% 70%,8% 100%,4% 70%,0 100%)}
.pack .pl{position:absolute;inset:18% 10% 8%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}
.pack .pl b{font:800 1.6rem/1 "Unbounded",sans-serif;letter-spacing:-.03em}
.pack .pl span{font:500 .62rem "JetBrains Mono",monospace;letter-spacing:.14em;color:#9aa0b8;text-transform:uppercase}
.pack .pl em{font:700 .7rem "JetBrains Mono",monospace;font-style:normal;color:#05060b;background:var(--pc,#ffcf4d);padding:3px 8px;border-radius:2px;letter-spacing:.06em}
.pack .chipmark{width:70px;height:70px;border:2px solid #e0a84a;border-radius:4px;display:grid;place-items:center;font:800 1.5rem "Unbounded",sans-serif;position:relative;background:#0b0d18}
.pack .chipmark::before{content:"";position:absolute;inset:-9px 10px;border-top:4px dotted #c9ced8;border-bottom:4px dotted #c9ced8}
.pack.tear{animation:packTear .6s cubic-bezier(.5,0,.7,.4) forwards}
@keyframes packTear{30%{transform:scale(1.06) rotate(2deg)}100%{transform:translateY(60px) scale(.8);opacity:0}}
.pack-hint{font:500 .78rem "JetBrains Mono",monospace;color:#8e8fab}
.reveal{display:flex;gap:18px;flex-wrap:wrap;justify-content:center;perspective:1200px}
.reveal .dcard{width:clamp(150px,24vw,224px);cursor:pointer;animation:deal .55s cubic-bezier(.2,.9,.3,1.2) both}
.reveal .dcard:nth-child(2){animation-delay:.12s}.reveal .dcard:nth-child(3){animation-delay:.24s}
@keyframes deal{from{transform:translateY(80px) rotate(-8deg) scale(.7);opacity:0}}
.reveal .dcard.r-H:not(.facedown),.reveal .dcard.r-W:not(.facedown){filter:drop-shadow(0 0 18px var(--rc))}

.pack::after{display:none}
.pack .strip{position:absolute;left:0;right:0;top:0;height:14%;z-index:2;background:repeating-linear-gradient(90deg,#c9ced8 0 6px,#8f95a6 6px 12px);clip-path:polygon(0 0,100% 0,100% 70%,96% 100%,92% 70%,88% 100%,84% 70%,80% 100%,76% 70%,72% 100%,68% 70%,64% 100%,60% 70%,56% 100%,52% 70%,48% 100%,44% 70%,40% 100%,36% 70%,32% 100%,28% 70%,24% 100%,20% 70%,16% 100%,12% 70%,8% 100%,4% 70%,0 100%)}
.strip.flying{animation:stripFly 1.1s cubic-bezier(.2,.6,.4,1) forwards;border-radius:2px}
@keyframes stripFly{to{transform:translate(220px,-260px) rotate(38deg);opacity:0}}
.pack .tearline{position:absolute;left:0;top:13.5%;height:3px;width:var(--tp,0%);z-index:3;background:#fff;box-shadow:0 0 10px #6ee7ff,0 0 24px #6ee7ff;border-radius:2px}
.pack{touch-action:none}
.pack.charging{animation:packShake .08s linear infinite}
.pack.charging .strip{filter:drop-shadow(0 0 6px #6ee7ff) brightness(1.3)}
.pack.charging::before{background:repeating-linear-gradient(115deg,rgba(255,255,255,0) 0 10px,rgba(110,231,255,.18) 10px 12px)}
@keyframes packShake{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(-1.5px,1px) rotate(-.6deg)}50%{transform:translate(1.5px,-1px) rotate(.5deg)}75%{transform:translate(-1px,-1px) rotate(-.3deg)}}
.pack.ripped{animation:packDrop 1.4s cubic-bezier(.5,0,.8,.4) .9s forwards}
.pack.ripped .chipmark{box-shadow:0 0 30px #6ee7ff}
@keyframes packDrop{to{transform:translateY(120vh) rotate(12deg)}}
.lcc-fx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;display:none}
.reveal .dcard.nodeal{animation:none}
.reveal .dcard.pending{visibility:hidden}
.reveal .dcard.printing{animation:expose .65s cubic-bezier(.4,0,.2,1) both}
.reveal .dcard.printing::before{content:"";position:absolute;inset:0;z-index:3;border-radius:10px;background:#fff;mix-blend-mode:overlay;animation:flashout .7s ease-out both;pointer-events:none}
@keyframes flashout{from{opacity:.9}to{opacity:0}}
.reveal .dcard.printing::after{content:"";position:absolute;left:-6%;right:-6%;height:6px;top:0;z-index:4;background:#fff;box-shadow:0 0 18px #6ee7ff,0 0 40px #6ee7ff;border-radius:3px;animation:scanbar .65s cubic-bezier(.4,0,.2,1) both}
@keyframes expose{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes scanbar{from{top:0;opacity:1}to{top:100%;opacity:0}}
.dcard.pop{animation:pop .6s cubic-bezier(.2,1.6,.4,1)}
@keyframes pop{30%{transform:scale(1.12)}}
@media (prefers-reduced-motion: reduce){.dcard .flip{transition:none}.pack,.reveal .dcard{animation:none}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------------- card DOM ---------------- */
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function cardEl(c,opts){
  opts=opts||{};const d=document.createElement('div');const isFull=c.r==='F'||c.r==='S';d.className=`dcard r-${c.r}`+(isFull?' full':'')+(opts.facedown?' facedown':'');d.style.setProperty('--rc',RAR[c.r].col);d.dataset.id=c.id;
  if(isFull){d.innerHTML=`<div class="flip"><div class="face fa" style="background-image:url(${FULL(c)})">
    <div class="fa-top"><span class="dc-name">${esc(c.n)}</span><span class="dc-no">${String(c.no).padStart(3,'0')}/${SET_SIZE}</span></div>
    <div class="fa-bot"><div class="dc-type"><span>${esc(c.t)}</span><span class="dc-rar"><i></i>${RAR[c.r].name}</span></div>
    <div class="fa-specs">${c.s.map(([k,v])=>`<span><b>${esc(k)}</b> ${esc(v)}</span>`).join('')}</div><p class="dc-text">${esc(c.x)}</p>
    <div class="dc-foot"><span>LC-2030 DIE CARDS</span><span>REV A</span></div></div></div>
    <div class="back">${BACK}</div></div><div class="shine"></div>`;
    d.setAttribute('role','img');d.setAttribute('aria-label',`${c.n}, ${RAR[c.r].name} card. ${c.x}`);if(opts.tilt)tiltable(d);return d}
  d.innerHTML=`<div class="flip"><div class="face">
    <div class="dc-top"><span class="dc-name">${esc(c.n)}</span><span class="dc-no">${String(c.no).padStart(3,'0')}/${SET_SIZE}</span></div>
    <div class="dc-art"><img alt="" src="${art(c)}"></div>
    <div class="dc-type"><span>${esc(c.t)}</span><span class="dc-rar"><i></i>${RAR[c.r].name}</span></div>
    <dl class="dc-specs">${c.s.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <p class="dc-text">${esc(c.x)}</p>
    <div class="dc-foot"><span>LC-2030 DIE CARDS</span><span>REV A</span></div></div>
    <div class="back">${BACK}</div></div><div class="shine"></div>`;
  d.setAttribute('role','img');d.setAttribute('aria-label',`${c.n}, ${RAR[c.r].name} card. ${c.s.map(s=>s.join(' ')).join(', ')}. ${c.x}`);
  if(opts.tilt)tiltable(d);
  return d;
}
function tiltable(d){
  d.addEventListener('pointermove',e=>{const r=d.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    d.style.transform=`perspective(900px) rotateY(${(x-.5)*22}deg) rotateX(${(.5-y)*18}deg)`;
    d.style.setProperty('--mx',(x*100)+'%');d.style.setProperty('--my',(y*100)+'%');d.style.setProperty('--bx',(x*100)+'%');d.style.setProperty('--by',(y*100)+'%')});
  d.addEventListener('pointerleave',()=>{d.style.transform=''});
}

/* ---------------- packs ---------------- */
function rollRarity(){let r=Math.random()*100;for(const k of['S','F','W','H','U','C']){r-=RAR[k].w;if(r<0)return k}return 'C'}
function pick(list){const tw={C:1,U:.6,H:.25,W:.07,F:.035,S:0};const items=list.map(id=>BY[id]).filter(Boolean);let tot=items.reduce((a,c)=>a+tw[c.r],0),r=Math.random()*tot;for(const c of items){r-=tw[c.r];if(r<0)return c}return items[0]}
function makePack(chip){const out=[];const themed=pick(THEME[chip]||THEME.home);
  for(let i=0;i<2;i++){const rr=rollRarity();if(rr==='S'){out.push(BY[Math.random()<.25?'sr_escape':'sr_ramen']);continue}const pool=CARDS.filter(c=>c.r===rr&&c.id!==themed.id&&!out.includes(c));out.push(pool[Math.random()*pool.length|0]||CARDS[0])}
  out.push(themed);return out.sort((a,b)=>'CUHWFS'.indexOf(a.r)-'CUHWFS'.indexOf(b.r))}

/* ---------------- overlay UI ---------------- */
let root,body,zoomEl,onClose=null;
function ensure(){
  if(root)return;
  root=document.createElement('section');root.id='lcCards';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-label','Die Cards');
  root.innerHTML=`<div class="lcc-top"><div><h2 id="lccTitle">Die Cards</h2><div class="sub" id="lccSub"></div></div><span class="sp"></span>
    <div class="lcc-prog" title="Collection progress"><i id="lccProg"></i></div><span class="sub" id="lccCount"></span>
    <button class="lcc-btn pri" id="lccPacks" type="button" hidden></button><button class="lcc-btn" id="lccBinder" type="button">Binder</button><button class="lcc-btn" id="lccClose" type="button">Close ✕</button></div>
    <div class="lcc-body" id="lccBody"></div><div class="lcc-zoom" id="lccZoom" hidden></div>`;
  document.body.appendChild(root);body=root.querySelector('#lccBody');zoomEl=root.querySelector('#lccZoom');
  root.querySelector('#lccClose').addEventListener('click',close);
  root.querySelector('#lccBinder').addEventListener('click',()=>binder());
  root.querySelector('#lccPacks').addEventListener('click',()=>{if(packs.length)openPack(packs[0])});
  zoomEl.addEventListener('click',e=>{if(e.target===zoomEl)zoomEl.hidden=true});
  document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape'){e.stopPropagation();e.preventDefault();if(!zoomEl.hidden)zoomEl.hidden=true;else close()}},true);
}
function progress(){const o=owned(),n=SET_SIZE;root.querySelector('#lccProg').style.width=Math.min(100,o/n*100)+'%';root.querySelector('#lccCount').textContent=`${o}/${n}`;const pb=root.querySelector('#lccPacks');pb.hidden=!packs.length;pb.textContent=`Open pack (${packs.length})`}
function show(){ensure();root.hidden=false;progress()}
function close(){if(!root)return;root.hidden=true;zoomEl.hidden=true;const f=onClose;onClose=null;if(f)f()}
function zoom(c){zoomEl.innerHTML='';const d=cardEl(c,{tilt:true});d.addEventListener('click',()=>d.classList.toggle('facedown'));zoomEl.appendChild(d);
  const h=document.createElement('div');h.className='hint';h.textContent='Click the card to flip it · Esc to close';zoomEl.appendChild(h);zoomEl.hidden=false}

let filter='all';
function binder(){
  show();root.querySelector('#lccTitle').textContent='Binder';root.querySelector('#lccSub').textContent='LC-2030 DIE CARDS · REV A';
  root.querySelector('#lccBinder').hidden=true;
  const F=[['all','All'],['C','Common'],['U','Uncommon'],['H','Holo'],['W','Wafer-Scale'],['F','Full Art'],['S','Secret']];
  body.innerHTML=`<div class="lcc-filter">${F.map(([k,l])=>`<button type="button" data-f="${k}" class="${filter===k?'on':''}">${l}</button>`).join('')}</div><div class="lcc-grid" id="lccGrid"></div>`;
  body.querySelectorAll('[data-f]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.f;binder()}));
  const grid=body.querySelector('#lccGrid');
  CARDS.filter(c=>filter==='all'||c.r===filter).forEach(c=>{
    if(mem[c.id]>0){const d=cardEl(c,{tilt:true});if(mem[c.id]>1){const b=document.createElement('span');b.className='newb';b.style.background='#262a45';b.style.color='#ecebf5';b.textContent='×'+mem[c.id];d.appendChild(b)}
      d.tabIndex=0;d.addEventListener('click',()=>zoom(c));d.addEventListener('keydown',e=>{if(e.key==='Enter')zoom(c)});grid.appendChild(d)}
    else{const s=document.createElement('div');s.className='dslot'+(c.r==='S'?' secret':'');s.innerHTML=c.r==='S'?`<div><b>???</b>Unknown<br>${String(c.no).padStart(3,'0')}/${SET_SIZE}</div>`:`<div><b>${String(c.no).padStart(3,'0')}</b>${RAR[c.r].name}<br>not yet pulled</div>`;grid.appendChild(s)}});
  if(!owned())grid.insertAdjacentHTML('beforebegin','<p style="text-align:center;color:#8e8fab;margin:0 0 16px">Your binder is empty. Win any chip’s minigame to earn a pack.</p>');
  if(packs.length)grid.insertAdjacentHTML('beforebegin',`<p style="text-align:center;color:#ffcf4d;margin:0 0 16px;font:500 .8rem JetBrains Mono,monospace">You have ${packs.length} unopened pack${packs.length>1?'s':''}.</p>`);
}
/* ---------------- sound (synthesized, opt-out) ---------------- */
let AC=null,muted=false;try{muted=localStorage.getItem('lc-mute')==='1'}catch(e){}
function ac(){if(muted)return null;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f0,f1,dur,type,vol){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),a.currentTime+dur);
  g.gain.setValueAtTime(0,a.currentTime);g.gain.linearRampToValueAtTime(vol||.08,a.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+dur+.02)}
function noise(dur,freq,vol){const a=ac();if(!a)return;const n=a.sampleRate*dur|0,buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
  const src=a.createBufferSource();src.buffer=buf;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||2400;f.Q.value=.8;const g=a.createGain();g.gain.value=vol||.12;src.connect(f);f.connect(g);g.connect(a.destination);src.start()}
const SFX={hum:()=>tone(70,260,.5,'sawtooth',.03),rip:()=>{noise(.32,2600,.18);tone(900,120,.25,'square',.03)},zap:()=>tone(1200+Math.random()*1400,300,.06,'square',.018),
  route:()=>tone(300,900,.5,'triangle',.03),print:i=>tone(520*Math.pow(1.26,i),520*Math.pow(1.26,i),.18,'sine',.05),
  big:r=>{(r==='W'?[523,659,784,1047,1319]:[523,659,784]).forEach((f,i)=>setTimeout(()=>tone(f,f,.35,'triangle',.05),i*90))},flip:()=>tone(1400,700,.05,'triangle',.03)};

/* ---------------- pack opening ---------------- */
function openPack(tok){
  if(!tok||!packs.some(t=>t.id===tok.id)){binder();return}
  const chip=tok.chip,label=tok.label,color=tok.color;
  show();root.querySelector('#lccTitle').textContent='Pack earned';root.querySelector('#lccSub').textContent=(label||'')+' · 3 cards';root.querySelector('#lccBinder').hidden=false;
  const cards=makePack(chip);
  body.innerHTML=`<div class="pack-stage"><div class="pack" id="lccPack" role="button" tabindex="0" aria-label="Tear the pack open" style="--pc:${color||'#ffcf4d'}">
    <div class="strip"></div><div class="tearline"></div>
    <div class="pl"><span>LC-2030</span><div class="chipmark">LC</div><b>DIE<br>CARDS</b><span>Booster · 3 cards</span><em>${esc(label||'')}</em></div></div>
    <div class="pack-hint">Drag across the top to tear it open <span style="opacity:.6">(or click)</span></div>
    <button class="lcc-btn" id="lccMute" type="button" style="height:28px;font-size:.7rem">${muted?'Sound off':'Sound on'}</button></div>`;
  const pk=body.querySelector('#lccPack');let dragging=false,x0=0,moved=false,prog=0;
  body.querySelector('#lccMute').addEventListener('click',e=>{muted=!muted;try{localStorage.setItem('lc-mute',muted?'1':'0')}catch(_){}e.currentTarget.textContent=muted?'Sound off':'Sound on'});
  const setProg=p=>{prog=Math.max(prog,Math.min(1,p));pk.style.setProperty('--tp',(prog*100)+'%');pk.classList.toggle('charging',prog>.05);if(prog>.05&&!pk.dataset.h){pk.dataset.h=1;SFX.hum()}};
  pk.addEventListener('pointerdown',e=>{dragging=true;moved=false;x0=e.clientX;pk.setPointerCapture(e.pointerId)});
  pk.addEventListener('pointermove',e=>{if(!dragging)return;const r=pk.getBoundingClientRect();if(Math.abs(e.clientX-x0)>6)moved=true;if(moved)setProg((e.clientX-r.left)/r.width);if(prog>=.92)rip()});
  pk.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;if(!moved||prog>.45)rip()});
  pk.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();rip()}});pk.focus({preventScroll:true});
  let isNew=null;
  function commit(){if(isNew)return;const i=packs.findIndex(t=>t.id===tok.id);if(i<0){isNew=cards.map(()=>false);return}
    packs.splice(i,1);savePacks();isNew=cards.map(c=>!(mem[c.id]>0));cards.forEach(c=>{mem[c.id]=(mem[c.id]||0)+1});save();changed();progress()}
  function rip(){if(pk.dataset.t)return;pk.dataset.t=1;commit();
    if(reduce()){deal(cards,null,isNew);return}
    const anim=()=>{let p=prog;const t0=performance.now();(function f(n){p=Math.min(1,prog+(n-t0)/380);pk.style.setProperty('--tp',(p*100)+'%');pk.classList.add('charging');if(p<1)requestAnimationFrame(f);else burst()})(t0)};
    if(!pk.dataset.h)SFX.hum();anim();
  }
  function burst(){SFX.rip();const r=pk.getBoundingClientRect();
    // fly the torn strip
    const st=pk.querySelector('.strip'),sr=st.getBoundingClientRect(),fly=st.cloneNode();fly.className='strip flying';
    Object.assign(fly.style,{position:'fixed',left:sr.left+'px',top:sr.top+'px',width:sr.width+'px',height:sr.height+'px',zIndex:5});root.appendChild(fly);st.style.visibility='hidden';
    setTimeout(()=>fly.remove(),1200);
    pk.classList.add('ripped');
    FX.run(cards,{x:r.left+r.width/2,y:r.top+r.height*.13,w:r.width},()=>deal(cards,true,isNew),pk);
  }
}
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- FX: sparks, wires, beam, routing ---------------- */
const FX=(function(){
  let cv,g,raf=null,skip=null;
  const WIRE_COLS=['#e5484d','#2b2b36','#3b82f6','#f5c542','#34c77b','#e8e8ef','#f08a3c','#a66bff'];
  function canvas(){if(!cv){cv=document.createElement('canvas');cv.className='lcc-fx';root.appendChild(cv);g=cv.getContext('2d')}
    const d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;g.setTransform(d,0,0,d,0,0);cv.style.display='block'}
  function run(cards,mouth,done,pk){
    canvas();const best=cards.reduce((m,c)=>'CUHW'.indexOf(c.r)>'CUHW'.indexOf(m)?c.r:m,'C');
    const beamCol=best==='W'?'255,207,77':best==='H'?'215,123,255':'110,231,255';
    const W=innerWidth,H=innerHeight,t0=performance.now();let last=t0,phase=0;
    const sparks=[],wires=[],shards=[],rings=[{t:0}];let shake=best==='W'?14:best==='H'?6:0;
    // wires
    const NW=Math.min(28,Math.max(16,W/50|0));
    for(let i=0;i<NW;i++){const ang=-Math.PI/2+(Math.random()-.5)*2.4,sp=900+Math.random()*900,N=14,seg=8+Math.random()*5,col=WIRE_COLS[i%WIRE_COLS.length];
      const pts=[];for(let k=0;k<N;k++){const f=k/(N-1),vx=Math.cos(ang)*sp*f,vy=Math.sin(ang)*sp*f;pts.push({x:mouth.x+(Math.random()-.5)*mouth.w*.6,y:mouth.y,ox:0,oy:0,vx,vy})}
      pts.forEach(p=>{p.ox=p.x-p.vx/60;p.oy=p.y-p.vy/60});
      wires.push({pts,seg,col,ph:Math.random()*6.28,fq:6+Math.random()*8,curl:(Math.random()<.5?-1:1)*(500+Math.random()*900),delay:Math.random()*.25,anchor:pts[0].x})}
    if(best==='W')for(let i=0;i<70;i++){const a=-Math.PI/2+(Math.random()-.5)*2.8,s=300+Math.random()*900;shards.push({x:mouth.x,y:mouth.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:Math.random()*6.28,vr:(Math.random()-.5)*12,s:4+Math.random()*6,l:1})}
    // routes to card slots (computed later)
    let routes=null;
    function spark(x,y,n,col,spd){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=(spd||400)*(.3+Math.random());sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,l:1,c:col||'255,220,140'})}}
    // charge arcs across crimp teeth already happened via CSS; initial burst
    spark(mouth.x,mouth.y,60,beamCol,700);
    const slots=()=>[...root.querySelectorAll('.reveal .dcard')].map(d=>{const r=d.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,top:r.top,el:d}});
    function makeRoutes(){const S=slots();routes=[];S.forEach((s,i)=>{for(let lane=-1;lane<=1;lane++){const off=lane*9,midY=mouth.y+(s.top-mouth.y)*.45+lane*9,sx=s.x+off;
        const pts=[[mouth.x+off,mouth.y],[mouth.x+off,midY-Math.min(40,Math.abs(sx-mouth.x))],[mouth.x+off+Math.sign(sx-mouth.x)*Math.min(40,Math.abs(sx-mouth.x)),midY],[sx-Math.sign(sx-mouth.x)*Math.min(40,Math.abs(sx-mouth.x)),midY],[sx,midY+Math.min(40,Math.abs(sx-mouth.x))],[sx,s.top]];
        let L=0;for(let k=1;k<pts.length;k++)L+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);routes.push({pts,L,slot:i,d:i*.12+Math.abs(lane)*.05})}});SFX.route()}
    function along(r,len){let acc=0;for(let k=1;k<r.pts.length;k++){const a=r.pts[k-1],b=r.pts[k],sl=Math.hypot(b[0]-a[0],b[1]-a[1]);if(acc+sl>=len){const f=(len-acc)/sl;return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,k]}acc+=sl}return[r.pts[r.pts.length-1][0],r.pts[r.pts.length-1][1],r.pts.length]}
    let printed=0,dealt=false,finished=false;
    function finish(){if(finished)return;finished=true;cancelAnimationFrame(raf);raf=null;cv.style.display='none';root.removeEventListener('pointerdown',skip,true);
      root.querySelectorAll('.reveal .dcard.pending').forEach(d=>{d.classList.remove('pending');d.classList.add('printed')});pk&&pk.remove();}
    skip=e=>{if(e&&e.target&&e.target.closest&&e.target.closest('.lcc-top'))return;if(!dealt){dealt=true;done()}finish();SFX.big(best)};
    setTimeout(()=>root.addEventListener('pointerdown',skip,true),250);
    function frame(now){
      const dt=Math.min(.033,(now-last)/1000),t=(now-t0)/1000;last=now;
      g.setTransform(1,0,0,1,0,0);const d=Math.min(devicePixelRatio||1,2);g.clearRect(0,0,cv.width,cv.height);
      const sh=shake*Math.max(0,1-t*1.6);g.setTransform(d,0,0,d,(Math.random()-.5)*sh*d,(Math.random()-.5)*sh*d);
      // beam
      const bA=Math.max(0,Math.min(1,t*6))*Math.max(0,1-(t-1.2)*1.4);
      if(bA>0){const bg=g.createLinearGradient(0,mouth.y,0,0);bg.addColorStop(0,`rgba(${beamCol},${.55*bA})`);bg.addColorStop(1,`rgba(${beamCol},0)`);g.fillStyle=bg;
        g.beginPath();g.moveTo(mouth.x-mouth.w*.42,mouth.y);g.lineTo(mouth.x+mouth.w*.42,mouth.y);g.lineTo(mouth.x+mouth.w*1.4,0);g.lineTo(mouth.x-mouth.w*1.4,0);g.closePath();g.fill();
        const fl=g.createRadialGradient(mouth.x,mouth.y,0,mouth.x,mouth.y,mouth.w*1.2);fl.addColorStop(0,`rgba(255,255,255,${.9*bA})`);fl.addColorStop(.3,`rgba(${beamCol},${.5*bA})`);fl.addColorStop(1,`rgba(${beamCol},0)`);g.fillStyle=fl;g.fillRect(mouth.x-mouth.w*1.3,mouth.y-mouth.w*1.3,mouth.w*2.6,mouth.w*2.6)}
      // shockwave
      rings.forEach(r=>{r.t+=dt;const rr=r.t*1400,a=Math.max(0,1-r.t*1.8);if(a>0){g.strokeStyle=`rgba(${beamCol},${a})`;g.lineWidth=6*a+1;g.beginPath();g.arc(mouth.x,mouth.y,rr,0,6.283);g.stroke()}});
      // wires (verlet)
      const wireA=Math.max(0,1-Math.max(0,t-1.5)*1.6);
      if(wireA>0){g.lineCap='round';g.lineJoin='round';
        wires.forEach(w=>{if(t<w.delay)return;const P=w.pts,tt=t-w.delay;
          for(let k=1;k<P.length;k++){const p=P[k],vx=(p.x-p.ox)*.985,vy=(p.y-p.oy)*.985;p.ox=p.x;p.oy=p.y;
            const curl=(k/P.length)*w.curl*Math.sin(tt*w.fq+w.ph+k*.5);const prev=P[k-1],dx=p.x-prev.x,dy=p.y-prev.y,l=Math.hypot(dx,dy)||1;
            p.x+=vx+(-dy/l)*curl*dt*dt;p.y+=vy+(dx/l)*curl*dt*dt+1500*dt*dt;
            if(p.y>H-10){p.y=H-10;p.oy=p.y+vy*.4}if(p.x<5||p.x>W-5){p.x=Math.max(5,Math.min(W-5,p.x));p.ox=p.x+vx*.5}}
          P[0].x=w.anchor;P[0].y=mouth.y;P[0].ox=P[0].x;P[0].oy=P[0].y;
          for(let it=0;it<5;it++)for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,diff=(l-w.seg)/l;
            if(k===1){b.x-=dx*diff;b.y-=dy*diff}else{a.x+=dx*diff*.5;a.y+=dy*diff*.5;b.x-=dx*diff*.5;b.y-=dy*diff*.5}}
          const path=()=>{g.beginPath();g.moveTo(P[0].x,P[0].y);for(let k=1;k<P.length-1;k++){const mx=(P[k].x+P[k+1].x)/2,my=(P[k].y+P[k+1].y)/2;g.quadraticCurveTo(P[k].x,P[k].y,mx,my)}g.lineTo(P[P.length-1].x,P[P.length-1].y)};
          g.globalAlpha=wireA;g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=9;path();g.stroke();
          g.strokeStyle=w.col;g.lineWidth=7;path();g.stroke();
          g.strokeStyle='rgba(255,255,255,.32)';g.lineWidth=2;g.save();g.translate(-1.4,-1.4);path();g.stroke();g.restore();
          const tip=P[P.length-1],pre=P[P.length-3];g.strokeStyle='#e0a84a';g.lineWidth=3.2;g.shadowColor='#ffcf4d';g.shadowBlur=10;g.beginPath();g.moveTo(pre.x+(tip.x-pre.x)*.4,pre.y+(tip.y-pre.y)*.4);g.lineTo(tip.x,tip.y);g.stroke();g.shadowBlur=0;g.globalAlpha=1;
          if(Math.random()<.06&&t<1.6){spark(tip.x,tip.y,5,'255,220,140',260);if(Math.random()<.4)SFX.zap()}});}
      // shards (wafer-scale)
      shards.forEach(s=>{s.vy+=900*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;s.l-=dt*.45;if(s.l<=0)return;g.save();g.translate(s.x,s.y);g.rotate(s.r);g.globalAlpha=s.l;
        const hue=(s.r*60+now*.2)%360;g.fillStyle=`hsl(${hue},90%,70%)`;g.fillRect(-s.s/2,-s.s/2,s.s,s.s);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=.6;g.strokeRect(-s.s/2,-s.s/2,s.s,s.s);g.restore()});g.globalAlpha=1;
      // sparks
      g.globalCompositeOperation='lighter';
      for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt*1.8;if(p.l<=0){sparks.splice(i,1);continue}
        g.strokeStyle=`rgba(${p.c},${p.l})`;g.lineWidth=2;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.03,p.y-p.vy*.03);g.stroke()}
      g.globalCompositeOperation='source-over';
      // deal + routing
      if(t>1.25&&!dealt){dealt=true;done();requestAnimationFrame(()=>{makeRoutes()})}
      if(routes){const rt=t-1.32;g.lineCap='round';
        routes.forEach(r=>{const p=Math.max(0,Math.min(1,(rt-r.d)/.8)),e=1-Math.pow(1-p,3),len=r.L*e;if(p<=0)return;
          g.strokeStyle='rgba(224,168,74,.9)';g.lineWidth=3;g.shadowColor='rgba(255,207,77,.9)';g.shadowBlur=8;g.beginPath();g.moveTo(r.pts[0][0],r.pts[0][1]);
          const [hx,hy,k]=along(r,len);for(let j=1;j<k;j++)g.lineTo(r.pts[j][0],r.pts[j][1]);g.lineTo(hx,hy);g.stroke();g.shadowBlur=0;
          if(p<1){g.fillStyle='#fff';g.shadowColor=`rgb(${beamCol})`;g.shadowBlur=16;g.beginPath();g.arc(hx,hy,3.5,0,6.283);g.fill();g.shadowBlur=0}
          else{const q=((now/600)+r.d)%1,[px,py]=along(r,r.L*q);g.fillStyle=`rgba(${beamCol},.9)`;g.beginPath();g.arc(px,py,2.6,0,6.283);g.fill()}});
        const S=root.querySelectorAll('.reveal .dcard');
        S.forEach((dEl,i)=>{const lanes=routes.filter(r=>r.slot===i);if(lanes.every(r=>rt-r.d>=.8)&&dEl.classList.contains('pending')){dEl.classList.remove('pending');dEl.classList.add('printing');SFX.print(i);printed++;
          const rr=dEl.getBoundingClientRect();spark(rr.left+rr.width/2,rr.top,26,beamCol,380);setTimeout(()=>{dEl.classList.remove('printing');dEl.classList.add('printed')},700)}});
        if(printed===S.length&&S.length&&rt>1.9){SFX.big(best);finish();return}}
      if(t>6){finish();return}
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
  }
  return{run};
})();

function deal(cards,fx,isNewIn){
  body.innerHTML=`<div class="pack-stage"><div class="reveal" id="lccReveal"></div><div class="pack-hint" id="lccHint">Click each card to flip it</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="lcc-btn" id="lccAll" type="button">Flip all</button><button class="lcc-btn pri" id="lccDone" type="button" hidden>View binder →</button></div></div>`;
  const rv=body.querySelector('#lccReveal');let flipped=0;
  const isNew=isNewIn||cards.map(()=>false);
  cards.forEach((c,i)=>{const d=cardEl(c,{facedown:true,tilt:true});if(fx)d.classList.add('pending','nodeal');d.tabIndex=0;d.setAttribute('aria-label','Face-down card. Press to flip.');
    const flip=()=>{if(!d.classList.contains('facedown')||d.classList.contains('pending'))return;d.classList.remove('facedown');d.setAttribute('aria-label',`${c.n}, ${RAR[c.r].name}`);SFX.flip();
      if('HWFS'.includes(c.r)){d.classList.add('pop');SFX.big(c.r==='S'||c.r==='F'?'W':c.r)}
      const b=document.createElement('span');b.className='newb'+(isNew[i]?'':' dup');b.textContent=isNew[i]?'NEW':'DUPE';d.appendChild(b);
      flipped++;if(flipped===cards.length)finish()};
    d.addEventListener('click',flip);d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});rv.appendChild(d)});
  body.querySelector('#lccAll').addEventListener('click',()=>rv.querySelectorAll('.dcard.facedown').forEach((d,i)=>setTimeout(()=>{d.classList.remove('pending');d.click()},i*220)));
  function finish(){progress();
    const nn=isNew.filter(Boolean).length;body.querySelector('#lccHint').textContent=nn?`${nn} new card${nn>1?'s':''} for your binder.`:'All duplicates this time.';
    body.querySelector('#lccAll').hidden=true;const done=body.querySelector('#lccDone');done.hidden=false;done.textContent=packs.length?`Next pack (${packs.length}) →`:'View binder →';done.addEventListener('click',()=>packs.length?openPack(packs[0]):binder());done.focus({preventScroll:true})}
}

window.LCCards={CARDS,owned,total:SET_SIZE,grant,pending:()=>packs.length,openNext:()=>{if(packs.length)openPack(packs[0]);else binder()},binder,close,isOpen:()=>!!root&&!root.hidden,onChange:f=>listeners.push(f),
  setOnClose:f=>{onClose=f},cardEl};
})();
