// Assume d3 and your CSV file are already loaded in the environment

// Load CSV data and transform it
// d3.csv("combined_with_departments.csv").then(function(data) {
//     const processedData = data.map(d => ({
//         position: d.POSITION_TITLE,
//         department: d.DEPARTMENT,
//         base_pay: +d.PAY_TOTAL_ACTUAL - +d.PAY_OTHER_ACTUAL,
//         additional_pay: +d.PAY_OTHER_ACTUAL
//     }));

//     // Group by position or department and sum the pay components
//     const groupByPosition = d3.groups(processedData, d => d.position)
//         .map(([key, values]) => ({
//             key,
//             base_pay: d3.sum(values, d => d.base_pay),
//             additional_pay: d3.sum(values, d => d.additional_pay)
//         }));

//     const groupByDepartment = d3.groups(processedData, d => d.department)
//         .map(([key, values]) => ({
//             key,
//             base_pay: d3.sum(values, d => d.base_pay),
//             additional_pay: d3.sum(values, d => d.additional_pay)
//         }));

//     // Log or pass this data to a chart function
//     console.log(groupByPosition);
//     console.log(groupByDepartment);
//     createChart(groupByPosition);  // Assuming createChart is your D3 chart setup function
// });
// Load the CSV file and process data


// d3.csv("combined_with_departments.csv").then(function(data) {
//     const processedData = data.map(d => ({
//         category: d.POSITION_TITLE, // or d.DEPARTMENT for department-wise visualization
//         basePay: +d.PAY_TOTAL_ACTUAL - +d.PAY_OTHER_ACTUAL,
//         additionalPay: +d.PAY_OTHER_ACTUAL,
//         totalPay: +d.PAY_TOTAL_ACTUAL
//     }));

//     console.log(processedData); // Debugging line to check data
//     createChart(processedData);
// });

// function createChart(data) {
//     const svg = d3.select("svg"),
//         margin = { top: 40, right: 30, bottom: 70, left: 100 },
//         width = svg.attr("width") - margin.left - margin.right,
//         height = svg.attr("height") - margin.top - margin.bottom,
//         g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3.scaleBand()
//         .rangeRound([0, width])
//         .padding(0.1)
//         .domain(data.map(d => d.category));

//     const y = d3.scaleLinear()
//         .rangeRound([height, 0])
//         .domain([0, d3.max(data, d => d.totalPay)]);

//     g.append("g")
//         .attr("class", "axis axis--x")
//         .attr("transform", `translate(0,${height})`)
//         .call(d3.axisBottom(x))
//         .selectAll("text")
//         .style("text-anchor", "end")
//         .attr("dx", "-.8em")
//         .attr("dy", ".15em")
//         .attr("transform", "rotate(-65)");

//     g.append("g")
//         .attr("class", "axis axis--y")
//         .call(d3.axisLeft(y).ticks(10, "s"));

//     g.selectAll(".bar")
//         .data(data)
//         .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => x(d.category))
//         .attr("width", x.bandwidth())
//         .attr("y", d => y(d.totalPay))
//         .attr("height", d => height - y(d.totalPay))
//         .attr("fill", "steelblue");

//     document.getElementById("sortOrder").addEventListener("change", function() {
//         const value = this.value;
//         data.sort((a, b) => b[value] - a[value]);
//         x.domain(data.map(d => d.category));
//         g.selectAll(".bar")
//             .transition()
//             .duration(750)
//             .attr("x", d => x(d.category));
//     });
// }


