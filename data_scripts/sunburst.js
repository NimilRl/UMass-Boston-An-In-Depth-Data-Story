// Assuming D3.js has already been included in your HTML file
// d3.csv("combined_with_departments.csv").then(function(data) {

//     // Processing data to create a hierarchical structure
//     const sum = d3.rollup(data, 
//         v => d3.sum(v, leaf => leaf.PAY_TOTAL_ACTUAL), // sum total pay for leaves
//         d => d.DEPARTMENT, // first level of hierarchy
//         d => d.POSITION_TITLE // second level of hierarchy
//     );

//     const hierarchy = { 
//         name: "flare", 
//         children: Array.from(sum, ([key, value]) => ({
//             name: key,
//             children: Array.from(value, ([key, value]) => ({
//                 name: key,
//                 value: value
//             }))
//         }))
//     };

//     sum.sort((a, b) => b.value - a.value);
//     const topDepartments = sum.slice(0, 9);
//     const otherDepartments = sum.slice(9);
//     const othersAggregate = {
//         name: "Other",
//         value: d3.sum(otherDepartments, d => d.value),
//         details: otherDepartments
//     };

//     const Data = topDepartments.concat([othersAggregate]);

//     console.log(Data);

//     // console.log("Formatted hierarchy:", hierarchy);

//     createChart(hierarchy); // Function to create the sunburst chart


// });

d3.csv("data_scripts/combined_with_departments.csv").then(function(data) {
    // Processing data to create a hierarchical structure
    const sum = d3.rollup(data, 
        v => d3.sum(v, leaf => +leaf.PAY_TOTAL_ACTUAL), // sum total pay for leaves, ensure to convert string to number
        d => d.DEPARTMENT, // first level of hierarchy
        d => d.POSITION_TITLE // second level of hierarchy
    );

    // Convert the Map into an array and sort it
    let departmentData = Array.from(sum, ([name, children]) => ({ name, children }))
        .map(department => {
            let value = 0;
            let children = Array.from(department.children, ([name, value]) => {
                value += value; // Aggregate the value
                return { name, value };
            });
            return { name: department.name, children, value };
        });

    // Sort departments by total value
    departmentData.sort((a, b) => b.value - a.value);

    // Take top 9 departments
    const topDepartments = departmentData.slice(0, 20);

    // Aggregate other departments into "Other"
    const otherDepartments = departmentData.slice(20);
    const othersAggregate = {
        name: "Other",
        children: otherDepartments,
        value: d3.sum(otherDepartments, d => d.value)
    };

    // Combine top departments and "Other" into a new hierarchy
    const hierarchy = {
        name: "flare",
        children: [...topDepartments, othersAggregate]
    };

    createChart(hierarchy); // Function to create the sunburst chart
});



function createChart(data) {
     // Specify the chart’s dimensions.
  // const width = 1200;
  // const height = width;
  // const radius = width / 6;

  const width = 3000; // Increase the width
  const height = 3000; // Increase the height
  const radius = Math.min(width, height) / 6; // Adjust the radius based on the dimensions


  // Create the color scale.
  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  // Compute the layout.
  const hierarchy = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
  const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])
    (hierarchy);
  root.each(d => d.current = d);

  // Create the arc generator.
  const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "30px sans-serif");

  // Append the arcs.
  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

      .attr("d", d => arc(d.current));

  // Make them clickable if they have children.
  path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

  const format = d3.format(",d");
  path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

  const parent = svg.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

  // Handle zoom on click.
  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

        .attrTween("d", d => () => arc(d.current));

    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
  }
  
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  document.getElementById("sunbrust").appendChild(svg.node());
}