function get_scatter_plot_matrix_settings(){
    let width = 600;
    let size = 150;
    let padding = 30;

    /* d3 scalelinear is used to define the size of the linear boxes
    * this is helpfull regarding using linear data on the form y= m*x + b */
    let x = d3.scaleLinear().range( [padding/2, size-(padding/2)] );
    let y = d3.scaleLinear().range( [size-(padding/2), padding/2 ] )

    /* density off gitter */
    let xAxis = d3.axisBottom().scale(x).ticks(10);
    let yAxis = d3.axisLeft().scale(y).ticks(10);

    /* color scheme to display residuals */
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    return [width, size, padding, x, y, xAxis, yAxis, color]
}
let [width, size, padding, x, y, xAxis, yAxis, color] = get_scatter_plot_matrix_settings();

/* Create D3 with csv. csv takes to inputs 1. csv file, 2 callback function */
/* If no errors happend while reading in the csv file, then we use to callback */
/* function to display the scatter matrix */
d3.csv("csv_files/regression_data.csv", function(error, data) {
    if (error) throw error;

    /* filter out text data, so only integers and floats are used to present the scatterplots */
    let traits = d3.keys(data[0])
    /*let traits = d3.keys(data[0]).filter(function (data) {
        return data !== "filter_word";
    })*/
    let n = traits.length;

    let domain_by_trait = {};
    /* pack data into domain, by trait */
    traits.forEach(function(trait) {
        domain_by_trait[trait] = d3.extent(data, function(dat) { return dat[trait]; });
    });

    /* Gitter size */
    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    /* Init new svg ob ject */
    let svg = d3.select("#scatter_matrix").append("svg").attr("width", size * n + padding).attr("height", size * n + padding).append("g").attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domain_by_trait[d]); d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domain_by_trait[d]); d3.select(this).call(yAxis); });

    let cell = svg.selectAll(".cell")
        .data(cross(traits, traits))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

    // Appends title for  i == j, or the diagonal!.
    cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { console.log(d.x); return d.x; });


    function plot(p) {
        let cell = d3.select(this);

        x.domain(domain_by_trait[p.x]);
        y.domain(domain_by_trait[p.y]);
        // Appends reactangle, per dataset
        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);
        // Adds circles/plots to the reactangle
        cell.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(dat) { return x(dat[p.x]); })
            .attr("cy", function(dat) { return y(dat[p.y]); })
            .attr("r", 4)
            .style("fill", function(dat) { return color(dat); });
    }
});

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
}