var width = 960,
    height = 600;
var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("flare.json").then(function (data) {
    var tree = d3.hierarchy(data)
        .eachBefore(function (d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
        .sum(d => d.size) //api: calculate by post-order traversal
        .sort((a, b) => b.height - a.height || b.value - a.value);

    var treemap = d3.treemap()
        .tile(d3.treemapResquarify) //bug: if use default, tiles fly all around when changing sum mode
        .size([width, height]);

    treemap(tree);

    var schemeCategory20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];
    // var colors = d3.scaleOrdinal(d3.schemeSet3);
    var colors = d3.scaleOrdinal(schemeCategory20);

    var gCells = svg.selectAll("g")
        .data(tree.leaves())
        .enter().append("g")
        .attr("transform", d => "translate(" + [d.x0, d.y0] + ")");

    gCells.append("rect")
        .attr("id", d => d.data.id)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colors(d.parent.data.id));

    gCells.append("clipPath")
        .attr("id", d => "clip-" + d.data.id)
        .append("use")
        .attr("xlink:href", d => "#" + d.data.id);

    gCells.append("text")
        .attr("clip-path", d => "url(#clip-" + d.data.id + ")")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text(d => d);

    gCells.append("title")
        .text(d => d.data.id + "\n" + d.value);

    d3.selectAll("input")
        .on("change", function () {
            var value = d3.select("input:checked").node().value;
            tree.sum(d => (value === "size") ? d.size : (d.children ? 0 : 1));
            treemap(tree);

            gCells.transition()
                .duration(750)
                .attr("transform", d => "translate(" + [d.x0, d.y0] + ")")
                .select("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
        });
});