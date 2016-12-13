/**
 * Created by kiranthapa on 11/18/16.
 */

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 640 - margin.left - margin.right,
    height = 333 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var svg = d3.select("#ratings-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



d3.csv("../data/BX-Book-Ratings.csv", function(data) {
    var totalCount = 0;
    var ratingsDictionary = {};
    var ratingsArray = new Array();

    for (var i = 0; i < data.length; i++) {
        totalCount += 1;
        var key = data[i]["Book-Rating"].toString();

        if (key in ratingsDictionary) {
            ratingsDictionary[key]++;
        } else {
            ratingsDictionary[key] = 1;
        }
    }

    var processedRatingsDictionary = {};

    // Remove distorted keys
    for(var i = 0; i <= 10; i++) {
        processedRatingsDictionary[i] = (ratingsDictionary[i] / totalCount) * 100;
    }

    for (var key in processedRatingsDictionary) {
        var rating = {};
        rating["letter"] = key;
        rating["frequency"] = processedRatingsDictionary[key];

        ratingsArray.push(rating);
    }

    data = ratingsArray;

    data.forEach(function(d) {
        d.frequency = +d.frequency;
    });

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); });

    d3.select("input").on("change", change);

    function change() {
        // Copy-on-write since tweens are evaluated after a delay.
        var x0 = x.domain(data.sort(this.checked
            ? function(a, b) { return b.frequency - a.frequency; }
            : function(a, b) { return d3.ascending(a.letter, b.letter); })
            .map(function(d) { return d.letter; }))
            .copy();

        svg.selectAll(".bar")
            .sort(function(a, b) { return x0(a.letter) - x0(b.letter); });

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 50; };

        transition.selectAll(".bar")
            .delay(delay)
            .attr("x", function(d) { return x0(d.letter); });

        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);
    }

    $(".loading").remove();
    $("label").css("display", "block");
});

