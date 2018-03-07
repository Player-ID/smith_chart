function calculateResistanceCircle(value, center, unitRadius) {
    if (value < 0) {
        throw "Resistance value cannot be negative!";
    } else if (value == Infinity) {
        return {
            value: value,
            cx: center + unitRadius,
            cy: center,
            r: 1
        };
    }

    var cx = center + unitRadius * value / (value + 1);
    var cy = center;
    var r = Math.abs(unitRadius / (value + 1));

    return {
        value: value,
        cx: cx,
        cy: cy,
        r: r
    };
}

function calculateReactanceCircle(value, center, unitRadius) {
    if (Math.abs(value) == Infinity) {
        return {
            value: value,
            cx: center + unitRadius,
            cy: center,
            r: 1
        };
    }

    var cx = center + unitRadius;
    var cy = center - unitRadius / value;
    var r = Math.abs(unitRadius / value);

    return {
        value: value,
        cx: cx,
        cy: cy,
        r: r
    };
}

function calculateGamma(r, x, center, unitRadius) {
    if (r.value == Infinity || Math.abs(x.value) == Infinity) {
        return {
            gamma: math.complex(1, 0).toPolar(),
            x: center + unitRadius,
            y: center
        };
    }

    var z = math.complex(r.value, x.value);
    var gamma = math.divide(math.subtract(z, 1), math.add(z, 1)).toPolar();

    var x = center + unitRadius * gamma.r * Math.cos(gamma.phi);
    var y = center - unitRadius * gamma.r * Math.sin(gamma.phi);

    return {
        gamma: gamma,
        x: x,
        y: y
    };
}

var chartDimensions = {
    width: 1300, // from svg image
    center: 649, // 1300/2 - 1
    unitRadius: 547, // determined experimentally
    outerRadius: 640 // determined experimentally and slightly outside chart
};

var minWidth = Math.min(window.innerHeight, window.innerWidth);
var chart = d3.select("#chart-area")
    .append("svg")
    .attr("height", chartDimensions.width)
    .attr("width", chartDimensions.width)
    .attr("viewBox", "0 0 " + chartDimensions.width + " " + chartDimensions.width);

var smithChartImage = chart.append("image")
    .attr("x", "0")
    .attr("y", "0")
    .attr("height", chartDimensions.width)
    .attr("width", chartDimensions.width)
    .attr("xlink:href", "./resources/smith_chart.svg");

var chartBounds = calculateResistanceCircle(0, chartDimensions.center, chartDimensions.unitRadius);
chart.append("defs")
    .append("clipPath")
    .attr("id", "boundary-clip")
    .append("circle")
    .attr("cx", chartBounds.cx)
    .attr("cy", chartBounds.cy)
    .attr("r", chartBounds.r);

var data = [
    {
        resistance: 1,
        reactance: 0
    },
    {
        resistance: 0.5,
        reactance: -2
    },
    {
        resistance: 0,
        reactance: 1
    },
    {
        resistance: Infinity,
        reactance: -1
    },
    {
        resistance: 1,
        reactance: Infinity
    },
    {
        resistance: 0,
        reactance: 0
    }
];

var MAX_CURSORS = 10;
data.length = Math.min(data.length, MAX_CURSORS);
data.forEach(function (z) {
    z.resistance = calculateResistanceCircle(z.resistance, chartDimensions.center, chartDimensions.unitRadius);
    z.reactance = calculateReactanceCircle(z.reactance, chartDimensions.center, chartDimensions.unitRadius);

    var gamma = calculateGamma(z.resistance, z.reactance, chartDimensions.center, chartDimensions.unitRadius);
    z.gamma = gamma;
});

var cursors = chart.append("g")
    .attr("id", "cursors");

var colorInterpolator = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range(['#f00', '#00f'])
    .interpolate(d3.interpolateRgb);

cursors.selectAll(".cursors")
    .data(data)
    .enter().append("g")
    .attr("class", function (cursorData, i) { return "cursor" + i; })
    .each(function (cursorData, i) {
        var cursorGroup = d3.select(this);
        var color = colorInterpolator(i);

        cursorGroup.selectAll(".marker")
            .data([cursorData.gamma])
            .enter().append("circle")
            .attr("cx", function (marker) { return marker.x; })
            .attr("cy", function (marker) { return marker.y; })
            .attr("r", 5)
            .attr("fill", color);

        cursorGroup.selectAll(".resistanceCircle")
            .data([cursorData.resistance])
            .enter().append("circle")
            .attr("cx", function (circle) { return circle.cx; })
            .attr("cy", function (circle) { return circle.cy; })
            .attr("r", function (circle) { return circle.r; })
            .attr("stroke", color)
            .attr("stroke-width", 3)
            .attr("fill", "none");

        if (cursorData.reactance.value === 0) {
            cursorGroup.selectAll(".reactanceCircle")
                .data([cursorData.reactance])
                .enter().append("line")
                .attr("x1", chartDimensions.center - chartDimensions.unitRadius)
                .attr("y1", chartDimensions.center)
                .attr("x2", chartDimensions.center + chartDimensions.unitRadius)
                .attr("y2", chartDimensions.center)
                .attr("stroke", color)
                .attr("stroke-width", 3);
        } else {
            cursorGroup.selectAll(".reactanceCircle")
                .data([cursorData.reactance])
                .enter().append("circle")
                .attr("cx", function (circle) { return circle.cx; })
                .attr("cy", function (circle) { return circle.cy; })
                .attr("r", function (circle) { return circle.r; })
                .attr("stroke", color)
                .attr("stroke-width", 3)
                .attr("fill", "none")
                .attr("clip-path", "url(#boundary-clip)");
        }

        cursorGroup.selectAll(".electricLength")
            .data([cursorData.gamma])
            .enter().append("line")
            .attr("x1", chartDimensions.center)
            .attr("y1", chartDimensions.center)
            .attr("x2", function (gamma) {
                var arg = gamma.gamma.phi;
                return chartDimensions.center + chartDimensions.outerRadius * Math.cos(arg);
            })
            .attr("y2", function (gamma) {
                var arg = gamma.gamma.phi;
                return chartDimensions.center - chartDimensions.outerRadius * Math.sin(arg);
            })
            .attr("stroke", color)
            .attr("stroke-width", 3);
    });
