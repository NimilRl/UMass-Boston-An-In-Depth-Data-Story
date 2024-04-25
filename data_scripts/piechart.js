// document.addEventListener('DOMContentLoaded', function () {
//     const csvUrl = 'combined_with_departments.csv'; // Ensure this points to the location of your CSV file

//     d3.csv(csvUrl).then(function(data) {
//         // Compute the average annual pay for each department
//         let departmentData = d3.rollups(data, v => d3.mean(v, d => d.ANNUAL_RATE), d => d.DEPARTMENT)
//             .map(([name, value]) => ({name, value}));

//         // Sort departments by average pay and take the top 5
//         departmentData.sort((a, b) => b.value - a.value);
//         const topDepartments = departmentData.slice(0, 5);
//         const otherDepartments = departmentData.slice(5);
//         const othersAggregate = {
//             name: "Other",
//             value: d3.sum(otherDepartments, d => d.value),
//             details: otherDepartments
//         };

//         // Initial pie chart data
//         let currentData = topDepartments.concat([othersAggregate]);
//         renderPieChart(currentData);

//         function renderPieChart(data) {
//             const width = 600;
//             const height = 600;
//             const radius = Math.min(width, height) / 2;
//             const color = d3.scaleOrdinal(d3.schemeCategory10);

//             d3.select("#chart").html(''); // Clear the previous svg
//             const svg = d3.select("#chart").append("svg")
//                 .attr("width", width)
//                 .attr("height", height)
//                 .append("g")
//                 .attr("transform", `translate(${width / 2}, ${height / 2})`);

//             const pie = d3.pie()
//                 .value(d => d.value);

//             const arc = d3.arc()
//                 .innerRadius(0)
//                 .outerRadius(radius);

//             const path = svg.selectAll("path")
//                 .data(pie(data))
//                 .enter().append("path")
//                 .attr("d", arc)
//                 .attr("fill", d => color(d.data.name))
//                 .on("click", function(event, d) {
//                     // Handle click on "Other" to drill down
//                     if (d.data.name === "Other") {
//                         renderPieChart(d.data.details); // Render the detailed breakdown
//                     } else {
//                         console.log(`Clicked on: ${d.data.name} with average pay of $${d.data.value.toFixed(2)}`);
//                     }
//                 });

//             const tooltip = d3.select("body").append("div")
//                 .attr("class", "tooltip");

//             path.on("mouseover", function(event, d) {
//                 tooltip.transition()
//                     .duration(200)
//                     .style("opacity", .9);
//                 tooltip.html(`Department: <strong>${d.data.name}</strong><br/>Average Pay: $${d.data.value.toFixed(2)}`)
//                     .style("left", (event.pageX) + "px")
//                     .style("top", (event.pageY - 28) + "px");
//             }).on("mouseout", function(d) {
//                 tooltip.transition()
//                     .duration(500)
//                     .style("opacity", 0);
//             });
//         }
//         setupClickEventListener();
//     });
    
// });



document.addEventListener('DOMContentLoaded', function () {


// Specify the URL of the CSV file
const csvUrl = 'data_scripts/combined_with_departments.csv'; // Ensure this points to the location of your CSV file

// d3.csv(csvUrl).then(function(data) {
//     // Compute the average annual pay for each department
//     let departmentData = d3.rollups(data, 
//         v => d3.mean(v, d => +d.ANNUAL_RATE), 
//         d => d.DEPARTMENT)
//         .map(([name, value]) => ({ name, value }));

//     // Sort departments by average pay and take the top 7 or 8
//     departmentData.sort((a, b) => b.value - a.value);
//     const topDepartments = departmentData.slice(0, 7); // You can change this to 8 if needed
//     const otherDepartments = departmentData.slice(7); // Adjust accordingly if using top 8
//     const othersAggregate = {
//         name: "Other",
//         value: d3.sum(otherDepartments, d => d.value),
//         details: otherDepartments
//     };


//     // Append 'Other' category to the displayed data
//     const displayData = topDepartments.concat(othersAggregate);
//     console.log("Display Data: ", displayData); // Debugging line to check data

//     // Once the data is prepared, pass it to the chart creation function
//     pie(displayData);
// });


// Load and process data for both charts
d3.csv(csvUrl).then(function(data) {

    //////////////////////////////////////
    // for pie Compute average annual pay by department for the pie chart
    let departmentData = d3.rollups(data, 
        v => d3.mean(v, d => +d.ANNUAL_RATE), 
        d => d.DEPARTMENT)
        .map(([name, value]) => ({ name, value }));

    // Sort and prepare data for pie chart
    departmentData.sort((a, b) => b.value - a.value);
    const topDepartments = departmentData.slice(0, 9);
    const otherDepartments = departmentData.slice(9);
    const othersAggregate = {
        name: "Other",
        value: d3.sum(otherDepartments, d => d.value),
        details: otherDepartments
    };

    const pieChartData = topDepartments.concat([othersAggregate]);

    //////////////////////////////////////

   

    // console.log("Pie Chart Data: ", pieChartData); // Debugging line to check data



    // Render the pie chart
    renderPieChart(pieChartData);
});


//////////////////////////////////////

function renderPieChart(data) {
        const width = 928;
        const height = Math.min(width, 500);
        const svg = d3.select('#pie-chart').append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
      
        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
      
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.name))
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
      
        const pie = d3.pie()
            .value(d => d.value);
      
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(width, height) / 2 - 1);
      
        const arcs = pie(data);
      
        // Render pie chart
        svg.append("g")
            .attr("stroke", "white")
          .selectAll("path")
          .data(arcs)
          .join("path")
            .attr("fill", d => color(d.data.name))
            .attr("d", arc)
          .on("mouseover", function(event, d) {
              tooltip.style("opacity", 1)
                  .html(`Department: ${d.data.name}<br>Annual Rate: ${d.data.value.toLocaleString()}`)
                  .style("left", `${event.pageX + 10}px`)
                  .style("top", `${event.pageY + 10}px`);
          })
          .on("mousemove", function(event) {
              tooltip.style("left", `${event.pageX + 10}px`)
                     .style("top", `${event.pageY + 10}px`);
          })
          .on("mouseout", function() {
              tooltip.style("opacity", 0);
          });
    }
    

});
