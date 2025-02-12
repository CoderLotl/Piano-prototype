let realArray;
let imgArray;
let setArrays_btn;
let unsetArrays_btn;
let durationSlider;
let duration = 1.0;
let activeOscillators = [];
let realArrayContent = [];
let imgArrayContent = [];
const audioCtx = new (window.AudioContext || window.webkitAudioContext);
let customWave = null;
let notes = 'ABCDEFGH';
let canvas;
let ctx;

let noteFrequencies =
{
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'F4': 349.23,
    'G4': 392.00,
    'A4': 440.00,
    'B4': 493.88,
    'C5': 523.25
};

const noteValues =
{
    'A': 'C4',
    'B': 'D4',
    'C': 'E4',
    'D': 'F4',
    'E': 'G4',
    'F': 'A4',
    'G': 'B4',
    'H': 'C5'
}

document.addEventListener('DOMContentLoaded', ()=>
{
    realArray = document.getElementById('real_array');
    imgArray = document.getElementById('img_array');
    setArrays_btn = document.getElementById('set_arrays_btn');
    unsetArrays_btn = document.getElementById('unset_arrays_btn');
    durationSlider = document.getElementById('duration_slider');
    canvas = document.getElementById('wave_form');
    ctx = canvas.getContext("2d");

    durationSlider.value = duration;
    realArray.value = '';
    imgArray.value = '';

    SetAllSliders();

    setArrays_btn.addEventListener('click', SetButton);
    unsetArrays_btn.addEventListener('click', UnsetButton);

    durationSlider.addEventListener('input', (e)=>
    {
        duration = parseFloat(e.target.value);
    });    

    document.getElementById('piano').addEventListener('click', function (e)
    {
        if(customWave !== null && (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'span'))
        {
            let element;

            if(e.target.tagName.toLowerCase() === 'span')
            {
                element = e.target.parentElement;
            }
            else
            {
                element = e.target;
            }

            let note = element.getAttribute('data-note');
            let frequency = noteFrequencies[note];            
            if(frequency)
            {
                playNote(frequency, 0, duration);
            }
        }
    });
});

function SetButton()
{
    if(realArray.value != null && realArray.value != '' && imgArray.value != null && imgArray.value != '')
    {
        let realText = realArray.value.match(/\d+(\.\d+)?/g).map(Number);
        let imgText = imgArray.value.match(/\d+(\.\d+)?/g).map(Number);
    
        if(realText.length == imgText.length && realText.length > 1)
        {
            let realWave = new Float32Array(realText);
            let imgWave = new Float32Array(imgText);
            customWave = audioCtx.createPeriodicWave(realWave, imgWave, { disableNormalization: true });
            let indicator = document.getElementById('wave_indicator');
            indicator.classList.remove('bg-red-400');
            indicator.classList.add('bg-green-400');
    
            drawStaticWave(realWave, imgWave);
        }
    }
}

function UnsetButton()
{
    customWave = null;
    let indicator = document.getElementById('wave_indicator');
    indicator.classList.add('bg-red-400');
    indicator.classList.remove('bg-green-400');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function SetSlider(slider, span, note)
{       
    slider.addEventListener('input', (e)=>
    {        
        span.textContent = e.target.value;                
        noteFrequencies[note] = e.target.value;        
    });
}

function SetAllSliders()
{
    for(let i = 0; i < notes.length; i++)
    {
        let note = notes[i].toLowerCase();
        let slider = document.getElementById(`${note}_freq`);
        let freq_span = document.getElementById(`${note}_freq_value`);
        let realNote = noteValues[note.toUpperCase()];        
        let realNoteValue = noteFrequencies[realNote];
        // frequencySliders[`${note}_freq_slider`] = slider;

        SetSlider(slider, freq_span, realNote);
        slider.value = realNoteValue;
        freq_span.textContent = realNoteValue;        
    }
}

function playNote(frequency, time = 0.6, duration = 0.6)
{        
    if (audioCtx.state === 'suspended')
    {
        audioCtx.resume();
    }
    
    const oscillator = audioCtx.createOscillator();
    const analyser = audioCtx.createAnalyser();
    const gainNode = audioCtx.createGain();

    // Connect the nodes: oscillator → gain → speakers
    oscillator.connect(gainNode);
    oscillator.connect(analyser);
    gainNode.connect(audioCtx.destination);

    oscillator.setPeriodicWave(customWave);
    
    oscillator.frequency.value = frequency;

    // Create a simple envelope:
    // - Start the gain at 0,
    // - Quickly ramp up to full volume,
    // - Then exponentially ramp down over 1 second.
    const now = audioCtx.currentTime + time;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Start and then stop the oscillator after 1 second.
    oscillator.start(now);    
    oscillator.stop(now + duration);

    activeOscillators.push(oscillator);
    oscillator.onended = () =>
    {
        activeOscillators = activeOscillators.filter(o => o !== oscillator);
    };
}

function drawStaticWave(real, imag)
{
    // We'll use the canvas width as the number of sample points.
    const sampleCount = canvas.width;
    const waveform = new Float32Array(sampleCount);
    const twoPi = 2 * Math.PI;
    const harmonics = real.length; // Both arrays have the same length

    // Calculate the waveform over one full period (0 to 2π)
    for(let i = 0; i < sampleCount; i++)
    {
        let t = (i / sampleCount) * twoPi;
        let value = 0;

        // For n=0, use the DC offset (real[0]). For higher harmonics, add cosine and sine terms.
        for(let n = 0; n < harmonics; n++)
        {
            if(n === 0)
            {
                value += real[0];  // DC component
            }
            else
            {
                value += real[n] * Math.cos(n * t) + imag[n] * Math.sin(n * t);
            }
        }
        waveform[i] = value;
    }

    // Optional: Normalize the waveform so that it fits nicely on the canvas.
    // Find the max absolute value:
    let maxVal = Math.max(...waveform.map(Math.abs));
    if (maxVal === 0) { maxVal = 1; } // prevent division by zero

    // Draw the waveform on the canvas:
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    for (let i = 0; i < sampleCount; i++) {
        let x = (i / sampleCount) * canvas.width;
        // Scale the value to canvas height (centered vertically):
        let y = canvas.height / 2 - (waveform[i] / maxVal) * (canvas.height / 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}