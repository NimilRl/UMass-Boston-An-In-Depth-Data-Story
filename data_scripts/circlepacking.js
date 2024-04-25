// document.addEventListener('DOMContentLoaded', function () {


// // Specify the URL of the CSV file
// const csvUrl = 'combined_with_departments.csv'; // Ensure this points to the location of your CSV file

// // Load and process data for both charts
// d3.csv(csvUrl).then(function(data) {

//     //////////////////////////////////////
//     // for pie Compute average annual pay by department for the pie chart
//     let departmentData = d3.rollups(data, 
//         v => d3.mean(v, d => +d.ANNUAL_RATE), 
//         d => d.DEPARTMENT)
//         .map(([name, value]) => ({ name, value }));

//     // Sort and prepare data for pie chart
//     departmentData.sort((a, b) => b.value - a.value);
//     const topDepartments = departmentData.slice(0, 7);
//     const otherDepartments = departmentData.slice(7);
//     const othersAggregate = {
//         name: "Other",
//         value: d3.sum(otherDepartments, d => d.value),
//         details: otherDepartments
//     };

//     //////////////////////////////////////

//     // for circle zooming Prepare hierarchical data for circle packing
//     const filteredData = data.filter(d => !topDepartments.map(d => d.name).includes(d.DEPARTMENT));
//     const nestedData = d3.rollups(filteredData, 
//         v => ({ children: v.map(d => ({ name: d.FULL_NAME, value:d.ANNUAL_RATE })) }),
//         d => d.DEPARTMENT,
//         d => d.POSITION_TITLE
//     ).map(([name, children]) => ({ name, children }));

//     const circlePackingData = {
//         name: "Umass boston",
//         children: nestedData
//     };

//     console.log("Circle Packing Data: ", circlePackingData); // Debugging line to check data


//     //////////////////////////////////////

//     // Render the circle packing chart
//     renderCirclePacking(circlePackingData);
// });


// function renderCirclePacking(data) {
//         const width = 928;
//         const height = width;  // Same as width to make the chart square

//         const color = d3.scaleLinear()
//             .domain([0, 5])  // Depth levels of the circle packing
//             .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
//             .interpolate(d3.interpolateHcl);

//         // Packing function setup
//         const pack = data => d3.pack()
//             .size([width, height])
//             .padding(3)
//             (d3.hierarchy(data)
//                 .sum(d => d.value)  // Make sure all nodes have a value
//                 .sort((a, b) => b.value - a.value));

//         const root = pack(data);

//         // Creating the SVG container inside the div
//         const svg = d3.select("#circle-packing").append("svg")
//             .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
//             .attr("width", width)
//             .attr("height", height)
//             .attr("style", `max-width: 100%; height: auto; display: block; margin: 0 -14px; background: ${color(0)}; cursor: pointer;`);

//         // Append nodes (circles)
//         const node = svg.append("g")
//             .selectAll("circle")
//             .data(root.descendants().slice(1))  // Excluding the outermost circle
//             .join("circle")
//                 .attr("fill", d => d.children ? color(d.depth) : "white")
//                 .attr("pointer-events", d => !d.children ? "none" : null)
//                 .attr("transform", d => `translate(${d.x}, ${d.y})`)
//                 .attr("r", d => d.r)
//                 .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
//                 .on("mouseout", function() { d3.select(this).attr("stroke", null); });

//         // Append labels
//         const label = svg.append("g")
//             .style("font", "10px sans-serif")
//             .attr("pointer-events", "none")
//             .attr("text-anchor", "middle")
//             .selectAll("text")
//             .data(root.descendants())
//             .join("text")
//                 .attr("transform", d => `translate(${d.x}, ${d.y})`)
//                 .style("fill-opacity", d => d.parent === root ? 1 : 0)
//                 .style("display", d => d.parent === root ? "inline" : "none")
//                 .text(d => d.data.name);

//         // Zoom functionality
//         let focus = root;
//         let view;

//         function zoomTo(v) {
//             const k = width / v[2];
//             view = v;
//             label.attr("transform", d => `translate(${(d.x - v[0]) * k}, ${(d.y - v[1]) * k})`);
//             node.attr("transform", d => `translate(${(d.x - v[0]) * k}, ${(d.y - v[1]) * k})`);
//             node.attr("r", d => d.r * k);
//         }

