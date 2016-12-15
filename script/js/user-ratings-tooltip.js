/**
 * Created by kiranthapa on 12/11/16.
 */
var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = 640 - margin.left - margin.right,
    height = 340 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Percentage:</strong> <span style='color:orange'>" + (d.frequency * 100).toFixed(2) + '%' + "</span>";
    })

var svg = d3.select("#ratings-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);


// Show book ratings summary
var isbnRatingsDictionary = {};
var validRatingsArray = new Array();

for (var i = 1; i <= 10; i++) {
    validRatingsArray.push(i.toString());
}

// console.log(validRatingsArray);


d3.csv("../data/BX-Book-Ratings.csv", function(data) {
    var totalCount = 0;
    var ratingsDictionary = {};
    var ratingsArray = new Array();

    for (var i = 0; i < data.length; i++) {
        // For ratings summary
        totalCount += 1;
        var rating = data[i]["Book-Rating"].toString();

        if (rating in ratingsDictionary) {
            ratingsDictionary[rating]++;
        } else {
            ratingsDictionary[rating] = 1;
        }

        // Construct isbn and ratings dictionary
        var isbn = data[i]["ISBN"].toString();

        if (validRatingsArray.indexOf(rating) > -1 && isValidISBN(isbn)) {
            if (isbn in isbnRatingsDictionary) {
                isbnRatingsDictionary[isbn].push(rating);
            } else {
                var emptyArray = new Array();
                emptyArray.push(rating);
                isbnRatingsDictionary[isbn] = emptyArray;
            }
        }

    }

    // console.log(isbnRatingsDictionary);

    var processedRatingsDictionary = {};

    // Remove distorted keys
    for(var i = 0; i <= 10; i++) {

        if (i == 0) {
            processedRatingsDictionary["Unrated"] = ratingsDictionary[i] / totalCount;
        } else {
            processedRatingsDictionary[i] = ratingsDictionary[i] / totalCount;
        }

    }

    for (var key in processedRatingsDictionary) {
        var rating = {};
        rating["letter"] = key;
        rating["frequency"] = processedRatingsDictionary[key];

        ratingsArray.push(rating);
    }

    data = ratingsArray;

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("dx", (width / 2) - 50)
        .attr("dy", 28)
        .text("Ratings (1: Least, 10: Highest)");


    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("x", 10)
        .attr("y", -20)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percentage");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('click', function(d,i) {
            // handle events here
            // d - datum
            // i - identifier or index
            // this - the `<rect>` that was clicked
            var element = document.getElementById("books_table");
            element.outerHTML = "";
            delete element;
            showChosenRatingBooks(d.letter)
        });

    $(".processing_text").text("Ratings Summary");
    showChosenRatingBooks(0);

});

var booksDict = {};
function showChosenRatingBooks(rating) {
    booksDict = {};
    console.log(rating);
    d3.csv("../data/BX-Books.csv", function(data) {
        for (var i = 0; i < data.length; i++) {
            var year = data[i]["Year-Of-Publication"];

            if (year == 2004) {
                var isbn = data[i]["ISBN"].toString();

                if (isbn in isbnRatingsDictionary) {
                    if (isbnRatingsDictionary[isbn].indexOf(rating) > -1 || rating == 0) {
                        console.log(isbnRatingsDictionary[isbn].indexOf(rating));
                        var bookDetailsDict = {};
                        bookDetailsDict["bookTitle"] = data[i]["Book-Title"].toString();
                        bookDetailsDict["bookAuthor"] = data[i]["Book-Author"].toString();
                        bookDetailsDict["publisher"] = data[i]["Publisher"].toString();
                        bookDetailsDict["imageUrlS"] = data[i]["Image-URL-S"].toString();
                        booksDict[isbn] = bookDetailsDict;
                    }
                }
            }
        }
        addTable(booksDict);
    });
}

function addTable(booksDict) {

    var myTableDiv = document.getElementById("books_list");

    var table = document.createElement('TABLE');
    table.border='1';
    table.id = "books_table";

    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    for (isbn in booksDict){
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

        var td = document.createElement('TD');
        td.id = isbn;
        td.addEventListener('click', function() {
            displayEachBookRating(this.id);
        });
        td.class = "boom";
        td.width='100%';
        td.appendChild(document.createTextNode(booksDict[isbn]["bookTitle"]));
        tr.appendChild(td);
    }
    myTableDiv.appendChild(table);


}

function displayEachBookRating(isbn) {
    console.log(isbnRatingsDictionary[isbn]);

    var bookArray = isbnRatingsDictionary[isbn];
    var bookRatingsDict = {};

    for (var i = 0; i < bookArray.length; i++) {
        if(bookArray[i] in bookRatingsDict) {
            bookRatingsDict[bookArray[i]]++;
        } else {
            bookRatingsDict[bookArray[i]] = 1;
        }
    }
    console.log(bookRatingsDict);

    var finalRatings = new Array();

    // valid ratings are from 1 to 10, hence i is between 1 and 10 inclusive
    for(var i = 1; i <= 10; i++) {
        if (i.toString() in bookRatingsDict) {
            finalRatings.push(bookRatingsDict[i.toString()]);
        } else {
            finalRatings.push(0);
        }
    }

    console.log(finalRatings);

    var layout = {
        title: booksDict[isbn]["bookTitle"],
        xaxis: {
            title: 'Ratings',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
        },
        yaxis: {
            title: 'Number of readers',
            titlefont: {
                family: 'Courier New, monospace',
                size: 18,
                color: '#7f7f7f'
            }
        }
    };

    var data = [{
        type: 'bar',
        x: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        y: finalRatings,
        orientation: 'v'
    }];

    Plotly.newPlot('single_book_info', data, layout);

}



function type(d) {
    d.frequency = +d.frequency;
    return d;
}

function isValidISBN (isbn) {
    isbn = isbn.replace(/[^\dX]/gi, '');
    if(isbn.length != 10){
        return false;
    }
    var chars = isbn.split('');
    if(chars[9].toUpperCase() == 'X'){
        chars[9] = 10;
    }
    var sum = 0;
    for (var i = 0; i < chars.length; i++) {
        sum += ((10-i) * parseInt(chars[i]));
    };
    return ((sum % 11) == 0);
}
