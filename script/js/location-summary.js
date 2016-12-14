/**
 * Created by kiranthapa on 12/12/16.
 */

d3.csv("../data/BX-Users.csv", function(data) {


    var locationsDictionary = {};
    var locationssArray = new Array();

    // Find countries and number of readers/raters in each of them
    for (var i = 0; i < data.length; i++) {
        var locationArray = data[i]["Location"].toString().split(", ");
        var country = locationArray[2];

        if (country in locationsDictionary) {
            locationsDictionary[country]++;
        } else {
            locationsDictionary[country] = 1;
        }
    }

    // Find age group within a country
    var ageGroupDictionary = {};
    for (var i = 0; i < data.length; i++) {
        var locationArray = data[i]["Location"].toString().split(", ");
        var country = locationArray[2];

        if (locationsDictionary[country] > 50) {
            if (!(country in ageGroupDictionary)) {
                ageGroupDictionary[country] = {"0to9": 0, "10to19": 0, "20to29": 0, "30to39": 0, "40to49": 0,
                                                "50to59": 0, "60to69": 0, "70to79": 0, "80to89": 0, "90to99": 0, "100+": 0};
            }
            var age = data[i]["Age"];
            switch (true) {
                case (age > 0 && age <= 9):
                    ageGroupDictionary[country]["0to9"]++;
                    break;
                case (age >= 10 && age <= 19):
                    ageGroupDictionary[country]["10to19"]++;
                    break;
                case (age >= 20 && age <= 29):
                    ageGroupDictionary[country]["20to29"]++;
                    break;
                case (age >= 30 && age <= 39):
                    ageGroupDictionary[country]["30to39"]++;
                    break;
                case (age >= 40 && age <= 49):
                    ageGroupDictionary[country]["40to49"]++;
                    break;
                case (age >= 50 && age <= 59):
                    ageGroupDictionary[country]["50to59"]++;
                    break;
                case (age >= 60 && age <= 69):
                    ageGroupDictionary[country]["60to69"]++;
                    break;
                case (age >= 70 && age <= 79):
                    ageGroupDictionary[country]["70to79"]++;
                    break;
                case (age >= 80 && age <= 89):
                    ageGroupDictionary[country]["80to89"]++;
                    break;
                case (age >= 90 && age <= 99):
                    ageGroupDictionary[country]["90to99"]++;
                    break;
                case (age >= 100):
                    ageGroupDictionary[country]["100+"]++;
                    break;
                default:
                    break;
            }

        }
    }

    // console.log(ageGroupDictionary);


    for (var key in locationsDictionary) {
        if (locationsDictionary[key] > 50) {
            locationssArray.push({label: key.toUpperCase(), value: locationsDictionary[key]});
        }
    }

    locationssArray.sort(function(a,b) {
        return b.value - a.value;
    });

    data = locationssArray;

    var div = d3.select("#mainGraphContainer").append("div").attr("class", "toolTip");

    var axisMargin = 20,
        margin = 40,
        valueMargin = 4,
        width = parseInt(d3.select('#mainGraphContainer').style('width'), 10),
        height = parseInt(d3.select('#mainGraphContainer').style('height'), 10),
        barHeight = (height-axisMargin-margin*2)* 0.4/data.length,
        barPadding = (height-axisMargin-margin*2)*0.6/data.length,
        data, bar, svg, scale, xAxis, labelWidth = 0;

    max = d3.max(data, function(d) { return d.value; });

    svg = d3.select('#mainGraphContainer')
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    bar = svg.selectAll("g")
        .data(data)
        .enter()
        .append("g");

    bar.attr("class", "bar")
        .attr("cx",0)
        .attr("transform", function(d, i) {
            return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
        });

    bar.append("text")
        .attr("class", "label")
        .attr("y", barHeight / 2)
        .attr("dy", ".35em") //vertical align middle
        .text(function(d){
            return d.label;
        }).each(function() {
        labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    });

    scale = d3.scale.linear()
        .domain([0, max])
        .range([0, width - margin*2 - labelWidth]);

    xAxis = d3.svg.axis()
        .scale(scale)
        .tickSize(-height + 2*margin + axisMargin)
        .orient("bottom");

    bar.append("rect")
        .attr("transform", "translate("+labelWidth+", 0)")
        .attr("height", barHeight)
        .attr("width", function(d){
            return scale(d.value);
        });

    bar.append("text")
        .attr("class", "value")
        .attr("y", barHeight / 2)
        .attr("dx", -valueMargin + labelWidth) //margin right
        .attr("dy", ".35em") //vertical align middle
        .attr("text-anchor", "end")
        .text(function(d){
            return (d.value);
        })
        .attr("x", function(d){
            var width = this.getBBox().width;
            return Math.max(width + valueMargin, scale(d.value));
        });

    bar
        .on("mousemove", function(d){
            if(document.getElementById('radioBarChart').checked) {
                div.style("left", d3.event.pageX+10+"px");
                div.style("top", d3.event.pageY-25+"px");
                div.style("display", "inline-block");
                div.attr("id", "myDiv");

                var ageGroupLabels = ['100+', '90to99', '80to89', '70to79', '60to69', '50to59', '40to49', '30to39', '20to29',
                    '10to19', '0to9'];

                var ageGroupValue = [];

                for (var i = 0; i < ageGroupLabels.length; i++) {
                    ageGroupValue[i] = ageGroupDictionary[d.label.toLowerCase()][ageGroupLabels[i]];
                }

                // console.log(ageGroupValue);

                var data = [{
                    type: 'bar',
                    x: ageGroupValue,
                    y: ['100+', '90-99', '80-89', '70-79', '60-69', '50-59', '40-49', '30-39', '20-29', '10-19', '0-9'],
                    orientation: 'h'
                }];

                Plotly.newPlot('myDiv', data);
            } else if(document.getElementById('radioText').checked) {
                div.style("left", d3.event.pageX+10+"px");
                div.style("top", d3.event.pageY-25+"px");
                div.style("display", "inline-block");
                div.html((d.label)+"<br>"
                    +"Total: "+(d.value)+"<br><br>"
                    +"Age group: " + "Number" + "<br>"
                    +"0-9"+": "+(ageGroupDictionary[d.label.toLowerCase()]['0to9'])+"<br>"
                    +"10-19"+": "+(ageGroupDictionary[d.label.toLowerCase()]['10to19'])+"<br>"
                    +"20-29"+": "+(ageGroupDictionary[d.label.toLowerCase()]['20to29'])+"<br>"
                    +"30-39"+": "+(ageGroupDictionary[d.label.toLowerCase()]['30to39'])+"<br>"
                    +"40-49"+": "+(ageGroupDictionary[d.label.toLowerCase()]['40to49'])+"<br>"
                    +"50-59"+": "+(ageGroupDictionary[d.label.toLowerCase()]['50to59'])+"<br>"
                    +"60-69"+": "+(ageGroupDictionary[d.label.toLowerCase()]['60to69'])+"<br>"
                    +"70-79"+": "+(ageGroupDictionary[d.label.toLowerCase()]['70to79'])+"<br>"
                    +"80-89"+": "+(ageGroupDictionary[d.label.toLowerCase()]['80to89'])+"<br>"
                    +"90-99"+": "+(ageGroupDictionary[d.label.toLowerCase()]['90to99'])+"<br>"
                    +"100+"+": "+(ageGroupDictionary[d.label.toLowerCase()]['100+'])+"<br>");
            }
        });
    bar
        .on("mouseout", function(d){
            div.style("display", "none");
        });

    svg.insert("g",":first-child")
        .attr("class", "axisHorizontal")
        .attr("transform", "translate(" + (margin + labelWidth) + ","+ (height - axisMargin - margin)+")")
        .call(xAxis);

    svg.insert("g",":first-child")
        .attr("class", "axisHorizontal")
        .attr("transform", "translate(" + (margin + labelWidth) + ", 0)")
        .call(xAxis);
});

