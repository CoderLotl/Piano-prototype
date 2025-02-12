let realArray;
let imgArray;
let setArrays_btn;
let durationSlider;
let duration = 1.0;
let activeOscillators = [];
let realArrayContent = [];
let imgArrayContent = [];
const audioCtx = new (window.AudioContext || window.webkitAudioContext);
let customWave = null;
let notes = 'ABCDEFGH';

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
    durationSlider = document.getElementById('duration_slider');

    durationSlider.value = duration;
    realArray.value = '';
    imgArray.value = '';

    SetAllSliders();

    setArrays_btn.addEventListener('click', SetButton);

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
    let realText = realArray.value.match(/\d+(\.\d+)?/g).map(Number);
    let imgText = imgArray.value.match(/\d+(\.\d+)?/g).map(Number);

    if(realText.length == imgText.length && realText.length > 0)
    {
        customWave = audioCtx.createPeriodicWave(
            new Float32Array(realText),
            new Float32Array(imgText),
            { disableNormalization: true }
        );
        let indicator = document.getElementById('wave_indicator');
        indicator.classList.remove('bg-red-400');
        indicator.classList.add('bg-green-400');
    }
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
    
    const gainNode = audioCtx.createGain();

    // Connect the nodes: oscillator → gain → speakers
    oscillator.connect(gainNode);
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