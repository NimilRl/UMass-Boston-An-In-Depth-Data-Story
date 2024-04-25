// Load the CSV file
d3.csv("data_scripts/combined_with_departments.csv").then(function(rawdata) {
    // Convert data as needed, here assuming the data columns are correctly formatted
    // data.forEach(d => {
    //     d.DEPARTMENT = d.DEPARTMENT;
    //     d.RATING = +d.RATING;             // Convert to numerical value
    //     d.PAY_TOTAL_ACTUAL = +d.PAY_TOTAL_ACTUAL;
    //     d.NUM_RATINGS = +d.NUM_RATINGS;
    // });

    // console.log("Data: ", data); // Debugging line to check data

    const data = rawdata.map(d => ({
        DEPARTMENT: d.DEPARTMENT,  // Ensure this matches the exact column name in your CSV
        RATING: +d.RATING,         // Convert from string to number
        PAY_TOTAL_ACTUAL: +d.PAY_TOTAL_ACTUAL, // Convert from string to number
        NUM_RATINGS: +d.NUM_RATINGS // Convert from string to number
    }));

    // Log the transformed data to see the structure
    // console.log(data);

    createSPLOM(data); // Function to create the chart
});

// Function to create SPLOM
function createSPLOM(data) {
    // Specify the chart’s dimensions.
  const width =600;
  const height = width;
  const padding = 28;
  const columns = ['RATING', 'PAY_TOTAL_ACTUAL', 'NUM_RATINGS']; // Manually specify the columns to use
  const uniqueDepartments = [...new Set(data.map(d => d.DEPARTMENT))];

//   const columns = data.columns.filter(d => typeof data[0][d] === "number");
  const size = (width - (columns.length + 1) * padding) / columns.length + padding;

  // Define the horizontal scales (one for each row).
  const x = columns.map(c => d3.scaleLinear()
      .domain(d3.extent(data, d => d[c]))
      .rangeRound([padding / 2, size - padding / 2]))

  // Define the companion vertical scales (one for each column).
  const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));

  // Define the color scale.
//   const color = d3.scaleOrdinal()
//       .domain(data.map(d => d.species))
//       .range(d3.schemeCategory10);

const color = d3.scaleOrdinal()
    .domain(uniqueDepartments)
    .range(uniqueDepartments.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`)); // Generate a random color


  // Define the horizontal axis (it will be applied separately for each column).
  const axisx = d3.axisBottom()
      .ticks(6)
      .tickSize(size * columns.length);
  const xAxis = g => g.selectAll("g").data(x).join("g")
      .attr("transform", (d, i) => `translate(${i * size},0)`)
      .each(function(d) { return d3.select(this).call(axisx.scale(d)); })
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));

  // Define the vertical axis (it will be applied separately for each row).
  const axisy = d3.axisLeft()
      .ticks(6)
      .tickSize(-size * columns.length);
  const yAxis = g => g.selectAll("g").data(y).join("g")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .each(function(d) { return d3.select(this).call(axisy.scale(d)); })
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
  
  const svg2 = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-padding, 0, width, height]);

  svg2.append("style")
      .text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);

  svg2.append("g")
      .call(xAxis);

  svg2.append("g")
      .call(yAxis);

  const cell = svg2.append("g")
    .selectAll("g")
    .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
    .join("g")
      .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

  cell.append("rect")
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("x", padding / 2 + 0.5)
      .attr("y", padding / 2 + 0.5)
      .attr("width", size - padding)
      .attr("height", size - padding);

//   cell.each(function([i, j]) {
//     d3.select(this).selectAll("circle")
//       .data(data.filter(d => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
//       .join("circle")
//         .attr("cx", d => x[i](d[columns[i]]))
//         .attr("cy", d => y[j](d[columns[j]]));
//   });

cell.each(function([i, j]) {
    d3.select(this).selectAll("circle")
      .data(data.filter(d => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
      .join("circle")
        .attr("cx", d => x[i](d[columns[i]]))
        .attr("cy", d => y[j](d[columns[j]]))
        .attr("fill", d => color(d.DEPARTMENT)); // Use the department to set the color
  });
  
  const circle = cell.selectAll("circle")
      .attr("r", 3.5)
      .attr("fill-opacity", 0.7)
      .attr("fill", d => color(d.species));

  // Ignore this line if you don't need the brushing behavior.
  cell.call(brush, circle, svg2, {padding, size, x, y, columns, data }); 

  svg2.append("g")
      .style("font", "bold 10px sans-serif")
      .style("pointer-events", "none")
    .selectAll("text")
    .data(columns)
    .join("text")
      .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(d => d);

  svg2.property("value", [])
//   return Object.assign(svg2.node(), {scales: {color}});
  document.getElementById("splom").appendChild(svg2.node(), {scales: {color}});

}

function brush(cell, circle, svg2, {padding, size, x, y, columns, data }) {
    const brush = d3.brush()
        .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
        .on("start", brushstarted)
        .on("brush", brushed)
        .on("end", brushended);
  
    cell.call(brush);
  
    let brushCell;
  
    // Clear the previously-active brush, if any.
    function brushstarted() {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.move, null);
        brushCell = this;
      }
    }
  
    // Highlight the selected circles.
    function brushed({selection}, [i, j]) {
      let selected = [];
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection; 
        circle.classed("hidden",
          d => x0 > x[i](d[columns[i]])
            || x1 < x[i](d[columns[i]])
            || y0 > y[j](d[columns[j]])
            || y1 < y[j](d[columns[j]]));
        selected = data.filter(
          d => x0 < x[i](d[columns[i]])
            && x1 > x[i](d[columns[i]])
            && y0 < y[j](d[columns[j]])
            && y1 > y[j](d[columns[j]]));
      }
      svg2.property("value", selected).dispatch("input");
    }
  
    // If the brush is empty, select all circles.
    function brushended({selection}) {
      if (selection) return;
      svg2.property("value", []).dispatch("input");
      circle.classed("hidden", false);
    }
  }