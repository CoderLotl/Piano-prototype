document.addEventListener('DOMContentLoaded', () => {
    // Create the AudioContext (handle vendor prefixes)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const validChars = "ABCDEFGH";
    let tempo = 0.5;
    let duration = 1.0;
    const baseDelay = 0.25;
    
    const keysInput = document.getElementById('inputText');
    const tempoSlider = document.getElementById('tempo_slider');
    const durationSlider = document.getElementById('duration_slider');

    tempoSlider.value = tempo;
    durationSlider.value = duration;

    // Define frequencies for some musical notes.
    const noteFrequencies =
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
    
    /**
     * 'time' is the time in seconds when the note should start playing. The first note always starts at 0.
     */    
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

        // Set oscillator properties: type and frequency
        oscillator.type = 'sine';
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
        oscillator.stop(now + duration - 0.1);
    }

    function playString()
    {
        const text = document.getElementById('inputText').value.toUpperCase();       

        if(tempo == 0)
        {
            return;
        }

        let delayIndex = 0;
        let interval = baseDelay / tempo;
        let noteDuration = 1 * duration;
  
        for(let char of text)
        {
            if(validChars.includes(char))
            {
                let note = noteValues[char];
                playNote(noteFrequencies[note], delayIndex * interval, noteDuration);                
                delayIndex++;
            }
        }
    }

    tempoSlider.addEventListener('input', (e)=>
    {
        tempo = parseFloat(e.target.value);
    });

    durationSlider.addEventListener('input', (e)=>
    {
        duration = parseFloat(e.target.value);
    });

    // Add an event listener to the piano container to capture button clicks.
    document.getElementById('piano').addEventListener('click', function (e)
    {
        if(e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'span')
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

            const note = element.getAttribute('data-note');
            const frequency = noteFrequencies[note];
            if(frequency)
            {
                playNote(frequency, 0);
            }

            const noteValue = element.getAttribute('data-char');
            keysInput.value += noteValue;
        }
    });

    document.getElementById('playButton').addEventListener('click', playString);

    document.getElementById('inputText').addEventListener('input', (e) =>
    {
        e.target.style.height = "auto"; // Reset to auto to shrink if needed
        e.target.style.height = e.target.scrollHeight + "px"; // Expand to fit content
    });
});