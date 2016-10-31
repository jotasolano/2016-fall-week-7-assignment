console.log('7.1');

//First, append <svg> element and implement the margin convention
var m = {t:50,r:200,b:50,l:200};
var outerWidth = document.getElementById('canvas').clientWidth,
    outerHeight = document.getElementById('canvas').clientHeight;
var w = outerWidth - m.l - m.r,
    h = outerHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width',outerWidth)
    .attr('height',outerHeight)
    .append('g')
    .attr('transform','translate(' + m.l + ',' + m.t + ')');

var scaleX, scaleY;

//Step 1: importing multiple datasets
d3.queue()
    .defer(d3.csv,'../data/olympic_medal_count_1900.csv',parse)
    .defer(d3.csv,'../data/olympic_medal_count_1960.csv',parse)
    .defer(d3.csv,'../data/olympic_medal_count_2012.csv',parse)
    .await(function(err, rows1900, rows1960, rows2012){

        // console.table(rows2012); //just checking
        
        //Draw axis
        scaleY = d3.scaleLinear()
            .domain([0,120])
            .range([h,0]);
        scaleX = d3.scaleLinear()
            .domain([0,4])
            .range([0,w]);

        var axisY = d3.axisLeft()
            .scale(scaleY)
            .tickSize(-w-200);

        plot.append('g')
            .attr('class','axis axis-y')
            .attr('transform','translate(-100,0)')
            .call(axisY);

        //Step 2: implement the code to switch between three datasets

        var years = [
                        {year: 1900, data: rows1900},
                        {year: 1960, data: rows1960},
                        {year: 2012, data: rows2012}
                    ];

        d3.select(".toggleButtons")
            .selectAll('div')
            .data(years)
            .enter()
            .append('div')
            .attr('class', 'btn-primary btn')
            .text(function(d){ return d.year; })
            .attr('id', function(d){ return 'year-'+d.year; })
            .on('click', function(d) {
                draw(d.data);    
            });
    });

//Step 3: implement the enter / exit / update pattern
function draw(rows){
    var top5 = rows.sort(function(a,b){ return b.count - a.count; }).slice(0,5);

    console.table(top5);

    // UPDATE
    var update = plot.selectAll('.country')
        .data(top5, function(d) { return d.country; }); //UPDATE - function returns the KEY


    // ENTER
    var enter = update.enter()
        .append('g')
        .attr('class', 'country')
        .attr('transform', function(d, i){
            return 'translate('+scaleX(i)+',0)';
        });

    enter.append('rect')
        .attr('x', 0)
        .attr('y', function(d) { return scaleY(d.count); })
        .attr('width', 30)
        .attr('height', function(d) { return h - scaleY(d.count); });

    enter.append('text')
        .attr('y', function(d) { return scaleY(d.count) - 10; })
        .text(function(d) { return d.country; })
        .attr('text-anchor', 'middle');

    enter
        .merge(update)
        .attr('transform', function(d, i){
            return 'translate('+scaleX(i)+',0)';
        });

    update.exit().remove();
}



function parse(d){
    return {
        country: d.Country,
        count: +d.count
    };
}
