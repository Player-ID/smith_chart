function calculateResistanceCircle(value, center, unitRadius) {
    var cx = center + unitRadius * value / (value + 1);
    var cy = center;
    var r = Math.abs(unitRadius / (value + 1));

    return {
        cx: cx,
        cy: cy,
        r: r
    };
}

function calculateReactanceCircle(value, center, unitRadius) {
    var cx = center + unitRadius;
    var cy = center - unitRadius / value;
    var r = Math.abs(unitRadius / value);

    return {
        cx: cx,
        cy: cy,
        r: r
    };
}

function generateMaskForResistance(defs, clipStart, clipStop, center, unitRadius) {
    var maskId = "resistance_" + clipStart + "_" + clipStop;
    var mask = defs.append("mask")
        .attr("id", maskId);

    if (typeof clipStart === "undefined") {
        // No starting clip means full canvas as drawable area
        mask.append("circle")
            .attr("cx", center)
            .attr("cy", center)
            .attr("r", unitRadius + 5) // Add any value to account for thickness
            .attr("fill", "white");
    } else {
        // Drawable area is +/- reactance circles corresponding to clipStart
        var posBase = calculateReactanceCircle(clipStart, center, unitRadius);
        var negBase = calculateReactanceCircle(-clipStart, center, unitRadius);
        mask.append("circle")
            .attr("cx", posBase.cx)
            .attr("cy", posBase.cy)
            .attr("r", posBase.r)
            .attr("fill", "white");
        mask.append("circle")
            .attr("cx", negBase.cx)
            .attr("cy", negBase.cy)
            .attr("r", negBase.r)
            .attr("fill", "white");
    }

    if (typeof clipStop !== "undefined") {
        // Erase mask using corresponding reactance circles
        var posClip = calculateReactanceCircle(clipStop, center, unitRadius);
        var negClip = calculateReactanceCircle(-clipStop, center, unitRadius);
        mask.append("circle")
            .attr("cx", posClip.cx)
            .attr("cy", posClip.cy)
            .attr("r", posClip.r)
            .attr("fill", "black");
        mask.append("circle")
            .attr("cx", negClip.cx)
            .attr("cy", negClip.cy)
            .attr("r", negClip.r)
            .attr("fill", "black");
    }

    return maskId;
}

function generateMaskForReactance(defs, clipStart, clipStop, center, unitRadius) {
    var maskId = "reactance_" + clipStart + "_" + clipStop;
    var mask = defs.append("mask")
        .attr("id", maskId);

    clipStart = (typeof clipStart === "undefined") ? 0 : clipStart;
    var base = calculateResistanceCircle(clipStart, center, unitRadius);
    mask.append("circle")
        .attr("cx", base.cx)
        .attr("cy", base.cy)
        .attr("r", base.r) // Add any value to account for thickness
        .attr("fill", "white");

    if (typeof clipStop !== "undefined") {
        var clip = calculateResistanceCircle(clipStop, center, unitRadius);
        mask.append("circle")
            .attr("cx", clip.cx)
            .attr("cy", clip.cy)
            .attr("r", clip.r) // Add any value to account for thickness
            .attr("fill", "black");
    }

    return maskId;
}

var chartDimensions = {
    canvasWidth: 1002,
    center: 501,
    unitRadius: 500
};

var chart = d3.select("#chart-area")
    .append("svg")
    .attr("width", chartDimensions.canvasWidth)
    .attr("height", chartDimensions.canvasWidth);

chart.append("defs")
    .attr("id", "guideline-masks");
var guidelines = chart.append("g")
    .attr("id", "guidelines");
var resistanceGuidelines = guidelines.append("g")
    .attr("id", "guidelines-resistance");
var reactanceGuidelines = guidelines.append("g")
    .attr("id", "guidelines-reactance");

guidelineData.resistances.lines.forEach(function (clippingGroup) {
    var defs = d3.select("#guideline-masks");
    var maskId = "url(#" + generateMaskForResistance(
        defs,
        clippingGroup.clipStart,
        clippingGroup.clipStop,
        chartDimensions.center,
        chartDimensions.unitRadius
    ) + ")";

    resistanceGuidelines.selectAll(".guidelines")
        .data(clippingGroup.values.map(function (value) {
            return calculateResistanceCircle(
                value,
                chartDimensions.center,
                chartDimensions.unitRadius
            );
        }))
        .enter().append("circle")
        .attr("cx", function (c) { return c.cx; })
        .attr("cy", function (c) { return c.cy; })
        .attr("r", function (c) { return c.r; })
        .attr("mask", maskId)
        .attr("stroke", "black")
        .attr("fill", "none");
});

reactanceGuidelines.append("line")
    .attr("x1", chartDimensions.center - chartDimensions.unitRadius)
    .attr("y1", chartDimensions.center)
    .attr("x2", chartDimensions.center + chartDimensions.unitRadius)
    .attr("y2", chartDimensions.center)
    .attr("stroke", "black")

guidelineData.reactances.lines.forEach(function (clippingGroup) {
    var defs = d3.select("#guideline-masks");
    var maskId = "url(#" + generateMaskForReactance(
        defs,
        clippingGroup.clipStart,
        clippingGroup.clipStop,
        chartDimensions.center,
        chartDimensions.unitRadius
    ) + ")";

    var negativeValues = clippingGroup.values.map(function (value) {
        return -value;
    });
    var data = clippingGroup.values.concat(negativeValues);
    reactanceGuidelines.selectAll(".guidelines")
        .data(data.map(function (value) {
            return calculateReactanceCircle(
                value,
                chartDimensions.center,
                chartDimensions.unitRadius
            );
        }))
        .enter().append("circle")
        .attr("cx", function (c) { return c.cx; })
        .attr("cy", function (c) { return c.cy; })
        .attr("r", function (c) { return c.r; })
        .attr("mask", maskId)
        .attr("stroke", "black")
        .attr("fill", "none");
});
