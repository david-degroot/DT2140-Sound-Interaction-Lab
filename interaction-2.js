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
let jsonParams = null;

// Control addresses (copied from the params list in the console)
const PRESSURE = "/brass/brass/blower/pressure";
const CUTOFF   = "/brass/MOOG_VCF__Voltage_Controlled_Filter_/Corner_Frequency";
const BYPASS   = "/brass/MOOG_VCF__Voltage_Controlled_Filter_/0x00/Bypass";

// Change here to ("tuono") depending on your wasm file name
const dspName = "brass";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
brass.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams

        // start blowing right away: 60% pressure, not the max
        const [minP, maxP] = getMinMaxParam(PRESSURE);
        dspNode.setParamValue(PRESSURE, minP + 0.6 * (maxP - minP));

        // make sure the filter is active
        dspNode.setParamValue(BYPASS, 0);
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
    if (!dspNode) {
        return;
    }
    const tilt = Math.min(Math.abs(rotx), 90);
    const amount = tilt / 90;              // 0 = flat, 1 = vertical

    // flat = low frequency (muffled), upright = high frequency (open)
    const [minFreq, maxFreq] = getMinMaxParam(CUTOFF);
    const freq = minFreq + amount * (maxFreq - minFreq);
    dspNode.setParamValue(CUTOFF, freq);
}

function mousePressed() {
    //audioContext.resume();      // phones need one tap before any sound plays
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
}

function getMinMaxParam(address) {
    const param = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    return getParamMinMax(param);
}
//==========================================================================================
// AUDIO INTERACTION
//==========================================================================================

function playAudio() {
    // not used: the brass plays continuously and tilt controls the filter
}

//==========================================================================================
// END
//==========================================================================================