//         function zoom(event, d) {
//             const focus0 = focus;
//             focus = d;
//             const transition = svg.transition()
//                 .duration(event.altKey ? 7500 : 750)
//                 .tween("zoom", d => {
//                     const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
//                     return t => zoomTo(i(t));
//                 });

//             label
//                 .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
//                 .transition(transition)
//                     .style("fill-opacity", d => d.parent === focus ? 1 : 0)
//                     .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
//                     .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
//         }

//         svg.on("click", (event) => zoom(event, root));
//         zoomTo([focus.x, focus.y, focus.r * 2]);
//     }


// });
document.addEventListener('DOMContentLoaded', function () {

    const chartContainer = document.getElementById('circle-packing');

    // Load data from data.json file
    fetch('data_scripts/circlepacking.json')
        .then(response => response.json())
        .then(data => {
            // Render the chart with the loaded data
            const svgChart = chart(data);
            chartContainer.appendChild(svgChart);
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });

    // Define the chart function
    function chart(data) {
        const width = 928;
        const height = width;
        const color = d3.scaleLinear()
            .domain([0, 5])
            .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
            .interpolate(d3.interpolateHcl);
        
        const pack = data => d3.pack()
            .size([width, height])
            .padding(3)
            (d3.hierarchy(data)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value));
        const root = pack(data);

        const svg = d3.select("#circle-packing").append("svg")
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
            .attr("width", width)
            .attr("height", height)
            .attr("style", `max-width: 110%; height: auto; display: block; margin: 0 -14px;  cursor: pointer;`);

        const node = svg.append("g")
            .selectAll("circle")
            .data(root.descendants().slice(1))
            .join("circle")
                .attr("fill", d => d.children ? color(d.depth) : "white")
                // .attr("fill", () => `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`) // Generate random RGB color
                .attr("pointer-events", "all")
                .attr("transform", d => `translate(${d.x}, ${d.y})`)
                .attr("r", d => d.r)
                .on("mouseover", (event, d) => {
                    const tooltip = d3.select('.tooltip');
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltip.html(`Name: ${d.data.name}<br>Value: ${d.data.value}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY + 10) + "px");
                    // d3.select(this).attr("stroke", "#000");
                })
                .on("mousemove", (event) => {
                    d3.select('.tooltip')
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY + 10) + "px");
                })
                .on("mouseout", () => {
                    d3.select('.tooltip').transition()
                        .duration(500)
                        .style("opacity", 0);
                    // d3.select(this).attr("stroke", null);
                })
                .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

        // const svg = d3.create("svg")
        //     .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        //     .attr("width", width)
        //     .attr("height", height)
        //     .attr("style", `max-width: auto; height: auto; display: block; margin: 0 -14px;  cursor: pointer;`);
        // const node = svg.append("g")
        //     .selectAll("circle")
        //     .data(root.descendants().slice(1))
        //     .join("circle")
        //     .attr("fill", () => `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`) // Generate random RGB color
        //     .attr("pointer-events", d => !d.children ? "none" : null)
        //     .on("mouseover", function () { d3.select(this).attr("stroke", "#000"); })
        //     .on("mouseout", function () { d3.select(this).attr("stroke", null); })
        //     .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));
        const label = svg.append("g")
            .style("font", "10px sans-serif")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(root.descendants())
            .join("text")
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .text(d => d.data.name , d => d.data.value);
        svg.on("click", (event) => zoom(event, root));
        let focus = root;
        let view;
        zoomTo([focus.x, focus.y, focus.r * 2]);
        function zoomTo(v) {
            const k = width / v[2];
            view = v;
            label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("r", d => d.r * k);
        }
        function zoom(event, d) {
            const focus0 = focus;
            focus = d;
            const transition = svg.transition()
                .duration(event.altKey ? 7500 : 750)
                .tween("zoom", d => {
                    const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                    return t => zoomTo(i(t));
                });
            label
                .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
                .transition(transition)
                .style("fill-opacity", d => d.parent === focus ? 1 : 0)
                .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
        }
        function zoomTo(v) {
            const k = width / v[2];
            view = v;
            label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("r", d => d.r * k);
        }

        return svg.node();
    }
});