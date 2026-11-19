    //==========================================================================================
    // AUDIO SETUP
    //------------------------------------------------------------------------------------------
    //
    //------------------------------------------------------------------------------------------
    // Edit just where you're asked to!
    //------------------------------------------------------------------------------------------
    //
    //==========================================================================================
    let dspNode = null;
    let dspNodeParams = null;
    let bellNode = null;
    let bellNodeParams = null;
    let jsonParams = null;

    // Change here to ("tuono") depending on your wasm file name
    const dspName = "torpedo";
    const bellFile = "bells";
    const instance = new FaustWasm2ScriptProcessor(dspName);
    const bellInstance = new FaustWasm2ScriptProcessor(bellFile);
    // output to window or npm package module
    if (typeof module === "undefined") {
        window[dspName] = instance;
        window[bellFile] = bellInstance;
    } else {
        const exp = {};
        exp[dspName] = instance;
        exp[bellFile] = bellInstance;
        module.exports = exp;
    }

    // The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
    torpedo.createDSP(audioContext, 1024)
        .then(node => {
            dspNode = node;
            dspNode.connect(audioContext.destination);
            console.log('params: ', dspNode.getParams());
            const jsonString = dspNode.getJSON();
            jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
            dspNodeParams = jsonParams
            // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
            // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
            // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
            // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
        });

    bells.createDSP(audioContext, 1024)
        .then(node => {
            bellNode = node;
            bellNode.connect(audioContext.destination);
            console.log('params: ', bellNode.getParams());
            const jsonString = bellNode.getJSON();
            jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
            bellNodeParams = jsonParams
            // const exampleMinMaxParam = findByAddress(bellNodeParams, "/thunder/rumble");
            // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
            // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
            // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
        });


    //==========================================================================================
    // INTERACTIONS
    //------------------------------------------------------------------------------------------
    //
    //------------------------------------------------------------------------------------------
    // Edit the next functions to create interactions
    // Decide which parameters you're using and then use playAudio to play the Audio
    //------------------------------------------------------------------------------------------
    //
    //==========================================================================================

    function accelerationChange(accx, accy, accz) {
        
    }

     
    function rotationChange(rotx, roty, rotz) {
        const bottleUpright = rotx > 60 && rotx < 120; 
        if (bottleUpright && pressure>25) {
            //playAudio();
            playAudio()
        }
    }

    function mousePressed() {
        
        playBubbles();
        // Use this for debugging from the desktop!
    }

    function deviceMoved() {
        movetimer = millis();
        statusLabels[2].style("color", "pink");
        console.log(threshVals);
        playBubbles();
    }

    function deviceTurned() {
        threshVals[1] = turnAxis;
        
    }
    let pressure = 0;
    let lastShakeTime = 0;
    const SHAKE_COOLDOWN = 30;   // milliseconds between bubble sounds

    function deviceShaken() {
        const now = millis();
        if (now - lastShakeTime < SHAKE_COOLDOWN) {
            return;                // ignore shakes that come too fast
        }
        lastShakeTime = now;

        shaketimer = now;
        statusLabels[0].style("color", "pink");
        pressure = pressure + 1;
        bellNode.setParamValue("/bubble/bubble/freq", pressure*100);
        
    }

    function getMinMaxParam(address) {
        const exampleMinMaxParam = findByAddress(dspNodeParams, address);
        // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
        return [exampleMinValue, exampleMaxValue]
    }

    //==========================================================================================
    // AUDIO INTERACTION
    //------------------------------------------------------------------------------------------
    //
    //------------------------------------------------------------------------------------------
    // Edit here to define your audio controls 
    //------------------------------------------------------------------------------------------
    //
    //==========================================================================================

    function playAudio() {
        if (!dspNode) {
            return;
        }
        if (audioContext.state === 'suspended') {
            return;
        }
        // Edit here the addresses ("/thunder/rumble") depending on your WASM controls (you can see 
        // them printed on the console of your browser when you load the page)
        // For example if you change to a bell sound, here you could use "/churchBell/gate" instead of
        // "/thunder/rumble".
        dspNode.setParamValue("/torpedo/trigger", 1)
        setTimeout(() => { dspNode.setParamValue("/torpedo/trigger", 0) }, 100);
    }

    function playBubbles() {
        if (!bellNode || audioContext.state === 'suspended') {
        return;
        }
            bellNode.setParamValue("/englishBell/gate", 1);
            setTimeout(() => { bellNode.setParamValue("/englishBell/gate", 0) }, 100);
        }

    //==========================================================================================
    // END
    //==========================================================================================