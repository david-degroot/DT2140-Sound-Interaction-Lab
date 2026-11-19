//==========================================================================================
// AUDIO SETUP
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

const dspName = "brass";
const instance = new FaustWasm2ScriptProcessor(dspName);

if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

const BYPASS    = "/MOOG_VCF__Voltage_Controlled_Filter_/0x00/Bypass";
const CUTOFF    = "/MOOG_VCF__Voltage_Controlled_Filter_/Corner_Frequency";
const RESONANCE = "/MOOG_VCF__Voltage_Controlled_Filter_/Corner_Resonance";
const PRESSURE  = "/brass/blower/pressure";

brass.createDSP(audioContext, 2048)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        jsonParams = JSON.parse(dspNode.getJSON())["ui"][0]["items"];
        dspNodeParams = jsonParams;

        // make sure the filter is active, not bypassed
        dspNode.setParamValue(BYPASS, 0);

        // some resonance makes the sweep easy to hear (60% of its range)
        const [minRes, maxRes] = getMinMaxParam(RESONANCE);
        dspNode.setParamValue(RESONANCE, minRes + 0.6 * (maxRes - minRes));

        // start blowing, only if the brass pressure control exists
        if (findByAddress(dspNodeParams, PRESSURE)) {
            const [minP, maxP] = getMinMaxParam(PRESSURE);
            dspNode.setParamValue(PRESSURE, minP + 0.6 * (maxP - minP));
        }
    });

//==========================================================================================
// INTERACTIONS
//==========================================================================================

function accelerationChange(accx, accy, accz) {
}

function rotationChange(rotx, roty, rotz) {
    if (!dspNode) {
        return;
    }
    const tilt = Math.min(Math.abs(rotx), 60);
    const amount = tilt / 60;                 // 0 = flat, 1 = tilted 60° or more

    // filter closed (dark) when flat, open (bright) when tilted
    const [minCut, maxCut] = getMinMaxParam(CUTOFF);
    dspNode.setParamValue(CUTOFF, minCut + amount * (maxCut - minCut));

    statusLabels[2].html("tilt: " + Math.round(tilt) + "  amount: " + amount.toFixed(2));
}

function mousePressed() {
    audioContext.resume();      // phones need one tap before any sound plays
}

function deviceMoved() {
    movetimer = millis();
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
}

function getMinMaxParam(address) {
    const param = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    return getParamMinMax(param);
}

//==========================================================================================
// END
//==========================================================================================