//-------------------------


    // Fetch CSV data asynchronously
    // d3.csv("./combined_with_departments.csv").then(function(data) {

    //     // Calculate base pay and create array of objects for visualization
    //     const visualizationData = data.map(entry => {
    //       const basePay = entry.PAY_TOTAL_ACTUAL - entry.PAY_OTHER_ACTUAL;
    //       return {
    //         POSITION_TITLE: entry.POSITION_TITLE,
    //         DEPARTMENT: entry.DEPARTMENT,
    //         TOTAL_COMPENSATION: +entry.PAY_TOTAL_ACTUAL, // Convert to number
    //         BASE_PAY: basePay,
    //         ADDITIONAL_PAY: +entry.PAY_OTHER_ACTUAL // Convert to number
    //       };
    //     });
  
    //     // Define chart object
    //     const chart = {
    //       width: 1940,
    //       height: 1000,
    //       marginTop: 10,
    //       marginRight: 0,
    //       marginBottom: 30,
    //       marginLeft: 40,
  
    //       createChart: function() {
    //         const x = d3.scaleBand()
    //           .domain(visualizationData.map(d => d.POSITION_TITLE))
    //           .range([this.marginLeft, this.width - this.marginRight])
    //           .padding(0.1);
  
    //         const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  
    //         const y = d3.scaleLinear()
    //           .domain([0, d3.max(visualizationData, d => d.TOTAL_COMPENSATION)]).nice()
    //           .range([this.height - this.marginBottom, this.marginTop]);
  
    //         const svg = d3.create("svg")
    //             .attr("viewBox", [0, 0, this.width, this.height])
    //             .attr("style", `max-width: ${this.width}px; height: auto; font: 10px sans-serif; overflow: visible;`);
  
    //         const bar = svg.append("g")
    //             .attr("fill", "steelblue")
    //           .selectAll("rect")
    //           .data(visualizationData)
    //           .join("rect")
    //             .style("mix-blend-mode", "multiply")
    //             .attr("x", d => x(d.POSITION_TITLE))
    //             .attr("y", d => y(d.TOTAL_COMPENSATION))
    //             .attr("height", d => y(0) - y(d.TOTAL_COMPENSATION))
    //             .attr("width", x.bandwidth());
            
            
  
    //         const gx = svg.append("g")
    //             .attr("transform", `translate(0,${this.height - this.marginBottom})`)
    //             .call(xAxis);
            
    //         const gy = svg.append("g")
    //             .attr("transform", `translate(${this.marginLeft},0)`)
    //             .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
    //             .call(g => g.select(".domain").remove());
  
    //         return Object.assign(svg.node(), {
    //           update: function(order) {
    //             x.domain(visualizationData.sort(order).map(d => d.POSITION_TITLE));
  
    //             const t = svg.transition()
    //                 .duration(750);
  
    //             bar.data(visualizationData, d => d.POSITION_TITLE)
    //                 .order()
    //               .transition(t)
    //                 .delay((d, i) => i * 20)
    //                 .attr("x", d => x(d.POSITION_TITLE));
  
    //             gx.transition(t)
    //                 .call(xAxis)
    //               .selectAll(".tick")
    //                 .delay((d, i) => i * 20);
    //           }
    //         });
    //       }
    //     };
  
    //     // Append the chart to the DOM
    //     const chartElement = chart.createChart();
    //     document.getElementById('chart').appendChild(chartElement);
  
    //     // Event listener for dropdown change
    //     document.getElementById('sortOrder').addEventListener('change', function() {
    //       const sortOrder = this.value === 'total' ? (a, b) => d3.ascending(a.TOTAL_COMPENSATION, b.TOTAL_COMPENSATION) : this.value === 'base' ? (a, b) => d3.descending(a.BASE_PAY, b.BASE_PAY) :  (a, b) => d3.descending(a.TOTAL_COMPENSATION, b.TOTAL_COMPENSATION);
    //       chartElement.update(sortOrder);
    //     });
    //   });
    

    // Main function to initialize the data loading and processing
function loadData() {
    d3.csv("data_scripts/combined_with_departments.csv").then(processData);
}
// Function to process data from CSV
function processData(data) {
    const visualizationData = data.map(entry => ({
        positionTitle: entry.POSITION_TITLE,
        department: entry.DEPARTMENT,
        totalCompensation: +entry.PAY_TOTAL_ACTUAL,
        basePay: +entry.PAY_TOTAL_ACTUAL - +entry.PAY_OTHER_ACTUAL,
        additionalPay: +entry.PAY_OTHER_ACTUAL
    }));

    console.log(visualizationData); // Debugging line to check data
    createVisualization(visualizationData);
}

// Function to create the bar chart visualization
function createVisualization(data) {
    const margin = { top: 10, right: 70, bottom: 150, left: 40 }, // Adjusted right margin
        svgWidth = 960, // Adjusted SVG width to a standard value
        svgHeight = 500, // Adjusted SVG height to a standard value
        width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom;

    // Create the SVG canvas
    const svg = d3.select("#chart3").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.positionTitle))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.totalCompensation)]).nice()
        .range([height, 0]);

    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-1em")
        .attr("dy", "-.5em")
        .attr("transform", "rotate(-50)"); // Rotate the labels 90 degrees

    g.append("g")
        .call(d3.axisLeft(yScale));

    const bars = g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("fill", "steelblue")
        .attr("x", d => xScale(d.positionTitle))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.totalCompensation))
        .attr("height", d => height - yScale(d.totalCompensation))
        .attr("fill", () => `hsl(${Math.random() * 360}, 50%, 50%)`); // Using HSL for color


    setupSortOptions(bars, xScale, yScale);
}

// Function to setup sort options and update the chart accordingly
function setupSortOptions(bars, xScale, yScale) {
    document.getElementById('sortOrder').addEventListener('change', function() {
        const sortOrder = this.value === 'total' 
            ? (a, b) => d3.ascending(a.totalCompensation, b.totalCompensation)
            : this.value === 'base'
            ? (a, b) => d3.descending(a.basePay, b.basePay)
            : (a, b) => d3.descending(a.totalCompensation, b.totalCompensation);

        const sortedData = bars.data().sort(sortOrder);
        xScale.domain(sortedData.map(d => d.positionTitle));

        bars.data(sortedData)
            .transition()
            .duration(750)
            .attr("x", d => xScale(d.positionTitle))
            .attr("y", d => yScale(d.totalCompensation))
            .attr("height", d => yScale(0) - yScale(d.totalCompensation));
    });
  
}

// Call the main function to load data
loadData();
