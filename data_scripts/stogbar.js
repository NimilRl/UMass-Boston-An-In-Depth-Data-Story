
d3.csv("data_scripts/combined_with_departments.csv").then(function (data) {
    const processedData = data.map(d => ({
        DEPARTMENT: d.DEPARTMENT,
        PAY_TOTAL_ACTUAL: +d.PAY_TOTAL_ACTUAL,
        PAY_OTHER_ACTUAL: +d.PAY_OTHER_ACTUAL
    }));

    console.log(processedData); // Debugging line to check data
    createBar(processedData);
});

function createBar(data) {

    const svg = d3.select("#stogbar").append("svg")
        .attr("width", 960)
        .attr("height", 750);

    const margin = { top: 20, right: 20, bottom: 500, left: 30 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1)
        .domain(data.map(d => d.DEPARTMENT));

    const x1 = d3.scaleBand()
        .padding(0.05)
        .domain(["PAY_TOTAL_ACTUAL", "PAY_OTHER_ACTUAL"])
        .rangeRound([0, x0.bandwidth()]);

    const y = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data, d => d.PAY_TOTAL_ACTUAL + d.PAY_OTHER_ACTUAL)]);

    const color = d3.scaleOrdinal()
        .range(["#a6bddb", "#2b8cbe"])
        .domain(["PAY_TOTAL_ACTUAL", "PAY_OTHER_ACTUAL"]);

    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", d => "translate(" + x0(d.DEPARTMENT) + ",0)")
        .selectAll("rect")
        .data(d => ["PAY_TOTAL_ACTUAL", "PAY_OTHER_ACTUAL"].map(key => ({ key: key, value: d[key] })))
        .enter().append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .style("font-size", "10px");

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Salary");


    function update(mode) {
        // Compute the maximum value for the y-axis domain based on the current mode
        const maxValue = mode === 'stacked'
            ? d3.max(data, d => d.PAY_TOTAL_ACTUAL + d.PAY_OTHER_ACTUAL)
            : d3.max(data, d => Math.max(d.PAY_TOTAL_ACTUAL, d.PAY_OTHER_ACTUAL));

        // Update the y-axis scale domain
        y.domain([0, maxValue]).nice();

        if (mode === 'grouped') {
            // Position the bars for the grouped layout
            g.selectAll("g").selectAll("rect")
                .transition()
                .duration(500)
                .attr("x", d => x1(d.key))
                .attr("width", x1.bandwidth())
                .attr("y", d => y(d.value))
                .attr("fill")
                .attr("height", d => height - y(d.value));

        } else if (mode === 'stacked') {
            // Position the bars for the stacked layout
            g.selectAll("g").selectAll("rect")
                .transition()
                .duration(500)
                .attr("x", d => x0(d.department))
                .attr("width", x0.bandwidth())
                .transition()
                .attr("y", function (d) {
                    // 'this' refers to the rect element - get its parent node (the group element)
                    // and use its data to calculate the total for the department
                    const parentNodeData = d3.select(this.parentNode).datum();
                    const total = (d.key === "PAY_TOTAL_ACTUAL") ? 0 : parentNodeData.PAY_TOTAL_ACTUAL;
                    return y(total + d.value);
                })
                .attr("height", d => height - y(d.value));
        }
    }
    // Initially, display the stacked version
    update('stacked');

    // Attach the update function to window to make it accessible from HTML buttons
    window.update = update;

}