/**
 * Created by kiranthapa on 12/14/16.
 */
var diameter = 1500, //max size of the bubbles
    color    = d3.scale.category20b(); //color category

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("body")
    .append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

d3.csv("../data/BX-Books.csv", function(error, data){

    var publisherDict = {};
    var publisherArray = new Array();

    for (var i = 0; i < data.length; i++) {
        var publisher = data[i]["Publisher"];

        if (publisher in publisherDict) {
            publisherDict[publisher]++;
        } else {
            publisherDict[publisher] = 1;
        }
    }


    for (var key in publisherDict) {
        if (publisherDict[key] > 500) {
            var publisher = {};
            publisher["name"] = key;
            publisher["amount"] = publisherDict[key];
            publisherArray.push(publisher);
        }
    }

    data = publisherArray;

    //convert numerical values from strings to numbers
    data = data.map(function(d){ d.value = +d["amount"]; return d; });

    //bubbles needs very specific format, convert data to this.
    var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });

    //setup the chart
    var bubbles = svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll(".bubble")
        .data(nodes)
        .enter();

    //create the bubbles
    bubbles.append("circle")
        .attr("r", function(d){ return d.r; })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", function(d) { return color(d.value); });

    //format the text for each bubble
    bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d["name"]; })
        .style({
            "fill":"white",
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-weight": "large",
            "font-size": "10px"
        });

    // format the amount for each bubble
    bubbles.append("text")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y + 15; })
        .attr("text-anchor", "middle")
        .text(function(d){ return d["amount"]; })
        .style({
            "fill":"white",
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-weight": "large",
            "font-size": "10px"
        });
})
