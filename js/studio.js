import { StorageManager } from "./StorageManager.js";

let realArray;
let imgArray;
let duration = 1.0;
let activeOscillators = [];
let realArrayContent = [];
let imgArrayContent = [];
const audioCtx = new (window.AudioContext || window.webkitAudioContext);
let customWave = null;
let notes = 'ABCDEFGH';
let canvas;
let ctx;
let storageManager = new StorageManager();
let realWaveArray;
let imgWaveArray;
let waves = [];

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
    let durationSlider = document.getElementById('duration_slider');

    document.getElementById('save_name').value = '';
    realArray = document.getElementById('real_array');
    imgArray = document.getElementById('img_array');        
    canvas = document.getElementById('wave_form');
    ctx = canvas.getContext("2d");

    durationSlider.value = duration;
    realArray.value = '';
    imgArray.value = '';

    SetAllSliders();
    AutoLoadWaves();

    document.getElementById('set_arrays_btn').addEventListener('click', SetButton);
    document.getElementById('unset_arrays_btn').addEventListener('click', UnsetButton);
    document.getElementById('saveWave_btn').addEventListener('click', SaveButton);
    document.getElementById('loadWave_btn').addEventListener('click', LoadButton);

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
            realWaveArray = new Float32Array(realText);
            imgWaveArray = new Float32Array(imgText);
            customWave = audioCtx.createPeriodicWave(realWaveArray, imgWaveArray, { disableNormalization: true });
            let indicator = document.getElementById('wave_indicator');
            indicator.classList.remove('bg-red-400');
            indicator.classList.add('bg-green-400');
    
            drawStaticWave(realWaveArray, imgWaveArray);
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

function SaveButton()
{
    let waveName = document.getElementById('save_name').value;
    if(waveName.length > 1 && customWave != null)
    {
        let sameWave = false;
        let newWave = 
        {
            name: waveName,
            realArray: Array.from(realWaveArray),
            imgArray: Array.from(imgWaveArray),
            C4: noteFrequencies['C4'],
            D4: noteFrequencies['D4'],
            E4: noteFrequencies['E4'],
            F4: noteFrequencies['F4'],
            G4: noteFrequencies['G4'],
            A4: noteFrequencies['A4'],
            B4: noteFrequencies['B4'],
            C5: noteFrequencies['C5']
        }        

        for(let i = 0; i < waves.length; i++)
        {
            if(waves[i].name == waveName)
            {
                waves[i] = newWave;
                sameWave = true;
                break;
            }
        }

        if(!sameWave)
        {
            waves.push(newWave);
            let waveSelect = document.getElementById('load_wave_list');
            let opt = document.createElement('option');
            opt.textContent = newWave.name;
            opt.value = newWave.name;
            waveSelect.appendChild(opt);
        }
        
        let waves_json = JSON.stringify(waves);
        storageManager.WriteLS('waves', waves_json);
        document.getElementById('save_name').value = '';
    }
}

function LoadButton()
{
    let waveSelect = document.getElementById('load_wave_list');
    if(waveSelect.value != '')
    {
        let selectedWaveName = waveSelect.value;
        let selectedWave = null;
        for(let i = 0; i < waves.length; i++)
        {
            if(waves[i].name == selectedWaveName)
            {
                selectedWave = waves[i];
                break;
            }
        }

        if(selectedWave != null)
        {
            realWaveArray = selectedWave.realArray;
            imgWaveArray = selectedWave.imgArray;
            customWave = audioCtx.createPeriodicWave(realWaveArray, imgWaveArray, { disableNormalization: true });

            Object.keys(noteFrequencies).forEach(key =>
            {
                if(selectedWave.hasOwnProperty(key))
                {
                    let noteKey = key;
                    let noteValue = selectedWave[key];
                    noteFrequencies[key] = selectedWave[key];
                    let note = Object.entries(noteValues).find(([key, value]) => value === noteKey)?.[0].toLowerCase();
                    document.getElementById(`${note}_freq`).value = noteValue;
                    document.getElementById(`${note}_freq_value`).textContent = noteValue;
                }
            });

            let indicator = document.getElementById('wave_indicator');

            for(let i = 0; i < realWaveArray.length; i++)
            {
                realArray.value += `${realWaveArray[i]}`;
                imgArray.value += `${imgWaveArray[i]}`;
                if(i < realWaveArray.length -1)
                {
                    realArray.value += ' ';
                    imgArray.value += ' ';
                }
            }

            indicator.classList.remove('bg-red-400');
            indicator.classList.add('bg-green-400');

            drawStaticWave(realWaveArray, imgWaveArray);
        }
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

    oscillator.connect(gainNode);
    oscillator.connect(analyser);
    gainNode.connect(audioCtx.destination);

    oscillator.setPeriodicWave(customWave);
    
    oscillator.frequency.value = frequency;

    const now = audioCtx.currentTime + time;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
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

function AutoLoadWaves()
{
    let storedWaves = storageManager.ReadLS('waves');
    if(storedWaves != null)
    {
        waves = JSON.parse(storedWaves);
        waves.forEach(wave =>
        {
            wave.realArray = new Float32Array(wave.realArray);
            wave.imgArray = new Float32Array(wave.imgArray);
        });

        let waveSelect = document.getElementById('load_wave_list');
        
        for(let i = 0; i < waves.length; i++)
        {
            let opt = document.createElement('option');
            opt.textContent = waves[i].name;
            opt.value = waves[i].name;
            waveSelect.appendChild(opt);
        }

        waveSelect.value = '';
    }
}