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

// Filter control addresses (copied from the params list in the console)
const BYPASS    = "/MOOG_VCF__Voltage_Controlled_Filter_/0x00/Bypass";
const CUTOFF    = "/MOOG_VCF__Voltage_Controlled_Filter_/Corner_Frequency";
const RESONANCE = "/MOOG_VCF__Voltage_Controlled_Filter_/Corner_Resonance";
let minCutoff = 0;
let maxCutoff = 0;

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

        // Filter setup: make sure it is active, and add some resonance
        dspNode.setParamValue(BYPASS, 0);
        const [minRes, maxRes] = getMinMaxParam(RESONANCE);
        dspNode.setParamValue(RESONANCE, minRes + 0.6 * (maxRes - minRes));

        // Read the cutoff range once, so we don't look it up on every sensor update
        [minCutoff, maxCutoff] = getMinMaxParam(CUTOFF);
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
    // playAudio()
}

function rotationChange(rotx, roty, rotz) {
    // 0 = phone flat, 1 = tilted 60 degrees or more
    const amount = Math.min(Math.abs(rotx), 60) / 60;
    playAudio(amount);
    statusLabels[2].html("tilt: " + Math.round(Math.abs(rotx)) + "  amount: " + amount.toFixed(2));
}

function mousePressed() {
    audioContext.resume();                
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

function playAudio(amount) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }
    // amount 0 = filter closed (dark, muffled), amount 1 = filter open (bright)
    const cutoff = minCutoff + amount * (maxCutoff - minCutoff);
    dspNode.setParamValue(CUTOFF, cutoff);
}

//==========================================================================================
// END
//==========================================================================================